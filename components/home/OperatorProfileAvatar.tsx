'use client'

import { useState } from 'react'
import { PROFILE_IMAGE_PATH } from '@/lib/branding-paths'
import { OPERATOR } from '@/lib/site'

/** 運営者プロフィール（Instagram風・丸型 104px） */
export default function OperatorProfileAvatar() {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return (
      <div
        aria-hidden="true"
        className="flex h-[104px] w-[104px] items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-hokkaido-ice to-hokkaido-sky/30 text-4xl shadow-[0_0_0_1px_rgba(26,77,124,0.12)]"
      >
        🗻
      </div>
    )
  }

  return (
    <img
      src={PROFILE_IMAGE_PATH}
      alt={`${OPERATOR.name}のプロフィール写真`}
      width={104}
      height={104}
      className="h-[104px] w-[104px] shrink-0 rounded-full object-cover object-center border-[3px] border-white shadow-[0_0_0_1px_rgba(26,77,124,0.12)]"
      onError={() => setImageError(true)}
    />
  )
}
