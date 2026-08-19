const CODE_LENGTH = 6
// 0/O, 1/l/I처럼 헷갈리는 글자는 제외
const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'

export function generateRoomCode() {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return code
}
