# dyhtg_2026

A fullscreen pixel-art fishing game, built with Phaser 4, TypeScript, and Vite.

## Gameplay

Work through ten levels, each a different "catch" — starting with an Old Boot and
ending with a JP Morgan Job Offer, by way of a shrimp, a duck, a swordfish, a whale,
and a sea monster. Catch the current level's target to advance; letting it escape
lets you retry the same level. Later levels swim faster, change direction more
often, and dart more suddenly, so the gold catch meter also fills more slowly —
bigger catches take longer to reel in. It drains at the same rate whenever the
catch leaves the green bar.

Click **Cast the rod** (or press **Space**), then react when the bobber dips and
the "!" appears — a bear peeks up from the corner during that window. Press **Reel
in!** (or hold **Space**) to lift the green bar; release to let it fall. Keep the
catch inside the bar until the gold meter fills. Catch the final level to finish,
then **Play again** to restart. Progress resets on page refresh.

Level order, sizes, and difficulty curve live in `src/game/fishing/fishCatalog.ts`.

## Getting started

Requires Node.js 20.19+ or 22.12+ and npm (see `requirements.txt` for exact
versions this was built against).

```sh
npm install
npm run dev
```

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

## Scripts

- `npm run dev` starts the development server.
- `npm run build` checks TypeScript and creates a production build in `dist/`.
- `npm run lint` checks the source with ESLint.
- `npm test` checks level progression and fish movement using Node's test runner.
- `npm run preview` serves the production build locally.

## Project structure

```text
src/
  main.ts                    Phaser.Game bootstrap (960x540 virtual canvas,
                              fullscreen ENVELOP scaling, pixel-art rendering)
  game/
    FishingScene.ts          The single scene: state machine, physics, rendering
    assetManifest.ts         texture key -> bundled asset URL, loaded in preload()
    fishing/
      types.ts               GamePhase, Fish, FishingLevel, FishMotion
      fishCatalog.ts         The 10 levels and their difficulty curve
      fishMovement.ts        Pure function driving fish motion in the reel minigame
      layout.ts              All on-screen coordinates and sizes
  assets/                    Art (see src/assets/README.md for what each file is)
tests/
  fishing.test.mjs           Tests fishCatalog + fishMovement directly (no Phaser)
```

## Art

`src/assets/background.png` is one painted scene (sky, water, shore, reeds, trees,
the angler with his rod) at the game's native aspect ratio. Only the pieces that
move or change at runtime are separate sprites: the bobber, the bite mark, the
peeking bear, the catch icons, the board, and the button. See
`src/assets/README.md` for the full list and what's wired up vs. still unused.
