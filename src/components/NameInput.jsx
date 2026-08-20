import { useState } from 'react'

const MAX_NAME_LENGTH = 10

function NameInput({
  onSubmit,
  onExit,
  defaultValue = '',
  notice = '',
  checking = false,
  error = null,
}) {
  const [name, setName] = useState(defaultValue)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <>
      <div className="screen-back-row">
        <button type="button" className="top-nav-btn" onClick={onExit}>
          ← 처음으로
        </button>
      </div>
      <form className="name-form" onSubmit={handleSubmit}>
        <h1>이름을 입력해주세요</h1>
        {notice && <p className="name-form-notice">{notice}</p>}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          maxLength={MAX_NAME_LENGTH}
          autoFocus
        />
        {error && <p className="status-message-error">{error}</p>}
        <button type="submit" disabled={checking}>
          {checking ? '확인 중...' : '시작하기'}
        </button>
      </form>
    </>
  )
}

export default NameInput
