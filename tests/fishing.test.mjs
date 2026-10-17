import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

// Compile the pure game modules in memory so tests use the same code as the app.
async function loadGameModule(name) {
  const source = await readFile(new URL(`../src/features/fishing/${name}.ts`, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  })
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
}

const { FISHING_LEVELS, getNextLevelIndex } = await loadGameModule('fishCatalog')
const { createFishMotion, moveFish, FISH_MIN_Y, FISH_MAX_Y } = await loadGameModule('fishMovement')
const first = FISHING_LEVELS[0]
const last = FISHING_LEVELS.at(-1)

test('every level has a larger fish, harder movement, and a slower catch meter', () => {
  assert.equal(FISHING_LEVELS.length, 10)
  assert.equal(new Set(FISHING_LEVELS.map((level) => level.fish.name)).size, 10)
  for (const [index, level] of FISHING_LEVELS.entries()) {
    assert.equal(level.number, index + 1)
    assert.ok(level.turnIntervalMin > 0)
    assert.ok(level.turnIntervalMax >= level.turnIntervalMin)
    assert.ok(level.dartChance >= 0 && level.dartChance <= 1)
    assert.ok(Number.isFinite(level.progressGainRate) && level.progressGainRate > 0)
    if (index === 0) continue
    const previous = FISHING_LEVELS[index - 1]
    assert.ok(level.fish.lengthCm > previous.fish.lengthCm)
    assert.ok(level.speed > previous.speed)
    assert.ok(level.turnIntervalMin < previous.turnIntervalMin)
    assert.ok(level.turnIntervalMax < previous.turnIntervalMax)
    assert.ok(level.dartChance > previous.dartChance)
    assert.ok(level.progressGainRate < previous.progressGainRate)
  }
})

test('each catch unlocks exactly the next level and the last catch finishes', () => {
  let index = 0
  const catches = []
  while (index !== null) {
    catches.push(FISHING_LEVELS[index].fish.name)
    const next = getNextLevelIndex(index)
    if (next !== null) assert.equal(next, index + 1)
    index = next
  }
  assert.deepEqual(catches, FISHING_LEVELS.map((level) => level.fish.name))
  assert.equal(getNextLevelIndex(FISHING_LEVELS.length - 1), null)
})

test('later fish cover more distance in the same frame without teleporting', () => {
  const motion = { y: 170, targetY: 300, turnIn: 1, speedMultiplier: 1 }
  const easy = moveFish(motion, first, 1 / 60)
  const hard = moveFish(motion, last, 1 / 60)
  assert.ok(hard.y > easy.y)
  assert.ok(hard.y - motion.y <= last.speed / 60 + 1e-10)
  assert.equal(motion.y, 170)
})

test('higher levels retarget sooner and can dart on the same random roll', () => {
  const motion = createFishMotion()
  const easy = moveFish(motion, first, 1 / 60, () => 0.2)
  const hard = moveFish(motion, last, 1 / 60, () => 0.2)
  assert.ok(hard.turnIn < easy.turnIn)
  assert.equal(easy.speedMultiplier, 1)
  assert.equal(hard.speedMultiplier, 1.55)
})

test('new targets can reverse a fish in either direction', () => {
  const motion = createFishMotion()
  assert.ok(moveFish(motion, last, 0.05, () => 0).y < motion.y)
  assert.ok(moveFish(motion, last, 0.05, () => 0.999).y > motion.y)
})

test('fish stay within the track through sustained random movement at every level', () => {
  let seed = 42
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 2 ** 32
  }
  for (const level of FISHING_LEVELS) {
    let motion = createFishMotion()
    for (let frame = 0; frame < 3600; frame++) {
      const next = moveFish(motion, level, 1 / 60, random)
      assert.ok(next.y >= FISH_MIN_Y && next.y <= FISH_MAX_Y)
      assert.ok(Math.abs(next.y - motion.y) <= level.speed * 1.55 / 60 + 1e-10)
      motion = next
    }
  }
})

test('movement is consistent across frame rates between turns and never overshoots', () => {
  const motion = { y: 170, targetY: 300, turnIn: 1, speedMultiplier: 1 }
  const oneFrame = moveFish(motion, first, 0.04)
  const twoFrames = moveFish(moveFish(motion, first, 0.02), first, 0.02)
  assert.ok(Math.abs(oneFrame.y - twoFrames.y) < 1e-10)
  const nearTarget = { ...motion, y: 298.5 }
  assert.equal(moveFish(nearTarget, last, 0.05).y, 300)
})
