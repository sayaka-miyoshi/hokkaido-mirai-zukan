/**
 * エンティティページの記事フィルタ回帰テスト
 *
 * 1. 企業ページに学校記事が混ざらない
 * 2. 学校ページに企業記事が混ざらない
 * 3. 部活・競技ページに無関係な記事が混ざらない
 * 4. あしり座ページに北海道美容専門学校が表示されない
 * 5. 本番ビルドが通る（未コミットの app/en は一時退避）
 *
 * node --experimental-strip-types scripts/test-entity-page-filters.mjs [--skip-build]
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, cpSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  collectCompanyNames,
  collectClubNames,
  collectSchoolNames,
  collectSportNames,
  filterSchoolPagePosts,
  filterSportPagePosts,
  partitionClubPagePosts,
  partitionCompanyPagePosts,
} from '../lib/entity-page-posts.ts'
import { loadSheetPosts } from './lib/load-sheet-posts.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const skipBuild = process.argv.includes('--skip-build')

let failed = 0

function assert(name, ok) {
  console.log(ok ? '✅' : '❌', name)
  if (!ok) failed++
}

function resolveCompanySlug(posts, companyName) {
  const companyPost = posts.find(
    (p) => p.companyName === companyName && p.genre === '企業訪問' && p.slug,
  )
  if (companyPost?.slug) return companyPost.slug
  return posts.find((p) => p.companyName === companyName && p.slug)?.slug
}

function longestCommonSlugPrefix(slugs) {
  const valid = slugs.filter(Boolean)
  if (valid.length === 0) return undefined
  if (valid.length === 1) {
    const parts = valid[0].split('-')
    if (parts.length >= 3) return parts.slice(0, -1).join('-')
    return valid[0]
  }
  const split = valid.map((s) => s.split('-'))
  const minLen = Math.min(...split.map((p) => p.length))
  let i = 0
  while (i < minLen && split.every((p) => p[i] === split[0][i])) i++
  if (i === 0) return undefined
  return split[0].slice(0, i).join('-')
}

function resolveSchoolSlug(posts, schoolName) {
  const schoolPost = posts.find(
    (p) => p.schoolName === schoolName && p.genre === '学校' && p.slug,
  )
  if (schoolPost?.slug) return schoolPost.slug
  const relatedSlugs = [
    ...new Set(posts.filter((p) => p.schoolName === schoolName && p.slug).map((p) => p.slug)),
  ]
  return longestCommonSlugPrefix(relatedSlugs)
}

function resolveClubSlug(posts, clubName) {
  const clubPost = posts.find((p) => p.clubName === clubName && p.genre === '部活' && p.slug)
  if (clubPost) return clubPost.slug
  return posts.find((p) => p.clubName === clubName && p.slug)?.slug
}

function getSportSlug(name) {
  return encodeURIComponent(name)
}

const posts = await loadSheetPosts()

console.log('=== 1. 企業ページ：学校・部活ジャンルが混ざらない ===')
for (const name of collectCompanyNames(posts)) {
  const { companyPosts, relatedPosts } = partitionCompanyPagePosts(posts, name)
  const hasSchoolInMain = companyPosts.some((p) => p.genre === '学校' || p.genre === '部活')
  const hasSchoolInRelated = relatedPosts.some((p) => p.genre === '学校' || p.genre === '部活')
  if (hasSchoolInMain || hasSchoolInRelated) {
    assert(`企業「${name}」に学校・部活記事なし`, false)
  }
  if (!companyPosts.every((p) => p.genre === '企業訪問' && p.companyName === name)) {
    assert(`企業「${name}」メインは企業訪問+companyNameのみ`, false)
  }
}
assert('全企業ページ：学校・部活ジャンルなし', true)

console.log('\n=== 2. 学校ページ：企業訪問が混ざらない ===')
for (const name of collectSchoolNames(posts)) {
  const schoolPosts = filterSchoolPagePosts(posts, name)
  if (schoolPosts.some((p) => p.genre === '企業訪問')) {
    assert(`学校「${name}」に企業訪問記事なし`, false)
  }
  if (!schoolPosts.every((p) => p.schoolName === name)) {
    assert(`学校「${name}」は schoolName 一致のみ`, false)
  }
}
assert('全学校ページ：企業訪問ジャンルなし', true)

console.log('\n=== 3. 部活・競技ページ：無関係な記事が混ざらない ===')
for (const name of collectClubNames(posts)) {
  const { clubPosts, relatedPosts } = partitionClubPagePosts(posts, name)
  const sportCategories = [
    ...new Set(
      posts.filter((p) => p.clubName === name && p.sportCategory.trim()).map((p) => p.sportCategory.trim()),
    ),
  ]

  for (const post of clubPosts) {
    if (post.clubName !== name || post.genre === '企業訪問' || post.genre === '学校') {
      assert(`部活「${name}」メイン一覧の条件違反 (id=${post.id})`, false)
    }
  }

  for (const post of relatedPosts) {
    const ok =
      post.genre === '部活' &&
      post.clubName !== name &&
      sportCategories.includes(post.sportCategory.trim())
    if (!ok) assert(`部活「${name}」関連記事の条件違反 (id=${post.id})`, false)
  }
}

for (const name of collectSportNames(posts)) {
  const sportPosts = filterSportPagePosts(posts, name)
  if (sportPosts.some((p) => p.genre === '企業訪問')) {
    assert(`競技「${name}」に企業訪問記事なし`, false)
  }
  if (!sportPosts.every((p) => p.sportCategory.trim() === name)) {
    assert(`競技「${name}」は sportCategory 一致のみ`, false)
  }
}
assert('全部活・競技ページ：フィルタ条件 OK', true)

console.log('\n=== 4. あしり座：北海道美容専門学校が表示されない ===')
const ashiriza = 'あしり座'
const ashirizaSlug = resolveCompanySlug(posts, ashiriza)
const { companyPosts, relatedPosts } = partitionCompanyPagePosts(posts, ashiriza)

assert('あしり座の slug が解決できる', Boolean(ashirizaSlug))
assert(
  'あしり座メインに北海道美容専門学校がない',
  !companyPosts.some((p) => p.schoolName?.includes('北海道美容専門学校')),
)
assert(
  'あしり座関連に北海道美容専門学校がない',
  !relatedPosts.some((p) => p.schoolName?.includes('北海道美容専門学校')),
)
assert('あしり座メインは企業訪問4件', companyPosts.length === 4)
console.log(`   slug: /company/${ashirizaSlug}`)

console.log('\n=== 5. 本番ビルド（HEAD + 今回の修正ファイル） ===')
if (skipBuild) {
  console.log('⏭️  --skip-build のためスキップ')
} else {
  const worktree = join(dirname(root), 'hokkaido-entity-page-build-test')
  const changeFiles = [
    'lib/entity-page-posts.ts',
    'lib/queries.ts',
    'app/company/[slug]/page.tsx',
    'app/school/[slug]/page.tsx',
    'app/club/[slug]/page.tsx',
    'app/sport/[slug]/page.tsx',
    'package.json',
  ]

  if (existsSync(worktree)) {
    spawnSync('git', ['worktree', 'remove', '--force', worktree], { cwd: root, shell: true })
  }

  const add = spawnSync('git', ['worktree', 'add', worktree, 'HEAD'], {
    cwd: root,
    shell: true,
    encoding: 'utf8',
  })
  if (add.status !== 0) {
    assert('git worktree 作成', false)
    console.log(add.stderr || add.stdout)
  } else {
    spawnSync('git', ['clean', '-fdx'], { cwd: worktree, shell: true })

    for (const rel of changeFiles) {
      const src = join(root, rel)
      const dest = join(worktree, rel)
      if (!existsSync(src)) continue
      mkdirSync(dirname(dest), { recursive: true })
      cpSync(src, dest)
    }

    const install = spawnSync('npm', ['ci'], {
      cwd: worktree,
      stdio: 'pipe',
      shell: true,
      encoding: 'utf8',
    })
    if (install.status !== 0) {
      assert('npm ci（worktree）', false)
      console.log((install.stdout || install.stderr || '').slice(-800))
    } else {
      const result = spawnSync('npm', ['run', 'build'], {
        cwd: worktree,
        stdio: 'pipe',
        shell: true,
        encoding: 'utf8',
      })
      if (result.status === 0) {
        assert('npm run build 成功', true)
      } else {
        assert('npm run build 成功', false)
        const output = `${result.stdout || ''}\n${result.stderr || ''}`.trim()
        console.log(output.slice(-1200))
      }
    }

    spawnSync('git', ['worktree', 'remove', '--force', worktree], { cwd: root, shell: true })
  }
}

console.log(failed === 0 ? '\n✅ エンティティページフィルタテスト OK' : `\n❌ ${failed} 件失敗`)
process.exit(failed === 0 ? 0 : 1)
