export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export const STATUSES = ['no', 'ok', 'good']
export const STATUS_MARK = { no: '✕', ok: '△', good: '◎' }
export const STATUS_LABEL = { no: '바빠요', ok: '괜찮아요', good: '좋아요' }

// 모든 방의 데이터가 이 키 하나 아래에 { [방코드]: { [이름]: { [날짜]: status } } } 형태로 저장됨.
// 저장소를 서버 기반으로 바꿀 때는 이 파일의 load/save 함수만 교체하면 됨.
const ROOMS_KEY = 'daymatch:rooms'

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Drops anything that doesn't match { [name]: { [dateStr]: status } },
// e.g. leftover/corrupted data from an older storage format.
function sanitizeRoomSelections(value) {
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

function loadAllRooms() {
  try {
    const raw = localStorage.getItem(ROOMS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return isPlainObject(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function saveAllRooms(allRooms) {
  localStorage.setItem(ROOMS_KEY, JSON.stringify(allRooms))
}

export function loadRoomSelections(roomCode) {
  const allRooms = loadAllRooms()
  return sanitizeRoomSelections(allRooms[roomCode])
}

export function saveRoomSelections(roomCode, selections) {
  const allRooms = loadAllRooms()
  allRooms[roomCode] = selections
  saveAllRooms(allRooms)
}

// 방마다 다른 이름을 쓸 수 있도록 { [방코드]: 이름 } 형태로 따로 저장.
const ROOM_NAMES_KEY = 'daymatch:room-names'
// 가장 최근에 입력한 이름. 새 방에 처음 들어갔을 때 기본값으로 사용.
const LAST_NAME_KEY = 'daymatch:last-name'

function loadAllRoomNames() {
  try {
    const raw = localStorage.getItem(ROOM_NAMES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return isPlainObject(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function loadRoomName(roomCode) {
  const roomNames = loadAllRoomNames()
  return typeof roomNames[roomCode] === 'string' ? roomNames[roomCode] : ''
}

export function saveRoomName(roomCode, name) {
  const roomNames = loadAllRoomNames()
  roomNames[roomCode] = name
  localStorage.setItem(ROOM_NAMES_KEY, JSON.stringify(roomNames))
  localStorage.setItem(LAST_NAME_KEY, name)
}

export function loadLastName() {
  return localStorage.getItem(LAST_NAME_KEY) || ''
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
