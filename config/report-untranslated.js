/*
 report-untranslated.js - Compare each pack lang-*.json to en.json; list keys that are
 missing, empty, or identical to English (candidates for translation).

 Output: JSON report (and optional stdout summary) for use with automatic translation.
*/
const path = require("path")
const fs = require("fs")

const languagesPath = path.normalize(__dirname + "/../languages/")
const packs = ["printerpack", "cncgrblpack", "cncgrblhalpack", "sandtablepack"]
const outFile = process.argv[2] || path.join(languagesPath, "untranslated-report.json")

const report = { generated: new Date().toISOString(), packs: {} }

packs.forEach((packName) => {
    const packDir = path.join(languagesPath, packName)
    const refPath = path.join(packDir, "en.json")
    if (!fs.existsSync(refPath)) return
    const reference = JSON.parse(fs.readFileSync(refPath, "UTF-8"))

    const packReport = {}
    const files = fs.readdirSync(packDir).filter((f) => f.startsWith("lang-") && f.endsWith(".json"))
    files.forEach((fileName) => {
        const code = fileName.replace(/^lang-/, "").replace(/\.json$/, "")
        const filePath = path.join(packDir, fileName)
        let data
        try {
            data = JSON.parse(fs.readFileSync(filePath, "UTF-8"))
        } catch (e) {
            packReport[code] = { error: e.message }
            return
        }
        const missing = []
        const empty = []
        const sameAsEnglish = []
        Object.keys(reference).forEach((key) => {
            if (reference[key] == null || reference[key] === "" || key === "lang") return
            const val = data[key]
            if (val === undefined) missing.push({ key, en: reference[key] })
            else if (val === "") empty.push({ key, en: reference[key] })
            else if (val === reference[key]) sameAsEnglish.push({ key, en: reference[key] })
        })
        const total = missing.length + empty.length + sameAsEnglish.length
        packReport[code] = {
            missing,
            empty,
            sameAsEnglish,
            totalKeysInReference: Object.keys(reference).filter((k) => reference[k] != null && reference[k] !== "").length,
            untranslatedCount: total,
        }
    })
    report.packs[packName] = packReport
})

fs.writeFileSync(outFile, JSON.stringify(report, null, 2), "UTF-8")
console.log("Report written:", outFile)

// Summary to stdout
Object.keys(report.packs).forEach((pack) => {
    const r = report.packs[pack]
    Object.keys(r).forEach((code) => {
        const d = r[code]
        if (d.error) {
            console.log(`${pack}/${code}: error - ${d.error}`)
            return
        }
        const n = (d.missing && d.missing.length) || 0
        const e = (d.empty && d.empty.length) || 0
        const s = (d.sameAsEnglish && d.sameAsEnglish.length) || 0
        const total = (d.totalKeysInReference) || 0
        const completePct = total ? (n + e === 0 ? "100" : ((total - n - e) / total * 100).toFixed(1)) : "0"
        const translatedPct = total ? ((total - d.untranslatedCount) / total * 100).toFixed(1) : "0"
        const suffix = n + e === 0 && s > 0
            ? `– ${completePct}% complete with ${s} EN = ${translatedPct}% translated`
            : `– ${completePct}% complete, ${translatedPct}% translated`
        console.log(`${pack} lang-${code}.json: ${d.untranslatedCount} to translate (missing: ${n}, empty: ${e}, same as EN: ${s}) ${suffix}`)
    })
})
