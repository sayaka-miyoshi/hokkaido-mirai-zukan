import { fetchPosts, fetchPostsResult } from '@/lib/fetchPosts'
import { findAreaNameBySlug, getAreaName, getAreaSlug, isKnownAreaSlug } from '@/lib/slugs'
import { getSportNameFromSlug, getSportSlug } from '@/lib/sport-slugs'
import type { FetchPostsResult } from '@/types/fetch-result'
import type { Post } from '@/types/post'

export type SchoolIndexItem = {
  name: string
  slug: string
  postCount: number
  areas: string[]
}

export type ClubIndexItem = {
  name: string
  slug: string
  schoolName: string
  postCount: number
}

export type SportIndexItem = {
  name: string
  slug: string
  postCount: number
}

/** 複数 slug の共通プレフィックスから学校スラッグを推定 */
function longestCommonSlugPrefix(slugs: string[]): string | undefined {
  const valid = slugs.filter(Boolean)
  if (valid.length === 0) return undefined

  if (valid.length === 1) {
    const parts = valid[0].split('-')
    if (parts.length >= 3) return parts.slice(0, -1).join('-')
    return valid[0]
  }

  const split = valid.map((s) => s.split('-'))
  const minLen = Math.min(...split.map((p) => p.length))
  let i = 0
  while (i < minLen && split.every((p) => p[i] === split[0][i])) i++
  if (i === 0) return undefined
  return split[0].slice(0, i).join('-')
}

/** 学校ページ用スラッグ（学校紹介行優先、なければ部活等の slug から推定） */
function resolveSchoolSlug(posts: Post[], schoolName: string): string | undefined {
  const schoolPost = posts.find(
    (p) => p.schoolName === schoolName && p.genre === '学校' && p.slug,
  )
  if (schoolPost?.slug) return schoolPost.slug

  const relatedSlugs = [
    ...new Set(
      posts
        .filter((p) => p.schoolName === schoolName && p.slug)
        .map((p) => p.slug),
    ),
  ]
  return longestCommonSlugPrefix(relatedSlugs)
}

function getRelatedClubsForSchool(
  posts: Post[],
  schoolName: string,
): { name: string; slug: string }[] {
  const clubNames = [
    ...new Set(
      posts
        .filter((p) => p.schoolName === schoolName && p.clubName.trim())
        .map((p) => p.clubName),
    ),
  ]

  return clubNames.flatMap((name) => {
    const slug = resolveClubSlug(posts, name)
    return slug ? [{ name, slug }] : []
  })
}

export type SchoolPageResult = {
  name: string
  posts: Post[]
  clubs: { name: string; slug: string }[]
}

/** 部活ページ用スラッグ（ジャンル「部活」優先、部活名+slug 行も対象） */
function resolveClubSlug(posts: Post[], clubName: string): string | undefined {
  const clubPost = posts.find(
    (p) => p.clubName === clubName && p.genre === '部活' && p.slug,
  )
  if (clubPost) return clubPost.slug
  const fallback = posts.find((p) => p.clubName === clubName && p.slug)
  return fallback?.slug
}

/** 企業ページ用スラッグ（ジャンル「企業訪問」の行のみ） */
function resolveCompanySlug(posts: Post[], companyName: string): string | undefined {
  const companyPost = posts.find(
    (p) => p.companyName === companyName && p.genre === '企業訪問' && p.slug,
  )
  if (companyPost?.slug) return companyPost.slug
  return posts.find((p) => p.companyName === companyName && p.slug)?.slug
}

export async function getFetchResult(): Promise<FetchPostsResult> {
  return fetchPostsResult()
}

export async function getAllPosts(): Promise<Post[]> {
  return fetchPosts()
}

export async function getPostById(id: string): Promise<Post | undefined> {
  const posts = await getAllPosts()
  return posts.find((post) => post.id === id)
}

export async function getPostsByAreaSlug(
  slug: string,
): Promise<{ areaName: string; posts: Post[] } | undefined> {
  const posts = await getAllPosts()
  const areas = [...new Set(posts.map((p) => p.area).filter(Boolean))]
  const areaName = getAreaName(slug) ?? findAreaNameBySlug(slug, areas)
  if (!areaName) return undefined

  const filtered = posts.filter((post) => getAreaSlug(post.area) === slug)
  if (filtered.length === 0) return undefined

  return { areaName, posts: filtered }
}

export async function getPostsBySchoolSlug(
  slug: string,
): Promise<SchoolPageResult | undefined> {
  const posts = await getAllPosts()
  const schoolNames = [...new Set(posts.map((p) => p.schoolName).filter(Boolean))]
  const schoolName = schoolNames.find((name) => resolveSchoolSlug(posts, name) === slug)
  if (!schoolName) return undefined
  return {
    name: schoolName,
    posts: posts.filter((post) => post.schoolName === schoolName),
    clubs: getRelatedClubsForSchool(posts, schoolName),
  }
}

export async function getPostsByClubSlug(
  slug: string,
): Promise<{ name: string; posts: Post[] } | undefined> {
  const posts = await getAllPosts()
  const clubNames = [...new Set(posts.map((p) => p.clubName).filter(Boolean))]
  const clubName = clubNames.find((name) => resolveClubSlug(posts, name) === slug)
  if (!clubName) return undefined
  return {
    name: clubName,
    posts: posts.filter((post) => post.clubName === clubName),
  }
}

export async function getPostsByCompanySlug(
  slug: string,
): Promise<{ name: string; posts: Post[] } | undefined> {
  const posts = await getAllPosts()
  const companyNames = [...new Set(posts.map((p) => p.companyName).filter(Boolean))]
  const companyName = companyNames.find((name) => resolveCompanySlug(posts, name) === slug)
  if (!companyName) return undefined
  return {
    name: companyName,
    posts: posts.filter((post) => post.companyName === companyName),
  }
}

export async function getAllAreaSlugs(): Promise<string[]> {
  const posts = await getAllPosts()
  return [...new Set(posts.map((post) => getAreaSlug(post.area)))]
}

export async function getAllSchoolSlugs(): Promise<string[]> {
  const posts = await getAllPosts()
  const names = [...new Set(posts.map((p) => p.schoolName).filter(Boolean))]
  return names
    .map((name) => resolveSchoolSlug(posts, name))
    .filter((slug): slug is string => Boolean(slug))
}

export async function getAllClubSlugs(): Promise<string[]> {
  const posts = await getAllPosts()
  const names = [...new Set(posts.map((p) => p.clubName).filter(Boolean))]
  return names
    .map((name) => resolveClubSlug(posts, name))
    .filter((slug): slug is string => Boolean(slug))
}

export async function getAllCompanySlugs(): Promise<string[]> {
  const posts = await getAllPosts()
  const names = [...new Set(posts.map((p) => p.companyName).filter(Boolean))]
  return names
    .map((name) => resolveCompanySlug(posts, name))
    .filter((slug): slug is string => Boolean(slug))
}

export async function getSchoolIndex(): Promise<SchoolIndexItem[]> {
  const posts = await getAllPosts()
  const names = [...new Set(posts.map((p) => p.schoolName).filter(Boolean))]
  return names
    .map((name) => {
      const slug = resolveSchoolSlug(posts, name)
      if (!slug) return null
      const related = posts.filter((p) => p.schoolName === name)
      return {
        name,
        slug,
        postCount: related.length,
        areas: [...new Set(related.map((p) => p.area).filter(Boolean))],
      }
    })
    .filter((item): item is SchoolIndexItem => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name, 'ja'))
}

export async function getClubIndex(): Promise<ClubIndexItem[]> {
  const posts = await getAllPosts()
  const pairs = new Map<string, { club: string; school: string }>()
  for (const p of posts) {
    if (!p.clubName.trim()) continue
    const key = `${p.clubName}|${p.schoolName}`
    pairs.set(key, { club: p.clubName, school: p.schoolName })
  }

  return [...pairs.values()]
    .map(({ club, school }) => {
      const slug = resolveClubSlug(posts, club)
      if (!slug) return null
      return {
        name: club,
        slug,
        schoolName: school,
        postCount: posts.filter((p) => p.clubName === club && p.schoolName === school).length,
      }
    })
    .filter((item): item is ClubIndexItem => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name, 'ja'))
}

export async function getSportIndex(): Promise<SportIndexItem[]> {
  const posts = await getAllPosts()
  const names = [...new Set(posts.map((p) => p.sportCategory.trim()).filter(Boolean))]
  return names
    .map((name) => ({
      name,
      slug: getSportSlug(name),
      postCount: posts.filter((p) => p.sportCategory.trim() === name).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ja'))
}

export async function getPostsBySportSlug(
  slug: string,
): Promise<{ name: string; posts: Post[] } | undefined> {
  const posts = await getAllPosts()
  const name = getSportNameFromSlug(slug)
  const filtered = posts.filter((p) => p.sportCategory.trim() === name)
  if (filtered.length === 0) return undefined
  return { name, posts: filtered }
}

export async function getAllSportSlugs(): Promise<string[]> {
  const items = await getSportIndex()
  return items.map((item) => item.slug)
}

export async function getSchoolSlugForPost(post: Post, posts?: Post[]): Promise<string | undefined> {
  if (!post.schoolName) return undefined
  const all = posts ?? (await getAllPosts())
  return resolveSchoolSlug(all, post.schoolName)
}

export async function getClubSlugForPost(post: Post, posts?: Post[]): Promise<string | undefined> {
  if (!post.clubName) return undefined
  const all = posts ?? (await getAllPosts())
  return resolveClubSlug(all, post.clubName)
}

export async function getCompanySlugForPost(post: Post, posts?: Post[]): Promise<string | undefined> {
  if (!post.companyName) return undefined
  const all = posts ?? (await getAllPosts())
  return resolveCompanySlug(all, post.companyName)
}

export { isKnownAreaSlug }
