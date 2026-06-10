import type { Post } from '@/types/post'

export type HomeStats = {
  articleCount: number
  schoolCount: number
  clubCount: number
  companyCount: number
}

/** トップページ「数字で見る」用の集計 */
export function computeHomeStats(posts: Post[]): HomeStats {
  return {
    articleCount: posts.length,
    schoolCount: new Set(posts.map((post) => post.schoolName.trim()).filter(Boolean)).size,
    clubCount: new Set(posts.map((post) => post.clubName.trim()).filter(Boolean)).size,
    companyCount: new Set(posts.map((post) => post.companyName.trim()).filter(Boolean)).size,
  }
}
