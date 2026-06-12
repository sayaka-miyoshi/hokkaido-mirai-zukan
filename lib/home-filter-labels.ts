type ActiveFilterState = {
  keyword: string
  selectedGenre: string | null
  selectedCareerCategory: string | null
  selectedArea: string | null
  selectedVideoCategory: string | null
  videoCategoryLabel?: string | null
}

const GENRE_LABELS: Record<string, string> = {
  学校: '学校の記事',
  部活: '部活の記事',
  企業訪問: '企業の記事',
  '行政・自治体': '行政・自治体',
}

/** 絞り込み結果セクションの見出し */
export function resolveFilterResultHeading(
  filters: ActiveFilterState,
  count: number,
): { title: string; description: string } {
  if (filters.selectedGenre && GENRE_LABELS[filters.selectedGenre]) {
    const title = GENRE_LABELS[filters.selectedGenre]
    return { title, description: `${count}件の${title}` }
  }

  if (filters.selectedCareerCategory) {
    return {
      title: filters.selectedCareerCategory,
      description: `${count}件の「${filters.selectedCareerCategory}」に関する記事`,
    }
  }

  if (filters.selectedArea) {
    return {
      title: `${filters.selectedArea}エリア`,
      description: `${count}件の${filters.selectedArea}エリアの記事`,
    }
  }

  if (filters.selectedVideoCategory) {
    const label = filters.videoCategoryLabel ?? filters.selectedVideoCategory
    return {
      title: label,
      description: `${count}件の「${label}」に関する記事`,
    }
  }

  if (filters.keyword.trim()) {
    return {
      title: '検索結果',
      description: `「${filters.keyword.trim()}」に一致する記事 ${count}件`,
    }
  }

  return {
    title: '絞り込み結果',
    description: `${count}件の記事が見つかりました`,
  }
}

export function hasBrowseFilter(filters: ActiveFilterState): boolean {
  return Boolean(
    filters.keyword.trim() ||
      filters.selectedGenre ||
      filters.selectedCareerCategory ||
      filters.selectedArea ||
      filters.selectedVideoCategory,
  )
}
