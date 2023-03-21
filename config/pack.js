/*
 package.js - ESP3D WebUI package file

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
const { Compress } = require("gzipper")
const minify = require("html-minifier").minify
const { exit } = require("process")
console.log(chalk.cyan("Running Package 1.0"))
//Sanity check for command line
const arg = process.argv[process.argv.length > 1 ? 2 : 0]
if (process.argv.length < 3 || !arg.startsWith("target=")) {
    console.log(
        chalk.red(
            "Error!\nSyntax: npm run package target=<relative path to file>"
        )
    )
    exit(0)
}
//Sanity check for file creation
const sourcepath = path.normalize(
    __dirname + "/../" + arg.replace("target=", "")
)
console.log("Checking ", sourcepath)
const sourcedir = path.dirname(sourcepath)
if (!fs.existsSync(sourcepath)) {
    console.log(chalk.red("Error!\nCannot find file"))
    exit(0)
}
//Start minify
console.log(chalk.green("Processing"))
const source = fs.readFileSync(sourcepath, "UTF-8")
const result = minify(source, {
    removeComments: true,
    collapseWhitespace: true,
    minifyJS: true,
    minifyCSS: true,
})
const minifiedFile = sourcepath + ".minified.html"
fs.writeFileSync(minifiedFile, result)
//Compress minified file
const compressedDir = sourcepath
console.log(
    chalk.blue(
        "Minify: " + source.length + " Bytes => ",
        result.length,
        "Bytes"
    )
)
//it seems it is ok for css but json is not really minimified
//space are still present => Need to fix that
let gzipper = new Compress(minifiedFile, sourcedir, { verbose: true })
gzipper
    .run()
    .then((files) => {
        //remove temp minified file
        fs.unlinkSync(minifiedFile)
        //rename compressed file to match original filename
        fs.renameSync(minifiedFile + ".gz", sourcepath + ".gz")
        const finalSize = fs.lstatSync(sourcepath + ".gz").size
        //Show report
        console.log(
            chalk.green(
                "\n\nMinify + Compression: ",
                source.length,
                "Bytes =>",
                finalSize,
                "Bytes = compression ",
                (100 - 100 * (finalSize / source.length)).toFixed(2),
                "%\n"
            )
        )
    })
    .catch((err) => console.error(err))
