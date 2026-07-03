import type { Post } from '@/types/post'
import PostCard from './PostCard'

export default function PostGrid({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-4xl mb-3">🔍</p>
        <p className="font-bold">該当する投稿が見つかりませんでした</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {posts.map((post, index) => (
        <div key={post.id} data-post-index={index + 1}>
          <PostCard post={post} />
        </div>
      ))}
    </div>
  )
}
