// ResultsListView.jsx에 있던 그룹 분류 + 정렬 로직을 테스트 가능하도록 분리한 파일.
import { collectVotedDates, getDateMarks } from './dateHelpers'

export const GROUPS = [
  { key: 'all-ok', label: '전원 가능', match: (noCount) => noCount === 0 },
  { key: 'one-no', label: '1명만 빼고 가능', match: (noCount) => noCount === 1 },
  { key: 'many-no', label: '2명 이상 불가', match: (noCount) => noCount >= 2 },
]

// 응답이 있는 날짜만 모아서, 가능 인원 수 → 좋아요 수 → 괜찮아요 수 → 날짜 순으로 정렬.
// "안됨"은 점수에 넣지 않고 그룹 필터(GROUPS)로만 쓴다 — README "구현 포인트 1" 참고.
export function buildResultRows(allSelections) {
  const rows = [...collectVotedDates(allSelections)].map((dateStr) => {
    const marks = getDateMarks(allSelections, dateStr)
    const goodCount = marks.good.length
    const okCount = marks.ok.length
    const noCount = marks.no.length
    return {
      dateStr,
      marks,
      goodCount,
      okCount,
      noCount,
      availableCount: goodCount + okCount,
      respondedCount: goodCount + okCount + noCount,
    }
  })

  rows.sort((a, b) => {
    if (b.availableCount !== a.availableCount) return b.availableCount - a.availableCount
    if (b.goodCount !== a.goodCount) return b.goodCount - a.goodCount
    if (b.okCount !== a.okCount) return b.okCount - a.okCount
    return a.dateStr < b.dateStr ? -1 : 1
  })

  return rows
}
