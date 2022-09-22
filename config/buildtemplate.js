/*
 buildtemplate.js - ESP3D WebUI package file

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
const { Console } = require("console")
const targetPath = path.normalize(__dirname + "/../languages/")
const readable = true // process.argv.length == 3 && process.argv[2] == "readable" ? true : false

const cncgrblpack = [
    { id: "globals", path: "src/targets/translations/en.json" },
    {
        id: "CNC",
        path: "src/targets/CNC/translations/en.json",
    },
    {
        id: "GRBL",
        path: "src/targets/CNC/GRBL/translations/en.json",
    },
]
const cncgrblhalpack = [
    { id: "globals", path: "src/targets/translations/en.json" },
    {
        id: "CNC",
        path: "src/targets/CNC/translations/en.json",
    },
    {
        id: "grblHAL",
        path: "src/targets/CNC/grblHAL/translations/en.json",
    },
]
const printerpack = [
    { id: "globals", path: "src/targets/translations/en.json" },

    {
        id: "printers3D",
        path: "src/targets/Printer3D/translations/en.json",
    },
    {
        id: "Marlin",
        path: "src/targets/Printer3D/Marlin/translations/en.json",
    },
    {
        id: "Marlin-embedded",
        path: "src/targets/Printer3D/Marlin-embedded/translations/en.json",
    },
    {
        id: "Repetier",
        path: "src/targets/Printer3D/Repetier/translations/en.json",
    },
    {
        id: "Smoothieware",
        path: "src/targets/Printer3D/Smoothieware/translations/en.json",
    },
]
const sandtablepack = [
    { id: "globals", path: "src/targets/translations/en.json" },
    {
        id: "SandTable",
        path: "src/targets/SandTable/translations/en.json",
    },
    {
        id: "GRBL",
        path: "src/targets/SandTable/GRBL/translations/en.json",
    },
]

const processList = [
    { targetPath: "cncgrblpack", files: cncgrblpack },
    { targetPath: "cncgrblhalpack", files: cncgrblhalpack },
    { targetPath: "printerpack", files: printerpack },
    { targetPath: "sandtablepack", files: sandtablepack },
]
if (readable) console.log(chalk.green("Processing in readable mode"))
else console.log(chalk.green("Processing in production mode"))
processList.map((element) => {
    let resultfile = {}

    const finalFilePath = path.join(targetPath, element.targetPath)
    console.log(chalk.green("Starting to merge:", element.targetPath))
    element.files.forEach((item) => {
        console.log(chalk.green("Processing:", item.id))
        const sourcepath = path.normalize(__dirname + "/../" + item.path)
        const file = fs.readFileSync(sourcepath, "UTF-8")
        const currentFile = JSON.parse(file.toString())
        Object.keys(currentFile).map((key) => {
            if (!resultfile[key] && typeof currentFile[key] != "undefined") {
                resultfile[key] = currentFile[key]
            } else {
                if (resultfile[key] != currentFile[key]) {
                    console.log(chalk.red("In " + sourcepath))
                    console.log(
                        chalk.red(
                            key,
                            ":" + currentFile[key] + " vs " + resultfile[key]
                        )
                    )
                } else {
                    console.log(
                        chalk.yellow(
                            "Ignoring duplicate: " + key,
                            "=" + currentFile[key]
                        )
                    )
                }
            }
        })
    })
    fs.mkdirSync(finalFilePath, { recursive: true })
    console.log(
        chalk.green("Saving result to :" + path.join(finalFilePath, "en.json"))
    )
    fs.writeFileSync(
        path.join(finalFilePath, "en.json"),
        JSON.stringify(resultfile, "", readable ? " " : ""),
        "UTF-8"
    )
})

console.log(chalk.green("Processing done"))
