'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { DEFAULT_POST_IMAGE } from '@/lib/og-image'

type PostImageProps = {
  src: string
  alt: string
  fill?: boolean
  priority?: boolean
  className?: string
  sizes?: string
}

/** 投稿サムネイル（空欄・取得失敗時はデフォルト画像） */
export default function PostImage({
  src,
  alt,
  fill = true,
  priority = false,
  className = 'object-cover',
  sizes = '(max-width: 640px) 50vw, 200px',
}: PostImageProps) {
  const initial = src?.trim() || DEFAULT_POST_IMAGE
  const [imgSrc, setImgSrc] = useState(initial)
  const isDefault = imgSrc === DEFAULT_POST_IMAGE

  useEffect(() => {
    setImgSrc(src?.trim() || DEFAULT_POST_IMAGE)
  }, [src])

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      priority={priority}
      className={`${className} ${isDefault ? 'object-contain p-6 bg-hokkaido-ice' : ''}`}
      unoptimized={!isDefault}
      sizes={sizes}
      onError={() => setImgSrc(DEFAULT_POST_IMAGE)}
    />
  )
}
