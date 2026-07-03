import type { Post } from '@/types/post'

const GENRE_COMPANY = '企業訪問'
const GENRE_SCHOOL = '学校'
const GENRE_CLUB = '部活'

const EXCLUDED_COMPANY_RELATED_GENRES = new Set([GENRE_SCHOOL, GENRE_CLUB])

/** 企業ページのメイン一覧（企業訪問かつ companyName 一致） */
export function isCompanyVisitPost(post: Post, companyName: string): boolean {
  return post.companyName === companyName && post.genre === GENRE_COMPANY
}

export function partitionCompanyPagePosts(
  posts: Post[],
  companyName: string,
): { companyPosts: Post[]; relatedPosts: Post[] } {
  const companyPosts = posts.filter((post) => isCompanyVisitPost(post, companyName))
  const relatedPosts = posts.filter(
    (post) =>
      post.companyName === companyName &&
      post.genre !== GENRE_COMPANY &&
      !EXCLUDED_COMPANY_RELATED_GENRES.has(post.genre),
  )
  return { companyPosts, relatedPosts }
}

export function collectCompanyNames(posts: Post[]): string[] {
  return [
    ...new Set(
      posts
        .filter((post) => post.genre === GENRE_COMPANY && post.companyName)
        .map((post) => post.companyName),
    ),
  ]
}

/** 学校ページ：schoolName 一致のみ（企業訪問は除外） */
export function filterSchoolPagePosts(posts: Post[], schoolName: string): Post[] {
  return posts.filter((post) => post.schoolName === schoolName && post.genre !== GENRE_COMPANY)
}

export function collectSchoolNames(posts: Post[]): string[] {
  return [...new Set(posts.map((post) => post.schoolName).filter(Boolean))]
}

/** 部活の競技カテゴリ（部活名が一致する行から取得） */
export function getClubSportCategories(posts: Post[], clubName: string): string[] {
  return [
    ...new Set(
      posts
        .filter((post) => post.clubName === clubName && post.sportCategory.trim())
        .map((post) => post.sportCategory.trim()),
    ),
  ]
}

/** 部活ページ：clubName 一致をメイン、同一 sportCategory の部活記事を関連 */
export function partitionClubPagePosts(
  posts: Post[],
  clubName: string,
): { clubPosts: Post[]; relatedPosts: Post[] } {
  const sportCategories = getClubSportCategories(posts, clubName)

  const clubPosts = posts.filter(
    (post) =>
      post.clubName === clubName && post.genre !== GENRE_COMPANY && post.genre !== GENRE_SCHOOL,
  )

  const relatedPosts =
    sportCategories.length === 0
      ? []
      : posts.filter(
          (post) =>
            post.clubName !== clubName &&
            post.genre === GENRE_CLUB &&
            sportCategories.includes(post.sportCategory.trim()),
        )

  return { clubPosts, relatedPosts }
}

export function collectClubNames(posts: Post[]): string[] {
  return [...new Set(posts.map((post) => post.clubName).filter(Boolean))]
}

/** 競技ページ：sportCategory 一致のみ（企業訪問は除外） */
export function filterSportPagePosts(posts: Post[], sportName: string): Post[] {
  return posts.filter(
    (post) => post.sportCategory.trim() === sportName && post.genre !== GENRE_COMPANY,
  )
}

export function collectSportNames(posts: Post[]): string[] {
  return [...new Set(posts.map((post) => post.sportCategory.trim()).filter(Boolean))]
}
