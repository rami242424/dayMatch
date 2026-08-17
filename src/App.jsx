import { useState } from 'react'
import NameInput from './components/NameInput'
import Calendar from './components/Calendar'
import Results from './components/Results'
import './App.css'

const NAME_KEY = 'daymatch:name'

function App() {
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) || '')
  const [screen, setScreen] = useState('input')

  function handleNameSubmit(newName) {
    localStorage.setItem(NAME_KEY, newName)
    setName(newName)
    setScreen('input')
  }

  function handleChangeName() {
    setName('')
    setScreen('input')
  }

  let content
  if (!name) {
    content = <NameInput onSubmit={handleNameSubmit} />
  } else if (screen === 'result') {
    content = (
      <Results onBack={() => setScreen('input')} onChangeName={handleChangeName} />
    )
  } else {
    content = (
      <Calendar
        name={name}
        onChangeName={handleChangeName}
        onShowResults={() => setScreen('result')}
      />
    )
  }

  return <section id="center">{content}</section>
}

export default App
