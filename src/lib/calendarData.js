import { supabase } from './supabaseClient'
import { generateRoomCode } from './roomCode'

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

// rooms 테이블에 새 방을 만들고 방 코드를 돌려줌. 코드 충돌 시 몇 차례 재시도.
export async function createRoom(title, expectedCount) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode()
    const { error } = await supabase
      .from('rooms')
      .insert({ code, title, expected_count: expectedCount ?? null })
    if (!error) return code
    if (error.code !== '23505') throw error
  }
  throw new Error('방 코드를 생성하지 못했어요.')
}

// 방 제목/예상 인원을 불러옴. rooms에 정보가 없거나(예: 이 기능 이전에 만들어진 방)
// 조회 자체가 실패해도 null을 돌려주고, 호출부는 "이름 없는 약속"으로 대체함.
export async function loadRoomInfo(roomCode) {
  const { data, error } = await supabase
    .from('rooms')
    .select('title, expected_count')
    .eq('code', roomCode)
    .maybeSingle()
  if (error || !data) return null
  return { title: data.title, expectedCount: data.expected_count }
}

// 인원수가 설정된 방이면 "응답 3/4", 아니면 "3명 응답"으로 표시.
export function formatResponseCount(respondedCount, expectedCount) {
  return expectedCount ? `응답 ${respondedCount}/${expectedCount}` : `${respondedCount}명 응답`
}

// 이 방에 해당 이름으로 저장된 선택이 이미 있는지 확인.
// (선택을 하나도 안 한 사람은 행이 없으므로 감지되지 않음 — 현재 데이터 모델의 한계)
export async function checkNameTaken(roomCode, name) {
  const { data, error } = await supabase
    .from('selections')
    .select('name')
    .eq('room_code', roomCode)
    .eq('name', name)
    .limit(1)

  if (error) throw error
  return data.length > 0
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
