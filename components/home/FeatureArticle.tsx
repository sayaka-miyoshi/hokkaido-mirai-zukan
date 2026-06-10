import Link from 'next/link'
import type { Post } from '@/types/post'
import PostImage from '@/components/PostImage'
import { urls } from '@/lib/urls'

type FeatureArticleProps = {
  post: Post
  layout?: 'default' | 'title-first' | 'feature' | 'story'
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
  const editorialImageClass =
    'object-cover object-[center_32%] transition-transform duration-700 group-hover:scale-[1.015]'

  if (layout === 'feature' || layout === 'story') {
    const isCompact = layout === 'story'

    return (
      <article
        className={`border-t border-hokkaido-ice/50 first:border-t-0 ${
          isCompact ? 'py-12 first:pt-0' : 'py-16 first:pt-0'
        }`}
      >
        <Link href={urls.post(post.id)} className="group block">
          <div
            className={`relative overflow-hidden bg-hokkaido-ice ${
              isCompact
                ? 'mx-0 aspect-[4/5]'
                : '-mx-6 aspect-[4/5] min-h-[min(72vw,520px)] sm:min-h-[480px]'
            }`}
          >
            <PostImage
              src={post.imageUrl}
              alt={post.title}
              priority={priority}
              sizes="100vw"
              className={editorialImageClass}
            />
          </div>

          <div className={isCompact ? 'mt-6' : 'mt-8'}>
            {showMeta && (
              <p className="text-[11px] tracking-[0.2em] text-gray-400">
                {genreLabel(post.genre)}
                <span className="mx-2" aria-hidden="true">
                  ·
                </span>
                {post.area}
              </p>
            )}
            <h3
              className={`font-bold leading-snug text-hokkaido-deep group-hover:text-hokkaido-sky transition-colors ${
                isCompact ? 'mt-2 text-xl' : 'mt-3 text-2xl'
              }`}
            >
              {post.title}
            </h3>
            {subtitle && (
              <p
                className={`text-gray-600 leading-[1.9] line-clamp-4 ${
                  isCompact ? 'mt-4 text-[15px]' : 'mt-5 text-base'
                }`}
              >
                {subtitle}
              </p>
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
          <div className="relative aspect-[4/5] overflow-hidden bg-hokkaido-ice">
            <PostImage
              src={post.imageUrl}
              alt={post.title}
              priority={priority}
              sizes="100vw"
              className={editorialImageClass}
            />
          </div>
          <h3 className="mt-5 text-xl font-bold leading-snug text-hokkaido-deep group-hover:text-hokkaido-sky transition-colors">
            {post.title}
          </h3>
          {subtitle && (
            <p className="mt-4 text-[15px] text-gray-600 leading-[1.85] line-clamp-3">{subtitle}</p>
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
            className={editorialImageClass}
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
              続きを読む →
            </p>
          )}
        </div>
      </Link>
    </article>
  )
}
