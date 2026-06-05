import type { ContactFormConfig, ContactFormType } from '@/types/contact'

const PUBLICATION_FIELDS: ContactFormConfig['fields'] = [
  {
    name: 'organizationName',
    label: '学校名・企業名・団体名',
    type: 'text',
    required: true,
    placeholder: '例：北海道大学 / 株式会社〇〇 / ○○団体',
    autoComplete: 'organization',
  },
  {
    name: 'contactName',
    label: 'お名前',
    type: 'text',
    required: true,
    placeholder: '例：山田 太郎',
    autoComplete: 'name',
  },
  {
    name: 'email',
    label: 'メールアドレス',
    type: 'email',
    required: true,
    placeholder: 'example@email.com',
    autoComplete: 'email',
  },
  {
    name: 'instagram',
    label: 'Instagram',
    type: 'text',
    required: false,
    placeholder: '例：@insta.example',
  },
  {
    name: 'phone',
    label: '電話番号',
    type: 'tel',
    required: false,
    placeholder: '例：090-1234-5678',
    autoComplete: 'tel',
  },
  {
    name: 'message',
    label: 'ご相談内容',
    type: 'textarea',
    required: true,
    placeholder: '掲載・取材のご希望を簡単にご記入ください',
  },
]

/** フォーム定義レジストリ（種別ごとに設定を追加） */
export const CONTACT_FORM_REGISTRY: Record<ContactFormType, ContactFormConfig> = {
  publication: {
    type: 'publication',
    menuLabel: '掲載・取材相談',
    pageTitle: '掲載・取材相談について',
    pageDescription:
      '北海道観光大使・札幌観光大使として活動する三好清佳が、北海道の学校・部活・企業の魅力を取材・発信しています。\n\n掲載をご希望の方や取材のご相談がございましたら、お気軽にお問い合わせください。\n\n内容を確認後、担当よりご連絡いたします。',
    submitLabel: 'この内容で相談する',
    successTitle: '送信完了',
    successMessage:
      'お問い合わせありがとうございます。\n内容を確認後、担当よりご連絡いたします。',
    emailSubject: '【掲載・取材相談】',
    enabled: true,
    fields: PUBLICATION_FIELDS,
  },
  'member-recruitment': {
    type: 'member-recruitment',
    menuLabel: '部員募集',
    pageTitle: '部員募集のお問い合わせ',
    pageDescription: '部員募集に関するお問い合わせフォームです。',
    submitLabel: '送信する',
    successTitle: '送信完了',
    successMessage:
      'お問い合わせありがとうございます。\n内容を確認後、担当よりご連絡いたします。',
    emailSubject: '【部員募集】お問い合わせ',
    enabled: false,
    fields: PUBLICATION_FIELDS,
  },
  'job-posting': {
    type: 'job-posting',
    menuLabel: '求人掲載',
    pageTitle: '求人掲載のお問い合わせ',
    pageDescription: '求人掲載に関するお問い合わせフォームです。',
    submitLabel: '送信する',
    successTitle: '送信完了',
    successMessage:
      'お問い合わせありがとうございます。\n内容を確認後、担当よりご連絡いたします。',
    emailSubject: '【求人掲載】お問い合わせ',
    enabled: false,
    fields: PUBLICATION_FIELDS,
  },
  'company-listing': {
    type: 'company-listing',
    menuLabel: '企業掲載',
    pageTitle: '企業掲載のお問い合わせ',
    pageDescription: '企業掲載に関するお問い合わせフォームです。',
    submitLabel: '送信する',
    successTitle: '送信完了',
    successMessage:
      'お問い合わせありがとうございます。\n内容を確認後、担当よりご連絡いたします。',
    emailSubject: '【企業掲載】お問い合わせ',
    enabled: false,
    fields: PUBLICATION_FIELDS,
  },
  'school-listing': {
    type: 'school-listing',
    menuLabel: '学校掲載',
    pageTitle: '学校掲載のお問い合わせ',
    pageDescription: '学校掲載に関するお問い合わせフォームです。',
    submitLabel: '送信する',
    successTitle: '送信完了',
    successMessage:
      'お問い合わせありがとうございます。\n内容を確認後、担当よりご連絡いたします。',
    emailSubject: '【学校掲載】お問い合わせ',
    enabled: false,
    fields: PUBLICATION_FIELDS,
  },
}

export function getContactFormConfig(type: string): ContactFormConfig | undefined {
  if (!(type in CONTACT_FORM_REGISTRY)) return undefined
  return CONTACT_FORM_REGISTRY[type as ContactFormType]
}

export function getEnabledContactMenuItems(): ContactFormConfig[] {
  return Object.values(CONTACT_FORM_REGISTRY).filter((form) => form.enabled)
}

export function isContactFormType(value: string): value is ContactFormType {
  return value in CONTACT_FORM_REGISTRY
}
