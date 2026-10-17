export type GamePhase =
  | 'idle'
  | 'waiting'
  | 'bite'
  | 'minigame'
  | 'success'
  | 'escaped'

export interface Fish {
  name: string
  color: string
  /** Lower is rarer. Used as a weight when picking a catch. */
  weight: number
}

export interface CaughtEntry {
  fish: Fish
  count: number
}
