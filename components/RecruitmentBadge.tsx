/** 募集情報がある場合に表示するバッジ */
export default function RecruitmentBadge({
  text,
  className = '',
}: {
  text: string
  className?: string
}) {
  if (!text.trim()) return null

  return (
    <span
      className={`inline-flex items-center gap-0.5 font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-sm ${className}`}
      title={text}
    >
      <span aria-hidden="true">📣</span>
      <span className="truncate max-w-[5.5rem]">{text}</span>
    </span>
  )
}
