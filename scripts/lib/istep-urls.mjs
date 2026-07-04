/** iSTEP 用 URL 生成（scripts 専用・本番ドメイン固定） */
export const ISTEP_SITE_URL = 'https://www.hokkaido-miraizukan.jp'

export function absPath(path) {
  return `${ISTEP_SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * iSTEP DM 用 UTM 付き URL
 * @param {string} path - サイト内パス（/sport/... 等）
 * @param {{ campaign?: string, dmGroup?: string }} [options]
 */
export function withIstepUtm(path, options = {}) {
  const url = new URL(absPath(path))
  url.searchParams.set('utm_source', 'istep')
  url.searchParams.set('utm_medium', 'dm')
  if (options.campaign) url.searchParams.set('utm_campaign', options.campaign)
  if (options.dmGroup) url.searchParams.set('dm_group', options.dmGroup)
  return url.toString()
}

export function sportPath(name) {
  return `/sport/${encodeURIComponent(name.trim())}`
}

export function schoolPath(slug) {
  return `/school/${slug}`
}

export function postPath(id) {
  return `/post/${id}`
}

export const ENTRY_URLS = {
  schools: '/schools',
  clubs: '/clubs',
  companies: '/companies',
  tourism: '/tourism',
  sports: '/sports',
  home: '/',
  /** カテゴリ選択ランディング（iSTEP 導線） */
  start: '/start',
}
