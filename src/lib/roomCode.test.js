import { describe, it, expect } from 'vitest'
import { generateRoomCode } from './roomCode'

const CONFUSING_CHARS = ['0', 'O', '1', 'l', 'I']

describe('generateRoomCode', () => {
  it('길이가 6자리다', () => {
    expect(generateRoomCode()).toHaveLength(6)
  })

  it('헷갈리는 글자(0/O, 1/l/I)를 포함하지 않는다', () => {
    // 100번 만들어서 한 번이라도 섞이면 실패하도록 확률적으로 충분히 검증
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode()
      for (const char of CONFUSING_CHARS) {
        expect(code).not.toContain(char)
      }
    }
  })

  it('소문자 영숫자로만 구성된다', () => {
    const code = generateRoomCode()
    expect(code).toMatch(/^[a-z0-9]+$/)
  })
})
