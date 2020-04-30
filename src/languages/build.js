const fs = require("fs")
const { Gzipper } = require("gzipper")
const targetDir = "./dist/"
const sourceDir = "./src/languages/"

function deleteFolderRecursive(path) {
    if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
        fs.readdirSync(path).forEach(function(file, index) {
            var curPath = path + "/" + file

            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath)
            } else {
                // delete file
                fs.unlinkSync(curPath)
            }
        })

        console.log(`Deleting directory "${path}"...`)
        fs.rmdirSync(path)
    } else console.log(`No directory "${path}"...`)
}
function build(directory) {
    console.info("Building language packs for " + directory)
    let targetD = targetDir + directory + "/languages/"
    deleteFolderRecursive(targetD)
    fs.readdir(sourceDir, (err, files) => {
        files.forEach(file => {
            if (file.endsWith(".json") && file != "language-list.json") {
                console.log("opening" + sourceDir + file)
                const data = fs.readFileSync(sourceDir + file, "UTF-8")
                const lines = data.split(/\r?\n/)
                if (!fs.existsSync(targetD)) {
                    fs.mkdirSync(targetD)
                }
                var destfile = fs.createWriteStream(targetD + file, {
                    flags: "w+",
                })
                lines.forEach(line => {
                    if (line.indexOf("}") == -1 && line.length > 0) {
                        destfile.write(line.trim() + "\r\n")
                    }
                })
                const source2 = "./src/languages/" + directory + "/" + file
                if (fs.existsSync(source2)) {
                    const data2 = fs.readFileSync(source2, "UTF-8")
                    const lines2 = data2.split(/\r?\n/)
                    let newline = true
                    lines2.forEach(line2 => {
                        if (
                            line2.indexOf("}") == -1 &&
                            line2.indexOf("{") == -1 &&
                            line2.length > 0
                        ) {
                            if (newline) {
                                destfile.write(",")
                                newline = false
                            }
                            destfile.write(line2.trim() + "\r\n")
                        }
                    })
                } else {
                    console.log("No file: " + source2)
                }
                destfile.write("}\r\n")
                destfile.end()
                let gzipper = new Gzipper(targetD + file, targetD, "")
                gzipper
                    .compress()
                    .then(files => console.info("Compressed files: ", files))
                    .catch(err => console.error(err))
            }
        })
    })
}

build("printer")
build("grbl")
