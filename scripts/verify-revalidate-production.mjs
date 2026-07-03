/**
 * revalidate API 本番確認
 * node scripts/verify-revalidate-production.mjs
 * 環境変数 REVALIDATE_SECRET が必要
 */
const base = 'https://www.hokkaido-miraizukan.jp'
const secret = process.env.REVALIDATE_SECRET?.trim()

if (!secret) {
  console.error('❌ REVALIDATE_SECRET 環境変数を設定してください')
  process.exit(1)
}

const res = await fetch(`${base}/api/revalidate`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${secret}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ source: 'verify-script', tags: ['posts'] }),
})

const text = await res.text()
console.log(res.status, text)
process.exit(res.ok ? 0 : 1)
