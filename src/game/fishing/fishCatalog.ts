import type { Fish, FishingLevel } from './types'

const FISH_CATALOG: Fish[] = [
  { name: 'Old Boot', lengthCm: 25, textureKey: 'fish-boot' },
  { name: 'Shrimp', lengthCm: 35, textureKey: 'fish-shrimp' },
  { name: 'Herring', lengthCm: 50, textureKey: 'fish-herring' },
  { name: 'Duck', lengthCm: 65, textureKey: 'fish-duck' },
  { name: 'Lobster', lengthCm: 80, textureKey: 'fish-lobster' },
  { name: 'Swordfish', lengthCm: 150, textureKey: 'fish-swordfish' },
  { name: 'Whale', lengthCm: 300, textureKey: 'fish-whale' },
  { name: 'Great White', lengthCm: 500, textureKey: 'fish-greatwhite' },
  { name: 'Sea Monster', lengthCm: 1200, textureKey: 'fish-seamonster' },
  { name: 'JP Morgan Job Offer', lengthCm: 2000, textureKey: 'fish-joboffer' },
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

export function getNextLevelIndex(currentIndex: number): number | null {
  return currentIndex + 1 < FISHING_LEVELS.length ? currentIndex + 1 : null
}
