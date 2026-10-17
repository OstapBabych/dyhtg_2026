import type { FishMotion, FishingLevel } from './types'

export const FISH_MIN_Y = 14
export const FISH_MAX_Y = 326

export function createFishMotion(): FishMotion {
  return { y: 170, targetY: 230, turnIn: 0, speedMultiplier: 1 }
}

/** Move continuously toward random targets; later levels turn and dart more often. */
export function moveFish(
  motion: FishMotion,
  level: FishingLevel,
  dt: number,
  random: () => number = Math.random,
): FishMotion {
  let { targetY, speedMultiplier } = motion
  let turnIn = motion.turnIn - dt

  if (turnIn <= 0 || Math.abs(targetY - motion.y) < 1) {
    targetY = FISH_MIN_Y + random() * (FISH_MAX_Y - FISH_MIN_Y)
    turnIn = level.turnIntervalMin + random() * (level.turnIntervalMax - level.turnIntervalMin)
    speedMultiplier = random() < level.dartChance ? 1.55 : 1
  }

  const distance = targetY - motion.y
  const step = Math.min(Math.abs(distance), level.speed * speedMultiplier * dt)
  const y = Math.max(FISH_MIN_Y, Math.min(FISH_MAX_Y, motion.y + Math.sign(distance) * step))
  return { y, targetY, turnIn, speedMultiplier }
}
