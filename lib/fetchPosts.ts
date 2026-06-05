import { cache } from 'react'
import { DUMMY_POSTS } from '@/lib/data'
import { normalizeSheetCsvUrl, parsePostsCsv } from '@/lib/csv'
import { enrichPostsImages } from '@/lib/enrich-images'
import { filterPublishedPosts } from '@/lib/publish-status'
import type { FetchPostsResult } from '@/types/fetch-result'
import type { Post } from '@/types/post'

export type { Post }
export type { FetchPostsResult, DataSource } from '@/types/fetch-result'

const FETCH_ERROR_MESSAGE =
  'スプレッドシートのデータを取得できませんでした。URL・公開設定・列名を確認してください。'

const SCREENSHOT_SAMPLE_LINKS = {
  schoolOfficialSite: 'https://www.hokudai.ac.jp',
  schoolSns: 'https://www.instagram.com/hokkaido_university',
  clubSns: 'https://www.instagram.com/example_club',
  recruitmentInfoUrl: 'https://example.com/recruit',
} as const

/** スクリーンショット確認用（SCREENSHOT_SAMPLE_LINKS=1 のときのみ） */
function applyScreenshotSampleLinks(posts: Post[]): Post[] {
  if (process.env.SCREENSHOT_SAMPLE_LINKS !== '1') return posts

  const targetIndex = posts.findIndex((post) => post.genre === '部活' || post.clubName.trim())
  if (targetIndex === -1) return posts

  return posts.map((post, index) =>
    index === targetIndex
      ? {
          ...post,
          ...SCREENSHOT_SAMPLE_LINKS,
          recruitmentInfo: post.recruitmentInfo.trim() || '新入部員募集中',
        }
      : post,
  )
}

/** リクエストごとに1回だけCSVを取得（React cache） */
export const fetchPostsResult = cache(async (): Promise<FetchPostsResult> => {
  const rawUrl = process.env.NEXT_PUBLIC_SHEET_CSV_URL?.trim()

  if (!rawUrl) {
    return {
      posts: applyScreenshotSampleLinks(
        await enrichPostsImages(filterPublishedPosts(DUMMY_POSTS)),
      ),
      source: 'dummy',
    }
  }

  const url = normalizeSheetCsvUrl(rawUrl)

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { 'Accept': 'text/csv,text/plain,*/*' },
    })

    if (!res.ok) {
      console.error('[fetchPosts] HTTP error:', res.status, res.statusText)
      return {
        posts: [],
        source: 'error',
        error: FETCH_ERROR_MESSAGE,
        detail: `HTTP ${res.status}: ${res.statusText}`,
      }
    }

    const text = await res.text()
    const parsed = parsePostsCsv(text)

    if ('error' in parsed) {
      console.error('[fetchPosts] CSV parse error:', parsed.error, parsed.detail ?? '')
      return {
        posts: [],
        source: 'error',
        error: parsed.error,
        detail: parsed.detail,
      }
    }

    if (parsed.posts.length === 0) {
      return {
        posts: [],
        source: 'error',
        error: 'スプレッドシートに投稿データがありません。2行目以降にデータを入力してください。',
      }
    }

    return {
      posts: applyScreenshotSampleLinks(
        await enrichPostsImages(filterPublishedPosts(parsed.posts)),
      ),
      source: 'sheet',
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    console.error('[fetchPosts] Network error:', detail)
    return {
      posts: [],
      source: 'error',
      error: FETCH_ERROR_MESSAGE,
      detail,
    }
  }
})

/** 投稿一覧のみ取得 */
export async function fetchPosts(): Promise<Post[]> {
  const result = await fetchPostsResult()
  return result.posts
}
