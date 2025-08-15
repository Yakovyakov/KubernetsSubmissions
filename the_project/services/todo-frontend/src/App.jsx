import { useState, useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setIsLoading(true)
        const timestamp = new Date().getTime();
        const url = `/api/random-image?t=${timestamp}`
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
  return (
    <>
      <h1>The project App</h1>
      <div className="card">
        { imageUrl !== '' &&
          <img
            src={imageUrl}
            alt="Random Image"
            style={{width: "25vw", maxWidth: "100%", height:"auto"}}
            onLoad={() => setIsLoading(false)}
          ></img>
        }
      </div>
      <div>
        <em>DevOps with Kubernetes 2025</em>
      </div>
    </>
  )
}

export default App
