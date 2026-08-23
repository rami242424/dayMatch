import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createRoom,
  loadRoomInfo,
  getRecentRooms,
  removeRecentRoom,
  formatRelativeTime,
} from '../lib/calendarData'
import './Home.css'

const MAX_TITLE_LENGTH = 30

function Home() {
  const navigate = useNavigate()
  const [codeInput, setCodeInput] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [expectedCount, setExpectedCount] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [recentRooms, setRecentRooms] = useState(() => getRecentRooms())

  function handleRemoveRecent(roomCode) {
    removeRecentRoom(roomCode)
    setRecentRooms(getRecentRooms())
  }

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

  async function handleCreateSubmit(e) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    const countValue = expectedCount.trim() ? Number(expectedCount.trim()) : null

    setCreating(true)
    setCreateError(null)
    try {
      const code = await createRoom(trimmedTitle, countValue)
      navigate(`/r/${code}`)
    } catch {
      setCreateError('방을 만들지 못했어요. 다시 시도해주세요.')
      setCreating(false)
    }
  }

  if (showCreateForm) {
    return (
      <div className="hm-screen">
        <div className="screen-back-row">
          <button
            type="button"
            className="top-nav-btn"
            onClick={() => setShowCreateForm(false)}
            disabled={creating}
          >
            ← 처음으로
          </button>
        </div>
        <form className="hm-form hm-reveal hm-d1" onSubmit={handleCreateSubmit}>
          <h1 className="hm-form-title">새 약속 만들기</h1>
          <label className="hm-field">
            <span className="hm-field-label">약속 이름</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 가을 제주 여행"
              maxLength={MAX_TITLE_LENGTH}
              autoFocus
            />
          </label>
          <label className="hm-field">
            <span className="hm-field-label">
              참여 인원 <span className="hm-field-hint">(선택)</span>
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              value={expectedCount}
              onChange={(e) => setExpectedCount(e.target.value)}
              placeholder="예: 4"
            />
          </label>
          {createError && <p className="hm-error">{createError}</p>}
          <button type="submit" className="hm-cta" disabled={creating || !title.trim()}>
            {creating ? '만드는 중...' : '만들기'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="hm-screen">
      <header className="hm-hero hm-reveal hm-d1">
        <h1 className="hm-title">
          dayMatch<span className="hm-title-dot">.</span>
        </h1>
        <p className="hm-tagline">
          편한 날짜만 골라주세요.
          <br />
          다 같이 되는 날은 <strong>dayMatch</strong>가 찾을게요.
        </p>
      </header>

      <div className="hm-actions">
        <button
          type="button"
          className="hm-cta hm-reveal hm-d2"
          onClick={() => setShowCreateForm(true)}
        >
          새 약속 만들기
        </button>

        <div className="hm-divider hm-reveal hm-d3">또는</div>

        <form className="hm-join hm-reveal hm-d4" onSubmit={handleJoin}>
          <input
            className="hm-join-input"
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="초대 코드 입력"
            disabled={joining}
          />
          <button type="submit" className="hm-join-btn" disabled={joining}>
            {joining ? '확인 중' : '참여하기'}
          </button>
        </form>

        {joinError && <p className="hm-error">{joinError}</p>}
      </div>

      {recentRooms.length > 0 && (
        <div className="hm-recent hm-reveal hm-d5">
          <h2 className="hm-recent-title">최근 참여한 약속</h2>
          <ul className="hm-recent-list">
            {recentRooms.map((room) => (
              <li key={room.code} className="hm-recent-item">
                <button
                  type="button"
                  className="hm-recent-link"
                  onClick={() => navigate(`/r/${room.code}`)}
                >
                  <span className="hm-recent-name">{room.title}</span>
                  <span className="hm-recent-time">{formatRelativeTime(room.visitedAt)}</span>
                </button>
                <button
                  type="button"
                  className="hm-recent-remove"
                  aria-label={`'${room.title}' 최근 목록에서 삭제`}
                  onClick={() => handleRemoveRecent(room.code)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <p className="hm-recent-note">
            목록에서 지워도 이 기기의 기록만 삭제돼요. 약속 자체는 그대로 남아있어요.
          </p>
        </div>
      )}
    </div>
  )
}

export default Home
