import { useEffect, useState } from 'react'
import {
  WEEKDAYS,
  STATUSES,
  STATUS_MARK,
  STATUS_LABEL,
  loadRoomSelections,
  upsertSelection,
  deleteSelection,
  formatDate,
  buildMonthGrid,
} from '../lib/calendarData'

function Calendar({ roomCode, name, onChangeName, onShowResults }) {
  const [allSelections, setAllSelections] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [activeMode, setActiveMode] = useState(null)
  const [viewDate, setViewDate] = useState(() => new Date())
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    loadRoomSelections(roomCode)
      .then((selections) => {
        if (!cancelled) setAllSelections(selections)
      })
      .catch(() => {
        if (!cancelled) setLoadError('데이터를 불러오지 못했어요. 새로고침해서 다시 시도해주세요.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [roomCode])

  function handleCopyLink() {
    const url = `${window.location.origin}/r/${roomCode}`
    navigator.clipboard.writeText(url)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 1500)
  }

  const mySelections = allSelections[name] || {}

  const today = new Date()
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth()
  const todayDate = today.getDate()

  const cells = buildMonthGrid(year, month)

  function goToPrevMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  function goToNextMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  async function handleDayClick(day) {
    if (!activeMode) return
    const dateStr = formatDate(year, month, day)
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

  if (loading) {
    return (
      <div className="calendar">
        <p className="status-message">불러오는 중...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="calendar">
        <p className="status-message status-message-error">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="calendar">
      <div className="top-nav">
        <button type="button" className="top-nav-btn" onClick={onChangeName}>
          ← 처음으로
        </button>
        <span className="name-badge-text">
          <strong>{name}</strong> 님 일정
        </span>
        <button type="button" className="top-nav-btn primary" onClick={onShowResults}>
          결과 보기
        </button>
      </div>
      <button type="button" className="copy-link-btn" onClick={handleCopyLink}>
        {linkCopied ? '복사됨 ✓' : '🔗 링크 복사'}
      </button>
      {saveError && <p className="status-message status-message-error">{saveError}</p>}
      <div className="month-nav">
        <button type="button" className="nav-btn" onClick={goToPrevMonth}>
          ◀ 이전 달
        </button>
        <h1>{year}년 {month + 1}월</h1>
        <button type="button" className="nav-btn" onClick={goToNextMonth}>
          다음 달 ▶
        </button>
      </div>
      <div className="mode-bar">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            className={
              status === activeMode ? `mode-btn mode-${status} active` : `mode-btn mode-${status}`
            }
            onClick={() => setActiveMode(status)}
          >
            <span className="mode-mark">{STATUS_MARK[status]}</span>
            {STATUS_LABEL[status]}
          </button>
        ))}
      </div>
      <div className="calendar-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="weekday">
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`blank-${i}`} className="day empty" />
          }
          const dateStr = formatDate(year, month, day)
          const status = mySelections[dateStr]
          const classNames = ['day']
          if (isCurrentMonth && day === todayDate) classNames.push('today')
          if (status) classNames.push(`status-${status}`)

          return (
            <button
              key={day}
              type="button"
              className={classNames.join(' ')}
              onClick={() => handleDayClick(day)}
              title={status ? STATUS_LABEL[status] : undefined}
            >
              <span className="day-number">{day}</span>
              {status && <span className="day-mark">{STATUS_MARK[status]}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar
