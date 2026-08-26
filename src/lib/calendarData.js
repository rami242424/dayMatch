import { supabase } from './supabaseClient'
import { generateRoomCode } from './roomCode'
import {
  WEEKDAYS,
  STATUSES,
  STATUS_MARK,
  STATUS_LABEL,
  isPlainObject,
  formatResponseCount,
  formatDate,
  formatDateLabel,
  buildMonthGrid,
  getDateMarks,
  collectVotedDates,
  formatRelativeTime,
} from './dateHelpers'

// 순수 함수(날짜/집계 계산)는 dateHelpers.js로 옮기고 여기서는 그대로 re-export합니다.
// 컴포넌트들은 지금처럼 '../lib/calendarData'에서 그대로 가져다 쓰면 됩니다.
export {
  WEEKDAYS,
  STATUSES,
  STATUS_MARK,
  STATUS_LABEL,
  formatResponseCount,
  formatDate,
  formatDateLabel,
  buildMonthGrid,
  getDateMarks,
  collectVotedDates,
  formatRelativeTime,
}

export const DEFAULT_ROOM_TITLE = '이름 없는 약속'

// 방 데이터는 Supabase의 selections 테이블(room_code / name / date / level)에 저장됨.
// 저장소를 다른 백엔드로 바꿀 때는 이 파일의 load/upsert/delete 함수 내부만 교체하면 됨.

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

// 이 기기에서 최근에 들어간 방 목록: [{ code, title, visitedAt }], 최대 RECENT_ROOMS_MAX개.
const RECENT_ROOMS_KEY = 'daymatch:recent-rooms'
const RECENT_ROOMS_MAX = 5

function loadRecentRoomsRaw() {
  try {
    const raw = localStorage.getItem(RECENT_ROOMS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveRecentRoomsRaw(rooms) {
  localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(rooms))
}

// 최근 방문 순으로 정렬된 최대 5개 목록.
export function getRecentRooms() {
  return loadRecentRoomsRaw()
    .slice()
    .sort((a, b) => b.visitedAt - a.visitedAt)
    .slice(0, RECENT_ROOMS_MAX)
}

// 방에 들어갈 때마다 호출: 방문 시각을 지금으로 갱신하고 목록 맨 앞으로 올림.
// title을 안 넘기면 기존에 저장된 제목(없으면 기본값)을 유지.
export function recordRoomVisit(roomCode, title) {
  const rooms = loadRecentRoomsRaw()
  const existing = rooms.find((r) => r.code === roomCode)
  const resolvedTitle = title || existing?.title || DEFAULT_ROOM_TITLE
  const next = rooms.filter((r) => r.code !== roomCode)
  next.push({ code: roomCode, title: resolvedTitle, visitedAt: Date.now() })
  next.sort((a, b) => b.visitedAt - a.visitedAt)
  saveRecentRoomsRaw(next.slice(0, RECENT_ROOMS_MAX))
}

// 방 제목이 나중에 확정되면(Supabase 조회 이후) 방문 시각은 그대로 두고 제목만 갱신.
export function updateRecentRoomTitle(roomCode, title) {
  const rooms = loadRecentRoomsRaw()
  const idx = rooms.findIndex((r) => r.code === roomCode)
  if (idx === -1) return
  rooms[idx] = { ...rooms[idx], title }
  saveRecentRoomsRaw(rooms)
}

// 최근 참여 목록에서만 지움. 방 자체나 서버 데이터는 건드리지 않음.
export function removeRecentRoom(roomCode) {
  saveRecentRoomsRaw(loadRecentRoomsRaw().filter((r) => r.code !== roomCode))
}
