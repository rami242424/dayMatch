import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createRoom,
  getRecentRooms,
  removeRecentRoom,
  formatRelativeTime,
} from '../lib/calendarData'

const MAX_TITLE_LENGTH = 30

function Home() {
  const navigate = useNavigate()
  const [codeInput, setCodeInput] = useState('')
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

  function handleJoin(e) {
    e.preventDefault()
    const trimmed = codeInput.trim().toLowerCase()
    if (!trimmed) return
    navigate(`/r/${trimmed}`)
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
      <>
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
        <form className="home-create-form" onSubmit={handleCreateSubmit}>
          <h1>새 약속 만들기</h1>
          <label className="home-field">
            <span>약속 이름</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 가을 여행"
              maxLength={MAX_TITLE_LENGTH}
              autoFocus
            />
          </label>
          <label className="home-field">
            <span>참여 인원 (선택)</span>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              value={expectedCount}
              onChange={(e) => setExpectedCount(e.target.value)}
              placeholder="예: 4"
            />
          </label>
          {createError && <p className="status-message-error">{createError}</p>}
          <button type="submit" className="home-create-btn" disabled={creating || !title.trim()}>
            {creating ? '만드는 중...' : '만들기'}
          </button>
        </form>
      </>
    )
  }

  return (
    <div className="home">
      <h1>daymatch</h1>
      <button type="button" className="home-create-btn" onClick={() => setShowCreateForm(true)}>
        새 약속 만들기
      </button>
      <form className="home-join-form" onSubmit={handleJoin}>
        <input
          type="text"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          placeholder="코드 입력"
        />
        <button type="submit">참여하기</button>
      </form>
      {recentRooms.length > 0 && (
        <div className="recent-rooms">
          <h2 className="recent-rooms-title">최근 참여한 약속</h2>
          <ul className="recent-rooms-list">
            {recentRooms.map((room) => (
              <li key={room.code} className="recent-room-item">
                <button
                  type="button"
                  className="recent-room-link"
                  onClick={() => navigate(`/r/${room.code}`)}
                >
                  <span className="recent-room-name">{room.title}</span>
                  <span className="recent-room-time">{formatRelativeTime(room.visitedAt)}</span>
                </button>
                <button
                  type="button"
                  className="recent-room-remove"
                  aria-label={`'${room.title}' 최근 목록에서 삭제`}
                  onClick={() => handleRemoveRecent(room.code)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <p className="recent-rooms-note">
            목록에서 지워도 이 기기의 기록만 삭제돼요. 약속 자체는 그대로 남아있어요.
          </p>
        </div>
      )}
    </div>
  )
}

export default Home
