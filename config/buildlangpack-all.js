/*
 buildlangpack-all.js - Build all language packs from root lang-*.json in one go

 Copyright (c) 2021 Luc Lebosse. All rights reserved.
*/
const chalk = require("chalk")
const path = require("path")
const fs = require("fs")
const { spawn } = require("child_process")

const languagesPath = path.normalize(__dirname + "/../languages/")

const rootFiles = fs.readdirSync(languagesPath).filter((f) => f.startsWith("lang-") && f.endsWith(".json"))
if (rootFiles.length === 0) {
    console.log(chalk.yellow("No lang-*.json files found in languages/"))
    process.exit(0)
}

console.log(chalk.cyan(`Building packs for ${rootFiles.length} language(s): ${rootFiles.join(", ")}`))

let index = 0
function runNext() {
    if (index >= rootFiles.length) {
        console.log(chalk.green("All language packs built."))
        return
    }
    const file = rootFiles[index++]
    console.log(chalk.blue(`\n--- ${file} ---`))
    const child = spawn("node", [path.join(__dirname, "buildlangpack.js"), file], {
        cwd: path.join(__dirname, ".."),
        stdio: "inherit",
    })
    child.on("close", (code) => {
        if (code !== 0) console.log(chalk.red(`buildlangpack ${file} exited with ${code}`))
        runNext()
    })
}

runNext()
