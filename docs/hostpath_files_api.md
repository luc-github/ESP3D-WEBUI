# HostPath and the /files API: path conventions

Reference memo for how the WebUI and the embedded page handle HostPath.
Firmware behavior was confirmed by the grblHAL author (Terje Io) on
2026-11-16. The convention was corrected on 2026-11-19 after his feedback:
an earlier version of this memo wrongly said that the user has no access
above `/www` and that the panel root `/` was the content of `/www`.

## The rules

1. **Files panel**: it always shows the real root `/` of each file system
   (flash FS and SD), with absolute paths. The HostPath directory (e.g.
   `www/`) is a normal directory in the listing.
2. **Files of the SD panel**: list, upload, delete and createdir use the
   panel path as-is. The download (static URL) adds `/sd` in front of it.
   This also applies to the files under HostPath when they are reached
   from the SD panel. The firmware resolves `/sd`.
3. **Web resources** (`index.html.gz`, `preferences.json`, themes,
   language packs, extensions, macros): upload and download use
   **HostPath as-is**. The WebUI neither adds nor removes `/sd`.

HostPath mainly matters on systems **without a flash FS**, where the web
files share the SD card with the user's files. On a system with a flash
FS, HostPath is usually `/`.

### Why the Files panel does not open on HostPath

Terje suggested opening the panel on HostPath when there is no flash FS.
We decided against it: without a flash FS, the SD card is first of all
where the user keeps the G-code files, at the root, not in HostPath.
Opening on HostPath would force the user to go up one level every time,
for web files they almost never touch. The WebUI reaches its own files
directly through HostPath, without the panel, and protecting them is done
by the firmware (see "Protecting the web files without a flash FS").

## The model (grblHAL)

grblHAL has a hierarchical, Unix-like **virtual file system**. Mounted file
systems (flash, SD card, …) have properties such as *removable* and
*read-only*, and the firmware uses them to decide what to present to the
WebUI.

- **HostPath** (reported by `[ESP800]`, e.g. `/www`) is the directory where
  `index.html.gz` was found. It does not have to be on the flash FS: it can
  be on another mounted FS, such as the SD card.
- **`/files` and `/sdfiles` are HTTP handlers, not paths.** `/files` is the
  historical handler for the flash FS, `/sdfiles` the one for the SD card.
  If there is no flash FS, `/files` returns 400 and the WebUI does not offer
  the "Flash" tab in the Files panel. This is the case on non-ESP32 grblHAL
  controllers without flash storage (e.g. STM32: the flash page size is too
  large and there is not enough RAM).
- **Default document (`GET /`)**: the firmware looks at the flash FS root,
  then under `/www`, then at `/`. HostPath is set to wherever
  `index.html.gz` was found.

## Listing per configuration

The examples below use a WebUI in `www/` and G-code files on the SD card.

### Case A: WebUI on the flash FS (ESP32, the most common case)

`FlashFileSystem` is not `none` and HostPath is on the flash FS (`/` or
`/www`).

```
Files panel, "Flash" tab (/files)       Files panel, "SD" tab (/sdfiles)
/                                       /
├── index.html.gz                       ├── job1.nc
├── preferences.json                    └── parts/
├── themes/                                 └── bracket.nc
│   └── theme-dark.gz
└── extensions/
```

With HostPath = `/www` on the flash FS, the "Flash" tab shows `/` with
`www/` inside.

### Case B: WebUI on the SD card (with or without a flash FS)

The listing is the same whether there is a flash FS or not. `/sdfiles`
lists the SD from its root, and the HostPath directory is a normal
directory in it:

```
Files panel, "SD" tab (/sdfiles)        Files panel, "Flash" tab (/files)
/                                       only if a flash FS exists:
├── job1.nc                             /
├── parts/                              └── (other flash files)
│   └── bracket.nc
└── www/
    ├── index.html.gz        (*)
    ├── preferences.json
    └── themes/
        └── theme-dark.gz
```

(*) Files uploaded from the embedded page get the *hidden* attribute set
by the firmware, so they only show in the embedded page. In the full
WebUI, `www/` may therefore look empty or partly empty.

- **with a flash FS**, HostPath is reported under `/sd/` (e.g. `/sd/www`);
- **without a flash FS** (`FlashFileSystem` = `none`, e.g. grblHAL on
  STM32), HostPath is reported as is (e.g. `/www`). There is no "Flash"
  tab.

HostPath can be any directory, including the SD root. At the root, the
web files and the G-code files are mixed. This works but is not
recommended: see the WebSocket quirk below, and nothing separates or
protects the web files.

### Case C: no flash FS and no SD card

There is nowhere to store the WebUI, so the Files panel is empty and only
the embedded page is served.

## Request examples

| Request | Case A (HostPath `/`) | Case B, with flash (HostPath `/sd/www/`) | Case B, without flash (HostPath `/www/`) |
|---|---|---|---|
| Theme scan | `GET /files?path=/themes&action=list` | `GET /sdfiles?path=/sd/www/themes&action=list` | `GET /sdfiles?path=/www/themes&action=list` |
| Theme load | `GET /themes/theme-dark.gz` | `GET /sd/www/themes/theme-dark.gz` | `GET /www/themes/theme-dark.gz` |
| Save `preferences.json` | `POST /files`, path `/` | `POST /sdfiles`, path `/sd/www/` | `POST /sdfiles`, path `/www/` |
| SD panel: list `/parts` | `GET /sdfiles?path=/parts&action=list` | same | same |
| SD panel: upload into `/parts` | `POST /sdfiles`, path `/parts`, filename `/parts/new.nc` | same | same |
| SD panel: download `/parts/bracket.nc` | `GET /sd/parts/bracket.nc` | same | same |
| SD panel: download `/www/preferences.json` | (not applicable) | `GET /sd/www/preferences.json` | `GET /sd/www/preferences.json` |

## Mapping from HostPath (`src/hooks/useSettings.js`)

| Situation | `HostTarget` | `HostUploadPath` | `HostDownloadPath` |
|---|---|---|---|
| `FlashFileSystem == "none"` | `sdfiles` | `HostPath` | `HostPath` |
| Flash OK, `HostPath` starts with `/sd/` and an SD card is connected | `sdfiles` | `HostPath` | `HostPath` |
| Otherwise | `files` | `HostPath` | `HostPath` |

Where the code uses them:

- **Files panel** (`src/targets/*/FLASH-source.js`,
  `src/targets/*/*/DIRECTSD-source.js`): never. Every operation sends the
  panel path as-is. The download URL is the panel path plus the file name,
  prefixed with `/sd` for the SD panel.
- **Theme / language / extension scanners**
  (`src/components/Controls/ScanPacksList.js`, `ScanExtensions.js`): they
  list under `HostUploadPath` on `HostTarget`; the selected pack is loaded
  from `HostDownloadPath`.
- **Settings, `preferences.json`, About-page upload**: `HostUploadPath`
  for uploads, `HostDownloadPath` for static GETs. Without a flash FS,
  every upload of a web resource (including `preferences.json`) therefore
  goes to `/sdfiles`. These uploads send `createPath=true` so that the
  firmware creates HostPath if it is missing (the argument name the ESP3D
  firmware reads; it was misspelled `creatPath` until 2026-11-19).

### Points to confirm with the firmware

- **Hidden files and the scanners**: files uploaded from the embedded page
  get the hidden attribute. If the `/sdfiles` listing of the full WebUI
  leaves them out, themes and extensions uploaded from the embedded page
  are not found by the scanners. `index.html.gz` and `preferences.json`
  are not affected, because they are loaded by a direct GET, without a
  listing. Recommended practice: upload packs from the full WebUI.
- **HostPath hidden from non-admin users** (Terje's option): if the
  firmware also refuses to list `/www/themes` to a non-admin user, the
  theme list is empty for that user. The selected theme still loads,
  because it is a direct GET.
- **Flash FS + HostPath under `/sd/`**: the scanners send
  `/sdfiles?path=/sd/www/themes`, so the firmware has to accept the `/sd`
  prefix in the `path` argument of `/sdfiles`.

## Protecting the web files without a flash FS

These are firmware-side options (grblHAL):

- create `/www` (from a PC or from the embedded page; reload the embedded
  page so that HostPath becomes `/www`), then upload the WebUI files from
  the embedded page: they get the hidden attribute;
- or create `/www` from a PC and set the hidden attribute on the files
  there (Windows);
- hide the HostPath directory (when it is not `/`) from non-admin users
  (option proposed by Terje);
- setting `$650` can hide the flash FS.

The WebUI needs no change for these options. The theme and extension
scanners list the HostPath directory directly, so they do not depend on
it being shown in the root listing.

## Embedded update page (`embedded/`)

The minimal embedded page (firmware update and file browser, served when
the full WebUI is absent) follows the same rules:

- it uses `/sdfiles` when `FlashFileSystem` is `none`, `/files` otherwise;
- the panel starts at `/`, and every operation (list, delete, createdir,
  upload) uses absolute paths;
- opening an SD file in a new tab uses `/sd` + path;
- the "open the full WebUI" button is shown when the current directory is
  HostPath and contains `index.html.gz` (or `index.html.br` over HTTPS).

## Firmware quirk

When `index.html.gz` is found at `/` (not `/www`), the firmware serves it
but the WebSocket connection fails (confirmed by Terje, root cause
unknown).

## Mock servers

- `config/server.js` (`npm run dev-*`): `/files` and `/sdfiles` list from
  the real root of `server/Flash` and `server/SD`, and SD static files are
  served under `/sd`. The target `webRoot` (grblHAL: `/www`, override with
  `root=`) only sets the reported HostPath and where the default document
  is looked for.
  - `npm run dev-cnc-grblhal`: case A (flash FS, web files in
    `server/CNC/grblHAL/Flash/www`).
  - `npm run dev-cnc-grblhal noflash`: case B without flash FS. `[ESP800]`
    reports `FlashFileSystem: "none"`, `/files` returns 400, and static
    URLs (`/www/preferences.json`, …) are served from the SD card
    (`server/CNC/grblHAL/SD`, web files in `SD/www`, created empty if
    missing).
  - `npm run dev-cnc-grblhal noflash nosd`: case C, `/files` and
    `/sdfiles` both return 400.
- `embedded/config/server.js` (`npm run dev` in `embedded/`): same
  convention, with SD static files served under `/sd`. Same `noflash` and
  `nosd` options as the WebUI (flash FS and SD card present by default);
  with `noflash nosd` the mock serves the `dist` page as the built-in page.

All options (`secure`, `auth`, `root=`, `noflash`, `nosd`, …) and
environment variables are listed in `config/README.md` and
`embedded/config/README.md`.
