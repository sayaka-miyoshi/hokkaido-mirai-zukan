/**
 * 画像URL（K列）登録記事の一覧・詳細サムネイル監査
 *
 * 前提: npm run dev で localhost:3000 起動
 * 実行: node scripts/audit-thumbnails.mjs
 */
import { chromium } from 'playwright'
import Papa from 'papaparse'
import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const base = process.env.SCREENSHOT_BASE ?? 'http://localhost:3000'
const outDir = resolve(__dirname, '../public/screenshots/thumbnail-audit')
const reportDir = resolve(__dirname, '../docs')

function loadCsvUrl() {
  const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
  const match = env.match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)
  if (!match?.[1]?.trim()) throw new Error('NEXT_PUBLIC_SHEET_CSV_URL 未設定')
  return match[1].trim()
}

function extractDriveId(url) {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?[^#]*[?&]id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m?.[1]) return m[1]
  }
  try {
    const u = new URL(url)
    if (u.hostname.includes('drive.google.com')) return u.searchParams.get('id')
  } catch {}
  return null
}

function getCandidates(raw) {
  const trimmed = raw.trim()
  const out = []
  const id = extractDriveId(trimmed)
  if (id) {
    out.push(`https://drive.google.com/uc?export=view&id=${id}`)
    out.push(`https://drive.google.com/thumbnail?id=${id}&sz=w1000`)
  } else if (/^https?:\/\//i.test(trimmed)) {
    out.push(trimmed)
  }
  return out
}

async function checkUrlHttp(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Range: 'bytes=0-1024',
        'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0',
      },
    })
    const ct = res.headers.get('content-type') ?? ''
    return {
      ok: res.ok || res.status === 206,
      status: res.status,
      contentType: ct,
      isImage: ct.startsWith('image/') || ct.includes('octet-stream'),
      isHtml: ct.includes('text/html'),
    }
  } catch (e) {
    return { ok: false, status: e.message, contentType: '', isImage: false, isHtml: false }
  }
}

function parsePublishStatus(value) {
  const v = String(value ?? '').trim()
  if (!v || v === '公開') return true
  if (v === '非公開') return false
  return true
}

async function fetchCsvText() {
  const res = await fetch(loadCsvUrl(), { headers: { Accept: 'text/csv' } })
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`)
  return res.text()
}

function parsePostsFromCsv(text) {
  const parsed = Papa.parse(text, { skipEmptyLines: true })
  const headers = parsed.data[0].map((h) => String(h ?? '').trim().replace(/^\uFEFF/, ''))
  const map = Object.fromEntries(headers.map((h, i) => [h, i]))
  const get = (row, col) => String(row[map[col]] ?? '').trim()

  return parsed.data
    .slice(1)
    .filter((row) => row.some((c) => String(c ?? '').trim()) && get(row, '投稿タイトル'))
    .map((row, i) => ({
      id: String(i + 1),
      title: get(row, '投稿タイトル'),
      imageUrl: get(row, '画像URL'),
      instagramUrl: get(row, 'InstagramURL'),
      isPublished: parsePublishStatus(get(row, '公開')),
      postUrl: `${base}/post/${i + 1}`,
    }))
    .filter((p) => p.imageUrl && p.isPublished)
}

function cropPercentCover(containerW, containerH, naturalW, naturalH) {
  if (!containerW || !containerH || !naturalW || !naturalH) {
    return { vertical: 0, horizontal: 0 }
  }
  const scale = Math.max(containerW / naturalW, containerH / naturalH)
  const scaledW = naturalW * scale
  const scaledH = naturalH * scale
  return {
    vertical: Math.max(0, ((scaledH - containerH) / scaledH) * 100),
    horizontal: Math.max(0, ((scaledW - containerW) / scaledW) * 100),
  }
}

async function saveProblemScreenshots(page, post, postOut) {
  mkdirSync(postOut, { recursive: true })
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(1500)
  const card = page.locator(`a[href="/post/${post.id}"]`).first()
  if ((await card.count()) > 0) {
    await card.scrollIntoViewIfNeeded()
    await page.waitForTimeout(600)
    await card.screenshot({ path: resolve(postOut, 'list-card.png') })
  }
  await page.goto(post.postUrl, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(1500)
  const hero = page.locator('article div.aspect-video').first()
  if ((await hero.count()) > 0) {
    await hero.screenshot({ path: resolve(postOut, 'detail-hero.png') })
  }
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(500)
}

function readImageMetrics(img, container) {
  if (!img) return null
  const rect = img.getBoundingClientRect()
  const cRect = container?.getBoundingClientRect?.() ?? rect
  return {
    src: img.currentSrc || img.src || '',
    complete: img.complete,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    displayWidth: rect.width,
    displayHeight: rect.height,
    containerWidth: cRect.width,
    containerHeight: cRect.height,
    objectFit: getComputedStyle(img).objectFit,
    isDefault: (img.currentSrc || img.src || '').includes('default-post'),
  }
}

function analyzeMetrics(metrics, view) {
  const issues = []
  const recs = []

  if (!metrics) {
    issues.push(`${view}: 画像要素なし`)
    recs.push('PostImage コンポーネントの描画を確認')
    return { issues, recs }
  }

  if (metrics.isDefault || metrics.src.includes('default-post')) {
    issues.push(`${view}: サムネイルなし（No Image 表示）`)
    recs.push('K列URLの形式・Googleドライブ共有設定（リンクを知っている全員）を確認')
  }

  if (!metrics.complete || metrics.naturalWidth === 0) {
    issues.push(`${view}: 画像読み込み失敗`)
    recs.push('URLがファイル直リンクか確認。Driveは /file/d/ID 形式を推奨')
  }

  if (metrics.objectFit === 'fill') {
    issues.push(`${view}: 画像が引き伸ばされる設定（object-fit: fill）`)
    recs.push('object-cover のまま運用（コード側は通常 cover）')
  }

  const naturalAspect = metrics.naturalWidth / metrics.naturalHeight
  const displayAspect = metrics.displayWidth / metrics.displayHeight
  if (
    metrics.naturalWidth > 0 &&
    metrics.displayWidth > 0 &&
    Math.abs(naturalAspect - displayAspect) > 0.15 &&
    metrics.objectFit !== 'cover' &&
    metrics.objectFit !== 'contain'
  ) {
    issues.push(`${view}: 画像が歪んで表示されている可能性`)
    recs.push('4:5（1080×1350）の原寸比画像を使用')
  }

  if (view === '一覧' && metrics.naturalWidth > metrics.naturalHeight * 1.05) {
    issues.push(`${view}: 横向き画像（一覧枠4:5と不一致）`)
    recs.push('縦型4:5（1080×1350）に差し替え。被写体を中央配置')
  }

  const crop = cropPercentCover(
    metrics.containerWidth,
    metrics.containerHeight,
    metrics.naturalWidth,
    metrics.naturalHeight,
  )

  if (view === '一覧' && crop.vertical > 28 && naturalAspect < 0.7) {
    issues.push(
      `${view}: 縦長画像の上下トリミングが大きい（約${crop.vertical.toFixed(0)}%）`,
    )
    recs.push('4:5（1080×1350）に統一すると一覧では切れにくい')
  }

  if (view === '詳細' && crop.vertical > 50) {
    issues.push(
      `${view}: 上下トリミングが大きく文字・被写体が切れる可能性（約${crop.vertical.toFixed(0)}%）`,
    )
    recs.push('詳細は16:9枠のため上下が切れる。重要テキストは中央〜やや上に配置')
  }

  if (view === '詳細' && crop.horizontal > 25 && naturalAspect > 0.85) {
    issues.push(
      `${view}: 左右トリミングが大きい（約${crop.horizontal.toFixed(0)}%）`,
    )
    recs.push('16:9に近い横型画像を使うか、被写体を中央寄せ')
  }

  return { issues, recs, crop, naturalAspect }
}

function analyzeUrl(rawUrl) {
  const issues = []
  const recs = []

  if (/drive\.google\.com\/drive\/folders\//i.test(rawUrl)) {
    issues.push('Google DriveフォルダURL（ファイルURLではない）')
    recs.push('フォルダではなく画像ファイルの共有URLをK列に設定')
  }

  if (/drive\.google\.com\/file\/d\//i.test(rawUrl) === false && /drive\.google/i.test(rawUrl)) {
    if (!extractDriveId(rawUrl)) {
      issues.push('Google Drive URL形式が不正')
      recs.push('https://drive.google.com/file/d/ファイルID/view 形式に統一')
    }
  }

  return { issues, recs }
}

async function waitForImage(page, selector, timeoutMs = 12000) {
  try {
    await page.locator(selector).first().waitFor({ state: 'visible', timeout: timeoutMs })
    await page.waitForFunction(
      (sel) => {
        const img = document.querySelector(sel)
        return img && img.complete && img.naturalWidth > 0
      },
      selector,
      { timeout: timeoutMs },
    )
  } catch {
    // fall through — metrics will show failure
  }
  await page.waitForTimeout(400)
}

async function getListMetrics(page, postId) {
  const selector = `a[href="/post/${postId}"] div.aspect-\\[4\\/5\\]`
  const hasCard = (await page.locator(`a[href="/post/${postId}"]`).count()) > 0
  if (!hasCard) return { metrics: null, cardMissing: true }

  await page.locator(`a[href="/post/${postId}"]`).first().scrollIntoViewIfNeeded()
  await waitForImage(page, `a[href="/post/${postId}"] img`)

  return page.locator(`a[href="/post/${postId}"]`).first().evaluate((card) => {
    const container = card.querySelector('div.aspect-\\[4\\/5\\]') || card.querySelector('div[class*="aspect"]')
    const img = container?.querySelector('img')
    if (!img) return { metrics: null, cardMissing: false }
    const rect = img.getBoundingClientRect()
    const cRect = container.getBoundingClientRect()
    return {
      cardMissing: false,
      metrics: {
        src: img.currentSrc || img.src || '',
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: rect.width,
        displayHeight: rect.height,
        containerWidth: cRect.width,
        containerHeight: cRect.height,
        objectFit: getComputedStyle(img).objectFit,
        isDefault: (img.currentSrc || img.src || '').includes('default-post'),
      },
    }
  })
}

async function getDetailMetrics(page) {
  await waitForImage(page, 'article div.aspect-video img')
  return page.locator('article div.aspect-video').first().evaluate((container) => {
    const img = container.querySelector('img')
    if (!img) return null
    const rect = img.getBoundingClientRect()
    const cRect = container.getBoundingClientRect()
    return {
      src: img.currentSrc || img.src || '',
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth: rect.width,
      displayHeight: rect.height,
      containerWidth: cRect.width,
      containerHeight: cRect.height,
      objectFit: getComputedStyle(img).objectFit,
      isDefault: (img.currentSrc || img.src || '').includes('default-post'),
    }
  })
}

function dedupeIssues(issues) {
  return [...new Set(issues.filter(Boolean))]
}

function dedupeRecs(recs) {
  return [...new Set(recs.filter(Boolean))]
}

// --- main ---
mkdirSync(outDir, { recursive: true })

const csvText = await fetchCsvText()
const targets = parsePostsFromCsv(csvText)
console.log(`画像URLあり（公開）: ${targets.length} 件`)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })

await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
await page.waitForTimeout(4000)

const results = []
let processed = 0

for (const post of targets) {
  processed++
  if (processed % 10 === 0) console.log(`進捗: ${processed}/${targets.length}`)

  const allIssues = []
  const allRecs = []

  const urlCheck = analyzeUrl(post.imageUrl)
  allIssues.push(...urlCheck.issues)
  allRecs.push(...urlCheck.recs)

  if (urlCheck.issues.some((i) => i.includes('フォルダ'))) {
    const candidates = getCandidates(post.imageUrl)
    let httpOk = false
    for (const c of candidates) {
      const r = await checkUrlHttp(c)
      if (r.ok && r.isImage) {
        httpOk = true
        break
      }
      if (r.isHtml) {
        allIssues.push('Google Drive画像の取得エラー（HTMLが返却）')
        allRecs.push('共有設定を「リンクを知っている全員が閲覧可」に変更')
      }
    }
    if (!httpOk && candidates.length > 0) {
      allIssues.push('Google Drive画像のHTTP取得失敗')
      allRecs.push('ファイルIDと共有設定を確認')
    }

    results.push({
      ...post,
      ok: false,
      issues: dedupeIssues(allIssues),
      recs: dedupeRecs(allRecs),
    })
    await saveProblemScreenshots(page, post, resolve(outDir, post.id.padStart(3, '0')))
    continue
  }

  const candidates = getCandidates(post.imageUrl)
  let httpOk = false
  for (const c of candidates) {
    const r = await checkUrlHttp(c)
    if (r.ok && r.isImage) {
      httpOk = true
      break
    }
    if (r.isHtml) {
      allIssues.push('Google Drive画像の取得エラー（HTMLが返却）')
      allRecs.push('共有設定を「リンクを知っている全員が閲覧可」に変更')
    }
  }
  if (!httpOk && /drive\.google/i.test(post.imageUrl)) {
    allIssues.push('Google Drive画像のHTTP取得失敗')
    allRecs.push('https://drive.google.com/file/d/ID/view 形式・共有設定を確認')
  }

  const listResult = await getListMetrics(page, post.id)
  if (listResult.cardMissing) {
    allIssues.push('一覧: カードがDOM上に見つからない（スクロール外または非表示）')
    allRecs.push('ホーム一覧に表示されるか「公開」列を確認')
  } else {
    const list = analyzeMetrics(listResult.metrics, '一覧')
    allIssues.push(...list.issues)
    allRecs.push(...list.recs)
  }

  await page.goto(post.postUrl, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(1500)
  const detailMetrics = await getDetailMetrics(page)
  const detail = analyzeMetrics(detailMetrics, '詳細')
  allIssues.push(...detail.issues)
  allRecs.push(...detail.recs)

  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(800)

  const uniqueIssues = dedupeIssues(allIssues)
  const uniqueRecs = dedupeRecs(allRecs)
  const ok = uniqueIssues.length === 0

  const entry = {
    ...post,
    ok,
    issues: uniqueIssues,
    recs: uniqueRecs,
    listMetrics: listResult.metrics,
    detailMetrics,
  }

  if (!ok) {
    await saveProblemScreenshots(page, post, resolve(outDir, post.id.padStart(3, '0')))
  }

  results.push(entry)
}

await browser.close()

const problems = results.filter((r) => !r.ok)
const normal = results.filter((r) => r.ok)

const reportLines = [
  '# サムネイル表示監査レポート',
  '',
  `実行日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
  `対象: K列（画像URL）あり・公開記事`,
  '',
  '## サマリー',
  '',
  `| 項目 | 件数 |`,
  `|------|------|`,
  `| 監査対象 | ${results.length} |`,
  `| 正常 | ${normal.length} |`,
  `| 問題あり | ${problems.length} |`,
  '',
]

if (problems.length > 0) {
  reportLines.push('## 問題記事一覧', '')
  problems.forEach((p, i) => {
    reportLines.push(`### ${i + 1}. ${p.title}`)
    reportLines.push('')
    reportLines.push(`- **記事URL**: ${p.postUrl}`)
    reportLines.push(`- **画像URL**: ${p.imageUrl}`)
    reportLines.push('- **問題内容**:')
    p.issues.forEach((issue) => reportLines.push(`  - ${issue}`))
    reportLines.push('- **修正推奨**:')
    p.recs.forEach((rec) => reportLines.push(`  - ${rec}`))
    reportLines.push(
      `- **スクリーンショット**: public/screenshots/thumbnail-audit/${p.id.padStart(3, '0')}/`,
    )
    reportLines.push('')
  })
} else {
  reportLines.push('問題は検出されませんでした。', '')
}

writeFileSync(resolve(outDir, 'report.json'), JSON.stringify({ summary: { total: results.length, normal: normal.length, problems: problems.length }, problems, normal: normal.map((n) => ({ id: n.id, title: n.title })) }, null, 2), 'utf8')
writeFileSync(resolve(reportDir, 'サムネイル監査レポート.md'), reportLines.join('\n'), 'utf8')

console.log('\n=== 監査完了 ===')
console.log('正常:', normal.length)
console.log('問題:', problems.length)
console.log('レポート:', resolve(reportDir, 'サムネイル監査レポート.md'))
console.log('JSON:', resolve(outDir, 'report.json'))
if (problems.length) {
  console.log('\n問題記事（先頭10件）:')
  problems.slice(0, 10).forEach((p) => {
    console.log(`- [${p.id}] ${p.title}`)
    p.issues.forEach((i) => console.log(`    ${i}`))
  })
}
