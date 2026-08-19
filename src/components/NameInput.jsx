import { useState } from 'react'

function NameInput({ onSubmit, defaultValue = '' }) {
  const [name, setName] = useState(defaultValue)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <form className="name-form" onSubmit={handleSubmit}>
      <h1>이름을 입력해주세요</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름"
        autoFocus
      />
      <button type="submit">시작하기</button>
    </form>
  )
}

export default NameInput
