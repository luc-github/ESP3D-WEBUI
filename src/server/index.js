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
        console.log("received: %s", message)
    })
})
