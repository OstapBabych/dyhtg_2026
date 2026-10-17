import { Button } from '../../components/ui/Button'
import { useFishingGame } from './useFishingGame'
import './fishing.css'

export function FishingGame() {
  const {
    canvasRef, canvasWidth, canvasHeight, phase, message, inventory,
    level, totalLevels, cast, startHold, endHold, restart,
  } = useFishingGame()

  const canHold = phase === 'bite' || phase === 'minigame'

  return (
    <section className="fishing-game" aria-labelledby="fishing-title">
      <h1 id="fishing-title">Fishing</h1>
      <div className="fishing-level">
        <span className="fishing-level-badge">Level {level.number} / {totalLevels}</span>
        <h2>{level.fish.name} <span>{level.fish.lengthCm} cm</span></h2>
        <p>Catch this fish to unlock the next level. Each new fish is bigger and harder to catch.</p>
        <progress value={inventory.length} max={totalLevels} aria-label="Levels completed" />
        <span className="fishing-level-progress">{inventory.length} of {totalLevels} levels cleared</span>
      </div>
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
        {phase === 'complete' ? (
          <Button onClick={restart}>Play again</Button>
        ) : (
          <>
            <Button onClick={cast} disabled={phase !== 'idle'}>
              Cast the rod
            </Button>
            <Button
              className="fishing-pull"
              disabled={!canHold}
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onPointerCancel={endHold}
            >
              Pull! (or Space)
            </Button>
          </>
        )}
      </div>
      <p className="fishing-instructions">
        Press Space or cast the rod, then react when a fish bites. Hold Pull or Space to rise;
        release to sink. Keep the fish&apos;s centre inside the green zone to fill the gold meter.
      </p>

      <div className="fishing-inventory" aria-label="Your catch">
        <h2>Your catch</h2>
        {inventory.length === 0 ? (
          <p className="fishing-inventory-empty">No fish caught yet.</p>
        ) : (
          <ul>
            {inventory.map((entry) => (
              <li key={entry.fish.name}>
                <span className="fishing-inventory-dot" style={{ background: entry.fish.color }} />
                {entry.fish.name} · {entry.fish.lengthCm} cm × {entry.count}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
