type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[]
}

/** 構造化データ（JSON-LD） */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
