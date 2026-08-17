import { useEffect, useState } from 'react'
import {
  WEEKDAYS,
  STATUSES,
  STATUS_MARK,
  STATUS_LABEL,
  loadAllSelections,
  saveAllSelections,
  formatDate,
  buildMonthGrid,
} from '../lib/calendarData'

function Calendar({ name, onChangeName, onShowResults }) {
  const [allSelections, setAllSelections] = useState(loadAllSelections)
  const [activeMode, setActiveMode] = useState(null)
  const [viewDate, setViewDate] = useState(() => new Date())

  useEffect(() => {
    saveAllSelections(allSelections)
  }, [allSelections])

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

  function handleDayClick(day) {
    if (!activeMode) return
    const dateStr = formatDate(year, month, day)
    setAllSelections((prev) => {
      const personSelections = { ...(prev[name] || {}) }
      if (personSelections[dateStr] === activeMode) {
        delete personSelections[dateStr]
      } else {
        personSelections[dateStr] = activeMode
      }
      return { ...prev, [name]: personSelections }
    })
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
