# PROJECT_CONTEXT

## What This Project Is

`ESP3D-WEBUI` is a Preact-based single-page web UI for ESP3D 3.x and related firmware environments. It is designed to run against multiple machine families and firmware variants, then produce target-specific compressed web assets for deployment.

This document is derived primarily from `repomix-output.xml`, cross-checked against the repository's top-level docs and runtime entry points.

## Tech Stack

- Frontend: `Preact`, `preact/hooks`, `preact-feather`
- Styling: `SCSS`, `spectre.css`
- Build tooling: `Webpack 5`, `Babel`, `compression-webpack-plugin`
- Local development backend: `Express`, `ws`, `express-fileupload`, `express-static-gzip`
- Packaging helpers: custom scripts in `config/`
- Package manager: `npm`

## Architecture Overview

The frontend entry point is `src/index.js`, which renders the root `App` component and pulls both shared styles and subtarget-specific styles into the bundle.

The root app composition in `src/components/App/index.js` wraps the UI with multiple providers:

- data/state providers
- router state
- UI state
- HTTP queue handling
- settings management
- WebSocket handling
- target-specific context

The target abstraction is centered in `src/targets/index.js`. It merges:

- base preferences
- target-level preferences
- subtarget-level preferences

That merge controls target-dependent UI behavior without duplicating the whole app.

Routing is hash-based and handled in `src/components/Router/index.js`, which maps routes to components and falls back to a default route when the current hash is invalid.

## Target And Firmware Matrix

The repo is organized around a two-level target model driven by environment variables:

- `TARGET_ENV`: machine family
- `SUBTARGET_ENV`: firmware variant

Main machine families:

- `Printer3D`
- `CNC`
- `SandTable`

Known firmware/subtargets in this repo:

- `Printer3D`: `Marlin`, `Marlin-embedded`, `Repetier`, `Smoothieware`
- `CNC`: `GRBL`, `grblHAL`
- `SandTable`: `GRBL`

At build and dev time, Webpack aliases `TargetDir` and `SubTargetDir` to the selected target folders. This lets shared code import target-specific modules and styles through stable import paths.

## Runtime Model

Local development uses `config/server.js`, which starts:

- an Express server on port `8080`
- a WebSocket server on port `8089`

The dev server selects mock assets and handlers from `server/<target>/<subtarget>/`, exposes file-management style endpoints such as `/files` and `/sdfiles`, and routes target-specific command/config behavior through `config/targets/<target>/<subtarget>/index.js`.

In development, the usual flow is:

1. Set `TARGET_ENV` and `SUBTARGET_ENV`
2. Run the Express/WebSocket simulator
3. Run the Webpack dev server
4. Open the local UI in the browser

## Build And Output Workflow

Common root workflows from `package.json`:

- `npm install`
- `npm run dev-<system>-<firmware>`
- `npm run <system>-<firmware>`
- `npm run buildall`

Examples:

- `npm run dev-printer-marlin`
- `npm run dev-cnc-grbl`
- `npm run printer-marlin`
- `npm run cnc-grblhal`

Production builds are generated through `config/webpack.prod.js`. The pipeline:

- bundles the SPA from `src/index.js`
- inlines CSS and JS into HTML
- minifies the result
- writes compressed output to `dist/<target>/<subtarget>/index.html.gz`

This packaging model is important: the deployable artifact is not a generic web build, but a target-specific compressed HTML asset.

## Repository Layout

High-signal directories:

- `src/`: main application code
- `src/components/`: reusable UI components
- `src/areas/`: page/layout containers and supporting UI areas
- `src/pages/`: top-level page content
- `src/tabs/`: tab-oriented UI modules
- `src/contexts/`: app-wide providers and shared state
- `src/hooks/`: custom hooks
- `src/style/`: shared styling
- `src/targets/`: target and firmware-specific UI logic, preferences, and assets
- `config/`: Webpack config, dev server, packaging scripts, and target-specific server handlers
- `server/`: local mock server content by target/subtarget
- `languages/`: language packs, including compressed variants
- `extensions/`: packaged extension subprojects
- `extensions_samples/`: extension API documentation and examples
- `Memo/`: internal notes on commands, handlers, firmware mapping, preferences, websocket behavior, and language packs
- `.github/`: CI workflow and project automation

## Extensions And Localization

The repository includes an extension model rather than a strictly closed UI. The extension API is documented in `extensions_samples/API.md` and supports messaging between an embedded extension frame and the main Web UI for:

- commands
- queries
- uploads/downloads
- translation requests
- toast/sound notifications
- modal dialogs
- capability lookups
- extension settings storage

There are at least two extension subprojects in-tree:

- `extensions/click2go`
- `extensions/gcodeViewer`

Localization is a first-class part of the repo. `languages/` contains shared translations plus target-specific language packs such as printer, CNC, CNC grblHAL, and sand table packs.

## Important Documentation Sources

Useful files for future contributors or agents:

- `README.md`: setup, dev commands, build commands, compatibility
- `Memo/TargetFW.md`: firmware naming and IDs
- `Memo/Commands.md`, `Memo/Handlers.md`, `Memo/websocket.md`: protocol and runtime notes
- `Memo/preferences.md`, `Memo/variablesList.md`, `Memo/languagepack.md`: configuration and translation details
- `extensions_samples/API.md`: extension integration contract

## Constraints And Gaps

- There is no real automated test suite in the root project. `npm test` is a placeholder error command.
- CI appears focused on build validation rather than unit/integration testing.
- `repomix-output.xml` is a packed, read-only snapshot and may omit ignored files such as `node_modules`, `dist`, `build`, and anything excluded by ignore rules.
- Version metadata is split: `package.json` reports `3.0.0`, while `info.json` reports `version: 3.0.1` and `devt: 3.0.2`.

## Practical Summary

When working in this repo, assume you are modifying a target-aware Preact SPA that is built into compressed, firmware-specific deployment artifacts. Most significant changes will affect one or more of these layers:

- shared app behavior in `src/`
- target/subtarget behavior in `src/targets/`
- local simulation behavior in `config/` and `server/`
- extension or translation support in `extensions*/` and `languages/`


## Safety Rules For AI Agents

This project builds multiple firmware-specific UIs.

Never refactor the global architecture automatically.

The following systems must remain stable:

- TARGET_ENV / SUBTARGET_ENV build system
- Webpack aliases TargetDir and SubTargetDir
- target-specific folders under src/targets
- build output dist/<target>/<subtarget>/index.html.gz

Any change must preserve compatibility with all targets.