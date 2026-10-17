# dyhtg_2026

A browser fishing game built with React, TypeScript, and Vite.

## Gameplay

Work through ten levels, from an 8 cm minnow to a 400 cm marlin. Each level has a
fixed target fish. Catch it to advance; an escape lets you retry the same level.
Later fish swim faster, change targets more often, and make more sudden darts.
The gold catch meter fills more slowly with each level, so bigger fish require
longer tracking. It drains at the same rate whenever the fish leaves the bar.
The fish marker also grows with each level; its centre must stay in the green bar.

Click **Cast the rod** or press **Space**, then react to the bite with **Pull** or
**Space**. Hold to lift the green bar and release to let it fall. Keep the fish in
the bar until the gold meter fills. Catch the marlin to finish, then use **Play
again** to restart. Progress and catches reset when the page is refreshed.

Level sizes and difficulty settings live in `src/features/fishing/fishCatalog.ts`.

## Getting started

Requires Node.js 20.19+ or 22.12+ and npm.

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
public/                 Static files served without processing
src/
  assets/               Images, fonts, and other imported assets
  components/
    layout/             Shared page layouts
    ui/                 Reusable UI components
  constants/            Shared application constants
  context/              React context providers
  features/             Feature-specific components, hooks, and logic
  hooks/                Shared custom React hooks
  pages/                Page-level components
  services/             API clients and external integrations
  styles/               Global styles and design tokens
  types/                Shared TypeScript types
  utils/                Shared utility functions
  App.tsx               Application composition
  main.tsx              Browser entry point
```

Keep feature-specific code together in `features/`; move code to shared folders
when it is needed by multiple features. Empty folders contain `.gitkeep` files so
they remain in version control; remove these as you add real files.

## Environment variables

Copy `.env.example` to `.env.local` and adjust values for your environment.
Only variables prefixed with `VITE_` are exposed to browser code. Never put secrets
in these variables. `VITE_APP_NAME` controls the starter page title.
