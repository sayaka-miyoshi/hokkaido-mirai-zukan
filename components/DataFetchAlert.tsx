import { POST_CSV_HEADERS } from '@/types/post'

type DataFetchAlertProps = {
  source: 'sheet' | 'dummy' | 'error'
  totalCount?: number
  error?: string
}

export default function DataFetchAlert({ source, totalCount = 0, error }: DataFetchAlertProps) {
  if (source === 'sheet') {
    return (
      <div
        role="status"
        className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
      >
        <p className="font-bold">✅ スプレッドシート接続済み</p>
        <p className="mt-1 text-green-700">
          Googleスプレッドシートから <span className="font-bold">{totalCount}件</span> の投稿を取得しました。
        </p>
      </div>
    )
  }

  if (source === 'dummy') {
    return (
      <div
        role="status"
        className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
      >
        <p className="font-bold">📋 サンプルデータを表示中</p>
        <p className="mt-1 text-blue-700">
          Googleスプレッドシートが未接続です（<span className="font-bold">{totalCount}件</span>）。
          接続するとスプレッドシートの内容が自動で反映されます。
        </p>
      </div>
    )
  }

  return (
    <div
      role="alert"
      className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <p className="font-bold">⚠️ データの取得に失敗しました</p>
      <p className="mt-1">{error ?? 'スプレッドシートのデータを読み込めませんでした。'}</p>
      <details className="mt-3 text-xs text-red-700">
        <summary className="cursor-pointer font-medium">確認ポイント</summary>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>
            <code className="bg-red-100 px-1 rounded">.env.local</code> の{' '}
            <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_SHEET_CSV_URL</code>{' '}
            が正しいか
          </li>
          <li>スプレッドシートが「ウェブに公開」されているか（列追加後は再公開が必要な場合があります）</li>
          <li>
            1行目に次の列名がすべて含まれているか（順序は自由・追加列も可）:
            <br />
            <span className="text-[11px] leading-relaxed">{POST_CSV_HEADERS.join(' / ')}</span>
          </li>
          <li>設定変更後は開発サーバーを再起動したか（<code className="bg-red-100 px-1 rounded">npm run dev</code>）</li>
        </ul>
      </details>
    </div>
  )
}
