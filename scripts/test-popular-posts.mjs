const POPULAR_POSTS_MAX = 6

function getPopularPostsFromSpreadsheet(posts) {
  return posts
    .filter((post) => post.isPopular && post.popularOrder != null)
    .sort((a, b) => a.popularOrder - b.popularOrder)
    .slice(0, POPULAR_POSTS_MAX)
}

const sorted = getPopularPostsFromSpreadsheet([
  { id: '1', title: 'C', isPopular: true, popularOrder: 2 },
  { id: '2', title: 'A', isPopular: true, popularOrder: 1 },
  { id: '3', title: 'NoOrder', isPopular: true, popularOrder: null },
  { id: '5', title: 'Hidden', isPopular: false, popularOrder: 1 },
])

if (sorted.map((p) => p.id).join(',') !== '2,1') {
  console.error('sort failed:', sorted.map((p) => p.id).join(','))
  process.exit(1)
}

const limited = getPopularPostsFromSpreadsheet(
  Array.from({ length: 12 }, (_, i) => ({
    id: String(i + 1),
    isPopular: true,
    popularOrder: i + 1,
  })),
)

if (limited.length !== 6 || limited[0].popularOrder !== 1 || limited[5].popularOrder !== 6) {
  console.error('limit failed:', limited.length, limited.map((p) => p.popularOrder).join(','))
  process.exit(1)
}

console.log('popular-posts tests passed')
