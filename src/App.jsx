import { useState } from 'react'
import './App.css'
import FaceRecognition from './FaceRecognition'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <FaceRecognition />
      
    </>
  )
}

export default App
