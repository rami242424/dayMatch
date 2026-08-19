import { useState } from 'react'
import { useParams } from 'react-router-dom'
import NameInput from './NameInput'
import Calendar from './Calendar'
import Results from './Results'
import { loadRoomName, saveRoomName, loadLastName } from '../lib/calendarData'

function Room() {
  const { code: roomCode } = useParams()
  const [name, setName] = useState('')
  const [screen, setScreen] = useState('input')

  function handleNameSubmit(newName) {
    saveRoomName(roomCode, newName)
    setName(newName)
    setScreen('input')
  }

  function handleChangeName() {
    setName('')
    setScreen('input')
  }

  if (!name) {
    const defaultName = loadRoomName(roomCode) || loadLastName()
    return <NameInput onSubmit={handleNameSubmit} defaultValue={defaultName} />
  }

  if (screen === 'result') {
    return (
      <Results
        roomCode={roomCode}
        onBack={() => setScreen('input')}
        onChangeName={handleChangeName}
      />
    )
  }

  return (
    <Calendar
      roomCode={roomCode}
      name={name}
      onChangeName={handleChangeName}
      onShowResults={() => setScreen('result')}
    />
  )
}

export default Room
