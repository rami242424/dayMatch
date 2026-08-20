<img width="1763" height="947" alt="스크린샷_20-8-2026_18310_localhost" src="https://github.com/user-attachments/assets/bbef1ef7-f317-4b39-91c5-fca73f6f15de" />
# 📅 dayMatch

> 여러 명이 함께 되는 날짜를 표시해 공통으로 좋은 날을 찾는 웹앱

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

---

## 📎 배포 링크

https://day-match-lime.vercel.app

---

## 📸 화면 구성

| 입력 화면 | 결과 - 달력 | 결과 - 리스트 |
| --- | --- | --- |
| <img width="280" src="https://github.com/user-attachments/assets/7e4d1e76-f240-4447-8d5e-2fdb4bd6ccab" /> | <img width="280" src="https://github.com/user-attachments/assets/a4a810ab-525a-471b-906e-1fb6177135d6" /> | <img width="280" src="https://github.com/user-attachments/assets/d7a8ec2b-01be-462a-99ad-a3c43c269f9d" /> |


---

## 📌 주요 기능

- 방(room) 단위로 데이터가 완전히 분리 — 방마다 헷갈리는 글자(0/O, 1/l/I)를 뺀 6자리 코드 발급
- 링크(`/r/{코드}`)만 공유하면 바로 이름 입력 → 달력으로 진입
- 같은 이름으로 재참여하면 본인 확인 절차를 거침 ("이미 참여 중이에요, 본인이세요?")
- 입력 화면은 로그인한 본인 선택만 보이고, 다른 사람의 선택은 결과 화면에서만 집계된 형태로 공개
- 결과는 전원 가능 / 1명만 빼고 가능 / 2명 이상 불가 그룹으로 나눠서 표시, 히트맵 달력·리스트 두 가지 보기
- 참여 예정 인원을 설정하면 전원이 응답을 마쳤을 때 안내 배너 노출
- 최근 참여한 약속을 기기에 기록해 첫 화면에서 바로 재진입
- 지난 날짜는 입력 화면에서 선택 불가 (결과 화면은 과거 기록도 그대로 조회 가능)
- 라이트 테마 고정, iPhone SE(375px) 기준 반응형, 44px 이상 터치 영역

---

## 🛠 기술 스택

| 구분 | 기술 |
| --- | --- |
| 빌드 도구 | Vite |
| 언어 | JavaScript (React 19) |
| UI | React |
| 라우팅 | React Router |
| 백엔드 / DB | Supabase |
| 배포 | Vercel |

---

## 📁 프로젝트 구조

```
src/
├── main.jsx                     # BrowserRouter로 App을 감싸는 엔트리 포인트
├── App.jsx                      # "/", "/r/:code" 라우트 테이블
├── App.css                      # 전역 레이아웃/색상/컴포넌트 스타일
├── index.css                    # 폰트, 라이트 테마 고정, 기본 타이포그래피
├── components/
│   ├── Home.jsx                  # 첫 화면 - 방 만들기 / 코드 참여 / 최근 참여 목록
│   ├── Room.jsx                  # 방 진입 흐름 제어 (이름 확인 → 달력 ↔ 결과)
│   ├── NameInput.jsx             # 이름 입력 화면
│   ├── Calendar.jsx              # 입력 달력 - 본인 선택만 표시, 낙관적 업데이트로 저장
│   ├── Results.jsx               # 결과 화면 - 달력/리스트 보기 전환
│   ├── ResultsCalendarView.jsx   # 결과 - 히트맵 달력
│   ├── ResultsListView.jsx       # 결과 - 그룹별 리스트
│   └── DateDetail.jsx            # 특정 날짜의 참여자별 상태 상세
└── lib/
    ├── calendarData.js           # 데이터 읽기/쓰기를 모아둔 저장소 게이트웨이
    ├── roomCode.js                # 헷갈리는 글자를 뺀 6자리 방 코드 생성
    └── supabaseClient.js          # Supabase 클라이언트 초기화
```

---

## 🔧 구현 포인트

### 1. "안 되는 날"은 점수가 아니라 필터

좋음 3 + 안됨 1과 좋음 2 + 안됨 0을 그냥 합산하면 둘 다 7점이 되어버리는데, 실제로는 한 명이라도 못 오면 그날은 약속이 성립하지 않는다. 그래서 "안됨"은 점수에 넣지 않고, 그룹을 나누는 필터로만 사용했다. 그룹 안에서는 가능 인원 수 → 좋아요 수 순으로 정렬한다.

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

인메모리 구조는 `{ 이름: { "2026-09-01": "good" } }` 형태다. 일(day) 숫자만 키로 쓰면 8월 20일과 9월 20일이 충돌하기 때문에 연-월-일을 통째로 문자열 키로 썼다. 이름을 바깥 키로 둔 이유는, 본인의 선택을 수정할 때 `allSelections[name]` 한 곳만 건드리면 되기 때문이다.

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

`(room_code, name, date)`에 unique 제약을 걸어두고, 저장할 때 `onConflict`를 지정한 upsert를 쓴다. 같은 날짜를 다시 찍어도 행이 새로 늘지 않고 기존 행이 덮어써진다.

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

날짜를 찍을 때마다 서버 응답을 기다리면 클릭할 때마다 화면이 멈칫한다. 그래서 화면 상태를 먼저 바꾸고, 실제 저장 요청은 그 뒤에 보낸다. 요청이 실패하면 에러 메시지만 띄운다.

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

적록 색각이상이 있으면 빨강/초록만으로는 상태를 구분하기 어렵다. 그래서 색을 쓰는 모든 곳에 기호(✕ △ ◎)를 함께 표시하도록 못박아뒀다.

```js
export const STATUS_MARK = { no: '✕', ok: '△', good: '◎' }
```

```jsx
<span className="mode-mark">{STATUS_MARK[status]}</span>
{STATUS_LABEL[status]}
```

---

## 🐞 트러블슈팅

**1. 배포 후 `/r/{코드}` 링크로 들어가면 404**
- 문제: Vercel에 올린 뒤 방 링크로 직접 들어가면 404가 떴다.
- 원인: 정적 서버는 요청 경로(`/r/abc123`)에 해당하는 파일을 찾는데, SPA는 빌드 결과물이 `index.html` 하나뿐이라 그 경로의 파일이 존재하지 않았다.
- 해결: 모든 경로를 `index.html`로 돌려주는 rewrite 규칙을 추가했다.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**2. 개발자 도구 시뮬레이션에선 멀쩡한데 실제 폰 인앱 브라우저에서 레이아웃이 깨짐**
- 문제: 크롬 개발자 도구의 모바일 시뮬레이션으로는 문제가 없었는데, 카카오톡 인앱 브라우저로 열면 레이아웃이 틀어졌다.
- 원인: 인앱 브라우저는 엔진 버전이 낮아서 최신 CSS 속성 일부를 무시하거나 다르게 처리했다.
- 해결: 시뮬레이터만 믿지 않고 실제 인앱 브라우저로 직접 열어서 확인하는 과정을 거쳤다.

**3. 폰에서 앱 색이 의도한 것과 다르게 보임**
- 문제: 같은 화면인데 기기에 따라 색이 다르게 보인다는 얘기를 들었다.
- 원인: `prefers-color-scheme`를 따라가고 있어서, 시스템이 다크 모드면 브라우저가 색을 자동으로 바꿔버렸다.
- 해결: 라이트 테마를 명시적으로 고정했다.

```css
:root {
  color-scheme: light;
}
```

```html
<meta name="color-scheme" content="light" />
<meta name="theme-color" content="#ffffff" />
```

---

## 🚀 시작하기

```bash
npm install
```

프로젝트 루트에 `.env.local`을 만들고 Supabase 프로젝트의 URL과 publishable key를 넣는다.

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

## 📝 앞으로의 발전 방향

- [ ] 인앱 브라우저 CSS 호환성 검증
- [ ] 방 데이터 정리 정책 (오래된 방 자동 정리 등)
- [ ] 방 제목 / 인원 수 수정 기능
- [ ] 시간대 선택 지원
