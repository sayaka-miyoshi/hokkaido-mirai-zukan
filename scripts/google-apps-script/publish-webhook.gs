/**
 * スプレッドシート公開時に GitHub Actions + Vercel revalidate を呼ぶ GAS
 *
 * 設定:
 * 1. スクリプトプロパティに以下を設定
 *    REVALIDATE_URL = https://www.hokkaido-miraizukan.jp/api/revalidate
 *    REVALIDATE_SECRET = （.env の REVALIDATE_SECRET と同じ）
 *    GITHUB_DISPATCH_TOKEN = （repo スコープの PAT）
 *    GITHUB_REPO = sayaka-miyoshi/hokkaido-mirai-zukan
 * 2. スプレッドシートの onEdit / 時間主導トリガーで onSheetPublish を紐付け
 */
function onSheetPublish() {
  revalidateSiteCache_()
  triggerBuildArtifacts_()
}

function revalidateSiteCache_() {
  const url = PropertiesService.getScriptProperties().getProperty('REVALIDATE_URL')
  const secret = PropertiesService.getScriptProperties().getProperty('REVALIDATE_SECRET')
  if (!url || !secret) return

  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + secret },
    payload: JSON.stringify({ source: 'gas-sheet-update', tags: ['posts'] }),
    muteHttpExceptions: true,
  })
  Logger.log('revalidate: ' + res.getResponseCode() + ' ' + res.getContentText())
}

function triggerBuildArtifacts_() {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_DISPATCH_TOKEN')
  const repo = PropertiesService.getScriptProperties().getProperty('GITHUB_REPO')
  if (!token || !repo) return

  const res = UrlFetchApp.fetch('https://api.github.com/repos/' + repo + '/dispatches', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    payload: JSON.stringify({ event_type: 'sheet-updated' }),
    muteHttpExceptions: true,
  })
  Logger.log('dispatch: ' + res.getResponseCode() + ' ' + res.getContentText())
}
