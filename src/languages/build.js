const fs = require("fs")
const { Gzipper } = require("gzipper")
const targetDir = "./dist/languages"
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
function build() {
    console.info("Building language packs")
    deleteFolderRecursive(targetDir)
    fs.readdir(sourceDir, (err, files) => {
        files.forEach(file => {
            if (file.endsWith(".json")) {
                let gzipper = new Gzipper(sourceDir + file, targetDir, "")
                gzipper
                    .compress()
                    .then(files => console.info("Compressed files: ", files))
                    .catch(err => console.error(err))
                // console.log(file);
            }
        })
    })
}

build()
