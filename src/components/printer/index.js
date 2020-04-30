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
import { Setting, esp3dSettings, globaldispatch, Action, prefs } from "../app"
import { useEffect } from "preact/hooks"
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
let listrawSettings = []
let isloaded = false
let isConfigRequested = false
let isConfigData = false
let configlevel = 0
let isoverloadedconfig = false

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
function configurationCmd(override) {
    switch (esp3dSettings.FWTarget) {
        case "repetier":
        case "repetier4davinci":
            return ["M205", "EPR", "wait", "error"]
        case "marlin-embedded":
        case "marlin":
        case "marlinkimbra":
            return ["M503", "echo:  G21", "ok", "error"]
        case "smoothieware":
            //if (!override)
            return ["cat /sd/config.txt", "#", "ok", "error"]
            return ["M503", ";", "ok", "error"]
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
    if (
        buffer.startsWith(configurationCmd(configlevel)[2]) ||
        buffer.startsWith(configurationCmd(configlevel)[3])
    ) {
        isConfigData = false
        isConfigRequested = false
        if (buffer.startsWith(configurationCmd(configlevel)[2]))
            processConfigData()
        else loadConfigError(404, T("S5"))
    }
    if (isConfigRequested) {
        if (
            (!isConfigData &&
                buffer.startsWith(configurationCmd(configlevel)[1])) ||
            isConfigData
        ) {
            isConfigData = true
            listrawSettings.push(buffer)
        }
    }
}

function processConfigData() {
    listSettings = []
    for (let i = 0; i < listrawSettings.length; i++) {
        if (isConfigEntry(listrawSettings[i])) {
            if (isComment(listrawSettings[i])) {
                if (esp3dSettings.FWTarget != "smoothieware")
                    listSettings.push({
                        id: i,
                        comment: getComment(listrawSettings[i]),
                    })
            } else {
                let pt = getPT(listrawSettings[i])
                if (pt != null)
                    listSettings.push({
                        id: i,
                        comment: getComment(listrawSettings[i]),
                        value: getValue(listrawSettings[i]),
                        label: getLabel(listrawSettings[i]),
                        P: pt[0],
                        T: pt[1],
                    })
                else {
                    if (
                        (esp3dSettings.FWTarget == "smoothieware" ||
                            esp3dSettings.FWTarget == "marlin" ||
                            esp3dSettings.FWTarget == "marlinkimbra" ||
                            esp3dSettings.FWTarget == "marlin-embedded") &&
                        getComment(listrawSettings[i]).length > 0
                    )
                        listSettings.push({
                            id: i,
                            comment: getComment(listrawSettings[i]),
                        })
                    listSettings.push({
                        id: i,
                        comment: getComment(listrawSettings[i]),
                        value: getValue(listrawSettings[i]),
                        label: getLabel(listrawSettings[i]),
                    })
                }
            }
        }
    }
    console.log(listSettings)
    globaldispatch({
        type: Action.renderAll,
    })
}

/*
 * Load Firmware settings
 */
function loadConfig() {
    const cmd = encodeURIComponent("M503")
    isloaded = true
    isConfigRequested = true
    isConfigData = false
    listrawSettings = []
    console.log("load FW config")
    globaldispatch({
        type: Action.fetch_data,
    })
    SendCommand(configurationCmd()[0], null, loadConfigError)
}

/*
 * Load config query error
 */
function loadConfigError(errorCode, responseText) {
    isConfigRequested = false
    isConfigData = false
    globaldispatch({
        type: Action.error,
        errorcode: errorCode,
        msg: "S5",
    })
}

function isComment(sline) {
    var line = sline.trim()
    if (line.length == 0 || line.startsWith("ok")) return false
    if (
        esp3dSettings.FWTarget == "marlin" ||
        esp3dSettings.FWTarget == "marlinkimbra" ||
        esp3dSettings.FWTarget == "marlin-embedded"
    ) {
        if (sline.startsWith("echo:;")) return true
        else return false
    }
    if (esp3dSettings.FWTarget == "smoothieware") {
        if (sline.trim().startsWith("#")) return true
        else return false
    }
    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
    ) {
        return false
    }
    if (
        esp3dSettings.FWTarget == "repetier" ||
        esp3dSettings.FWTarget == "repetier4davinci"
    ) {
        return false
    }
    return false
}

function isConfigEntry(sline) {
    var line = sline.trim()
    if (line.length == 0 || line.startsWith("ok")) return false
    if (
        esp3dSettings.FWTarget == "marlin" ||
        esp3dSettings.FWTarget == "marlinkimbra" ||
        esp3dSettings.FWTarget == "marlin-embedded"
    ) {
        if (
            sline.startsWith("Config:") ||
            sline.startsWith("echo:") ||
            sline.startsWith("\t")
        )
            return true
        else return false
    }
    if (esp3dSettings.FWTarget == "smoothieware") {
        return true
    }
    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
    ) {
        if (line.startsWith("$") && line.indexOf("=") != -1) return true
        else return false
    }
    if (
        esp3dSettings.FWTarget == "repetier" ||
        esp3dSettings.FWTarget == "repetier4davinci"
    ) {
        if (line.indexOf("EPR:") == 0) return true
        else return false
    }
}

function getValue(sline) {
    let line = sline
    if (
        esp3dSettings.FWTarget == "marlin" ||
        esp3dSettings.FWTarget == "marlinkimbra" ||
        esp3dSettings.FWTarget == "marlin-embedded"
    ) {
        line = sline.replace("echo:", "")
        line = line.trim()
        let p = line.indexOf(" ")
        if (p != -1) {
            let p2 = line.indexOf(";")
            line = line.substring(p, p2 == -1 ? line.length : p2)
        } else {
            line = ""
        }
    }
    if (esp3dSettings.FWTarget == "smoothieware") {
        while (line.indexOf("  ") > -1) {
            line = line.replace("  ", " ")
        }
        line = line.trim()
        let tlist = line.split(" ")
        line = tlist[1]
    }
    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
    ) {
        let tlist = sline.trim().split("=")
        line = tlist[1]
    }
    if (
        esp3dSettings.FWTarget == "repetier" ||
        esp3dSettings.FWTarget == "repetier4davinci"
    ) {
        let tlist = sline.split(" ")
        line = tlist[2]
    }
    return line
}

function getLabel(sline) {
    let line = sline
    if (
        esp3dSettings.FWTarget == "marlin" ||
        esp3dSettings.FWTarget == "marlinkimbra" ||
        esp3dSettings.FWTarget == "marlin-embedded"
    ) {
        line = sline.replace("echo:", "")
        line = line.trim()
        let p = line.indexOf(" ")
        if (p != -1) {
            line = line.substring(0, p)
        } else {
            line = ""
        }
    }
    if (esp3dSettings.FWTarget == "smoothieware") {
        line = sline.trim()
        let tlist = line.split(" ")
        line = tlist[0]
    }
    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
    ) {
        let tlist = sline.trim().split("=")
        line = tlist[0]
    }
    if (
        esp3dSettings.FWTarget == "repetier" ||
        esp3dSettings.FWTarget == "repetier4davinci"
    ) {
        let tlist = sline.split(" ")
        line = ""
        for (let i = 3; i < tlist.length; i++) {
            if (tlist[i].startsWith("[")) break
            line += tlist[i] + " "
        }
        line = line.replace(":", "")
    }
    return line
}

function getComment(sline) {
    let line = sline
    if (
        esp3dSettings.FWTarget == "marlin" ||
        esp3dSettings.FWTarget == "marlinkimbra" ||
        esp3dSettings.FWTarget == "marlin-embedded"
    ) {
        let p = line.indexOf(";")
        if (p != -1) {
            line = sline.substring(p + 1)
        } else {
            line = ""
        }
    }
    if (esp3dSettings.FWTarget == "smoothieware") {
        let p = sline.indexOf("#")
        line = sline.substring(p + 1)
        line = line.trim()
        while (line.indexOf("##") > -1) {
            line = line.replace("##", "#")
        }
        if (line.length < 2) line = "" //no meaning so remove it
    }
    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
    ) {
        line = ""
    }
    if (
        esp3dSettings.FWTarget == "repetier" ||
        esp3dSettings.FWTarget == "repetier4davinci"
    ) {
        let tlist = sline.split("[")
        line = ""
        if (tlist.length == 2) {
            line = tlist[1]
            line = line.replace("]", "")
        }
    }
    return line
}

function getPT(sline) {
    if (
        esp3dSettings.FWTarget == "repetier" ||
        esp3dSettings.FWTarget == "repetier4davinci"
    ) {
        let tline = sline.split(" ")
        let p = tline[1]
        let t = tline[0].split(":")[1]
        return [p, t]
    }
    return null
}

function getCommand(sline) {
    let command

    if (
        esp3dSettings.FWTarget == "marlin" ||
        esp3dSettings.FWTarget == "marlinkimbra" ||
        esp3dSettings.FWTarget == "marlin-embedded"
    ) {
        command = getLabel(sline) + " "
        return command
    }
    if (esp3dSettings.FWTarget == "smoothieware") {
        command = "config-set sd " + getLabel(sline) + " "
        return command
    }
    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
    ) {
        command = getLabel(sline) + "="
        return command
    }
    if (
        esp3dSettings.FWTarget == "repetier" ||
        esp3dSettings.FWTarget == "repetier4davinci"
    ) {
        let tline = sline.split(" ")
        if (tline.length > 3) {
            let stype = tline[0].split(":")
            command = "M206 T" + stype[1]
            command += " P" + tline[1]
            if (stype[1] == "3") command += " X"
            else command += " S"
            return command
        }
    }
    return "; "
}

const PrinterSetting = ({ entry }) => {
    const onInput = e => {
        // entry.O[index]["current_value"] = e.target.value
        // updateState(entry, index)
    }
    const onChange = e => {
        // entry.O[index]["current_value"] = e.target.value
        // updateState(entry, index)
    }
    const onSet = e => {
        // let newval = parseInt(entry.V)
        //let flag = parseInt(Object.values(entry.O[index])[0])
        // if (entry.O[index]["current_value"] == 0) {
        //     newval &= ~flag
        //  } else {
        //      newval |= flag
        //   }
        // entry.currentValue = newval
        // entry.O[index].saving = true
        // saveSetting(entry)
    }
    useEffect(() => {
        //updateState(entry, index)
    }, [entry])

    if (typeof entry.value == "undefined") {
        return (
            <div class="card-text hide-low">
                <div style="height:1rem" />
                <label>{entry.comment}</label>
            </div>
        )
    } else {
        let entryclass = "form-control"
        let helpclass =
            entry.comment.length == 0 ? "d-none" : "input-group-text hide-low"
        if (
            esp3dSettings.FWTarget == "marlin" ||
            esp3dSettings.FWTarget == "marlinkimbra" ||
            esp3dSettings.FWTarget == "marlin-embedded"
        ) {
            entryclass += " autoWidth"
            helpclass = "d-none"
        }
        if (
            esp3dSettings.FWTarget == "repetier" ||
            esp3dSettings.FWTarget == "repetier4davinci"
        )
            entryclass += " W15"
        if (esp3dSettings.FWTarget == "smoothieware") helpclass = "d-none"

        return (
            <div class="card-text">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span
                            class="input-group-text fontsetting"
                            id={"printer_setting" + entry.id}
                        >
                            {T(entry.label)}
                        </span>
                    </div>
                    <input
                        type="text"
                        class={entryclass}
                        value={entry.value}
                        onInput={onInput}
                        placeholder={T("S41")}
                    />
                    <div class="input-group-append">
                        <button
                            class="btn btn-default"
                            type="button"
                            id={"button_printer_setting" + entry.id}
                            title={T("S43")}
                            onClick={onSet}
                        >
                            <Save size="1.2em" />
                            <span class="hide-low text-button-setting">
                                {T("S43")}
                            </span>
                        </button>
                        <span class={helpclass}>{T(entry.comment)}</span>
                    </div>
                </div>
                <div class="controlSpacer" />
            </div>
        )
    }
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
    if (prefs && prefs.autoload) {
        if (prefs.autoload == "true" && !isloaded) loadConfig()
    }
    let displaylist = []

    for (let pos = 0; pos < listSettings.length; pos++) {
        displaylist.push(<PrinterSetting entry={listSettings[pos]} />)
    }
    return (
        <div>
            <hr />
            <center>
                <div class="list-left">{displaylist}</div>
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
                <span
                    class={
                        displaylist.length > 0
                            ? "text-button-setting"
                            : " d-none"
                    }
                >
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
                    class={
                        displaylist.length > 0
                            ? "text-button-setting"
                            : " d-none"
                    }
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
