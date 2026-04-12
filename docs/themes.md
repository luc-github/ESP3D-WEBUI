# Theme Packs

A theme pack is a single file stored in the `themes/` subdirectory of the upload path, or at the root as a fallback.

## File naming

```
theme-<name>            plain file (CSS or JSON bundle)
theme-<name>.json       JSON bundle — explicit extension, also accepted
theme-<name>.gz         gzip-compressed plain file
theme-<name>.json.gz    gzip-compressed JSON bundle
```

> **Important:** the `<name>` part must not contain dots. The only accepted extensions are `.json` (for an explicit JSON bundle) and `.gz` (for compression). Any other extension will cause the file to be ignored by the scanner.
>
> Valid: `theme-dark`, `theme-dark.json`, `theme-dark.gz`, `theme-dark.json.gz`
> Invalid: `theme-dark.css`, `theme-dark.v2`, `theme-dark.tar.gz`

---

## File formats

### Legacy format (CSS only)

A plain CSS file. Still fully supported. Applied directly as a `<style>` override on top of the built-in stylesheet.

```css
body, html {
    background-color: #222;
    color: #eee;
}
```

### Bundle format

A JSON file containing all assets. Detected automatically when the file parses as valid JSON.

```json
{
    "manifest": {
        "name": "Dark Blue",
        "version": "1.0.0",
        "owner": "ESP3D",
        "github": "https://github.com/luc-github/ESP3D-WEBUI",
        "description": "Dark theme with custom font and controls overrides.",
        "supportedVersion": "3.*",
        "targetSystem": "*"
    },
    "variables": {
        "--accent": "#e8622a",
        "--accent-hover": "#c04d1e"
    },
    "css": "body, html { background-color: #222; color: #eee; } .btn.btn-primary { background: var(--accent) !important; }",
    "fonts": [
        {
            "family": "MyFont",
            "data": "<base64-encoded font file>",
            "format": "woff2",
            "weight": "400",
            "style": "normal",
            "display": "swap"
        }
    ],
    "scripts": ["https://cdn.jsdelivr.net/npm/animejs@3/lib/anime.min.js"],
    "js": "console.log('theme loaded');"
}
```

All fields are optional. Injection order: `variables` → `css` → `fonts` → `scripts` (sequential) → `js`.

---

## Bundle fields

### `manifest` (optional object)

Metadata and compatibility constraints. If absent, the theme is always accepted.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | no | Display name |
| `version` | string | no | Theme version (semver) |
| `owner` | string | no | Author / maintainer |
| `github` | string | no | Repository or homepage URL |
| `description` | string | no | Short description |
| `supportedVersion` | string | no | WebUI version pattern (e.g. `3.*`, `3.1.*`). If absent → accepted on any version |
| `targetSystem` | string | no | Comma-separated targets (e.g. `*`, `3d printer`, `cnc`, `sand table`). If absent → accepted on any target |

#### `supportedVersion` matching rules

Uses segment-by-segment comparison. `*` matches any segment.

| Pattern | Matches |
|---|---|
| `*` | Any version |
| `3.*` | Any 3.x version |
| `3.1.*` | Any 3.1.x version |
| `3.1.0` | Exactly 3.1.0 |

#### `targetSystem` values

| Value | Target |
|---|---|
| `*` | All targets |
| `3d printer` | Printer3D category |
| `cnc` | CNC category |
| `sand table` | SandTable category |
| `marlin` | Marlin firmware specifically |
| `grbl` | GRBL firmware specifically |
| `grblhal` | grblHAL firmware specifically |

Multiple values are comma-separated: `"3d printer, cnc"`.

**Compatibility is permissive:** if `supportedVersion` or `targetSystem` is absent, the theme is accepted. Only if the field is present *and does not match* the current context is the theme rejected with an error toast.

---

### `variables` (optional object)

CSS custom properties injected on `:root` before the CSS, as `<style id="themevariables">`. Keys must start with `--`.

```json
"variables": {
    "--accent": "#e8622a",
    "--accent-hover": "#c04d1e",
    "--font-size-base": "14px"
}
```

The `css` field can then use `var(--accent)` without repeating the value in every selector. Changing the accent colour only requires editing the `variables` section.

---

### `css` (optional string)

CSS content injected as `<style id="themestyle">` after `variables`. Overrides the built-in stylesheet. Use `!important` where needed.

Can contain `@import url(...)` to load external stylesheets (e.g. Google Fonts) on internet-connected systems.

---

### `fonts` (optional array of objects)

Custom fonts injected as `@font-face` rules in `<style id="themefonts">`.

Each font object supports **three source formats** — pick one:

| Field | Description |
|---|---|
| `data` | Base64-encoded font bytes (offline, self-contained) |
| `src` | URL of the font file (online systems, lighter bundle) |
| `sources` | Array of `{ src, format }` or `{ data, format }` objects for multi-format fallback |

Common fields:

| Field | Type | Default | Description |
|---|---|---|---|
| `family` | string | — | `font-family` name used in CSS |
| `format` | string | `woff2` | Font format (`woff2`, `woff`, `ttf`, `otf`) |
| `weight` | string | `400` | `font-weight` |
| `style` | string | `normal` | `font-style` |
| `display` | string | `auto` | `font-display` — use `swap` to avoid invisible text during load |

**Base64 (offline):**
```json
{ "family": "Roboto", "data": "AAEAAAA...", "format": "woff2", "weight": "400", "display": "swap" }
```

**URL (online):**
```json
{ "family": "Roboto", "src": "https://fonts.gstatic.com/.../Roboto.woff2", "format": "woff2", "weight": "400", "display": "swap" }
```

**Multi-format fallback (browser picks first supported):**
```json
{
    "family": "Roboto",
    "weight": "400",
    "display": "swap",
    "sources": [
        { "src": "https://fonts.gstatic.com/.../Roboto.woff2", "format": "woff2" },
        { "src": "https://fonts.gstatic.com/.../Roboto.woff",  "format": "woff" }
    ]
}
```

To use the font in `css`:
```css
body { font-family: 'Roboto', sans-serif; }
```

---

### `scripts` (optional array of strings)

External JavaScript URLs loaded as `<script src="...">` **before** the inline `js` field. Scripts are loaded sequentially — each waits for the previous to finish. A failed load is skipped without blocking the rest.

Use this to load CDN libraries on internet-connected systems without embedding them in the bundle.

```json
"scripts": [
    "https://cdn.jsdelivr.net/npm/animejs@3/lib/anime.min.js"
]
```

> On offline systems, any URL in `scripts` that is unreachable will time out. Use `js` with inline code for offline-safe logic.

---

### `js` (optional string)

JavaScript injected as `<script id="themescript">` after all `scripts` have loaded. Runs in the main document context with full access to the DOM and any libraries loaded via `scripts`.

```js
(function() {
    // wrap in IIFE to avoid polluting global scope
    document.documentElement.style.setProperty('--accent', '#e8622a')
})();
```

---

## Important: theme JS runs outside the virtual DOM

The WebUI is built with **Preact** (a virtual DOM framework). Preact manages the DOM tree internally and reconciles it against its own component state — it can add, remove or replace nodes at any time after a state change or navigation event.

Theme JS runs directly against the **real DOM**, outside of Preact's control. This has two consequences:

- **Do not remove nodes that Preact owns.** Removing a node that is part of Preact's virtual DOM tree causes Preact to re-insert it on the next render (state change, navigation, reconnection). Use `display: none` to hide instead, and insert your own nodes as siblings.
- **Preact may re-render at any time.** Use a `MutationObserver` to react to DOM changes rather than running code once at load time. Disconnect the observer once your target is stable.

**Can a theme use Preact?**

No. Preact is compiled into the WebUI bundle and is not exposed globally (`window.preact` does not exist). Theme JS cannot import or use it. All theme code must use plain DOM APIs (`document.querySelector`, `createElement`, `MutationObserver`, etc.) or libraries loaded via `scripts`.

---

## Injection into extensions

When an extension iframe loads, the WebUI automatically injects the full theme into it:

| Element | How |
|---|---|
| `#themevariables` | Cloned (it is a `<style>` tag) |
| `#themestyle` | Cloned |
| `#themefonts` | Cloned — base64 fonts work as-is; URL fonts resolve from the device origin |
| `script[data-theme-script]` | Re-created with the same `src=` so the browser fetches and executes it |
| `#themescript` | Content copied into a new `<script>` to re-execute |

Extensions receive the full theme without any extra configuration.

---

## Compression

Both the legacy CSS format and the JSON bundle can be gzip-compressed and served as `theme-<name>.gz`. The WebUI decompresses automatically.

---

## Application examples

### Example 1 — Custom font

Three variants depending on whether the system is offline, online, or needs broad browser compatibility.

#### Variant A — offline (base64 embedded)

The font is entirely self-contained in the bundle. No network needed.

**Step 1 — download the font and get the base64 string**

Download the woff2 file from Google Fonts or any source, then encode it:

```bash
# Linux / macOS
base64 -w 0 Audiowide-Regular.woff2

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("Audiowide-Regular.woff2"))
```

**File:** `themes/theme-audiowide`

```json
{
    "manifest": {
        "name": "Audiowide UI",
        "version": "1.0.0",
        "description": "Futuristic display font — very visible change.",
        "supportedVersion": "3.*",
        "targetSystem": "*"
    },
    "fonts": [
        { "family": "Audiowide", "data": "AAEAAAALA...", "format": "woff2", "weight": "400", "display": "swap" }
    ],
    "css": "body, button, input, select, .form-input { font-family: 'Audiowide', sans-serif !important; }"
}
```

> Audiowide is a single-weight font (400 only). The impact is immediately visible — every label, button and input changes appearance.

#### Variant B — online (`@import`, simplest for Google Fonts)

Google Fonts updates its CDN URLs with each font version. Using `@import` is the only reliable approach — the URL is always current and no direct woff2 path needs to be hard-coded.

```json
{
    "manifest": { "name": "Audiowide UI (online)", "version": "1.0.0" },
    "css": "@import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap'); body, button, input, select, .form-input { font-family: 'Audiowide', sans-serif !important; }"
}
```

For an even more dramatic look, **Pacifico** (handwritten/cursive style):

```json
{
    "manifest": { "name": "Pacifico UI", "version": "1.0.0" },
    "css": "@import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap'); body, button, input, select, .form-input { font-family: 'Pacifico', cursive !important; }"
}
```

> If you need `src:` with a direct woff2 URL (e.g. for a self-hosted font), open the Google Fonts CSS URL in a browser to read the current `src` values:
> `https://fonts.googleapis.com/css2?family=Audiowide&display=swap`

#### Variant C — multi-format fallback (self-hosted fonts)

Use `sources` when you host the font files yourself and want to provide both woff2 and woff for older browsers. Replace the URLs with your own server or device path.

```json
{
    "manifest": { "name": "Audiowide UI (self-hosted)", "version": "1.0.0" },
    "fonts": [
        {
            "family": "Audiowide", "weight": "400", "display": "swap",
            "sources": [
                { "src": "http://192.168.1.100/fonts/Audiowide.woff2", "format": "woff2" },
                { "src": "http://192.168.1.100/fonts/Audiowide.woff",  "format": "woff" }
            ]
        }
    ],
    "css": "body, button, input, select, .form-input { font-family: 'Audiowide', sans-serif !important; }"
}
```

---

### Example 2 — Variables and JS coupled: dynamic accent colour

#### Option A — declarative with `variables` (simplest)

No JS needed for static colours. The `variables` section sets CSS custom properties on `:root` before the CSS is applied.

**File:** `themes/theme-accent`

```json
{
    "manifest": {
        "name": "Custom Accent",
        "version": "1.0.0",
        "description": "Accent colour via CSS variables.",
        "supportedVersion": "3.*",
        "targetSystem": "*"
    },
    "variables": {
        "--theme-accent": "#e8622a",
        "--theme-accent-hover": "#c04d1e"
    },
    "css": ".btn.btn-primary { background: var(--theme-accent) !important; border-color: var(--theme-accent) !important; } .btn.btn-primary:hover { background: var(--theme-accent-hover) !important; } .bar .bar-item { background: var(--theme-accent) !important; } .tab .tab-item a.active, .tab .tab-item.active a { border-bottom-color: var(--theme-accent) !important; }"
}
```

To change the accent colour, only edit `variables` — the CSS stays unchanged.

#### Option B — computed with `js` (dynamic)

Use JS when the colour must be computed at runtime, for example read from `localStorage` or derived from a value.

```json
{
    "manifest": { "name": "Custom Accent (dynamic)", "version": "1.0.0" },
    "css": ".btn.btn-primary { background: var(--theme-accent) !important; } .bar .bar-item { background: var(--theme-accent) !important; }",
    "js": "(function() { var accent = localStorage.getItem('myAccentColor') || '#e8622a'; document.documentElement.style.setProperty('--theme-accent', accent); })();"
}
```

#### Option C — CDN animation library via `scripts`

Load an external library and use it in `js`. The `scripts` array ensures the library is ready before `js` runs.

```json
{
    "manifest": { "name": "Animated Accent", "version": "1.0.0" },
    "variables": { "--theme-accent": "#e8622a" },
    "css": ".btn.btn-primary { background: var(--theme-accent) !important; }",
    "scripts": ["https://cdn.jsdelivr.net/npm/animejs@3/lib/anime.min.js"],
    "js": "(function() { function start() { var brand = document.querySelector('a.navbar-brand'); if (!brand) return false; anime({ targets: brand, backgroundColor: ['rgba(232,98,42,0)', 'rgba(232,98,42,0.4)'], direction: 'alternate', loop: true, duration: 900, easing: 'easeInOutSine' }); return true; } if (!start()) { var obs = new MutationObserver(function() { if (start()) obs.disconnect(); }); obs.observe(document.body || document.documentElement, { childList: true, subtree: true }); } })();"
}
```

---

### Example 3 — Replace the ESP3D logo

The logo in the navbar is an SVG element with `class="esp3dlogo"`. There are two approaches depending on what you need.

#### Option A — CSS only (colour / simple override)

Hide the default SVG and show a text label or a background image instead.

```json
{
    "manifest": {
        "name": "MyBrand Logo (CSS)",
        "version": "1.0.0",
        "description": "Replace ESP3D logo with text brand via CSS."
    },
    "css": "a.navbar-brand svg.esp3dlogo { display: none !important; } a.navbar-brand.logo::after { content: 'MyBrand'; font-size: 1.4rem; font-weight: 700; letter-spacing: 0.05em; color: currentColor; }"
}
```

#### Option B — JS (full SVG replacement)

Add a custom SVG next to the original. A `MutationObserver` is used because Preact renders the logo asynchronously after the script runs.

The original `svg.esp3dlogo` is **hidden** (not removed) so Preact's virtual DOM stays consistent — removing the node causes Preact to re-insert it on every re-render, duplicating the custom logo each time. The custom logo is inserted once as a sibling and identified by `data-custom-logo` so it is never duplicated.

```json
{
    "manifest": {
        "name": "MyBrand Logo (JS)",
        "version": "1.0.0",
        "description": "Replace ESP3D logo with a custom SVG via JS."
    },
    "js": "(function() { var DONE = 'data-logo-done'; var CUSTOM = 'data-custom-logo'; var MY_SVG = '<svg height=\"{height}\" viewBox=\"0 0 100 40\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"100\" height=\"40\" rx=\"6\" fill=\"{color}\"/><text x=\"50\" y=\"26\" text-anchor=\"middle\" font-size=\"16\" fill=\"{bgcolor}\" font-family=\"sans-serif\" font-weight=\"bold\">MyBrand</text></svg>'; function replaceLogos() { document.querySelectorAll('svg.esp3dlogo').forEach(function(svg) { if (svg.getAttribute(DONE)) return; svg.setAttribute(DONE, '1'); svg.style.display = 'none'; var prev = svg.parentNode.querySelector('svg[' + CUSTOM + ']'); if (prev) prev.parentNode.removeChild(prev); var h = svg.getAttribute('height') || '50px'; var color = svg.getAttribute('stroke') || 'currentColor'; var bgcolor = svg.getAttribute('fill') || 'white'; var span = document.createElement('span'); span.innerHTML = MY_SVG.replace('{height}', h).replace('{color}', color).replace('{bgcolor}', bgcolor); var newSvg = span.firstChild; newSvg.setAttribute(CUSTOM, '1'); svg.parentNode.insertBefore(newSvg, svg); }); } var obs = new MutationObserver(function() { if (document.querySelector('svg.esp3dlogo:not([' + DONE + '])')) replaceLogos(); }); obs.observe(document.body || document.documentElement, { childList: true, subtree: true }); })();"
}
```

The observer hides any new `svg.esp3dlogo` that Preact re-inserts on navigation or reconnection, while the custom logo (inserted once) stays in place.

> **Note:** If you control `preferences.json`, the cleanest way to replace the logo is to set the `custom.logo` field with your SVG string using `{height}`, `{color}`, and `{bgcolor}` placeholders. The theme JS approach is useful when `preferences.json` is not directly editable.

---

## Example: CSS-only legacy theme

File: `themes/theme-purple`

```css
body, html, button, input, select {
    background-color: rgb(200, 200, 233) !important;
    color: white !important;
}
span.navbar-section {
    background-color: #0e0e6d !important;
    color: white !important;
}
```

## Example: full bundle theme

File: `themes/theme-dark` (JSON)

```json
{
    "manifest": {
        "name": "Dark Blue",
        "version": "1.0.0",
        "owner": "ESP3D",
        "github": "https://github.com/luc-github/ESP3D-WEBUI",
        "description": "Dark blue theme with Roboto font.",
        "supportedVersion": "3.*",
        "targetSystem": "*"
    },
    "css": "body,html{background:#1a1a2e;color:#e0e0ff}button{background:#16213e;color:#7ec8e3;border:1px solid #7ec8e3}",
    "fonts": [
        {
            "family": "Roboto",
            "data": "AAEAAAA...",
            "format": "woff2",
            "weight": "400",
            "style": "normal"
        }
    ],
    "js": "document.documentElement.dataset.theme = 'dark-blue';"
}
```
