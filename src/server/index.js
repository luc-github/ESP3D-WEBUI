const express = require("express")
/*
 * Web Server for development
 * Web Socket server for development
 */

const WebSocket = require("ws")
var currentID = 0
const app = express()
let firstconnection = true
app.use(express.static("dist"))
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
