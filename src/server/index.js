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
            FWVersion: "3.0.0.a27",
            FWTarget: targetFW,
            SDConnection: "None",
            Authentication: "Disabled",
            WebCommunication: "Synchronous",
            WebSocketIP: "localhost",
            WebSocketport: "81",
            Hostname: "esp3d",
            WiFiMode: "STA",
            WebUpdate: "Enabled",
            Filesystem: "SPIFFS",
            Time: "None",
        })
        return
    }
    if (url.indexOf("ESP420") != -1) {
        res.json({
            Status: [
                { id: "Chip ID", value: "38078" },
                { id: "CPU Frequency", value: "240 Mhz" },
                { id: "CPU Temperature", value: "49.4 &deg;C" },
                { id: "Free memory", value: "216.44 KB" },
                { id: "SDK", value: "v3.3.1-61-g367c3c09c" },
                { id: "Flash Size", value: "4.00 MB" },
                { id: "Available Size for update", value: "1.87 MB" },
                { id: "Filesystem type", value: "SPIFFS" },
                { id: "Filesystem usage", value: "33.83 KB/169.38 KB" },
                { id: "Baud rate", value: "115200" },
                { id: "Sleep mode", value: "None" },
                { id: "WiFi", value: "Enabled" },
                { id: "Hostname", value: "esp3d" },
                { id: "HTTP port", value: "80" },
                { id: "Telnet port", value: "23" },
                {
                    id: "Ftp ports (ctrl, active, passive)",
                    value: "21, 20, 55600",
                },
                { id: "Current WiFi Mode", value: "STA (30:AE:A4:21:BE:94)" },
                { id: "Connected to", value: "WIFI_OFFICE_B2G" },
                { id: "Signal", value: "98 %" },
                { id: "Phy Mode", value: "11n" },
                { id: "Channel", value: "2" },
                { id: "IP Mode", value: "DHCP" },
                { id: "IP", value: "192.168.1.43" },
                { id: "Gateway", value: "192.168.1.1" },
                { id: "Mask", value: "255.255.255.0" },
                { id: "DNS", value: "192.168.1.1" },
                { id: "Disabled Mode", value: "AP (30:AE:A4:21:BE:95)" },
                { id: "Serial communication", value: "Enabled" },
                { id: "Notification", value: "Disabled" },
                { id: "Debug", value: "Serial" },
                { id: "FW version", value: "3.0.0.a27" },
                { id: "FW architecture", value: "ESP32" },
            ],
        })
        return
    }
    if (url.indexOf("ESP400") != -1) {
        res.json({
            Settings: [
                {
                    F: "printer",
                    P: "112",
                    T: "I",
                    V: "115200",
                    H: "Baud Rate",
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
                    F: "network",
                    P: "130",
                    T: "S",
                    V: "esp3d",
                    H: "Hostname",
                    S: "32",
                    M: "1",
                },
                {
                    F: "network",
                    P: "0",
                    T: "B",
                    V: "1",
                    H: "Radio mode",
                    O: [{ None: "0" }, { STA: "1" }, { AP: "2" }],
                },
                {
                    F: "network",
                    P: "1",
                    T: "S",
                    V: "WIFI_OFFICE_B2G",
                    S: "32",
                    H: "Station SSID",
                    M: "1",
                },
                {
                    F: "network",
                    P: "34",
                    T: "S",
                    V: "********",
                    S: "64",
                    H: "Station Password",
                    M: "8",
                },
                {
                    F: "network",
                    P: "99",
                    T: "B",
                    V: "1",
                    H: "Station IP Mode",
                    O: [{ DHCP: "0" }, { Static: "1" }],
                },
                {
                    F: "network",
                    P: "100",
                    T: "A",
                    V: "192.168.0.1",
                    H: "Station Static IP",
                },
                {
                    F: "network",
                    P: "108",
                    T: "A",
                    V: "192.168.0.1",
                    H: "Station Static Gateway",
                },
                {
                    F: "network",
                    P: "104",
                    T: "A",
                    V: "255.255.255.0",
                    H: "Station Static Mask",
                },
                {
                    F: "network",
                    P: "218",
                    T: "S",
                    V: "ESP3D",
                    S: "32",
                    H: "AP SSID",
                    M: "1",
                },
                {
                    F: "network",
                    P: "251",
                    T: "S",
                    V: "********",
                    S: "64",
                    H: "AP Password",
                    M: "64",
                },
                {
                    F: "network",
                    P: "316",
                    T: "A",
                    V: "192.168.0.1",
                    H: "AP Static IP",
                },
                {
                    F: "network",
                    P: "118",
                    T: "B",
                    V: "11",
                    H: "AP Channel",
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
                    F: "network",
                    P: "328",
                    T: "B",
                    V: "1",
                    H: "Enable HTTP",
                    O: [{ No: "0" }, { Yes: "1" }],
                },
                {
                    F: "network",
                    P: "121",
                    T: "I",
                    V: "80",
                    H: "HTTP Port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "network",
                    P: "329",
                    T: "B",
                    V: "1",
                    H: "Enable Telnet",
                    O: [{ No: "0" }, { Yes: "1" }],
                },
                {
                    F: "network",
                    P: "125",
                    T: "I",
                    V: "23",
                    H: "Telnet Port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "network",
                    P: "1021",
                    T: "B",
                    V: "1",
                    H: "Enable Ftp",
                    O: [{ No: "0" }, { Yes: "1" }],
                },
                {
                    F: "network",
                    P: "1009",
                    T: "I",
                    V: "21",
                    H: "Ftp Control Port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "network",
                    P: "1013",
                    T: "I",
                    V: "20",
                    H: "FTP Active Port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "network",
                    P: "1017",
                    T: "I",
                    V: "55600",
                    H: "FTP Passive Port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "network",
                    P: "1004",
                    T: "B",
                    V: "1",
                    H: "Auto notification",
                    O: [{ No: "0" }, { Yes: "1" }],
                },
                {
                    F: "network",
                    P: "116",
                    T: "B",
                    V: "0",
                    H: "Notification",
                    O: [
                        { None: "0" },
                        { Pushover: "1" },
                        { Email: "2" },
                        { Line: "3" },
                    ],
                },
                {
                    F: "network",
                    P: "332",
                    T: "S",
                    V: "********",
                    S: "63",
                    H: "Token 1",
                    M: "0",
                },
                {
                    F: "network",
                    P: "396",
                    T: "S",
                    V: "********",
                    S: "63",
                    H: "Token 2",
                    M: "0",
                },
                {
                    F: "network",
                    P: "855",
                    T: "S",
                    V: "NONE",
                    S: "127",
                    H: "Notifications Settings",
                    M: "0",
                },
                {
                    F: "printer",
                    P: "461",
                    T: "B",
                    V: "0",
                    H: "Target FW",
                    O: [
                        { Repetier: "5" },
                        { "Repetier for Davinci": "1" },
                        { Marlin: "2" },
                        { "Marlin Kimbra": "3" },
                        { Smoothieware: "4" },
                        { Grbl: "6" },
                        { Unknown: "0" },
                    ],
                },
                {
                    F: "printer",
                    P: "320",
                    T: "I",
                    V: "10000",
                    H: "Start delay",
                    S: "40000",
                    M: "0",
                },
                {
                    F: "printer",
                    P: "129",
                    T: "F",
                    V: "0",
                    H: "Output msg",
                    O: [{ M117: "16" }, { Serial: "1" }, { Telnet: "2" }],
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
