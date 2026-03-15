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
- `docs/`: project documentation (features, bundle, extensions manifest, Feather icons, preferences, language packs, firmware IDs, variables, realtime commands). See **docs/MEMO_INDEX.md** for the index.
- `.github/`: CI workflow and project automation

## Extensions

Extensions are optional pieces of code that add functionality to the Web UI (new panels, pages, or features) without changing the core app.

**Characteristics:**

- **Isolated execution:** Extensions run inside their own iframe (`iframe.extensionContainer`), separate from the main app.
- **Dynamic loading:** Loaded on demand when the user opens the panel or page that hosts them.
- **Consistent styling:** They can use the same CSS/theme as the main UI (injected by the host).
- **Message-based API:** All communication is via `postMessage`; only string/array-serializable data (no non-cloneable objects).

**Installation (high level):**

1. **Upload** the extension file (e.g. HTML or packed asset) to the device filesystem or a path served by the Web server. Optionally minify and gzip to reduce size and load time.
2. **Register in the UI:** In the Interface (or relevant) settings, add an “extra content” entry: choose type “Extension”, set the URL/path to the extension, and choose whether it appears as a **panel** (e.g. on the dashboard) or a **page** (e.g. in the menu).
3. The extension is then displayed according to that configuration; the host injects it into an iframe and applies the same theme.

**Extension API (overview):**

- **Extension → Web UI:** `window.parent.postMessage(msg, '*')` with `msg.target === 'webui'`. Required fields: `type` (e.g. `cmd`, `query`, `upload`, `download`, `toast`, `sound`, `translate`, `capabilities`, `extensionsData`, `icon`, `dispatch`, `modal`), plus type-specific fields (`content`, `url`, `id`, `noDispatch`, etc.). See full API for each type.
- **Web UI → Extensions:** The host sends messages to all extension iframes via `dispatchToExtensions(type, data, id)` in `src/components/Helpers/html.js`. Extensions receive `{ type, content, id }` and can filter by `id` if they need to react only to responses they requested.
- **Notifications to extensions:** The Web UI can send notifications (e.g. visibility or connection state). For example: `{ type: 'notification', content: { isVisible, isConnected }, id }`. When `id` is the node id of the iframe’s container, the message is targeted to that extension; when `id` is `'all'`, it is broadcast.

**Implementation notes:**

- Message handling from extensions: `src/areas/index.js` → `processExtensionMessage()` (switch on `eventMsg.data.type` for `cmd`, `query`, `upload`, `download`, `sound`, `toast`, `translate`, `capabilities`, `extensionsData`, `icon`, `dispatch`, `modal`, etc.).
- Extension content is rendered by `src/components/ExtraContent/` (e.g. extraContentItem.js) and listed in preferences under extra content / extensions; settings are stored in `preferences.json` (e.g. `interfaceSettings.extensions`).

**Documentation and samples:**

- **Full API and message formats:** `extensions_samples/API.md` (message types, request/response shapes, modals, manifest).
- **Manifest and scan:** `docs/EXTENSIONS_MANIFEST.md`.
- **Sample code:** `extensions_samples/esp3dext-*.html` and in-repo extensions: `extensions/click2go`, `extensions/gcodeViewer` (build as `esp3dext-click2go.html`, `esp3dext-gcodeViewer.html`).

## Localization

Localization is a first-class part of the repo. `languages/` contains shared translations plus target-specific language packs (e.g. printer, CNC, CNC grblHAL, sand table). Translation keys are used across the UI and in extension-facing APIs (e.g. modal buttons, toasts).

## Important Documentation Sources

Useful files for future contributors or agents:

- `README.md`: setup, dev commands, build commands, compatibility
- `docs/FEATURES_AND_BUNDLE.md`: bundle size and main features
- `docs/EXTENSIONS_MANIFEST.md`: extension manifest and scan behaviour
- `docs/FEATHER_ICONS_USED_UNUSED.md`: icon usage in the codebase
- `docs/MEMO_INDEX.md`: index of **docs/** (preferences, language packs, firmware IDs, variables, realtime commands, features, data structure). For ESP3D protocol (commands, responses, WebSocket), see esp3d.io and firmware documentation.
- **Extensions:** `extensions_samples/API.md` (full message contract and manifest), `docs/EXTENSIONS_MANIFEST.md` (scan and compatibility)

## Constraints And Gaps

- There is no real automated test suite in the root project. `npm test` is a placeholder error command.
- CI appears focused on build validation rather than unit/integration testing.
- `repomix-output.xml` is a packed, read-only snapshot and may omit ignored files such as `node_modules`, `dist`, `build`, and anything excluded by ignore rules.
- Version metadata: `package.json` and `info.json` (if present) may need to be kept in sync for badges and release tagging.

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