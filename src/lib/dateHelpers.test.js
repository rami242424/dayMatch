import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  formatDate,
  formatDateLabel,
  buildMonthGrid,
  getDateMarks,
  collectVotedDates,
  formatResponseCount,
  formatRelativeTime,
} from './dateHelpers'

describe('formatDate', () => {
  it('월/일이 한 자리면 0을 채운다', () => {
    expect(formatDate(2026, 0, 5)).toBe('2026-01-05') // month는 0-indexed(0 = 1월)
  })

  it('월/일이 두 자리면 그대로 쓴다', () => {
    expect(formatDate(2026, 10, 23)).toBe('2026-11-23')
  })
})

describe('formatDateLabel', () => {
  it('YYYY-MM-DD를 "M월 D일 (요일)" 형식으로 바꾼다', () => {
    // 2026-09-01은 화요일
    expect(formatDateLabel('2026-09-01')).toBe('9월 1일 (화)')
  })
})

describe('buildMonthGrid', () => {
  it('앞쪽 빈 칸 수 = 그 달 1일의 요일(getDay)과 같다', () => {
    const year = 2026
    const month = 8 // 9월 (0-indexed)
    const cells = buildMonthGrid(year, month)
    const expectedLeadingBlanks = new Date(year, month, 1).getDay()
    const leadingBlanks = cells.findIndex((c) => c !== null)
    expect(leadingBlanks).toBe(expectedLeadingBlanks)
  })

  it('전체 칸 수 = 빈 칸 + 그 달의 일수', () => {
    const year = 2026
    const month = 8
    const cells = buildMonthGrid(year, month)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const leadingBlanks = new Date(year, month, 1).getDay()
    expect(cells.length).toBe(leadingBlanks + daysInMonth)
    expect(cells[cells.length - 1]).toBe(daysInMonth)
  })
})

describe('getDateMarks', () => {
  it('같은 날짜에 대한 여러 사람의 상태를 상태별로 모은다', () => {
    const allSelections = {
      지민: { '2026-09-01': 'good' },
      서연: { '2026-09-01': 'ok' },
      민준: { '2026-09-01': 'no' },
    }
    const marks = getDateMarks(allSelections, '2026-09-01')
    expect(marks.good).toEqual(['지민'])
    expect(marks.ok).toEqual(['서연'])
    expect(marks.no).toEqual(['민준'])
  })

  it('그 날짜에 응답이 없는 사람은 어느 목록에도 안 들어간다', () => {
    const allSelections = {
      지민: { '2026-09-01': 'good' },
      서연: { '2026-09-02': 'ok' }, // 다른 날짜
    }
    const marks = getDateMarks(allSelections, '2026-09-01')
    expect(marks.good).toEqual(['지민'])
    expect(marks.ok).toEqual([])
    expect(marks.no).toEqual([])
  })
})

describe('collectVotedDates', () => {
  it('누구든 유효한 상태를 남긴 날짜만 모은다', () => {
    const allSelections = {
      지민: { '2026-09-01': 'good', '2026-09-02': 'no' },
      서연: { '2026-09-03': 'ok' },
    }
    const dates = collectVotedDates(allSelections)
    expect(dates).toEqual(new Set(['2026-09-01', '2026-09-02', '2026-09-03']))
  })

  it('선택이 없는(빈 객체) 참여자는 무시한다', () => {
    const allSelections = {
      지민: { '2026-09-01': 'good' },
      하은: {}, // 아직 아무 날짜도 안 고른 사람
    }
    const dates = collectVotedDates(allSelections)
    expect(dates).toEqual(new Set(['2026-09-01']))
  })
})

describe('formatResponseCount', () => {
  it('예상 인원이 있으면 "응답 n/m" 형식', () => {
    expect(formatResponseCount(2, 4)).toBe('응답 2/4')
  })

  it('예상 인원이 없으면 "n명 응답" 형식', () => {
    expect(formatResponseCount(3, null)).toBe('3명 응답')
  })
})

describe('formatRelativeTime', () => {
  const NOW = new Date('2026-08-24T12:00:00Z').getTime()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('1분 미만이면 "방금 전"', () => {
    expect(formatRelativeTime(NOW - 30 * 1000)).toBe('방금 전')
  })

  it('1시간 미만이면 "n분 전"', () => {
    expect(formatRelativeTime(NOW - 15 * 60 * 1000)).toBe('15분 전')
  })

  it('하루 미만이면 "n시간 전"', () => {
    expect(formatRelativeTime(NOW - 3 * 60 * 60 * 1000)).toBe('3시간 전')
  })

  it('한 달 미만이면 "n일 전"', () => {
    expect(formatRelativeTime(NOW - 5 * 24 * 60 * 60 * 1000)).toBe('5일 전')
  })
})
