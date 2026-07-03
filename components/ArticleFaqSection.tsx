import type { FaqItem } from '@/lib/faq-generator'

type ArticleFaqSectionProps = {
  items: FaqItem[]
}

/** 記事詳細 — よくある質問（AI検索・構造化データ用） */
export default function ArticleFaqSection({ items }: ArticleFaqSectionProps) {
  if (items.length === 0) return null

  return (
    <section className="mb-8" aria-labelledby="article-faq-heading">
      <h2 id="article-faq-heading" className="mb-4 text-lg font-bold text-gray-900">
        よくある質問
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-hokkaido-ice bg-white p-4 shadow-sm open:shadow-md"
          >
            <summary className="cursor-pointer list-none font-medium text-gray-900 marker:content-none">
              <span className="flex items-start justify-between gap-3">
                <span>{item.question}</span>
                <span
                  className="shrink-0 text-gray-400 transition group-open:rotate-180"
                  aria-hidden="true"
                >
                  ▼
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
