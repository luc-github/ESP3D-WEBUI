/*
 * Dev launcher: mock server + webpack dev server (+ optional Caddy HTTPS front)
 *
 *   npm run dev                      -> http://localhost:8088
 *   npm run dev secure               -> https://localhost:8443
 *   npm run dev root=www             -> mock with HostPath /www
 *                                       (fixtures in server/public/www/)
 *   npm run dev auth                 -> mock with authentication (admin/admin)
 *   npm run dev secure root=www auth -> any combination, any order
 *
 * secure mode needs Caddy (https://caddyserver.com, `winget install CaddyServer.Caddy`):
 *   https://localhost:8443 -> webpack dev server 8088 (dev bundle)
 *   https://localhost      -> same, on default port 443 (http://localhost redirects)
 *   https://localhost:8445 -> mock server 8080 (packaged page, server/public)
 *   wss://localhost:8444   -> mock WebSocket 81
 * The mock then reports WebSocketPort 8444, so the plain http:// URLs do not
 * get a working WebSocket in this mode.
 *
 * No native TLS on purpose (self-signed certificate): a wss handshake has no
 * browser error UI, so the secure WebSocket would fail without a manually
 * imported exception - Caddy's local CA (installed in the OS trust store on
 * first run) avoids any certificate handling during tests.
 */
const { spawn, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const argv = process.argv.slice(2);
const secure = argv.includes("secure");
const auth = argv.includes("auth");
//root=<subdir> simulates a firmware HostPath (e.g. root=www -> /www)
const rootArg = argv.find((a) => a.startsWith("root="));
let hostPath = "/";
if (rootArg) {
    hostPath = rootArg.substring("root=".length);
    if (!hostPath.startsWith("/")) hostPath = "/" + hostPath;
    hostPath = hostPath.replace(/\/+$/, "") || "/";
}
const root = path.join(__dirname, "..");

const env = { ...process.env, HOSTPATH: hostPath };
if (auth) env.AUTH = "1";
const commands = ['"npm run server"', '"npm run front"'];
const names = ["server", "front"];

// Caddy location: CADDY env var, PATH, or the winget install folder (the
// PATH updated by winget is not seen by terminals of an already running VS Code)
function findCaddy() {
    const candidates = [process.env.CADDY, "caddy"];
    const wingetDir = path.join(
        process.env.LOCALAPPDATA || "",
        "Microsoft/WinGet/Packages"
    );
    if (process.env.LOCALAPPDATA && fs.existsSync(wingetDir)) {
        fs.readdirSync(wingetDir)
            .filter((d) => d.startsWith("CaddyServer.Caddy"))
            .forEach((d) =>
                candidates.push(path.join(wingetDir, d, "caddy.exe"))
            );
    }
    return candidates.find(
        (c) =>
            c &&
            spawnSync(`"${c}"`, ["version"], { shell: true }).status === 0
    );
}

if (secure) {
    const caddy = findCaddy();
    if (!caddy) {
        console.error(
            "secure mode needs Caddy: winget install CaddyServer.Caddy (or set CADDY=<path to caddy.exe>)"
        );
        process.exit(1);
    }
    // the packaged page served by the mock on https://localhost:8445 -
    // under the host path subdir when root= is used. Only copied when no
    // packaged page exists there yet: manually placed fixtures (e.g. a
    // .br variant to test Brotli-over-HTTPS detection) are never touched
    const distGz = path.join(root, "dist", "index.html.gz");
    const flashGz = path.join(
        root,
        "server",
        "public",
        hostPath == "/" ? "" : hostPath.substring(1),
        "index.html.gz"
    );
    if (!fs.existsSync(distGz)) {
        console.error(
            "secure mode also serves the packaged page: run `npm run pack` first (dist/index.html.gz is missing)"
        );
        process.exit(1);
    }
    const flashBr = flashGz.replace(/\.gz$/, ".br");
    if (!fs.existsSync(flashGz) && !fs.existsSync(flashBr)) {
        fs.mkdirSync(path.dirname(flashGz), { recursive: true });
        fs.copyFileSync(distGz, flashGz);
        console.log(
            `Secure mode: ${path.relative(root, distGz)} copied to ${path.relative(root, flashGz)}`
        );
    } else {
        console.log(
            `Secure mode: using existing packaged page in ${path.dirname(path.relative(root, flashGz))} (dist not copied)`
        );
        if (
            fs.existsSync(flashGz) &&
            fs.statSync(flashGz).mtimeMs < fs.statSync(distGz).mtimeMs
        )
            console.log(
                `Warning: ${path.relative(root, flashGz)} is older than ${path.relative(root, distGz)}`
            );
    }
    env.SECURE = "1";
    env.WS_PUBLIC_PORT = "8444";
    if (caddy !== "caddy") {
        // make the found caddy reachable as "caddy" for the child processes
        const key =
            Object.keys(env).find((k) => k.toUpperCase() === "PATH") || "PATH";
        env[key] = path.dirname(caddy) + path.delimiter + (env[key] || "");
    }
    commands.push('"caddy run --config config/Caddyfile --adapter caddyfile"');
    names.push("caddy");
    console.log(
        "Secure mode: https://localhost or https://localhost:8443 (dev) / https://localhost:8445 (packaged) / wss://localhost:8444"
    );
}

const options = [
    secure ? "secure" : null,
    hostPath == "/" ? null : `HostPath=${hostPath}`,
    auth ? "auth (admin/admin)" : null,
].filter(Boolean);
if (options.length) console.log("Options: " + options.join(", "));

const concurrently = path.join(root, "node_modules", ".bin", "concurrently");
const child = spawn(
    `"${concurrently}"`,
    ["--kill-others-on-fail", "--names", names.join(","), ...commands],
    { stdio: "inherit", shell: true, env, cwd: root }
);
child.on("exit", (code) => process.exit(code ?? 0));
