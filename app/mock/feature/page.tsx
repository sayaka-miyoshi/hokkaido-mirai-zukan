import type { Metadata } from 'next'
import MockEditorPicksSection from '@/components/mock/MockEditorPicksSection'
import MockFeatureHero from '@/components/mock/MockFeatureHero'
import MockPreviewBar from '@/components/mock/MockPreviewBar'
import MockThemeIndexSection from '@/components/mock/MockThemeIndexSection'
import { fetchPostsResult } from '@/lib/fetchPosts'
import { getEditorPickPosts } from '@/lib/editor-picks'
import { createPageMetadata } from '@/lib/metadata'
import { MOCK_VARIANTS } from '@/lib/mock-design'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createPageMetadata({
  title: 'モック A-3 特集扉型',
  description: 'トップページ特集扉型デザインの確認用ページです。',
  path: '/mock/feature',
  noIndex: true,
})

export default async function MockFeaturePage() {
  const { posts } = await fetchPostsResult()
  const editorPicks = getEditorPickPosts(posts)

  return (
    <div className="min-h-screen bg-white">
      <MockPreviewBar active="feature" />
      <div className="mx-auto w-full max-w-lg bg-white">
        <MockFeatureHero />
        <MockThemeIndexSection />
        <MockEditorPicksSection posts={editorPicks} />
        <footer className="border-t border-[#E8EEF2] px-6 py-10 text-center text-xs text-gray-400">
          {MOCK_VARIANTS.feature.title} — デザイン確認用
        </footer>
      </div>
    </div>
  )
}
