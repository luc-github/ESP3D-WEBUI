/*
 index.js - ESP3D WebUI settings file

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
import { T } from "../translations"
import { RefreshCcw, RotateCcw, Upload } from "preact-feather"
import { Setting, globaldispatch, Action } from "../app"
import { setSettingPage } from "./index"
import { preferences } from "../uisettings"
import { SendCommand } from "../http"
let isloaded = false

/*
 * Local variables
 *
 */
let esp3dFWSettings = {} //full esp3d settings (ESP400)

const ESPSettings = ({ filter }) => {
    if (esp3dFWSettings.Settings) {
        return (
            <div>
                {esp3dFWSettings.Settings.map((entry, index) => {
                    if (entry.F != filter) return null
                    return (
                        <div class="card-text">
                            <span class="text-info">{entry.H}: </span>
                            {entry.V}
                        </div>
                    )
                })}
            </div>
        )
    } else return null
}

/*
 * Load Firmware Settings
 */
function loadSettings() {
    const cmd = encodeURIComponent("[ESP400]")
    globaldispatch({
        type: Action.fetch_data,
    })
    console.log("load FW Settings")
    SendCommand(cmd, loadSettingsSuccess, loadSettingsError)
    isloaded = true
}

/*
 * Load Firmware Status query success
 */
function loadSettingsSuccess(responseText) {
    try {
        esp3dFWSettings = JSON.parse(responseText)
        console.log(esp3dFWSettings)
        globaldispatch({
            type: Action.renderAll,
        })
    } catch (e) {
        console.log(responseText)
        console.error("Parsing error:", e)
        globaldispatch({
            type: Action.error,
            errorcode: e,
            msg: "S21",
        })
    }
}

/*
 * Load Firmware Status query error
 */
function loadSettingsError(errorCode, responseText) {
    globaldispatch({
        type: Action.error,
        errorcode: errorCode,
        msg: "S5",
    })
}

/*
 * Settings page
 *
 */
export const Esp3DSettings = ({ currentPage }) => {
    if (currentPage != Setting.esp3d) return null
    if (preferences && preferences.settings.autoload) {
        if (preferences.settings.autoload == "true" && !isloaded) loadSettings()
    }
    return (
        <div>
            <hr />
            <center>
                <div class="list-left">
                    <ESPSettings filter="network" />
                    <ESPSettings filter="printer" />
                </div>
            </center>

            <hr />
            <center>
                <button
                    type="button"
                    class="btn btn-primary"
                    title={T("S23")}
                    onClick={loadSettings}
                >
                    <RefreshCcw />
                </button>
            </center>
        </div>
    )
}
