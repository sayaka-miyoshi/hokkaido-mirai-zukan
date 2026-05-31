import Papa from 'papaparse'
import { rowToPostByHeader } from '@/lib/data'
import { POST_CSV_HEADERS } from '@/types/post'
import type { Post } from '@/types/post'

export type CsvColumnMap = Record<(typeof POST_CSV_HEADERS)[number], number>

function normalizeHeader(header: string): string {
  return header.trim().replace(/^\uFEFF/, '')
}

/** 1行目のヘッダーから列名→インデックスのマップを生成 */
export function buildColumnMap(headers: string[]): { map: CsvColumnMap } | { error: string } {
  const normalized = headers.map(normalizeHeader)

  if (normalized.length === 0 || normalized.every((h) => !h)) {
    return { error: 'CSVにヘッダー行（1行目）がありません。' }
  }

  const missing = POST_CSV_HEADERS.filter((name) => !normalized.includes(name))
  if (missing.length > 0) {
    return {
      error: `次の列が見つかりません: ${missing.join('、')}。1行目に上記の列名を追加してください。`,
    }
  }

  const map = Object.fromEntries(
    POST_CSV_HEADERS.map((name) => [name, normalized.indexOf(name)]),
  ) as CsvColumnMap

  return { map }
}

function isEmptyRow(row: string[]): boolean {
  return row.every((cell) => !cell?.trim())
}

/** CSVテキストを Post 配列に変換（列の順序は自由、列名で照合） */
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

  const rows = result.data.slice(1).filter((row) => !isEmptyRow(row))
  const posts = rows.map((row, index) =>
    rowToPostByHeader(row, columnResult.map, String(index + 1)),
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

export { POST_CSV_HEADERS }
