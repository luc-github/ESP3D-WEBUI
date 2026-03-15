# ESP3D-WEBUI 3.1.0 Beta 1

This beta introduces new features and improvements while staying compatible with existing setups, except for **extension manifests** (see Breaking changes). Feedback is welcome before the stable 3.1.0 release.

---

## New features

### Scan for extensions, themes, and language packs

- **Scan for extensions** (Settings → Interface → Extra content): discovers extensions in `/extensions` (or root `/` as fallback), reads the embedded manifest from each `esp3dext-*.html`, and filters by WebUI version and target. You can select multiple extensions and add them in one click (**Add selected**). Checkboxes are checked by default for a quicker import.
- **Themes and languages**: the same scan logic supports `/themes` and `/languages` directories while remaining compatible with files at the root (`/`). You can organize assets in subdirectories or keep them at root.

### Dashboard: fixed panel order and drag & drop

- **Fixed panels order** (Settings → Interface): when enabled, panels can be reordered by **drag & drop** on the dashboard. An anchor icon on each panel opens the reorder handle; tooltip **Move panel** is shown to the left so it does not cover extension content.
- Panel order is saved in preferences and restored on reload. Extra content panels (extensions, image, etc.) are included in the order and display correctly (z-index fix for overlay content).

### Extensions and extra content

- **Manifest-based compatibility**: extensions must include an embedded `<script type="application/json" id="esp3dext-manifest">` with at least `name`, `target`, `supportedVersion`, and `targetSystem`. The scan only offers extensions that match the current WebUI version and target.
- **Status labels**: in the scan result, **Installed** (replacing “Added”) and **Unsupported** (replacing “Incompatible”) for clearer feedback.
- **Samples**: `extensions_samples/` icons example updated (Camera → Image). API and samples aligned with the current manifest format.

---

## Improvements

- **Docs**: Documentation is now in **English** only. `FEATURES_AND_BUNDLE.md`, `EXTENSIONS_MANIFEST.md`, and `FEATHER_ICONS_USED_UNUSED.md` replace the previous French notes in `/docs`. Former **Memo/** content (preferences, language packs, variables, realtime commands, Target FW, etc.) has been moved to `docs/`; `docs/MEMO_INDEX.md` indexes all docs. `reference/` directory removed.
- **README**: Node.js v24.14.0 and npm 11.11.0 indicated as tested versions.
- **Bundled extensions** (`/extensions`): Click2Go and G-code Viewer now include an embedded manifest and build as `esp3dext-click2go.html` and `esp3dext-gcodeViewer.html` so they are detected by the scan.

---

## Bug fixes

- Extra content panels (image, extensions) not showing when **Fixed panels order** was enabled: fixed by setting `z-index: 10000` on the elements cache container so overlay content appears above panels.
- Anchor (panel drag handle) tooltip overlapping extension content: tooltip position changed to **left** so the panel content stays visible.
- Anchor icon outline on some panels: unified styling (no border/outline when inactive) for all panels.

---

## Limitations

- **Single bundle**: no lazy loading of the main UI; everything is in one `index.html.gz` for simple deployment.
- **Manifest required**: extensions without a valid embedded manifest (or matching `supportedVersion` / `targetSystem`) are not proposed by the scan and are shown as **Unsupported** if already added.

---

## Breaking changes

### Extension manifest

- **Required for scan and compatibility check**: each extension HTML must contain a manifest in a `<script type="application/json" id="esp3dext-manifest">...</script>` block (or a same-name `.json` file). Required fields: `name`, `target`, `supportedVersion`, `targetSystem` (can be `"*"` for any). Optional: `owner`, `version`, `github`, `description`, `icon`, `refreshtime`.
- **Naming**: for the scan to find extensions in `/extensions` or `/`, the file name must start with `esp3dext-` and end with `.html` or `.html.gz` (e.g. `esp3dext-myplugin.html`).
- Extensions that do not provide a valid manifest or do not match the current WebUI version/target will be treated as **Unsupported** and will not load in the dashboard.

---

## How to test this beta

1. Use Node.js v24.14.0 and npm 11.11.0 (or current LTS).
2. Build and run the dev server as usual (`npm run dev-<system>-<firmware>`).
3. Enable **Fixed panels order** in Settings → Interface and drag panels on the dashboard.
4. Use **Scan for extensions** and add extensions from `/extensions` (or `/`); check that **Installed** / **Available** / **Unsupported** labels and tooltips (e.g. **Move panel**) behave as expected.
5. Report issues or suggestions on the project repository or Discord.

Thank you for testing and feedback.

---

## Bundle sizes (for release notes)

To generate an up-to-date table of all package sizes (per target/subtarget), run from the repo root:

```bash
python tools/release_bundle_sizes.py
```

This runs `npm run buildall` then writes **dist/BUNDLE_SIZES.md** with a Markdown table (Target, Subtarget, Size, Bytes, Path). You can paste that table into this release document or into `docs/FEATURES_AND_BUNDLE.md`. Use `--no-build` to skip the build and only report existing `dist/` contents.

---

## Other areas updated in this cleanup

- **PROJECT_CONTEXT.md**: references updated to `docs/` (no separate Memo folder); documentation pointers to `docs/MEMO_INDEX.md` and `extensions_samples/API.md`.
- **package.json**: consider setting `"version": "3.1.0-beta.1"` (or `3.1.0b1`) when cutting the beta; **info.json** (if used for the version badge in README) should match.
