# Extensions: manifest and scan (implementation notes)

Notes for the **extension scan and manifest-based filtering** in the WebUI.

---

## Reference: API and samples

- **`extensions_samples/API.md`** — Section **"Extension manifest (auto-configuration)"**
  - Embedded block `<script type="application/json" id="esp3dext-manifest">...</script>`.
  - Fallback: `.json` file with the same name as the `.html`.
  - Fields: owner, version, name, target, supportedVersion, targetSystem, icon, refreshtime, etc. (required/optional).
  - Rules for `supportedVersion` (e.g. `3.*`, `3.0.*`) and `targetSystem` (marlin, 3d printer, cnc, sand table, etc.).

- **Sample manifests** in `extensions_samples/`: e.g. `esp3dext-capabilities.html`, `esp3dext-icons.html`, `esp3dext-modal.html`, etc.

---

## Overview

- **Where:** Settings → Interface → Extra content.
- **Behaviour:** Button **"Extensions list"** (S242) opens a modal that:
  1. Lists files in the upload directory (HostUploadPath) whose name contains `esp3dext` and ends with `.html` or `.html.gz`.
  2. For each file, fetches the **manifest** (embedded in HTML or same-name `.json`).
  3. Filters by **WebUI version** (`supportedVersion`) and **target** (`targetSystem`).
  4. Shows a table with status: **Available** / **Installed** / **Unsupported**.
  5. User checks "Available" extensions and clicks **"Add selected"** (S254) to add them to Extra content.

---

## Manifest – required fields and filtering

See the full table in `extensions_samples/API.md` (Extension manifest section). Example: `esp3dext-capabilities.html`.

- **Required for scan to offer the extension:** `name`, `target`, `supportedVersion` non-empty, and `targetSystem` present (can be `*` or empty = any target).
- **Optional:** owner, version, github, description, icon, refreshtime.
- **supportedVersion:** pattern such as `*`, `3.*`, `3.0.*`; segment-by-segment match.
- **targetSystem:** string or array; e.g. `marlin`, `repetier`, `grbl`, `grblhal`, `3d printer`, `cnc`, `sand table`. Scan uses current category and target for matching.

---

## Implementation (src/)

- **Helpers:** `parseEmbeddedManifest(htmlText)` in `src/components/Helpers` (or equivalent).
- **Scan UI:** `ScanExtensionsList` in `src/components/Controls/ScanExtensions.js` — list files, fetch manifests, filter, table with checkboxes, "Add selected".
- **ExtraContentItem:** for type `extension`, check manifest (`supportedVersion` + `targetSystem`) before displaying; otherwise toast "extension %s not compatible" (S252).
- **Translations:** S237 (Scan for extensions), S242 (Extensions list), S248 (Installed), S250 (Available), S254 (Add selected), etc.
