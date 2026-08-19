import { useState } from 'react'
import { loadRoomSelections } from '../lib/calendarData'
import ResultsCalendarView from './ResultsCalendarView'
import ResultsListView from './ResultsListView'

function Results({ roomCode, onBack, onChangeName }) {
  const [viewMode, setViewMode] = useState('calendar')
  const [allSelections] = useState(() => loadRoomSelections(roomCode))
  const participants = Object.keys(allSelections)

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
