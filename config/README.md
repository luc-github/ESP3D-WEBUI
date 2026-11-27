# WebUI test server

`config/dev.js` starts the mock firmware server (`config/server.js`), the
webpack dev server, and, in secure mode, a Caddy HTTPS front.

## Interactive menu

```
npm run menu
```

1 Build all, 2 Build one (asks system, then target), 3 Dev (asks system,
target, then the options below as y/n questions). The last choice is
remembered in `config/.menu-last.json` (not tracked by git) and offered at
start: Enter relaunches it. In every question the last answer is the
default, `b` goes back to the previous question, `q` quits. The command is
shown before launch; the menu only runs the commands described below.

## Starting it

```
npm run dev-<target> [options]
node config/dev.js <Target> <Subtarget> [options]
```

| Script | Target / Subtarget |
|---|---|
| `npm run dev-cnc-grbl` | `CNC GRBL` |
| `npm run dev-cnc-grblhal` | `CNC grblHAL` |
| `npm run dev-printer-marlin` | `Printer3D Marlin` |
| `npm run dev-printer-marlin-embedded` | `Printer3D Marlin-embedded` |
| `npm run dev-printer-repetier` | `Printer3D Repetier` |
| `npm run dev-printer-smoothieware` | `Printer3D Smoothieware` |
| `npm run dev-sand-grbl` | `SandTable GRBL` |
| `npm run dev` | `Printer3D Marlin` (default) |

Open http://localhost:8088 (webpack dev server, dev bundle).

## Options

Options can be combined, in any order, e.g.
`npm run dev-cnc-grblhal secure noflash root=www auth`.

| Option | Effect |
|---|---|
| `secure` | HTTPS through Caddy (see below). |
| `auth` | Authentication enabled on the mock: user `admin`, password `admin`. |
| `root=<subdir>` | Overrides the web root of the target, i.e. the HostPath reported by `[ESP800]` (e.g. `root=www` → `/www`). In Git Bash, write `root=www`, not `root=/www`. |
| `noflash` | No flash FS: `[ESP800]` reports `FlashFileSystem: "none"`, `/files` returns 400, and static URLs and the default document are served from the SD card. |
| `nosd` | No SD card: `[ESP800]` reports `SDConnection: "none"` and `/sdfiles` returns 400. |

The flash FS and the SD card are both present by default (the SD
connection type is the target's own: `direct` or `shared`); `noflash` and
`nosd` remove them independently, for every target. The embedded page
test server uses the same two options.

### File system configurations

`<T>/<S>` is the target folder (e.g. `CNC/grblHAL`), `<root>` the web root
(grblHAL: `www`; empty for the other targets unless `root=` is given).

| Command | Flash FS | SD card | Web files in |
|---|---|---|---|
| `npm run dev-<target>` | yes | yes | `server/<T>/<S>/Flash/<root>` |
| `npm run dev-<target> nosd` | yes | no | `server/<T>/<S>/Flash/<root>` |
| `npm run dev-<target> noflash` | no | yes | `server/<T>/<S>/SD/<root>` |
| `npm run dev-<target> noflash nosd` | no | no | nowhere (Files panel empty) |

The web root directory is created empty if it does not exist: put a
`preferences.json`, themes, etc. in it to test them. See
`docs/hostpath_files_api.md` for the expected behavior of each case.

## Secure mode

Needs Caddy (`winget install CaddyServer.Caddy`, or set `CADDY=<path to
caddy.exe>`). Caddy's local CA is installed in the OS trust store on first
run, so there is no certificate to accept by hand.

| URL | Serves |
|---|---|
| https://localhost:8443 | webpack dev server (dev bundle) |
| https://localhost:8445 | mock server, packaged page (`index.html.br` or `.gz` from the web root) |
| wss://localhost:8444 | mock WebSocket |

In this mode the mock reports WebSocketPort 8444, so the plain `http://`
URLs do not get a working WebSocket.

## Mock data

Each target has its own folders, created if missing:

- `server/<Target>/<Subtarget>/Flash`: flash FS, listed by `/files`;
- `server/<Target>/<Subtarget>/SD`: SD card, listed by `/sdfiles` and
  served as static files under `/sd/…`.

## Environment variables

They are set by `dev.js` from the options. Set them by hand only when
starting `config/server.js` directly (`npm run server`).

| Variable | Default | Meaning |
|---|---|---|
| `TARGET_ENV`, `SUBTARGET_ENV` | (from the script) | Target and subtarget of the mock. |
| `PORT` | `8080` | HTTP port of the mock. |
| `WEBROOT` | target `webRoot` | HostPath reported by `[ESP800]` (`root=` option). |
| `AUTH` | unset | `1` enables authentication (`auth` option). |
| `NOFLASH` | unset | `1` simulates no flash FS (`noflash` option). |
| `NOSD` | unset | `1` simulates no SD card (`nosd` option). |
| `SECURE` | unset | `1` in secure mode. |
| `WS_PUBLIC_PORT` | `8089` | WebSocket port reported by `[ESP800]` (`8444` in secure mode). |
| `CADDY` | unset | Path to `caddy.exe` when it is not on the PATH. |
| `MOCK_VERBOSE` | unset | `1` logs more details in the mock. |
