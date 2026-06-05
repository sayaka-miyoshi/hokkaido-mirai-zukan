/** 問い合わせフォーム種別（将来の拡張用） */
export type ContactFormType =
  | 'publication'
  | 'member-recruitment'
  | 'job-posting'
  | 'company-listing'
  | 'school-listing'

export type ContactFieldName =
  | 'organizationName'
  | 'companyName'
  | 'schoolName'
  | 'contactName'
  | 'email'
  | 'phone'
  | 'instagram'
  | 'message'

export type ContactFieldConfig = {
  name: ContactFieldName
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea'
  required: boolean
  placeholder?: string
  autoComplete?: string
}

export type ContactFormConfig = {
  type: ContactFormType
  menuLabel: string
  pageTitle: string
  pageDescription: string
  submitLabel: string
  successTitle: string
  successMessage: string
  emailSubject: string
  enabled: boolean
  fields: ContactFieldConfig[]
}

export type ContactFormPayload = {
  formType: ContactFormType
  organizationName: string
  companyName: string
  schoolName: string
  contactName: string
  email: string
  phone: string
  instagram: string
  message: string
  recaptchaToken?: string
  /** スパム対策用（入力されたら拒否） */
  website?: string
}

export type ContactFieldErrors = Partial<Record<ContactFieldName, string>>
