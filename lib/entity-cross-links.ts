import { getClubSportCategories } from '@/lib/entity-page-posts'
import { getAreaSlug } from '@/lib/slugs'
import { getSportSlug } from '@/lib/sport-slugs'
import type { Post } from '@/types/post'
import { urls } from '@/lib/urls'

export type EntityLinkChip = {
  label: string
  href: string
  emoji: string
}

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

  const schoolNames = [...new Set(posts.map((p) => p.schoolName).filter(Boolean))]
  for (const name of schoolNames) {
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

  const clubNames = [...new Set(posts.map((p) => p.clubName).filter(Boolean))]
  for (const name of clubNames) {
    const clubPost = posts.find((p) => p.clubName === name && p.genre === '部活' && p.slug)
    if (clubPost?.slug) {
      club.set(name, clubPost.slug)
      continue
    }
    const fallback = posts.find((p) => p.clubName === name && p.slug)
    if (fallback?.slug) club.set(name, fallback.slug)
  }

  const companyNames = [
    ...new Set(
      posts.filter((p) => p.genre === '企業訪問' && p.companyName).map((p) => p.companyName),
    ),
  ]
  for (const name of companyNames) {
    const companyPost = posts.find(
      (p) => p.companyName === name && p.genre === '企業訪問' && p.slug,
    )
    if (companyPost?.slug) company.set(name, companyPost.slug)
  }

  return { school, club, company }
}

function uniqueChips(chips: EntityLinkChip[]): EntityLinkChip[] {
  const seen = new Set<string>()
  return chips.filter((chip) => {
    if (seen.has(chip.href)) return false
    seen.add(chip.href)
    return true
  })
}

const INDEX_LINKS: EntityLinkChip[] = [
  { label: '学校一覧', href: urls.schools(), emoji: '🏫' },
  { label: '部活一覧', href: urls.clubs(), emoji: '⚽' },
  { label: '競技一覧', href: urls.sports(), emoji: '🏅' },
  { label: '企業一覧', href: urls.companies(), emoji: '🏢' },
]

/** 学校ページ：部活・競技・エリアへの相互リンク */
export function getSchoolCrossLinks(
  posts: Post[],
  schoolName: string,
  clubSlugs: { name: string; slug: string }[],
): EntityLinkChip[] {
  const maps = buildSlugMaps(posts)
  const schoolPosts = posts.filter((p) => p.schoolName === schoolName)
  const chips: EntityLinkChip[] = [...INDEX_LINKS]

  for (const club of clubSlugs) {
    chips.push({ label: club.name, href: urls.club(club.slug), emoji: '⚽' })
  }

  const sports = [
    ...new Set(schoolPosts.map((p) => p.sportCategory.trim()).filter(Boolean)),
  ]
  for (const sport of sports) {
    chips.push({ label: sport, href: urls.sport(getSportSlug(sport)), emoji: '🏅' })
  }

  const areas = [...new Set(schoolPosts.map((p) => p.area.trim()).filter(Boolean))]
  for (const area of areas.slice(0, 2)) {
    chips.push({ label: area, href: urls.area(getAreaSlug(area)), emoji: '📍' })
  }

  const companies = [
    ...new Set(schoolPosts.map((p) => p.companyName.trim()).filter(Boolean)),
  ]
  for (const name of companies.slice(0, 3)) {
    const slug = maps.company.get(name)
    if (slug) chips.push({ label: name, href: urls.company(slug), emoji: '🏢' })
  }

  return uniqueChips(chips)
}

/** 部活ページ：学校・競技・関連部活への相互リンク */
export function getClubCrossLinks(posts: Post[], clubName: string): EntityLinkChip[] {
  const maps = buildSlugMaps(posts)
  const clubPosts = posts.filter((p) => p.clubName === clubName)
  const chips: EntityLinkChip[] = [
    { label: '部活一覧', href: urls.clubs(), emoji: '⚽' },
    { label: '競技一覧', href: urls.sports(), emoji: '🏅' },
  ]

  const schoolName = clubPosts.find((p) => p.schoolName.trim())?.schoolName.trim()
  if (schoolName) {
    const slug = maps.school.get(schoolName)
    if (slug) chips.push({ label: schoolName, href: urls.school(slug), emoji: '🏫' })
  }

  const sportCategories = getClubSportCategories(posts, clubName)
  for (const sport of sportCategories) {
    chips.push({ label: sport, href: urls.sport(getSportSlug(sport)), emoji: '🏅' })
  }

  const relatedClubs = [
    ...new Set(
      posts
        .filter(
          (p) =>
            p.clubName !== clubName &&
            p.genre === '部活' &&
            sportCategories.includes(p.sportCategory.trim()),
        )
        .map((p) => p.clubName.trim())
        .filter(Boolean),
    ),
  ]
  for (const name of relatedClubs.slice(0, 4)) {
    const slug = maps.club.get(name)
    if (slug) chips.push({ label: name, href: urls.club(slug), emoji: '⚽' })
  }

  return uniqueChips(chips)
}

/** 競技ページ：部活・学校・企業への相互リンク */
export function getSportCrossLinks(posts: Post[], sportName: string): EntityLinkChip[] {
  const maps = buildSlugMaps(posts)
  const sportPosts = posts.filter((p) => p.sportCategory.trim() === sportName)
  const chips: EntityLinkChip[] = [
    { label: '競技一覧', href: urls.sports(), emoji: '🏅' },
    { label: '部活一覧', href: urls.clubs(), emoji: '⚽' },
  ]

  const clubs = [...new Set(sportPosts.map((p) => p.clubName.trim()).filter(Boolean))]
  for (const name of clubs.slice(0, 6)) {
    const slug = maps.club.get(name)
    if (slug) chips.push({ label: name, href: urls.club(slug), emoji: '⚽' })
  }

  const schools = [...new Set(sportPosts.map((p) => p.schoolName.trim()).filter(Boolean))]
  for (const name of schools.slice(0, 4)) {
    const slug = maps.school.get(name)
    if (slug) chips.push({ label: name, href: urls.school(slug), emoji: '🏫' })
  }

  return uniqueChips(chips)
}

/** 企業ページ：エリア・学校・競技への相互リンク */
export function getCompanyCrossLinks(posts: Post[], companyName: string): EntityLinkChip[] {
  const maps = buildSlugMaps(posts)
  const companyPosts = posts.filter(
    (p) => p.companyName === companyName && p.genre === '企業訪問',
  )
  const chips: EntityLinkChip[] = [
    { label: '企業一覧', href: urls.companies(), emoji: '🏢' },
    { label: '学校一覧', href: urls.schools(), emoji: '🏫' },
  ]

  const areas = [...new Set(companyPosts.map((p) => p.area.trim()).filter(Boolean))]
  for (const area of areas.slice(0, 2)) {
    chips.push({ label: area, href: urls.area(getAreaSlug(area)), emoji: '📍' })
  }

  const schools = [...new Set(companyPosts.map((p) => p.schoolName.trim()).filter(Boolean))]
  for (const name of schools.slice(0, 3)) {
    const slug = maps.school.get(name)
    if (slug) chips.push({ label: name, href: urls.school(slug), emoji: '🏫' })
  }

  const sports = [...new Set(companyPosts.map((p) => p.sportCategory.trim()).filter(Boolean))]
  for (const sport of sports.slice(0, 2)) {
    chips.push({ label: sport, href: urls.sport(getSportSlug(sport)), emoji: '🏅' })
  }

  return uniqueChips(chips)
}

/** 記事詳細：関連エンティティページへのリンク */
export function getPostEntityLinks(
  post: Post,
  allPosts: Post[],
  slugs: {
    schoolSlug?: string
    clubSlug?: string
    companySlug?: string
    sportSlug?: string
    areaSlug: string
  },
): EntityLinkChip[] {
  const maps = buildSlugMaps(allPosts)
  const chips: EntityLinkChip[] = []

  if (post.schoolName.trim() && slugs.schoolSlug) {
    chips.push({
      label: post.schoolName,
      href: urls.school(slugs.schoolSlug),
      emoji: '🏫',
    })
  }
  if (post.clubName.trim() && slugs.clubSlug) {
    chips.push({
      label: post.clubName,
      href: urls.club(slugs.clubSlug),
      emoji: '⚽',
    })
  }
  if (post.sportCategory.trim() && slugs.sportSlug) {
    chips.push({
      label: post.sportCategory,
      href: urls.sport(slugs.sportSlug),
      emoji: '🏅',
    })
  }
  if (post.companyName.trim() && slugs.companySlug) {
    chips.push({
      label: post.companyName,
      href: urls.company(slugs.companySlug),
      emoji: '🏢',
    })
  }
  if (post.area.trim()) {
    chips.push({
      label: post.area,
      href: urls.area(slugs.areaSlug),
      emoji: '📍',
    })
  }

  const relatedPosts = allPosts.filter((p) => p.id !== post.id)
  const sport = post.sportCategory.trim()
  if (sport) {
    const otherClubs = [
      ...new Set(
        relatedPosts
          .filter(
            (p) =>
              p.sportCategory.trim() === sport &&
              p.clubName.trim() &&
              p.clubName !== post.clubName,
          )
          .map((p) => p.clubName.trim()),
      ),
    ]
    for (const name of otherClubs.slice(0, 3)) {
      const slug = maps.club.get(name)
      if (slug) chips.push({ label: name, href: urls.club(slug), emoji: '⚽' })
    }
  }

  // 同じ進路の他企業
  const career = post.careerCategory.trim()
  if (career) {
    const otherCompanies = [
      ...new Set(
        relatedPosts
          .filter(
            (p) =>
              p.careerCategory.trim() === career &&
              p.companyName.trim() &&
              p.companyName !== post.companyName &&
              p.genre === '企業訪問',
          )
          .map((p) => p.companyName.trim()),
      ),
    ]
    for (const name of otherCompanies.slice(0, 3)) {
      const slug = maps.company.get(name)
      if (slug) chips.push({ label: name, href: urls.company(slug), emoji: '🏢' })
    }
  }

  return uniqueChips(chips)
}

export { INDEX_LINKS }
