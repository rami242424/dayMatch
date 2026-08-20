import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import NameInput from './NameInput'
import Calendar from './Calendar'
import Results from './Results'
import {
  loadRoomName,
  saveRoomName,
  loadLastName,
  checkNameTaken,
  loadRoomInfo,
} from '../lib/calendarData'

const DEFAULT_ROOM_TITLE = '이름 없는 약속'

function Room() {
  const { code: roomCode } = useParams()
  const [name, setName] = useState('')
  const [screen, setScreen] = useState('name') // 'name' | 'confirm' | 'input' | 'result'
  const [pendingName, setPendingName] = useState('')
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState(null)
  const [notice, setNotice] = useState('')
  const [roomTitle, setRoomTitle] = useState(DEFAULT_ROOM_TITLE)
  const [expectedCount, setExpectedCount] = useState(null)
  const [resultsView, setResultsView] = useState('calendar')

  useEffect(() => {
    let cancelled = false
    loadRoomInfo(roomCode).then((info) => {
      if (cancelled) return
      setRoomTitle(info?.title || DEFAULT_ROOM_TITLE)
      setExpectedCount(info?.expectedCount ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [roomCode])

  function proceedWithName(finalName) {
    saveRoomName(roomCode, finalName)
    setName(finalName)
    setNotice('')
    setScreen('input')
  }

  async function handleNameSubmit(newName) {
    setChecking(true)
    setCheckError(null)
    try {
      const taken = await checkNameTaken(roomCode, newName)
      if (taken) {
        setPendingName(newName)
        setScreen('confirm')
      } else {
        proceedWithName(newName)
      }
    } catch {
      setCheckError('이름 확인에 실패했어요. 다시 시도해주세요.')
    } finally {
      setChecking(false)
    }
  }

  function handleConfirmSelf() {
    proceedWithName(pendingName)
  }

  function handleConfirmOther() {
    setNotice(`'${pendingName}'은(는) 이미 사용 중이에요. 다른 이름을 입력해주세요.`)
    setPendingName('')
    setScreen('name')
  }

  function handleChangeName() {
    setName('')
    setNotice('')
    setScreen('name')
  }

  function handleShowResults(view) {
    setResultsView(view || 'calendar')
    setScreen('result')
  }

  if (screen === 'name') {
    const defaultName = loadRoomName(roomCode) || loadLastName()
    return (
      <NameInput
        onSubmit={handleNameSubmit}
        defaultValue={defaultName}
        notice={notice}
        checking={checking}
        error={checkError}
      />
    )
  }

  if (screen === 'confirm') {
    return (
      <div className="name-confirm">
        <h1>이미 '{pendingName}'님이 참여 중이에요.</h1>
        <div className="name-confirm-actions">
          <button type="button" className="name-confirm-self" onClick={handleConfirmSelf}>
            본인이에요 - 이어서 할게요
          </button>
          <button type="button" className="name-confirm-other" onClick={handleConfirmOther}>
            다른 사람이에요
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'result') {
    return (
      <Results
        roomCode={roomCode}
        roomTitle={roomTitle}
        expectedCount={expectedCount}
        initialViewMode={resultsView}
        onBack={() => setScreen('input')}
        onChangeName={handleChangeName}
      />
    )
  }

  return (
    <Calendar
      roomCode={roomCode}
      roomTitle={roomTitle}
      expectedCount={expectedCount}
      name={name}
      onChangeName={handleChangeName}
      onShowResults={handleShowResults}
    />
  )
}

export default Room
