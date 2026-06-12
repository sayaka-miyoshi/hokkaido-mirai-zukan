/** 雑誌特集メディア向けビジュアルトークン（kubotabi風・進路メディア向けに調整） */

export const MAGAZINE = {
  cream: '#FFFBF7',
  sky: '#F0F8FF',
  peach: '#FFF5EE',
  mint: '#F2FBF6',
  border: '#E8EEF2',
  text: '#3D4F5F',
  title: '#2B4A6B',
  muted: '#7A8B9A',
  skyAccent: '#5BAFD6',
  coralAccent: '#FF9B7A',
  mintAccent: '#6BC4A6',
} as const

export const CATEGORY_CARD_STYLES = {
  school: { bg: '#EAF4FF', border: '#C5E3F6', emoji: '🏫' },
  club: { bg: '#FFF0E8', border: '#FFDCC8', emoji: '⚽' },
  company: { bg: '#F0F4FF', border: '#D4DCF5', emoji: '🏢' },
  admin: { bg: '#ECFAF2', border: '#C8EDD8', emoji: '🏛️' },
} as const

export const SECTION_EYEBROW_STYLES = {
  FEATURE: 'bg-[#FFF0E8] text-[#D4654A]',
  'PICK UP': 'bg-[#FFF0E8] text-[#D4654A]',
  THEME: 'bg-[#EAF4FF] text-[#3D7FA6]',
  LATEST: 'bg-[#ECFAF2] text-[#4A9B7A]',
  SEARCH: 'bg-[#F0F4FF] text-[#5B6FA8]',
  BROWSE: 'bg-[#EAF4FF] text-[#3D7FA6]',
} as const

export type SectionEyebrowKey = keyof typeof SECTION_EYEBROW_STYLES
