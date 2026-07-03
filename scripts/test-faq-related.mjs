/**
 * Phase 2A ユニットテスト（FAQ・関連記事ロジック）
 * node scripts/test-faq-related.mjs
 */
import assert from 'node:assert/strict'

function parseFaqJson(raw) {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const parsed = JSON.parse(trimmed)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    const items = []
    for (const entry of parsed) {
      const question = String(entry.q ?? entry.question ?? '').trim()
      const answer = String(entry.a ?? entry.answer ?? '').trim()
      if (question && answer) items.push({ question, answer })
    }
    return items.length > 0 ? items : null
  } catch {
    return null
  }
}

function getRelatedSportPosts(current, allPosts) {
  const sport = current.sportCategory.trim()
  if (!sport) return []
  return allPosts.filter(
    (post) =>
      post.id !== current.id &&
      post.sportCategory.trim() === sport &&
      (post.schoolName !== current.schoolName || post.clubName !== current.clubName),
  )
}

const lacrosseHokudai = {
  id: '1',
  schoolName: '北海道大学',
  clubName: 'ラクロス部',
  sportCategory: 'ラクロス',
}

const lacrosseHokkai = {
  id: '2',
  schoolName: '北海学園大学',
  clubName: 'ラクロス部',
  sportCategory: 'ラクロス',
}

const soccerPost = {
  id: '3',
  schoolName: '札幌大学',
  clubName: 'サッカー部',
  sportCategory: 'サッカー',
}

assert.equal(parseFaqJson('[{"q":"Q","a":"A"}]')?.[0].question, 'Q')
assert.equal(parseFaqJson('invalid'), null)

const crossSchool = getRelatedSportPosts(lacrosseHokudai, [
  lacrosseHokudai,
  lacrosseHokkai,
  soccerPost,
])
assert.equal(crossSchool.length, 1)
assert.equal(crossSchool[0].schoolName, '北海学園大学')

console.log('✅ test-faq-related 完了')
