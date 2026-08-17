import { useState } from 'react'
import { WEEKDAYS, formatDate, buildMonthGrid, getDateMarks } from '../lib/calendarData'
import DateDetail from './DateDetail'

function heatClass(availableCount) {
  const level = Math.min(availableCount, 5)
  return `heat-${level}`
}

function ResultsCalendarView({ allSelections }) {
  const [viewDate, setViewDate] = useState(() => new Date())
  const [detailDate, setDetailDate] = useState(null)

  const today = new Date()
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth()
  const todayDate = today.getDate()

  const cells = buildMonthGrid(year, month)

  function goToPrevMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    setDetailDate(null)
  }

  function goToNextMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    setDetailDate(null)
  }

  function handleDayClick(dateStr) {
    setDetailDate((prev) => (prev === dateStr ? null : dateStr))
  }

  const detailMarks = detailDate ? getDateMarks(allSelections, detailDate) : null

  return (
    <div>
      <div className="month-nav">
        <button type="button" className="nav-btn" onClick={goToPrevMonth}>
          ◀ 이전 달
        </button>
        <h1>{year}년 {month + 1}월</h1>
        <button type="button" className="nav-btn" onClick={goToNextMonth}>
          다음 달 ▶
        </button>
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
          const marks = getDateMarks(allSelections, dateStr)
          const noCount = marks.no.length
          const availableCount = marks.good.length + marks.ok.length
          const totalVotes = noCount + availableCount

          const classNames = ['day']
          if (isCurrentMonth && day === todayDate) classNames.push('today')
          if (totalVotes > 0) classNames.push(heatClass(availableCount))
          if (dateStr === detailDate) classNames.push('selected')

          return (
            <button
              key={day}
              type="button"
              className={classNames.join(' ')}
              disabled={totalVotes === 0}
              onClick={() => handleDayClick(dateStr)}
            >
              <span className="day-number">{day}</span>
              {totalVotes > 0 && <span className="day-badge">{availableCount}</span>}
            </button>
          )
        })}
      </div>
      {detailDate && <DateDetail marks={detailMarks} title={detailDate} />}
    </div>
  )
}

export default ResultsCalendarView
