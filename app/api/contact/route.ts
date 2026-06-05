import { NextResponse } from 'next/server'
import { submitContact } from '@/lib/contact/submit'
import { getContactFormConfig, isContactFormType } from '@/lib/contact/forms'
import { verifyRecaptchaToken } from '@/lib/contact/recaptcha'
import { hasValidationErrors, validateContactPayload } from '@/lib/contact/validation'
import type { ContactFormPayload, ContactFormType } from '@/types/contact'

export async function POST(request: Request) {
  let body: ContactFormPayload

  try {
    body = (await request.json()) as ContactFormPayload
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が正しくありません。' }, { status: 400 })
  }

  if (!isContactFormType(body.formType)) {
    return NextResponse.json({ error: 'フォーム種別が正しくありません。' }, { status: 400 })
  }

  const config = getContactFormConfig(body.formType)
  if (!config?.enabled) {
    return NextResponse.json({ error: 'このフォームは現在ご利用いただけません。' }, { status: 404 })
  }

  if (body.website?.trim()) {
    return NextResponse.json({ ok: true })
  }

  const fieldErrors = validateContactPayload(body, config)
  if (hasValidationErrors(fieldErrors)) {
    return NextResponse.json({ error: '入力内容を確認してください。', fieldErrors }, { status: 400 })
  }

  const recaptcha = await verifyRecaptchaToken(body.recaptchaToken)
  if (!recaptcha.ok) {
    return NextResponse.json({ error: recaptcha.error ?? '認証に失敗しました。' }, { status: 400 })
  }

  const result = await submitContact(body, config)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 503 })
  }

  return NextResponse.json({
    ok: true,
    redirectTo: `/contact/${body.formType as ContactFormType}/complete`,
  })
}
