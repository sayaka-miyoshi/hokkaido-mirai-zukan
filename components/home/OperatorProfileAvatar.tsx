'use client'

import { useState } from 'react'
import { PROFILE_IMAGE_PATH } from '@/lib/branding-paths'
import { OPERATOR } from '@/lib/site'

type OperatorProfileAvatarProps = {
  className?: string
}

/** 運営者プロフィール（丸型） */
export default function OperatorProfileAvatar({
  className = 'h-[104px] w-[104px]',
}: OperatorProfileAvatarProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return (
      <div
        aria-hidden="true"
        className={`flex items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-hokkaido-ice to-hokkaido-sky/30 text-4xl shadow-[0_0_0_1px_rgba(26,77,124,0.12)] ${className}`}
      >
        🗻
      </div>
    )
  }

  return (
    <img
      src={PROFILE_IMAGE_PATH}
      alt={`${OPERATOR.name}のプロフィール写真`}
      width={128}
      height={128}
      className={`shrink-0 rounded-full object-cover object-center border-[3px] border-white shadow-[0_0_0_1px_rgba(26,77,124,0.12)] ${className}`}
      onError={() => setImageError(true)}
    />
  )
}
