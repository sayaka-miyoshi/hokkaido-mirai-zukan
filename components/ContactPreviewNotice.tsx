type ContactPreviewNoticeProps = {
  className?: string
  messages: string[]
}

/** Sheets / Resend 未設定時のUI確認用（控えめな表示） */
export default function ContactPreviewNotice({
  className = '',
  messages,
}: ContactPreviewNoticeProps) {
  if (messages.length === 0) return null

  return (
    <div
      className={`rounded-xl border border-hokkaido-ice bg-white/80 px-4 py-3 text-[11px] text-gray-500 leading-relaxed ${className}`}
      role="status"
    >
      <span className="font-medium text-hokkaido-deep">UI確認中：</span>
      {messages.join(' / ')}
    </div>
  )
}
