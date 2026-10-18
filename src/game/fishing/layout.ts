/** Virtual game resolution; Phaser's Scale Manager fits this to the real screen. */
export const CANVAS_WIDTH = 960
export const CANVAS_HEIGHT = 540

/**
 * The angler is painted into background.png itself (see src/assets). These just mark
 * where his rod tip sits, so the dynamic line + bobber line up with the art.
 */
export const ROD_TIP_X = 417
export const ROD_TIP_Y = 301
export const BOBBER_X = ROD_TIP_X + 160
export const BOBBER_BASE_Y = 350

/** The vertical reel meter shown while pulling in a fish. */
export const TRACK_WIDTH = 180
export const TRACK_HEIGHT = 320
export const TRACK_Y = 50
export const PROGRESS_WIDTH = 36
const TRACK_GAP = 30
const TRACK_GROUP_WIDTH = TRACK_WIDTH + TRACK_GAP + PROGRESS_WIDTH
export const TRACK_X = (CANVAS_WIDTH - TRACK_GROUP_WIDTH) / 2
export const PROGRESS_X = TRACK_X + TRACK_WIDTH + TRACK_GAP

export const BAR_HEIGHT = 96

/** Bottom-center cast/pull button; matches button.png's native size. */
export const BUTTON_WIDTH = 220
export const BUTTON_HEIGHT = 70
export const BUTTON_X = CANVAS_WIDTH / 2
export const BUTTON_Y = CANVAS_HEIGHT - 60

/** Top-right wooden board listing the catch. */
export const BOARD_WIDTH = 220
export const BOARD_HEIGHT = 260
export const BOARD_X = CANVAS_WIDTH - BOARD_WIDTH - 24
export const BOARD_Y = 24
