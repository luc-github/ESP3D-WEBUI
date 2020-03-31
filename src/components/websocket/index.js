/*
 index.js - ESP3D WebUI websocket managment

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.

 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public
 License along with This code; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

"use strict"
import { globaldispatch } from "../app"

/*
 * Local variables
 *
 */

var webSocketClient = {}
var isLogOff = false
var webSocketPort = 0
var webSocketIp = ""
var webSocketType = ""
var webSocketBuffer = ""
var currentPageId = ""
var reconnectCounter = 0
const maxRecoonection = 5

/*
 * Some constants
 */

/*
 * Set page ID
 */
function setPageId(id) {
    currentPageId = id
}

/*
 * Get page ID
 */
function getPageId() {
    return currentPageId
}

/*
 * Process WS terminal line
 */
function processWebSocketBuffer(wsBuffer) {
    console.log(wsBuffer)
}

/*
 * Process WS event line
 */
function processWebSocketText(wsBuffer) {
    console.log(wsBuffer)
    var tdata = wsBuffer.split(":")
    if (tdata.length >= 2) {
        switch (tdata[0]) {
            case "currentID":
                setPageId(tdata[1])
                break
            case "PING":
                //TODO
                break
            case "activeID":
                if (getPageId() != tdata[1]) {
                    disconnectWsServer("DISCONNECTION")
                }
                break
            case "DHT":
                //TODO
                break
            case "ERROR":
                //TODO
                break
            default:
                console.log("Unknow event")
        }
    } else {
        console.log("Error processing event")
    }
}

/*
 * Setup WS variables
 */
function setupWebSocket(wstype, wsIp, wsPort) {
    webSocketIp = wsIp
    webSocketPort = wsPort
    webSocketType = wstype
    connectWsServer()
}

/*
 * Connect to WS server and setup events
 */
function connectWsServer() {
    console.log("connect websocket")
    globaldispatch({
        type: "CONNECT_WEBSOCKET",
    })
    isLogOff = false
    try {
        webSocketClient = new WebSocket(
            "ws://" + webSocketIp + ":" + webSocketPort,
            ["arduino"]
        )
    } catch (exception) {
        globaldispatch({
            type: "WEBSOCKET_ERROR",
        })
        console.error(exception)
        return
    }
    //this is terminal output, it use binary mode of ws
    webSocketClient.binaryType = "arraybuffer"
    //On open WS
    webSocketClient.onopen = function(e) {
        reconnectCounter = 0
        console.log("ws connection ok")
        globaldispatch({
            type: "WEBSOCKET_SUCCESS",
        })
    }
    //On close ws
    webSocketClient.onclose = function(e) {
        console.log("Disconnected")
        //seems sometimes it disconnect so wait 3s and reconnect
        //if it is not a log off
        if (!isLogOff) {
            reconnectCounter++
            if (reconnectCounter >= maxRecoonection) {
                disconnectWsServer("CONNECTION_LOST")
            } else {
                console.log("retry : " + reconnectCounter)
                setTimeout(connectWsServer, 3000)
            }
        }
    }
    //On ws error
    webSocketClient.onerror = function(e) {
        globaldispatch({
            type: "WEBSOCKET_ERROR",
        })
        console.log("ws error", e)
    }
    //Handle msg of ws
    webSocketClient.onmessage = function(e) {
        //for binary messages used for terminal
        if (e.data instanceof ArrayBuffer) {
            var bytes = new Uint8Array(e.data)
            for (var i = 0; i < bytes.length; i++) {
                //process line by line
                if (bytes[i] == 10 || bytes[i] == 13) {
                    processWebSocketBuffer(webSocketBuffer)
                    webSocketBuffer = ""
                } else {
                    webSocketBuffer += String.fromCharCode(bytes[i])
                }
            }
        } else {
            //for text ws they are events
            //assuming that one come at once and full
            if (webSocketType == "Synchronous") {
                processWebSocketText(e.data)
            }
        }
    }
}

/*
 * Disconnect from WS server
 */
function disconnectWsServer(Type) {
    isLogOff = true
    reconnectCounter = 0
    webSocketClient.close()
    globaldispatch({
        type: Type,
    })
}

export { setupWebSocket, connectWsServer, disconnectWsServer, getPageId }
