/*
 index.js - ESP3D WebUI initialization file

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
import { setLang } from "../translations"
import { SendCommand, SendGetHttp, SendPostHttp } from "../http"
import { globaldispatch, applyConfig, Action } from "../app"
import { setupWebSocket } from "../websocket"

/*
 * Local variables
 *
 */
let preferences

/*
 * Some constants
 */
const default_preferences = '{"settings":{"language":"en"}}'
const preferencesFileName = "preferences.json"

/*
 * Function starting initialization
 */
function initApp() {
    preferences = JSON.parse(default_preferences)
    globaldispatch({ type: Action.init })
    loadPreferences()
}

/*
 * Load Preferences query success
 */
function loadPreferencesSuccess(responseText) {
    try {
        preferences = JSON.parse(responseText)
        setLang(preferences.settings.language)
        loadConfig()
    } catch (err) {
        console.log("error")
        globaldispatch({
            type: Action.parsing_preferences_error,
            errorcode: err,
            nextaction: loadConfig,
        })
    }
}

/*
 * Save Preferences query
 */
function savePreferences() {
    //
    var blob = new Blob([JSON.stringify(preferences, null, " ")], {
        type: "application/json",
    })
    var file = new File([blob], preferencesFileName)
    var formData = new FormData()
    var url = "/files"
    formData.append("path", "/")
    formData.append("myfile", file, preferencesFileName)
    SendPostHttp(url, formData)
}

/*
 * Load Preferences query error
 */
function loadPreferencesError(errorCode, responseText) {
    console.log("no valid " + preferencesFileName + ", use default")
    loadConfig()
}

/*
 * Load Preferences
 */
function loadPreferences() {
    const url = "/preferences.json?" + +"?" + Date.now()
    SendGetHttp(url, loadPreferencesSuccess, loadPreferencesError)
    console.log("load preferences")
}

/*
 * Load Firmware settings
 */
function loadConfig() {
    var d = new Date()
    var PCtime =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0") +
        "-" +
        String(d.getHours()).padStart(2, "0") +
        "-" +
        String(d.getMinutes()).padStart(2, "0") +
        "-" +
        String(d.getSeconds()).padStart(2, "0")
    const cmd = encodeURIComponent("[ESP800]" + "time=" + PCtime)
    globaldispatch({
        type: Action.fetch_configuration,
    })
    console.log("load FW config")
    SendCommand(cmd, loadConfigSuccess, loadConfigError)
}

/*
 * Load Firmware settings query success
 */
function loadConfigSuccess(responseText) {
    var data = {}
    try {
        data = JSON.parse(responseText)
        applyConfig(data)
        if (data.WebSocketIP && data.WebCommunication && data.WebSocketport) {
            setupWebSocket(
                data.WebCommunication,
                data.WebSocketIP,
                data.WebSocketport
            )
        }
    } catch (e) {
        console.error("Parsing error:", e)
        globaldispatch({
            type: Action.parsing_configuration_error,
            errorcode: e,
        })
    }
}

/*
 * Load Firmware settings query error
 */
function loadConfigError(errorCode, responseText) {
    globaldispatch({
        type: Action.fetch_configuration_error,
        errorcode: errorCode,
    })
}

export { initApp, preferences }
