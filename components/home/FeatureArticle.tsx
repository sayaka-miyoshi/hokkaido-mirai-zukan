import Link from 'next/link'
import type { Post } from '@/types/post'
import PostImage from '@/components/PostImage'
import { urls } from '@/lib/urls'

type FeatureArticleProps = {
  post: Post
  /** トップ特集の主役記事 */
  featured?: boolean
  priority?: boolean
}

function genreLabel(genre: string): string {
  if (genre === '企業訪問') return '企業'
  return genre
}

/** 特集記事風のエディトリアル表示 */
export default function FeatureArticle({
  post,
  featured = false,
  priority = false,
}: FeatureArticleProps) {
  const subtitle = post.description.trim()

  return (
    <article className={featured ? 'mb-14' : 'mb-10'}>
      <Link href={urls.post(post.id)} className="group block">
        <div
          className={`relative w-full overflow-hidden bg-hokkaido-ice ${
            featured ? 'aspect-[4/5]' : 'aspect-[16/10]'
          }`}
        >
          <PostImage
            src={post.imageUrl}
            alt={post.title}
            priority={priority}
            sizes={featured ? '100vw' : '100vw'}
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>

        <div className={featured ? 'mt-6' : 'mt-4'}>
          <p className="text-[11px] tracking-[0.18em] text-gray-500 uppercase">
            {genreLabel(post.genre)}
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            {post.area}
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            {post.date}
          </p>
          <h3
            className={`mt-3 font-bold leading-snug text-hokkaido-deep group-hover:text-hokkaido-sky transition-colors ${
              featured ? 'text-2xl' : 'text-lg'
            }`}
          >
            {post.title}
          </h3>
          {subtitle && (
            <p
              className={`mt-3 text-gray-600 leading-relaxed ${
                featured ? 'text-base line-clamp-3' : 'text-sm line-clamp-2'
              }`}
            >
              {subtitle}
            </p>
          )}
          <p className="mt-4 text-sm font-medium text-hokkaido-deep/70 group-hover:text-hokkaido-sky transition-colors">
            記事を読む →
          </p>
        </div>
      </Link>
    </article>
  )
}
