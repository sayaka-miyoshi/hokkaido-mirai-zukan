/**
 * 問い合わせスプレッドシート保存用 Google Apps Script
 *
 * セットアップ:
 * 1. 問い合わせ用スプレッドシートに「問い合わせ」タブを作成
 * 2. 1行目に以下のヘッダーを入力:
 *    受付日時 | 学校名・企業名・団体名 | お名前 | メールアドレス |
 *    Instagram | 電話番号 | ご相談内容 | 対応状況 | 対応メモ
 * 3. 拡張機能 → Apps Script にこのコードを貼り付け
 * 4. スクリプトプロパティ CONTACT_SHEET_SECRET に秘密文字列を設定
 * 5. デプロイ → 新しいデプロイ → 種類: ウェブアプリ
 *    実行ユーザー: 自分 / アクセス: 全員
 * 6. 表示された URL を Vercel の CONTACT_SHEET_WEBAPP_URL に設定
 */

const SHEET_NAME = '問い合わせ'

const HEADERS = [
  '受付日時',
  '学校名・企業名・団体名',
  'お名前',
  'メールアドレス',
  'Instagram',
  '電話番号',
  'ご相談内容',
  '対応状況',
  '対応メモ',
]

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents)
    const secret = PropertiesService.getScriptProperties().getProperty('CONTACT_SHEET_SECRET')

    if (!secret || payload.secret !== secret) {
      return jsonResponse({ ok: false, error: 'unauthorized' })
    }

    const sheet = getOrCreateSheet()
    ensureHeaders(sheet)

    const row = payload.row
    sheet.appendRow([
      row['受付日時'] || '',
      row['学校名・企業名・団体名'] || '',
      row['お名前'] || '',
      row['メールアドレス'] || '',
      row['Instagram'] || '',
      row['電話番号'] || '',
      row['ご相談内容'] || '',
      row['対応状況'] || '未対応',
      row['対応メモ'] || '',
    ])

    return jsonResponse({ ok: true })
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) })
  }
}

function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = spreadsheet.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME)
  }
  return sheet
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
