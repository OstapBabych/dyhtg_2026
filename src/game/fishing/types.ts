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
