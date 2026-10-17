import type { Fish, FishingLevel } from './types'

const FISH_CATALOG: Fish[] = [
  { name: 'Minnow', color: '#94a3b8', lengthCm: 8 },
  { name: 'Perch', color: '#d99a30', lengthCm: 20 },
  { name: 'Trout', color: '#c27c9e', lengthCm: 35 },
  { name: 'Bass', color: '#658853', lengthCm: 50 },
  { name: 'Salmon', color: '#de8067', lengthCm: 75 },
  { name: 'Pike', color: '#52784c', lengthCm: 100 },
  { name: 'Carp', color: '#b68a3c', lengthCm: 120 },
  { name: 'Catfish', color: '#807064', lengthCm: 180 },
  { name: 'Tuna', color: '#477cad', lengthCm: 250 },
  { name: 'Marlin', color: '#6366c9', lengthCm: 400 },
]

export const FISHING_LEVELS: FishingLevel[] = FISH_CATALOG.map((fish, index) => ({
  number: index + 1,
  fish,
  speed: 60 + index * 16,
  turnIntervalMin: 0.9 - index * 0.075,
  turnIntervalMax: 1.5 - index * 0.1,
  dartChance: index * 0.065,
  progressGainRate: 0.55 / (1 + index * 0.3),
}))

/** A null next level means the final fish has been caught. */
export function getNextLevelIndex(currentIndex: number): number | null {
  return currentIndex + 1 < FISHING_LEVELS.length ? currentIndex + 1 : null
}
