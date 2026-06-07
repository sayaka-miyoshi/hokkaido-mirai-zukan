/**
 * 承認済み: 企業訪問 → 行政・自治体（シート1・B列）
 *
 * 使い方:
 * 1. スプレッドシート「学校・部活検索データ」を開く
 * 2. 拡張機能 → Apps Script
 * 3. この関数を貼り付け → applyApprovedGenreUpdate を実行
 */

function applyApprovedGenreUpdate() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
  const genreCol = 2 // B列「ジャンル」
  const targetRows = [90, 91, 144]
  const fromGenre = '企業訪問'
  const toGenre = '行政・自治体'

  const updatedTitles = []

  targetRows.forEach((row) => {
    const genreCell = sheet.getRange(row, genreCol)
    const title = sheet.getRange(row, 1).getValue()
    if (genreCell.getValue() === fromGenre) {
      genreCell.setValue(toGenre)
      updatedTitles.push(String(title))
    }
  })

  Logger.log('更新件数: ' + updatedTitles.length)
  updatedTitles.forEach((t, i) => Logger.log(i + 1 + '. ' + t))
}
