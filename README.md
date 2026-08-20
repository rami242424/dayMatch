# daymatch

여러 명이 함께 되는 날짜를 표시해 공통으로 좋은 날을 찾는 웹앱.

## 어떻게 쓰나요

1. 첫 화면에서 "새 약속 만들기"로 약속 이름/참여 인원(선택)을 입력하면 6자리 코드의 방이 만들어짐
2. 만들어진 링크(`/r/{코드}`)를 참여자들에게 공유
3. 각자 이름을 입력하고 달력에서 바빠요(✕) / 괜찮아요(△) / 좋아요(◎)로 날짜를 표시
4. 결과 화면에서 참여자 전원이 가능한 날, 한 명만 빼고 가능한 날 등을 모아서 확인

## 주요 기능

- 방(room) 단위로 데이터가 완전히 분리됨 — 방마다 6자리 코드(헷갈리는 글자 0/O, 1/l/I 제외)
- 같은 이름으로 재참여 시 본인 확인 절차, 이름은 방마다 따로 기억
- 입력 화면은 로그인한 본인 선택만 보이고, 결과 화면에서만 집계된 형태로 공개
- 결과는 전원 가능 / 1명만 빼고 가능 / 2명 이상 불가로 그룹화, 히트맵·리스트 두 가지 보기
- 최근 참여한 약속을 기기에 기록해 첫 화면에서 바로 재진입 가능
- 지난 날짜는 입력 화면에서 선택 불가(결과 화면은 과거 기록도 그대로 조회 가능)
- 라이트 테마 고정, iPhone SE(375px) 기준 반응형

## 기술 스택

- [Vite](https://vitejs.dev/) + React (JavaScript)
- [react-router-dom](https://reactrouter.com/) — `/`, `/r/:code` 라우팅
- [Supabase](https://supabase.com/) — 날짜 선택·방 정보 저장소 (이름은 서버에 저장하지 않고 기기의 `localStorage`에만 보관)

## 시작하기

```bash
npm install
```

Supabase 프로젝트의 URL과 publishable key를 프로젝트 루트의 `.env.local`에 넣어줍니다.

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
```

```bash
npm run dev
```

### 필요한 Supabase 테이블

**`rooms`** — 방 정보

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `code` | text | 6자리 방 코드 (unique) |
| `title` | text | 약속 이름 |
| `expected_count` | int, null 허용 | 참여 예정 인원(선택 입력) |
| `created_at` | timestamp | 생성 시각 |

**`selections`** — 날짜별 선택

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `room_code` | text | 방 코드 |
| `name` | text | 참여자 이름 |
| `date` | text | `"YYYY-MM-DD"` |
| `level` | text | `no` / `ok` / `good` |

`(room_code, name, date)`에 unique 제약이 필요합니다 (같은 날짜를 다시 찍으면 upsert로 덮어씀).

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | oxlint 실행 |

## 배포

Vercel 기준 SPA 라우팅을 위한 `vercel.json`(rewrite 규칙)이 포함되어 있습니다. 환경변수(`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`)는 배포 환경에도 별도로 설정해야 합니다.

## 프로젝트 규칙

작업 시 지켜야 할 세부 규칙은 [CLAUDE.md](./CLAUDE.md)에 정리되어 있습니다.
