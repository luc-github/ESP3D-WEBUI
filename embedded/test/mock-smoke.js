/*
 * Smoke test for the embedded mock (config/server.js) - plain HTTP part of
 * the dev flow. TLS is Caddy's job in secure mode (see config/Caddyfile);
 * this test only covers what the mock itself provides, including the
 * WS_PUBLIC_PORT reporting the secure mode relies on.
 *
 * Spawns the mock with WS_PUBLIC_PORT=8444 (as `npm run dev secure` does)
 * and checks:
 *  1. http://localhost:8080 serves the packaged page (gzip, firmware-like)
 *  2. ws://localhost:81 accepts webui-v3 (Synchronous mode)
 *  3. ws://localhost:8080/ws upgrade on the page port (Asynchronous mode)
 *  4. [ESP800] reports the WS_PUBLIC_PORT (8444 in secure mode) and
 *     WebCommunication "Synchronous" by default
 *  5. /files?path=/ lists the "flash" dir
 * Then kills the server and exits 0/1.
 *
 *   node test/mock-smoke.js
 */
process.env.WS_PUBLIC_PORT = "8444" // what config/dev.js sets in secure mode

const { spawn } = require("child_process")
const path = require("path")
const fs = require("fs")
const http = require("http")
const WebSocket = require("ws")

const root = path.join(__dirname, "..")

// The mock serves the packaged page from its "flash" dir: seed it from the
// build output if missing (like config/dev.js does in secure mode)
const distGz = path.join(root, "dist", "index.html.gz")
const flashGz = path.join(root, "server", "public", "index.html.gz")
if (!fs.existsSync(flashGz) && fs.existsSync(distGz)) {
    fs.mkdirSync(path.dirname(flashGz), { recursive: true })
    fs.copyFileSync(distGz, flashGz)
    console.log("[setup] copied dist/index.html.gz into server/public/")
}

let failures = 0
const ok = (name) => console.log("PASS  " + name)
const ko = (name, err) => {
    failures++
    console.log("FAIL  " + name + " : " + err)
}

const server = spawn(
    process.execPath,
    [path.join(root, "config", "server.js")],
    { cwd: root, env: process.env, stdio: ["ignore", "pipe", "pipe"] }
)
server.stdout.on("data", (d) => process.stdout.write("[server] " + d))
server.stderr.on("data", (d) => process.stdout.write("[server:err] " + d))

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, { headers: { "accept-encoding": "gzip" } }, (res) => {
            let chunks = []
            res.on("data", (c) => chunks.push(c))
            res.on("end", () =>
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: Buffer.concat(chunks),
                })
            )
        }).on("error", reject)
    })
}

function wsCheck(url, protocols) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(url, protocols)
        const timer = setTimeout(() => {
            ws.terminate()
            reject(new Error("timeout"))
        }, 5000)
        ws.on("open", () => {
            clearTimeout(timer)
            resolve(ws.protocol)
            ws.close()
        })
        ws.on("error", (e) => {
            clearTimeout(timer)
            reject(e)
        })
    })
}

async function main() {
    await new Promise((r) => setTimeout(r, 3000)) // listen

    try {
        const res = await get("http://localhost:8080/")
        if (res.status === 200 && res.headers["content-encoding"] === "gzip")
            ok("http://localhost:8080 serves index.html.gz (200, gzip)")
        else
            ko(
                "http page",
                `status=${res.status} enc=${res.headers["content-encoding"]}`
            )
    } catch (e) {
        ko("http page", e.message)
    }

    try {
        const proto = await wsCheck("ws://localhost:81", ["webui-v3"])
        ok(`ws://localhost:81 connected (subprotocol: ${proto || "none"})`)
    } catch (e) {
        ko("ws://localhost:81", e.message)
    }

    try {
        const proto = await wsCheck("ws://localhost:8080/ws", ["webui-v3"])
        ok(`ws://localhost:8080/ws connected (subprotocol: ${proto || "none"})`)
    } catch (e) {
        ko("ws://localhost:8080/ws", e.message)
    }

    try {
        const res = await get(
            "http://localhost:8080/command?cmd=" +
                encodeURIComponent("[ESP800]json=YES")
        )
        const json = JSON.parse(res.body.toString())
        if (
            json.data &&
            json.data.WebSocketPort === "8444" &&
            json.data.WebCommunication === "Synchronous"
        )
            ok("[ESP800] reports WS_PUBLIC_PORT 8444 + Synchronous")
        else ko("[ESP800] report", JSON.stringify(json.data || json))
    } catch (e) {
        ko("[ESP800] report", e.message)
    }

    try {
        const res = await get("http://localhost:8080/files?path=/&action=list")
        const json = JSON.parse(res.body.toString())
        if (res.status === 200 && json.status === "ok" && json.path === "/")
            ok("/files?path=/ lists the flash dir")
        else ko("/files list", `status=${res.status} body=${res.body}`)
    } catch (e) {
        ko("/files list", e.message)
    }

    server.kill()
    console.log(
        failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} TEST(S) FAILED`
    )
    process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => {
    server.kill()
    console.error(e)
    process.exit(1)
})
