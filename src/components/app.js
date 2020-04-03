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
import { useState, useEffect, useReducer } from "preact/hooks"
import { DialogPage } from "./dialog"
import { AboutPage } from "./about"
import { DashboardPage } from "./dashboard"
import { SettingsPage } from "./settings"
import { Header } from "./header"
import { Notification } from "./notification"
import { T } from "./translations"
import { initApp } from "./uisettings"

/*
 * Some constants
 */
const Page = { none: 0, about: 1, dashboard: 2, settings: 3 }
const Action = {
    none: 0,
    error: 1,
    renderPage: 2,
    renderAll: 3,
    init: 4,
    fetch_configuration: 5,
    fetch_configuration_error: 6,
    parsing_configuration_error: 7,
    parsing_preferences_error: 8,
    connect_websocket: 9,
    websocket_success: 10,
    websocket_error: 11,
    connection_lost: 12,
    disconnection: 13,
    fetch_data: 14,
}
/*
 * Hook variables for communication with UI
 */
let globalstate
let globaldispatch
const initialStateEventData = {
    showDialog: true,
    activePage: Page.dashboard,
    showPage: false,
    data: { type: "loader" },
    error: 0,
}

let notificationBottom
let setNotificationBottom

/*
 * Local variables
 *
 */
let esp3dSettings

/*
 * Hook for communication with UI
 */
const reducerPage = (state, action) => {
    let msg = ""
    switch (action.type) {
        case Action.renderPage:
            return {
                showDialog: false,
                showPage: true,
                activePage: action.activePage,
                error: 0,
                data: {},
            }
        case Action.renderAll:
            return {
                showDialog: false,
                showPage: true,
                activePage: globalstate.activePage,
                error: 0,
                data: {},
            }
        case Action.fetch_data:
            return {
                showDialog: true,
                showPage: true,
                activePage: globalstate.activePage,
                error: 0,
                data: { type: "loader", message: T("S1") },
            }
        case Action.init:
            document.title = document.location.host
            return {
                showDialog: true,
                showPage: false,
                activePage: Page.none,
                error: 0,
                data: { type: "loader", message: "" },
            }
        case Action.fetch_configuration:
            return {
                showDialog: true,
                showPage: false,
                activePage: globalstate.activePage,
                error: 0,
                data: { type: "loader", message: T("S1") },
            }
        case Action.fetch_configuration_error:
            return {
                showDialog: true,
                showPage: false,
                activePage: globalstate.activePage,
                error: action.errorcode,
                data: { type: "error-blocking", message: T("S5") },
            }
        case Action.parsing_preferences_error:
            return {
                showDialog: true,
                showPage: false,
                activePage: globalstate.activePage,
                error: action.errorcode,
                data: {
                    type: "error",
                    message: T("S7"),
                    next: action.nextaction,
                },
            }
        case Action.parsing_configuration_error:
            return {
                showDialog: true,
                showPage: false,
                activePage: globalstate.activePage,
                error: action.errorcode,
                data: { type: "error-blocking", message: T("S4") },
            }
        case Action.connect_websocket:
            if (esp3dSettings) {
                document.title = esp3dSettings.Hostname
            }
            return {
                showDialog: true,
                showPage: false,
                activePage: globalstate.activePage,
                error: 0,
                data: { type: "loader", message: T("S2") },
            }
        case Action.websocket_success:
            return {
                showDialog: false,
                showPage: true,
                activePage: Page.about,
                error: 0,
                data: {},
            }
        /*
        case Action.websocket_error:
            return {
            //TBC
            }
        */
        case Action.error:
            return {
                showDialog: true,
                showPage: state.showPage,
                activePage: globalstate.activePage,
                error: action.errorcode,
                data: {
                    type: "error",
                    message: T(action.msg),
                    title: action.title ? T(action.title) : T("S22"),
                    button1text: action.buttontext
                        ? T(action.buttontext)
                        : T("S24"),
                },
            }
        case Action.connection_lost:
        case Action.disconnection:
            document.title = document.title + "(" + T("S9") + ")"
            return {
                showDialog: true,
                showPage: true,
                activePage: globalstate.activePage,
                error: 0,
                data: {
                    type: "disconnect",
                    message:
                        action.type == Action.disconnection
                            ? T("S3")
                            : T("S10"),
                    button1text: T("S8"),
                },
            }
        default:
            console.log("Unknow action")
            return state
    }
}

/*
 * Main page
 */
const Container = ({ currentState, top }) => {
    return (
        <div
            class="espcontainer container-fluid row-fluid card"
            style={{ top }}
        >
            <AboutPage currentState={currentState} />
            <DashboardPage currentState={currentState} />
            <SettingsPage currentState={currentState} />
        </div>
    )
}

/*
 * Main page
 */
const MainPage = ({ currentState }) => {
    if (currentState.showPage) {
        ;[notificationBottom, setNotificationBottom] = useState("50px")
        return (
            <div class="full-height">
                <Header />
                <Notification />
                <Container
                    currentState={currentState}
                    top={notificationBottom}
                />
            </div>
        )
    }
}

/*
 * Apply necessary settings
 */
function applyConfig(data) {
    console.log("Apply settings")
    esp3dSettings = data
}

/*
 * App entry
 */
function App() {
    ;[globalstate, globaldispatch] = useReducer(
        reducerPage,
        initialStateEventData
    )
    useEffect(() => {
        initApp()
    }, [])
    return (
        <div class="full-height">
            <DialogPage currentState={globalstate} />
            <MainPage currentState={globalstate} />
        </div>
    )
}

export {
    App,
    globaldispatch,
    applyConfig,
    Page,
    Action,
    setNotificationBottom,
    esp3dSettings,
}
