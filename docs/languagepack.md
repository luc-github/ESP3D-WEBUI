# Language packs

---

## Language pack manifest (`_manifest`)

A language pack file can carry an optional `_manifest` key at the top level. It is stripped before translations are applied and never shown to users as a translated string. Existing packs without `_manifest` continue to work without any change.

```json
{
    "_manifest": {
        "version": "1.2.0",
        "owner": "Jane Doe",
        "github": "https://github.com/janedoe/esp3d-lang-ar",
        "description": "Arabic translation for ESP3D WebUI.",
        "supportedVersion": "3.*",
        "targetSystem": "*",
        "rtl": true,
        "fonts": [
            {
                "family": "Noto Naskh Arabic",
                "src": "https://fonts.gstatic.com/s/notonaskharabic/v33/RrQ5bpV-9Dd1b1OAGA6M9PkyDuVBePeKNaxcsss0Y7bwvc9smDZ.woff2",
                "format": "woff2",
                "weight": "400",
                "display": "swap"
            }
        ]
    },
    "lang": "العربية",
    "S1": "الاتصال",
    "S2": "قطع الاتصال"
}
```

The `_manifest` key must be the **first** key in the file. Build scripts preserve this ordering automatically.

---

### `_manifest` fields

| Field | Type | Description |
|---|---|---|
| `version` | string | Pack version (semver) |
| `owner` | string | Author / maintainer name |
| `github` | string | Repository or homepage URL |
| `description` | string | Short description (English) |
| `supportedVersion` | string | WebUI version pattern. Informational only — the pack is never rejected, but the information is shown in the language list. |
| `targetSystem` | string | Comma-separated targets. Informational only. |
| `rtl` | boolean | `true` → sets `dir="rtl"` on `<html>` when this language is active |
| `fonts` | array | Custom fonts to load when this language is active (same format as theme fonts) |

All fields are optional. An empty `_manifest: {}` is valid.

---

### `supportedVersion` and `targetSystem`

These fields follow the same syntax as theme and extension manifests (segment-by-segment with `*` wildcard):

| Pattern | Matches |
|---|---|
| `*` | Any version |
| `3.*` | Any 3.x version |
| `3.1.*` | Any 3.1.x version |

**Language packs are never rejected** based on these fields — they are loaded regardless. The values are informational only (displayed in `docs/languages.md` via `npm run list-languages`).

---

### RTL support

When `rtl: true` is set, the WebUI adds `dir="rtl"` to `<html>` while the language is active. This reverses flex direction, text alignment, scrollbars, and margins for all standard CSS that respects `dir`. No extra CSS is needed in the pack.

When a non-RTL language is selected, the `dir` attribute is removed.

RTL is also propagated into extension iframes automatically.

---

### Fonts

Some languages require a specific font to display correctly (Arabic, Hebrew, Chinese, Japanese, Korean, etc.). The `fonts` array lets the language pack load that font when active, independently of the active theme.

Font objects support the same three source formats as theme fonts:

| Format | Use case |
|---|---|
| `data` | Base64-encoded font (offline, self-contained bundle) |
| `src` | URL of the font file (online systems, lighter pack) |
| `sources` | Array of `{ src, format }` or `{ data, format }` for multi-format fallback |

Common fields:

| Field | Type | Default | Description |
|---|---|---|---|
| `family` | string | — | `font-family` name used in CSS |
| `format` | string | `woff2` | Font format (`woff2`, `woff`, `ttf`, `otf`) |
| `weight` | string | `400` | `font-weight` |
| `style` | string | `normal` | `font-style` |
| `display` | string | `auto` | `font-display` — use `swap` to avoid invisible text during load |

The font is injected as `<style id="langfonts">` and is replaced each time the language changes. If the active theme already loads the required font, the language pack does not need to duplicate it.

**The language pack does not need to set `font-family` CSS** — that is the theme's responsibility. The `fonts` array only ensures the font *data* is available. If you also want to force the font on all text regardless of the theme, add a short CSS snippet to the relevant theme, or ask users to set it in their theme.

---

## Application examples

### Example 1 — RTL language (Arabic) with online font

**File:** `languages/printerpack/lang-ar.json`

```json
{
    "_manifest": {
        "version": "1.0.0",
        "owner": "ESP3D Contributors",
        "rtl": true,
        "supportedVersion": "3.*",
        "fonts": [
            {
                "family": "Noto Naskh Arabic",
                "src": "https://fonts.gstatic.com/s/notonaskharabic/v33/RrQ5bpV-9Dd1b1OAGA6M9PkyDuVBePeKNaxcsss0Y7bwvc9smDZ.woff2",
                "format": "woff2",
                "weight": "400",
                "display": "swap"
            }
        ]
    },
    "lang": "العربية",
    "S1": "اتصال",
    "S2": "قطع الاتصال"
}
```

The WebUI will set `dir="rtl"` and load the Noto Naskh Arabic font while this language is active. Switching to any other language removes both.

---

### Example 2 — CJK language (Japanese) with offline font

The font is base64-encoded into the pack. No network access required.

```json
{
    "_manifest": {
        "version": "1.0.0",
        "owner": "ESP3D Contributors",
        "supportedVersion": "3.*",
        "fonts": [
            {
                "family": "NotoSansJP",
                "data": "AAEAAAALA...",
                "format": "woff2",
                "weight": "400",
                "display": "swap"
            }
        ]
    },
    "lang": "日本語",
    "S1": "接続",
    "S2": "切断"
}
```

> **Note:** CJK fonts are large (several MB for a full character set). For offline use, consider a subset font that only covers characters actually used in the UI. Tools like [pyftsubset](https://fonttools.readthedocs.io) or [glyphhanger](https://github.com/zachleat/glyphhanger) can generate subsets.

---

### Example 3 — Standard LTR language (no font needed)

Most Western European languages do not need a custom font or RTL. The manifest is optional but useful for attribution.

```json
{
    "_manifest": {
        "version": "2.1.0",
        "owner": "Jean Dupont",
        "github": "https://github.com/jeandupont/esp3d-lang-fr",
        "description": "French translation.",
        "supportedVersion": "3.*"
    },
    "lang": "Français",
    "S1": "Connexion",
    "S2": "Déconnexion"
}
```

---

## When adding new translation keys

1. Add or update keys in the source translation files:
   - **Globals:** `src/targets/translations/en.json`
   - **Target-specific:** `src/targets/<Target>/translations/en.json` (and subtargets if needed).
2. Run `npm run template` to regenerate pack templates so each `languages/<pack>/en.json` contains the new keys.
3. Translators add the new keys to their language files (e.g. `languages/lang-fr.json` or per-pack `lang-*.json`).
4. Rebuild and compress packs: `npm run package target=languages/<pack>/lang-<code>.json` (or as per your workflow).
5. Use `npm run check reference=languages/<pack>/en.json target=languages/<pack>/lang-<code>.json` to compare and find missing keys.

## Generate template files

Use the script `npm run template` to generate up-to-date template files for all packs.

Currently:

-   CNC GRBL in `languages/cncgrblpack`
-   CNC grblHAL `languages/cncgrblhalpack`
-   3D Printers (all) `languages/printerpack`
-   Sand Table (all) `languages/sandtablepack`

## Language codes and names

See **docs/languages.md** for the table of language codes and names. To regenerate it from the packs:

```bash
npm run list-languages
```

(Optional: pass an output path, e.g. `node config/list-languages.js docs/languages.md`.)

## Generate all language packs at once

From root `languages/lang-*.json` files, build every pack (and compress) in one go:

```bash
npm run buildlangpack:all
```

This runs `buildlangpack` for each root `lang-*.json`. Ensure `npm run template` has been run first.

## Add missing entries and report untranslated

1. **Add missing keys in root language files** (so they contain every key from the template; untranslated = `""`):
   ```bash
   npm run template
   npm run fill-missing-root
   ```
2. **Rebuild all packs** (packs will now include every key; missing translations are `""`):
   ```bash
   npm run buildlangpack:all
   ```
3. **Add missing keys in existing pack files only** (without rebuilding from root):
   ```bash
   npm run fill-missing-keys
   ```
4. **Report keys that are missing, empty, or same as English** (for translation or auto-translation):
   ```bash
   npm run report-untranslated
   ```
   Report is written to `languages/untranslated-report.json`. You can pass an output path:
   ```bash
   node config/report-untranslated.js path/to/report.json
   ```

## Automatic translation from report

After generating `untranslated-report.json`, you can fill missing/empty (and optionally same-as-English) entries using **LibreTranslate** (or a compatible API). The script updates `languages/<pack>/lang-<code>.json` in place.

1. **Generate the report** (if not already done):
   ```bash
   npm run report-untranslated
   ```
2. **Run automatic translation** (default: LibreTranslate public instance, all packs and languages):
   ```bash
   npm run translate-from-report
   ```
   **Options** (env or CLI):
   - `--report=<path>` — path to report (default: `languages/untranslated-report.json`)
   - `--pack=<name>` — only this pack (e.g. `printerpack`)
   - `--lang=<code>` — only this language (e.g. `fr`)
   - `--include-same` — also translate keys that are currently identical to English
   - `--dry-run` — do not write files; only log what would be translated
   - `--batch-size=30` — max strings per API call
   - `--delay=6000` — delay in ms between API calls (default 6s = 10 req/min for public LibreTranslate)

   **Backends:**
   - **libretranslate** (default): needs `LIBRE_TRANSLATE_URL` and optionally `LIBRE_TRANSLATE_KEY`. Public instance often requires a paid key ($29/mo) or is rate-limited (10 req/min).
   - **anthropic** (Claude): pay-per-use, usually cheaper for occasional runs. Set `ANTHROPIC_API_KEY` and run with `--backend=anthropic` (or `TRANSLATE_BACKEND=anthropic`). Uses Claude Haiku; delay default 1 s.

   **Env:**
   - `TRANSLATE_BACKEND` — `libretranslate` (default) or `anthropic`
   - `LIBRE_TRANSLATE_URL` — LibreTranslate base URL
   - `LIBRE_TRANSLATE_KEY` — optional LibreTranslate API key
   - `ANTHROPIC_API_KEY` — required for `--backend=anthropic`

   **Examples:**
   ```bash
   npm run translate-from-report -- --dry-run
   npm run translate-from-report -- --pack=printerpack --lang=fr
   # Use Claude (Anthropic) — pay-per-use, typically a few $ for a full run
   # Option A: create a .env file at project root (recommended, .env is in .gitignore):
   #   ANTHROPIC_API_KEY=sk-ant-api03-...
   # Option B: set in terminal (same line so the variable is visible to npm):
   #   set ANTHROPIC_API_KEY=your_key && npm run translate-from-report -- --backend=anthropic
   #   (PowerShell: $env:ANTHROPIC_API_KEY="your_key"; npm run translate-from-report -- --backend=anthropic)
   npm run translate-from-report -- --backend=anthropic
   npm run translate-from-report -- --backend=anthropic --pack=printerpack --lang=fr
   # LibreTranslate (if you have a key or your own instance)
   npm run translate-from-report -- --delay=6000
   LIBRE_TRANSLATE_URL=https://my-instance.com npm run translate-from-report
   ```
3. **Review** the updated `lang-*.json` files (placeholders like `%s` must stay; technical terms may need manual tweaks). Then run `npm run buildlangpack:all` if you use compressed packs.

## Generate language pack files (single language)

-   Rename the template file according the language code http://www.lingoes.net/en/translator/langcode.htm using `_` instead of `-` and add `lang-` in from of name.
    so for example :

    -   for french language pack, `en.json` file would be renamed to `lang-fr.json`
    -   for simplified chinese language pack, `en.json` file would be renamed to `lang-zh_cn.json`
    -   for simplified chinese language pack, `en.json` file would be renamed to `lang-zh_cn.json`
    -   for german language pack, `en.json` file would be renamed to `lang-de.json`

-   Modify the language pack file according to the language and test it against the WebUI

-   Compress the final pack
    use the following command to compress the final pack targeting the file :  
    `npm run package target=languages/<target pack>/lang-<target language>.json`

    so for French language pack for example:
    `npm run package target=languages/printerpack/lang-fr.json`

## Compare template pack with language pack file

This script is used to compare current language pack content against the template language pack to see if the language pack need to be updated.

`npm run check reference=<template path file> target=<not compressed language pack>`

```
npm run check target=languages/printerpack/lang-fr.json reference=languages/printerpack/en.json

> ESP3D-WEBUI@3.0.0 check
> node ./config/checkpack.js "target=languages/printerpack/lang-fr.json" "reference=languages/printerpack/en.json"

Comparing files

Checking extra entries...
S724 : Fermer l'application
...done, found  1 extra entries

Checking missing entries...
S14 : Settings
S24 : Close
...done, found  2 missing entries

Comparaison done
```

## Propose / update language pack files

Please do a PR to webUI 3.0 github branch or submit ticket with compressed and clear version of the language pack file  
if submitting PR please keep the clear version in `languages/<target pack>` and compressed version in `dist/<target pack>`
