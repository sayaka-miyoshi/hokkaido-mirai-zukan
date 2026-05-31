import type { Post } from '@/types/post'

/** データの取得元 */
export type DataSource = 'sheet' | 'dummy' | 'error'

/** fetchPosts の返却型 */
export type FetchPostsResult = {
  posts: Post[]
  source: DataSource
  /** ユーザー向けエラーメッセージ（取得失敗時） */
  error?: string
  /** 開発者向けの詳細（コンソールログ用） */
  detail?: string
}
