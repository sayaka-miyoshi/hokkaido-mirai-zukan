# slug 確定 — 未確定 9 行

数式セットアップ（Q・X・Y）完了後の **次工程**。Y列の候補を確認し、**N列に値のみ貼り付け**してください。

## 手順

0. **N列にプルダウン入力規則がある場合は先に削除**（`docs/トラブルシュート_N列_slug入力規則.md`）  
   → 残したままだと `入力規則に違反しています` で新規 slug が入れられません
1. 下表の行を開く
2. Y列 `slug候補` を目視確認（必要なら短く手直し）
3. 確定文字列を **N列 `slug` に値のみ貼り付け**
4. 重複・下書き行は削除するか **公開=非公開**
5. 保存後:

```bash
npm run verify:slugs
npm run verify
```

---

## 一覧（2026/5/31 時点）

| 行 | 投稿タイトル | ジャンル | Y列 slug候補 | 推奨 N列 slug | 備考 |
|----|-------------|----------|--------------|---------------|------|
| 46 | 北海道スポーツ専門学校 | 学校 | `hokkaido-sports-college-hokkaido-sports-college` | `hokkaido-sports-college` | 重複語を削除 |
| 47 | 北海道スポーツ専門学校 | 部活 | `hokkaido-sports-college-powerlifting-hokkaido-sports-college` | `hokkaido-sports-college-powerlifting` | `/club/*` 用 |
| 48 | 札幌デジタル&…専門学校 | 学校 | `sapporo-digital-animal-medical-tourism-college` | 同上または `sapporo-digital-college` | 48/50/51 が重複 |
| 49 | 人形浄瑠璃 | 企業訪問 | `ashiri-za-puppet-theater` | `ashiri-za-puppet-theater` | 既存 `ningyo-joruri` と重複しないか確認 |
| 50 | 札幌デジタル&…専門学校 | 学校 | （48と同じ） | **行削除推奨** | 下書き重複 |
| 51 | 札幌デジタル&…専門学校 | 学校 | （48と同じ） | **行削除推奨** | 下書き重複 |
| 52 | 手作りバット職人稲原さん | 企業訪問 | `bat-workshop-kitakara---shusaku-inahara-…` | `kitakara-inahara-bat` | 長すぎる候補を短縮 |
| 53 | 北海道スポーツ専門学校 | 部活 | `hokkaido-sports-college-hokkaido-sports-college` | **行削除推奨** | 部活名が空 |
| 121 | テスト記事 | 部活 | `hokkaido-university-formula-team-test-article` | **空のまま可** | 既に **非公開** |

---

## タイトル空の約 67 行

ARRAYFORMULA の予約行など。**サイトには表示されません**（アプリ側で除外済み）。

スプレッドシート整理として:

- **公開** 列を `非公開` に一括変更、または
- 行ごと削除

---

## 確定後の確認 URL

| slug 例 | URL |
|---------|-----|
| `hokkaido-sports-college-powerlifting` | `/club/hokkaido-sports-college-powerlifting` |
| `ashiri-za-puppet-theater` | `/post/…`（記事詳細） |
| `sapporo-digital-college` | `/school/sapporo-digital-college` |

競技一覧: `/sports`（13競技）  
北大フォーミュラ部: `/club/hokkaido-university-fomyura`（部活SNS 表示）
