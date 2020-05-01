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
import enLangRessourceExtra from "./en.json"
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
let listOverloadSettings = []
let listNormalSettings = []
let listrawSettings = []
let isloaded = false
let isConfigRequested = false
let isConfigData = false
let isoverloadedconfig = false
let smoothiewareConfigFile = "/sd/config.txt"
let saveOnGoing = false

/*
 * Clear all lists
 *
 */
function clearData() {
    listSettings = []
    listOverloadSettings = []
    listNormalSettings = []
    listrawSettings = []
    isloaded = false
    isoverloadedconfig = false
}

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
        case "grbl-embedded":
            return "Grbl esp32"
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
        case "grbl-embedded":
        case "grbl":
            return ["$$", "$", "ok", "error"]
        case "smoothieware":
            if (!override)
                return ["cat " + smoothiewareConfigFile, "#", "ok", "error"]
            return ["M503", ";", "ok", "error"]
        default:
            return "Unknown"
    }
}

/*
 * Import Settings
 *
 */
function importSettings() {}

/*
 * Export Settings
 *
 */
function exportSettings() {
    let data, file
    let p = 0
    const filename = "export_" + process.env.TARGET_ENV + ".json"

    data = '{"' + process.env.TARGET_ENV + '": [\n'
    for (let entry of listSettings) {
        if (typeof entry.value != "undefined") {
            if (p != 0) {
                data += ","
            }
            p++
            data +=
                '{"label":"' + entry.label + '",' + '"V":"' + entry.value + '"'
            if (typeof entry.P != "undefined") {
                data += ',"P":"' + entry.P + '"' + ',"T":"' + entry.T + '"'
            }
            data += "}\n"
        }
    }
    data += "]}"
    console.log(data)
    file = new Blob([data], { type: "application/json" })
    if (window.navigator.msSaveOrOpenBlob)
        // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename)
    else {
        // Others
        let a = document.createElement("a"),
            url = URL.createObjectURL(file)
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        setTimeout(function() {
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        }, 0)
    }
}

/*
 * Save and Apply
 *
 */
function saveAndApply() {}

/*
 * Process WebSocket data
 */
function processWSData(buffer) {
    if (isConfigRequested) {
        if (
            buffer.startsWith(configurationCmd(isoverloadedconfig)[2]) ||
            buffer.startsWith(configurationCmd(isoverloadedconfig)[3])
        ) {
            isConfigData = false
            isConfigRequested = false
            if (buffer.startsWith(configurationCmd(isoverloadedconfig)[2]))
                processConfigData()
            else loadConfigError(404, T("S5"))
        }
        if (
            (!isConfigData &&
                buffer.startsWith(configurationCmd(isoverloadedconfig)[1])) ||
            isConfigData
        ) {
            isConfigData = true
            listrawSettings.push(buffer)
        }
    }
    if (saveOnGoing) {
        if (buffer.startsWith("ok") || buffer.indexOf("error") != -1) {
            saveOnGoing = false
            if (buffer.indexOf("error") != -1) {
                loadConfigError(404, T("S5"))
            } else {
                for (let entry of listSettings) {
                    if (entry.saving == true) {
                        entry.saving = false
                        entry.value = entry.currentValue
                        setState(entry, "success")
                    }
                }
            }
        }
    }
}

/*
 * Process Config data
 */
function processConfigData() {
    if (!isoverloadedconfig) {
        listNormalSettings = []
        listSettings = listNormalSettings
    } else {
        listOverloadSettings = []
        listSettings = listOverloadSettings
    }
    for (let i = 0; i < listrawSettings.length; i++) {
        if (isConfigEntry(listrawSettings[i])) {
            if (isComment(listrawSettings[i])) {
                if (
                    !(
                        esp3dSettings.FWTarget == "smoothieware" &&
                        !isoverloadedconfig
                    )
                )
                    listSettings.push({
                        id: i,
                        comment: getComment(listrawSettings[i]),
                    })
            } else {
                let pt = getPT(listrawSettings[i])
                if (pt != null) {
                    listSettings.push({
                        id: i,
                        comment: getComment(listrawSettings[i]),
                        value: getValue(listrawSettings[i]),
                        label: getLabel(listrawSettings[i]),
                        P: pt[0],
                        T: pt[1],
                    })
                } else {
                    if (
                        ((esp3dSettings.FWTarget == "smoothieware" &&
                            !isoverloadedconfig) ||
                            esp3dSettings.FWTarget == "marlin" ||
                            esp3dSettings.FWTarget == "marlinkimbra" ||
                            esp3dSettings.FWTarget == "marlin-embedded") &&
                        getComment(listrawSettings[i]).length > 0
                    )
                        listSettings.push({
                            id: i,
                            comment: getComment(listrawSettings[i]),
                        })
                    if (
                        esp3dSettings.FWTarget == "grbl" ||
                        esp3dSettings.FWTarget == "grbl-embedded"
                    )
                        listSettings.push({
                            id: i,
                            comment: getLabel(listrawSettings[i]),
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
    SendCommand(configurationCmd(isoverloadedconfig)[0], null, loadConfigError)
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

/*
 * Check if is it a comment
 */
function isComment(sline) {
    var line = sline.trim()
    if (line.length == 0 || line.startsWith("ok")) return false
    if (
        esp3dSettings.FWTarget == "marlin" ||
        esp3dSettings.FWTarget == "marlinkimbra" ||
        esp3dSettings.FWTarget == "marlin-embedded"
    ) {
        if (sline.startsWith("echo:;")) return true
        return false
    }
    if (esp3dSettings.FWTarget == "smoothieware") {
        if (!isoverloadedconfig && sline.trim().startsWith("#")) return true
        if (isoverloadedconfig && sline.trim().startsWith(";")) return true
        return false
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
/*
 * Check if is it a valid setting
 */
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
        return false
    }
    if (esp3dSettings.FWTarget == "smoothieware") {
        if (!isoverloadedconfig) return true
        if (
            sline.trim().startsWith("M") ||
            sline.trim().startsWith(";") ||
            sline.trim().startsWith("G")
        )
            return true
        return false
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

/*
 * Extract value from line
 */
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
            line = line.substring(p, p2 == -1 ? line.length : p2).trim()
        } else {
            line = ""
        }
    }
    if (esp3dSettings.FWTarget == "smoothieware") {
        if (!isoverloadedconfig) {
            while (line.indexOf("  ") > -1) {
                line = line.replace("  ", " ")
            }
            line = line.trim()
            let tlist = line.split(" ")
            line = tlist[1].trim()
        } else {
            let tlist = line.split(";")
            let p = tlist[0].indexOf(" ")
            line = tlist[0].substring(p).trim()
        }
    }
    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
    ) {
        let tlist = sline.trim().split("=")
        line = tlist[1].trim()
    }
    if (
        esp3dSettings.FWTarget == "repetier" ||
        esp3dSettings.FWTarget == "repetier4davinci"
    ) {
        let tlist = sline.split(" ")
        line = tlist[2].trim()
    }
    return line
}

/*
 * Extract label from line
 */
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

/*
 * Extract comment from line
 */
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
        if (isoverloadedconfig) {
            let p = sline.indexOf(";")
            line = sline.substring(p + 1)
            line = line.trim()
        } else {
            let p = sline.indexOf("#")
            line = sline.substring(p + 1)
            line = line.trim()
            while (line.indexOf("##") > -1) {
                line = line.replace("##", "#")
            }
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

/*
 * Extract P and T values from line (for repetier only)
 */
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

/*
 * Generate set command from entry
 */
function getCommand(entry) {
    if (
        esp3dSettings.FWTarget == "marlin" ||
        esp3dSettings.FWTarget == "marlinkimbra" ||
        esp3dSettings.FWTarget == "marlin-embedded"
    ) {
        return entry.label + " " + entry.currentValue
    }
    if (esp3dSettings.FWTarget == "smoothieware") {
        if (!isoverloadedconfig) {
            return "config-set sd " + entry.label + " " + entry.currentValue
        } else {
            return entry.label + " " + entry.currentValue
        }
    }
    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
    ) {
        return entry.label + "=" + entry.currentValue
    }
    if (
        esp3dSettings.FWTarget == "repetier" ||
        esp3dSettings.FWTarget == "repetier4davinci"
    ) {
        let cmd = "M206 T" + entry.T + " P" + entry.P //+ (entry.T == "3")?" X":" S" + entry.currentValue
        if (entry.T == "3") cmd += " X"
        else cmd += " S"
        cmd += entry.currentValue
        return cmd
    }
    return ";"
}

/*
 * check entry is valid
 */
function checkValue(entry) {
    if (
        esp3dSettings.FWTarget == "marlin" ||
        esp3dSettings.FWTarget == "marlinkimbra" ||
        esp3dSettings.FWTarget == "marlin-embedded"
    ) {
        return true
    }
    if (esp3dSettings.FWTarget == "smoothieware") {
        if (!isoverloadedconfig) {
            if (
                entry.currentValue.trim()[0] == "-" ||
                entry.currentValue.trim().length === 0 ||
                entry.currentValue.indexOf("#") != -1
            )
                return false
        } else {
            if (
                entry.currentValue.trim().length == 0 ||
                entry.currentValue.indexOf(";") != -1
            )
                return false
        }
    }
    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
    ) {
        if (
            entry.currentValue.trim()[0] == "-" ||
            entry.currentValue.trim().length === 0 ||
            entry.currentValue.indexOf("#") != -1
        )
            return false
    }
    if (
        esp3dSettings.FWTarget == "repetier" ||
        esp3dSettings.FWTarget == "repetier4davinci"
    ) {
        //only numbers
        var regex = /^-?(\d+(\.\d+)?)+$/
        return regex.test(entry.currentValue.trim())
    }
    return true
}

/*
 * Set control state
 */
function setState(entry, state) {
    let id
    if (typeof entry.id != "undefined") id = entry.id
    else id = entry
    let label = document.getElementById("printer_label_" + id)
    let input = document.getElementById("printer_input_" + id)
    let button = document.getElementById("printer_button_" + id)
    if (!label || !input || !button) {
        console.log("not found" + entry.id)
        return
    }
    input.classList.remove("is-valid")
    input.classList.remove("is-changed")
    input.classList.remove("is-invalid")
    label.classList.remove("bg-warning")
    label.classList.remove("error")
    label.classList.remove("success")
    switch (state) {
        case "error":
            button.classList.add("d-none")
            input.classList.add("is-invalid")
            label.classList.add("error")
            break
        case "modified":
            button.classList.add("btn-warning")
            button.classList.remove("d-none")
            input.classList.add("is-changed")
            label.classList.add("bg-warning")
            break
        case "success":
            button.classList.add("d-none")
            input.classList.add("is-valid")
            label.classList.add("success")
            break
        default:
            button.classList.add("d-none")
            break
    }
}

/*
 * Change state of control according context / check
 */
function updateState(entry) {
    let state = "default"

    if (entry.currentValue != entry.value) {
        if (checkValue(entry)) {
            state = "modified"
        } else {
            state = "error"
        }
    }
    setState(entry, state)
}

/*
 * save config query error
 */
function saveConfigError(errorCode, responseText) {
    globaldispatch({
        type: Action.error,
        errorcode: errorCode,
        msg: "S5",
    })
}

/*
 * Save current setting
 */
function saveSetting(entry) {
    entry.saving = true
    saveOnGoing = true
    let command = encodeURIComponent(getCommand(entry))
    SendCommand(command, null, saveConfigError)
}

/*
 * Create setting control according entry
 */
const PrinterSetting = ({ entry }) => {
    if (typeof entry.value == "undefined") {
        return (
            <h4>
                <div class="card-text hide-low">
                    <div style="height:0.5rem" />
                    <label>{T(entry.comment)}</label>
                </div>
            </h4>
        )
    }
    if (typeof entry.currentValue == "undefined")
        entry.currentValue = entry.value
    const onInput = e => {
        entry.currentValue = e.target.value.trim()
        updateState(entry)
    }
    const onChange = e => {
        entry.currentValue = e.target.value.trim()
        updateState(entry, index)
    }
    const onSet = e => {
        saveSetting(entry)
    }
    useEffect(() => {
        updateState(entry)
    }, [entry])

    let entryclass = "form-control"
    let label = entry.label
    let labelclass = "input-group-text fontsetting"
    let helpclass =
        entry.comment.length == 0 ? "d-none" : "input-group-text hide-low"
    if (
        esp3dSettings.FWTarget == "marlin" ||
        esp3dSettings.FWTarget == "marlinkimbra" ||
        esp3dSettings.FWTarget == "marlin-embedded"
    ) {
        entryclass += " autoWidth"
        helpclass = "d-none"
        labelclass = "input-group-text"
    }
    if (
        esp3dSettings.FWTarget == "repetier" ||
        esp3dSettings.FWTarget == "repetier4davinci"
    ) {
        entryclass += " W15"
        label = T(entry.label)
    }
    if (esp3dSettings.FWTarget == "smoothieware") {
        helpclass = "d-none"
        label = T(entry.label)
    }
    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
    ) {
        labelclass = "input-group-text"
    }

    return (
        <div class="card-text">
            <div>
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span
                            class={labelclass}
                            id={"printer_label_" + entry.id}
                        >
                            {label}
                        </span>
                    </div>
                    <input
                        id={"printer_input_" + entry.id}
                        type="text"
                        class={entryclass}
                        value={entry.value}
                        onInput={onInput}
                        placeholder={T("S41")}
                    />
                    <div class="input-group-append">
                        <button
                            class="btn d-none"
                            type="button"
                            id={"printer_button_" + entry.id}
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
                    <div
                        class="invalid-feedback text-center"
                        style="text-align:center!important"
                    >
                        {T("S42")}
                    </div>
                </div>
            </div>
            <div class="controlSpacer" />
        </div>
    )
}

/*
 * Override configuration switch control (Smoothieware only)
 * to select normal or override configuration file/command
 */
const OverrideSettingControl = () => {
    if (esp3dSettings.FWTarget != "smoothieware") return null
    const toggleCheckbox = e => {
        isoverloadedconfig = e.target.checked
        if (!isoverloadedconfig) {
            listSettings = listNormalSettings
            globaldispatch({
                type: Action.renderAll,
            })
        } else {
            listSettings = listOverloadSettings
            if (listOverloadSettings.length == 0 && prefs.autoload == "true") {
                loadConfig()
            } else {
                globaldispatch({
                    type: Action.renderAll,
                })
            }
        }
    }
    return (
        <div class="custom-control custom-switch">
            <input
                checked={isoverloadedconfig}
                type="checkbox"
                onChange={toggleCheckbox}
                class="custom-control-input"
                id="switchoverride"
            />
            <label class="custom-control-label" for="switchoverride">
                {T("P1")}
            </label>
            <br />
            <br />
        </div>
    )
}

/*
 * Display configuration settings
 */
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
                <OverrideSettingControl />
                <div class="list-left">
                    <div class={displaylist.length > 0 ? "card" : " d-none"}>
                        <div class="card-body">{displaylist}</div>
                    </div>
                </div>
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
                <span
                    class={
                        displaylist.length > 0
                            ? "text-button-setting"
                            : " d-none"
                    }
                >
                    <button
                        type="button"
                        class="btn btn-danger "
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

export {
    MachineSettings,
    firmwareName,
    processWSData,
    enLangRessourceExtra,
    clearData,
}
