/** DM導線列（スプレッドシート Z〜AE / CSV ヘッダー名） */
export const DM_CSV_HEADERS = ['dm_keyword', 'dm_url', 'dm_message', 'dm_category']

export const DM_EXTENDED_HEADERS = ['dm_priority', 'dm_group_id']

/** iステップ登録用エクスポート列（レガシー） */
export const ISTEP_DM_EXPORT_HEADERS = [...DM_CSV_HEADERS]

export const ISTEP_REGISTER_HEADERS = [
  'dm_keyword',
  'dm_url',
  'dm_message',
  'dm_category',
  'priority',
  'group_id',
]

export const DM_COLUMN_POSITIONS = [
  { letter: 'Z', index: 26, header: 'dm_keyword' },
  { letter: 'AA', index: 27, header: 'dm_url' },
  { letter: 'AB', index: 28, header: 'dm_message' },
  { letter: 'AC', index: 29, header: 'dm_category' },
  { letter: 'AD', index: 30, header: 'dm_priority' },
  { letter: 'AE', index: 31, header: 'dm_group_id' },
]

export const DM_CATEGORY_VALUES = ['学校', '部活動', '企業', '観光/文化', '掲載希望', '入口', '競技']

export const DM_PRIORITY_VALUES = ['A', 'B', 'C']
