import { useState, useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'

function App() {
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [input, setInput] = useState('')

  const todos = [
    {id: 1, text: 'Learn JavaScript'},
    {id: 2, text: 'Learn React'},
    {id: 3, text: 'Learn Kubernetes'},
    {id: 4, text: 'Build project'},
  ]

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setIsLoading(true)
        const timestamp = new Date().getTime();
        const url = `/api/image-service/random-image?t=${timestamp}`
        setImageUrl(url);

      } catch (error) {
        console.error('Error loading image:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImage()
    const interval = setInterval(fetchImage, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && input.length <= 140) {
      console.log('Todo agregado:', input)
      // En el futuro: enviar al backend
      setInput('')
    }
  }

  return (
    <>
      <h1>The project App</h1>
      <div className="card">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Random Image"
            style={{ width: '25vw', maxWidth: '100%', height: 'auto' }}
            onLoad={() => setIsLoading(false)}
          />
        )}
        {isLoading && <p>Loading image...</p>}
      </div>
      <TodoForm input={input} onInput={setInput} onSubmit={handleSubmit}/>
      <TodoList todos={todos} />
      <div>
        <em>DevOps with Kubernetes 2025</em>
      </div>
    </>
  )
}

export default App
