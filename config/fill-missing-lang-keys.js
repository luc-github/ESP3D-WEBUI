/*
 fill-missing-lang-keys.js - Add missing keys from en.json into each pack lang-*.json (value "")

 So every lang file has all keys; untranslated entries are empty for later translation or report.
*/
const chalk = require("chalk")
const path = require("path")
const fs = require("fs")

const languagesPath = path.normalize(__dirname + "/../languages/")
const packs = ["printerpack", "cncgrblpack", "cncgrblhalpack", "sandtablepack"]

const keepMetaKeys = ["lang", "target_lang"]

packs.forEach((packName) => {
    const packDir = path.join(languagesPath, packName)
    const refPath = path.join(packDir, "en.json")
    if (!fs.existsSync(refPath)) return
    const reference = JSON.parse(fs.readFileSync(refPath, "UTF-8"))
    const refKeys = new Set(Object.keys(reference).filter((k) => reference[k] != null && reference[k] !== ""))

    const files = fs.readdirSync(packDir).filter((f) => f.startsWith("lang-") && f.endsWith(".json"))
    files.forEach((fileName) => {
        const filePath = path.join(packDir, fileName)
        let data
        try {
            data = JSON.parse(fs.readFileSync(filePath, "UTF-8"))
        } catch (e) {
            console.log(chalk.red(`Skip ${packName}/${fileName}: ${e.message}`))
            return
        }
        let added = 0
        refKeys.forEach((key) => {
            if (data[key] === undefined) {
                data[key] = ""
                added++
            }
        })
        // Keep keys in stable order: meta first, then same order as reference
        const out = {}
        keepMetaKeys.forEach((k) => {
            if (data[k] !== undefined) out[k] = data[k]
        })
        Object.keys(reference).forEach((key) => {
            if (reference[key] == null || reference[key] === "") return
            if (out[key] !== undefined) return
            out[key] = data[key] !== undefined ? data[key] : ""
        })
        fs.writeFileSync(filePath, JSON.stringify(out, null, 1), "UTF-8")
        if (added) console.log(chalk.green(`${packName}/${fileName}: added ${added} missing key(s).`))
    })
})

console.log(chalk.cyan("Done. Run report-untranslated.js to list keys to translate."))
