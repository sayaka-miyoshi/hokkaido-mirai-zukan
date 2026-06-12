import Link from 'next/link'
import PostImage from '@/components/PostImage'
import { HOME_GRID_CARD } from '@/lib/home-layout'
import type { Post } from '@/types/post'
import { urls } from '@/lib/urls'

type CompanyGridCardProps = {
  post: Post
  priority?: boolean
}

/** 企業カード — 画像 / 記事タイトル / 企業名（太字） */
export default function CompanyGridCard({ post, priority = false }: CompanyGridCardProps) {
  const companyName = post.companyName.trim()

  return (
    <article>
      <Link href={urls.post(post.id)} className="group block">
        <div
          className={`relative ${HOME_GRID_CARD.imageAspect} overflow-hidden rounded-2xl bg-magazine-sky shadow-magazine-sm`}
        >
          <PostImage
            src={post.imageUrl}
            alt=""
            genre={post.genre}
            priority={priority}
            sizes="(max-width: 767px) 45vw, 280px"
            className={HOME_GRID_CARD.imageClass}
          />
        </div>
        <div className={HOME_GRID_CARD.body}>
          <h3
            className={`font-normal text-magazine-title transition-colors group-hover:text-hokkaido-sky ${HOME_GRID_CARD.title}`}
          >
            {post.title}
          </h3>
          {companyName && (
            <p className={`font-bold text-magazine-text ${HOME_GRID_CARD.meta}`}>{companyName}</p>
          )}
        </div>
      </Link>
    </article>
  )
}
