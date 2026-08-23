# 📅 dayMatch

> 각자 가능한 날짜를 표시하면, 모두가 가능한 날을 찾아주는 일정 조율 웹앱

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

---

## 📎 배포 링크

https://day-match-lime.vercel.app

> 로그인 없이 바로 사용할 수 있습니다. "새 약속 만들기" → 링크 복사 → 다른 기기(또는 시크릿 창)에서 열면 여러 명이 참여하는 흐름을 확인할 수 있습니다.

---

## 💡 왜 만들었나

단톡방에서 날짜를 잡으면 결국 한 사람이 대화를 거슬러 올라가며 정리하게 됩니다. 카톡 투표는 후보 날짜를 미리 정해야 해서 아직 아무도 일정을 모르는 초반에는 쓸 수 없고, 기존 일정 조율 서비스는 가입을 요구합니다.

**링크 하나로, 가입 없이 끝나는 것**을 기준으로 잡았습니다.

응답은 되는 날/안 되는 날 2단계가 아니라 **바빠요 / 괜찮아요 / 좋아요 3단계**로 받습니다. 참석 가능 여부만 모으면 "갈 수는 있는 날"과 "가장 좋은 날"이 같은 값으로 취급되어, 모두가 가능하지만 아무에게도 최선이 아닌 날이 선택되기 때문입니다.

---

## 📸 화면 구성

| 입력 화면 | 결과 - 달력 | 결과 - 리스트 |
| --- | --- | --- |
| <img width="100%" src="https://github.com/user-attachments/assets/7e4d1e76-f240-4447-8d5e-2fdb4bd6ccab" /> | <img width="100%" src="https://github.com/user-attachments/assets/a4a810ab-525a-471b-906e-1fb6177135d6" /> | <img width="100%" src="https://github.com/user-attachments/assets/d7a8ec2b-01be-462a-99ad-a3c43c269f9d" /> |

---

## 🔄 사용 흐름

```
[방 만든 사람]                        [참여자]
      │
  새 약속 만들기
  (제목 / 인원 입력)
      │
  방 코드 발급 ──── 링크 공유 ────▶ /r/{코드} 접속
      │                                  │
      │                             이름 입력
      │                                  │
      ▼                                  ▼
  달력에서 바빠요 / 괜찮아요 / 좋아요 선택 (각자 본인 것만 표시)
      │                                  │
      └──────────────┬───────────────────┘
                     ▼
            결과 화면에서 집계 확인
       (히트맵 달력 / 그룹별 리스트 전환)
```

---

## 📌 주요 기능

- 방(room) 단위로 데이터가 완전히 분리 — 방마다 헷갈리는 글자(0/O, 1/l/I)를 뺀 6자리 코드 발급
- 링크(`/r/{코드}`)만 공유하면 바로 이름 입력 → 달력으로 진입
- 코드를 직접 입력해 참여할 때는 존재하는 방인지 먼저 확인 — 없는 코드면 안내 메시지를 표시하고 진입시키지 않음
- 이미 사용 중인 이름으로 참여하면 본인 확인 절차를 거침
- 입력 화면은 본인 선택만 보이고, 다른 사람의 선택은 결과 화면에서만 집계된 형태로 공개
- 결과는 전원 가능 / 1명만 빼고 가능 / 2명 이상 불가 그룹으로 나눠서 표시, 히트맵 달력·리스트 두 가지 보기
- 참여 예정 인원을 설정하면 전원이 응답을 마쳤을 때 안내 배너 노출
- 최근 참여한 약속을 기기에 기록해 첫 화면에서 바로 재진입
- 지난 날짜는 입력 화면에서 선택 불가 (결과 화면은 과거 기록도 그대로 조회 가능)
- 라이트 테마 고정, iPhone SE(375px) 기준 반응형, 44px 이상 터치 영역

---

## 🛠 기술 스택

| 구분 | 기술 | 선택 이유 |
| --- | --- | --- |
| 빌드 도구 | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | 빠른 개발 서버와 HMR |
| 언어 | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | 타입 정의보다 화면 로직과 UX 판단에 집중 |
| UI | ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) | 선택 상태를 컴포넌트 단위로 관리 |
| 라우팅 | ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white) | 방마다 고유 URL(`/r/:code`)이 필요 |
| 백엔드 / DB | ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white) | 서버를 직접 만들지 않고 Postgres + 자동 생성 REST API 사용 |
| 배포 | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) | GitHub 푸시 시 자동 배포 |

> 상태 관리 라이브러리(Redux, Zustand 등)는 쓰지 않았습니다. 공유해야 할 상태가 방 하나의 선택 데이터뿐이라 `useState` 와 props 전달로 충분했습니다.

---

## 📁 프로젝트 구조

```
src/
├── main.jsx                     # BrowserRouter로 App을 감싸는 엔트리 포인트
├── App.jsx                      # "/", "/r/:code" 라우트 테이블
├── App.css                      # 전역 레이아웃/색상/컴포넌트 스타일
├── index.css                    # 폰트, 라이트 테마 고정, 기본 타이포그래피
├── components/
│   ├── Home.jsx                  # 첫 화면 - 방 만들기 / 코드 참여(존재 여부 확인 포함) / 최근 참여 목록
│   ├── Room.jsx                  # 방 진입 흐름 제어 (이름 확인 → 달력 ↔ 결과)
│   ├── NameInput.jsx             # 이름 입력 화면
│   ├── Calendar.jsx              # 입력 달력 - 본인 선택만 표시, 낙관적 업데이트로 저장
│   ├── Results.jsx               # 결과 화면 - 달력/리스트 보기 전환
│   ├── ResultsCalendarView.jsx   # 결과 - 히트맵 달력
│   ├── ResultsListView.jsx       # 결과 - 그룹별 리스트
│   └── DateDetail.jsx            # 특정 날짜의 참여자별 상태 상세
└── lib/
    ├── calendarData.js           # 데이터 읽기/쓰기를 모아둔 저장소 게이트웨이
    ├── roomCode.js               # 헷갈리는 글자를 뺀 6자리 방 코드 생성
    └── supabaseClient.js         # Supabase 클라이언트 초기화
```

---

## 🔧 구현 포인트

### 1. "안 되는 날"은 점수가 아니라 필터

좋음 3 + 안됨 1과 좋음 2 + 안됨 0을 단순 합산하면 둘 다 7점이 됩니다. 하지만 한 명이라도 참석하지 못하면 그날은 성립하지 않습니다. 그래서 "안됨"은 점수에 넣지 않고 그룹을 나누는 필터로만 사용했습니다. 그룹 안에서는 가능 인원 수 → 좋아요 수 순으로 정렬합니다.

```js
const GROUPS = [
  { key: 'all-ok', label: '전원 가능', match: (noCount) => noCount === 0 },
  { key: 'one-no', label: '1명만 빼고 가능', match: (noCount) => noCount === 1 },
  { key: 'many-no', label: '2명 이상 불가', match: (noCount) => noCount >= 2 },
]

// noCount로 그룹을 나누고, availableCount(good+ok)는 정렬에만 사용
rows.sort((a, b) => {
  if (b.availableCount !== a.availableCount) return b.availableCount - a.availableCount
  if (b.goodCount !== a.goodCount) return b.goodCount - a.goodCount
  if (b.okCount !== a.okCount) return b.okCount - a.okCount
  return a.dateStr < b.dateStr ? -1 : 1
})
```

### 2. 날짜를 YYYY-MM-DD 문자열 키로

인메모리 구조는 `{ 이름: { "2026-09-01": "good" } }` 형태입니다. 일(day) 숫자만 키로 쓰면 8월 20일과 9월 20일이 충돌하므로 연-월-일 전체를 문자열 키로 사용했습니다. 이름을 바깥 키로 둔 것은 본인의 선택을 수정할 때 `allSelections[name]` 한 곳만 수정하면 되기 때문입니다.

```js
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
```

### 3. upsert + unique 제약으로 중복 방지

`(room_code, name, date)`에 unique 제약을 걸고, 저장 시 `onConflict`를 지정한 upsert를 사용합니다. 같은 날짜를 다시 선택해도 행이 추가되지 않고 기존 행이 갱신됩니다.

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

### 4. 낙관적 업데이트

날짜를 선택할 때마다 서버 응답을 기다리면 클릭마다 지연이 발생합니다. 화면 상태를 먼저 갱신하고 저장 요청은 그 뒤에 보내며, 요청이 실패하면 에러 메시지를 표시합니다.

```js
async function handleDayClick(day) {
  if (!activeMode) return
  const dateStr = formatDate(year, month, day)
  if (dateStr < todayStr) return

  const isUnselecting = mySelections[dateStr] === activeMode
  const nextStatus = isUnselecting ? null : activeMode

  setAllSelections((prev) => {
    const personSelections = { ...(prev[name] || {}) }
    if (nextStatus === null) {
      delete personSelections[dateStr]
    } else {
      personSelections[dateStr] = nextStatus
    }
    return { ...prev, [name]: personSelections }
  })

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

### 5. 색 + 기호 병행 표기

적록 색각이상이 있으면 빨강/초록만으로는 상태를 구분할 수 없습니다. 색을 쓰는 모든 위치에 기호(✕ △ ◎)를 함께 표시하도록 상수로 고정했습니다.

```js
export const STATUS_MARK = { no: '✕', ok: '△', good: '◎' }
```

```jsx
<span className="mode-mark">{STATUS_MARK[status]}</span>
{STATUS_LABEL[status]}
```

### 6. 코드 참여 시 방 존재 여부 먼저 확인

`selections` 테이블은 `rooms`와 외래키로 연결돼 있지 않아, `rooms`에 없는 코드로 `/r/{코드}`에 진입해도 이름 입력과 날짜 선택이 정상 동작합니다. 링크로 들어오는 경로는 코드가 항상 정확하지만, 홈 화면에서 코드를 직접 입력하는 경로는 오타가 발생할 수 있습니다. 검증 없이 이동시키면 오타를 낸 사용자가 원래 방이 아닌, 자신만 보는 빈 방에 응답을 쌓게 됩니다.

그래서 코드 입력 참여는 이동 전에 `loadRoomInfo`로 방의 존재를 확인하고, 없으면 이동하지 않고 안내 메시지를 표시합니다.

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

---

## 🤔 고민했던 선택들

### 로그인을 넣지 않기로 한 이유

참여자를 정확히 식별하려면 로그인이 가장 확실합니다. 하지만 링크를 받고 바로 응답하고 끝나는 흐름이 목표였고, 가입 절차는 응답률을 떨어뜨리는 요인이라고 판단했습니다.

대신 이름만 입력받되, **이미 사용 중인 이름이면 본인 확인 단계를 거치도록** 했습니다.

```
"이미 '민수'님이 참여 중이에요."
  → [본인이에요 - 이어서 할게요]   → 기존 선택을 이어서 수정
  → [다른 사람이에요]             → 다른 이름을 입력하도록 안내
```

로그인만큼 확실하진 않지만, 소규모 약속이라는 사용 맥락에서는 이 정도 확인으로 충분하다고 판단했습니다. 이 트레이드오프는 코드 주석에도 남겨, 요구사항이 바뀌면 어디를 손봐야 하는지 찾을 수 있게 했습니다.

### 입력 화면에서 남의 선택을 숨긴 이유

입력 달력에도 다른 사람들의 집계를 함께 보여줄 수 있었지만, 그러면 **먼저 응답한 사람 쪽으로 이후 응답이 쏠리게** 됩니다. 이미 다수가 "좋아요"를 찍은 날에 혼자 "바빠요"를 선택하기는 어렵기 때문입니다.

그래서 입력 화면은 본인 선택만, 다른 사람의 데이터는 결과 화면에서 집계된 형태로만 보이도록 분리했습니다.

### 상태 관리 라이브러리를 쓰지 않은 이유

여러 컴포넌트가 공유하는 상태는 `allSelections` 하나뿐이고, 그마저도 `Calendar`와 `Results`가 각자 필요한 시점에 서버에서 다시 불러오는 구조입니다. 의존성을 추가하는 것보다 `useState` + props로 두는 쪽이 읽기 쉽다고 판단했습니다.

### 저장소 접근을 한 파일로 모은 이유

Supabase 호출이 컴포넌트 곳곳에 흩어지면 저장소를 교체할 때 호출부를 전부 찾아다녀야 합니다. 읽기/쓰기 함수를 `lib/calendarData.js` 한 곳에 모으고, 컴포넌트는 이 함수들만 호출하게 했습니다.

```js
// 방 데이터는 Supabase의 selections 테이블(room_code / name / date / level)에 저장됨.
// 저장소를 다른 백엔드로 바꿀 때는 이 파일의 load/upsert/delete 함수 내부만 교체하면 됨.
```

이 프로젝트는 localStorage로 시작해 이후 Supabase로 옮겼고, 이 구조 덕분에 컴포넌트는 거의 손대지 않고 교체할 수 있었습니다.

---

## 📊 실사용 피드백

배포 후 실제로 링크를 공유해 약속을 잡아봤고, 개발 환경에서는 재현되지 않던 문제들이 여기서 나왔습니다.

| # | 받은 피드백 | 원인 | 대응 |
| --- | --- | --- | --- |
| 1 | "폰에서 색 이상하게 보임" | 시스템 다크 모드에서 브라우저가 색을 자동 변환 | 라이트 테마 명시적 고정 (`color-scheme: light`) |
| 2 | "카톡에서 열면 화면 깨짐" | 인앱 브라우저의 낮은 엔진 버전이 최신 CSS 일부를 무시 | 실기기 인앱 브라우저로 직접 검증 후 CSS 수정 |
| 3 | "이름 지우려면 백스페이스 계속 눌러야 함" | 입력창에 초기화 수단이 없었음 | 이름 입력창에 ✕ 지우기 버튼 추가 |

**시뮬레이터는 실기기를 대체하지 못합니다.** 크롬 개발자 도구의 모바일 뷰에서는 1·2번이 재현되지 않았습니다. 화면 크기만 같을 뿐 렌더링 엔진과 OS 설정이 다르기 때문입니다. 이후 배포 후 실기기 인앱 브라우저 확인을 절차에 포함했습니다.

**3번은 버그가 아니었습니다.** 명세대로 동작했지만 실제로 써보니 불편한 부분이었습니다. 기능이 완성된 것과 쓸 만한 것은 다르고, 이 차이는 사용자가 써봐야 드러납니다.

---

## 🐞 트러블슈팅

**1. 배포 후 `/r/{코드}` 링크로 들어가면 404**

- 문제: Vercel에 올린 뒤 방 링크로 직접 들어가면 404가 떴습니다.
- 원인: 정적 서버는 요청 경로(`/r/abc123`)에 해당하는 파일을 찾는데, SPA는 빌드 결과물이 `index.html` 하나뿐이라 그 경로의 파일이 존재하지 않았습니다.
- 해결: 모든 경로를 `index.html`로 돌려주는 rewrite 규칙을 추가했습니다.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**2. 개발자 도구 시뮬레이션에선 멀쩡한데 실제 폰 인앱 브라우저에서 레이아웃이 깨짐**

- 문제: 크롬 개발자 도구의 모바일 시뮬레이션으로는 문제가 없었는데, 카카오톡 인앱 브라우저로 열면 레이아웃이 틀어졌습니다.
- 원인: 인앱 브라우저는 엔진 버전이 낮아서 최신 CSS 속성 일부를 무시하거나 다르게 처리했습니다.
- 해결: 시뮬레이터만 믿지 않고 실제 인앱 브라우저로 직접 열어서 확인하는 과정을 거쳤습니다.

**3. 폰에서 앱 색이 의도한 것과 다르게 보임**

- 문제: 같은 화면인데 기기에 따라 색이 다르게 보인다는 얘기를 들었습니다.
- 원인: `prefers-color-scheme`를 따르고 있어서, 시스템이 다크 모드일 때 브라우저가 색을 자동 변환했습니다.
- 해결: 라이트 테마를 명시적으로 고정했습니다.

```css
:root {
  color-scheme: light;
}
```

```html
<meta name="color-scheme" content="light" />
<meta name="theme-color" content="#ffffff" />
```

**4. 없는 방 코드를 입력해도 에러 없이 새 빈 방이 생성됨**

- 문제: 홈 화면에서 코드를 직접 입력해 참여할 때, 오타가 나거나 존재하지 않는 코드를 입력해도 에러 없이 그대로 `/r/{코드}` 화면으로 진입했습니다.
- 원인: `selections` 테이블에 `room_code`가 `rooms` 테이블과 외래키로 연결돼 있지 않아서, `rooms`에 없는 코드라도 이름 입력과 날짜 선택이 그대로 동작했습니다. 즉 오타를 낸 사람이 자기도 모르게 아무도 못 보는 빈 방을 새로 만들어 거기에 응답을 쌓게 되는 상황이었습니다.
- 해결: 코드 입력 참여 시 `loadRoomInfo`로 해당 방이 실제로 존재하는지 먼저 확인하고, 없으면 이동하지 않고 "존재하지 않는 코드예요" 메시지를 보여주도록 했습니다. (링크로 바로 들어가는 경로는 코드가 항상 정확하므로 영향 없음)

---

## ♿ 접근성 / 모바일 대응

| 항목 | 대응 |
| --- | --- |
| 색만으로 정보 전달하지 않기 | 모든 상태에 기호 병기 (✕ 바빠요 / △ 괜찮아요 / ◎ 좋아요) |
| 터치 영역 | 버튼·입력창 `min-height: 44px` (Apple HIG 권장 최소 크기) |
| 키보드 탐색 | 모든 인터랙티브 요소에 `:focus-visible` 아웃라인 |
| 스크린 리더 | 아이콘만 있는 버튼에 `aria-label` (예: "'가을 여행' 최근 목록에서 삭제") |
| 기준 화면 | iPhone SE(375px) 기준으로 레이아웃 검증 |
| 시스템 테마 간섭 | 라이트 테마 고정으로 기기별 색 차이 제거 |

히트맵 달력에서는 "아무도 응답하지 않은 날"과 "0명 가능한 날"이 구분되도록, 응답이 없는 날에는 배경과 테두리를 넣지 않았습니다.

```css
/* 0=아무도 못 오는 날(투표는 됨), 5=전원 가능. 투표 자체가 없는 날은 heat 클래스가 안 붙어서
   배경/테두리가 전혀 없는 채로 남기 때문에 "0명 가능"과는 항상 구분됨. */
```

---

## 🚀 시작하기

```bash
npm install
```

프로젝트 루트에 `.env.local`을 만들고 Supabase 프로젝트의 URL과 publishable key를 넣습니다.

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
```

```bash
npm run dev
```

---

## 🗄️ Supabase 테이블

```sql
create table rooms (
  code text primary key,
  title text not null,
  expected_count int,
  created_at timestamptz not null default now()
);

create table selections (
  room_code text not null,
  name text not null,
  date text not null,
  level text not null,
  primary key (room_code, name, date)
);
```

---

## 📝 현재 구조의 한계

- **이름만으로 사용자를 구분합니다.** 동명이인이 있으면 본인 확인 단계로 안내하지만 완전히 막지는 못합니다. 정확한 식별이 필요해지면 로그인이나 기기별 토큰이 필요합니다.
- **아직 날짜를 선택하지 않은 참여자는 집계에 잡히지 않습니다.** 선택이 없으면 `selections`에 행이 생기지 않기 때문입니다. "입장했지만 미응답"을 세려면 참여자 테이블이 별도로 필요합니다.
- **실시간 동기화가 없습니다.** 화면 진입 시 한 번 불러오므로, 다른 사람의 최신 선택을 보려면 결과 화면을 다시 열어야 합니다. Supabase Realtime으로 해결 가능하지만 현재 사용 규모에서는 과한 복잡도라고 판단했습니다.
- **`selections.room_code`에 외래키 제약이 없습니다.** 존재하지 않는 방 코드는 애플리케이션 레벨에서만 검증하고 있습니다.

---

## 🔜 앞으로의 발전 방향

- 방 데이터 정리 정책 (오래된 방 자동 정리 등)
- 방 제목 / 인원 수 수정 기능
- 시간대 선택 지원
- `selections.room_code` 외래키 제약 추가
