'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  DEFAULT_POST_IMAGE,
} from '@/lib/og-image'
import { getImageUrlCandidates, normalizeImageUrl } from '@/lib/image-url'

type PostImageProps = {
  src: string
  alt: string
  fill?: boolean
  priority?: boolean
  className?: string
  sizes?: string
}

function resolveInitialSrc(src: string): string {
  if (!src?.trim() || src.trim() === DEFAULT_POST_IMAGE) return DEFAULT_POST_IMAGE
  return normalizeImageUrl(src) ?? getImageUrlCandidates(src)[0] ?? DEFAULT_POST_IMAGE
}

/** 投稿サムネイル（空欄・取得失敗時はデフォルト画像） */
export default function PostImage({
  src,
  alt,
  fill = true,
  priority = false,
  className = '',
  sizes = '(max-width: 640px) 50vw, 200px',
}: PostImageProps) {
  const candidates = useMemo(
    () => (src?.trim() ? getImageUrlCandidates(src) : []),
    [src],
  )
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [useDefault, setUseDefault] = useState(() => !src?.trim())

  const displaySrc = useDefault
    ? DEFAULT_POST_IMAGE
    : candidates.length > 0
      ? candidates[candidateIndex] ?? DEFAULT_POST_IMAGE
      : resolveInitialSrc(src)

  const isDefault = displaySrc === DEFAULT_POST_IMAGE

  useEffect(() => {
    setCandidateIndex(0)
    setUseDefault(!src?.trim())
  }, [src])

  const handleError = () => {
    if (useDefault) return

    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((index) => index + 1)
      return
    }

    setUseDefault(true)
  }

  const imageClassName = isDefault
    ? 'object-contain p-4 bg-hokkaido-ice'
    : `${className || 'object-cover'}`.trim()

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
