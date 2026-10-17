import { useCallback, useEffect, useRef, useState } from 'react'
import type { CaughtEntry, GamePhase } from './types'
import { FISHING_LEVELS, getNextLevelIndex } from './fishCatalog'
import { createFishMotion, moveFish } from './fishMovement'

const CANVAS_WIDTH = 260
const CANVAS_HEIGHT = 360

const TRACK_X = 30
const TRACK_Y = 10
const TRACK_WIDTH = 140
const TRACK_HEIGHT = 340

const BAR_HEIGHT = 90
const GRAVITY = 900
const LIFT = -2200
const MAX_VELOCITY = 520

const PROGRESS_X = 200
const PROGRESS_WIDTH = 30
const PROGRESS_LOSS_RATE = 0.35

const CAST_WAIT_MIN_MS = 900
const CAST_WAIT_MAX_MS = 2600
const BITE_WINDOW_MS = 900
const RESULT_DISPLAY_MS = 1500

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function useFishingGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [phase, setPhaseState] = useState<GamePhase>('idle')
  const [message, setMessage] = useState('Ready to cast your rod?')
  const [inventory, setInventory] = useState<Record<string, CaughtEntry>>({})
  const [levelIndex, setLevelIndex] = useState(0)
  const levelIndexRef = useRef(0)

  const phaseRef = useRef<GamePhase>('idle')
  const setPhase = useCallback((next: GamePhase) => {
    phaseRef.current = next
    setPhaseState(next)
  }, [])

  const holdingRef = useRef(false)
  const bobTimeRef = useRef(0)

  const barYRef = useRef((TRACK_HEIGHT - BAR_HEIGHT) / 2)
  const barVelocityRef = useRef(0)
  const fishMotionRef = useRef(createFishMotion())
  const progressRef = useRef(0.5)

  const castTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const biteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (castTimeoutRef.current) clearTimeout(castTimeoutRef.current)
    if (biteTimeoutRef.current) clearTimeout(biteTimeoutRef.current)
    if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current)
    castTimeoutRef.current = null
    biteTimeoutRef.current = null
    resultTimeoutRef.current = null
  }, [])

  const triggerEscape = useCallback(() => {
    holdingRef.current = false
    setPhase('escaped')
    setMessage('The fish escaped! Try this level again.')
    resultTimeoutRef.current = setTimeout(() => {
      setPhase('idle')
      setMessage('Ready to cast your rod?')
    }, RESULT_DISPLAY_MS)
  }, [setPhase])

  const triggerCatchSuccess = useCallback(() => {
    holdingRef.current = false
    const currentIndex = levelIndexRef.current
    const fish = FISHING_LEVELS[currentIndex].fish
    setInventory((prev) => {
      const existing = prev[fish.name]
      return {
        ...prev,
        [fish.name]: { fish, count: (existing?.count ?? 0) + 1 },
      }
    })
    setPhase('success')
    const nextIndex = getNextLevelIndex(currentIndex)
    setMessage(`You caught a ${fish.lengthCm} cm ${fish.name}! ${nextIndex === null ? 'All levels cleared!' : 'Next level unlocked!'}`)
    resultTimeoutRef.current = setTimeout(() => {
      if (nextIndex === null) {
        setPhase('complete')
        setMessage('You caught every fish! Play again to start a new challenge.')
        return
      }
      levelIndexRef.current = nextIndex
      setLevelIndex(nextIndex)
      setPhase('idle')
      setMessage('Ready to cast your rod?')
    }, RESULT_DISPLAY_MS)
  }, [setPhase])

  const cast = useCallback(() => {
    if (phaseRef.current !== 'idle') return
    setPhase('waiting')
    setMessage('Waiting for a fish...')
    const wait = CAST_WAIT_MIN_MS + Math.random() * (CAST_WAIT_MAX_MS - CAST_WAIT_MIN_MS)
    castTimeoutRef.current = setTimeout(() => {
      setPhase('bite')
      setMessage('A bite! Pull!')
      biteTimeoutRef.current = setTimeout(() => {
        if (phaseRef.current === 'bite') triggerEscape()
      }, BITE_WINDOW_MS)
    }, wait)
  }, [setPhase, triggerEscape])

  const startHold = useCallback(() => {
    if (phaseRef.current === 'bite') {
      if (biteTimeoutRef.current) clearTimeout(biteTimeoutRef.current)
      barYRef.current = (TRACK_HEIGHT - BAR_HEIGHT) / 2
      barVelocityRef.current = 0
      fishMotionRef.current = createFishMotion()
      progressRef.current = 0.5
      holdingRef.current = true
      setPhase('minigame')
      setMessage('Keep the fish in the green zone!')
      return
    }
    if (phaseRef.current === 'minigame') {
      holdingRef.current = true
    }
  }, [setPhase])

  const endHold = useCallback(() => {
    holdingRef.current = false
  }, [])

  const restart = useCallback(() => {
    if (phaseRef.current !== 'complete') return
    clearTimers()
    holdingRef.current = false
    levelIndexRef.current = 0
    setLevelIndex(0)
    setInventory({})
    setPhase('idle')
    setMessage('Ready to cast your rod?')
  }, [clearTimers, setPhase])

  useEffect(() => clearTimers, [clearTimers])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code !== 'Space') return
      if (phaseRef.current === 'complete') return
      event.preventDefault()
      if (event.repeat) return
      if (phaseRef.current === 'idle') cast()
      else startHold()
    }
    function onKeyUp(event: KeyboardEvent) {
      if (event.code !== 'Space') return
      if (phaseRef.current === 'complete') return
      event.preventDefault()
      endHold()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', endHold)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', endHold)
    }
  }, [cast, startHold, endHold])

  useEffect(() => {
    let rafId: number
    let lastTime = performance.now()

    function update(dt: number) {
      if (phaseRef.current === 'minigame') {
        const accel = holdingRef.current ? LIFT : GRAVITY
        barVelocityRef.current = clamp(barVelocityRef.current + accel * dt, -MAX_VELOCITY, MAX_VELOCITY)
        barYRef.current += barVelocityRef.current * dt

        const maxBarY = TRACK_HEIGHT - BAR_HEIGHT
        if (barYRef.current < 0) {
          barYRef.current = 0
          barVelocityRef.current = 0
        } else if (barYRef.current > maxBarY) {
          barYRef.current = maxBarY
          barVelocityRef.current = 0
        }

        const level = FISHING_LEVELS[levelIndexRef.current]
        fishMotionRef.current = moveFish(fishMotionRef.current, level, dt)

        const overlap = fishMotionRef.current.y >= barYRef.current && fishMotionRef.current.y <= barYRef.current + BAR_HEIGHT
        progressRef.current = clamp(
          progressRef.current + (overlap ? level.progressGainRate : -PROGRESS_LOSS_RATE) * dt,
          0,
          1,
        )

        if (progressRef.current >= 1) triggerCatchSuccess()
        else if (progressRef.current <= 0) triggerEscape()
      } else {
        bobTimeRef.current += dt
      }
    }

    function draw() {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.fillStyle = '#9fd3e8'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      if (phaseRef.current === 'minigame') {
        ctx.fillStyle = '#2b4a6b'
        ctx.fillRect(TRACK_X, TRACK_Y, TRACK_WIDTH, TRACK_HEIGHT)

        ctx.fillStyle = '#4caf50'
        ctx.fillRect(TRACK_X, TRACK_Y + barYRef.current, TRACK_WIDTH, BAR_HEIGHT)

        const fishX = TRACK_X + TRACK_WIDTH / 2
        const fishY = TRACK_Y + fishMotionRef.current.y
        const fishWidth = 12 + levelIndexRef.current * 2
        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = '#172033'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(fishX - fishWidth + 2, fishY)
        ctx.lineTo(fishX - fishWidth - 9, fishY - 8)
        ctx.lineTo(fishX - fishWidth - 9, fishY + 8)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.ellipse(fishX, fishY, fishWidth, 9, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = '#172033'
        ctx.beginPath()
        ctx.arc(fishX + fishWidth - 5, fishY - 2, 2, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#1b2838'
        ctx.fillRect(PROGRESS_X, TRACK_Y, PROGRESS_WIDTH, TRACK_HEIGHT)
        const filledHeight = TRACK_HEIGHT * progressRef.current
        ctx.fillStyle = '#f2c94c'
        ctx.fillRect(PROGRESS_X, TRACK_Y + (TRACK_HEIGHT - filledHeight), PROGRESS_WIDTH, filledHeight)
      } else {
        const bobY = TRACK_Y + TRACK_HEIGHT / 2 + Math.sin(bobTimeRef.current * 2) * 10
        ctx.fillStyle = phaseRef.current === 'bite' ? '#e64a4a' : '#3b6ea5'
        ctx.beginPath()
        ctx.arc(CANVAS_WIDTH / 2, bobY, 14, 0, Math.PI * 2)
        ctx.fill()

        if (phaseRef.current === 'bite') {
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 28px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('!', CANVAS_WIDTH / 2, bobY - 24)
        }
      }
    }

    function frame(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      update(dt)
      draw()
      rafId = requestAnimationFrame(frame)
    }

    rafId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafId)
  }, [triggerCatchSuccess, triggerEscape])

  return {
    canvasRef,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    phase,
    message,
    level: FISHING_LEVELS[levelIndex],
    totalLevels: FISHING_LEVELS.length,
    inventory: Object.values(inventory),
    cast,
    startHold,
    endHold,
    restart,
  }
}
