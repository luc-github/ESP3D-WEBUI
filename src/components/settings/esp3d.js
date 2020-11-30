/*
 esp3d.js - ESP3D WebUI settings file

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
import {
    RefreshCcw,
    RotateCcw,
    Save,
    Search,
    Lock,
    CheckCircle,
    ExternalLink,
    Download,
} from "preact-feather"
const { clearData } = require(`../${process.env.TARGET_ENV}`)
import { Setting, esp3dSettings, disconnectPage } from "../app"
import { prefs } from "../settings"
import { SendCommand } from "../http"
import { useEffect } from "preact/hooks"
import { useStoreon } from "storeon/preact"
import { showDialog, updateProgress } from "../dialog"

/*
 * Local variables
 *
 */
let isloaded = false
let esp3dFWSettings = {} //full esp3d settings (ESP400)
let esp3dFWimportSettings = {} //full esp3d settings to be imported
let currentIndex
let stopImport
let refreshOngoing = false

/*
 * Check value is valid
 */
function checkValue(entry) {
    if (entry.T == "A") {
        var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        if (!entry.currentValue.match(ipformat)) {
            return false
            //setting_error_msg = " a valid IP format (xxx.xxx.xxx.xxx)";
        }
    } else if (entry.T == "S") {
        let min = 0
        let max = 255
        if (entry.M) min = entry.M
        if (entry.S) max = entry.S
        if (
            entry.currentValue.length > max ||
            entry.currentValue.length < min
        ) {
            //special case 0 is allowed
            if (entry.N && entry.currentValue.length == 0) {
                return true
            }
            return false
            //incorrect size;
        }
    } else if ((entry.T == "I" || entry.T == "B") && !entry.O) {
        let min = 0
        let max = 1
        if (entry.M) min = entry.M
        if (entry.S) max = entry.S
        if (
            parseInt(entry.currentValue) > parseInt(max) ||
            parseInt(entry.currentValue) < parseInt(min) ||
            entry.currentValue.length == 0
        ) {
            return false
            //incorrect size;
        }
    }
    return true
}

/*
 * Set control state
 */
function setState(entry, state, index) {
    let id
    if (typeof index != "undefined") {
        id = entry.P + "_" + Object.values(entry.O[index])[0]
    } else {
        id = entry
    }
    let controlID = document.getElementById("setting" + id)
    let buttonID = document.getElementById("button_setting" + id)
    let labelID = document.getElementById("label_setting" + id)
    if (controlID) {
        controlID.classList.remove("is-invalid")
        controlID.classList.remove("is-valid")
        controlID.classList.remove("is-changed")
        switch (state) {
            case "error":
                controlID.classList.add("is-invalid")
                break
            case "modified":
                controlID.classList.add("is-changed")
                break
            case "success":
                controlID.classList.add("is-valid")
                break
            default:
                break
        }
    }
    if (buttonID) {
        switch (state) {
            case "error":
                buttonID.classList.add("d-none")
                break
            case "modified":
                buttonID.classList.remove("d-none")
                break
            case "success":
                buttonID.classList.add("d-none")
                break
            default:
                buttonID.classList.add("d-none")
                break
        }
    }
    if (labelID) {
        labelID.classList.remove("error")
        labelID.classList.remove("success")
        labelID.classList.remove("bg-warning")
        switch (state) {
            case "error":
                labelID.classList.add("error")
                break
            case "modified":
                labelID.classList.add("bg-warning")
                break
            case "success":
                labelID.classList.add("success")
                break
            default:
                break
        }
    }
}

/*
 * Change state of control according context / check
 */
function updateState(entry, index) {
    let state = "default"
    if (typeof index == "undefined") {
        if (entry.currentValue != entry.V) {
            if (checkValue(entry)) {
                state = "modified"
            } else {
                state = "error"
            }
        }
        setState(entry.P, state, index)
    } else {
        let original =
            parseInt(Object.values(entry.O[index])[0]) & parseInt(entry.V)
                ? 1
                : 0
        if (original != entry.O[index]["current_value"]) {
            if (checkValue(entry)) {
                state = "modified"
            } else {
                state = "error"
            }
        }
        setState(entry, state, index)
    }
}

/*
 * Generate a select control
 */
const SelectEntry = ({ entry }) => {
    let optionList = []
    const onChange = e => {
        entry.currentValue = e.target.value
        updateState(entry)
    }
    useEffect(() => {
        updateState(entry)
    }, [entry])
    for (let key in entry.O) {
        let sub_key = Object.keys(entry.O[key])[0].trim()
        let sub_val = Object.values(entry.O[key])[0].trim()
        optionList.push(
            <option value={sub_val}>
                {isNaN(sub_key) ? T(sub_key) : sub_key}
            </option>
        )
    }
    return (
        <select
            id={"setting" + entry.P}
            class="form-control rounded-right"
            value={entry.currentValue}
            onChange={onChange}
        >
            {optionList}
        </select>
    )
}

/*
 * Generate an input control
 */
const InputEntry = ({ entry }) => {
    let minboundary = 0
    let maxboundary = 1
    if (entry.M) minboundary = entry.M
    if (entry.S) maxboundary = entry.S
    const onInput = e => {
        entry.currentValue = e.target.value
        updateState(entry)
    }
    useEffect(() => {
        updateState(entry)
    }, [entry])
    return (
        <input
            type={entry.T == "I" ? "number" : "text"}
            style="min-width:8em;"
            min={minboundary}
            max={maxboundary}
            id={"setting" + entry.P}
            class="form-control rounded-right"
            value={entry.currentValue}
            onInput={onInput}
            placeholder={T("S41")}
        />
    )
}

/*
 * Generate a flag control
 */
const FlagSubEntry = ({ entry, label, val, index }) => {
    const onChange = e => {
        entry.O[index]["current_value"] = e.target.value
        updateState(entry, index)
    }
    const onSet = e => {
        let newval = parseInt(entry.V)
        let flag = parseInt(Object.values(entry.O[index])[0])
        if (entry.O[index]["current_value"] == 0) {
            newval &= ~flag
        } else {
            newval |= flag
        }
        entry.currentValue = newval
        entry.O[index].saving = true
        saveSetting(entry)
    }
    useEffect(() => {
        updateState(entry, index)
    }, [entry])
    let current = entry.O[index]["current_value"]
    return (
        <div class="card-text">
            <div class="input-group">
                <div class="input-group-prepend">
                    <span
                        class="input-group-text"
                        id={"label_setting" + entry.P + "_" + val}
                    >
                        {T(label)}
                    </span>
                </div>
                <select
                    class="form-control rounded-right"
                    value={current}
                    onChange={onChange}
                    id={"setting" + entry.P + "_" + val}
                >
                    <option value="0">{T("OFF")}</option>
                    <option value="1">{T("ON")}</option>
                </select>
                <div class="input-group-append">
                    <button
                        class="btn btn-warning d-none rounded-right"
                        type="button"
                        id={"button_setting" + entry.P + "_" + val}
                        title={T("S43")}
                        onClick={onSet}
                    >
                        <Save size="1.2em" />
                        <span class="hide-low text-button-setting">
                            {T("S43")}
                        </span>
                    </button>
                </div>
            </div>
            <div class="controlSpacer" />
        </div>
    )
}

/*
 * Generate a flag list
 */
const FlagEntry = ({ entry }) => {
    const flagsettings = []
    let index = 0
    for (let key in entry.O) {
        let sub_key
        let sub_val
        if (typeof entry.O[key]["current_value"] == "undefined")
            entry.O[key]["current_value"] =
                parseInt(Object.values(entry.O[key])[0]) & parseInt(entry.V)
                    ? 1
                    : 0
        sub_key = Object.keys(entry.O[key])[0].trim()
        sub_val = Object.values(entry.O[key])[0].trim()
        flagsettings.push(
            <FlagSubEntry
                entry={entry}
                label={sub_key}
                val={sub_val}
                index={index}
            />
        )
        index++
    }
    return (
        <div>
            <div class="card">
                <div class="card-header control-padding">{T(entry.H)}</div>
                <div class="card-body padding-low">{flagsettings}</div>
            </div>
        </div>
    )
}

/*
 * Generate a UI for a setting
 */
const Entry = ({ entry }) => {
    if (typeof entry.currentValue == "undefined") {
        entry.V = entry.V.trim()
            .replace("&#39;", "'")
            .replace("&#34;", '"')
        entry.currentValue = entry.V
    }
    let setting
    const onSet = e => {
        //entry.currentValue = e.target.value
        saveSetting(entry)
    }
    if (!entry.O) setting = <InputEntry entry={entry} />
    else {
        if (entry.T != "F") setting = <SelectEntry entry={entry} />
        else {
            return <FlagEntry entry={entry} />
        }
    }
    let extra
    //position may vary from FW location should not
    if (entry.F == "network/sta" && entry.H == "SSID") {
        extra = (
            <button
                class="btn btn-default rounded-right"
                id={"button_setting_extra" + entry.P}
                type="button"
                title={T("S45")}
                onclick={loadWiFiNetworks}
            >
                <Search size="1.2em" />
            </button>
        )
    }
    return (
        <div>
            <div class="input-group">
                <div class="input-group-prepend">
                    <span
                        class="input-group-text"
                        id={"label_setting" + entry.P}
                    >
                        {T(entry.H)}
                    </span>
                </div>
                {setting}

                <div class="input-group-append">
                    <button
                        class="btn btn-warning d-none rounded-right"
                        id={"button_setting" + entry.P}
                        type="button"
                        onClick={onSet}
                        title={T("S43")}
                    >
                        <Save size="1.2em" />
                        <span class="hide-low text-button-setting">
                            {T("S43")}
                        </span>
                    </button>
                    {extra}
                </div>
                <div
                    class="invalid-feedback text-center"
                    style="text-align:center!important"
                >
                    {T("S42")}
                </div>
            </div>
            <div class="controlSpacer" />
        </div>
    )
}

/*
 * Generate a section of settings
 */
const ESPSectionSettings = ({ filter, filter2 }) => {
    const section = []
    let title = null
    if (filter != filter2) title = <h4 class="card-title">{T(filter2)}</h4>
    for (let entry of esp3dFWSettings.Settings) {
        let tfilter = entry.F.split("/")
        if (tfilter.length > 1) {
            if (tfilter[0] == filter && tfilter[1] == filter2) {
                section.push(
                    <div class="card-text">
                        <Entry entry={entry} />
                    </div>
                )
            }
        }
    }
    return (
        <div>
            <div class="card card-noborder-low">
                <div class="card-body card-low">
                    {title}
                    {section}
                </div>
            </div>
            <div class="controlSpacer" />
        </div>
    )
}

/*
 * Generate a list of control according filter
 */
const ESPSettings = ({ filter }) => {
    if (esp3dFWSettings.Settings) {
        const response = []
        let section = ""
        for (let entry of esp3dFWSettings.Settings) {
            let tfilter = entry.F.split("/")
            if (tfilter[0] == filter) {
                if (tfilter.length > 1) {
                    if (tfilter[1] != section) {
                        section = tfilter[1]
                        response.push(
                            <ESPSectionSettings
                                filter={filter}
                                filter2={section}
                            />
                        )
                    }
                }
            }
        }
        return (
            <div>
                <h4>{T(filter)}</h4>
                {response}
            </div>
        )
    } else return null
}

/*
 * Apply changeon UI
 */
function applyChangeOnUI(entry) {
    if (entry.F == "system/system" && entry.H == "targetfw") {
        clearData()
        for (let val in entry.O) {
            if (Object.values(entry.O[val])[0] == entry.V) {
                esp3dSettings.FWTarget = Object.keys(entry.O[val])[0]
                showDialog({ displayDialog: false, refreshPage: true })
                break
            }
        }
    }
}

const JoinNetworkButton = ({ SSID }) => {
    const onJoin = e => {
        for (let entry of esp3dFWSettings.Settings) {
            if (entry.F == "network/sta" && entry.H == "SSID") {
                entry.currentValue = SSID.replace("&#39;", "'").replace(
                    "&#34;",
                    '"'
                )
                updateState(entry)
                break
            }
        }
        showDialog({ displayDialog: false, refreshPage: true })
    }
    return (
        <button class="btn btn-primary" title={T("S51")} onClick={onJoin}>
            <CheckCircle />
        </button>
    )
}

/*
 * Load Firmware Settings
 */
function loadSettings() {
    const cmd = "[ESP400]"
    showDialog({ type: "loader", message: T("S1") })
    console.log("load FW Settings")
    refreshOngoing = true
    SendCommand(cmd, loadSettingsSuccess, loadSettingsError, null, "noterminal")
    isloaded = true
}

/*
 * Load Firmware Status query success
 */
function loadSettingsSuccess(responseText) {
    try {
        refreshOngoing = false
        esp3dFWSettings = JSON.parse(responseText)
        console.log(esp3dFWSettings)
        showDialog({ displayDialog: false, refreshPage: true })
    } catch (e) {
        console.log(responseText)
        console.error("Parsing error:", e)
        showDialog({ type: "error", numError: e, message: T("S21") })
    }
}

/*
 * Load Network list Settings
 */
function loadWiFiNetworks() {
    const cmd = "[ESP410]"
    showDialog({ type: "loader", message: T("S1") })
    console.log("load wifi networks")
    SendCommand(cmd, loadWiFiNetworksSuccess, loadSettingsError)
}

/*
 * Load WiFi Networks query success
 */
function loadWiFiNetworksSuccess(responseText) {
    try {
        let listnetworks = JSON.parse(responseText)
        let header = []
        let entries = []
        let message = []
        header.push(
            <thead class="thide-low">
                <tr>
                    <th>{T("SSID")}</th>
                    <th>{T("signal")}</th>
                    <th>{T("S49")}</th>
                    <th>{T("S48")}</th>
                </tr>
            </thead>
        )
        console.log(listnetworks)
        for (let key in listnetworks.AP_LIST) {
            let sub_key = Object.keys(listnetworks.AP_LIST[key])
            let sub_val = Object.values(listnetworks.AP_LIST[key])
            entries.push(
                <tr>
                    <td>
                        {sub_val[0].replace("&#39;", "'").replace("&#34;", '"')}
                    </td>
                    <td>
                        {sub_val[1]}%
                        <div class="tshow-low">
                            {sub_val[2] == 1 ? <Lock /> : null}
                        </div>
                    </td>
                    <td class="thide-low">
                        {sub_val[2] == 1 ? <Lock /> : null}
                    </td>
                    <td>
                        <JoinNetworkButton SSID={sub_val[0]} />
                    </td>
                </tr>
            )
        }
        header.push(<tbody>{entries}</tbody>)
        message.push(
            <div style="overflow: auto;">
                <table class="table table-bordered">{header}</table>
            </div>
        )
        showDialog({
            type: "message",
            message: message,
            title: T("S45"),
            button1text: T("S24"),
            button2text: (
                <div title={T("S23")}>
                    <RefreshCcw />
                    <span class="hide-low text-button">{T("S50")}</span>
                </div>
            ),
            next2: loadWiFiNetworks,
        })
    } catch (e) {
        console.log(responseText)
        console.error("Parsing error:", e)
        showDialog({ type: "error", numError: e, message: T("S21") })
    }
}

/*
 * Load WiFi Networks query error
 */
function loadSettingsError(errorCode, responseText) {
    refreshOngoing = false
    showDialog({ type: "error", numError: errorCode, message: T("S5") })
}

/*
 * Save setting query success
 */
function saveSettingSuccess(responseText) {
    try {
        console.log("success " + responseText)
        showDialog({ displayDialog: false })
        let res = responseText.split(" ")
        for (let entry of esp3dFWSettings.Settings) {
            if (entry.P == res[1]) {
                entry.V = entry.currentValue
                if (entry.T != "F") {
                    setState(res[1], "success")
                } else {
                    for (let i = 0; i < entry.O.length; i++) {
                        if (entry.O[i].saving) {
                            entry.O[i].saving = false
                            setState(entry, "success", i)
                        }
                    }
                }
                applyChangeOnUI(entry)
                break
            }
        }
    } catch (e) {
        console.log(responseText)
        console.error("Parsing error:", e)
        showDialog({ type: "error", numError: e, message: T("S21") })
    }
}

/*
 * Save setting query error
 */
function saveSettingError(errorCode, responseText) {
    showDialog({ type: "error", numError: errorCode, message: T("S44") })
}

/*
 * Save setting
 */
function saveSetting(entry) {
    let cmd = "[ESP401]P=" + entry.P + " T=" + entry.T + " V="
    if (entry.T == "S") cmd += entry.currentValue.split(" ").join("\\ ")
    else cmd += entry.currentValue
    showDialog({ type: "loader", message: T("S91") })
    SendCommand(cmd, saveSettingSuccess, saveSettingError)
}

/*
 * Export Settings
 *
 */
function exportSettings() {
    let data, file
    let p = 0
    const filename = "export.json"

    data = '{"Settings": [\n'
    for (let entry of esp3dFWSettings.Settings) {
        if (p != 0) {
            data += ","
        }
        p++
        data +=
            '{"P":"' +
            entry.P +
            '","T":"' +
            entry.T +
            '","V":"' +
            entry.V +
            '"}\n'
    }
    data += "]}"
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
 * Confirm Restart ESP board
 *
 */
function confirmRestart() {
    showDialog({
        type: "confirmation",
        message: T("S59"),
        title: T("S26"),
        button1text: T("S27"),
        next1: restartEsp,
    })
}

/*
 * Restart ESP board
 *
 */
function restartEsp() {
    const cmd = "[ESP444]RESTART"
    disconnectPage()
    SendCommand(cmd, reloadPageFn, reloadPageFn)
    showDialog({ type: "loader", title: T("S60"), message: T("S35") })
}

/*
 * Reload web browser Page
 *
 */
function reloadPageFn() {
    setTimeout(() => {
        window.location.reload(true)
    }, 5000)
}

/*
 * Import settings one by one
 *
 */
function doImport() {
    let listSettings = Object.values(esp3dFWimportSettings.Settings)
    if (stopImport) {
        return
    }
    let size_list = listSettings.length
    currentIndex++
    if (currentIndex < size_list) {
        let percentComplete = (currentIndex / size_list) * 100
        const cmd =
            "[ESP401]P=" +
            listSettings[currentIndex].P +
            " T=" +
            listSettings[currentIndex].T +
            " V=" +
            listSettings[currentIndex].V
        updateProgress({ progress: percentComplete.toFixed(0) })
        if (listSettings[currentIndex].V != "********") {
            SendCommand(cmd, doImport, saveSettingError)
        } else {
            doImport()
        }
    } else {
        updateProgress({ progress: 100 })
        restartEsp()
    }
}
/*
 * Load Import File
 *
 */
function loadImportFile() {
    let importFile = document.getElementById("importControl").files
    let reader = new FileReader()
    reader.onload = function(e) {
        var contents = e.target.result
        console.log(contents)
        try {
            esp3dFWimportSettings = JSON.parse(contents)
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
            document.getElementById("importControl").value = ""
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
    document.getElementById("importControl").value = ""
    showDialog({ displayDialog: false })
}

/*
 * Prepare Settings Import
 *
 */
function importSettings() {
    document.getElementById("importControl").click()
    document.getElementById("importControl").onchange = () => {
        let importFile = document.getElementById("importControl").files
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
 * Settings page
 *
 */
export const Esp3DSettings = ({ currentPage }) => {
    if (currentPage != Setting.esp3d) return null
    if (prefs && prefs.autoload) {
        if (prefs.autoload && !isloaded) loadSettings()
    }
    const listSettings = []
    if (esp3dFWSettings.Settings) {
        let currentfilter = ""
        for (let entry of esp3dFWSettings.Settings) {
            let tfilter = entry.F.split("/")
            if (tfilter[0] != currentfilter) {
                currentfilter = tfilter[0]
                if (listSettings.length > 0) listSettings.push(<hr />)
                listSettings.push(<ESPSettings filter={currentfilter} />)
            }
        }
    }
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
                        class={!refreshOngoing ? "btn btn-primary" : "d-none"}
                        title={T("S23")}
                        onClick={loadSettings}
                    >
                        <RefreshCcw />
                        <span class="hide-low text-button">{T("S50")}</span>
                    </button>
                </span>
                <span
                    class={
                        esp3dFWSettings.Settings
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
                        esp3dFWSettings.Settings
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
                    class={!refreshOngoing ? "text-button-setting" : "d-none"}
                >
                    <button
                        type="button"
                        class="btn btn-danger"
                        title={T("S59")}
                        onClick={confirmRestart}
                    >
                        <RotateCcw />
                        <span class="hide-low text-button">{T("S58")}</span>
                    </button>
                </span>
                <input type="file" class="d-none" id="importControl" />
                <br />
                <br />
            </center>
        </div>
    )
}
