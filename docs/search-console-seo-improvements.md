# Search Console インデックス改善レポート

**対象サイト:** https://www.hokkaido-miraizukan.jp  
**作成日:** 2026年7月  
**前提:** サイトマップ送信・URL検査・インデックス登録リクエスト済み

---

## 1. 実施した改善（今回）

### ① 内部リンク最適化

| 施策 | 内容 |
|------|------|
| **エンティティ相互リンク** | 学校・部活・競技・企業ページに「関連ページ」チップを追加（一覧・部活・競技・エリア・企業間） |
| **パンくず強化** | エンティティページに一覧階層を追加（例: ホーム / 学校一覧 / 北海道大学） |
| **記事詳細** | 関連記事セクション上部に「関連ページ」リンク（学校・部活・競技・企業・エリア＋同競技の他部活） |
| **人気コンテンツ** | 人気記事カード下にエンティティページへのリンク（学校・部活・企業・競技の優先順） |
| **サイト内ナビ** | 全エンティティページ下部に「テーマから探す」（学校/部活/競技/企業一覧） |
| **トップ browse** | 競技サブカテゴリ（野球・ラクロス等）から競技ページへの直接リンク |

### ② 孤立ページ対策

- `npm run audit:internal-links` でトップからの到達性を検証
- 一覧ページ経由で全エンティティへリンク
- トップの人気・最新・企業グリッドから全記事へリンク
- 記事詳細からエンティティページへ逆リンク

### ③ メタデータ重複チェック

- `npm run audit:metadata` で title / description の重複を検出
- 部活・競技ページの「〇〇の投稿一覧」形式は同名エンティティで重複しうる → 改善案を下記に記載

---

## 2. 現在の SEO 基盤（問題なし）

| 項目 | 状態 |
|------|------|
| 正規ドメイン | `https://www.hokkaido-miraizukan.jp` |
| non-www | 308 → www へリダイレクト |
| metadataBase / canonical | www ドメインで統一 |
| robots.txt | Sitemap: www ドメイン |
| sitemap.xml | 432 URL（全て www） |
| JSON-LD | Article, FAQPage, CollectionPage, Organization |
| Google 所有権確認 | HTML タグ設定済み |

**Search Console プロパティ:** ドメインプロパティ `hokkaido-miraizukan.jp` または URL プレフィックス `https://www.hokkaido-miraizukan.jp` を推奨。

---

## 3. インデックスされやすくする追加改善案

### 優先度 A（短期・効果大）

| # | 施策 | 理由 | 工数 |
|---|------|------|------|
| A1 | **部活・競技ページの title ユニーク化** | 「男子ラクロス部の投稿一覧」が複数校で重複しうる | 小 |
| A2 | **ai_summary 列の活用拡大** | 記事ごとにユニークな description → 重複コンテンツ判定を回避 | 中（運用） |
| A3 | **構造化データの about 拡充** | Article JSON-LD に school/club/company を `about` で明示 | 小 |
| A4 | **インデックス登録後のカバレッジ確認** | Search Console → ページ → 未登録理由を週次確認 | 運用 |

### 優先度 B（中期）

| # | 施策 | 理由 |
|---|------|------|
| B1 | **企業一覧から企業エンティティページへリンク** | 現在は記事直リンクのみ。企業 slug ページへの導線不足 |
| B2 | **エリアページの相互リンク** | 近隣エリア・関連学校へのリンクで回遊性向上 |
| B3 | **最新記事セクションにもエンティティリンク** | 人気記事と同様の entityLink 対応 |
| B4 | **PostCard にエンティティリンク** | 検索結果・一覧グリッド全体の内部リンク強化 |

### 優先度 C（長期・Phase Next）

| # | 施策 | 参照 |
|---|------|------|
| C1 | AI 検索・ランキング機能 | `docs/Phase_Next_設計書.md` |
| C2 | クロスエンティティ関連グラフ | `lib/related-graph.ts`（設計済み・未実装） |
| C3 | GA 連動の人気記事自動更新 | `NEXT_PUBLIC_POPULAR_CONTENT_SOURCE` |
| C4 | 英語版（/en）の hreflang 完全対応 | i18n 実装時 |

---

## 4. title / description 改善ガイド

### title の推奨フォーマット

| ページ種別 | 現状 | 推奨 |
|-----------|------|------|
| 学校 | `{校名} \| 学校紹介・部活一覧` | ✅ そのまま |
| 部活 | `{部活名}の投稿一覧` | `{校名} {部活名}の活動記事` |
| 競技 | `{競技名}の投稿一覧` | `北海道の{競技名}部活・活動記事` |
| 企業 | `{企業名}の投稿一覧` | `{企業名}の企業訪問・仕事紹介` |
| 記事 | `{タイトル}` | ✅ ai_summary があれば description に活用 |

### description の推奨

- **120文字以内**（`createPageMetadata` で自動 clamp）
- エンティティ名・エリア・件数を含める（`lib/entity-summary.ts` が自動生成）
- スプレッドシート **ai_summary 列** で記事ごとに上書き可能

---

## 5. 運用チェックリスト

### デプロイ後

```bash
npm run audit:internal-links   # 孤立ページなし
npm run audit:metadata         # title 重複なし
npm run test:entity-pages      # エンティティフィルタ
```

### 月次（Search Console）

- [ ] カバレッジ → エラー・除外の確認
- [ ] サイトマップ → 検出 URL 数と sitemap.xml の一致
- [ ] 検索パフォーマンス → 表示回数・CTR の推移
- [ ] ページエクスペリエンス → Core Web Vitals

### 新規記事追加時

- [ ] slug 列が埋まっているか（エンティティページ生成に必須）
- [ ] ジャンル・学校名・部活名・企業名・競技カテゴリが正しいか
- [ ] ai_summary があれば FAQ より優先して description に使われる

---

## 6. 到達性の目標構造（3クリック以内）

```
トップ (/)
├─ 1クリック: 一覧 (/schools, /clubs, /sports, /companies)
│   └─ 2クリック: エンティティ (/school/*, /club/*, /sport/*, /company/*)
│       └─ 3クリック: 記事 (/post/*)
├─ 1クリック: 人気・最新記事 (/post/*)
│   └─ 2クリック: エンティティ（基本情報・関連ページ）
└─ 1クリック: 競技・学校（人気検索チップ）
    └─ 2クリック: 関連部活・記事
```

---

## 7. 関連ファイル

| ファイル | 役割 |
|---------|------|
| `lib/entity-cross-links.ts` | エンティティ相互リンクロジック |
| `lib/post-primary-entity-link.ts` | 記事カード用エンティティリンク |
| `components/EntityLinkChips.tsx` | チップ UI |
| `components/EntitySiteNav.tsx` | フッター直上ナビ |
| `scripts/audit-internal-links.mjs` | 孤立ページ検出 |
| `scripts/audit-metadata-duplicates.mjs` | title/description 重複 |
