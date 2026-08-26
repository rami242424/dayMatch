// 날짜/집계 관련 순수 함수 모음.
// Supabase 등 외부 의존성이 전혀 없어서 테스트하기 쉽습니다.
// (calendarData.js에서 옮겨왔고, calendarData.js는 이 파일을 re-export합니다.)

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export const STATUSES = ['no', 'ok', 'good']
export const STATUS_MARK = { no: '✕', ok: '△', good: '◎' }
export const STATUS_LABEL = { no: '바빠요', ok: '괜찮아요', good: '좋아요' }

export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// 인원수가 설정된 방이면 "응답 3/4", 아니면 "3명 응답"으로 표시.
export function formatResponseCount(respondedCount, expectedCount) {
  return expectedCount ? `응답 ${respondedCount}/${expectedCount}` : `${respondedCount}명 응답`
}

export function formatDate(year, month, day) {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

export function formatDateLabel(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()]
  return `${month}월 ${day}일 (${weekday})`
}

export function buildMonthGrid(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day)
  }
  return cells
}

// { no: [names], ok: [names], good: [names] } for one date across everyone
export function getDateMarks(allSelections, dateStr) {
  const marks = { no: [], ok: [], good: [] }
  for (const person of Object.keys(allSelections)) {
    const status = allSelections[person]?.[dateStr]
    if (STATUSES.includes(status)) {
      marks[status].push(person)
    }
  }
  return marks
}

// every date string that at least one person has assigned a valid status to
export function collectVotedDates(allSelections) {
  const dates = new Set()
  for (const person of Object.keys(allSelections)) {
    const personSelections = allSelections[person]
    if (!isPlainObject(personSelections)) continue
    for (const dateStr of Object.keys(personSelections)) {
      if (STATUSES.includes(personSelections[dateStr])) {
        dates.add(dateStr)
      }
    }
  }
  return dates
}

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const MONTH = 30 * DAY
const YEAR = 365 * DAY

// "3일 전" 같은 상대 시간 문자열로 변환.
export function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp
  if (diff < MINUTE) return '방금 전'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`
  if (diff < MONTH) return `${Math.floor(diff / DAY)}일 전`
  if (diff < YEAR) return `${Math.floor(diff / MONTH)}개월 전`
  return `${Math.floor(diff / YEAR)}년 전`
}
