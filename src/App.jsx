import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Room from './components/Room'
import './App.css'

function App() {
  return (
    <section id="center">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/r/:code" element={<Room />} />
      </Routes>
    </section>
  )
}

export default App
