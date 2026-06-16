import type { Post } from '@/types/post'
import { parsePostDate } from '@/lib/dates'

/** 進路カテゴリ（H列）— 表示名の完全一致 */
export const OPEN_CAMPUS_CAREER_CATEGORY = 'オープンキャンパス'

/** 動画カテゴリ（G列）— マスターID */
export const OPEN_CAMPUS_VIDEO_CATEGORY_ID = 'open-campus'

/**
 * オープンキャンパス特集に該当するか
 *
 * G列: 動画カテゴリが `open-campus`（CSV入力「オープンキャンパス」も正規化後に一致）
 * H列: 進路カテゴリが「オープンキャンパス」と完全一致
 *
 * どちらか一方を満たせば表示（ジャンルは絞らない）
 */
export function isOpenCampusPost(post: Post): boolean {
  if (!post.isPublished) return false

  if (post.careerCategory.trim() === OPEN_CAMPUS_CAREER_CATEGORY) {
    return true
  }

  if (post.videoCategory === OPEN_CAMPUS_VIDEO_CATEGORY_ID) {
    return true
  }

  const videoLabel = post.videoCategoryLabel.trim()
  if (videoLabel === OPEN_CAMPUS_CAREER_CATEGORY) {
    return true
  }

  // enrich 前の生値（表示名がそのまま入っている場合）
  if (post.videoCategory.trim() === OPEN_CAMPUS_CAREER_CATEGORY) {
    return true
  }

  return false
}

/**
 * オープンキャンパス特集 — 記事一覧
 * - 公開 = true
 * - G列またはH列がオープンキャンパス（上記 isOpenCampusPost）
 * - 投稿日の新しい順
 */
export function getOpenCampusPosts(posts: Post[]): Post[] {
  return posts.filter(isOpenCampusPost).sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date))
}
