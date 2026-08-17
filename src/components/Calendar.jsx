import { useEffect, useState } from 'react'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const STATUSES = ['no', 'ok', 'good']
const STATUS_MARK = { no: '✕', ok: '△', good: '◎' }
const STATUS_LABEL = { no: '안되는날', ok: '괜찮은날', good: '좋은날' }

const SELECTIONS_KEY = 'daymatch:selections'

function loadSelections() {
  try {
    const raw = localStorage.getItem(SELECTIONS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function formatDate(year, month, day) {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function buildMonthGrid(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day)
  }
  return cells
}

function Calendar({ name, onChangeName }) {
  const [selections, setSelections] = useState(loadSelections)
  const [activeMode, setActiveMode] = useState(null)
  const [viewDate, setViewDate] = useState(() => new Date())

  useEffect(() => {
    localStorage.setItem(SELECTIONS_KEY, JSON.stringify(selections))
  }, [selections])

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
    setSelections((prev) => {
      const next = { ...prev }
      if (next[dateStr] === activeMode) {
        delete next[dateStr]
      } else {
        next[dateStr] = activeMode
      }
      return next
    })
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" className="change-name-btn" onClick={onChangeName}>
          이름 변경
        </button>
      </div>
      <div className="month-nav">
        <button type="button" className="nav-btn" onClick={goToPrevMonth}>
          ◀ 이전 달
        </button>
        <h1>{name}님, {year}년 {month + 1}월</h1>
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
          const status = selections[dateStr]
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
