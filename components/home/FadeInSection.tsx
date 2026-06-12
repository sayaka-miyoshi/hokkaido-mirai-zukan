'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type FadeInSectionProps = {
  children: ReactNode
  className?: string
  id?: string
  'aria-label'?: string
}

/** スクロール時 fade-up（控えめ） */
export default function FadeInSection({
  children,
  className = '',
  id,
  'aria-label': ariaLabel,
}: FadeInSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      id={id}
      aria-label={ariaLabel}
      className={`fade-up ${visible ? 'fade-up-visible' : ''} ${className}`.trim()}
    >
      {children}
    </section>
  )
}
