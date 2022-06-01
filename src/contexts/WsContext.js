/*
 WsContext.js - ESP3D WebUI context file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 Modified by Luc LEBOSSE 2021
 
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
import { h, createContext } from "preact"
import { useState, useEffect, useRef, useContext } from "preact/hooks"
import { useTargetContext } from "../targets"
import {
    useUiContext,
    useSettingsContext,
    useHttpQueueContext,
} from "../contexts"
import { useHttpFn } from "../hooks"
import { getCookie, splitArrayByLines } from "../components/Helpers"

/*
 * Local const
 *
 */
const WsContext = createContext("wsContext")
const useWsContext = () => useContext(WsContext)
const pingDelay = 5000
const maxReconnections = 4

const WsContextProvider = ({ children }) => {
    const { toasts, connection, dialogs, modals } = useUiContext()
    const { removeAllRequests } = useHttpQueueContext()
    const dataBuffer = useRef([])
    const { connectionSettings, activity } = useSettingsContext()
    const wsConnection = useRef()
    const [isPingPaused, setIsPingPaused] = useState(false)
    const [isPingStarted, setIsPingStarted] = useState(false)
    const isLogOff = useRef(false)
    const reconnectCounter = useRef(0)
    const [wsData, setWsData] = useState([])
    const { processData } = useTargetContext()
    const { abortRequest } = useHttpFn

    const ping = (start = false) => {
        if (isLogOff.current) return
        if (!isPingStarted) {
            setIsPingStarted(true)
        } else {
            if (start) return
        }
        setTimeout(ping, pingDelay)
        if (isPingPaused) return
        if (wsConnection.current) {
            if (wsConnection.current.readyState == 1) {
                const c = getCookie("ESPSESSIONID")
                const pingmsg = "PING:" + (c.length > 0 ? c : "none")
                wsConnection.current.send(pingmsg)
            }
        }
    }

    const onMessageCB = (e) => {
        if (isLogOff.current) return
        //for binary messages used for terminal
        const stdOutData = e.data
        if (stdOutData instanceof ArrayBuffer) {
            const bytes = new Uint8Array(stdOutData)
            processData("stream", new TextDecoder("utf-8").decode(stdOutData))
        } else {
            //others txt messages
            const eventLine = stdOutData.split(":")
            if (eventLine.length > 1) {
                switch (eventLine[0].toUpperCase()) {
                    case "CURRENTID":
                        connectionSettings.current.wsID = eventLine[1]
                        break
                    case "ACTIVEID":
                        if (eventLine[1] != connectionSettings.current.wsID) {
                            Disconnect("already connected")
                        }
                        break
                    case "PING":
                        if (eventLine.length == 3) {
                            if (eventLine[1] <= 0) {
                                Disconnect("sessiontimeout")
                            } else if (eventLine[1] < 30000) {
                                dialogs.setShowKeepConnected(true)
                            }
                        }
                        break
                    case "NOTIFICATION":
                        //Show notification
                        console.log("Notification: " + stdOutData)
                        toasts.addToast({
                            content: (
                                <label class="m-1">
                                    {stdOutData.substring(
                                        eventLine[0].length + 1
                                    )}
                                </label>
                            ),
                            type: "notification",
                        })
                        break
                    case "ERROR":
                        console.log(stdOutData)
                        //cancel request
                        toasts.addToast({
                            content:
                                "Error code " +
                                eventLine[1] +
                                ": " +
                                eventLine[2],
                            type: "error",
                        })
                        abortRequest()
                        break
                    default:
                        processData("core", stdOutData)
                        break
                }
            }
        }
    }

    const Disconnect = (reason) => {
        console.log("Disconnect:", reason)
        connection.setConnectionState({
            connected: false,
            authenticate: false,
            page: reason,
        })
        setIsPingStarted(false)
        setIsPingPaused(true)
        isLogOff.current = true
        if (wsConnection.current) {
            wsConnection.current.close()
        }
        //stop polling if any
        activity.stopPolling()
        //Abort  / Remove all queries
        removeAllRequests()
        //Clear all opened modals
        modals.clearModals()
        //TODO: Stop polling
    }

    const onOpenCB = (e) => {
        reconnectCounter.current = 0
        ping(true)
    }

    const onCloseCB = (e) => {
        //seems sometimes it disconnect so wait 3s and reconnect
        //if it is not a log off
        if (!isLogOff.current) {
            if (!isPingPaused) reconnectCounter.current++
            if (reconnectCounter.current >= maxReconnections) {
                Disconnect("connectionlost")
            } else {
                console.log("Ws connection lost")
                setTimeout(setupWS, 3000)
            }
        }
    }

    const onErrorCB = (e) => {
        reconnectCounter.current++
        toasts.addToast({ content: "S6", type: "error" })
        console.log("Error")
    }
    const setupWS = () => {
        if (!connectionSettings.current.WebCommunication) {
            if (reconnectCounter.current < maxReconnections) {
                reconnectCounter.current++
                console.log(
                    "Error with connection data",
                    connectionSettings.current
                )
                setTimeout(setupWS, 3000)
                return
            } else {
                toasts.addToast({ content: "S6", type: "error" })
                console.log("Error")
                return
            }
        }
        const path =
            connectionSettings.current.WebCommunication === "Synchronous"
                ? ""
                : "/ws"

        wsConnection.current = new WebSocket(
            `ws://${document.location.hostname}:${connectionSettings.current.WebSocketPort}${path}`,
            ["arduino"]
        )
        wsConnection.current.binaryType = "arraybuffer"

        //Handle msg of ws
        wsConnection.current.onopen = (e) => onOpenCB(e)
        wsConnection.current.onmessage = (e) => onMessageCB(e)
        wsConnection.current.onclose = (e) => onCloseCB(e)
        wsConnection.current.onerror = (e) => onErrorCB(e)
    }

    useEffect(() => {
        if (connectionSettings.current.WebCommunication) {
            setupWS()
        }
    }, [connectionSettings.current])

    const store = {
        ws: wsConnection.current,

        setIsPingPaused, //to be used in HTTP queries
        Disconnect,
    }

    return <WsContext.Provider value={store}>{children}</WsContext.Provider>
}

export { WsContextProvider, useWsContext }
