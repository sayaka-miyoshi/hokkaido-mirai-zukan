import { fetchPostsResult } from '@/lib/fetchPosts'
import SearchContainer from '@/components/SearchContainer'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { posts, source, error } = await fetchPostsResult()
  return <SearchContainer posts={posts} dataSource={source} dataError={error} />
}
