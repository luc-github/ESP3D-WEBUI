/*
 index.js - ESP3D WebUI 3D printer specific code / UI

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
import { Setting, esp3dSettings, globaldispatch, Action } from "../app"
import { T } from "../translations"
import { SendCommand } from "../http"
import {
    RefreshCcw,
    RotateCcw,
    Save,
    ExternalLink,
    Download,
} from "preact-feather"

/*
 * Local variables
 *
 */
let listSettings = []

/*
 * Firmware full name
 *
 */
function firmwareName(shortname) {
    switch (shortname) {
        case "repetier":
            return "Repetier"
        case "repetier4davinci":
            return "Repetier for Davinci"
        case "marlin-embedded":
            return "Marlin ESP32"
        case "marlin":
            return "Marlin"
        case "marlinkimbra":
            return "Marlin Kimbra"
        case "smoothieware":
            return "Smoothieware"
        case "grbl":
            return "Grbl"
        default:
            return "Unknown"
    }
}

/*
 * Give Configuration command and parameters
 */
function configurationCmd(id) {
    switch (esp3dSettings.FWTarget) {
        case "repetier":
        case "repetier4davinci":
            return ["M205", "EPR", "ok", "error"]
        case "marlin-embedded":
        case "marlin":
        case "marlinkimbra":
            return ["M503", "echo:  G21", "ok", "error"]
        case "smoothieware":
            if (id == 0) return "cat /sd/config" //possible 1
            if (id == 1) return "cat /sd/config.txt" //possible 2
            return "M503" //over ride
        default:
            return "Unknown"
    }
}

function importSettings() {}

function exportSettings() {}

function saveAndApply() {}

/*
 * Process WebSocket data
 */
function processWSData(buffer) {
    if (buffer.startsWith("ok")) {
        console.log("ok got :" + buffer)
    }
}

/*
 * Load Firmware settings
 */
function loadConfig() {
    const cmd = encodeURIComponent("M503")
    /*globaldispatch({
        type: Action.fetch_configuration,
    })*/
    console.log("load FW config")
    SendCommand(configurationCmd()[0])
}

const MachineSettings = ({ currentPage }) => {
    if (
        currentPage != Setting.machine ||
        !esp3dSettings ||
        !esp3dSettings.FWTarget ||
        esp3dSettings.FWTarget == "unknown"
    )
        return null
    if (esp3dSettings.FWTarget == "grbl")
        return (
            <div>
                <br />
                <center>{T("S46")}</center>
            </div>
        )
    return (
        <div>
            <hr />
            <center>
                <div class="list-left">{listSettings}</div>
            </center>

            <hr />
            <center>
                <span class="text-button-setting">
                    <button
                        type="button"
                        class="btn btn-primary"
                        title={T("S23")}
                        onClick={loadConfig}
                    >
                        <RefreshCcw />
                        <span class="hide-low text-button">{T("S50")}</span>
                    </button>
                </span>
                <span class={listSettings ? "text-button-setting" : " d-none"}>
                    <button
                        type="button"
                        class="btn btn-primary"
                        title={T("S55")}
                        onClick={importSettings}
                    >
                        <Download />
                        <span class="hide-low text-button">{T("S54")}</span>
                    </button>
                </span>
                <span
                    class={importSettings ? "text-button-setting" : " d-none"}
                >
                    <button
                        type="button"
                        class="btn btn-primary"
                        title={T("S53")}
                        onClick={exportSettings}
                    >
                        <ExternalLink />
                        <span class="hide-low text-button">{T("S52")}</span>
                    </button>
                </span>
                <span class="text-button-setting">
                    <button
                        type="button"
                        class="btn btn-danger"
                        title={T("S62")}
                        onClick={saveAndApply}
                    >
                        <Save />
                        <span class="hide-low text-button">{T("S61")}</span>
                    </button>
                </span>
                <input type="file" class="d-none" id="importControl" />
                <br />
                <br />
            </center>
        </div>
    )
}

export { MachineSettings, firmwareName, processWSData }
