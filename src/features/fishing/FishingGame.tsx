import { Button } from '../../components/ui/Button'
import { useFishingGame } from './useFishingGame'
import './fishing.css'

export function FishingGame() {
  const { canvasRef, canvasWidth, canvasHeight, phase, message, inventory, cast, startHold, endHold } =
    useFishingGame()

  const canHold = phase === 'bite' || phase === 'minigame'

  return (
    <section className="fishing-game" aria-labelledby="fishing-title">
      <h1 id="fishing-title">Рибалка</h1>
      <p className="fishing-message" role="status">
        {message}
      </p>

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="fishing-canvas"
        aria-hidden="true"
      />

      <div className="fishing-controls">
        <Button onClick={cast} disabled={phase !== 'idle'}>
          Закинути вудку
        </Button>
        <Button
          disabled={!canHold}
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
        >
          Тягни! (або Пробіл)
        </Button>
      </div>

      <div className="fishing-inventory" aria-label="Улов">
        <h2>Улов</h2>
        {inventory.length === 0 ? (
          <p className="fishing-inventory-empty">Поки що порожньо.</p>
        ) : (
          <ul>
            {inventory.map((entry) => (
              <li key={entry.fish.name}>
                <span className="fishing-inventory-dot" style={{ background: entry.fish.color }} />
                {entry.fish.name} × {entry.count}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
