import { fetchPosts } from '@/lib/fetchPosts'
import SearchContainer from '@/components/SearchContainer'

export default async function Home() {
  const posts = await fetchPosts()
  return <SearchContainer posts={posts} />
}
