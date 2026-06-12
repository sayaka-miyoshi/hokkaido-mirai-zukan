import { STORY_ALT, STORY_IMAGES } from '@/lib/story-assets'
import { SITE_NAME } from '@/lib/site'

/** ① Hero — ストーリー01画像を大きく表示（H1はSEO用に非表示） */
export default function TopHero() {
  return (
    <header className="bg-white px-4 pt-6 pb-4">
      <h1 className="sr-only">{SITE_NAME}</h1>
      <img
        src={STORY_IMAGES.story01}
        alt={STORY_ALT.story01}
        className="mx-auto w-full max-w-lg rounded-2xl"
        width={1080}
        height={1920}
        fetchPriority="high"
      />
    </header>
  )
}
