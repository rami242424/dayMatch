import { useEffect, useState } from 'react'
import { loadRoomSelections } from '../lib/calendarData'
import ResultsCalendarView from './ResultsCalendarView'
import ResultsListView from './ResultsListView'

function Results({ roomCode, onBack, onChangeName }) {
  const [viewMode, setViewMode] = useState('calendar')
  const [allSelections, setAllSelections] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    loadRoomSelections(roomCode)
      .then((selections) => {
        if (!cancelled) setAllSelections(selections)
      })
      .catch(() => {
        if (!cancelled) setError('데이터를 불러오지 못했어요. 새로고침해서 다시 시도해주세요.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [roomCode])

  const participants = Object.keys(allSelections)

  if (loading) {
    return (
      <div className="calendar">
        <p className="status-message">불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="calendar">
        <p className="status-message status-message-error">{error}</p>
      </div>
    )
  }

  return (
    <div className="calendar">
      <div className="top-nav">
        <button type="button" className="top-nav-btn" onClick={onChangeName}>
          ← 처음으로
        </button>
        <button type="button" className="top-nav-btn primary" onClick={onBack}>
          ◀ 입력으로 돌아가기
        </button>
      </div>
      <p className="participants-summary">
        참여자 {participants.length}명
        {participants.length > 0 && <>: {participants.join(', ')}</>}
      </p>
      <div className="mode-bar">
        <button
          type="button"
          className={viewMode === 'calendar' ? 'mode-btn active' : 'mode-btn'}
          onClick={() => setViewMode('calendar')}
        >
          달력으로 보기
        </button>
        <button
          type="button"
          className={viewMode === 'list' ? 'mode-btn active' : 'mode-btn'}
          onClick={() => setViewMode('list')}
        >
          리스트로 보기
        </button>
      </div>
      {viewMode === 'calendar' ? (
        <ResultsCalendarView allSelections={allSelections} />
      ) : (
        <ResultsListView allSelections={allSelections} />
      )}
    </div>
  )
}

export default Results
