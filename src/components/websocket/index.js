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

import { h } from "preact"
import {
    updateTerminal,
    stopPolling,
    finishSetup,
    disconnectPage,
} from "../app"
import { cancelCurrentQuery, clearCommandList, SendCommand } from "../http"
import { setLang, T } from "../translations"
import { showDialog, ProgressionDisconnectBar } from "../dialog"

const {
    processWSData,
    processEventsData,
} = require(`../${process.env.TARGET_ENV}`)
/*
 * Local variables
 *
 */

var webSocketClient = {}
var isLogOff = false
var isDisconnected = false
var webSocketPort = 0
var webSocketIp = ""
var webSocketType = ""
var webSocketBuffer = ""
var currentPageId = ""
var reconnectCounter = 0
var pingStarted = false
var pingPaused = false

/*
 * Some constants
 */
const maxReconnection = 3
const pingDelay = 5000

/*
 * Set page ID
 */
function setPageId(id) {
    if (currentPageId == "") {
        console.log("Connection done")
        showDialog({ displayDialog: false, refreshPage: true })
        finishSetup()
    }
    currentPageId = id
}

/*
 * Get page ID
 */
function getPageId() {
    return currentPageId
}

/*
 * Pause Ping
 */
function pausePing(state) {
    pingPaused = state
}

function getCookie(cname) {
    let name = cname + "="
    let decodedCookie = decodeURIComponent(document.cookie)
    let ca = decodedCookie.split(";")
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i]
        while (c.charAt(0) == " ") {
            c = c.substring(1)
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ""
}

/*
 * Ping function
 */
function ping(start = false) {
    //be sure it is not reconnection
    if (!pingStarted) {
        pingStarted = true
    } else {
        if (start) return
    }
    setTimeout(ping, pingDelay)
    if (pingPaused) return
    if (webSocketClient.readyState == 1) {
        console.log("ping " + document.cookie)
        let pingmsg = "PING:" + getCookie("ESPSESSIONID")
        webSocketClient.send(pingmsg)
    }
}

/*
 * Process WS terminal line
 */
function processWebSocketBuffer(wsBuffer) {
    console.log(wsBuffer)
    updateTerminal(wsBuffer)
    processWSData(wsBuffer)
}

/*
 * Stay connected function
 */
function stayConnected() {
    SendCommand("/command?ping=yes")
    showDialog({ displayDialog: false, refreshPage: true })
}

/*
 * Process WS event line
 */
function processWebSocketText(wsBuffer) {
    var tdata = wsBuffer.split(":")
    if (tdata.length >= 2) {
        switch (tdata[0]) {
            case "currentID":
                console.log(wsBuffer)
                setPageId(tdata[1])
                break
            case "PING":
                if (tdata.length == 3) {
                    console.log("Pong:" + tdata[1] + ":" + tdata[2])
                    if (tdata[1] < 30000) {
                        console.log("under 30 sec : ")
                        let msg = []
                        msg.push(<div>{T("S153")}</div>)
                        msg.push(<div class="p-1" />)
                        msg.push(
                            <ProgressionDisconnectBar remaining={tdata[1]} />
                        )
                        showDialog({
                            type: "confirmation",
                            message: msg,
                            title: T("S26"),
                            button1text: T("S154"),
                            next: stayConnected,
                        })
                    }

                    if (tdata[1] == 0) {
                        console.log("Session time out")
                        disconnectPage()
                    }
                }
                break
            case "activeID":
                console.log(wsBuffer)
                if (getPageId() != tdata[1]) {
                    disconnectWsServer({
                        type: "disconnect",
                        message: T("S3"),
                        button1text: T("S8"),
                    })
                }
                break
            case "ERROR":
                console.log(wsBuffer)
                cancelCurrentQuery(tdata[1], tdata[2])
                break
            default:
                processEventsData(tdata[0], tdata[1])
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
    //TODO move this to notification instead of Dialog
    //if (!pingPaused) showDialog({ type: "loader", message: T("S2") })
    isLogOff = false
    try {
        webSocketClient = new WebSocket(
            "ws://" + webSocketIp + ":" + webSocketPort,
            ["arduino"]
        )
    } catch (exception) {
        showDialog({ type: "error", numError: exception, message: T("S6") })
        reconnectCounter++
        console.error("Failed connect Websocket with retry " + reconnectCounter)
        console.error(exception)
        return
    }
    //this is terminal output, it use binary mode of ws
    webSocketClient.binaryType = "arraybuffer"
    //On open WS
    webSocketClient.onopen = function(e) {
        reconnectCounter = 0
        console.log("ws connection ok")
        ping(true)
    }
    //On close ws
    webSocketClient.onclose = function(e) {
        console.log("Disconnected")
        //seems sometimes it disconnect so wait 3s and reconnect
        //if it is not a log off
        if (!isLogOff) {
            if (!pingPaused) reconnectCounter++
            if (reconnectCounter >= maxReconnection) {
                disconnectWsServer({
                    type: "disconnect",
                    numError: 1,
                    message: T("S10"),
                    button1text: T("S8"),
                })
            } else {
                console.log("retry : " + reconnectCounter)
                setTimeout(connectWsServer, 3000)
            }
        }
    }
    //On ws error
    webSocketClient.onerror = function(e) {
        //TODO move this to notification
        //showDialog({type:"error", numError:e, message:T("S4")})
        reconnectCounter++
        console.error("Failed connect Websocket with retry " + reconnectCounter)
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
                    if (webSocketBuffer.length > 0) {
                        processWebSocketBuffer(webSocketBuffer)
                    }
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
function disconnectWsServer(data) {
    isLogOff = true
    reconnectCounter = 4
    if (typeof webSocketClient.close != "undefined") webSocketClient.close()
    stopPolling()
    clearCommandList()
    document.title = document.title + "(" + T("S9") + ")"
    if (data && !isDisconnected) showDialog(data)
    isDisconnected = true
}

export {
    setupWebSocket,
    connectWsServer,
    disconnectWsServer,
    getPageId,
    pausePing,
}
