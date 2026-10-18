# Art assets

In use (loaded by `src/game/assetManifest.ts`):

- `background.png` — the whole scene (sky, water, shore, reeds, trees, the angler with his
  rod). Drawn at ~16:9, displayed at the game's native 960×540 with no cropping.
- `bobber.png`, `bite-mark.png` — the dynamic bits the background can't bake in: the bobber
  floats/dips with code, and the "!" only shows during the bite window.
- `bear.png`, `question-mark.png` — peeks up from the bottom-left corner during the bite
  window, ducks away once the reel minigame starts.
- `board.png`, `button.png` — the catch-log board and the cast/reel button.
- `fish-boot.png`, `fish-shrimp.png`, `fish-herring.png`, `fish-duck.png`,
  `fish-lobster.png`, `fish-swordfish.png`, `fish-whale.png`, `fish-greatwhite.png`,
  `fish-seamonster.png`, `fish-joboffer.png` — the reel-meter icon for each level's catch
  (see `src/game/fishing/fishCatalog.ts` for the order).
