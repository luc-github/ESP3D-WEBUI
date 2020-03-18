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

/*
 * Hook variable for communication with UI
 */
let globalstate
let globaldispatch

const initialStatePage = {
    loading: true,
    error: 0,
    errorMsg: "",
    data: "",
}

/*
 * Hook for communication with UI
 */
const reducerPage = (state, action) => {
    switch (action.type) {
        case "FETCH_FW_SUCCESS":
            return {
                loading: false,
                data: action.payload,
                error: 0,
                errorMsg: "",
            }
        case "FETCH_FW_ERROR":
            return {
                loading: true,
                data: {},
                error: action.errorcode,
                errorMsg: action.errormsg,
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
        globaldispatch({ type: "FETCH_FW_SUCCESS", payload: data })
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
    const url = "/command?cmd=" + encodeURIComponent("[ESP800]")
    SendGetCommand(url, loadConfigSuccess, loadConfigError)
}

/*
 * Loading page
 *
 */
const LoadingPage = ({ currentState }) => {
    let message = "Loading..."
    if (currentState.error) {
        message = currentState.errorMsg + " (" + currentState.error + ")"
    }
    if (currentState.loading || currentState.error) {
        return (
            <modal
                tabindex="-1"
                className={
                    currentState.loading ? "modal d-block" : "modal d-none"
                }
            >
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content">
                        <div class="modal-header"></div>
                        <div class="modal-body">
                            <center>{message}</center>
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
    if (!(currentState.loading || currentState.error)) {
        let property
        let dataarray = []
        for (property in currentState.data) {
            let id = property
            dataarray.push({ id: property, value: currentState.data[property] })
            console.log(property + " : " + currentState.data[property])
        }
        return (
            <div>
                <center>
                    ESP3D v<Esp3dVersion />
                </center>
                <ul>
                    {dataarray.map(dataitem => (
                        <li>
                            {dataitem.id} : {dataitem.value}{" "}
                        </li>
                    ))}
                </ul>
            </div>
        )
    }
}

/*
 * App entry
 */
export function App() {
    ;[globalstate, globaldispatch] = useReducer(reducerPage, initialStatePage)
    useEffect(() => {
        loadConfig()
    }, [])

    return (
        <div>
            <LoadingPage currentState={globalstate} />
            <MainPage currentState={globalstate} />
        </div>
    )
}
