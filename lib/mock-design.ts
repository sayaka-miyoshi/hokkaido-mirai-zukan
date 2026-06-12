/** デザイン確認用モック（本番トップとは別ルート） */

export const MOCK_HERO_INTERVIEW_IMAGE = '/hero-interview.png'

export const MOCK_VARIANTS = {
  cover: {
    id: 'cover',
    slug: 'cover',
    label: 'A-1 表紙型',
    title: 'ロゴA ＋ モック1（表紙型）',
    description: '白背景・ロゴ大 → 取材写真 → キャッチ → ストーリー',
  },
  feature: {
    id: 'feature',
    slug: 'feature',
    label: 'A-3 特集扉型',
    title: 'ロゴA ＋ モック3（特集扉型）',
    description: 'Vol.01ラベル・写真＋白帯キャッチ・目次風テーマ',
  },
} as const

export type MockVariantId = keyof typeof MOCK_VARIANTS
