import Link from 'next/link'
import type { Post } from '@/types/post'
import PostImage from '@/components/PostImage'
import { urls } from '@/lib/urls'

type FeatureArticleProps = {
  post: Post
  /** タイトル → 写真 → 紹介文 */
  layout?: 'default' | 'title-first' | 'feature'
  priority?: boolean
  showMeta?: boolean
  showReadLink?: boolean
}

function genreLabel(genre: string): string {
  if (genre === '企業訪問') return '企業'
  if (genre === '行政・自治体') return '行政・団体'
  return genre
}

/** 特集記事風のエディトリアル表示 */
export default function FeatureArticle({
  post,
  layout = 'default',
  priority = false,
  showMeta = true,
  showReadLink = true,
}: FeatureArticleProps) {
  const subtitle = post.description.trim()

  if (layout === 'feature') {
    return (
      <article className="py-16 first:pt-0 border-t border-hokkaido-ice/50 first:border-t-0">
        <Link href={urls.post(post.id)} className="group block">
          <div className="relative w-full aspect-[4/5] overflow-hidden bg-hokkaido-ice">
            <PostImage
              src={post.imageUrl}
              alt={post.title}
              priority={priority}
              sizes="100vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.015]"
            />
          </div>

          <div className="mt-7">
            <p className="text-[11px] tracking-[0.2em] text-gray-400">
              {genreLabel(post.genre)}
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              {post.area}
            </p>
            <h3 className="mt-3 text-2xl font-bold leading-snug text-hokkaido-deep group-hover:text-hokkaido-sky transition-colors">
              {post.title}
            </h3>
            {subtitle && (
              <p className="mt-5 text-base text-gray-600 leading-[1.9] line-clamp-4">{subtitle}</p>
            )}
          </div>
        </Link>
      </article>
    )
  }

  if (layout === 'title-first') {
    return (
      <article className="py-10 first:pt-0 border-t border-hokkaido-ice/60 first:border-t-0">
        <Link href={urls.post(post.id)} className="group block">
          <h3 className="text-xl font-bold leading-snug text-hokkaido-deep group-hover:text-hokkaido-sky transition-colors">
            {post.title}
          </h3>

          <div className="relative mt-5 w-full aspect-[4/5] overflow-hidden bg-hokkaido-ice">
            <PostImage
              src={post.imageUrl}
              alt={post.title}
              priority={priority}
              sizes="100vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>

          {subtitle && (
            <p className="mt-5 text-[15px] text-gray-600 leading-[1.85] line-clamp-4">{subtitle}</p>
          )}
        </Link>
      </article>
    )
  }

  return (
    <article className="mb-10">
      <Link href={urls.post(post.id)} className="group block">
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-hokkaido-ice">
          <PostImage
            src={post.imageUrl}
            alt={post.title}
            priority={priority}
            sizes="100vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>

        <div className="mt-4">
          {showMeta && (
            <p className="text-[11px] tracking-[0.18em] text-gray-500">
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
          )}
          <h3 className="mt-3 text-lg font-bold leading-snug text-hokkaido-deep group-hover:text-hokkaido-sky transition-colors">
            {post.title}
          </h3>
          {subtitle && (
            <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-2">{subtitle}</p>
          )}
          {showReadLink && (
            <p className="mt-4 text-sm font-medium text-hokkaido-deep/70 group-hover:text-hokkaido-sky transition-colors">
              記事を読む →
            </p>
          )}
        </div>
      </Link>
    </article>
  )
}
