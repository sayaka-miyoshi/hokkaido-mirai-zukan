/** 人気競技ページ向けの紹介文・SEO強化コピー */

export const FEATURED_SPORTS = ['卓球', 'アメフト', 'アイスホッケー', 'バスケットボール'] as const

export type FeaturedSport = (typeof FEATURED_SPORTS)[number]

const SPORT_INTROS: Record<string, string> = {
  卓球:
    '北海道の卓球部・卓球サークルの活動を紹介。練習風景や大会の様子、新入部員募集の情報を動画と記事で届けます。',
  アメフト:
    '北海道のアメリカンフットボール部の活動記事。練習・試合・チームの雰囲気を取材し、部活選びの参考になる情報を掲載しています。',
  アイスホッケー:
    '北海道のアイスホッケー部の活動紹介。リンクでの練習や試合、チームの日常を通じて、道内のホッケー文化に触れられます。',
  バスケットボール:
    '北海道のバスケットボール部・バスケサークルの紹介記事。練習や試合、部活の雰囲気を知りたい方へ向けたコンテンツです。',
}

export function isFeaturedSport(name: string): boolean {
  return FEATURED_SPORTS.includes(name as FeaturedSport)
}

export function buildFeaturedSportDescription(name: string, postCount: number): string {
  const intro = SPORT_INTROS[name]
  if (intro) {
    return `${intro}（掲載 ${postCount} 件）`
  }
  return `北海道内の${name}に関する部活動紹介を${postCount}件掲載しています。`
}

export function buildFeaturedSportTitle(name: string): string {
  if (isFeaturedSport(name)) {
    return `北海道の${name}部活・人気記事まとめ`
  }
  return `北海道の${name}部活・活動記事`
}
