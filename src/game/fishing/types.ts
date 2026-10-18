export type GamePhase =
  | 'idle'
  | 'waiting'
  | 'bite'
  | 'minigame'
  | 'success'
  | 'escaped'
  | 'complete'

export interface Fish {
  name: string
  lengthCm: number
  /** Texture key loaded in preload(), e.g. 'fish-shrimp'. */
  textureKey: string
}

export interface FishingLevel {
  number: number
  fish: Fish
  speed: number
  turnIntervalMin: number
  turnIntervalMax: number
  dartChance: number
  progressGainRate: number
}

export interface FishMotion {
  y: number
  targetY: number
  turnIn: number
  speedMultiplier: number
}

export interface CaughtEntry {
  fish: Fish
  count: number
}
