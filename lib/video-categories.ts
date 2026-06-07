import { readFileSync } from 'fs'
import { resolve } from 'path'
import { cache } from 'react'
import Papa from 'papaparse'

export type VideoCategoryEntry = {
  id: string
  label: string
}

export type VideoCategoryMaps = {
  idToLabel: Map<string, string>
  labelToId: Map<string, string>
}

const REQUIRED_HEADERS = ['ID', '表示名'] as const

function parseMasterCsv(text: string): VideoCategoryEntry[] | { error: string } {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (result.errors.length > 0) {
    return { error: result.errors[0]?.message ?? 'CSV parse error' }
  }

  const headers = result.meta.fields?.map((h) => h.trim()) ?? []
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h))
  if (missing.length > 0) {
    return { error: `必須列が不足: ${missing.join('、')}` }
  }

  const entries: VideoCategoryEntry[] = []
  const seenIds = new Set<string>()

  for (const row of result.data) {
    const id = row.ID?.trim() ?? ''
    const label = row['表示名']?.trim() ?? ''
    if (!id && !label) continue
    if (!id || !label) {
      return { error: 'ID と表示名は両方入力してください' }
    }
    if (seenIds.has(id)) {
      return { error: `ID が重複しています: ${id}` }
    }
    seenIds.add(id)
    entries.push({ id, label })
  }

  if (entries.length === 0) {
    return { error: 'マスターにデータがありません' }
  }

  return entries
}

function buildMaps(entries: VideoCategoryEntry[]): VideoCategoryMaps {
  const idToLabel = new Map(entries.map((e) => [e.id, e.label]))
  const labelToId = new Map(entries.map((e) => [e.label, e.id]))
  return { idToLabel, labelToId }
}

function loadBundledMasterCsv(): VideoCategoryEntry[] {
  const path = resolve(process.cwd(), 'data/動画カテゴリマスター.csv')
  const parsed = parseMasterCsv(readFileSync(path, 'utf8'))
  if ('error' in parsed) {
    throw new Error(`動画カテゴリマスター: ${parsed.error}`)
  }
  return parsed
}

/** 動画カテゴリマスター（リポジトリCSV または公開CSV） */
export const loadVideoCategoryMaster = cache(async (): Promise<VideoCategoryEntry[]> => {
  const url = process.env.NEXT_PUBLIC_VIDEO_CATEGORY_CSV_URL?.trim()

  if (url) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 3600 },
        headers: { Accept: 'text/csv,text/plain,*/*' },
      })
      if (res.ok) {
        const parsed = parseMasterCsv(await res.text())
        if (!('error' in parsed)) return parsed
        console.error('[video-categories] CSV error:', parsed.error)
      } else {
        console.error('[video-categories] HTTP error:', res.status, res.statusText)
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      console.error('[video-categories] fetch error:', detail)
    }
  }

  return loadBundledMasterCsv()
})

export async function loadVideoCategoryMaps(): Promise<VideoCategoryMaps> {
  return buildMaps(await loadVideoCategoryMaster())
}

/** CSV値（ID または旧来の表示名）→ ID */
export function normalizeVideoCategoryId(
  raw: string,
  maps: VideoCategoryMaps,
): string {
  const value = raw.trim()
  if (!value) return ''
  if (maps.idToLabel.has(value)) return value
  return maps.labelToId.get(value) ?? value
}

/** CSV値（ID または旧来の表示名）→ 表示名 */
export function resolveVideoCategoryLabel(
  raw: string,
  maps: VideoCategoryMaps,
): string {
  const value = raw.trim()
  if (!value) return ''
  if (maps.idToLabel.has(value)) return maps.idToLabel.get(value)!
  if (maps.labelToId.has(value)) return value
  return value
}
