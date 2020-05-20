const express = require("express")
var path = require("path")
const fs = require("fs")
/*
 * Web Server for development
 * Web Socket server for development
 */

const WebSocket = require("ws")
var currentID = 0
const app = express()
const fileUpload = require("express-fileupload")
const machine = "grbl"

let queryInterval = null
let feedrate = 100
let nbAxis = 6

let targetFW = machine

const FSDir = "./public"
var WebSocketServer = require("ws").Server,
    wss = new WebSocketServer({ port: 81 })

app.use(fileUpload({ preserveExtension: true, debug: true }))

/*function SendBinary16(text){
    var buf = new ArrayBuffer(text.length*2);
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=text.length; i<strLen; i++) {
        bufView[i] = text.charCodeAt(i);
    }
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(buf)
        }
    })
}*/

function SendBinary(text) {
    const array = new Uint8Array(text.length)
    for (var i = 0; i < array.length; ++i) {
        array[i] = text.charCodeAt(i)
    }
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(array)
        }
    })
}
let nbqueries = 0

function sendStatus() {
    if (nbqueries > 2) {
        nbqueries = 0
        SendBinary(
            "<Idle|MPos:0.000,0.000,0.000,0.000,0.000,0.000|FS:0,0|WCO:0.000,0.000,0.000,0.000,0.000,0.000>\n"
        )
    } else {
        SendBinary("<Idle|MPos:0.000,0.000,0.000,0.000,0.000,0.000|FS:0,0>\n")
        nbqueries++
    }
}
app.get("/command", function(req, res) {
    var url = req.originalUrl
    console.log(url)
    if (url.indexOf("cmd=%3F") != -1) {
        sendStatus()
        res.send("")
        return
    }
    if (url.indexOf("cmd=%24%24") != -1) {
        SendBinary(
            "$0=3\n" +
                "$1=250\n" +
                "$2=0\n" +
                "$3=0\n" +
                "$4=0\n" +
                "$5=1\n" +
                "$6=0\n" +
                "$10=1\n" +
                "$11=0.010\n" +
                "$12=0.002\n" +
                "$13=0\n" +
                "$20=0\n" +
                "$21=0\n" +
                "$22=0\n" +
                "$23=3\n" +
                "$24=200.000\n" +
                "$25=2000.000\n" +
                "$26=250\n" +
                "$27=1.000\n" +
                "$30=1000.000\n" +
                "$31=0.000\n" +
                "$32=0\n" +
                "$100=100.000\n" +
                "$101=100.000\n" +
                "$102=100.000\n" +
                "$103=100.000\n" +
                "$104=100.000\n" +
                "$105=100.000\n" +
                "$110=1000.000\n" +
                "$111=1000.000\n" +
                "$112=1000.000\n" +
                "$113=1000.000\n" +
                "$114=1000.000\n" +
                "$115=1000.000\n" +
                "$120=200.000\n" +
                "$121=200.000\n" +
                "$122=200.000\n" +
                "$123=200.000\n" +
                "$124=200.000\n" +
                "$125=200.000\n" +
                "$130=300.000\n" +
                "$131=300.000\n" +
                "$132=300.000\n" +
                "$133=300.000\n" +
                "$134=300.000\n" +
                "$135=300.000\n" +
                "ok\n"
        )
        res.send("")
        return
    }

    if (url.indexOf("ESP800") != -1) {
        console.log(targetFW)
        res.json({
            FWVersion: "3.0.0.a28",
            FWTarget: "grbl-embedded",
            SDConnection: "none",
            Authentication: "Disabled",
            WebCommunication: "Synchronous",
            WebSocketIP: "localhost",
            WebSocketport: "81",
            Hostname: "esp3d",
            WiFiMode: "STA",
            WebUpdate: "Enabled",
            Filesystem: "SPIFFS",
            Time: "none",
            NbAxis: nbAxis,
        })
        return
    }

    if (url.indexOf("ESP401") != -1) {
        console.log(url)
        let p1 = url.indexOf("P%3D")
        let p2 = url.indexOf("%20T%3D")
        let p = url.substring(p1 + 4, p2)

        //res.status(500).send("error " + p)
        res.send("ok " + p)
        return
    }

    if (url.indexOf("ESP420") != -1) {
        res.json({
            Status: [
                { id: "chip id", value: "38078" },
                { id: "CPU Freq", value: "240 Mhz" },
                { id: "CPU Temp", value: "50.6 C" },
                { id: "free mem", value: "217.50 KB" },
                { id: "SDK", value: "v3.3.1-61-g367c3c09c" },
                { id: "flash size", value: "4.00 MB" },
                { id: "size for update", value: "1.87 MB" },
                { id: "FS type", value: "SPIFFS" },
                { id: "FS usage", value: "39.95 KB/169.38 KB" },
                { id: "baud", value: "115200" },
                { id: "sleep mode", value: "none" },
                { id: "wifi", value: "ON" },
                { id: "hostname", value: "esp3d" },
                { id: "HTTP port", value: "80" },
                { id: "Telnet port", value: "23" },
                { id: "Ftp ports", value: "21, 20, 55600" },
                { id: "sta", value: "ON" },
                { id: "mac", value: "30:AE:A4:21:BE:94" },
                { id: "SSID", value: "WIFI_OFFICE_B2G" },
                { id: "signal", value: "100 %" },
                { id: "phy mode", value: "11n" },
                { id: "channel", value: "2" },
                { id: "ip mode", value: "dhcp" },
                { id: "ip", value: "192.168.1.43" },
                { id: "gw", value: "192.168.1.1" },
                { id: "msk", value: "255.255.255.0" },
                { id: "DNS", value: "192.168.1.1" },
                { id: "ap", value: "OFF" },
                { id: "mac", value: "30:AE:A4:21:BE:95" },
                { id: "serial", value: "ON" },
                { id: "notification", value: "OFF" },
                { id: "FW ver", value: "3.0.0.a28" },
                { id: "FW arch", value: "ESP32" },
            ],
        })
        return
    }

    if (url.indexOf("ESP410") != -1) {
        res.json({
            AP_LIST: [
                {
                    SSID: "HP-Setup>71-M277 LaserJet",
                    SIGNAL: "92",
                    IS_PROTECTED: "0",
                },
                { SSID: "WIFI_OFFICE_B2G", SIGNAL: "88", IS_PROTECTED: "1" },
                { SSID: "NETGEAR70", SIGNAL: "66", IS_PROTECTED: "1" },
                { SSID: "WIFI_OFFICE_A2G", SIGNAL: "48", IS_PROTECTED: "1" },
                { SSID: "Livebox-EF01", SIGNAL: "20", IS_PROTECTED: "1" },
                { SSID: "orange", SIGNAL: "20", IS_PROTECTED: "0" },
            ],
        })
        return
    }

    if (url.indexOf("ESP400") != -1) {
        res.json({
            Settings: [
                {
                    F: "network",
                    F2: "network",
                    P: "130",
                    T: "S",
                    V: "esp3d",
                    H: "hostname",
                    S: "32",
                    M: "1",
                },
                {
                    F: "network",
                    F2: "network",
                    P: "0",
                    T: "B",
                    V: "1",
                    H: "radio mode",
                    O: [{ none: "0" }, { sta: "1" }, { ap: "2" }],
                },
                {
                    F: "network",
                    F2: "sta",
                    P: "1",
                    T: "S",
                    V: "WIFI_OFFICE_B2G",
                    S: "32",
                    H: "SSID",
                    M: "1",
                },
                {
                    F: "network",
                    F2: "sta",
                    P: "34",
                    T: "S",
                    N: "1",
                    V: "********",
                    S: "64",
                    H: "pwd",
                    M: "8",
                },
                {
                    F: "network",
                    F2: "sta",
                    P: "99",
                    T: "B",
                    V: "1",
                    H: "ip mode",
                    O: [{ dhcp: "1" }, { static: "0" }],
                },
                {
                    F: "network",
                    F2: "sta",
                    P: "100",
                    T: "A",
                    V: "192.168.0.1",
                    H: "ip",
                },
                {
                    F: "network",
                    F2: "sta",
                    P: "108",
                    T: "A",
                    V: "192.168.0.1",
                    H: "gw",
                },
                {
                    F: "network",
                    F2: "sta",
                    P: "104",
                    T: "A",
                    V: "255.255.255.0",
                    H: "msk",
                },
                {
                    F: "network",
                    F2: "ap",
                    P: "218",
                    T: "S",
                    V: "ESP3D",
                    S: "32",
                    H: "SSID",
                    M: "1",
                },
                {
                    F: "network",
                    F2: "ap",
                    P: "251",
                    T: "S",
                    N: "1",
                    V: "********",
                    S: "64",
                    H: "pwd",
                    M: "8",
                },
                {
                    F: "network",
                    F2: "ap",
                    P: "316",
                    T: "A",
                    V: "192.168.0.1",
                    H: "ip",
                },
                {
                    F: "network",
                    F2: "ap",
                    P: "118",
                    T: "B",
                    V: "11",
                    H: "channel",
                    O: [
                        { "1": "1" },
                        { "2": "2" },
                        { "3": "3" },
                        { "4": "4" },
                        { "5": "5" },
                        { "6": "6" },
                        { "7": "7" },
                        { "8": "8" },
                        { "9": "9" },
                        { "10": "10" },
                        { "11": "11" },
                        { "12": "12" },
                        { "13": "13" },
                        { "14": "14" },
                    ],
                },
                {
                    F: "service",
                    F2: "http",
                    P: "328",
                    T: "B",
                    V: "1",
                    H: "enable",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service",
                    F2: "http",
                    P: "121",
                    T: "I",
                    V: "80",
                    H: "port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service",
                    F2: "telnetp",
                    P: "329",
                    T: "B",
                    V: "1",
                    H: "enable",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service",
                    F2: "telnetp",
                    P: "125",
                    T: "I",
                    V: "23",
                    H: "port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service",
                    F2: "ftp",
                    P: "1021",
                    T: "B",
                    V: "1",
                    H: "enable",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service",
                    F2: "ftp",
                    P: "1009",
                    T: "I",
                    V: "21",
                    H: "control port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service",
                    F2: "ftp",
                    P: "1013",
                    T: "I",
                    V: "20",
                    H: "active port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service",
                    F2: "ftp",
                    P: "1017",
                    T: "I",
                    V: "55600",
                    H: "passive port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service",
                    F2: "notification",
                    P: "1004",
                    T: "B",
                    V: "1",
                    H: "auto notif",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service",
                    F2: "notification",
                    P: "116",
                    T: "B",
                    V: "0",
                    H: "notification",
                    O: [
                        { none: "0" },
                        { pushover: "1" },
                        { email: "2" },
                        { line: "3" },
                    ],
                },
                {
                    F: "service",
                    F2: "notification",
                    P: "332",
                    T: "S",
                    V: "********",
                    S: "63",
                    H: "t1",
                    M: "0",
                },
                {
                    F: "service",
                    F2: "notification",
                    P: "396",
                    T: "S",
                    V: "********",
                    S: "63",
                    H: "t2",
                    M: "0",
                },
                {
                    F: "service",
                    F2: "notification",
                    P: "855",
                    T: "S",
                    V: " ",
                    S: "127",
                    H: "ts",
                    M: "0",
                },
                {
                    F: "system",
                    F2: "system",
                    P: "129",
                    T: "F",
                    V: "255",
                    H: "outputmsg",
                    O: [{ M117: "16" }, { serial: "1" }, { telnet: "2" }],
                },
            ],
        })
        return
    }
    SendBinary("ok\n")
    res.json({ custom: "unknown query" })
})

function fileSizeString(size) {
    let s
    if (size < 1024) return size + " B"
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB"
    if (size < 1024 * 1024 * 1024)
        return (size / (1024 * 1024)).toFixed(2) + " MB"
    if (size < 1024 * 1024 * 1024 * 1024)
        return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB"
    return "X B"
}

function filesList(mypath) {
    let res = '{"files":['
    let totalused = getTotalSize(__dirname + "/public")
    let total = 1.31 * 1024 * 1024
    fs.readdirSync(__dirname + "/public" + mypath).forEach(fileelement => {
        let fst = fs.statSync(__dirname + "/public" + mypath + fileelement)
        let fsize = -1

        if (fst.isFile()) {
            fsize = fileSizeString(fst.size)
        }
        res += '{"name":"' + fileelement + '","size":"' + fsize + '"}'
    })
    res +=
        '],"path":"' +
        mypath +
        '","occupation":"' +
        (totalused / total).toFixed(0) +
        '","status":"ok","total":"' +
        fileSizeString(total) +
        '","used":"' +
        fileSizeString(totalused) +
        '"}'
    return res
}

const getAllFiles = function(dirPath, arrayOfFiles) {
    let files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            arrayOfFiles.push(dirPath + "/" + file)
        }
    })

    return arrayOfFiles
}

const getTotalSize = function(directoryPath) {
    const arrayOfFiles = getAllFiles(directoryPath)

    let totalSize = 0

    arrayOfFiles.forEach(function(filePath) {
        totalSize += fs.statSync(filePath).size
    })

    return totalSize
}

app.all("/files", function(req, res) {
    let mypath = req.query.path
    if (typeof mypath == "undefined") mypath = "/"
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.send(filesList(mypath))
    }
    let myFile = req.files.myfile

    if (typeof myFile.length == "undefined") {
        console.log("one files")
        myFile.mv(__dirname + "/public" + mypath + myFile.name, function(err) {
            if (err) return res.status(500).send(err)
        })
    } else {
        console.log(myFile.length + " files")
        for (let i = 0; i < myFile.length; i++) {
            myFile[i].mv(__dirname + "/public/" + myFile[i].name, function(
                err
            ) {
                if (err) return res.status(500).send(err)
            })
        }
    }
    res.send(filesList(mypath))
})

app.listen(process.env.PORT || 8080, () =>
    console.log(`Listening on port ${process.env.PORT || 8080}!`)
)

wss.on("connection", function(ws) {
    console.log("New connection")
    ws.send(`currentID:${currentID}`)
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(`activeID:${currentID}`)
        }
    })
    currentID++
    ws.on("message", function(message) {
        //console.log("received: %s", message)
    })
})
