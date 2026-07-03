import type { Post } from '@/types/post'
import { getAreaSlug } from '@/lib/slugs'
import { getSportSlug } from '@/lib/sport-slugs'
import { urls } from '@/lib/urls'

type SlugMaps = {
  school: Map<string, string>
  club: Map<string, string>
  company: Map<string, string>
}

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

function buildSlugMaps(posts: Post[]): SlugMaps {
  const school = new Map<string, string>()
  const club = new Map<string, string>()
  const company = new Map<string, string>()

  for (const name of [...new Set(posts.map((p) => p.schoolName).filter(Boolean))]) {
    const schoolPost = posts.find((p) => p.schoolName === name && p.genre === '学校' && p.slug)
    if (schoolPost?.slug) {
      school.set(name, schoolPost.slug)
      continue
    }
    const relatedSlugs = [
      ...new Set(posts.filter((p) => p.schoolName === name && p.slug).map((p) => p.slug)),
    ]
    const slug = longestCommonSlugPrefix(relatedSlugs)
    if (slug) school.set(name, slug)
  }

  for (const name of [...new Set(posts.map((p) => p.clubName).filter(Boolean))]) {
    const clubPost = posts.find((p) => p.clubName === name && p.genre === '部活' && p.slug)
    if (clubPost?.slug) club.set(name, clubPost.slug)
    else {
      const fallback = posts.find((p) => p.clubName === name && p.slug)
      if (fallback?.slug) club.set(name, fallback.slug)
    }
  }

  for (const name of [
    ...new Set(
      posts.filter((p) => p.genre === '企業訪問' && p.companyName).map((p) => p.companyName),
    ),
  ]) {
    const companyPost = posts.find(
      (p) => p.companyName === name && p.genre === '企業訪問' && p.slug,
    )
    if (companyPost?.slug) company.set(name, companyPost.slug)
    else {
      const fallback = posts.find((p) => p.companyName === name && p.slug)
      if (fallback?.slug) company.set(name, fallback.slug)
    }
  }

  return { school, club, company }
}

export type PrimaryEntityLink = {
  label: string
  href: string
  type: 'school' | 'club' | 'sport' | 'company' | 'area'
}

/** 記事カード用：最優先エンティティページへのリンク1件 */
export function resolvePrimaryEntityLink(
  post: Post,
  allPosts: Post[],
): PrimaryEntityLink | null {
  const maps = buildSlugMaps(allPosts)

  if (post.schoolName.trim()) {
    const slug = maps.school.get(post.schoolName)
    if (slug) {
      return { label: post.schoolName, href: urls.school(slug), type: 'school' }
    }
  }
  if (post.clubName.trim()) {
    const slug = maps.club.get(post.clubName)
    if (slug) {
      return { label: post.clubName, href: urls.club(slug), type: 'club' }
    }
  }
  if (post.companyName.trim() && post.genre === '企業訪問') {
    const slug = maps.company.get(post.companyName)
    if (slug) {
      return { label: post.companyName, href: urls.company(slug), type: 'company' }
    }
  }
  if (post.sportCategory.trim()) {
    return {
      label: post.sportCategory,
      href: urls.sport(getSportSlug(post.sportCategory)),
      type: 'sport',
    }
  }
  if (post.area.trim()) {
    return {
      label: post.area,
      href: urls.area(getAreaSlug(post.area)),
      type: 'area',
    }
  }
  return null
}

/** 人気記事・最新記事用：postId → エンティティリンク */
export function buildPrimaryEntityLinkMap(posts: Post[]): Map<string, PrimaryEntityLink> {
  const map = new Map<string, PrimaryEntityLink>()
  for (const post of posts) {
    const link = resolvePrimaryEntityLink(post, posts)
    if (link) map.set(post.id, link)
  }
  return map
}
