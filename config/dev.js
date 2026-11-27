/*
 * Dev launcher: mock server + webpack dev server (+ Caddy HTTPS front)
 *
 *   node config/dev.js <Target> <Subtarget> [secure] [auth] [root=<subdir>]
 *                      [noflash] [nosd]          (see config/README.md)
 *   npm run dev-cnc-grblhal            -> http://localhost:8088
 *   npm run dev-cnc-grblhal secure     -> https://localhost:8443
 *   npm run dev-cnc-grblhal auth       -> mock with authentication (admin/admin)
 *   npm run dev-cnc-grblhal root=www   -> override the target webRoot
 *                                         (HostPath simulation, fixtures must
 *                                         exist under server/<T>/<S>/Flash/www)
 *   npm run dev-cnc-grblhal noflash    -> no flash FS, web files on the SD card
 *   npm run dev-cnc-grblhal nosd       -> no SD card (with noflash: nothing stored)
 *
 * secure mode needs Caddy (https://caddyserver.com, `winget install CaddyServer.Caddy`):
 *   https://localhost:8443 -> webpack dev server 8088 (dev bundle)
 *   https://localhost:8445 -> mock server 8080 (packaged Flash/index.html.br|.gz)
 *   wss://localhost:8444   -> mock WebSocket 8089
 * The mock then reports WebSocketPort 8444, so the plain http:// URLs do not
 * get a working WebSocket in this mode.
 */
const { spawn, spawnSync } = require("child_process")
const path = require("path")
const fs = require("fs")

const args = process.argv.slice(2)
const secure = args.includes("secure")
const auth = args.includes("auth")
const noflash = args.includes("noflash")
const nosd = args.includes("nosd")
const rootArg = args.find((a) => a.startsWith("root="))
const [target = "Printer3D", subtarget = "Marlin"] = args.filter(
    (a) =>
        a !== "secure" &&
        a !== "auth" &&
        a !== "noflash" &&
        a !== "nosd" &&
        !a.startsWith("root=")
)

const env = {
    ...process.env,
    TARGET_ENV: target,
    SUBTARGET_ENV: subtarget,
}
if (auth) env.AUTH = "1"
//noflash: ESP800 reports FlashFileSystem "none", /files returns 400 and
//the web resources are served from the SD card
if (noflash) env.NOFLASH = "1"
//nosd: ESP800 reports SDConnection "none" and /sdfiles returns 400
if (nosd) env.NOSD = "1"
//root=<subdir> overrides the target webRoot AND the HostPath reported by
//ESP800 - normalized here so targets can use it as-is
if (rootArg) {
    let w = rootArg.substring("root=".length)
    if (!w.startsWith("/")) w = "/" + w
    env.WEBROOT = w.replace(/\/+$/, "") || "/"
}

const commands = ['"npm run server"', '"npm run front"']
const names = ["server", "front"]

// Caddy location: CADDY env var, PATH, or the winget install folder (the
// PATH updated by winget is not seen by terminals of an already running VS Code)
function findCaddy() {
    const candidates = [process.env.CADDY, "caddy"]
    const wingetDir = path.join(
        process.env.LOCALAPPDATA || "",
        "Microsoft/WinGet/Packages"
    )
    if (process.env.LOCALAPPDATA && fs.existsSync(wingetDir)) {
        fs.readdirSync(wingetDir)
            .filter((d) => d.startsWith("CaddyServer.Caddy"))
            .forEach((d) =>
                candidates.push(path.join(wingetDir, d, "caddy.exe"))
            )
    }
    return candidates.find(
        (c) =>
            c && spawnSync(`"${c}"`, ["version"], { shell: true }).status === 0
    )
}

if (secure) {
    const caddy = findCaddy()
    if (!caddy) {
        console.error(
            "secure mode needs Caddy: winget install CaddyServer.Caddy (or set CADDY=<path to caddy.exe>)"
        )
        process.exit(1)
    }
    env.SECURE = "1"
    env.WS_PUBLIC_PORT = "8444"
    if (caddy !== "caddy") {
        // make the found caddy reachable as "caddy" for the child processes
        const key =
            Object.keys(env).find((k) => k.toUpperCase() === "PATH") || "PATH"
        env[key] = path.dirname(caddy) + path.delimiter + (env[key] || "")
    }
    commands.push('"caddy run --config config/Caddyfile --adapter caddyfile"')
    names.push("caddy")
    console.log(
        "Secure mode: https://localhost or https://localhost:8443 (dev) / https://localhost:8445 (packaged) / wss://localhost:8444"
    )
}

const options = [
    secure ? "secure" : null,
    rootArg ? `webRoot=${env.WEBROOT}` : null,
    auth ? "auth (admin/admin)" : null,
    noflash ? "noflash (no flash FS, web files on SD)" : null,
    nosd ? "nosd (no SD card)" : null,
].filter(Boolean)
if (options.length) console.log("Options: " + options.join(", "))

const concurrently = path.join(__dirname, "../node_modules/.bin/concurrently")
const child = spawn(
    `"${concurrently}"`,
    ["--kill-others-on-fail", "--names", names.join(","), ...commands],
    { stdio: "inherit", shell: true, env, cwd: path.join(__dirname, "..") }
)
child.on("exit", (code) => process.exit(code ?? 0))
