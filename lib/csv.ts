import Papa from 'papaparse'
import { rowToPostByHeader } from '@/lib/data'
import {
  POST_OPTIONAL_CSV_HEADERS,
  POST_REQUIRED_CSV_HEADERS,
  type PostRequiredCsvColumnName,
  type PostOptionalCsvColumnName,
} from '@/types/post'
import type { Post } from '@/types/post'

/** 必須列 → CSV行内 index */
export type CsvColumnMap = Record<PostRequiredCsvColumnName, number>

/** 任意列 → CSV行内 index（列が無い場合は undefined） */
export type CsvOptionalColumnMap = Partial<Record<PostOptionalCsvColumnName, number>>

function normalizeHeader(header: string): string {
  return header.trim().replace(/^\uFEFF/, '')
}

/** 1行目のヘッダーから列名→インデックスのマップを生成（列順・追加列に非依存） */
export function buildColumnMap(
  headers: string[],
): { map: CsvColumnMap; optionalMap: CsvOptionalColumnMap } | { error: string } {
  const normalized = headers.map(normalizeHeader)

  if (normalized.length === 0 || normalized.every((h) => !h)) {
    return { error: 'CSVにヘッダー行（1行目）がありません。' }
  }

  const seen = new Set<string>()
  for (const name of normalized) {
    if (!name) continue
    if (seen.has(name)) {
      return { error: `列名「${name}」が重複しています。1行目の列名は一意にしてください。` }
    }
    seen.add(name)
  }

  const missing = POST_REQUIRED_CSV_HEADERS.filter((name) => !normalized.includes(name))
  if (missing.length > 0) {
    return {
      error: `次の必須列が見つかりません: ${missing.join('、')}。1行目に上記の列名を追加してください。`,
    }
  }

  const map = Object.fromEntries(
    POST_REQUIRED_CSV_HEADERS.map((name) => [name, normalized.indexOf(name)]),
  ) as CsvColumnMap

  const optionalMap = Object.fromEntries(
    POST_OPTIONAL_CSV_HEADERS.filter((name) => normalized.includes(name)).map((name) => [
      name,
      normalized.indexOf(name),
    ]),
  ) as CsvOptionalColumnMap

  /** 旧列名（学校Instagram 等）→ 新列名（学校SNS 等）の互換 */
  const SNS_LEGACY_COLUMNS: Partial<Record<PostOptionalCsvColumnName, string>> = {
    学校SNS: '学校Instagram',
    部活SNS: '部活Instagram',
    企業SNS: '企業Instagram',
  }
  for (const [newName, legacyName] of Object.entries(SNS_LEGACY_COLUMNS)) {
    const key = newName as PostOptionalCsvColumnName
    if (optionalMap[key] == null && normalized.includes(legacyName)) {
      optionalMap[key] = normalized.indexOf(legacyName)
    }
  }

  return { map, optionalMap }
}

function isEmptyRow(row: string[]): boolean {
  return row.every((cell) => !cell?.trim())
}

/** CSVテキストを Post 配列に変換（列名キーで取得・順序自由） */
export function parsePostsCsv(text: string): { posts: Post[] } | { error: string; detail?: string } {
  const result = Papa.parse<string[]>(text, { skipEmptyLines: true })

  if (result.errors.length > 0) {
    return {
      error: 'CSVの形式が正しくありません。',
      detail: result.errors[0]?.message,
    }
  }

  if (result.data.length === 0) {
    return { error: 'CSVにデータがありません。' }
  }

  const columnResult = buildColumnMap(result.data[0])
  if ('error' in columnResult) {
    return { error: columnResult.error }
  }

  const titleCol = columnResult.map['投稿タイトル']
  const rows = result.data.slice(1).filter((row) => {
    if (isEmptyRow(row)) return false
    return Boolean(row[titleCol]?.trim())
  })
  const posts = rows.map((row, index) =>
    rowToPostByHeader(row, columnResult.map, columnResult.optionalMap, String(index + 1)),
  )

  return { posts }
}

/** GoogleスプレッドシートのURLをCSV取得用URLに正規化 */
export function normalizeSheetCsvUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed

  if (trimmed.includes('output=csv') || trimmed.includes('format=csv')) {
    return trimmed
  }

  const sheetIdMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (sheetIdMatch) {
    const gidMatch = trimmed.match(/[#?&]gid=(\d+)/)
    const gid = gidMatch?.[1] ?? '0'
    return `https://docs.google.com/spreadsheets/d/${sheetIdMatch[1]}/export?format=csv&gid=${gid}`
  }

  return trimmed
}

export { POST_REQUIRED_CSV_HEADERS, POST_OPTIONAL_CSV_HEADERS }
