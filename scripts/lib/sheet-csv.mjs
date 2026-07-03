import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import Papa from 'papaparse'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function normalizeHeader(header) {
  return String(header ?? '').trim().replace(/^\uFEFF/, '')
}

export function loadSheetCsvUrl(envPath) {
  const path = envPath ?? resolve(__dirname, '../../.env.local')
  try {
    const text = readFileSync(path, 'utf8')
    const match = text.match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)
    return match?.[1]?.trim().replace(/^["']|["']$/g, '') ?? ''
  } catch {
    return ''
  }
}

export function normalizeSheetCsvUrl(url) {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  if (trimmed.includes('output=csv') || trimmed.includes('format=csv')) return trimmed
  const sheetIdMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (sheetIdMatch) {
    const gidMatch = trimmed.match(/[#?&]gid=(\d+)/)
    const gid = gidMatch?.[1] ?? '0'
    return `https://docs.google.com/spreadsheets/d/${sheetIdMatch[1]}/export?format=csv&gid=${gid}`
  }
  return trimmed
}

function withCacheBust(url) {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}t=${Date.now()}`
}

/** 公開CSVを取得して PapaParse 結果を返す */
export async function fetchSheetCsv(envPath) {
  const sheet = await fetchSheetCsvRaw(envPath)
  return {
    ...sheet,
    rows: sheet.rows.map(({ row }) => row).filter((row) => !isEmptyRow(row)),
  }
}

/** 行番号付きで全データ行を返す（sheet_row 計算用） */
export async function fetchSheetCsvRaw(envPath) {
  const rawUrl = loadSheetCsvUrl(envPath)
  if (!rawUrl) {
    throw new Error('NEXT_PUBLIC_SHEET_CSV_URL が未設定です（.env.local を確認）')
  }

  const url = withCacheBust(normalizeSheetCsvUrl(rawUrl))
  const res = await fetch(url, {
    headers: { Accept: 'text/csv,text/plain,*/*' },
  })

  if (!res.ok) {
    throw new Error(`CSV取得失敗: HTTP ${res.status}`)
  }

  const text = await res.text()
  const parsed = Papa.parse(text, { skipEmptyLines: false })

  if (!parsed.data?.length || !parsed.data[0]?.length) {
    throw new Error('CSVにヘッダー行がありません')
  }

  const headers = parsed.data[0].map(normalizeHeader)
  const rows = parsed.data.slice(1).map((row, index) => ({
    sheetRow: index + 2,
    row,
  }))

  return { headers, rows, headerIndex: buildHeaderIndex(headers) }
}

function isEmptyRow(row) {
  return row.every((cell) => !String(cell ?? '').trim())
}

function buildHeaderIndex(headers) {
  return Object.fromEntries(headers.map((name, index) => [name, index]))
}

export function cell(row, headerIndex, columnName) {
  const index = headerIndex[columnName]
  if (index == null || index < 0) return ''
  return String(row[index] ?? '').trim()
}
