import type { Metadata } from 'next'
import { fetchPostsResult } from '@/lib/fetchPosts'
import JsonLd from '@/components/JsonLd'
import SearchContainer from '@/components/SearchContainer'
import { createWebSiteJsonLd } from '@/lib/json-ld'
import { createPageMetadata } from '@/lib/metadata'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createPageMetadata({
  title: SITE_NAME,
  description: SITE_TAGLINE,
  path: urls.home(),
  absoluteTitle: true,
})

export default async function Home() {
  const { posts, source, error } = await fetchPostsResult()
  return (
    <>
      <JsonLd data={createWebSiteJsonLd()} />
      <SearchContainer posts={posts} dataSource={source} dataError={error} />
    </>
  )
}
