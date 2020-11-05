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
import { Setting, esp3dSettings, prefs } from "../app"
import { useEffect } from "preact/hooks"
import { T } from "../translations"
import { SendCommand } from "../http"
import { JogPanel, processFeedRate } from "./jog"
import { FilesPanel } from "./files"
import {
    MachineUIPreferences,
    MachineFilesPreferences,
    initDefaultMachineValues,
} from "./preferences"
import { Notifications } from "./notifications"
import { showDialog, updateProgress } from "../dialog"
import enLangRessourceExtra from "./en.json"
import {
    RefreshCcw,
    RotateCcw,
    Save,
    ExternalLink,
    Download,
} from "preact-feather"
import { useStoreon } from "storeon/preact"

/*
 * Some constants
 */
const QUERY_TIMEOUT = 15000 //in ms

/*
 * Local variables
 *
 */
let listSettings = []
let listrawSettings = []
let isloaded = false
let isConfigRequested = false
let isConfigData = false
let saveOnGoing = false
let printerImportSettings = {} //full esp3d settings to be imported
let currentIndex
let stopImport
let timeoutLoader = null

/*
 * Get GitHub URL
 *
 */
function gitHubURL() {
    return "https://github.com/bdring/Grbl_Esp32"
}

/*
 * Check if verbose data or not
 *
 */
function isVerboseData(data) {
    if (
        data.startsWith("<") ||
        data.startsWith(">") ||
        data.startsWith("ok") ||
        data.startsWith("$") ||
        data.startsWith("{") ||
        data.startsWith("[")
    )
        return true
    else return false
}

/*
 * Clear all lists
 *
 */
function clearData() {
    listSettings = []
    listrawSettings = []
    isloaded = false
}

/*
 * Firmware full name
 *
 */
function firmwareName(shortname) {
    switch (shortname) {
        case "grbl-embedded":
            return "GRBL ESP32"
        case "grbl":
            return "Grbl"
        default:
            return "Unknow"
    }
}

/*
 * Give Configuration command and parameters
 */
function configurationCmd() {
    switch (esp3dSettings.FWTarget) {
        case "grbl-embedded":
        case "grbl":
            return ["$$", "$", "ok", "error"]
        default:
            return "Unknown"
    }
}

/*
 * Give Save/Apply configuration command and parameters //TODO as no such feature yet
 */
function saveConfigurationCmd() {
    switch (esp3dSettings.FWTarget) {
        case "grbl-embedded":
        case "grbl":
            return ["$$", "ok", "error"]
        default:
            return "Unknown"
    }
}

/*
 * Prepare Settings Import
 *
 */
function importSettings() {
    document.getElementById("importPControl").click()
    document.getElementById("importPControl").onchange = () => {
        let importFile = document.getElementById("importPControl").files
        let fileList = []
        let message = []
        fileList.push(<div>{T("S56")}</div>)
        fileList.push(<br />)
        for (let i = 0; i < importFile.length; i++) {
            fileList.push(<li>{importFile[i].name}</li>)
        }
        message.push(
            <center>
                <div style="text-align: left; display: inline-block; overflow: hidden;text-overflow: ellipsis;">
                    <ul>{fileList}</ul>
                </div>
            </center>
        )
        showDialog({
            type: "confirmation",
            message: message,
            title: T("S26"),
            button1text: T("S27"),
            next1: loadImportFile,
            next2: closeImport,
        })
    }
}

/*
 * Import settings one by one
 *
 */
function doImport() {
    let listImportedSettings = Object.values(printerImportSettings.printer)
    if (stopImport) {
        return
    }
    let size_list = listImportedSettings.length
    currentIndex++
    if (currentIndex < size_list) {
        let percentComplete = (currentIndex / size_list) * 100
        const cmd = getCommand(listImportedSettings[currentIndex])
        updateProgress({ progress: percentComplete.toFixed(0) })
        SendCommand(cmd, doImport, saveConfigError)
    } else {
        updateProgress({ progress: 100 })
        loadConfig()
    }
}
/*
 * Load Import File
 *
 */
function loadImportFile() {
    let importFile = document.getElementById("importPControl").files
    let reader = new FileReader()
    reader.onload = function(e) {
        var contents = e.target.result
        console.log(contents)
        try {
            printerImportSettings = JSON.parse(contents)
            currentIndex = -1
            showDialog({
                type: "progress",
                progress: 0,
                title: T("S32"),
                button1text: T("S28"),
                next1: cancelImport,
            })
            stopImport = false
            doImport()
        } catch (e) {
            document.getElementById("importPControl").value = ""
            console.error("Parsing error:", e)
            showDialog({ type: "error", numError: e, message: T("S21") })
        }
    }
    reader.readAsText(importFile[0])
    closeImport()
}

/*
 * Cancel import
 *
 */
function cancelImport() {
    stopImport = true
    showDialog({ displayDialog: false })
    console.log("stopping import")
}

/*
 * Close import
 *
 */
function closeImport() {
    document.getElementById("importPControl").value = ""
    showDialog({ displayDialog: false })
}

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
 * Process Save and Apply
 *
 */
function processSaveConfig() {
    const command = saveConfigurationCmd()[0]
    showDialog({ displayDialog: false })
    SendCommand(command, null, loadConfigError)
}

/*
 * Save and Apply
 *
 */
function saveAndApply() {
    showDialog({
        type: "confirmation",
        message: T("G2"),
        title: T("S26"),
        button1text: T("S27"),
        next1: processSaveConfig,
    })
}

/*
 * Process WebEvent data
 */
function processEventsData(type, data) {
    console.log(type + " : " + data)
}

/*
 * Process WebSocket data
 */
function processWSData(buffer) {
    processFeedRate(buffer)
    if (isConfigRequested) {
        console.log("config requested, processing " + buffer)
        console.log("setting size " + listrawSettings.length)
        if (
            buffer.startsWith(configurationCmd()[2]) ||
            buffer.startsWith(configurationCmd()[3])
        ) {
            if (
                listrawSettings.length == 0 &&
                buffer.startsWith(configurationCmd()[2])
            ) {
                console.log("we are done too soon, try again")
                return
            }
            isConfigData = false
            isConfigRequested = false
            if (buffer.startsWith(configurationCmd()[2])) {
                processConfigData()
            } else loadConfigError(404, T("S5"))
        }
        if (
            (!isConfigData && buffer.startsWith(configurationCmd()[1])) ||
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
    if (buffer.startsWith("T:") || buffer.startsWith("ok T:")) {
        processTemperatures(buffer)
    }
}

/*
 * Process Config data
 */
function processConfigData() {
    listSettings = []
    for (let i = 0; i < listrawSettings.length; i++) {
        if (isConfigEntry(listrawSettings[i])) {
            if (isComment(listrawSettings[i])) {
            } else {
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
    console.log(listSettings)
    showDialog({ displayDialog: false, refreshPage: true })
    stopTimeout()
}

/*
 * Raise error if timeout is reached
 */
function timeoutError() {
    stopTimeout()
    showDialog({ type: "error", numError: 404, message: T("P17") })
}

/*
 * Start query timeout
 */
function startTimeout() {
    stopTimeout()
    timeoutLoader = setInterval(timeoutError, QUERY_TIMEOUT)
}

/*
 * Stop query timeout
 */
function stopTimeout() {
    if (timeoutLoader != null) {
        clearInterval(timeoutLoader)
    }
    timeoutLoader = null
}

/*
 * Load Firmware settings
 */
function loadConfig() {
    const cmd = configurationCmd()[0]
    isloaded = true
    isConfigRequested = true
    isConfigData = false
    listrawSettings = []
    console.log("load FW config")
    startTimeout()
    showDialog({ type: "loader", message: T("S1") })
    SendCommand(cmd, null, loadConfigError)
}

/*
 * Load config query error
 */
function loadConfigError(errorCode, responseText) {
    isConfigRequested = false
    isConfigData = false
    showDialog({ type: "error", numError: errorCode, message: T("S5") })
}

/*
 * Check if is it a comment
 */
function isComment(sline) {
    var line = sline.trim()
    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
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
    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
    ) {
        if (line.startsWith("$") && line.indexOf("=") != -1) return true
        else return false
    }
}

/*
 * Extract value from line
 */
function getValue(sline) {
    let line = sline
    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
    ) {
        let tlist = sline.trim().split("=")
        line = tlist[1].trim()
    }
    return line
}

/*
 * Extract label from line
 */
function getLabel(sline) {
    let line = sline
    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
    ) {
        let tlist = sline.trim().split("=")
        line = tlist[0]
    }
    return line
}

/*
 * Extract comment from line
 */
function getComment(sline) {
    let line = sline
    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
    ) {
        line = ""
    }
    return line
}

/*
 * Generate set command from entry
 */
function getCommand(entry) {
    let value
    if (typeof entry.currentValue == "undefined") value = entry.V
    else value = entry.currentValue

    if (
        esp3dSettings.FWTarget == "grbl" ||
        esp3dSettings.FWTarget == "grbl-embedded"
    ) {
        return entry.label + "=" + value
    }
    return ";"
}

/*
 * check entry is valid
 */
function checkValue(entry) {
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
    showDialog({ type: "error", numError: errorCode, message: T("S5") })
}

/*
 * Save current setting
 */
function saveSetting(entry) {
    entry.saving = true
    saveOnGoing = true
    let command = getCommand(entry)
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

    let entryclass = "form-control rounded-right"
    let label = entry.label
    let labelclass = "input-group-text"
    let helpclass =
        entry.comment.length == 0 ? "d-none" : "input-group-text hide-low"

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
    if (
        !(
            esp3dSettings.FWTarget == "grbl" ||
            esp3dSettings.FWTarget == "grbl-embedded"
        )
    )
        return (
            <div>
                <br />
                <center>{T("G1")}</center>
            </div>
        )
    if (prefs && prefs.autoload) {
        if (prefs.autoload && !isloaded) loadConfig()
    }
    let displaylist = []

    for (let pos = 0; pos < listSettings.length; pos++) {
        displaylist.push(<PrinterSetting entry={listSettings[pos]} />)
    }
    let ApplyIcon = <RotateCcw />
    let saveButtontext = "G2"
    return (
        <div>
            <hr />
            <center>
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
                        class="btn btn-danger d-none"
                        title={T("S62")}
                        onClick={saveAndApply}
                    >
                        {ApplyIcon}
                        <span class="hide-low text-button">
                            {T(saveButtontext)}
                        </span>
                    </button>
                </span>
                <input type="file" class="d-none" id="importPControl" />
                <br />
                <br />
            </center>
        </div>
    )
}

export {
    MachineSettings,
    firmwareName,
    processEventsData,
    processWSData,
    enLangRessourceExtra,
    clearData,
    JogPanel,
    MachineUIPreferences,
    MachineFilesPreferences,
    initDefaultMachineValues,
    isVerboseData,
    gitHubURL,
    Notifications,
    FilesPanel,
}
