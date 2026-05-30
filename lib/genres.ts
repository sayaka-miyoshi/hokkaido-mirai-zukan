export const GENRES = ['すべて', '学校', '部活', '企業訪問']

export const GENRE_FILTER_STYLES: Record<string, { active: string; hover: string }> = {
  'すべて':   { active: 'bg-pink-500 text-white border-pink-500',     hover: 'hover:border-pink-300' },
  '学校':     { active: 'bg-blue-500 text-white border-blue-500',     hover: 'hover:border-blue-300' },
  '部活':     { active: 'bg-green-500 text-white border-green-500',   hover: 'hover:border-green-300' },
  '企業訪問': { active: 'bg-orange-500 text-white border-orange-500', hover: 'hover:border-orange-300' },
}

export function getGenreBadgeClass(genre: string): string {
  const map: Record<string, string> = {
    '学校':     'bg-blue-500',
    '部活':     'bg-green-500',
    '企業訪問': 'bg-orange-500',
  }
  return map[genre] ?? 'bg-gray-400'
}
