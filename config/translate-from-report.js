/*
 translate-from-report.js - Use untranslated-report.json to fill missing/empty translations
 via LibreTranslate or Anthropic (Claude). Updates ROOT files languages/lang-<code>.json so that
 running buildlangpack:all afterward propagates translations to all packs. Run buildlangpack:all after.

 Usage:
   node config/translate-from-report.js [options]

 Options (env or CLI):
   --report=<path>     Path to untranslated-report.json (default: languages/untranslated-report.json)
   --pack=<name>       Only process this pack (e.g. printerpack)
   --lang=<code>       Only process this language (e.g. fr)
   --include-same      Also translate keys that are currently same as English
   --dry-run           Do not write files; only log what would be translated
   --backend=<name>     libretranslate (default) or anthropic
   --batch-size=<n>    Max strings per API call (default 30)
   --delay=<ms>        Delay between API calls in ms (default 6000 libretranslate, 1000 anthropic)
   --no-backup         Skip incremental backup of root lang-*.json before writing

 Env (or .env at project root):
   TRANSLATE_BACKEND     libretranslate | anthropic
   LIBRE_TRANSLATE_URL   Base URL (default https://libretranslate.com)
   LIBRE_TRANSLATE_KEY   Optional API key
   ANTHROPIC_API_KEY     Required for backend=anthropic. Can be in .env to avoid setting in terminal.
*/
const path = require("path")
const fs = require("fs")
const https = require("https")
const http = require("http")

function loadEnv() {
    const envPath = path.join(__dirname, "..", ".env")
    if (!fs.existsSync(envPath)) return
    const content = fs.readFileSync(envPath, "utf8")
    content.split(/\r?\n/).forEach((line) => {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
        if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
    })
}
loadEnv()

const languagesPath = path.normalize(__dirname + "/../languages/")

// Map our lang codes to LibreTranslate target codes
const LANG_TO_API = {
    de: "de",
    es: "es",
    fr: "fr",
    hu: "hu",
    id: "id",
    it: "it",
    ja: "ja",
    ko: "ko",
    pl: "pl",
    ptbr: "pt",
    ru: "ru",
    th: "th",
    tr: "tr",
    uk: "uk",
    zhcn: "zh",
    zhtw: "zh-TW",
}

// Language names for Claude prompt
const LANG_NAME = {
    de: "German",
    es: "Spanish",
    fr: "French",
    hu: "Hungarian",
    id: "Indonesian",
    it: "Italian",
    ja: "Japanese",
    ko: "Korean",
    pl: "Polish",
    ptbr: "Brazilian Portuguese",
    ru: "Russian",
    th: "Thai",
    tr: "Turkish",
    uk: "Ukrainian",
    zhcn: "Simplified Chinese",
    zhtw: "Traditional Chinese",
}

function parseArgs() {
    const backend = process.env.TRANSLATE_BACKEND || "libretranslate"
    const defaultDelay = backend === "anthropic" ? 1000 : 6000
    const args = {
        report: path.join(languagesPath, "untranslated-report.json"),
        pack: null,
        lang: null,
        includeSame: false,
        dryRun: false,
        backend: backend,
        batchSize: 30,
        delay: defaultDelay,
        backup: true,
    }
    process.argv.slice(2).forEach((arg) => {
        if (arg.startsWith("--report=")) args.report = arg.replace("--report=", "")
        else if (arg.startsWith("--pack=")) args.pack = arg.replace("--pack=", "")
        else if (arg.startsWith("--lang=")) args.lang = arg.replace("--lang=", "")
        else if (arg === "--include-same") args.includeSame = true
        else if (arg === "--dry-run") args.dryRun = true
        else if (arg === "--no-backup") args.backup = false
        else if (arg.startsWith("--backend=")) args.backend = arg.replace("--backend=", "")
        else if (arg.startsWith("--batch-size=")) args.batchSize = parseInt(arg.replace("--batch-size=", ""), 10) || 30
        else if (arg.startsWith("--delay=")) args.delay = parseInt(arg.replace("--delay=", ""), 10) || defaultDelay
    })
    if (args.backend === "anthropic" && args.delay === 6000) args.delay = 1000
    args.baseUrl = process.env.LIBRE_TRANSLATE_URL || "https://libretranslate.com"
    args.libretranslateKey = process.env.LIBRE_TRANSLATE_KEY || ""
    args.anthropicKey = process.env.ANTHROPIC_API_KEY || ""
    return args
}

function postJson(url, body) {
    const isHttps = url.startsWith("https")
    const lib = isHttps ? https : http
    const u = new URL(url)
    const text = JSON.stringify(body)
    return new Promise((resolve, reject) => {
        const req = lib.request(
            {
                hostname: u.hostname,
                port: u.port || (isHttps ? 443 : 80),
                path: u.pathname + u.search,
                method: "POST",
                headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(text, "utf8") },
            },
            (res) => {
                let data = ""
                res.on("data", (c) => (data += c))
                res.on("end", () => {
                    try {
                        const j = JSON.parse(data)
                        if (res.statusCode >= 400) reject(new Error(j.error || data || res.statusCode))
                        else resolve(j)
                    } catch (e) {
                        reject(new Error(data || e.message))
                    }
                })
            }
        )
        req.on("error", reject)
        req.write(text)
        req.end()
    })
}

function postAnthropic(body, apiKey) {
    const text = JSON.stringify(body)
    return new Promise((resolve, reject) => {
        const req = https.request(
            {
                hostname: "api.anthropic.com",
                port: 443,
                path: "/v1/messages",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                    "Content-Length": Buffer.byteLength(text, "utf8"),
                },
            },
            (res) => {
                let data = ""
                res.on("data", (c) => (data += c))
                res.on("end", () => {
                    try {
                        const j = JSON.parse(data)
                        if (res.statusCode >= 400) {
                            const errMsg = j.error?.message || (typeof j.error === "string" ? j.error : null) || (j.message || JSON.stringify(j.error || data))
                            reject(new Error(errMsg || String(res.statusCode)))
                        } else resolve(j)
                    } catch (e) {
                        reject(new Error(data || e.message))
                    }
                })
            }
        )
        req.on("error", reject)
        req.write(text)
        req.end()
    })
}

function parseJsonArrayFromText(raw) {
    let s = raw.trim()
    const codeBlock = s.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlock) s = codeBlock[1].trim()
    const start = s.indexOf("[")
    const end = s.lastIndexOf("]")
    if (start === -1 || end === -1 || end <= start) throw new Error("No JSON array in response")
    return JSON.parse(s.slice(start, end + 1))
}

async function translateBatchLibre(texts, targetCode, baseUrl, apiKey) {
    if (texts.length === 0) return []
    const url = baseUrl.replace(/\/$/, "") + "/translate"
    const body = { q: texts, source: "en", target: targetCode, format: "text" }
    if (apiKey) body.api_key = apiKey
    const res = await postJson(url, body)
    const out = res.translatedText
    return Array.isArray(out) ? out : [out]
}

async function translateBatchAnthropic(texts, targetLangName, apiKey) {
    if (texts.length === 0) return []
    const prompt = `Translate the following ${texts.length} English strings to ${targetLangName}. Preserve placeholders like %s or # exactly. Return only a JSON array of ${texts.length} translated strings, in the same order, no other text. Example: ["first translation", "second translation"]

Strings to translate:
${JSON.stringify(texts)}`
    const res = await postAnthropic(
        {
            model: "claude-haiku-4-5-20251001",
            max_tokens: 4096,
            system: "You are a precise translator. Output only the JSON array, no markdown, no explanation.",
            messages: [{ role: "user", content: prompt }],
        },
        apiKey
    )
    const raw = res.content?.[0]?.text
    if (!raw) throw new Error("Empty response from Claude")
    const arr = parseJsonArrayFromText(raw)
    if (!Array.isArray(arr) || arr.length !== texts.length) {
        throw new Error(`Expected ${texts.length} strings, got ${Array.isArray(arr) ? arr.length : "non-array"}`)
    }
    return arr
}

async function translateBatch(texts, targetCode, targetLangName, args) {
    if (args.backend === "anthropic") {
        return translateBatchAnthropic(texts, targetLangName, args.anthropicKey)
    }
    return translateBatchLibre(texts, targetCode, args.baseUrl, args.libretranslateKey)
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms))
}

function formatEta(ms) {
    if (ms < 0 || !isFinite(ms)) return "?"
    const s = Math.round(ms / 1000)
    if (s < 60) return s + " s"
    const m = Math.floor(s / 60)
    const s2 = s % 60
    if (m < 60) return s2 ? m + " min " + s2 + " s" : m + " min"
    const h = Math.floor(m / 60)
    const m2 = m % 60
    return m2 ? h + " h " + m2 + " min" : h + " h"
}

function buildTaskList(report, args) {
    const tasks = []
    for (const [packName, packData] of Object.entries(report.packs || {})) {
        if (args.pack && args.pack !== packName) continue
        const packDir = path.join(languagesPath, packName)
        if (!fs.existsSync(packDir)) continue
        for (const [langCode, data] of Object.entries(packData)) {
            if (data.error) continue
            if (args.lang && args.lang !== langCode) continue
            if (!LANG_TO_API[langCode]) continue
            const items = [...(data.missing || []), ...(data.empty || [])]
            if (args.includeSame) items.push(...(data.sameAsEnglish || []))
            if (items.length === 0) continue
            const batchCount = Math.ceil(items.length / args.batchSize)
            tasks.push({ packName, langCode, items, batchCount })
        }
    }
    return tasks
}

// Anthropic Claude Haiku: $1/M input, $5/M output (approx)
const ANTHROPIC_INPUT_PER_M = 1
const ANTHROPIC_OUTPUT_PER_M = 5
const CHARS_PER_TOKEN = 4
const PROMPT_TOKENS_PER_CALL = 450

function estimateAnthropicCost(tasks, batchSize) {
    let totalSourceChars = 0
    const totalApiCalls = tasks.reduce((acc, t) => acc + t.batchCount, 0)
    tasks.forEach((t) => t.items.forEach((it) => (totalSourceChars += (it.en && it.en.length) || 0)))
    const sourceTokens = Math.ceil(totalSourceChars / CHARS_PER_TOKEN)
    const promptTokens = totalApiCalls * PROMPT_TOKENS_PER_CALL
    const inputTokens = promptTokens + sourceTokens
    const outputTokens = Math.ceil(sourceTokens * 1.2)
    const costUsd = (inputTokens / 1e6) * ANTHROPIC_INPUT_PER_M + (outputTokens / 1e6) * ANTHROPIC_OUTPUT_PER_M
    return { inputTokens, outputTokens, costUsd, totalSourceChars }
}

async function run() {
    const args = parseArgs()
    if (!fs.existsSync(args.report)) {
        console.error("Report not found:", args.report)
        console.error("Run: npm run report-untranslated")
        process.exit(1)
    }
    const report = JSON.parse(fs.readFileSync(args.report, "UTF-8"))
    if (args.lang && !LANG_TO_API[args.lang]) {
        console.error("Unknown language code:", args.lang, "Supported:", Object.keys(LANG_TO_API).join(", "))
        process.exit(1)
    }

    const tasks = buildTaskList(report, args)
    const totalApiCalls = tasks.reduce((acc, t) => acc + t.batchCount, 0)
    const totalStrings = tasks.reduce((acc, t) => acc + t.items.length, 0)
    if (tasks.length === 0) {
        console.log("Nothing to translate.")
        return
    }
    const estimatedTotalMs = totalApiCalls * args.delay
    console.log("Backend:", args.backend, "| Tasks:", tasks.length, "| API calls:", totalApiCalls, "| Strings:", totalStrings, "| Est. time:", formatEta(estimatedTotalMs))
    if (args.backend === "anthropic") {
        const cost = estimateAnthropicCost(tasks, args.batchSize)
        console.log("Est. cost (Claude Haiku): ~$" + cost.costUsd.toFixed(2), "(" + (cost.inputTokens / 1000).toFixed(1) + "k input +", (cost.outputTokens / 1000).toFixed(1) + "k output tokens)")
    }
    console.log("")

    if (args.dryRun) {
        console.log("[dry-run] No API calls. Run without --dry-run to translate.")
        return
    }

    if (args.backend === "anthropic" && !args.anthropicKey) {
        console.error("Backend 'anthropic' requires ANTHROPIC_API_KEY (no key needed for --dry-run).")
        process.exit(1)
    }

    // Incremental backup: copy root lang-*.json we're about to modify into languages/backup/<timestamp>/
    const rootFilesToTouch = [...new Set(tasks.map((t) => path.join(languagesPath, `lang-${t.langCode}.json`)))]
    if (args.backup && !args.dryRun && rootFilesToTouch.length > 0) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
        const backupDir = path.join(languagesPath, "backup", timestamp)
        if (!fs.existsSync(path.join(languagesPath, "backup"))) fs.mkdirSync(path.join(languagesPath, "backup"), { recursive: true })
        fs.mkdirSync(backupDir, { recursive: true })
        let backed = 0
        rootFilesToTouch.forEach((filePath) => {
            if (fs.existsSync(filePath)) {
                const name = path.basename(filePath)
                fs.copyFileSync(filePath, path.join(backupDir, name))
                backed++
            }
        })
        console.log("Backup:", backupDir, "(" + backed + " file(s))")
    }

    let taskIndex = 0
    let apiCallDone = 0
    const startTime = Date.now()

    for (const task of tasks) {
        taskIndex++
        const { packName, langCode, items, batchCount } = task
        const rootLangPath = path.join(languagesPath, `lang-${langCode}.json`)
        let existing = {}
        if (fs.existsSync(rootLangPath)) {
            try {
                existing = JSON.parse(fs.readFileSync(rootLangPath, "UTF-8"))
            } catch (e) {
                console.warn("Skip", rootLangPath, e.message)
                continue
            }
        }
        const targetCode = LANG_TO_API[langCode]
        const texts = items.map((x) => x.en)
        const batches = []
        for (let i = 0; i < texts.length; i += args.batchSize) batches.push(texts.slice(i, i + args.batchSize))

        const allTranslated = []
        for (let i = 0; i < batches.length; i++) {
            apiCallDone++
            const remainingCalls = totalApiCalls - apiCallDone
            const etaMs = remainingCalls * args.delay
            const pct = totalApiCalls ? Math.round((apiCallDone / totalApiCalls) * 100) : 0
            process.stdout.write(
                `[${taskIndex}/${tasks.length}] ${packName}/${langCode} batch ${i + 1}/${batches.length} | ${apiCallDone}/${totalApiCalls} calls ${pct}% | ETA ${formatEta(etaMs)}   \r`
            )
            await sleep(args.delay)
            const targetLangName = LANG_NAME[langCode] || langCode
            try {
                const translated = await translateBatch(batches[i], targetCode, targetLangName, args)
                allTranslated.push(...translated)
            } catch (e) {
                console.error("\nAPI error", packName, langCode, "batch", i + 1, ":", e.message)
                if (args.backend === "libretranslate" && (e.message.includes("Slowdown") || e.message.includes("limit"))) {
                    console.error("Tip: libretranslate.com allows 10 req/min. Use --delay=6000 or try --backend=anthropic with ANTHROPIC_API_KEY.")
                }
                break
            }
        }

        if (allTranslated.length !== items.length) {
            console.warn("\n" + packName, langCode, ": got", allTranslated.length, "translations, expected", items.length)
        }
        if (allTranslated.length > 0) {
            items.forEach((item, idx) => {
                if (allTranslated[idx] != null) existing[item.key] = allTranslated[idx]
            })
            if (!args.dryRun) {
                if (!existing.lang) existing.lang = LANG_NAME[langCode] || langCode
                fs.writeFileSync(rootLangPath, JSON.stringify(existing, null, 1), "UTF-8")
                console.log("\nWritten", rootLangPath, `(${packName}: ${allTranslated.length} keys)`)
            } else {
                console.log("\n[dry-run] Would update", rootLangPath, "with", allTranslated.length, "translations")
            }
        }
    }
    const elapsed = Date.now() - startTime
    console.log("\nDone. Elapsed:", formatEta(elapsed))
    console.log("Run: npm run buildlangpack:all  to propagate root translations to all packs.")
}

run().catch((e) => {
    console.error(e)
    process.exit(1)
})
