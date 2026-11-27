# Embedded page test server

`config/dev.js` starts the mock firmware server (`config/server.js`), the
webpack dev server, and, in secure mode, a Caddy HTTPS front. Install the
dependencies first with `npm ci` in this folder.

## Interactive menu

```
npm run menu
```

1 Build all, 2 Build one (asks the target), 3 Dev (asks the target, then
the options below as y/n questions). The single system is selected without
a question. The last choice is remembered in
`config/.menu-last.json` (not tracked by git) and offered at start: Enter
relaunches it. In every question the last answer is the default, `b` goes
back to the previous question, `q` quits. The command is shown before
launch; the menu only runs the commands described below.

## Targets

One embedded page per firmware. `config/targets.js` holds the links of the
page menu buttons for each target; they are injected at build time.

| Target | Firmware | Interface | Help |
|---|---|---|---|
| `esp3d` (default) | https://github.com/luc-github/ESP3D-X | https://github.com/luc-github/ESP3D-WEBUI/tree/3.0 | https://esp3d.io/esp3d/version-3x/ |
| `esp3dlib` | https://github.com/MarlinFirmware/Marlin | https://github.com/luc-github/ESP3D-WEBUI/tree/3.0/dist/Printer3D/Marlin-embedded | https://esp3d.io/esp3dlib/version_3x/ |
| `grblhal` | https://github.com/grblHAL | https://github.com/luc-github/ESP3D-WEBUI/tree/3.0/dist/CNC/GRBLHal | https://github.com/grblHAL/core/wiki |

To add a target: add it to `config/targets.js` and to the `MENU` table of
`config/menu.js`.

## Building

```
npm run buildall                  -> every target
npm run esp3d                     -> one target (also esp3dlib, grblhal)
node config/pack.js esp3d grblhal -> several targets
```

`npm run pack` is the same as `buildall`. Each target is built into
`dist/<target>/` (`index.html.gz` and `index.html.br`), e.g.
`dist/esp3d/index.html.gz`. A new target needs its npm script too.

## Starting the test server

```
npm run dev [options]
```

Open http://localhost:8088 (webpack dev server, dev bundle).

## Options

Options can be combined, in any order, e.g.
`npm run dev secure noflash root=www auth`.

| Option | Effect |
|---|---|
| `target=<id>` | Page of this target (`esp3d` by default): links of the dev page, and packaged page used by `secure` and by the built-in page fallback. |
| `secure` | HTTPS through Caddy (see below). Needs a build of the target first. |
| `auth` | Authentication enabled on the mock: user `admin`, password `admin`. |
| `root=<subdir>` | HostPath reported by `[ESP800]` (e.g. `root=www` → `/www`). The folder is created if missing. In Git Bash, write `root=www`, not `root=/www`. |
| `noflash` | No flash FS: `[ESP800]` reports `FlashFileSystem: "none"`, `/files` returns 400, and the page uses `/sdfiles`. |
| `nosd` | No SD card: `[ESP800]` reports `SDConnection: "none"` and `/sdfiles` returns 400. |

The flash FS and the SD card are both present by default; `noflash` and
`nosd` remove them independently, as in the WebUI test server.

### File system configurations

| Command | Flash FS | SD card | Web files in |
|---|---|---|---|
| `npm run dev` | yes | yes | `server/public` |
| `npm run dev nosd` | yes | no | `server/public` |
| `npm run dev noflash` | no | yes | `server/sd` |
| `npm run dev noflash nosd` | no | no | nowhere: the mock serves `dist/<target>/index.html.gz` as the built-in page |

With `root=www`, the web files are in the `www` subfolder of the folder
above. See `docs/hostpath_files_api.md` (WebUI repository) for the
expected behavior of each case.

## Secure mode

Needs Caddy (`winget install CaddyServer.Caddy`, or set `CADDY=<path to
caddy.exe>`) and a packaged page of the target (`node config/pack.js
<target>`, which writes `dist/<target>/index.html.gz` and `.br`).

The packaged page is copied into the web folder (see the table above) when
none is there. An existing `index.html.gz` or `.br` older than the `dist`
build is replaced; a newer one, placed by hand (e.g. a `.br` alone to test
Brotli detection), is kept.

| URL | Serves |
|---|---|
| https://localhost:8443, https://localhost | webpack dev server (dev bundle) |
| https://localhost:8445 | mock server, packaged page |
| wss://localhost:8444 | mock WebSocket |

In this mode the mock reports WebSocketPort 8444, so the plain `http://`
URLs do not get a working WebSocket.

## Mock data

- `server/public`: flash FS, listed by `/files`;
- `server/sd`: SD card, listed by `/sdfiles` and served as static files
  under `/sd/…`.

These folders are not tracked by git and are created when the mock starts.

## Environment variables

They are set by `dev.js` from the options. Set them by hand only when
starting `config/server.js` directly (`npm run server`).

| Variable | Default | Meaning |
|---|---|---|
| `EMBEDDED_TARGET` | `esp3d` | Target of the page (`target=` option, and `config/pack.js`). |
| `PORT` | `8080` | HTTP port of the mock (the WebSocket is on port 81). |
| `HOSTPATH` | `/` | HostPath reported by `[ESP800]` (`root=` option). Can also be given as the first argument of `config/server.js`. |
| `AUTH` | unset | `1` enables authentication (`auth` option). |
| `NOFLASH` | unset | `1` simulates no flash FS (`noflash` option). |
| `SDCONN` | `direct` | `SDConnection` reported by `[ESP800]` (`none` with `nosd`). |
| `SECURE` | unset | `1` in secure mode. |
| `WS_PUBLIC_PORT` | `81` | WebSocket port reported by `[ESP800]` (`8444` in secure mode). |
| `WEBCOMM` | `Synchronous` | `WebCommunication` reported by `[ESP800]` (`Asynchronous` to test it). |
| `CADDY` | unset | Path to `caddy.exe` when it is not on the PATH. |
