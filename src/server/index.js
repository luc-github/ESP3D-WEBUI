const express = require("express")
/*
 * Web Server for development
 * Web Socket server for development
 */

const WebSocket = require("ws")
var currentID = 0
const app = express()
const fileUpload = require("express-fileupload")
let firstconnection = true
app.use(
    express.static("dist"),
    fileUpload({ preserveExtension: true, debug: true })
)

app.get("/command", function(req, res) {
    var url = req.originalUrl
    if (url.indexOf("ESP800") != -1) {
        res.json({
            FWVersion: "3.0.0.a27",
            FWTarget: "???",
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
    } else {
        res.json({ custom: "unknown query" })
    }
})

app.post("/files", function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No files were uploaded.")
    }
    let myFile = req.files.myfile
    myFile.mv(__dirname + "/public/" + myFile.name, function(err) {
        if (err) return res.status(500).send(err)

        res.send("File uploaded!")
    })
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
