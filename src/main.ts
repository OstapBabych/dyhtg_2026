import Phaser from 'phaser'
import { FishingScene } from './game/FishingScene'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './game/fishing/layout'

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  pixelArt: true,
  backgroundColor: '#bfe6f5',
  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [FishingScene],
})
