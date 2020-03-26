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

import { h } from "preact"
import "../stylesheets/application.scss"
import { useEffect, useReducer } from "preact/hooks"
import { Esp3dVersion } from "./version"
import { SendGetHttp, SendPostHttp } from "./http"
import { DialogPage } from "./dialog"
import { T } from "./translations"
import { initApp } from "./uisettings"

/*
 * Hook variable for communication with UI
 */
let globalstate
export let globaldispatch

const initialStateEventData = {
    showDialog: true,
    showPage: false,
    data: { type: "loader" },
    error: 0,
}

/*
 * Hook for communication with UI
 */
const reducerPage = (state, action) => {
    let msg = ""
    switch (action.type) {
        case "FORCE_RENDER":
            return {
                showDialog: false,
                showPage: true,
                error: 0,
                data: {},
            }
        case "INIT":
            return {
                showDialog: true,
                showPage: false,
                error: 0,
                data: { type: "loader", message: "" },
            }
        case "FETCH_CONFIGURATION":
            return {
                showDialog: true,
                showPage: false,
                error: 0,
                data: { type: "loader", message: T("S1") },
            }
        case "FETCH_CONFIGURATION_ERROR":
            return {
                showDialog: true,
                showPage: false,
                error: action.errorcode,
                data: { type: "error", message: T("S5") },
            }
        case "PARSING_PREFERENCES_ERROR":
            return {
                showDialog: true,
                showPage: false,
                error: action.errorcode,
                data: { type: "error", message: T("S4") },
            }
        case "PARSING_CONFIGURATION_ERROR":
            return {
                showDialog: true,
                showPage: false,
                error: action.errorcode,
                data: { type: "error", message: T("S5") },
            }
        case "CONNECT_WEBSOCKET":
            return {
                showDialog: true,
                showPage: false,
                error: 0,
                data: { type: "loader", message: T("S2") },
            }
        case "WEBSOCKET_SUCCESS":
            return {
                showDialog: false,
                showPage: true,
                error: 0,
                data: {},
            }
        case "ERROR":
            return {
                showDialog: true,
                showPage: state.showPage,
                error: action.errorcode,
                data: { type: "error", message: T(action.msg) },
            }
        case "DISCONNECT_ERROR":
            return {
                showDialog: true,
                showPage: true,
                error: action.errorcode,
                data: {
                    type: "disconnect",
                    message: T("S3"),
                },
            }
        default:
            return state
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
                    <br />
                    {T("lang")}
                </center>
            </div>
        )
    }
}

/*
 * App entry
 */
export function App() {
    ;[globalstate, globaldispatch] = useReducer(
        reducerPage,
        initialStateEventData
    )
    useEffect(() => {
        initApp()
    }, [])
    return (
        <div>
            <DialogPage currentState={globalstate} />
            <MainPage currentState={globalstate} />
        </div>
    )
}
