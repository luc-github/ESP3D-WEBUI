const express = require("express")
/*
 * Web Server for development
 * Web Socket server for development
 */

const WebSocket = require("ws")
var currentID = 0
const app = express()
const fileUpload = require("express-fileupload")

const machine = process.env.TARGET_ENV
const targetFW = machine == "grbl" ? "grbl" : "repetier"
app.use(
    express.static("dist"),
    fileUpload({ preserveExtension: true, debug: true })
)

app.get("/command", function(req, res) {
    var url = req.originalUrl
    if (url.indexOf("ESP800") != -1) {
        res.json({
            FWVersion: "3.0.0.a28",
            FWTarget: targetFW,
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
                    V: "NONE",
                    S: "127",
                    H: "ts",
                    M: "0",
                },
                {
                    F: "system",
                    F2: "system",
                    P: "461",
                    T: "B",
                    V: "0",
                    H: "targetfw",
                    O: [
                        { repetier: "5" },
                        { repetier4davinci: "1" },
                        { marlin: "2" },
                        { marlinkimbra: "3" },
                        { smoothieware: "4" },
                        { grbl: "6" },
                        { unknown: "0" },
                    ],
                },
                {
                    F: "system",
                    F2: "system",
                    P: "112",
                    T: "I",
                    V: "115200",
                    H: "baud",
                    O: [
                        { "9600": "9600" },
                        { "19200": "19200" },
                        { "38400": "38400" },
                        { "57600": "57600" },
                        { "74880": "74880" },
                        { "115200": "115200" },
                        { "230400": "230400" },
                        { "250000": "250000" },
                        { "500000": "500000" },
                        { "921600": "921600" },
                    ],
                },
                {
                    F: "system",
                    F2: "system",
                    P: "320",
                    T: "I",
                    V: "10000",
                    H: "bootdelay",
                    S: "40000",
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
    res.json({ custom: "unknown query" })
})

app.post("/files", function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No files were uploaded.")
    }
    let myFile = req.files.myfile
    for (let i = 0; i < myFile.length; i++) {
        myFile[i].mv(__dirname + "/public/" + myFile[i].name, function(err) {
            if (err) return res.status(500).send(err)
        })
    }
    res.send("File uploaded!")
    console.log("POST CATCHED ")
})

app.listen(process.env.PORT || 8080, () =>
    console.log(`Listening on port ${process.env.PORT || 8080}!`)
)

var WebSocketServer = require("ws").Server,
    wss = new WebSocketServer({ port: 81 })

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
