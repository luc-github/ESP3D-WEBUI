const express = require("express")
const expressStaticGzip = require("express-static-gzip")
const chalk = require("chalk")
let path = require("path")
const fs = require("fs")
const port = 8080
/*
 * Web Server for development
 * Web Socket server for development
 */
const wscolor = chalk.cyan
const expresscolor = chalk.green
const commandcolor = chalk.white
const WebSocket = require("ws")
let currentID = 0
const app = express()
const fileUpload = require("express-fileupload")
let sensorInterval = 0

//const serverpath = path.normalize(__dirname + "/../server/public/");

const subtarget = process.env.SUBTARGET_ENV
    ? process.env.SUBTARGET_ENV
    : "Marlin"
const target = process.env.TARGET_ENV ? process.env.TARGET_ENV : "Printer3D"

const serverpath =
    path.normalize(__dirname + "/../server/" + target + "/" + subtarget) + "/"
if (!fs.existsSync(serverpath + "Flash")) {
    fs.mkdirSync(serverpath + "Flash", { recursive: true })
}
if (!fs.existsSync(serverpath + "SD")) {
    fs.mkdirSync(serverpath + "SD", { recursive: true })
}

const {
    commandsQuery,
    configURI,
    getLastconnection,
    hasEnabledAuthentication,
} = require(path.normalize(
    __dirname + "/targets/" + target + "/" + subtarget + "/index.js"
))

const WebSocketServer = require("ws").Server,
    wss = new WebSocketServer({ port: 81 })
app.use("/", express.static(serverpath + "Flash"))
app.use("/sd", express.static(serverpath + "sd"))
app.use("/", expressStaticGzip(serverpath + "Flash"))
app.use(fileUpload({ preserveExtension: true, debug: false }))

app.listen(port, () => console.log("Env:", subtarget, ":", target))
app.timeout = 2000

//app.use(express.urlencoded({ extended: false }));

function SendWS(text, isbinary = true, isNotification = true) {
    if (typeof isbinary === "undefined") isbinary = true
    if (isbinary) {
        const array = new Uint8Array(text.length)
        for (let i = 0; i < array.length; ++i) {
            array[i] = text.charCodeAt(i)
        }
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(array)
            }
        })
    } else {
        const notif = (isNotification ? "NOTIFICATION:" : "") + text
        console.log(wscolor("[ws] send:", notif))
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(notif)
            }
        })
    }
}

app.post("/login", function (req, res) {
    loginURI(req, res)
})

app.get("/config", function (req, res) {
    configURI(req, res)
})

app.get("/command", function (req, res) {
    commandsQuery(req, res, SendWS)
})

/*app.get("/sdfiles", function (req, res) {
  res.status(200);
  res.send(
    '{"files":[{"name":"LOST.DIR","shortname":"LOST.DIR","size":"-1"},{"name":".android_secure","shortname":"ANDROI~1","size":"-1"},{"name":"app","shortname":"APP","size":"-1"},{"name":"framework","shortname":"FRAMEW~1","size":"-1"},{"name":"lib","shortname":"LIB","size":"-1"},{"name":"permissions","shortname":"PERMIS~1","size":"-1"},{"name":".Trash-1000","shortname":"TRASH-~1","size":"-1"},{"name":".FileExpert","shortname":"FILEEX~1","size":"-1"},{"name":"download","shortname":"DOWNLOAD","size":"-1"},{"name":"Android","shortname":"ANDROID","size":"-1"},{"name":".mmsyscache","shortname":"MMSYSC~1","size":"-1"},{"name":"clockworkmod","shortname":"CLOCKW~1","size":"-1"},{"name":"Evernote","shortname":"EVERNOTE","size":"-1"},{"name":"data","shortname":"DATA","size":"-1"},{"name":".estrongs","shortname":"ESTRON~1","size":"-1"},{"name":"DCIM","shortname":"DCIM","size":"-1"},{"name":"backups","shortname":"BACKUPS","size":"-1"},{"name":".zdworks","shortname":"ZDWORK~1","size":"-1"},{"name":"toolbox-stericson","shortname":"TOOLBO~1","size":"75.54 KB"},{"name":"SystemROMToolbox","shortname":"SYSTEM~1","size":"-1"},{"name":"busybox-stericson","shortname":"BUSYBO~1","size":"843.20 KB"},{"name":"recovery.img","shortname":"RECOVERY.IMG","size":"6.00 MB"},{"name":"preloader.img","shortname":"PRELOA~1.IMG","size":"128.00 KB"},{"name":"nvram.img","shortname":"NVRAM.IMG","size":"3.00 MB"},{"name":"seccnfg.img","shortname":"SECCNFG.IMG","size":"128.00 KB"},{"name":"uboot.img","shortname":"UBOOT.IMG","size":"384.00 KB"},{"name":"boot.img","shortname":"BOOT.IMG","size":"6.00 MB"},{"name":"secstatic.img","shortname":"SECSTA~1.IMG","size":"1.12 MB"},{"name":"system.img","shortname":"SYSTEM.IMG","size":"170.00 MB"},{"name":"misc.img","shortname":"MISC.IMG","size":"384.00 KB"},{"name":"cache.img","shortname":"CACHE.IMG","size":"60.00 MB"},{"name":"logo.img","shortname":"LOGO.IMG","size":"3.00 MB"},{"name":"expdb.img","shortname":"EXPDB.IMG","size":"640.00 KB"},{"name":"userdata.img","shortname":"USERDATA.IMG","size":"261.25 MB"},{"name":"recovery2.img","shortname":"RECOVE~1.IMG","size":"6.00 MB"},{"name":"touchrec.img","shortname":"TOUCHREC.IMG","size":"4.00 MB"},{"name":"restart.gcode","shortname":"RESTAR~1.GCO","size":"1 B"},{"name":"M3.G","shortname":"M3.G","size":"75 B"},{"name":"WeChat Image_20210108102318.jpg","shortname":"WECHAT~1.JPG","size":"876.47 KB"},{"name":"test.txt","shortname":"test.txt","size":"0 B"},{"name":"foo.txt","shortname":"foo.txt","size":"13 B"},{"name":"myfile.txt","shortname":"myfile.txt","size":"0 B"},{"name":"update.zip","shortname":"update.zip","size":"1.29 MB"},{"name":"luc","shortname":"luc","size":"-1"}],"path":"/","occupation":"22","status":"ok","total":"3.67 GB","used":"833.38 MB"}'
  );
  console.log(commandcolor(`[server]/sdfiles)`));
  return;
});*/

function fileSizeString(size) {
    if (size === -1) return ""
    const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    let i = 0
    while (size >= 1024) {
        size /= 1024
        ++i
    }
    return `${size.toFixed(2)} ${units[i]}`
}

function filesList(mypath, destination) {
    const currentPath = path.normalize(serverpath + destination + mypath)
    console.log("[path]" + currentPath)
    const totalUsed = getTotalSize(serverpath + destination)
    const total = (destination == "SD" ? 4096 : 1.31) * 1024 * 1024
    const occupation = ((100 * totalUsed) / total).toFixed(0)

    const files = fs.readdirSync(currentPath).map((file) => {
        const fullpath = path.normalize(currentPath + "/" + file)
        const fst = fs.statSync(fullpath)
        const fsize = fst.isFile() ? fileSizeString(fst.size) : "-1"
        return { name: file, size: fsize }
    })

    const response = {
        files,
        path: mypath,
        occupation,
        status: "ok",
        total: fileSizeString(total),
        used: fileSizeString(totalUsed),
    }

    return JSON.stringify(response)
}

const getAllFiles = function (dirPath, arrayOfFiles = []) {
    let files = fs.readdirSync(dirPath) || []
    const newFiles = files.reduce((acc, file) => {
        const fullpath = dirPath + "/" + file
        return fs.statSync(fullpath).isDirectory()
            ? getAllFiles(fullpath, acc)
            : [...acc, fullpath]
    }, [])
    return [...arrayOfFiles, ...newFiles]
}

const getTotalSize = function (directoryPath) {
    const allFiles = getAllFiles(directoryPath)
    console.log("allFiles", allFiles)
    return allFiles.reduce(
        (acc, currFile) => acc + fs.statSync(currFile).size,
        0
    )
}

function deleteFolderRecursive(path) {
    if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
        fs.readdirSync(path).forEach(function (file, index) {
            let curPath = path + "/" + file

            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath)
            } else {
                // delete file
                fs.unlinkSync(curPath)
            }
        })

        console.log(`[server]Deleting directory "${path}"...`)
        if (fs.existsSync(path)) fs.rmdirSync(path)
    } else console.log(`[server]No directory "${path}"...`)
}

app.all("/updatefw", function (req, res) {
    res.send("ok")
})

app.all("/files", function (req, res) {
    let mypath = req.query.path
    let url = req.originalUrl
    let filepath = path.normalize(
        serverpath + "Flash" + mypath + "/" + req.query.filename
    )
    if (url.indexOf("action=deletedir") != -1) {
        console.log("[server]delete directory " + filepath)
        deleteFolderRecursive(filepath)
        fs.readdirSync(mypath)
    } else if (url.indexOf("action=delete") != -1) {
        console.log("[server]delete file " + filepath)
        fs.unlinkSync(filepath)
    }
    if (url.indexOf("action=createdir") != -1) {
        fs.mkdirSync(filepath)
        console.log("[server]new directory " + filepath)
    }
    if (typeof mypath == "undefined") {
        if (typeof req.body.path == "undefined") {
            console.log("[server]path is not defined")
            mypath = "/"
        } else {
            mypath = (req.body.path == "/" ? "" : req.body.path) + "/"
        }
    }
    console.log("[server]path is " + mypath)
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.send(filesList(mypath, "Flash"))
    }
    let myFile = req.files.myfiles
    if (typeof myFile.length == "undefined") {
        let fullpath = path.normalize(
            serverpath + "Flash" + mypath + myFile.name
        )
        console.log("[server]one file:" + fullpath)
        myFile.mv(fullpath, function (err) {
            if (err) return res.status(500).send(err)
            res.send(filesList(mypath, "Flash"))
        })
        return
    } else {
        console.log(myFile.length + " files")
        for (let i = 0; i < myFile.length; i++) {
            let fullpath = path.normalize(
                serverpath + "Flash" + mypath + myFile[i].name
            )
            console.log(fullpath)
            myFile[i].mv(fullpath).then(() => {
                if (i == myFile.length - 1) res.send(filesList(mypath, "Flash"))
            })
        }
    }
})

app.all("/sdfiles", function (req, res) {
    let mypath = req.query.path
    let url = req.originalUrl
    let filepath = path.normalize(
        serverpath + "SD" + mypath + "/" + req.query.filename
    )
    if (url.indexOf("action=deletedir") != -1) {
        console.log("[server]delete directory " + filepath)
        deleteFolderRecursive(filepath)
        fs.readdirSync(mypath)
    } else if (url.indexOf("action=delete") != -1) {
        fs.unlinkSync(filepath)
        console.log("[server]delete file " + filepath)
    }
    if (url.indexOf("action=createdir") != -1) {
        fs.mkdirSync(filepath)
        console.log("[server]new directory " + filepath)
    }
    if (typeof mypath == "undefined") {
        if (typeof req.body.path == "undefined") {
            console.log("[server]path is not defined")
            mypath = "/"
        } else {
            mypath = (req.body.path == "/" ? "" : req.body.path) + "/"
        }
    }
    console.log("[server]path is " + mypath)
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.send(filesList(mypath, "SD"))
    }
    let myFile = req.files.myfiles
    if (typeof myFile.length == "undefined") {
        let fullpath = path.normalize(serverpath + "SD" + mypath + myFile.name)
        console.log("[server]one file:" + fullpath)
        myFile.mv(fullpath, function (err) {
            if (err) return res.status(500).send(err)
            res.send(filesList(mypath, "SD"))
        })
        return
    } else {
        console.log(myFile.length + " files")
        for (let i = 0; i < myFile.length; i++) {
            let fullpath = path.normalize(
                serverpath + "SD" + mypath + myFile[i].name
            )
            console.log(fullpath)
            myFile[i].mv(fullpath).then(() => {
                if (i == myFile.length - 1) res.send(filesList(mypath, "SD"))
            })
        }
    }
})

wss.on("connection", (socket, request) => {
    console.log(wscolor("[ws] New connection"))
    console.log(wscolor(`[ws] currentID:${currentID}`))
    socket.send(`currentID:${currentID}`)
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(`activeID:${currentID}`)
        }
    })
    clearInterval(sensorInterval)
    sensorInterval = setInterval(() => {
        const sensorTxt = "SENSOR:10[C] 15[%]"
        SendWS(sensorTxt, false, false)
    }, 3000)
    currentID++
    socket.on("message", (message) => {
        console.log(wscolor("[ws] received:", message))
        if (hasEnabledAuthentication() && message.startsWith("PING:")) {
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    let t = hasEnableAuthentication()
                        ? sessiontTime - (Date.now() - getLastconnection())
                        : 60000
                    let remainingtime = t < 0 ? 0 : t
                    console.log("remain:", remainingtime, "millisec")
                    client.send(`PING:${remainingtime}:60000`)
                }
            })
        }
    })
})
wss.on("error", (error) => {
    console.log(wscolor("[ws] Error:", error))
})
