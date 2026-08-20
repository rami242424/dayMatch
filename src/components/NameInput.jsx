import { useRef, useState } from 'react'

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
  const inputRef = useRef(null)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  function handleClear() {
    setName('')
    inputRef.current?.focus()
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
        <div className="name-form-input-wrap">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            maxLength={MAX_NAME_LENGTH}
            autoFocus
          />
          {name && (
            <button
              type="button"
              className="name-form-clear-btn"
              aria-label="이름 지우기"
              onClick={handleClear}
            >
              <span aria-hidden="true">✕</span>
            </button>
          )}
        </div>
        {error && <p className="status-message-error">{error}</p>}
        <button type="submit" disabled={checking}>
          {checking ? '확인 중...' : '시작하기'}
        </button>
      </form>
    </>
  )
}

export default NameInput
