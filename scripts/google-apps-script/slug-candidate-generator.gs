/**
 * slug候補 自動生成（Apps Script + Gemini）
 *
 * ルール: 識別子（最大5単語）・タイトル要約型・英作文禁止・固有文化はローマ字優先
 * 基本運用: generateNext20SlugCandidates（20件ずつ）
 */

const SLUG_CONFIG = {
  sheetIndex: 0,
  headerTitle: '投稿タイトル',
  headerGenre: 'ジャンル',
  headerSchool: '学校名',
  headerClub: '部活名',
  headerCompany: '企業名',
  headerSlug: 'slug',
  headerSlugCandidate: 'slug候補',
  geminiModel: 'gemini-2.0-flash',
  batchSize: 12,
  batchSleepMs: 400,
  nextBatchSize: 20,
  translateSleepMs: 1000,
  maxSlugWords: 5,
}

/** 識別子 slug の参考例（タイトル → slug） */
const SLUG_EXAMPLES = [
  { title: 'すすきの祭り 神輿を担ぐ', slug: 'susukino-mikoshi' },
  { title: 'すすきの祭り最終日レポ', slug: 'susukino-festival-final-day' },
  { title: '札幌医科大学医学部整形外科学講座', slug: 'sapporo-med-ortho' },
  { title: '1台3000万円のデコトラ', slug: 'dekotora-30m-yen' },
  { title: '北海道大学 バドミントン部', slug: 'hokkaido-uni-badminton' },
  { title: 'ダイチゴム', slug: 'daichi-rubber' },
  { title: '消防士インタビュー', slug: 'firefighter-interview' },
]

/**
 * タイトル内の語句 → 識別子トークン（長いパターンを先に）
 * replacement: 空文字 = 削除, ハイフン区切り = 複数トークン
 */
const JA_IDENTIFIER_RULES = [
  [/札幌医科大学医学部整形外科学講座/g, 'sapporo-med-ortho'],
  [/北海道立北の森づくり専門学院/g, 'hokkaido-forest-college'],
  [/札幌医科大学/g, 'sapporo-med'],
  [/整形外科学講座|整形外科/g, 'ortho'],
  [/医学部/g, ''],
  [/北海学園大学/g, 'hokkai-gakuen'],
  [/北海道大学/g, 'hokkaido-uni'],
  [/すすきの祭り/g, 'susukino-festival'],
  [/すすきの/g, 'susukino'],
  [/さっぽろ雪まつり|札幌雪まつり/g, 'sapporo-yuki-matsuri'],
  [/雪まつり|雪祭り/g, 'yuki-matsuri'],
  [/神輿/g, 'mikoshi'],
  [/デコトラ/g, 'dekotora'],
  [/YOSAKOI\s*相羅/gi, 'yosakoi-sagara'],
  [/YOSAKOI/gi, 'yosakoi'],
  [/(\d+)万円?/g, function (_, n) {
    const num = Number(n)
    if (!Number.isFinite(num) || num <= 0) return ''
    if (num >= 100) return Math.round(num / 100) + 'm-yen'
    return num + 'man-yen'
  }],
  [/(\d+)台/g, ''],
  [/最終日/g, 'final-day'],
  [/レポ|レポート/g, ''],
  [/インタビュー|対談/g, 'interview'],
  [/を担ぐ|について|の様子|に密着|密着|動画|紹介/g, ''],
  [/バドミントン/g, 'badminton'],
  [/バスケットボール|バスケ/g, 'basketball'],
  [/サッカー/g, 'soccer'],
  [/吹奏楽/g, 'brass-band'],
  [/消防局/g, 'sapporo-fire'],
  [/消防士/g, 'firefighter'],
  [/消防学校/g, 'fire-school'],
  [/ダイチゴム|大地ゴム/g, 'daichi-rubber'],
  [/祭り|祭/g, 'festival'],
  [/株式会社|有限会社/g, ''],
]

/** 英訳 slug から除去する冗長語（英作文防止） */
const SLUG_STOP_WORDS = {
  a: true,
  an: true,
  the: true,
  of: true,
  on: true,
  in: true,
  at: true,
  for: true,
  to: true,
  with: true,
  and: true,
  or: true,
  is: true,
  are: true,
  was: true,
  were: true,
  be: true,
  being: true,
  been: true,
  this: true,
  that: true,
  these: true,
  those: true,
  from: true,
  into: true,
  by: true,
  as: true,
  it: true,
  its: true,
  their: true,
  his: true,
  her: true,
  our: true,
  your: true,
  carrying: true,
  portable: true,
  shrine: true,
  report: true,
  about: true,
  department: true,
  school: true,
  medicine: true,
  university: true,
  college: true,
  division: true,
  section: true,
  lecture: true,
  one: true,
  two: true,
  three: true,
}

/** 英単語の短縮形 */
const SLUG_ABBREV_WORDS = {
  medical: 'med',
  medicine: 'med',
  orthopedic: 'ortho',
  orthopaedic: 'ortho',
  surgery: 'surg',
  university: 'uni',
  international: 'intl',
}

let translateRateLimitEnabled_ = false
let translateCallCount_ = 0

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('slug候補')
    .addItem('一括生成パネルを開く', 'showSlugCandidateSidebar')
    .addItem('次の20件を生成', 'generateNext20SlugCandidatesFromMenu')
    .addItem('全記事を一括生成', 'generateAllSlugCandidatesFromMenu')
    .addToUi()
}

function showSlugCandidateSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('slug-candidate-sidebar')
    .setTitle('slug候補 一括生成')
    .setWidth(360)
  SpreadsheetApp.getUi().showSidebar(html)
}

function generateNext20SlugCandidatesFromMenu() {
  SpreadsheetApp.getUi().alert(generateNext20SlugCandidates())
}

function generateAllSlugCandidatesFromMenu() {
  SpreadsheetApp.getUi().alert(generateAllSlugCandidates())
}

function generateNext20SlugCandidates() {
  return generateSlugCandidatesCore_(SLUG_CONFIG.nextBatchSize)
}

function generateAllSlugCandidates() {
  return generateSlugCandidatesCore_(null)
}

function generateSlugCandidatesCore_(maxCount) {
  translateRateLimitEnabled_ = maxCount !== null
  translateCallCount_ = 0

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[SLUG_CONFIG.sheetIndex]
    const cols = getColumnMap_(sheet)

    const colTitle = cols[SLUG_CONFIG.headerTitle]
    const colGenre = cols[SLUG_CONFIG.headerGenre]
    const colSchool = cols[SLUG_CONFIG.headerSchool]
    const colClub = cols[SLUG_CONFIG.headerClub]
    const colCompany = cols[SLUG_CONFIG.headerCompany]
    const colSlug = cols[SLUG_CONFIG.headerSlug]
    const colCandidate = cols[SLUG_CONFIG.headerSlugCandidate]

    if (!colTitle || !colCandidate) {
      throw new Error(
        '必須列が見つかりません: 投稿タイトル / slug候補（1行目ヘッダーを確認）',
      )
    }

    const lastRow = sheet.getLastRow()
    if (lastRow < 2) {
      return 'データ行がありません。'
    }

    const width = sheet.getLastColumn()
    const values = sheet.getRange(2, 1, lastRow - 1, width).getValues()

    const usedSlugs = new Set()
    const skipRows = []
    const skipWithSlug = []
    const targets = []
    let remainingEligible = 0

    for (let i = 0; i < values.length; i++) {
      const row = i + 2
      const rowValues = values[i]
      const title = cellText_(rowValues, colTitle)
      const existingCandidate = cellText_(rowValues, colCandidate)
      const existingSlug = cellText_(rowValues, colSlug)

      if (existingSlug) {
        const normalized = finalizeSlug_(existingSlug)
        if (normalized) usedSlugs.add(normalized)
        skipWithSlug.push(row)
        continue
      }

      if (existingCandidate) {
        const normalized = finalizeSlug_(existingCandidate)
        if (normalized) usedSlugs.add(normalized)
        skipRows.push(row)
        continue
      }

      if (!title) {
        continue
      }

      if (maxCount !== null && targets.length >= maxCount) {
        remainingEligible++
        continue
      }

      targets.push({
        row,
        title,
        genre: cellText_(rowValues, colGenre),
        schoolName: cellText_(rowValues, colSchool),
        clubName: cellText_(rowValues, colClub),
        companyName: cellText_(rowValues, colCompany),
        index: targets.length,
      })
    }

    if (targets.length === 0) {
      if (remainingEligible > 0) {
        return '今回の生成対象はありません（次の未生成行: ' + remainingEligible + ' 件）。'
      }
      return (
        '生成対象がありません。\n' +
        '（N列 slug 確定: ' +
        skipWithSlug.length +
        ' 行 / Y列既存: ' +
        skipRows.length +
        ' 行）'
      )
    }

    const baseSlugs = generateBaseSlugsWithAi_(targets)
    const updates = []
    let generated = 0

    targets.forEach(function (target, i) {
      const base = finalizeSlug_(baseSlugs[i] || generateSlugFallback_(target))
      if (!base) return

      const unique = assignUniqueSlug_(base, usedSlugs)
      if (!unique) return

      updates.push({ row: target.row, slug: unique })
      generated++
    })

    updates.forEach(function (item) {
      sheet.getRange(item.row, colCandidate).setValue(item.slug)
    })

    const modeLabel =
      maxCount !== null ? '次の' + maxCount + '件' : '全記事一括'

    let message =
      'slug候補 生成完了（' +
      modeLabel +
      '）\n\n' +
      '今回生成: ' +
      generated +
      ' 件\n' +
      'スキップ（Y列既存）: ' +
      skipRows.length +
      ' 件\n' +
      'スキップ（N列 slug 確定済）: ' +
      skipWithSlug.length +
      ' 件'

    if (maxCount !== null) {
      message += '\n未生成（残り）: ' + remainingEligible + ' 件'
      if (remainingEligible > 0) {
        message += '\n\n→ 続きは「次の20件を生成」を再実行してください。'
      }
    }

    message += '\n\n確定後は Y → N列 slug に値のみコピーしてください。'
    return message
  } finally {
    translateRateLimitEnabled_ = false
    translateCallCount_ = 0
  }
}

function cellText_(rowValues, colIndex) {
  if (!colIndex) return ''
  return String(rowValues[colIndex - 1] ?? '').trim()
}

function translateWithRateLimit_(text, fromLang, toLang) {
  if (translateRateLimitEnabled_ && translateCallCount_ > 0) {
    Utilities.sleep(SLUG_CONFIG.translateSleepMs)
  }
  translateCallCount_++
  return LanguageApp.translate(text, fromLang, toLang)
}

function generateBaseSlugsWithAi_(targets) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY')
  const results = new Array(targets.length).fill('')

  if (!apiKey) {
    targets.forEach(function (target, i) {
      results[i] = generateSlugFallback_(target)
    })
    return results
  }

  for (let start = 0; start < targets.length; start += SLUG_CONFIG.batchSize) {
    const batch = targets.slice(start, start + SLUG_CONFIG.batchSize)
    let batchSlugs

    try {
      batchSlugs = callGeminiForSlugs_(batch, apiKey)
    } catch (error) {
      Logger.log('Gemini batch error: ' + error)
      batchSlugs = batch.map(function (target) {
        return generateSlugFallback_(target)
      })
    }

    batch.forEach(function (target, j) {
      results[start + j] = finalizeSlug_(
        batchSlugs[j] || generateSlugFallback_(target),
      )
    })

    if (start + SLUG_CONFIG.batchSize < targets.length) {
      Utilities.sleep(SLUG_CONFIG.batchSleepMs)
    }
  }

  return results
}

function callGeminiForSlugs_(batch, apiKey) {
  const prompt = buildSlugPrompt_(batch)
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    SLUG_CONFIG.geminiModel +
    ':generateContent?key=' +
    encodeURIComponent(apiKey)

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.05,
        maxOutputTokens: 512,
        responseMimeType: 'application/json',
      },
    }),
    muteHttpExceptions: true,
  })

  const status = response.getResponseCode()
  const body = JSON.parse(response.getContentText())

  if (status !== 200) {
    const message = body.error?.message || response.getContentText()
    throw new Error('Gemini API error (' + status + '): ' + message)
  }

  const text =
    body.candidates?.[0]?.content?.parts?.map(function (p) {
      return p.text
    }).join('') || ''

  return parseSlugJsonResponse_(text, batch.length)
}

function buildSlugPrompt_(batch) {
  const examples = SLUG_EXAMPLES.map(function (e) {
    return '- 「' + e.title + '」→ ' + e.slug
  }).join('\n')

  const rows = batch
    .map(function (t) {
      return [
        t.index + ':',
        'genre=' + (t.genre || ''),
        'title=' + t.title,
        'school=' + (t.schoolName || ''),
        'club=' + (t.clubName || ''),
        'company=' + (t.companyName || ''),
      ].join(' | ')
    })
    .join('\n')

  return (
    'Create DATABASE IDENTIFIER slugs (NOT SEO article URLs, NOT English sentences).\n\n' +
    'STRICT RULES:\n' +
    '- Maximum ' +
    SLUG_CONFIG.maxSlugWords +
    ' hyphen-separated tokens. NEVER exceed.\n' +
    '- Summarize the POST TITLE only. Ignore descriptions.\n' +
    '- NO literal full-title translation. NO English prose.\n' +
    '- Japanese culture/terms → romaji (mikoshi, dekotora, yosakoi, susukino)\n' +
    '- Abbreviations OK: med, ortho, uni, fest\n' +
    '- Numbers OK: 30m-yen\n' +
    '- lowercase a-z, digits, hyphens only\n\n' +
    'BAD (too long / essay-like):\n' +
    '- susukino-festival-carrying-the-portable-shrine\n' +
    '- a-report-on-the-final-day-of-the-susukino-festival\n' +
    '- department-of-orthopedic-surgery-sapporo-medical-university-school-of-medicine\n\n' +
    'GOOD (identifier / summary):\n' +
    examples +
    '\n\n' +
    'Return JSON array ONLY:\n' +
    '[{"index":0,"slug":"example-slug"}]\n\n' +
    'ROWS:\n' +
    rows
  )
}

function parseSlugJsonResponse_(text, expectedCount) {
  const trimmed = String(text).trim()
  let parsed

  try {
    parsed = JSON.parse(trimmed)
  } catch (e1) {
    const match = trimmed.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('JSON parse failed: ' + trimmed.slice(0, 200))
    parsed = JSON.parse(match[0])
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Expected JSON array')
  }

  const slugs = new Array(expectedCount).fill('')
  parsed.forEach(function (item) {
    const idx = Number(item.index)
    if (Number.isInteger(idx) && idx >= 0 && idx < expectedCount) {
      slugs[idx] = finalizeSlug_(String(item.slug || ''))
    }
  })

  return slugs
}

function generateSlugFallback_(target) {
  const exact = SLUG_EXAMPLES.find(function (e) {
    return e.title === target.title.trim()
  })
  if (exact) return finalizeSlug_(exact.slug)

  return buildIdentifierSlug_(target)
}

function buildIdentifierSlug_(target) {
  const tokens = []

  if (target.genre === '部活') {
    const school = extractIdentifierTokens_(target.schoolName || extractSchoolFromTitle_(target.title))
    const club = extractIdentifierTokens_(target.clubName || extractClubFromTitle_(target.title))
    tokens.push.apply(tokens, school)
    tokens.push.apply(tokens, club)
  } else if (target.genre === '学校' && target.schoolName) {
    tokens.push.apply(tokens, extractIdentifierTokens_(target.schoolName))
  } else if (target.companyName) {
    tokens.push.apply(tokens, extractIdentifierTokens_(target.companyName))
  }

  if (tokens.length === 0) {
    tokens.push.apply(tokens, extractIdentifierTokens_(target.title))
  } else {
    const titleTokens = extractIdentifierTokens_(target.title)
    titleTokens.forEach(function (token) {
      if (tokens.indexOf(token) < 0) tokens.push(token)
    })
  }

  return finalizeSlug_(dedupeTokens_(tokens).join('-'))
}

function extractIdentifierTokens_(text) {
  if (!text) return []

  let working = preprocessJapaneseTitle_(text)
  const tokens = []
  let hasMikoshi = false

  JA_IDENTIFIER_RULES.forEach(function (rule) {
    const pattern = rule[0]
    const replacement = rule[1]

    working = working.replace(pattern, function () {
      const rep =
        typeof replacement === 'function'
          ? replacement.apply(null, arguments)
          : replacement
      if (String(rep).indexOf('mikoshi') >= 0) {
        hasMikoshi = true
      }
      if (rep) {
        String(rep).split('-').forEach(function (part) {
          const normalized = normalizeSlug_(part)
          if (normalized) tokens.push(normalized)
        })
      }
      return ' '
    })
  })

  if (hasMikoshi) {
    removeToken_(tokens, 'festival')
    removeToken_(tokens, 'fest')
    removeToken_(tokens, 'matsuri')
  }

  working = working.replace(/\s+/g, ' ').trim()

  if (working && /[\u3000-\u9fff]/.test(working)) {
    const chunks = working.split(/[\s|｜・/／、,，]+/).filter(Boolean)
    chunks.forEach(function (chunk) {
      if (tokens.length >= SLUG_CONFIG.maxSlugWords) return
      if (!/[\u3000-\u9fff]/.test(chunk)) {
        chunk.split('-').forEach(function (part) {
          const normalized = normalizeSlug_(part)
          if (normalized) tokens.push(normalized)
        })
        return
      }
      try {
        const translated = translateWithRateLimit_(chunk, 'ja', 'en')
        compressSlugIdentifier_(translated)
          .split('-')
          .forEach(function (part) {
            if (part) tokens.push(part)
          })
      } catch (error) {
        Logger.log('translate chunk failed: ' + error)
      }
    })
  } else if (working) {
    compressSlugIdentifier_(working)
      .split('-')
      .forEach(function (part) {
        if (part) tokens.push(part)
      })
  }

  return dedupeTokens_(tokens).slice(0, SLUG_CONFIG.maxSlugWords)
}

function preprocessJapaneseTitle_(text) {
  return String(text)
    .trim()
    .replace(/[「」『』【】（）()［］\[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
}

function removeToken_(tokens, word) {
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i] === word) tokens.splice(i, 1)
  }
}

function dedupeTokens_(tokens) {
  const seen = {}
  const result = []
  tokens.forEach(function (token) {
    if (!token || seen[token]) return
    seen[token] = true
    result.push(token)
  })
  return result
}

function compressSlugIdentifier_(slug) {
  const parts = normalizeSlug_(slug)
    .split('-')
    .filter(Boolean)
    .map(function (part) {
      return SLUG_ABBREV_WORDS[part] || part
    })
    .filter(function (part) {
      return part && !SLUG_STOP_WORDS[part]
    })

  return truncateSlugWords_(dedupeTokens_(parts).join('-'), SLUG_CONFIG.maxSlugWords)
}

function extractSchoolFromTitle_(title) {
  const match = title.match(/(.+?(大学|高校|学院|学校|専門学校))/)
  return match ? match[1] : ''
}

function extractClubFromTitle_(title) {
  return title
    .replace(extractSchoolFromTitle_(title), '')
    .replace(/[|｜・]/g, ' ')
    .trim()
}

function finalizeSlug_(raw) {
  return compressSlugIdentifier_(normalizeSlug_(raw))
}

function truncateSlugWords_(slug, maxWords) {
  if (!slug) return ''
  const parts = slug.split('-').filter(Boolean)
  if (parts.length <= maxWords) {
    return parts.join('-')
  }
  return parts.slice(0, maxWords).join('-')
}

function normalizeSlug_(raw) {
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function assignUniqueSlug_(base, usedSlugs) {
  if (!base) return ''

  if (!usedSlugs.has(base)) {
    usedSlugs.add(base)
    return base
  }

  let n = 2
  while (usedSlugs.has(base + '-' + n)) {
    n++
  }

  const unique = base + '-' + n
  usedSlugs.add(unique)
  return unique
}

function getColumnMap_(sheet) {
  const lastCol = sheet.getLastColumn()
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
  const map = {}

  headers.forEach(function (header, i) {
    const key = String(header ?? '').trim()
    if (key) map[key] = i + 1
  })

  return map
}
