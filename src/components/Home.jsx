import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRoom } from '../lib/calendarData'

const MAX_TITLE_LENGTH = 30

function Home() {
  const navigate = useNavigate()
  const [codeInput, setCodeInput] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [expectedCount, setExpectedCount] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

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
        <div className="home-create-form-actions">
          <button
            type="button"
            className="home-back-btn"
            onClick={() => setShowCreateForm(false)}
            disabled={creating}
          >
            뒤로
          </button>
          <button
            type="submit"
            className="home-create-btn"
            disabled={creating || !title.trim()}
          >
            {creating ? '만드는 중...' : '만들기'}
          </button>
        </div>
      </form>
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
    </div>
  )
}

export default Home
