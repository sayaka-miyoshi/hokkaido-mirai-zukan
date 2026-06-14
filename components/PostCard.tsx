'use client'

import Link from 'next/link'
import type { Post } from '@/types/post'
import { getGenreBadgeClass } from '@/lib/genres'
import { urls } from '@/lib/urls'
import PostThumbnail from './PostThumbnail'
import RecruitmentBadge from './RecruitmentBadge'

export default function PostCard({ post }: { post: Post }) {
  const hasRecruitment = Boolean(post.recruitmentInfo.trim())
  const isCompanyCard = post.genre === '企業訪問'
  const companyName = post.companyName.trim()

  return (
    <Link
      href={urls.post(post.id)}
      className="bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col border border-hokkaido-ice active:scale-[0.98]"
    >
      <PostThumbnail
        src={post.imageUrl}
        alt={post.title}
        genre={post.genre}
        sizes="(max-width: 640px) 50vw, 200px"
      >
        {!isCompanyCard && (
          <>
            <span
              className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm
                ${getGenreBadgeClass(post.genre)}`}
            >
              {post.genre}
            </span>
            {hasRecruitment && (
              <RecruitmentBadge
                text={post.recruitmentInfo}
                className="absolute top-2 right-2 text-[9px] px-2 py-1 rounded-full max-w-[calc(100%-4.5rem)]"
              />
            )}
            {post.videoCategoryLabel && (
              <span className="absolute bottom-2 left-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-md bg-black/50 text-white truncate">
                {post.videoCategoryLabel}
              </span>
            )}
          </>
        )}
      </PostThumbnail>

      <div className="p-2.5 flex flex-col gap-1 flex-1">
        {isCompanyCard ? (
          <>
            <p className="font-bold text-xs leading-snug line-clamp-2 text-gray-800">{post.title}</p>
            {companyName && (
              <p className="text-[11px] font-medium leading-snug text-hokkaido-lake line-clamp-2">
                {companyName}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="font-bold text-xs leading-snug line-clamp-2 text-gray-800">{post.title}</p>
            {hasRecruitment && (
              <RecruitmentBadge
                text={post.recruitmentInfo}
                className="self-start text-[9px] px-2 py-0.5 rounded-full"
              />
            )}
            <div className="mt-auto flex items-center justify-between pt-1 gap-1">
              <span className="text-[10px] text-hokkaido-lake font-medium truncate">📍 {post.area}</span>
              <span className="text-[10px] text-gray-400 shrink-0">{post.date}</span>
            </div>
          </>
        )}
      </div>
    </Link>
  )
}
