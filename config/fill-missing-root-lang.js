/*
 fill-missing-root-lang.js - Add missing keys from master_translations.json into root lang-*.json (value "")

 So root language files have all keys; translators or report-untranslated can see what is missing.
 Run after "npm run template" so master_translations.json is up to date.
*/
const chalk = require("chalk")
const path = require("path")
const fs = require("fs")

const languagesPath = path.normalize(__dirname + "/../languages/")
const masterPath = path.join(languagesPath, "master_translations.json")
if (!fs.existsSync(masterPath)) {
    console.log(chalk.red("Run npm run template first to create master_translations.json"))
    process.exit(1)
}
const reference = JSON.parse(fs.readFileSync(masterPath, "UTF-8"))
const refKeys = Object.keys(reference).filter((k) => reference[k] != null && reference[k] !== "")

const rootFiles = fs.readdirSync(languagesPath).filter((f) => f.startsWith("lang-") && f.endsWith(".json"))
rootFiles.forEach((fileName) => {
    const filePath = path.join(languagesPath, fileName)
    let data
    try {
        data = JSON.parse(fs.readFileSync(filePath, "UTF-8"))
    } catch (e) {
        console.log(chalk.red(`Skip ${fileName}: ${e.message}`))
        return
    }
    let added = 0
    refKeys.forEach((key) => {
        if (data[key] === undefined) {
            data[key] = ""
            added++
        }
    })
    if (added === 0) return
    // Preserve order: lang first, then reference keys
    const out = {}
    if (data.lang !== undefined) out.lang = data.lang
    refKeys.forEach((key) => {
        out[key] = data[key] !== undefined ? data[key] : ""
    })
    fs.writeFileSync(filePath, JSON.stringify(out, null, 1), "UTF-8")
    console.log(chalk.green(`${fileName}: added ${added} missing key(s).`))
})
console.log(chalk.cyan("Done. Run npm run buildlangpack all then npm run report-untranslated as needed."))
