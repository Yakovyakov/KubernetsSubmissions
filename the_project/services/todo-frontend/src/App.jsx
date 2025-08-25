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
  const [todos, setTodos] = useState([]);


  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todo-service/todos')
      if (!res.ok) { 
        throw new Error('Failed to fetch todos')
      }
      const data = await res.json()
      setTodos(data)
    } catch (error) {
      console.error('Error fetching todos:', error)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || input.length >  140) {
      return
    }
    console.log('Todo agregado:', input)
    setInput('')
    try {
      const res = await fetch('/api/todo-service/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: input }),
      })

      if (res.ok) {
        setInput('')
        fetchTodos() // Refresh list
      } else {
        alert('Failed to add todo')
      }
    } catch (error) {
      console.error('Error adding todo:', error)
      alert('Network error')
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
