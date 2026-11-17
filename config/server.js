const express = require("express")
const expressStaticGzip = require("express-static-gzip")
const chalk = require("chalk")
let path = require("path")
const fs = require("fs")
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080
/*
 * Web Server for development
 * Web Socket server for development
 */
const wscolor = chalk.cyan
const expresscolor = chalk.green
const commandcolor = chalk.white
const WebSocket = require("ws")
let currentID = 0
//firmware session timeout when authentication is enabled (PING keep-alive)
const sessionTime = 60000
const app = express()
const fileUpload = require("express-fileupload")
let sensorInterval = -1

//const serverpath = path.normalize(__dirname + "/../server/public/");

const subtarget = process.env.SUBTARGET_ENV
    ? process.env.SUBTARGET_ENV
    : "Marlin"
const target = process.env.TARGET_ENV ? process.env.TARGET_ENV : "Printer3D"

const MOCK_VERBOSE = process.env.MOCK_VERBOSE === "1"
const serverpath =
    path.normalize(__dirname + "/../server/" + target + "/" + subtarget) + "/"
if (!fs.existsSync(serverpath + "Flash")) {
    fs.mkdirSync(serverpath + "Flash", { recursive: true })
}
if (!fs.existsSync(serverpath + "SD")) {
    fs.mkdirSync(serverpath + "SD", { recursive: true })
}

//normalize the WEBROOT override (dev launcher root= arg) before targets
//read it for their ESP800 HostPath; reject Git Bash-mangled Windows paths
if (process.env.WEBROOT) {
    if (/^[A-Za-z]:[\\/]/.test(process.env.WEBROOT)) {
        console.log(
            `[server] Invalid WEBROOT "${process.env.WEBROOT}" - in Git Bash use //www instead of /www, or use PowerShell`
        )
        process.exit(1)
    }
    let w = process.env.WEBROOT
    if (!w.startsWith("/")) w = "/" + w
    process.env.WEBROOT = w.replace(/\/+$/, "") || "/"
}

const {
    commandsQuery,
    configURI,
    getLastconnection,
    hasEnabledAuthentication,
    loginURI,
    startAutoReport,
    webRoot: targetWebRoot = "",
} = require(
    path.normalize(
        __dirname + "/targets/" + target + "/" + subtarget + "/index.js"
    )
)

//optional: the firmware roots its /files query API and default document
//at a web subdir (e.g. grblHAL HostPath "/www"), while static URLs and
//uploads use absolute FS paths - see docs/hostpath_files_api.md.
//Exported by the target config, overridable via WEBROOT (normalized above)
const webRoot = process.env.WEBROOT || targetWebRoot
//a root= override on a target without prepared fixtures should still work:
//create the web root directory (empty listing) instead of crashing
const filesRootDir = path.join(serverpath + "Flash", "." + webRoot)
if (!fs.existsSync(filesRootDir)) fs.mkdirSync(filesRootDir, { recursive: true })

const WebSocketServer = require("ws").Server,
    wss = new WebSocketServer({ port: 8089 })

// Like the firmware: if client asks for toto.html (or /), serve toto.html.br
// (only when the browser advertises br, i.e. over HTTPS) or toto.html.gz
app.use("/", (req, res, next) => {
    if (req.method !== "GET" || /\.(gz|br)$/.test(req.path)) return next()
    const relPath = !req.path || req.path === "/" ? "index.html" : req.path
    const base = path.join(serverpath, "Flash", relPath)
    const isFile = (p) => fs.existsSync(p) && fs.statSync(p).isFile()
    const acceptsBr = /\bbr\b/.test(req.headers["accept-encoding"] || "")
    let file, encoding
    if (acceptsBr && isFile(base + ".br")) {
        file = base + ".br"
        encoding = "br"
    } else if (isFile(base + ".gz")) {
        file = base + ".gz"
        encoding = "gzip"
    } else if (webRoot && !relPath.startsWith(webRoot + "/")) {
        //grblHAL-style targets: the default document lives under the web
        //root (e.g. / -> /www/index.html), like the real firmware
        const baseWeb = path.join(serverpath, "Flash", webRoot, relPath)
        if (acceptsBr && isFile(baseWeb + ".br")) {
            file = baseWeb + ".br"
            encoding = "br"
        } else if (isFile(baseWeb + ".gz")) {
            file = baseWeb + ".gz"
            encoding = "gzip"
        } else return next()
    } else return next()
    const ext = path.extname(relPath)
    const types = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".json": "application/json" }
    if (types[ext]) res.setHeader("Content-Type", types[ext])
    res.setHeader("Content-Encoding", encoding)
    res.setHeader("Vary", "Accept-Encoding")
    console.log(expresscolor(`[server] ${relPath} -> ${path.basename(file)} (Accept-Encoding: ${req.headers["accept-encoding"] || "none"})`))
    res.sendFile(path.resolve(file))
})

app.use("/", express.static(serverpath + "Flash"))
app.use("/sd", express.static(serverpath + "sd"))
app.use("/", expressStaticGzip(serverpath + "Flash"))
app.use(fileUpload({ preserveExtension: true, debug: false }))

app.listen(port, () =>
    console.log(
        "Env:",
        subtarget,
        ":",
        target,
        webRoot ? "webRoot:" + webRoot : "",
        process.env.AUTH === "1" ? "auth:admin/admin" : ""
    )
)
app.timeout = 2000

//some targets (e.g. grblHAL) push periodic status reports like the real firmware
if (typeof startAutoReport === "function") startAutoReport(SendWS)

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

//server-level mirror of the target login state: loginURI answers 200 on
//success, 401 on failure/logout - track it so non-target endpoints
//(/files, /sdfiles, /updatefw) can enforce authentication too
let mockLoggedIn = false
app.post("/login", function (req, res) {
    loginURI(req, res)
    mockLoggedIn = res.statusCode == 200
})

function checkAuthentication(req, res) {
    if (hasEnabledAuthentication() && !mockLoggedIn) {
        res.status(401).send("Authentication required")
        return false
    }
    return true
}

app.get("/config", function (req, res) {
    if (!checkAuthentication(req, res)) return
    configURI(req, res)
})

const mockContext = {
    getSDList: (p) => getFileListArray(p || "/", "SD"),
    getFlashList: (p) => getFileListArray(p || "/", "Flash"),
}

app.get("/command", function (req, res) {
    if (!checkAuthentication(req, res)) return
    const url = req.query.cmd != null ? req.query.cmd : req.originalUrl
    if (MOCK_VERBOSE) console.log(commandcolor(`[server]/command ${url}`))
    commandsQuery(req, res, SendWS, mockContext)
    if (!res.headersSent) {
        //a handler that set a non-200 status without a body still ends
        //with that status - never mask it as "unknown command"
        if (res.statusCode !== 200) return res.end()
        if (MOCK_VERBOSE) console.log(commandcolor(`[server]/command unknown: ${url}`))
        res.status(200).send("error:unknown command\n")
    }
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

function getFileListArray(mypath, destination) {
    const currentPath = path.normalize(serverpath + destination + (mypath || "/"))
    if (!fs.existsSync(currentPath)) return []
    return fs.readdirSync(currentPath).map((file) => {
        const fullpath = path.normalize(currentPath + "/" + file)
        const fst = fs.statSync(fullpath)
        const fsize = fst.isFile() ? fileSizeString(fst.size) : "-1"
        return { name: file, size: fsize }
    })
}

function filesList(mypath, destination, useWebRoot) {
    const baseDir = path.join(
        serverpath + destination,
        useWebRoot ? "." + webRoot : "."
    )
    const currentPath = path.normalize(baseDir + mypath)
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
        const fullpath = path.join(dirPath, file)
        return fs.statSync(fullpath).isDirectory()
            ? getAllFiles(fullpath, acc)
            : [...acc, fullpath]
    }, [])
    return [...arrayOfFiles, ...newFiles]
}

const getTotalSize = function (directoryPath) {
    const allFiles = getAllFiles(directoryPath)
    if (MOCK_VERBOSE) console.log("allFiles", allFiles)
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
    if (!checkAuthentication(req, res)) return
    res.send("ok")
})

app.all("/files", function (req, res) {
    if (!checkAuthentication(req, res)) return
    let mypath = req.query.path
    let url = req.originalUrl
    //Two path conventions, like the real firmware (docs/hostpath_files_api.md):
    //- query-driven actions (list/delete/createdir) use paths relative to
    //  the web root (HostPath, e.g. "/www" on grblHAL): "/files?path=/"
    //  lists the CONTENT of /www - the user never sees "/www", the panel
    //  root IS the host path content
    //- uploads and direct downloads use absolute FS paths ("/www/themes/...")
    const filesBase = path.join(serverpath + "Flash", "." + webRoot)
    let filepath = path.normalize(
        filesBase + (mypath || "/") + "/" + req.query.filename
    )
    if (url.indexOf("action=deletedir") != -1) {
        console.log("[server]delete directory " + filepath)
        deleteFolderRecursive(filepath)
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
    //uploads report their directory as an absolute FS path ("/www/themes/") -
    //bring it back to a web-root-relative path for the listing response
    const listPath =
        webRoot && mypath.startsWith(webRoot + "/")
            ? mypath.substring(webRoot.length)
            : mypath
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.send(filesList(listPath, "Flash", true))
    }
    let myFile = req.files.myfiles
    //the WebUI sends the multipart filename as the absolute FS path
    //(upload path + file name, e.g. "/www/themes/pack.gz") - use it as-is
    //when absolute, fall back to the (web-root-relative) upload directory
    //otherwise
    const toAbsolute = (name) =>
        name && name.startsWith("/")
            ? path.normalize(serverpath + "Flash" + name)
            : path.normalize(filesBase + listPath + name)
    if (typeof myFile.length == "undefined") {
        let fullpath = toAbsolute(myFile.name)
        console.log("[server]one file:" + fullpath)
        myFile.mv(fullpath, function (err) {
            if (err) return res.status(500).send(err)
            res.send(filesList(listPath, "Flash", true))
        })
        return
    } else {
        console.log(myFile.length + " files")
        for (let i = 0; i < myFile.length; i++) {
            let fullpath = toAbsolute(myFile[i].name)
            console.log(fullpath)
            myFile[i].mv(fullpath).then(() => {
                if (i == myFile.length - 1)
                    res.send(filesList(listPath, "Flash", true))
            })
        }
    }
})

app.all("/sdfiles", function (req, res) {
    if (!checkAuthentication(req, res)) return
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
    if (sensorInterval != -1) {
        clearInterval(sensorInterval)
        sensorInterval = setInterval(() => {
            const sensorTxt = "SENSOR:10[C] 15[%]"
            SendWS(sensorTxt, false, false)
        }, 3000)
    }
    currentID++
    socket.on("message", (message) => {
        if (MOCK_VERBOSE) console.log(wscolor("[ws] received:", message.toString()))
        else console.log(wscolor("[ws] received:", message))
        if (hasEnabledAuthentication() && message.startsWith("PING:")) {
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    //PING IS the session keep-alive: it refreshes the
                    //session, so the reply reports the full window
                    client.send(`PING:${sessionTime}:${sessionTime}`)
                }
            })
        }
    })
})
wss.on("error", (error) => {
    console.log(wscolor("[ws] Error:", error))
})
