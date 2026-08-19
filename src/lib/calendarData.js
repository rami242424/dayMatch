import { supabase } from './supabaseClient'

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export const STATUSES = ['no', 'ok', 'good']
export const STATUS_MARK = { no: '✕', ok: '△', good: '◎' }
export const STATUS_LABEL = { no: '바빠요', ok: '괜찮아요', good: '좋아요' }

// 방 데이터는 Supabase의 selections 테이블(room_code / name / date / level)에 저장됨.
// 저장소를 다른 백엔드로 바꿀 때는 이 파일의 load/upsert/delete 함수 내부만 교체하면 됨.

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// { [name]: { [dateStr]: status } } 형태로 이 방의 전체 선택 데이터를 불러옴.
export async function loadRoomSelections(roomCode) {
  const { data, error } = await supabase
    .from('selections')
    .select('name, date, level')
    .eq('room_code', roomCode)

  if (error) throw error

  const selections = {}
  for (const row of data) {
    if (!STATUSES.includes(row.level)) continue
    if (!selections[row.name]) selections[row.name] = {}
    selections[row.name][row.date] = row.level
  }
  return selections
}

// 한 사람의 한 날짜 선택을 저장. (room_code, name, date) unique 제약 덕분에
// 같은 날짜를 다시 찍으면 upsert로 자연스럽게 덮어써짐.
export async function upsertSelection(roomCode, name, dateStr, status) {
  const { error } = await supabase
    .from('selections')
    .upsert(
      { room_code: roomCode, name, date: dateStr, level: status },
      { onConflict: 'room_code,name,date' },
    )
  if (error) throw error
}

// 선택 해제 시 그 행을 삭제.
export async function deleteSelection(roomCode, name, dateStr) {
  const { error } = await supabase
    .from('selections')
    .delete()
    .eq('room_code', roomCode)
    .eq('name', name)
    .eq('date', dateStr)
  if (error) throw error
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
