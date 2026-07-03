import Link from 'next/link'
import type { Post } from '@/types/post'
import PostThumbnail from '@/components/PostThumbnail'
import { HOME_GRID_CARD } from '@/lib/home-layout'
import { urls } from '@/lib/urls'

type FeatureArticleProps = {
  post: Post
  layout?: 'default' | 'title-first' | 'feature' | 'story' | 'grid'
  editorialCategory?: string
  featureIndex?: number
  priority?: boolean
  showMeta?: boolean
  showReadLink?: boolean
  /** 学校・部活・企業・競技ページへの内部リンク */
  entityLink?: { label: string; href: string }
}

function CategoryPill({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full bg-magazine-peach px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-[#D4654A]">
      {label}
    </span>
  )
}

/** 特集記事風のエディトリアル表示 */
export default function FeatureArticle({
  post,
  layout = 'default',
  editorialCategory,
  featureIndex,
  priority = false,
  showMeta = true,
  showReadLink = true,
  entityLink,
}: FeatureArticleProps) {
  const subtitle = post.description.trim()

  const categoryLabel =
    editorialCategory ??
    (post.genre === '企業訪問' ? '企業' : post.genre === '行政・自治体' ? '行政' : post.genre)

  const thumbnail = (
    <PostThumbnail
      src={post.imageUrl}
      alt={post.genre === '企業訪問' ? '' : post.title}
      genre={post.genre}
      priority={priority}
      sizes={
        layout === 'grid'
          ? '(max-width: 767px) 45vw, 280px'
          : '(max-width: 768px) 100vw, 672px'
      }
      frameClassName={
        layout === 'feature' ? '-mx-2 shadow-magazine-sm' : layout === 'story' ? 'shadow-magazine-sm' : ''
      }
    />
  )

  if (layout === 'feature') {
    return (
      <article className="border-t border-magazine-border/60 py-16 first:border-t-0 first:pt-4">
        <Link href={urls.post(post.id)} className="group block">
          {featureIndex != null && (
            <p className="mb-5 font-magazine-rounded text-[11px] font-bold tracking-[0.2em] text-magazine-coral">
              PICK {String(featureIndex).padStart(2, '0')}
            </p>
          )}

          {thumbnail}

          <div className="mt-8 px-1">
            <h3 className="font-magazine-rounded text-[1.45rem] font-bold leading-[1.3] text-magazine-title transition-colors group-hover:text-hokkaido-sky">
              {post.title}
            </h3>
            {subtitle && (
              <p className="mt-5 text-[15px] leading-[2.0] text-magazine-text line-clamp-5">{subtitle}</p>
            )}
            {showMeta && (
              <div className="mt-6">
                <CategoryPill label={categoryLabel} />
              </div>
            )}
          </div>
        </Link>
      </article>
    )
  }

  if (layout === 'grid') {
    const isCompanyCard = post.genre === '企業訪問'
    const entityName = post.companyName.trim()

    return (
      <article>
        <Link href={urls.post(post.id)} className="group block">
          {thumbnail}
          <div className={HOME_GRID_CARD.body}>
            <h3
              className={`text-magazine-title transition-colors group-hover:text-hokkaido-sky ${HOME_GRID_CARD.title} ${
                isCompanyCard ? 'font-normal' : 'font-bold font-magazine-rounded'
              }`}
            >
              {post.title}
            </h3>
            {showMeta &&
              (isCompanyCard && entityName ? (
                <p className={`font-bold text-magazine-text ${HOME_GRID_CARD.meta}`}>{entityName}</p>
              ) : (
                categoryLabel && (
                  <p className={`font-medium text-magazine-muted ${HOME_GRID_CARD.meta}`}>
                    {categoryLabel}
                  </p>
                )
              ))}
          </div>
        </Link>
        {entityLink && (
          <Link
            href={entityLink.href}
            className="mt-1.5 block text-[10px] font-medium text-pink-500 hover:underline"
          >
            {entityLink.label}のページ →
          </Link>
        )}
      </article>
    )
  }

  if (layout === 'story') {
    return (
      <article className="border-t border-magazine-border/60 py-10 first:border-t-0 first:pt-0">
        <Link href={urls.post(post.id)} className="group block">
          {thumbnail}

          <div className="mt-5 px-1">
            <h3 className="font-magazine-rounded text-lg font-bold leading-[1.35] text-magazine-title transition-colors group-hover:text-hokkaido-sky">
              {post.title}
            </h3>
            {subtitle && (
              <p className="mt-3 text-[14px] leading-[1.95] text-magazine-text line-clamp-3">{subtitle}</p>
            )}
            {showMeta && categoryLabel && (
              <div className="mt-4">
                <CategoryPill label={categoryLabel} />
              </div>
            )}
          </div>
        </Link>
      </article>
    )
  }

  if (layout === 'title-first') {
    return (
      <article className="border-t border-magazine-border py-10 first:border-t-0 first:pt-0">
        <Link href={urls.post(post.id)} className="group block">
          {thumbnail}
          <h3 className="mt-5 font-magazine-rounded text-xl font-bold leading-snug text-magazine-title">
            {post.title}
          </h3>
          {subtitle && (
            <p className="mt-4 text-[15px] leading-[1.85] text-magazine-text line-clamp-3">{subtitle}</p>
          )}
        </Link>
      </article>
    )
  }

  return (
    <article className="mb-10">
      <Link href={urls.post(post.id)} className="group block">
        {thumbnail}

        <div className="mt-4">
          <h3 className="font-magazine-rounded text-lg font-bold leading-snug text-magazine-title">
            {post.title}
          </h3>
          {subtitle && (
            <p className="mt-3 text-sm leading-relaxed text-magazine-text line-clamp-2">{subtitle}</p>
          )}
          {showMeta && (
            <div className="mt-4">
              <CategoryPill label={categoryLabel} />
            </div>
          )}
          {showReadLink && (
            <p className="mt-4 text-sm text-magazine-title/70 transition-colors group-hover:text-hokkaido-sky">
              続きを読む →
            </p>
          )}
        </div>
      </Link>
    </article>
  )
}
