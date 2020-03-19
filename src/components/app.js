/*
 app.js - ESP3D WebUI App file

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

import { h, createContext } from "preact"
import "../stylesheets/application.scss"
import { useEffect, useReducer } from "preact/hooks"
import { Esp3dVersion } from "./version"
import { SendGetCommand } from "./http"
import { setupWebSocket } from "./websocket"

/*
 * Hook variable for communication with UI
 */
let globalstate
export let globaldispatch

const initialStateEventData = {
    showDialog: true,
    showPage: false,
    data: {type:"loading", message:"Connecting board..."},
    error: 0,
}

/*
 * Hook for communication with UI
 */
const reducerPage = (state, action) => {
    switch (action.type) {
        
        case "WEBSOCKET_SUCCESS":
            return {
                showDialog: false,
                showPage: true,
                error: 0,
                data: {}
                
            }
        case "FETCH_FW_SUCCESS":
            return {
                showDialog: true,
                showPage: false,
                error: 0,
                data: {type:"loader", message: "Connecting websocket..."}
            }
        case "WEBSOCKET_ERROR":
        case "FETCH_FW_ERROR":
            return {
                showDialog: true,
                showPage: false,
                error: action.errorcode,
                data: {type:"error", message: action.errormsg}
            }
        case "DISCONNECT_ERROR":
            return {
                showDialog: true,
                showPage: true,
                error: action.errorcode,
                data: {type:"disconnect", message: "You are now disconnected"}
            }
        default:
            return state
    }
}

/*
 * Load Firmware settings query success
 */
function loadConfigSuccess(responseText) {
    var data = {}
    try {
        data = JSON.parse(responseText)
        if (data.WebSocketIP && data.WebCommunication && data.WebSocketport) {
            globaldispatch({ type: "FETCH_FW_SUCCESS", payload: data })
            setupWebSocket(data.WebCommunication, data.WebSocketIP, data.WebSocketport);
        }
    } catch (e) {
        console.error("Parsing error:", e)
        globaldispatch({
            type: "FETCH_FW_ERROR",
            errorcode: e,
            errormsg: "Parsing error",
        })
    }
}

/*
 * Load Firmware settings query error
 */
function loadConfigError(errorCode, responseText) {
    globaldispatch({
        type: "FETCH_FW_ERROR",
        errorcode: errorCode,
        errormsg: "Fetching error",
    })
}

/*
 * Load Firmware settings
 */
function loadConfig() {
    var d = new Date();
    var PCtime = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0') + "-" + String(d.getHours()).padStart(2, '0') + "-" + String(d.getMinutes()).padStart(2, '0') + "-" + String(d.getSeconds()).padStart(2, '0'); 
    const url = "/command?cmd=" + encodeURIComponent("[ESP800]" +"time=" + PCtime)
    SendGetCommand(url, loadConfigSuccess, loadConfigError)
}

/*
 * Loading page
 *
 */
const DialogPage = ({ currentState }) => {
    if (currentState.showDialog) {
        let classname ="modal d-block"
        if (currentState.data.type == "disconnect")classname+=" greybg"
        return (
            <modal
                tabindex="-1"
                className= {classname}
            >
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content">
                        <div class="modal-header"></div>
                        <div class="modal-body">
                            <center>{currentState.data.message}</center>
                        </div>
                        <div class="modal-footer"></div>
                    </div>
                </div>
            </modal>
        )
    }
}

/*
 * Main page
 */
const MainPage = ({ currentState }) => {
    if (currentState.showPage) {
        return (
            <div>
                <center>
                    ESP3D v<Esp3dVersion />
                </center>
            </div>
        )
    }
}

/*
 * App entry
 */
export function App() {
    ;[globalstate, globaldispatch] = useReducer(reducerPage, initialStateEventData)
    useEffect(() => {
        loadConfig()
    }, [])

    return (
        <div>
            <DialogPage currentState={globalstate} />
            <MainPage currentState={globalstate} />
        </div>
    )
}
