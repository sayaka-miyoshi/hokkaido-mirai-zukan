import type { Metadata } from 'next'
import MockCoverHero from '@/components/mock/MockCoverHero'
import MockEditorPicksSection from '@/components/mock/MockEditorPicksSection'
import MockPreviewBar from '@/components/mock/MockPreviewBar'
import { fetchPostsResult } from '@/lib/fetchPosts'
import { getEditorPickPosts } from '@/lib/editor-picks'
import { createPageMetadata } from '@/lib/metadata'
import { MOCK_VARIANTS } from '@/lib/mock-design'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createPageMetadata({
  title: 'モック A-1 表紙型',
  description: 'トップページ表紙型デザインの確認用ページです。',
  path: '/mock/cover',
  noIndex: true,
})

export default async function MockCoverPage() {
  const { posts } = await fetchPostsResult()
  const editorPicks = getEditorPickPosts(posts)

  return (
    <div className="min-h-screen bg-white">
      <MockPreviewBar active="cover" />
      <div className="mx-auto w-full max-w-lg bg-white">
        <MockCoverHero />
        <MockEditorPicksSection posts={editorPicks} />
        <footer className="border-t border-[#E8EEF2] px-6 py-10 text-center text-xs text-gray-400">
          {MOCK_VARIANTS.cover.title} — デザイン確認用
        </footer>
      </div>
    </div>
  )
}
