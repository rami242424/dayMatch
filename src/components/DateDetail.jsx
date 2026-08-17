import { STATUSES, STATUS_MARK, STATUS_LABEL } from '../lib/calendarData'

function DateDetail({ marks, title }) {
  return (
    <div className="day-detail">
      {title && <h2>{title}</h2>}
      {STATUSES.map((status) =>
        marks[status].length > 0 ? (
          <p key={status} className={`detail-row detail-${status}`}>
            <span>{STATUS_MARK[status]} {STATUS_LABEL[status]}</span>
            <span>{marks[status].join(', ')}</span>
          </p>
        ) : null,
      )}
    </div>
  )
}

export default DateDetail
