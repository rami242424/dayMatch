# daymatch : 면접용 질문

> 여러 명이 되는 날짜를 표시해 공통으로 좋은 날을 찾는 그룹 일정 조율 웹앱 (React · Vite · JavaScript · React Router · Supabase)

daymatch를 만들며 실제로 부딪히고 판단했던 지점들을 정리했습니다. 코드 조각은 전부 실제 프로젝트에서 가져왔습니다.

---

## 1. 방마다 6자리 코드를 부여하고 `/r/{코드}`로 라우팅을 분리한 이유가 무엇인가요?

**질문 이유:** 로그인 없는 서비스에서 데이터 격리와 URL 설계를 어떻게 판단했는지 확인하기 위해.

**답변:**
이 앱은 로그인이 없는 대신, "누가 이 데이터를 볼 수 있는가"를 URL 하나로 정의해야 했습니다. React Router로 `/r/:code` 라우트 하나만 두고, 코드별로 완전히 분리된 데이터를 Supabase에서 `room_code` 컬럼으로 필터링합니다. 코드는 `0/O`, `1/l/I`처럼 헷갈리는 문자를 제외한 32자 알파벳에서 6자리를 뽑는 방식으로 생성합니다.

```js
const CODE_LENGTH = 6
// 0/O, 1/l/I처럼 헷갈리는 글자는 제외
const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'

export function generateRoomCode() {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return code
}
```

충돌 가능성을 완전히 배제할 수는 없어서, `rooms` 테이블 insert가 unique violation(`error.code === '23505'`)으로 실패하면 최대 5번까지 새 코드로 재시도합니다.

```js
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
```

> 코드가 6자리인데 충돌 확률은 계산해봤나요?
> 32^6 ≈ 10억 개의 조합이라 이 규모의 트래픽에서 실제로 충돌이 날 확률은 사실상 0에 가깝습니다. 재시도 로직은 확률이 높아서 넣은 게 아니라, 값싸게 넣을 수 있는 방어막이라 넣었습니다 — "일어날 가능성이 낮다"와 "일어났을 때 대응이 없다"는 다른 문제라고 생각합니다.

---

## 2. 상태 관리 라이브러리(Redux, Zustand 등)를 쓰지 않은 이유는 무엇인가요?

**질문 이유:** 라이브러리 도입 여부를 어떤 기준으로 판단하는지 확인하기 위해.

**답변:**
여러 컴포넌트가 공유해야 하는 상태가 사실상 `allSelections` 하나뿐이고, 그마저도 `Calendar`와 `Results`가 화면에 진입할 때마다 각자 Supabase에서 새로 불러오는 구조라 전역 스토어로 유지할 이유가 없었습니다. `Room.jsx`가 화면 전환(`screen: 'name' | 'confirm' | 'input' | 'result'`)과 공통 데이터(`name`, `roomTitle`, `expectedCount`)를 관리하고, 나머지는 props로 흘려보냅니다.

```js
const [name, setName] = useState('')
const [screen, setScreen] = useState('name')
const [roomTitle, setRoomTitle] = useState(DEFAULT_ROOM_TITLE)
const [expectedCount, setExpectedCount] = useState(null)
```

상태 트리가 3~4단계 이상 깊어지지 않는 한, prop drilling이 오히려 "이 값이 어디서 와서 어디로 가는지"를 코드만 보고 추적하기 쉽다고 판단했습니다.

> 만약 참여자들이 서로의 선택을 실시간으로 봐야 한다면요?
> Supabase Realtime 구독을 붙여야 하고, 그 시점엔 여러 컴포넌트가 같은 스트림을 구독해야 하니 Context나 커스텀 훅으로 한 단계 끌어올릴 것 같습니다. 다만 지금은 화면 진입 시 1회 로드로 충분하다고 판단해서, 실시간 동기화는 의도적으로 로드맵에 남겨뒀습니다.

---

## 3. 화면에서 다루는 데이터 구조를 `{ 이름: { 날짜: 상태 } }`로 잡은 이유는 무엇인가요?

**질문 이유:** 자료구조 설계와 접근 패턴에 대한 이해를 확인하기 위해.

**답변:**
가장 빈번한 연산은 "본인의 선택을 수정하는 것"입니다. 이름을 바깥 키로 두면 `allSelections[name]` 한 곳만 spread해서 갈아끼우면 됩니다.

```js
setAllSelections((prev) => {
  const personSelections = { ...(prev[name] || {}) }
  if (nextStatus === null) {
    delete personSelections[dateStr]
  } else {
    personSelections[dateStr] = nextStatus
  }
  return { ...prev, [name]: personSelections }
})
```

날짜를 바깥 키로 뒀다면 특정 사람의 선택을 바꿀 때마다 모든 날짜를 순회하며 그 사람을 찾아야 해서 더 번거로웠을 겁니다. 반대로 결과 화면에서 "이 날짜에 누가 뭘 찍었는지" 조회할 때는 매번 `Object.keys(allSelections)`를 순회하며 그때그때 재구성합니다 — 조회는 상대적으로 드물게 일어나는 연산이라 이 비용은 감수할 만하다고 봤습니다.

```js
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
```

> 실제 DB 스키마도 이 구조인가요?
> 아니요. Supabase의 `selections` 테이블은 `(room_code, name, date, level)` 행 단위로 저장되는 정규화된 구조입니다. `loadRoomSelections`가 그 행들을 화면용 중첩 객체로 조립하는 어댑터 역할을 합니다. DB는 unique 제약과 upsert에 유리한 평평한 구조가, 화면은 "내 선택 갱신"에 유리한 중첩 구조가 각각 더 맞아서 일부러 다르게 가져갔습니다.

---

## 4. 선택을 저장할 때 upsert와 unique 제약을 함께 쓴 이유는 무엇인가요?

**질문 이유:** DB 설계와 중복 방지 전략을 확인하기 위해.

**답변:**
같은 `(room_code, name, date)` 조합으로 행이 여러 개 쌓이면 그 날짜에 대한 "최종 상태"가 모호해집니다. 사용자가 바빠요 → 좋아요로 마음을 바꿔 재선택할 때마다 새 행이 쌓이면 집계에서 중복 카운트가 발생합니다. `(room_code, name, date)`에 unique 제약을 걸고 `onConflict`를 지정한 upsert를 쓰면, 같은 키로 다시 써도 항상 정확히 한 행만 존재한다는 걸 DB 레벨에서 보장받습니다.

```js
export async function upsertSelection(roomCode, name, dateStr, status) {
  const { error } = await supabase
    .from('selections')
    .upsert(
      { room_code: roomCode, name, date: dateStr, level: status },
      { onConflict: 'room_code,name,date' },
    )
  if (error) throw error
}
```

선택을 아예 해제할 때는 값 자체가 없어져야 하니 upsert가 아니라 `deleteSelection`으로 행을 지웁니다.

> 두 기기에서 동시에 같은 이름으로 같은 날짜를 다르게 누르면 어떻게 되나요?
> 나중에 도착한 요청이 이깁니다(last-write-wins). 로그인 없이 이름만으로 사용자를 식별하는 현재 모델의 한계와 맞닿아 있는 부분입니다. 정말 중요해지면 행에 `updated_at`을 추가해 클라이언트가 충돌을 감지하게 만들 수 있겠지만, 지금 규모에서는 과한 설계라고 봤습니다.

---

## 5. 낙관적 업데이트(optimistic update)를 도입한 이유와 실패했을 때 처리 방식은?

**질문 이유:** 비동기 UX 설계와 실패 처리에 대한 인식을 확인하기 위해.

**답변:**
날짜를 클릭할 때마다 서버 응답을 기다리면 클릭 한 번마다 화면이 멈칫합니다. 그래서 화면 상태를 먼저 갱신하고, 실제 저장 요청은 그 다음에 보냅니다.

```js
async function handleDayClick(day) {
  if (!activeMode) return
  const dateStr = formatDate(year, month, day)
  if (dateStr < todayStr) return
  const isUnselecting = mySelections[dateStr] === activeMode
  const nextStatus = isUnselecting ? null : activeMode

  setAllSelections((prev) => { /* 화면 먼저 갱신 */ })

  setSaveError(null)
  try {
    if (nextStatus === null) {
      await deleteSelection(roomCode, name, dateStr)
    } else {
      await upsertSelection(roomCode, name, dateStr, nextStatus)
    }
  } catch {
    setSaveError('저장하지 못했어요. 다시 시도해주세요.')
  }
}
```

요청이 실패하면 에러 메시지만 보여주고 화면 상태를 자동으로 되돌리지는 않습니다. 단순 토글 작업이라 사용자가 에러를 보고 같은 칸을 다시 누르면 자연스럽게 재시도가 되는 구조로도 충분하다고 판단했습니다.

> 실패했는데도 화면엔 낙관적으로 반영된 상태가 남아있으면, 새로고침 전까지 실제 DB와 화면이 어긋나는 거 아닌가요?
> 맞습니다. 이건 현재 구현의 명백한 한계로 인지하고 있습니다. 롤백을 안 넣은 이유는, 이 앱의 실제 사용 패턴상(지인들끼리 캘린더 채우기) 저장 실패가 대부분 네트워크 순단 수준이고 재시도 비용이 낮아서, 자동 롤백 로직을 넣는 복잡도보다 "에러 메시지 보고 다시 누르기"가 더 단순하다고 봤습니다. 다만 트래픽이 늘거나 저장 실패가 잦아지면 실패 시 자동 롤백이나 재시도 큐를 붙이는 게 맞는 방향이라고 생각합니다.

---

## 6. "안 되는 날"을 점수에 합산하지 않고 필터로만 쓴 이유는 무엇인가요?

**질문 이유:** 도메인 로직과 집계 설계에 대한 판단 기준을 확인하기 위해.

**답변:**
좋음 3 + 안됨 1과 좋음 2 + 안됨 0을 단순 합산하면 둘 다 7점이 되어버립니다. 하지만 실제로는 한 명이라도 못 오면 그 날짜는 약속으로 성립하지 않습니다. 그래서 "안됨" 개수는 점수에 넣지 않고, 그룹을 나누는 필터로만 사용했습니다.

```js
const GROUPS = [
  { key: 'all-ok', label: '전원 가능', match: (noCount) => noCount === 0 },
  { key: 'one-no', label: '1명만 빼고 가능', match: (noCount) => noCount === 1 },
  { key: 'many-no', label: '2명 이상 불가', match: (noCount) => noCount >= 2 },
]

rows.sort((a, b) => {
  if (b.availableCount !== a.availableCount) return b.availableCount - a.availableCount
  if (b.goodCount !== a.goodCount) return b.goodCount - a.goodCount
  if (b.okCount !== a.okCount) return b.okCount - a.okCount
  return a.dateStr < b.dateStr ? -1 : 1
})
```

그룹 안에서는 가능 인원(`availableCount` = good + ok) → 좋아요 수 → 괜찮아요 수 순으로 정렬해서, "가능한 사람이 많고, 그중에서도 진짜 선호하는 사람이 많은 날"이 위로 오게 했습니다.

> 이 정렬 기준을 사용자가 바꿀 수 있게 할 계획은요?
> 아직 없습니다. 소규모 그룹(친구·가족 단위) 사용을 가정하면 정렬 취향이 갈릴 만큼 사용 케이스가 다양하지 않다고 봤고, 선택지를 늘리면 오히려 "이 앱을 왜 이렇게 써야 하지"라는 인지 부하만 커진다고 판단해 의도적으로 고정했습니다.

---

## 7. 결과 화면 히트맵에서 "아무도 응답 안 한 날"과 "0명 가능한 날"을 어떻게 구분했나요?

**질문 이유:** 세밀한 UI 상태 설계와 명료성에 대한 감각을 확인하기 위해.

**답변:**
`totalVotes`(= `noCount` + `availableCount`)가 0이면 heat 클래스 자체를 붙이지 않고 버튼을 비활성화해서, 배경과 테두리가 전혀 없는 빈 칸으로 남습니다. `totalVotes`가 0보다 크지만 `availableCount`가 0인 날(전원 바빠요)은 `heat-0` 클래스가 붙어 "투표는 됐지만 아무도 못 오는 날"로 구분됩니다.

```js
function heatClass(availableCount) {
  const level = Math.min(availableCount, 5)
  return `heat-${level}`
}
// ...
const classNames = ['day']
if (isCurrentMonth && day === todayDate) classNames.push('today')
if (totalVotes > 0) classNames.push(heatClass(availableCount))
```

이 구분이 없으면 "아직 아무도 안 찍은 날"과 "다들 찍었는데 전원 바쁜 날"이 똑같은 빈 칸으로 보여서, 방장이 "언제까지 응답을 더 기다려야 하나"를 판단할 근거가 사라집니다.

> heat-0과 진짜 빈 칸을 색 농도로만 구분하면 색약 사용자는 구분이 안 되지 않나요?
> 그래서 `day-badge`에 실제 가능 인원 숫자를 항상 같이 표시하도록 했습니다. 색 농도는 보조 신호일 뿐이고, 확정적인 정보는 항상 숫자·기호로 함께 준다는 원칙을 이 프로젝트 전체에서 지키려고 했습니다.

---

## 8. 같은 이름으로 재참여하는 경우를 어떻게 처리했나요? 로그인 없이 어떻게 "본인"임을 신뢰하나요?

**질문 이유:** 인증 없는 서비스에서 신원 확인을 어디까지 설계할지에 대한 트레이드오프 판단을 확인하기 위해.

**답변:**
로그인을 넣지 않는 대신, 이름을 입력할 때 그 방에 이미 같은 이름의 `selections` 행이 있으면 무조건 통과시키지 않고 확인 화면을 보여줍니다.

```js
async function handleNameSubmit(newName) {
  setChecking(true)
  setCheckError(null)
  try {
    const taken = await checkNameTaken(roomCode, newName)
    if (taken) {
      setPendingName(newName)
      setScreen('confirm')
    } else {
      proceedWithName(newName)
    }
  } catch {
    setCheckError('이름 확인에 실패했어요. 다시 시도해주세요.')
  } finally {
    setChecking(false)
  }
}
```

"본인이에요"를 누르면 그 이름으로 계속 진행해 기존 데이터를 이어서 수정하고, "다른 사람이에요"를 누르면 안내 문구와 함께 이름 입력으로 되돌립니다. 이건 완벽한 인증이 아니라, 다른 기기에서 재접속하는 흔한 케이스는 막지 않으면서 "실수로 남의 데이터를 덮어쓰는 사고"만 막는 최소한의 안전장치입니다.

> 악의적으로 남의 이름을 골라서 들어오면 막을 방법이 없는 거죠?
> 맞습니다, 막을 수 없습니다. 이 앱이 가정하는 신뢰 범위는 "링크를 공유받은 소규모 지인 그룹"이라, 프로덕션 수준의 신원 위조 방어는 스코프 밖으로 뒀습니다. 요구사항이 불특정 다수 대상으로 바뀌면 로그인이나 기기별 토큰이 필요하다는 걸 인지하고 있고, 이 판단 근거는 코드 주석으로도 남겨뒀습니다.

---

## 9. 입력 화면에는 본인 선택만 보이고, 다른 사람의 선택은 결과 화면에서만 공개한 이유는?

**질문 이유:** 행동 편향(앵커링 효과)에 대한 이해와 공개 범위 설계 능력을 확인하기 위해.

**답변:**
입력 달력에 다른 사람의 집계까지 같이 보여줄 수도 있었지만, 그러면 먼저 응답한 사람 쪽으로 이후 응답이 쏠리는 앵커링 효과가 생깁니다. 이미 다수가 "좋아요"를 찍은 날에 혼자 "바빠요"를 선택하기는 심리적으로 어렵습니다. 그래서 `Calendar`는 `allSelections[name]`만 `mySelections`로 뽑아 쓰고, 전체 집계는 `Results`에서만 노출합니다.

```js
const mySelections = allSelections[name] || {}
const respondedCount = Object.keys(allSelections).length
```

> 그럼 방장은 응답 진행 상황조차 못 보나요?
> 아니요, "몇 명이 응답했는지"라는 진행률(`formatResponseCount`)은 입력 화면에도 노출합니다. 숨기는 건 "누가 무엇을 찍었는지"라는 내용이지, "몇 명이 참여했는지"라는 진행 상태가 아닙니다 — 이 둘을 구분한 게 이 기능에서 가장 신경 쓴 판단이었습니다.

---

## 10. 존재하지 않는 방 코드를 입력해도 안내 없이 새 방처럼 진입되던 문제는 어떻게 발견하고 고쳤나요?

**질문 이유:** 최근에 실제로 겪은 버그의 원인 분석과 해결 능력을 확인하기 위해.

**답변:**
`selections` 테이블의 `room_code`는 `rooms` 테이블과 외래키로 연결돼 있지 않아서, `rooms`에 없는 코드로 `/r/{코드}`에 들어가도 이름 입력과 날짜 선택이 그대로 동작했습니다. 링크로 들어오는 경로는 코드가 항상 정확하지만, 홈 화면에서 코드를 직접 입력해 참여하는 경로는 오타가 날 수 있습니다. 검증 없이 이동시키면 오타를 낸 사람이 자기도 모르게 아무도 못 보는 빈 방에 응답을 쌓게 됩니다.

```js
async function handleJoin(e) {
  e.preventDefault()
  const trimmed = codeInput.trim().toLowerCase()
  if (!trimmed) return

  setJoining(true)
  setJoinError(null)
  try {
    const info = await loadRoomInfo(trimmed)
    if (!info) {
      setJoinError('존재하지 않는 코드예요. 코드를 다시 확인해주세요.')
      setJoining(false)
      return
    }
    navigate(`/r/${trimmed}`)
  } catch {
    setJoinError('코드를 확인하지 못했어요. 다시 시도해주세요.')
    setJoining(false)
  }
}
```

이동 전에 `loadRoomInfo`로 방의 존재를 먼저 확인하고, 없으면 이동을 막고 안내 메시지를 보여주도록 고쳤습니다.

> 근본적으로는 DB에 외래키를 거는 게 맞지 않나요?
> 맞습니다. 다만 `selections`에 `room_code` 외래키를 걸면, 이 기능 이전에 `rooms` 없이 만들어진 방들과의 마이그레이션을 신경 써야 해서 이번엔 애플리케이션 레벨 검증으로 먼저 막았고, DB 제약 추가는 다음 단계로 남겨뒀습니다.

---

## 11. 지난 날짜는 입력 화면에서만 막고 결과 화면에서는 그대로 둔 이유는?

**질문 이유:** 화면별 요구사항을 구분해서 판단하는 능력을 확인하기 위해.

**답변:**
`Calendar`의 클릭 핸들러에서 `dateStr < todayStr` 문자열 비교로 과거 날짜 선택을 막고, "이전 달" 버튼도 이번 달을 보고 있을 때는 비활성화합니다.

```js
if (isCurrentMonth && day === todayDate) classNames.push('today')
if (status) classNames.push(`status-${status}`)
if (isPast) classNames.push('past')
// ...
disabled={isPast}
```

반면 `Results`는 아무 제한이 없습니다. 지난 약속의 기록을 조회하는 것도 이 앱의 정당한 사용 목적이기 때문입니다(예: "지난달엔 다들 언제가 됐었지" 확인). "수정을 막는 것"과 "조회를 막는 것"은 서로 다른 문제라 화면별로 나눠서 판단했습니다.

> 문자열 비교로 날짜를 비교하는 게 안전한가요?
> `YYYY-MM-DD`처럼 자릿수가 고정되고 왼쪽부터 큰 단위(연→월→일)인 포맷에서는 문자열 사전식 비교와 날짜 크기 비교가 정확히 일치합니다(ISO 8601이 이 성질을 위해 설계된 포맷입니다). `Date` 객체를 새로 만들어 비교하는 것보다 오히려 더 저렴하고 실수할 여지가 적다고 판단했습니다.

---

## 12. 이름을 localStorage에만 저장하고 서버에는 저장하지 않은 이유, 방마다 이름을 따로 저장한 이유는?

**질문 이유:** 저장 위치 판단과 개인정보 최소화 원칙에 대한 이해를 확인하기 위해.

**답변:**
"내가 누구인지"는 이 앱의 데이터 모델에서 사실상 개인 식별자입니다. `selections` 행의 `name` 컬럼에는 필연적으로 남지만, "이 기기가 최근에 어떤 이름들을 썼는지"는 순수한 클라이언트 편의 기능이라 서버에 별도로 저장할 필요가 없었습니다.

```js
const ROOM_NAMES_KEY = 'daymatch:room-names' // { [방코드]: 이름 }
const LAST_NAME_KEY = 'daymatch:last-name'   // 가장 최근에 쓴 이름

export function saveRoomName(roomCode, name) {
  const roomNames = loadAllRoomNames()
  roomNames[roomCode] = name
  localStorage.setItem(ROOM_NAMES_KEY, JSON.stringify(roomNames))
  localStorage.setItem(LAST_NAME_KEY, name)
}
```

한 사람이 방마다 다르게 불릴 수도 있어야 해서(방 A에서는 "라미", 방 B에서는 "오가람") `{ [방코드]: 이름 }` 형태로 방별 매핑을 두고, 그와 별도로 "가장 최근에 쓴 이름"을 저장해 새 방에 처음 들어갔을 때 기본값으로 채워줍니다.

> localStorage 대신 sessionStorage나 쿠키를 쓸 수도 있었을 텐데요?
> sessionStorage는 탭을 닫으면 사라져서 "다음에 또 올 때 이름을 안 쳐도 되는" 편의가 없어지고, 쿠키는 서버로 매 요청마다 자동 전송되는데 이 값은 서버가 알 필요가 없는 순수 클라이언트 상태라 오히려 불필요한 전송이 생깁니다. localStorage가 "브라우저에만 남고 서버는 몰라도 되는 상태"라는 요구사항에 가장 정확히 맞았습니다.

---

## 13. 인앱 브라우저(카카오톡) 호환성 문제는 어떻게 발견하고 대응했나요?

**질문 이유:** 실사용 환경 대응과 크로스 브라우저 이슈 해결 경험을 확인하기 위해.

**답변:**
이 앱은 카카오톡 링크 공유가 주요 유입 경로라 대부분의 사용자가 인앱 브라우저로 접속합니다. 인앱 브라우저는 엔진 버전이 낮아 최신 CSS를 무시하거나 다르게 처리할 수 있습니다. 실기기로 열어보니 레이아웃이 깨지는 걸 확인했고, 원인을 CSS 중첩 문법(`&` 셀렉터), 논리 속성(`border-inline`), 동적 뷰포트 단위(`100svh`) 세 가지로 좁혔습니다.

```css
#root {
  min-height: 100vh;   /* 구형 브라우저용 폴백을 먼저 선언 */
  min-height: 100svh;  /* 지원하는 브라우저만 이 값으로 덮어씀 */
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
}
```

빌드 단계에서도 방어선을 하나 더 뒀습니다. `vite.config.js`의 `build.cssTarget`을 낮은 엔진 버전까지 포함하도록 지정해서, 소스에서 놓친 문법이 있어도 빌드 시점에 esbuild가 다운레벨링하도록 이중으로 처리했습니다.

```js
export default defineConfig({
  plugins: [react()],
  build: {
    // 카카오톡 등 인앱 브라우저의 낮은 엔진 버전도 지원하기 위해 CSS 하위 호환 대상을 넓게 잡음
    cssTarget: ['chrome80', 'safari13', 'ios13'],
  },
})
```

> 실기기 없이 시뮬레이터로만 확인했으면 이 문제를 잡을 수 있었을까요?
> 아니요. 실제로 크롬 개발자 도구의 모바일 뷰에서는 재현되지 않았습니다. 화면 크기만 같을 뿐 렌더링 엔진과 OS 설정이 다르기 때문입니다. 이후로는 배포 후 실기기 인앱 브라우저 확인을 절차에 아예 포함시켰습니다.

---

## 14. 색 규칙(빨강/초록/파랑)과 기호(✕△◎)를 항상 같이 쓰도록 한 이유는?

**질문 이유:** 접근성에 대한 실제 적용 능력을 확인하기 위해.

**답변:**
적록 색각이상이 있으면 빨강/초록만으로는 "바빠요"와 "괜찮아요"를 구분하기 어렵습니다. 그래서 색이 쓰이는 모든 위치 — 모드 선택 버튼, 달력 칸, 결과 상세 — 에서 색과 기호를 항상 같이 렌더링하도록 상수로 고정했습니다.

```js
export const STATUS_MARK = { no: '✕', ok: '△', good: '◎' }
```

```jsx
<span className="mode-mark">{STATUS_MARK[status]}</span>
{STATUS_LABEL[status]}
```

결과 화면 히트맵은 파랑 농도 하나만 쓰지만, 이때도 `day-badge`에 가능 인원 숫자를 항상 병기해서 색만으로 정보를 전달하지 않는다는 원칙을 유지했습니다.

> 명도 대비까지 신경 썼나요?
> 라이트 테마를 명시적으로 고정했고(시스템 다크모드를 따라가지 않음), 새 색을 쓸 때마다 흰 배경(`#fff`) 대비 명도 대비를 계산해서 텍스트·기호는 4.5:1, 배경 같은 비텍스트 요소는 3:1을 기준으로 확인했습니다. 실제로 이름 입력창의 지우기 버튼 색을 정할 때, 처음 제안됐던 회색(`#9ca3af`)이 2.54:1로 기준에 못 미쳐서 4.84:1인 `#6b7280`으로 바꾼 적이 있습니다.

---

## 15. 로딩·에러 처리를 화면마다 반복해서 넣었는데, 공통 컴포넌트나 훅으로 뽑지 않은 이유는?

**질문 이유:** 중복 코드와 조기 추상화 사이의 균형 감각을 확인하기 위해.

**답변:**
`Calendar`와 `Results` 모두 `loading`/`error` 상태를 각자의 `useEffect` 안에서 다루고, 로딩 중엔 "불러오는 중...", 실패하면 에러 메시지와 나가기 버튼을 보여주는 패턴이 거의 똑같이 반복됩니다.

```js
useEffect(() => {
  let cancelled = false
  setLoading(true)
  setLoadError(null)
  loadRoomSelections(roomCode)
    .then((selections) => { if (!cancelled) setAllSelections(selections) })
    .catch(() => { if (!cancelled) setLoadError('데이터를 불러오지 못했어요...') })
    .finally(() => { if (!cancelled) setLoading(false) })
  return () => { cancelled = true }
}, [roomCode])
```

지금은 이 패턴을 쓰는 화면이 둘뿐이고, 각 화면의 나가기 버튼이 향하는 곳(`onChangeName`)도 미묘하게 달라서, 섣불리 `useAsyncData` 같은 훅으로 뽑기보다 중복을 그대로 두는 쪽을 택했습니다. 두 곳만 있는 상태에서 추상화하면 오히려 그 훅의 인터페이스를 두 화면의 차이에 억지로 맞추느라 더 복잡해질 수 있다고 봤습니다.

> 그럼 몇 번째 반복부터 추상화 기준을 잡나요?
> 엄격한 숫자 규칙은 없지만, 세 번째 반복이 생기는 시점에 "이 셋이 정말 같은 개념인지"부터 먼저 따져보고, 그렇다면 그때 뽑는 편입니다. 이 프로젝트는 "꼭 필요한 경우가 아니면 추상화를 추가하지 않는다"는 원칙을 전반에서 지키려고 했습니다.

---

## 16. Supabase를 백엔드로 선택한 이유와, 저장소 접근을 한 파일로 모은 이유는?

**질문 이유:** 인프라 선택 기준과 유지보수를 고려한 구조 설계 능력을 확인하기 위해.

**답변:**
이 프로젝트는 서버를 직접 구현할 이유가 없을 만큼 로직이 단순해서(테이블 두 개, CRUD 위주), Postgres와 REST API를 자동으로 얻을 수 있는 Supabase를 선택했습니다. 대신 Supabase 호출이 컴포넌트 곳곳에 흩어지면 나중에 저장소를 바꿀 때 호출부를 전부 찾아다녀야 하므로, 모든 읽기/쓰기 함수를 `lib/calendarData.js` 하나에 모으고 컴포넌트는 이 함수들만 호출하게 했습니다.

```js
// 방 데이터는 Supabase의 selections 테이블(room_code / name / date / level)에 저장됨.
// 저장소를 다른 백엔드로 바꿀 때는 이 파일의 load/upsert/delete 함수 내부만 교체하면 됨.
```

실제로 이 프로젝트는 처음엔 localStorage 기반으로 시작했다가 이후 Supabase로 옮겼는데, 이 구조 덕분에 컴포넌트 쪽은 거의 손대지 않고 저장소 내부 구현만 교체할 수 있었습니다.

> 지금 다시 만든다면 처음부터 Supabase로 시작했을까요?
> 아마도 그랬을 것 같습니다. 다만 localStorage로 먼저 시작한 덕분에 "여러 사람이 공유해야 하는 상태가 정확히 무엇인지"를 서버 없이 먼저 검증할 수 있었다는 이점도 있었습니다. 그 검증이 끝난 뒤엔 저장소 게이트웨이 패턴이 이미 자리 잡혀 있어서 교체 자체는 어렵지 않았습니다.

---

## 17. 최근 참여한 약속 목록을 만들 때 방문 시각 갱신과 제목 갱신을 왜 분리했나요?

**질문 이유:** 로컬 캐시 설계에서 이벤트를 얼마나 세밀하게 구분하는지 확인하기 위해.

**답변:**
방에 들어갈 때마다 코드/제목/방문 시각을 localStorage에 기록하고, 최근 방문 순 정렬 후 최대 5개로 자릅니다. 문제는 방 제목이 진입 시점엔 아직 Supabase 조회가 끝나기 전이라 모를 수 있다는 점입니다. 그래서 방문 시각 기록과 제목 확정을 서로 다른 함수로 나눴습니다.

```js
// 방에 들어갈 때: 방문 시각을 지금으로 갱신하고 목록 맨 앞으로 올림
export function recordRoomVisit(roomCode, title) {
  const rooms = loadRecentRoomsRaw()
  const existing = rooms.find((r) => r.code === roomCode)
  const resolvedTitle = title || existing?.title || DEFAULT_ROOM_TITLE
  const next = rooms.filter((r) => r.code !== roomCode)
  next.push({ code: roomCode, title: resolvedTitle, visitedAt: Date.now() })
  next.sort((a, b) => b.visitedAt - a.visitedAt)
  saveRecentRoomsRaw(next.slice(0, RECENT_ROOMS_MAX))
}

// Supabase 조회가 끝난 뒤: 방문 시각은 그대로 두고 제목만 갱신
export function updateRecentRoomTitle(roomCode, title) {
  const rooms = loadRecentRoomsRaw()
  const idx = rooms.findIndex((r) => r.code === roomCode)
  if (idx === -1) return
  rooms[idx] = { ...rooms[idx], title }
  saveRecentRoomsRaw(rooms)
}
```

"방문했다"는 사실과 "제목을 알게 됐다"는 사실은 서로 다른 시점에 일어나는 서로 다른 이벤트라, 갱신 함수도 분리했습니다. 합쳐서 한 번에 저장했다면, 제목 조회가 늦게 끝났을 때 그 지연이 목록의 정렬 순서(최근 방문 순)에 영향을 줬을 겁니다.

> 삭제 버튼을 누르면 방 자체도 지워지나요?
> 아니요. 로컬 기록만 지웁니다. 방 자체와 서버 데이터는 그대로 남아있고, 다른 사람은 여전히 그 방에 접근할 수 있습니다. 이 차이를 사용자가 오해하지 않도록 목록 하단에 안내 문구도 같이 넣었습니다.

---

## 18. 이 프로젝트에서 가장 판단이 어려웠던 부분과, 앞으로 개선하고 싶은 부분은?

**질문 이유:** 회고와 우선순위 판단, 자기 인식 능력을 확인하기 위해.

**답변:**
가장 어려웠던 건 "로그인 없이 신원을 얼마나 신뢰할지"의 경계를 정하는 것이었습니다. 완전히 막을 수도, 완전히 열어둘 수도 있었는데, 이름 중복 확인 화면 하나로 "실수 방지"와 "가입 없는 간편함" 사이의 절충점을 찾으려 했습니다.

앞으로는 다음을 우선순위로 두고 있습니다.

- `selections.room_code`에 외래키 제약을 추가해, 지금은 애플리케이션 레벨에서만 막고 있는 "존재하지 않는 방" 문제를 DB 레벨로 끌어올리기
- 오래된 방을 정리하는 정책 수립
- 방 제목·인원 수를 나중에 수정하는 기능
- 시간대 선택 지원

완벽한 설계를 처음부터 갖추기보다, 실제로 링크를 공유해 써보면서 드러난 문제(예: 존재하지 않는 방 코드, 이름 입력창 초기화 수단 부재)를 우선순위에 맞춰 하나씩 좁혀가는 방식으로 작업했습니다.
