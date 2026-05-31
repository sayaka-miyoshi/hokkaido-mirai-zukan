import { fetchPosts, fetchPostsResult } from '@/lib/fetchPosts'
import { CLUB_SLUGS, COMPANY_SLUGS, SCHOOL_SLUGS } from '@/lib/entity-slugs'
import { getAreaName, getAreaSlug, isValidAreaSlug } from '@/lib/slugs'
import type { FetchPostsResult } from '@/types/fetch-result'
import type { Post } from '@/types/post'

function resolveSchoolSlug(posts: Post[], schoolName: string): string | undefined {
  const primary = posts.find((p) => p.schoolName === schoolName && p.genre === '学校' && p.slug)
  if (primary) return primary.slug
  if (SCHOOL_SLUGS[schoolName]) return SCHOOL_SLUGS[schoolName]
  const fallback = posts.find((p) => p.schoolName === schoolName && p.slug)
  return fallback?.slug
}

function resolveClubSlug(posts: Post[], clubName: string): string | undefined {
  const primary = posts.find((p) => p.clubName === clubName && p.genre === '部活' && p.slug)
  if (primary) return primary.slug
  if (CLUB_SLUGS[clubName]) return CLUB_SLUGS[clubName]
  const fallback = posts.find((p) => p.clubName === clubName && p.slug)
  return fallback?.slug
}

function resolveCompanySlug(posts: Post[], companyName: string): string | undefined {
  const primary = posts.find((p) => p.companyName === companyName && p.genre === '企業訪問' && p.slug)
  if (primary) return primary.slug
  if (COMPANY_SLUGS[companyName]) return COMPANY_SLUGS[companyName]
  const fallback = posts.find((p) => p.companyName === companyName && p.slug)
  return fallback?.slug
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

export async function getPostsByAreaSlug(slug: string): Promise<{ areaName: string; posts: Post[] } | undefined> {
  if (!isValidAreaSlug(slug)) return undefined
  const areaName = getAreaName(slug)!
  const posts = (await getAllPosts()).filter((post) => getAreaSlug(post.area) === slug)
  return { areaName, posts }
}

export async function getPostsBySchoolSlug(slug: string): Promise<{ name: string; posts: Post[] } | undefined> {
  const posts = await getAllPosts()
  const schoolNames = [...new Set(posts.map((p) => p.schoolName).filter(Boolean))]
  const schoolName = schoolNames.find((name) => resolveSchoolSlug(posts, name) === slug)
  if (!schoolName) return undefined
  return {
    name: schoolName,
    posts: posts.filter((post) => post.schoolName === schoolName),
  }
}

export async function getPostsByClubSlug(slug: string): Promise<{ name: string; posts: Post[] } | undefined> {
  const posts = await getAllPosts()
  const clubNames = [...new Set(posts.map((p) => p.clubName).filter(Boolean))]
  const clubName = clubNames.find((name) => resolveClubSlug(posts, name) === slug)
  if (!clubName) return undefined
  return {
    name: clubName,
    posts: posts.filter((post) => post.clubName === clubName),
  }
}

export async function getPostsByCompanySlug(slug: string): Promise<{ name: string; posts: Post[] } | undefined> {
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
  return Object.values(
    Object.fromEntries(
      (await getAllPosts()).map((post) => [getAreaSlug(post.area), getAreaSlug(post.area)]),
    ),
  )
}

export async function getAllSchoolSlugs(): Promise<string[]> {
  const posts = await getAllPosts()
  const names = [...new Set(posts.map((p) => p.schoolName).filter(Boolean))]
  return names.map((name) => resolveSchoolSlug(posts, name)).filter((slug): slug is string => Boolean(slug))
}

export async function getAllClubSlugs(): Promise<string[]> {
  const posts = await getAllPosts()
  const names = [...new Set(posts.map((p) => p.clubName).filter(Boolean))]
  return names.map((name) => resolveClubSlug(posts, name)).filter((slug): slug is string => Boolean(slug))
}

export async function getAllCompanySlugs(): Promise<string[]> {
  const posts = await getAllPosts()
  const names = [...new Set(posts.map((p) => p.companyName).filter(Boolean))]
  return names.map((name) => resolveCompanySlug(posts, name)).filter((slug): slug is string => Boolean(slug))
}

export async function getAllPostIds(): Promise<string[]> {
  return (await getAllPosts()).map((post) => post.id)
}

export async function getSchoolSlugForPost(post: Post, posts?: Post[]): Promise<string | undefined> {
  if (!post.schoolName) return undefined
  const all = posts ?? await getAllPosts()
  return resolveSchoolSlug(all, post.schoolName)
}

export async function getClubSlugForPost(post: Post, posts?: Post[]): Promise<string | undefined> {
  if (!post.clubName) return undefined
  const all = posts ?? await getAllPosts()
  return resolveClubSlug(all, post.clubName)
}

export async function getCompanySlugForPost(post: Post, posts?: Post[]): Promise<string | undefined> {
  if (!post.companyName) return undefined
  const all = posts ?? await getAllPosts()
  return resolveCompanySlug(all, post.companyName)
}
