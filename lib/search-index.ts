/** AIチャット検索向け search-index.json の型定義 */

export type SearchDocumentType = 'post' | 'entity'

export type SearchFaqItem = {
  q: string
  a: string
}

export type SearchDocumentFilters = {
  genre?: string
  schoolName?: string
  schoolSlug?: string
  clubName?: string
  clubSlug?: string
  companyName?: string
  companySlug?: string
  sportCategory?: string
  sportSlug?: string
  careerCategory?: string
  area?: string
  areaSlug?: string
}

export type SearchDocument = {
  id: string
  type: SearchDocumentType
  title: string
  summary: string
  url: string
  genre: string
  keywords: string[]
  intents: string[]
  faq: SearchFaqItem[]
  filters: SearchDocumentFilters
  /** キーワードマッチ用（正規化済み） */
  searchText: string
  /** 将来の embedding / RAG 用テキスト */
  embeddingText: string
  relatedEntityIds: string[]
  publishedAt: string
  postId?: string
}

export type SearchEntityIndex = {
  id: string
  name: string
  slug: string
  url: string
  postIds: string[]
  keywords: string[]
}

export type SearchIntentRule = {
  careerCategory?: string
  sportCategory?: string
  genre?: string
  schoolName?: string
  keywords: string[]
  relatedIntents?: string[]
}

export type SearchIndex = {
  version: 1
  generatedAt: string
  documentCount: number
  documents: SearchDocument[]
  entities: {
    schools: SearchEntityIndex[]
    clubs: SearchEntityIndex[]
    sports: SearchEntityIndex[]
    companies: SearchEntityIndex[]
    areas: SearchEntityIndex[]
  }
  intentTaxonomy: Record<string, SearchIntentRule>
}

export const SEARCH_INDEX_PATH = '/data/search-index.json'
