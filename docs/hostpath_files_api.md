# HostPath and the /files API — path conventions

Reference memo, so this question never has to be asked again.
Firmware behavior confirmed by the grblHAL author (Terje Io) on 2026-11-16;
the user-facing convention (host path hidden, content shown as root) is a
WebUI design decision.

## The model (grblHAL)

grblHAL has a hierarchical, Unix-like **virtual file system**: mounted file
systems (flash, SD card, …) have properties such as *removable* and
*read-only*, which the firmware uses to decide what to present to the WebUI.

Two notions must not be confused:

- **HostPath** (reported by `[ESP800]`, e.g. `/www`): where `index.html.gz`
  is found. It does **not** have to be on the flash file system — it can
  point at another mounted FS (e.g. SD).
- **`/files` and `/sdfiles` are web *handlers* (HTTP endpoints), not
  paths**: `/files` is the historical handler for the flash file system,
  `/sdfiles` the historical handler for the SD card. If no flash file
  system is available, `/files` returns 400 and the WebUI does not offer
  the "Flash" filesystem in the Files panel (`FlashFileSystem: "none"` →
  `HostTarget = "sdfiles"`). This is the case of non-ESP32 grblHAL
  controllers without flash storage (e.g. STM32: flash page size too
  large, not enough RAM).

## The user-facing convention: HostPath is the user's root

On a system with `HostPath = /www`, the user has no access above `/www` —
so the WebUI never displays it:

1. The user can only reach `/www`; showing a parent they cannot open adds
   nothing.
2. Displaying `/www` prefixes everywhere would raise questions and waste
   the scarce horizontal space of the Files panel.

**The panel root `/` IS the content of `/www`.** The user does not need to
know they are "in" `/www` — its content is simply their root.

## Path conventions per operation

| Operation | Convention | Example |
|---|---|---|
| List / delete / createdir (`/files?path=…&action=…`) | path **relative to HostPath** (web root) | `/files?path=/themes&action=list` lists the content of `/www/themes`; `/files?path=/` lists the content of `/www` |
| Upload (`POST /files`) | **absolute** FS path; the WebUI sends it as the `path` argument and embedded in the multipart filename | path `/www/themes/`, filename `/www/themes/theme-dark.gz` |
| Download / static GET (themes, packs, macros, preferences.json) | **absolute** path as a plain static URL | `GET /www/themes/theme-dark.gz` |
| Default document (`GET /`) | searched at the flash FS root, then under `/www`, then `/`; HostPath is set to wherever `index.html.gz` was found | |

So the wire protocol always uses `/www` = HostPath where absolute paths are
required (upload, download, static GET) — only the *display* and the
query-driven listing hide it.

Firmware quirk: when `index.html.gz` is found at `/` (not `/www`), the
firmware serves it but the WebSocket connection fails (confirmed by Terje,
root cause unknown).

## HostTarget / HostUploadPath / HostDownloadPath mapping

On `[ESP800]` reception the WebUI derives three values from `HostPath`
(`src/hooks/useSettings.js`) — this logic dates back to the original 3.0
code base (ESP3D classic without a flash FS), and non-ESP32 grblHAL
controllers without flash storage follow the same path:

| Situation | `HostTarget` | `HostUploadPath` | `HostDownloadPath` |
|---|---|---|---|
| `FlashFileSystem == "none"` | `sdfiles` | `HostPath` as-is | `HostPath` as-is |
| Flash OK but `HostPath` starts with `/sd/` (web hosted on SD) | `sdfiles` | `HostPath` **minus `/sd`** → SD-absolute | `HostPath` with `/sd` (needed by the static URL mount) |
| Otherwise (flash OK, web on flash) | `files` | `HostPath` | `HostPath` |

The `substring(3)` strip is the HostPath handling for the SD-hosted case:
`sdfiles` receives SD-absolute paths (`/www/…`) while static GETs keep the
`/sd/…` mount prefix.

Consequences in the code:

- **Files panel** (`src/targets/*/FLASH-source.js`): list/delete/createdir
  send the panel path as-is (HostPath-relative); upload prepends
  `HostUploadPath` to make it absolute; download builds a static URL from
  `HostUploadPath` (resp. `HostDownloadPath`) + panel path + filename.
- **Theme / language / extension scanners**
  (`src/components/Controls/ScanPacksList.js`, `ScanExtensions.js`): for
  `HostTarget == "files"` they list HostPath-relative paths (`/themes`,
  `/`) and the returned selection paths are resolved against
  `HostDownloadPath` at load time; for `sdfiles` they keep the
  `HostUploadPath` prefix (SD-absolute).

## Embedded update page (`embedded/`)

The minimal embedded page (firmware update / file browser served when the
full WebUI is absent) follows the same convention:

- listing/delete/createdir send host-path-relative paths;
- upload and direct file access (open in a new tab) convert the panel path
  to an absolute FS path with `toFSPath()` (host path prepended for the
  flash FS, SD paths untouched);
- the "open the full WebUI" button looks for `index.html.gz` at the panel
  root (`/`), which *is* the host path content.
