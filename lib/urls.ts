/** アプリ内URLパス生成（将来のサイトマップ・リンク生成用） */
export const urls = {
  home: () => '/',
  area: (slug: string) => `/area/${slug}`,
  school: (slug: string) => `/school/${slug}`,
  club: (slug: string) => `/club/${slug}`,
  company: (slug: string) => `/company/${slug}`,
  post: (id: string) => `/post/${id}`,
} as const
