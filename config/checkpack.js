/*
 chekpack.js - ESP3D WebUI package file

 Copyright (c) 2021 Luc Lebosse. All rights reserved.
 
 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.
 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.
 You should have received a copy of the GNU Lesser General Public
 License along with This code; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
const chalk = require("chalk")
const path = require("path")
const fs = require("fs")
const { exit } = require("process")
//const targetPath = path.normalize(__dirname + "/../languages/")
let referencePath = ""
let targetPath = ""

function raiseError() {
    console.log(chalk.red("Invalid parameters, please use:"))
    console.log(
        chalk.yellow(
            "npm run check reference=<template path file> target=<not compressed language pack>"
        )
    )
    exit(0)
}

if (process.argv.length == 4) {
    if (process.argv[2].startsWith("reference=")) {
        referencePath = process.argv[2].replace("reference=", "")
    }
    if (process.argv[2].startsWith("target=")) {
        targetPath = process.argv[2].replace("target=", "")
    }
    if (process.argv[3].startsWith("reference=")) {
        referencePath = process.argv[3].replace("reference=", "")
    }
    if (process.argv[3].startsWith("target=")) {
        targetPath = process.argv[3].replace("target=", "")
    }
    if (referencePath.length == 0 || targetPath == 0) {
        raiseError()
    }
} else {
    raiseError()
}
let count = 0
const referenceFile = path.join(
    path.normalize(__dirname + "/../"),
    referencePath
)
const targetFile = path.join(path.normalize(__dirname + "/../"), targetPath)

if (!fs.existsSync(referenceFile)) {
    console.log(chalk.red("Cannot open:"))
    console.log(chalk.yellow(referenceFile))
    exit(0)
}

if (!fs.existsSync(targetFile)) {
    console.log(chalk.red("Cannot open:"))
    console.log(chalk.yellow(targetFile))
    exit(0)
}
console.log(chalk.cyan("Comparing files"))
const fileTarget = JSON.parse(fs.readFileSync(targetFile, "UTF-8").toString())
const fileReference = JSON.parse(
    fs.readFileSync(referenceFile, "UTF-8").toString()
)
console.log("")
console.log(chalk.green("Checking extra entries..."))
Object.keys(fileTarget).map((key) => {
    if (typeof fileReference[key] == "undefined") {
        console.log(chalk.yellow(key + " : " + fileTarget[key]))
        count++
    }
})
console.log(
    chalk.green(
        "...done, found ",
        count ? chalk.yellow(count + " extra entries") : ""
    )
)
count = 0
console.log("")
console.log(chalk.green("Checking missing entries..."))
Object.keys(fileReference).map((key) => {
    if (typeof fileTarget[key] == "undefined") {
        count++
        console.log(chalk.red(key + " : " + fileReference[key]))
    }
})
console.log(
    chalk.green(
        "...done, found ",
        count ? chalk.red(count + " missing entries") : ""
    )
)
console.log("")
console.log(chalk.cyan("Comparaison done"))
