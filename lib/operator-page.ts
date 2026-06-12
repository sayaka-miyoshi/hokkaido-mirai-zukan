import {
  INSTAGRAM_URL,
  TIKTOK_URL,
  YOUTUBE_URL,
} from '@/lib/site'

/** 運営者ページ（/operator）SEO・表示文言 */
export const OPERATOR_PAGE = {
  path: '/operator',
  title: '三好清佳（@insta.sayaka）｜北海道未来図鑑運営者',
  description:
    '北海道観光大使・札幌観光大使の三好清佳（@insta.sayaka）が運営する北海道未来図鑑。北海道の学校・部活動・企業・観光情報を発信しています。',
  breadcrumbLabel: '運営者',
  h1: '三好清佳（Sayaka Miyoshi）',
  titles: ['北海道観光大使', '札幌観光大使'] as const,
  socialAccounts: [
    {
      platform: 'instagram' as const,
      label: 'Instagram',
      handle: '@insta.sayaka',
      stat: '50万人',
      url: INSTAGRAM_URL,
    },
    {
      platform: 'tiktok' as const,
      label: 'TikTok',
      handle: '@tiktok.sayaka',
      stat: '3万人',
      url: TIKTOK_URL,
    },
    {
      platform: 'youtube' as const,
      label: 'YouTube',
      handle: '@SayakaMiyoshi',
      stat: '2万人',
      url: YOUTUBE_URL,
    },
  ],
  profileParagraphs: [
    '北海道を拠点に活動するインフルエンサー・SNSマーケター。北海道観光大使・札幌観光大使として、北海道の学校、部活動、企業、観光地、自治体を取材し、北海道の魅力発信を行っています。',
    'Instagramアカウント「@insta.sayaka」では、北海道グルメ・観光・企業訪問・学校取材などを発信。北海道未来図鑑の運営を通じて、進路選択や企業研究に役立つ情報を届けています。',
  ] as const,
  /** Person スキーマ用 description */
  schemaDescription:
    '北海道観光大使・札幌観光大使として活動する三好清佳（Sayaka Miyoshi / @insta.sayaka）。北海道未来図鑑を運営し、北海道の学校・部活動・企業・観光情報を発信しています。',
  sameAs: [
    'https://www.instagram.com/insta.sayaka/',
    'https://www.tiktok.com/@tiktok.sayaka',
    'https://youtube.com/@SayakaMiyoshi',
  ] as const,
} as const
