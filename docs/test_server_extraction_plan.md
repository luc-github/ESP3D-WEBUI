# Dev plan — test server & embedded page extraction

Status: **planned** — not for the 3.2.0 release. This is a maintainability
change: it must be well designed, implemented and tested, but it is not
urgent. Work starts after the WebUI 3.2.0 release and the embedded page
release for grblHAL / ESP3D-X (HTTPS support).

## Goal

Today the test server (mock firmware) exists in two divergent copies:

- `config/server.js` + `config/targets/**` + `config/dev.js` (main WebUI)
- `embedded/config/server.js` + `embedded/config/dev.js` (embedded page)

and the embedded page itself is duplicated across consumer projects.
Target consumers of the extracted embedded page:

- **ESP3D 3.X**
- **ESP3DLib 3.X**
- **ESP3D-X**
- **grblHAL**

ESP3D-TFT is explicitly excluded: ESP3D-X is its direct replacement.

Every protocol fix has to be ported by hand to each copy —
the 2026-11-17 authentication session showed the cost: three dormant bugs
(`loginURI` never imported, auth guards setting a 401 status without sending
it, WS PING handler referencing undefined symbols) survived in one copy
precisely because it was a copy.

**Target state:**

1. One single test-server project, consumed by both the WebUI and the
   embedded page — one fix, everywhere.
2. The embedded page as its own project, consumed by firmware projects —
   one copy, everywhere.
3. All test scenarios reachable through **command-line parameters** —
   editing source files to simulate a firmware configuration is no longer
   acceptable.
4. First real test coverage of the SD-hosted configurations
   (`FlashFileSystem: "none"` and web content hosted on SD) — the WebUI
   implements that path (`HostTarget = "sdfiles"`, `/sd` prefix handling)
   but it has never been exercised end-to-end.

## Approach

### Phase 0 — prerequisites (current releases)

- Release WebUI 3.2.0.
- Release the embedded page for grblHAL / ESP3D-X (HTTPS support).
  Reminder: the embedded page version string lives in
  `embedded/src/index.js` (`const version = "3.0.0.a6"`) and is checked
  against the firmware answer ("Wrong version of webUI") — bump it as part
  of the release.

### Phase 1 — merge the two mocks into one configurable server

Done inside this repository first, with the existing test suites
(`npm run test`, the round-trip checks) and dev flows as the safety net.

- The embedded-page scenario becomes a *configuration* of the common
  server, not a separate server: the embedded page only needs
  `/command` (ESP800), `/files`, `/sdfiles`, `/login`, `/updatefw` and
  static packaged-page serving — all already in the main mock.
- Unify: env var names (`WEBROOT` everywhere, not `HOSTPATH`), ports
  (8080 / 8089 vs 81 / `/ws` upgrade), the `secure` Caddy flow, fixtures
  layout (`server/<Target>/<Subtarget>/Flash`).
- Keep the firmware-accurate differences behind parameters (see Phase 2),
  e.g. the old-ESP3D WebSocket on a separate port vs the `/ws` upgrade.

### Phase 2 — full CLI parameterization

Current parameters (keep working unchanged):

```text
npm run dev-cnc-grblhal [secure] [auth] [root=<subdir>]
```

Add (names indicative, to be finalized):

```text
fs=none              -> FlashFileSystem "none": /files returns 400, no
                        "Flash" in the Files panel, HostTarget = "sdfiles"
host=sd              -> web content hosted on SD: HostPath "/sd/www"
                        (WebUI strips /sd for sdfiles, keeps it for static)
fs-size=<n>          -> reported flash size / occupation
sd-size=<n>          -> reported SD size / occupation
auth                 -> Authentication Enabled (admin/admin)   [exists]
user=<u> pass=<p>    -> credentials instead of admin/admin
root=<subdir>        -> HostPath / webRoot override            [exists]
secure               -> Caddy HTTPS front                      [exists]
wsport=<n>           -> reported WebSocketPort
port=<n>             -> HTTP port (already via PORT env)
slow=<ms>            -> artificial latency (sync server, one query
                        at a time: helps reproduce queue/timeout bugs)
```

Design rule: **any knob we have edited in a source file twice becomes a
CLI parameter.** The target modules stay the canned-response reference;
parameters only switch behavior branches.

### Phase 3 — extract the test server project

- New repo (proposal: `ESP3D-test-server`), including fixtures, Caddyfile,
  launcher, target modules, and its own smoke-test suite (the curl flows
  used during development, scripted).
- Consumption by the WebUI: **npm git dependency**
  (`"esp3d-test-server": "github:luc-github/ESP3D-test-server#<tag>"`) —
  same pinning as a submodule but `npm install` is enough, no
  `git submodule update --init` to document for contributors.
  (Open question below.)
- The WebUI keeps its `dev-*` script names; they forward to the package.

### Phase 4 — extract the embedded page project

- New repo for `embedded/` (page sources, build, its dev flow using the
  test server from Phase 3).
- Firmware projects consume it as a **git submodule** (they have no npm).
- `buildassets.js` takes the firmware output directory as a parameter
  instead of the hardcoded `../main/embedded/`.

### Phase 5 — SD-hosted and no-flash scenarios

With `fs=none` / `host=sd` from Phase 2:

- Fixtures set for an SD-hosted web (`SD/www/index.html.gz`, languages,
  themes on SD).
- Validate the WebUI `FlashFileSystem == "none"` path: Files panel shows
  only the SD, `HostTarget = "sdfiles"`, uploads/downloads via `/sdfiles`,
  static GETs with the `/sd` prefix, scanners against SD paths.
- Validate `host=sd` with flash present: listing on flash, web content
  from SD.
- Document results in `docs/hostpath_files_api.md` (mapping table is
  already there; fill the "Open point" about the exact HostPath form).

## Constraints

- **Backward compatibility**: existing `npm run dev-*` invocations and
  muscle memory must keep working; the `release_bundle_sizes.py` and CI
  flows must not break.
- **No npm on firmware side** → submodule for the embedded page.
- **Fidelity to the firmware protocol**: `docs/hostpath_files_api.md` is
  the reference (HostPath conventions, absolute upload paths, static GETs,
  400 when no flash FS). The mock must implement the documented behavior,
  not convenient approximations.
- **Cross-platform by principle**: like every tool in the esp3d.io
  ecosystem, the test server must run on Windows, Linux and macOS. Shell
  argument quirks are handled in one place (the launcher) — PowerShell,
  cmd, Git Bash and POSIX shells must all accept the same command line,
  including the MSYS leading-slash mangling guard. No shell-specific
  scripts; everything goes through Node.js.
- **Offline-friendly**: no npm registry requirement — git URL dependencies
  only.
- **Synchronous server model**: the mock must keep simulating the real
  constraint (one query at a time); `slow=<ms>` helps reproduce race and
  timeout situations.

## Test strategy

- Keep and extend the existing WebUI round-trip tests.
- New smoke-test suite shipped with the test-server repo: scripted
  requests covering a scenario matrix:
  - FS: flash / SD-hosted / none
  - auth: off / on (login, bad login, logout, 401s on all endpoints)
  - transport: plain HTTP / HTTPS via Caddy, including `.br` vs `.gz`
    content negotiation
  - HostPath: `/` / `/www`
- Each scenario asserts: ESP800 fields, `/files` listing root content,
  upload landing path, download URL, default document.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Submodule UX friction for embedded consumers | step-by-step doc in the embedded repo README; firmware build fails loudly with instructions if the submodule is missing |
| Mock/WebUI version drift | WebUI pins a tag; CHANGELOG in the test-server repo; CI on the WebUI side runs the smoke suite |
| Extraction breaks dev habits | Phase 1 done in-repo first; extraction only once the merged server is proven |
| Fixture duplication across repos | fixtures live in the test-server repo only |

## Open questions

1. npm git dependency vs git submodule for the test server (this plan
   recommends npm git dep — submodules stay for firmware consumers).
2. Repository names / organization.
3. Should the unified server also absorb the *embedded-style* old-ESP3D
   WebSocket-on-port-81 behavior, or is `/ws` upgrade enough for tests?
4. Final CLI parameter names (see Phase 2 list).
