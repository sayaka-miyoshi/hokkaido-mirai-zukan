/**
 * 企業セクション手動キュレーション確認
 * node scripts/verify-company-curation.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parsePostsCsv } from '../lib/csv.ts'
import { COMPANY_CONTENT_MAX } from '../lib/home-layout.ts'
import { resolveCompanyCuratedPosts } from '../lib/company-recommended-posts.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
const csvUrl = env.match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)?.[1]?.trim()

const res = await fetch(csvUrl)
const parsed = parsePostsCsv(await res.text())
const result = resolveCompanyCuratedPosts(parsed.posts, COMPANY_CONTENT_MAX)

console.log(JSON.stringify({
  configuredCount: result.configuredCount,
  matchedCount: result.matchedCount,
  displayedCount: result.posts.length,
  unmatchedUrls: result.unmatchedUrls,
  displayedTitles: result.posts.map((post) => ({
    id: post.id,
    title: post.title,
    companyName: post.companyName,
    area: post.area,
    instagramUrl: post.instagramUrl,
  })),
}, null, 2))
