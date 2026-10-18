import Phaser from 'phaser'
import { ASSET_MANIFEST } from './assetManifest'
import { FISHING_LEVELS, getNextLevelIndex } from './fishing/fishCatalog'
import { createFishMotion, moveFish } from './fishing/fishMovement'
import {
  BAR_HEIGHT,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  BOARD_X,
  BOARD_Y,
  BOBBER_BASE_Y,
  BOBBER_X,
  BUTTON_HEIGHT,
  BUTTON_WIDTH,
  BUTTON_X,
  BUTTON_Y,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  PROGRESS_WIDTH,
  PROGRESS_X,
  ROD_TIP_X,
  ROD_TIP_Y,
  TRACK_HEIGHT,
  TRACK_WIDTH,
  TRACK_X,
  TRACK_Y,
} from './fishing/layout'
import type { CaughtEntry, Fish, FishMotion, GamePhase } from './fishing/types'

const GRAVITY = 1400
const LIFT = -3200
const MAX_VELOCITY = 760
const PROGRESS_LOSS_RATE = 0.35

const CAST_WAIT_MIN_MS = 900
const CAST_WAIT_MAX_MS = 2600
const BITE_WINDOW_MS = 900
const RESULT_DISPLAY_MS = 1500

const LINE_COLOR = 0xeaeaea

const TRACK_COLOR = 0x23314a
const TRACK_PANEL_COLOR = 0x0f1a2b
const CATCH_ZONE_COLOR = 0x4caf50
const PROGRESS_TRACK_COLOR = 0x11314a
const PROGRESS_FILL_COLOR = 0xf2c94c

const BUTTON_DISABLED_ALPHA = 0.5

const MIN_FISH_SIZE = 40
const MAX_FISH_SIZE_BONUS = 90

const BEAR_X = -56
const BEAR_Y = CANVAS_HEIGHT + 20
const BEAR_HEIGHT = 180
const BEAR_WIDTH = BEAR_HEIGHT * (1296 / 1213)
const QUESTION_MARK_X = BEAR_X + BEAR_WIDTH * 0.45
const QUESTION_MARK_Y = CANVAS_HEIGHT - BEAR_HEIGHT - 10
const QUESTION_MARK_SIZE = 52

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function buttonLabel(phase: GamePhase): string {
  switch (phase) {
    case 'idle':
      return 'Cast the rod'
    case 'waiting':
      return 'Waiting...'
    case 'bite':
    case 'minigame':
      return 'Reel in!'
    case 'success':
      return 'Got one!'
    case 'escaped':
      return 'It got away...'
    case 'complete':
      return 'Play again'
  }
}

export class FishingScene extends Phaser.Scene {
  private phase: GamePhase = 'idle'
  private levelIndex = 0
  private inventory: Record<string, CaughtEntry> = {}

  private holding = false
  private bobTime = 0
  private barY = (TRACK_HEIGHT - BAR_HEIGHT) / 2
  private barVelocity = 0
  private fishMotion: FishMotion = createFishMotion()
  private progress = 0.5

  private castTimer?: Phaser.Time.TimerEvent
  private biteTimer?: Phaser.Time.TimerEvent
  private resultTimer?: Phaser.Time.TimerEvent

  private fishingLine!: Phaser.GameObjects.Graphics
  private bobber!: Phaser.GameObjects.Image
  private biteMark!: Phaser.GameObjects.Image
  private bear!: Phaser.GameObjects.Image
  private bearQuestionMark!: Phaser.GameObjects.Image

  private trackPanel!: Phaser.GameObjects.Graphics
  private trackBg!: Phaser.GameObjects.Graphics
  private catchBar!: Phaser.GameObjects.Graphics
  private fishSprite!: Phaser.GameObjects.Image
  private progressBg!: Phaser.GameObjects.Graphics
  private progressFill!: Phaser.GameObjects.Graphics
  private lastLevelIndex = -1

  private buttonBg!: Phaser.GameObjects.Image
  private buttonText!: Phaser.GameObjects.Text

  private levelText!: Phaser.GameObjects.Text
  private boardText!: Phaser.GameObjects.Text

  constructor() {
    super('fishing')
  }

  preload() {
    for (const [key, url] of Object.entries(ASSET_MANIFEST)) {
      this.load.image(key, url)
    }
  }

  create() {
    this.drawScenery()
    this.createIdleProps()
    this.createMinigameProps()
    this.createButton()
    this.createBoard()
    this.setupKeyboard()
    this.refreshVisibility()
  }

  update(_time: number, deltaMs: number) {
    const dt = Math.min(deltaMs / 1000, 0.05)
    if (this.phase === 'minigame') {
      this.updateMinigame(dt)
    } else {
      this.bobTime += dt
    }
    this.render()
  }

  private drawScenery() {
    this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(CANVAS_WIDTH, CANVAS_HEIGHT)
  }

  private createIdleProps() {
    this.fishingLine = this.add.graphics()
    this.bobber = this.add.image(BOBBER_X, BOBBER_BASE_Y, 'bobber')
    this.biteMark = this.add.image(BOBBER_X, BOBBER_BASE_Y - 30, 'bite-mark')

    this.bear = this.add.image(BEAR_X, BEAR_Y, 'bear').setOrigin(0, 1).setDisplaySize(BEAR_WIDTH, BEAR_HEIGHT)
    this.bearQuestionMark = this.add
      .image(QUESTION_MARK_X, QUESTION_MARK_Y, 'question-mark')
      .setDisplaySize(QUESTION_MARK_SIZE, QUESTION_MARK_SIZE)
  }

  private createMinigameProps() {
    this.trackPanel = this.add
      .graphics()
      .fillStyle(TRACK_PANEL_COLOR, 0.6)
      .fillRect(TRACK_X - 16, TRACK_Y - 16, TRACK_WIDTH + PROGRESS_WIDTH + 62, TRACK_HEIGHT + 32)
    this.trackBg = this.add.graphics().fillStyle(TRACK_COLOR).fillRect(TRACK_X, TRACK_Y, TRACK_WIDTH, TRACK_HEIGHT)
    this.catchBar = this.add.graphics().fillStyle(CATCH_ZONE_COLOR).fillRect(0, 0, TRACK_WIDTH, BAR_HEIGHT)
    this.catchBar.x = TRACK_X
    this.fishSprite = this.add.image(TRACK_X + TRACK_WIDTH / 2, TRACK_Y + TRACK_HEIGHT / 2, FISHING_LEVELS[0].fish.textureKey)
    this.progressBg = this.add
      .graphics()
      .fillStyle(PROGRESS_TRACK_COLOR)
      .fillRect(PROGRESS_X, TRACK_Y, PROGRESS_WIDTH, TRACK_HEIGHT)
    this.progressFill = this.add.graphics()
  }

  private createButton() {
    this.buttonBg = this.add
      .image(BUTTON_X, BUTTON_Y, 'button')
      .setDisplaySize(BUTTON_WIDTH, BUTTON_HEIGHT)
      .setInteractive({ useHandCursor: true })
    this.buttonText = this.add
      .text(BUTTON_X, BUTTON_Y, buttonLabel(this.phase), { fontSize: '21px', color: '#f4e9d8', fontStyle: 'bold' })
      .setOrigin(0.5)

    this.buttonBg.on('pointerdown', () => this.onPrimaryDown())
    this.buttonBg.on('pointerup', () => this.endHold())
    this.buttonBg.on('pointerout', () => this.endHold())
  }

  private createBoard() {
    this.add.image(BOARD_X + BOARD_WIDTH / 2, BOARD_Y + BOARD_HEIGHT / 2, 'board').setDisplaySize(BOARD_WIDTH, BOARD_HEIGHT)
    this.levelText = this.add
      .text(BOARD_X + BOARD_WIDTH / 2, BOARD_Y + 36, '', { fontSize: '18px', color: '#2a1a0e', fontStyle: 'bold' })
      .setOrigin(0.5)
    this.boardText = this.add.text(BOARD_X + 18, BOARD_Y + 58, '', {
      fontSize: '13px',
      color: '#2a1a0e',
      lineSpacing: 8,
    })
    this.refreshBoard()
  }

  private refreshBoard() {
    this.levelText.setText(`Level ${this.levelIndex + 1}/${FISHING_LEVELS.length}`)
    const lines = Object.values(this.inventory).map((entry, index) => `${index + 1}. ${entry.fish.name}`)
    this.boardText.setText(lines.length > 0 ? lines : ['Nothing yet'])
  }

  private setupKeyboard() {
    const keyboard = this.input.keyboard
    if (!keyboard) return
    keyboard.on('keydown-SPACE', (event: KeyboardEvent) => {
      event.preventDefault()
      if (event.repeat) return
      this.onPrimaryDown()
    })
    keyboard.on('keyup-SPACE', (event: KeyboardEvent) => {
      event.preventDefault()
      this.endHold()
    })
  }

  private onPrimaryDown() {
    if (this.phase === 'idle') {
      this.cast()
      return
    }
    if (this.phase === 'complete') {
      this.restart()
      return
    }
    this.startHold()
  }

  private setPhase(next: GamePhase) {
    this.phase = next
    this.buttonText.setText(buttonLabel(next))
    const interactivePhases: GamePhase[] = ['idle', 'bite', 'minigame', 'complete']
    const isInteractive = interactivePhases.includes(next)
    this.buttonBg.setAlpha(isInteractive ? 1 : BUTTON_DISABLED_ALPHA)
    this.buttonText.setAlpha(isInteractive ? 1 : BUTTON_DISABLED_ALPHA)
    if (isInteractive) this.buttonBg.setInteractive({ useHandCursor: true })
    else this.buttonBg.disableInteractive()
  }

  private clearTimers() {
    this.castTimer?.remove()
    this.biteTimer?.remove()
    this.resultTimer?.remove()
  }

  private cast() {
    if (this.phase !== 'idle') return
    this.setPhase('waiting')
    const wait = CAST_WAIT_MIN_MS + Math.random() * (CAST_WAIT_MAX_MS - CAST_WAIT_MIN_MS)
    this.castTimer = this.time.delayedCall(wait, () => {
      this.setPhase('bite')
      this.biteTimer = this.time.delayedCall(BITE_WINDOW_MS, () => {
        if (this.phase === 'bite') this.triggerEscape()
      })
    })
  }

  private startHold() {
    if (this.phase === 'bite') {
      this.biteTimer?.remove()
      this.barY = (TRACK_HEIGHT - BAR_HEIGHT) / 2
      this.barVelocity = 0
      this.fishMotion = createFishMotion()
      this.progress = 0.5
      this.holding = true
      this.setPhase('minigame')
      return
    }
    if (this.phase === 'minigame') this.holding = true
  }

  private endHold() {
    this.holding = false
  }

  private restart() {
    if (this.phase !== 'complete') return
    this.clearTimers()
    this.holding = false
    this.levelIndex = 0
    this.inventory = {}
    this.refreshBoard()
    this.setPhase('idle')
  }

  private triggerEscape() {
    this.holding = false
    this.setPhase('escaped')
    this.resultTimer = this.time.delayedCall(RESULT_DISPLAY_MS, () => this.setPhase('idle'))
  }

  private triggerCatchSuccess() {
    this.holding = false
    const fish: Fish = FISHING_LEVELS[this.levelIndex].fish
    const existing = this.inventory[fish.name]
    this.inventory[fish.name] = { fish, count: (existing?.count ?? 0) + 1 }
    this.refreshBoard()

    const nextIndex = getNextLevelIndex(this.levelIndex)
    this.setPhase('success')
    this.resultTimer = this.time.delayedCall(RESULT_DISPLAY_MS, () => {
      if (nextIndex === null) {
        this.setPhase('complete')
        return
      }
      this.levelIndex = nextIndex
      this.refreshBoard()
      this.setPhase('idle')
    })
  }

  private updateMinigame(dt: number) {
    const accel = this.holding ? LIFT : GRAVITY
    this.barVelocity = clamp(this.barVelocity + accel * dt, -MAX_VELOCITY, MAX_VELOCITY)
    this.barY += this.barVelocity * dt

    const maxBarY = TRACK_HEIGHT - BAR_HEIGHT
    if (this.barY < 0) {
      this.barY = 0
      this.barVelocity = 0
    } else if (this.barY > maxBarY) {
      this.barY = maxBarY
      this.barVelocity = 0
    }

    const level = FISHING_LEVELS[this.levelIndex]
    this.fishMotion = moveFish(this.fishMotion, level, dt)

    const overlap = this.fishMotion.y >= this.barY && this.fishMotion.y <= this.barY + BAR_HEIGHT
    this.progress = clamp(this.progress + (overlap ? level.progressGainRate : -PROGRESS_LOSS_RATE) * dt, 0, 1)

    if (this.progress >= 1) this.triggerCatchSuccess()
    else if (this.progress <= 0) this.triggerEscape()
  }

  private refreshVisibility() {
    const inMinigame = this.phase === 'minigame'
    this.trackPanel.setVisible(inMinigame)
    this.trackBg.setVisible(inMinigame)
    this.catchBar.setVisible(inMinigame)
    this.progressBg.setVisible(inMinigame)
    this.progressFill.setVisible(inMinigame)
    this.fishSprite.setVisible(inMinigame)

    this.fishingLine.setVisible(!inMinigame)
    this.bobber.setVisible(!inMinigame && this.phase !== 'bite')

    const isBiting = !inMinigame && this.phase === 'bite'
    this.biteMark.setVisible(isBiting)
    this.bear.setVisible(isBiting)
    this.bearQuestionMark.setVisible(isBiting)
  }

  private render() {
    this.refreshVisibility()
    const inMinigame = this.phase === 'minigame'

    if (inMinigame) {
      this.catchBar.y = TRACK_Y + this.barY

      if (this.levelIndex !== this.lastLevelIndex) {
        const fish = FISHING_LEVELS[this.levelIndex].fish
        const size = MIN_FISH_SIZE + (this.levelIndex / (FISHING_LEVELS.length - 1)) * MAX_FISH_SIZE_BONUS
        this.fishSprite.setTexture(fish.textureKey).setDisplaySize(size, size)
        this.lastLevelIndex = this.levelIndex
      }
      this.fishSprite.y = TRACK_Y + this.fishMotion.y

      this.progressFill.clear()
      const filledHeight = TRACK_HEIGHT * this.progress
      this.progressFill
        .fillStyle(PROGRESS_FILL_COLOR)
        .fillRect(PROGRESS_X, TRACK_Y + (TRACK_HEIGHT - filledHeight), PROGRESS_WIDTH, filledHeight)
    } else {
      const bobbing = Math.sin(this.bobTime * 2) * 6
      const dip = this.phase === 'bite' ? 24 : 0
      const bobberY = BOBBER_BASE_Y + bobbing + dip
      this.bobber.setPosition(BOBBER_X, bobberY)
      this.biteMark.setPosition(BOBBER_X, BOBBER_BASE_Y - 30)

      this.fishingLine.clear()
      this.fishingLine.lineStyle(2, LINE_COLOR).lineBetween(ROD_TIP_X, ROD_TIP_Y, BOBBER_X, bobberY)
    }
  }
}
