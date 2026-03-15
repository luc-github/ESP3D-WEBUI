# Features and bundle size

**Project rule: no lazy loading** (except for extensions loaded separately). All UI code stays in the main bundle (single `index.html.gz`) for minimal footprint and simple deployment.

---

## Bundle size tracker (index.html.gz)

**Package: Marlin.** Add a line after each build or optimization.

| # | Step | Size (bytes) | Change |
|---|------|--------------|--------|
| 1 | Base | 98 117 | — |
| 2 | PurgeCSS | 92 100 | −6 017 |
| 3 | Icon reduction (34 removed from icons.js) | 92 595 | +495 |
| 4 | Preferences save optimization (diffs + minify) | 92 870 | +275 |
| 5 | Short keys for static preferences (bundle) | 92 816 | −54 |
| 6 | Readable export + full/optimized import | 92 913 | +97 |
| 7 | Smoothie replaced by minimal module | 89 871 | −3 042 |
| 8 | Configurable verbose filters | 90 927 | +1 056 |
| 9 | Browserslist update | 90 760 | −167 |
| 10 | Extra contents (panel order, 3 panels) | 92 166 | +1 406 |
| 11 | Extra contents manifest + refresh fix + drop_console | 94 623 | +2 457 |
| 12 | Fixed panel order (drag & drop) + z-index fix | ~98 310 | +3 687 |
| 13 | Panel size customization (height, min/max width) | 98 987 | +677 |

Reference: `docs/FEATHER_ICONS_USED_UNUSED.md` for icon usage.

---

## Main features (summary)

- **Panel size customization:** Settings → General: **Panel height** (200–1200 px, default 550), **Panel min width** (200–600 px, default 340), **Panel max width** (0 = no limit / 1fr, or 340–1200 px, default 520). Reduces scrollbars and empty space; desktop grid uses min/max width for column count.
- **Verbose filters:** Terminal line filtering (startswith, endswith, contain, regex). Configurable in Settings → Interface.
- **Panels and extra content:** Panel order (drag & drop when "Fixed panels order" is on), extra content as panels with names, manifest-based extension scan (/extensions, /themes, /languages, fallback /).
- **Preferences:** Saved file optimized (only diffs vs defaults, minified JSON). Short keys in bundle (shrink-preferences-loader).
- **Bundle analysis:** `npm run analyze` (Printer3D/Marlin) → `build/bundle-stats.json` and treemap.

---

## Single-file build

Production build inlines all JS and CSS into one HTML file, then gzips it. No separate chunks; everything is in `index.html.gz`. See webpack config and `HtmlInlineScriptPlugin` / `HTMLInlineCSSWebpackPlugin`.
