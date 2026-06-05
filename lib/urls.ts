/** アプリ内URLパス生成（将来のサイトマップ・リンク生成用） */
export const urls = {
  home: () => '/',
  schools: () => '/schools',
  clubs: () => '/clubs',
  sports: () => '/sports',
  area: (slug: string) => `/area/${slug}`,
  school: (slug: string) => `/school/${slug}`,
  club: (slug: string) => `/club/${slug}`,
  sport: (slug: string) => `/sport/${slug}`,
  company: (slug: string) => `/company/${slug}`,
  post: (id: string) => `/post/${id}`,
  contact: (type: string) => `/contact/${type}`,
  contactComplete: (type: string) => `/contact/${type}/complete`,
} as const
