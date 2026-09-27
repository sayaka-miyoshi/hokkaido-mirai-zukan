'use client'

import { useState } from 'react'
import PostThumbnail from '@/components/PostThumbnail'
import {
  toInstagramEmbedUrl,
  toInstagramPermalink,
} from '@/lib/instagram-post-id'

type InstagramEmbedProps = {
  instagramUrl: string
  title: string
  imageUrl: string
  genre?: string
}

function InstagramExternalLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block instagram-gradient text-white font-bold px-6 py-3 rounded-full"
    >
      Instagramで見る →
    </a>
  )
}

function ThumbnailFallback({
  imageUrl,
  title,
  genre,
  instagramUrl,
}: {
  imageUrl: string
  title: string
  genre?: string
  instagramUrl: string
}) {
  return (
    <div className="mb-6">
      <PostThumbnail
        src={imageUrl}
        alt={title}
        genre={genre}
        priority
        variant="detail"
        sizes="(max-width: 768px) 100vw, 672px"
        frameClassName="mb-4"
      />
      <InstagramExternalLink href={instagramUrl} />
    </div>
  )
}

/**
 * Instagram 公式埋め込み（permalink + /embed iframe）
 * - loading="lazy" で初期表示速度への影響を抑える
 * - URLが不正／埋め込み不可の場合はサムネイル＋外部リンクへフォールバック
 * - 音付き自動再生は強制しない（Instagram側の既定に任せる）
 */
export default function InstagramEmbed({
  instagramUrl,
  title,
  imageUrl,
  genre,
}: InstagramEmbedProps) {
  const permalink = toInstagramPermalink(instagramUrl)
  const embedUrl = toInstagramEmbedUrl(instagramUrl)
  const [failed, setFailed] = useState(false)

  if (!permalink || !embedUrl || failed) {
    return (
      <ThumbnailFallback
        imageUrl={imageUrl}
        title={title}
        genre={genre}
        instagramUrl={instagramUrl}
      />
    )
  }

  return (
    <div className="mb-6">
      {/* スマホ最優先：縦型 Reel（9:16）が見やすいサイズ */}
      <div className="mx-auto w-full max-w-[400px]">
        <div className="relative aspect-[9/16] w-full overflow-hidden bg-[#fafafa] border border-magazine-border/40">
          <iframe
            src={embedUrl}
            title={`${title}（Instagram埋め込み）`}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            scrolling="no"
            onError={() => setFailed(true)}
          />
        </div>
      </div>

      <div className="mt-4">
        <InstagramExternalLink href={permalink} />
      </div>
    </div>
  )
}
