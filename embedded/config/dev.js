/*
 * Dev launcher: mock server + webpack dev server (+ optional Caddy HTTPS front)
 *
 *   npm run dev          -> http://localhost:8088
 *   npm run dev secure   -> https://localhost:8443
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

const secure = process.argv.slice(2).includes("secure");
const root = path.join(__dirname, "..");

const env = { ...process.env };
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
    // the packaged page served by the mock on https://localhost:8445
    const distGz = path.join(root, "dist", "index.html.gz");
    const flashGz = path.join(root, "server", "public", "index.html.gz");
    if (!fs.existsSync(distGz)) {
        console.error(
            "secure mode also serves the packaged page: run `npm run pack` first (dist/index.html.gz is missing)"
        );
        process.exit(1);
    }
    fs.mkdirSync(path.dirname(flashGz), { recursive: true });
    fs.copyFileSync(distGz, flashGz);
    console.log(
        `Secure mode: ${path.relative(root, distGz)} copied to ${path.relative(root, flashGz)}`
    );
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

const concurrently = path.join(root, "node_modules", ".bin", "concurrently");
const child = spawn(
    `"${concurrently}"`,
    ["--kill-others-on-fail", "--names", names.join(","), ...commands],
    { stdio: "inherit", shell: true, env, cwd: root }
);
child.on("exit", (code) => process.exit(code ?? 0));
