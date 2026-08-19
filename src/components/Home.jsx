import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateRoomCode } from '../lib/roomCode'

function Home() {
  const navigate = useNavigate()
  const [codeInput, setCodeInput] = useState('')

  function handleCreate() {
    const code = generateRoomCode()
    navigate(`/r/${code}`)
  }

  function handleJoin(e) {
    e.preventDefault()
    const trimmed = codeInput.trim().toLowerCase()
    if (!trimmed) return
    navigate(`/r/${trimmed}`)
  }

  return (
    <div className="home">
      <h1>daymatch</h1>
      <button type="button" className="home-create-btn" onClick={handleCreate}>
        새 약속 만들기
      </button>
      <form className="home-join-form" onSubmit={handleJoin}>
        <input
          type="text"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          placeholder="코드 입력"
        />
        <button type="submit">참여하기</button>
      </form>
    </div>
  )
}

export default Home
