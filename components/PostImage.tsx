'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { isDefaultPostImage, resolveDefaultPostImage } from '@/lib/default-images'
import { getImageUrlCandidates, normalizeImageUrl } from '@/lib/image-url'

type PostImageProps = {
  src: string
  alt?: string
  genre?: string
  fill?: boolean
  priority?: boolean
  className?: string
  sizes?: string
}

function resolveInitialSrc(src: string, genre?: string): string {
  const fallback = resolveDefaultPostImage(genre)
  if (!src?.trim() || isDefaultPostImage(src.trim())) return fallback
  return normalizeImageUrl(src) ?? getImageUrlCandidates(src)[0] ?? fallback
}

/** 投稿サムネイル（空欄・取得失敗時はジャンル別デフォルト画像） */
export default function PostImage({
  src,
  alt = '',
  genre,
  fill = true,
  priority = false,
  className = '',
  sizes = '(max-width: 640px) 50vw, 200px',
}: PostImageProps) {
  const fallbackSrc = resolveDefaultPostImage(genre)
  const candidates = useMemo(
    () => (src?.trim() ? getImageUrlCandidates(src) : []),
    [src],
  )
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [useDefault, setUseDefault] = useState(() => !src?.trim())

  const displaySrc = useDefault
    ? fallbackSrc
    : candidates.length > 0
      ? candidates[candidateIndex] ?? fallbackSrc
      : resolveInitialSrc(src, genre)

  useEffect(() => {
    setCandidateIndex(0)
    setUseDefault(!src?.trim())
  }, [src, genre])

  const handleError = () => {
    if (useDefault) return

    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((index) => index + 1)
      return
    }

    setUseDefault(true)
  }

  const imageClassName = `${className || 'object-cover'}`.trim()

  return (
    <Image
      src={displaySrc}
      alt={alt}
      fill={fill}
      priority={priority}
      className={imageClassName}
      unoptimized
      sizes={sizes}
      onError={handleError}
    />
  )
}
