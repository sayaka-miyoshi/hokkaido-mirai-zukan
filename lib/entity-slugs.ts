/** 学校名 → URLスラッグ（スプレッドシート slug 列と併用） */
export const SCHOOL_SLUGS: Record<string, string> = {
  '札幌南高校': 'sapporo-minami',
  '旭川永嶺高校': 'asahikawa-eirin',
  '函館ラ・サール高校': 'hakodate-lasalle',
  '函館商業高校': 'hakodate-shogyo',
  '釧路鶴野高校': 'kushiro-tsuruno',
  '帯広柏葉高校': 'obihiro-hakuyo',
  '帯広農業高校': 'obihiro-nogyo',
  '北見藤高校': 'kitami-fuji',
  '小樽商科大学附属高校': 'otaru-shodai',
  '苫小牧東高校': 'tomakomai-higashi',
  '苫小牧工業高校': 'tomakomai-kogyo',
  '札幌北高校': 'sapporo-kita',
  '札幌大学附属高校': 'sapporo-university',
  '札幌創成高校': 'sapporo-sosei',
  '旭川龍谷高校': 'asahikawa-ryukoku',
  '旭川北高校': 'asahikawa-kita',
  '釧路江南高校': 'kushiro-konan',
  '帯広三条高校': 'obihiro-sanjo',
  '北見商業高校': 'kitami-shogyo',
  '小樽潮陵高校': 'otaru-choryo',
}

/** 部活名 → URLスラッグ */
export const CLUB_SLUGS: Record<string, string> = {
  '吹奏楽部': 'brass-band',
  'サッカー部': 'soccer',
  'バスケットボール部': 'basketball',
  '科学部': 'science-club',
  '柔道部': 'judo',
  '美術部': 'art-club',
  'バレーボール部': 'volleyball',
  '茶道部': 'sado-club',
  '馬術部': 'equestrian',
  '合唱部': 'chorus',
}

/** 企業名 → URLスラッグ */
export const COMPANY_SLUGS: Record<string, string> = {
  'キリンビール': 'kirin-beer',
  '日本ハム': 'nippon-ham',
  '北海道電力': 'hepco',
  'ソフトバンク': 'softbank',
  '旭川医療大学': 'asahikawa-med',
  'ロイズ': 'royce',
}
