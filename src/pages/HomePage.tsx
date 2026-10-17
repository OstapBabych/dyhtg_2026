import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { APP_NAME } from '../constants/app'

export function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <p className="eyebrow">React + TypeScript + Vite</p>
      <h1 id="welcome-title">Welcome to {APP_NAME}</h1>
      <p>Your project is ready. Edit src/pages/HomePage.tsx to get started.</p>
      <Button onClick={() => setCount((currentCount) => currentCount + 1)}>
        Count: {count}
      </Button>
    </section>
  )
}
