'use client'

import type { ReactNode } from 'react'

type PostClickTrackerProps = {
  children: ReactNode
  onPostClick: (postId: string, position: number) => void
}

/** 子要素内の /post/[id] リンククリックを委譲で捕捉 */
export default function PostClickTracker({ children, onPostClick }: PostClickTrackerProps) {
  return (
    <div
      onClick={(event) => {
        const target = event.target as HTMLElement
        const anchor = target.closest('a[href*="/post/"]') as HTMLAnchorElement | null
        if (!anchor) return

        const match = anchor.getAttribute('href')?.match(/\/post\/([^/?#]+)/)
        if (!match?.[1]) return

        const card = anchor.closest('[data-post-index]')
        const position = card ? Number(card.getAttribute('data-post-index') ?? '0') : 0
        onPostClick(match[1], Number.isFinite(position) ? position : 0)
      }}
    >
      {children}
    </div>
  )
}
