import { describe, it, expect } from 'vitest'
import { buildResultRows, GROUPS } from './resultRows'

describe('buildResultRows', () => {
  it('가능 인원 수(availableCount)가 많은 날짜가 앞에 온다', () => {
    const allSelections = {
      지민: { '2026-09-01': 'good', '2026-09-02': 'good' },
      서연: { '2026-09-01': 'good', '2026-09-02': 'no' },
    }
    const rows = buildResultRows(allSelections)
    expect(rows[0].dateStr).toBe('2026-09-01') // 2명 가능
    expect(rows[1].dateStr).toBe('2026-09-02') // 1명 가능
  })

  it('가능 인원이 같으면 좋아요(goodCount) 많은 쪽이 앞에 온다', () => {
    const allSelections = {
      지민: { '2026-09-01': 'good', '2026-09-02': 'ok' },
      서연: { '2026-09-01': 'ok', '2026-09-02': 'ok' },
    }
    // 둘 다 availableCount=2, 09-01은 good 1명, 09-02는 good 0명
    const rows = buildResultRows(allSelections)
    expect(rows[0].dateStr).toBe('2026-09-01')
  })

  it('가능 인원과 좋아요 수까지 같으면 괜찮아요(okCount)로 다음 비교한다', () => {
    const allSelections = {
      지민: { '2026-09-01': 'ok', '2026-09-02': 'no' },
      서연: { '2026-09-01': 'ok', '2026-09-02': 'ok' },
    }
    // 09-01: available=1(ok 1), 09-02: available=1(ok 1) → good 둘 다 0 → ok로 비교하면 둘 다 1이라 동점
    // 동점 케이스는 마지막 기준(날짜 오름차순)으로 넘어가는지 확인
    const rows = buildResultRows(allSelections)
    expect(rows[0].dateStr).toBe('2026-09-01')
    expect(rows[1].dateStr).toBe('2026-09-02')
  })

  it('모든 기준이 같으면 날짜 오름차순으로 정렬한다', () => {
    const allSelections = {
      지민: { '2026-09-05': 'good', '2026-09-01': 'good' },
    }
    const rows = buildResultRows(allSelections)
    expect(rows.map((r) => r.dateStr)).toEqual(['2026-09-01', '2026-09-05'])
  })

  it('아무도 응답하지 않은 날짜는 결과에 없다', () => {
    const allSelections = {
      지민: { '2026-09-01': 'good' },
    }
    const rows = buildResultRows(allSelections)
    expect(rows.some((r) => r.dateStr === '2026-09-02')).toBe(false)
    expect(rows).toHaveLength(1)
  })
})

describe('GROUPS (안 되는 인원수로 그룹을 나누는 필터)', () => {
  it('안 되는 사람이 0명이면 all-ok 그룹에 속한다', () => {
    const group = GROUPS.find((g) => g.key === 'all-ok')
    expect(group.match(0)).toBe(true)
    expect(group.match(1)).toBe(false)
  })

  it('안 되는 사람이 정확히 1명이면 one-no 그룹에 속한다', () => {
    const group = GROUPS.find((g) => g.key === 'one-no')
    expect(group.match(1)).toBe(true)
    expect(group.match(0)).toBe(false)
    expect(group.match(2)).toBe(false)
  })

  it('안 되는 사람이 2명 이상이면 many-no 그룹에 속한다', () => {
    const group = GROUPS.find((g) => g.key === 'many-no')
    expect(group.match(2)).toBe(true)
    expect(group.match(5)).toBe(true)
    expect(group.match(1)).toBe(false)
  })
})
