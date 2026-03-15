# Language packs

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
