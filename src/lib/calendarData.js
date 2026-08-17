export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export const STATUSES = ['no', 'ok', 'good']
export const STATUS_MARK = { no: '✕', ok: '△', good: '◎' }
export const STATUS_LABEL = { no: '바빠요', ok: '괜찮아요', good: '좋아요' }

const SELECTIONS_KEY = 'daymatch:selections'

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Drops anything that doesn't match { [name]: { [dateStr]: status } },
// e.g. leftover data from the old flat { [dateStr]: status } format that
// used to live under this same localStorage key.
function sanitizeAllSelections(value) {
  if (!isPlainObject(value)) return {}

  const clean = {}
  for (const person of Object.keys(value)) {
    const personSelections = value[person]
    if (!isPlainObject(personSelections)) continue

    const cleanPersonSelections = {}
    for (const dateStr of Object.keys(personSelections)) {
      const status = personSelections[dateStr]
      if (STATUSES.includes(status)) {
        cleanPersonSelections[dateStr] = status
      }
    }
    clean[person] = cleanPersonSelections
  }
  return clean
}

export function loadAllSelections() {
  try {
    const raw = localStorage.getItem(SELECTIONS_KEY)
    return raw ? sanitizeAllSelections(JSON.parse(raw)) : {}
  } catch {
    return {}
  }
}

export function saveAllSelections(allSelections) {
  localStorage.setItem(SELECTIONS_KEY, JSON.stringify(allSelections))
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
