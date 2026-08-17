import { useState } from 'react'
import NameInput from './components/NameInput'
import Calendar from './components/Calendar'
import './App.css'

const NAME_KEY = 'daymatch:name'

function App() {
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) || '')

  function handleNameSubmit(newName) {
    localStorage.setItem(NAME_KEY, newName)
    setName(newName)
  }

  return (
    <section id="center">
      {name ? (
        <Calendar name={name} onChangeName={() => setName('')} />
      ) : (
        <NameInput onSubmit={handleNameSubmit} />
      )}
    </section>
  )
}

export default App
