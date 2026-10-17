import type { Fish } from './types'

export const FISH_CATALOG: Fish[] = [
  { name: 'Карасик', color: '#c0c0c8', weight: 10 },
  { name: 'Окунь', color: '#e0a94e', weight: 8 },
  { name: 'Щука', color: '#5a7a4f', weight: 5 },
  { name: 'Сом', color: '#6b5a4a', weight: 3 },
  { name: 'Золота рибка', color: '#f2c94c', weight: 1 },
]

export function pickRandomFish(): Fish {
  const totalWeight = FISH_CATALOG.reduce((sum, fish) => sum + fish.weight, 0)
  let roll = Math.random() * totalWeight
  for (const fish of FISH_CATALOG) {
    roll -= fish.weight
    if (roll <= 0) return fish
  }
  return FISH_CATALOG[0]
}
