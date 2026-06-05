import Link from 'next/link'

export type EntityIndexListItem = {
  href: string
  title: string
  subtitle?: string
  count: number
  emoji?: string
}

type EntityIndexListProps = {
  items: EntityIndexListItem[]
  emptyMessage?: string
}

export default function EntityIndexList({
  items,
  emptyMessage = '該当する項目がありません。',
}: EntityIndexListProps) {
  if (items.length === 0) {
    return (
      <p className="text-center py-12 text-gray-500 rounded-2xl bg-white border border-hokkaido-ice">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={`${item.href}-${item.title}-${item.subtitle ?? ''}`}>
          <Link
            href={item.href}
            className="flex items-center justify-between gap-3 rounded-2xl border border-hokkaido-ice bg-white px-4 py-3 shadow-sm transition hover:border-pink-300 hover:shadow-md"
          >
            <div className="min-w-0">
              <p className="font-bold text-gray-800 truncate">
                {item.emoji ? (
                  <>
                    <span aria-hidden className="mr-1.5">{item.emoji}</span>
                    {item.title}
                  </>
                ) : (
                  item.title
                )}
              </p>
              {item.subtitle && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">{item.subtitle}</p>
              )}
            </div>
            <span className="shrink-0 text-xs font-bold bg-hokkaido-ice text-hokkaido-deep px-2 py-1 rounded-full">
              {item.count}件
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
