import type { Metadata } from 'next'
import { fetchPostsResult } from '@/lib/fetchPosts'
import JsonLd from '@/components/JsonLd'
import SearchContainer from '@/components/SearchContainer'
import { createWebSiteJsonLd } from '@/lib/json-ld'
import { createPageMetadata } from '@/lib/metadata'
import { buildPrimaryEntityLinkMap } from '@/lib/post-primary-entity-link'
import { SITE_NAME } from '@/lib/site'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createPageMetadata({
  title: SITE_NAME,
  description:
    '北海道の学校・部活・企業・地域の魅力を取材して届けるWebマガジン。進路選択や企業研究に役立つ記事を、エリアや競技から探せます。',
  path: urls.home(),
  absoluteTitle: true,
})

export default async function Home() {
  const { posts, source, error } = await fetchPostsResult()
  const entityLinkMap = Object.fromEntries(buildPrimaryEntityLinkMap(posts))

  return (
    <>
      <JsonLd data={createWebSiteJsonLd()} />
      <SearchContainer
        posts={posts}
        dataSource={source}
        dataError={error}
        entityLinkMap={entityLinkMap}
      />
    </>
  )
}
