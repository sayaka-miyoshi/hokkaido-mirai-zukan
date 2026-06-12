const html = await (await fetch('https://hokkaido-mirai-zukan.vercel.app/')).text()
const checks = [
  '最新記事',
  '最新コンテンツ',
  '学校の記事',
  '228記事',
  '306記事',
  'search-results',
  'id="latest"',
  '記事を見る',
  'この条件で検索',
  '掲載記事数',
  '北海道最大級',
]
for (const c of checks) {
  console.log(c, html.includes(c))
}
