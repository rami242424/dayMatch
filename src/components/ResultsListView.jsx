import { useState } from 'react'
import { formatDateLabel } from '../lib/calendarData'
import { GROUPS, buildResultRows } from '../lib/resultRows'
import DateDetail from './DateDetail'

const VISIBLE_PER_GROUP = 3

function ResultsListView({ allSelections }) {
  const rows = buildResultRows(allSelections)
  const totalParticipants = Object.keys(allSelections).length
  const [expandedGroups, setExpandedGroups] = useState({})
  const [expandedDate, setExpandedDate] = useState(null)

  function showMore(groupKey) {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: true }))
  }

  function toggleDate(dateStr) {
    setExpandedDate((prev) => (prev === dateStr ? null : dateStr))
  }

  return (
    <div className="results-list">
      {GROUPS.map((group) => {
        const groupRows = rows.filter((row) => group.match(row.noCount))
        const isAllOkGroup = group.key === 'all-ok'
        if (groupRows.length === 0 && !isAllOkGroup) return null

        const visibleRows = expandedGroups[group.key]
          ? groupRows
          : groupRows.slice(0, VISIBLE_PER_GROUP)
        const hiddenCount = groupRows.length - visibleRows.length

        return (
          <section key={group.key} className={`result-group group-${group.key}`}>
            <h2>
              <span className={`group-bar bar-${group.key}`} />
              {group.label}
            </h2>
            {groupRows.length === 0 ? (
              <p className="result-group-empty">전원 가능한 날이 없습니다</p>
            ) : (
              <>
                {visibleRows.map((row) => (
                  <div key={row.dateStr}>
                    <button
                      type="button"
                      className="result-row"
                      onClick={() => toggleDate(row.dateStr)}
                    >
                      <span className="result-line">
                        {formatDateLabel(row.dateStr)} ·{' '}
                        <span className="available-count">{row.availableCount}명 가능</span>
                        {row.noCount > 0 && ` · ✕ ${row.noCount}`}
                      </span>
                      {row.respondedCount < totalParticipants && (
                        <span className="result-responded">
                          응답 {row.respondedCount}/{totalParticipants}
                        </span>
                      )}
                    </button>
                    {expandedDate === row.dateStr && <DateDetail marks={row.marks} />}
                  </div>
                ))}
                {hiddenCount > 0 && (
                  <button
                    type="button"
                    className="show-more-btn"
                    onClick={() => showMore(group.key)}
                  >
                    +{hiddenCount}개 더보기
                  </button>
                )}
              </>
            )}
          </section>
        )
      })}
      {rows.length === 0 && <p className="results-empty">아직 아무도 날짜를 선택하지 않았어요.</p>}
    </div>
  )
}

export default ResultsListView
