import FadeInSection from '@/components/home/FadeInSection'
import { DESIGN_IMAGE_CLASS } from '@/lib/home-layout'

type StoryImageBlockProps = {
  id: string
  src: string
  alt: string
  /** Hero直後など、初見表示のためアニメーション省略可 */
  animate?: boolean
}

/** ストーリー画像ブロック（デザイン崩さずフル幅表示） */
export default function StoryImageBlock({
  id,
  src,
  alt,
  animate = true,
}: StoryImageBlockProps) {
  const image = (
    <img
      src={src}
      alt={alt}
      className={DESIGN_IMAGE_CLASS}
      loading="lazy"
      decoding="async"
    />
  )

  if (!animate) {
    return (
      <section id={id} aria-label={alt} className="bg-white px-4 py-10">
        {image}
      </section>
    )
  }

  return (
    <FadeInSection id={id} aria-label={alt} className="bg-white px-4 py-10">
      {image}
    </FadeInSection>
  )
}
