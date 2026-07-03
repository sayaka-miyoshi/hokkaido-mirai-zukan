/** 監査スクリプト用 URL 生成（i18n 非依存） */
export const urls = {
  home: () => '/',
  schools: () => '/schools',
  clubs: () => '/clubs',
  companies: () => '/companies',
  openCampus: () => '/open-campus',
  sports: () => '/sports',
  operator: () => '/operator',
  area: (slug) => `/area/${slug}`,
  school: (slug) => `/school/${slug}`,
  club: (slug) => `/club/${slug}`,
  sport: (slug) => `/sport/${slug}`,
  company: (slug) => `/company/${slug}`,
  post: (id) => `/post/${id}`,
}
