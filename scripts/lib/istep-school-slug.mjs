/** 学校スラッグ推定（lib/queries.ts と同等ロジック） */

function longestCommonSlugPrefix(slugs) {
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

export function resolveSchoolSlug(posts, schoolName) {
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

export function resolveCompanySlug(posts, companyName) {
  const companyPost = posts.find(
    (p) => p.companyName === companyName && p.genre === '企業訪問' && p.slug,
  )
  if (companyPost?.slug) return companyPost.slug
  return posts.find((p) => p.companyName === companyName && p.slug)?.slug
}
