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
import {
    RefreshCcw,
    Upload,
    Search,
    Lock,
    CheckCircle,
    ExternalLink,
} from "preact-feather"
import { Setting, globaldispatch, Action, esp3dSettings } from "../app"
import { setSettingPage } from "./index"
import { preferences } from "../uisettings"
import { SendCommand } from "../http"
import { useEffect } from "preact/hooks"
let isloaded = false

/*
 * Local variables
 *
 */
let esp3dFWSettings = {} //full esp3d settings (ESP400)

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
    let classSetting = "form-control"
    let classLabel = "input-group-text"
    let classButton = "btn"
    switch (state) {
        case "error":
            classSetting += " is-invalid"
            classLabel += " error"
            classButton += " d-none"
            break
        case "modified":
            classSetting += " is-changed"
            classLabel += " warning"
            classButton += " btn-warning"
            break
        case "success":
            classSetting += " is-valid"
            classLabel += " success"
            classButton += " d-none"
            break
        default:
            classButton += " d-none"
            break
    }
    document.getElementById("setting" + id).className = classSetting
    document.getElementById("button_setting" + id).className = classButton
    document.getElementById("label_setting" + id).className = classLabel
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
            class="form-control"
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
            class="form-control"
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
                    class="form-control"
                    value={current}
                    onChange={onChange}
                    id={"setting" + entry.P + "_" + val}
                >
                    <option value="0">{T("OFF")}</option>
                    <option value="1">{T("ON")}</option>
                </select>
                <div class="input-group-append">
                    <button
                        class="btn btn-default"
                        type="button"
                        id={"button_setting" + entry.P + "_" + val}
                        title={T("S43")}
                        onClick={onSet}
                    >
                        <Upload size="1.2em" />
                        <span class="hide-low">{T("S43")}</span>
                    </button>
                </div>
            </div>
            <div style="height:3px" />
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
    if (entry.F == "network" && entry.F2 == "sta" && entry.H == "SSID") {
        extra = (
            <button
                class="btn btn-default"
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
                <div
                    class="invalid-feedback text-center"
                    style="text-align:center!important"
                >
                    {T("S42")}
                </div>
                <div class="input-group-append">
                    <button
                        class="btn btn-default"
                        id={"button_setting" + entry.P}
                        type="button"
                        onClick={onSet}
                        title={T("S43")}
                    >
                        <Upload size="1.2em" />
                        <span class="hide-low">{T("S43")}</span>
                    </button>
                    {extra}
                </div>
            </div>
            <div style="height:3px" />
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
        if (entry.F == filter && entry.F2 == filter2) {
            section.push(
                <div class="card-text">
                    <Entry entry={entry} />
                </div>
            )
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
            <div style="height:3px" />
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
            if (entry.F == filter) {
                if (entry.F2 != section) {
                    section = entry.F2
                    response.push(
                        <ESPSectionSettings filter={filter} filter2={section} />
                    )
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
    if (entry.F == "system" && entry.H == "targetfw") {
        for (let val in entry.O) {
            if (Object.values(entry.O[val])[0] == entry.V) {
                esp3dSettings.FWTarget = Object.keys(entry.O[val])[0]
                break
            }
        }
    }
}

const JoinNetworkButton = ({ SSID }) => {
    const onJoin = e => {
        for (let entry of esp3dFWSettings.Settings) {
            if (
                entry.F == "network" &&
                entry.F2 == "sta" &&
                entry.H == "SSID"
            ) {
                entry.currentValue = SSID
                updateState(entry)
                break
            }
        }
        globaldispatch({
            type: Action.renderAll,
        })
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
 * Load Network list Settings
 */
function loadWiFiNetworks() {
    const cmd = encodeURIComponent("[ESP410]")
    globaldispatch({
        type: Action.fetch_data,
    })
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
            <thead class="hide-low">
                <tr>
                    <th>{T("SSID")}</th>
                    <th>{T("signal")}</th>
                    <th>{T("S49")}</th>
                    <th>{T("S48")}</th>
                </tr>
            </thead>
        )
        //console.log(listnetworks)
        for (let key in listnetworks.AP_LIST) {
            let sub_key = Object.keys(listnetworks.AP_LIST[key])
            let sub_val = Object.values(listnetworks.AP_LIST[key])
            entries.push(
                <tr>
                    <td>{sub_val[0]}</td>
                    <td>{sub_val[1]}%</td>
                    <td>{sub_val[2] == 1 ? <Lock /> : null}</td>
                    <td>
                        <JoinNetworkButton SSID={sub_val[0]} />
                    </td>
                </tr>
            )
        }
        header.push(<tbody>{entries}</tbody>)
        message.push(<div><table class="table table-bordered ">{header}</table></div>)
        globaldispatch({
            type: Action.message,
            msg: message,
            title: "S45",
            buttontext: "S24",
            buttontext2: (
                <div title={T("S23")}>
                    {" "}
                    <RefreshCcw />
                    <span class="hide-low">{" " + T("S50")}</span>
                </div>
            ),
            nextaction2: loadWiFiNetworks,
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
 * Load WiFi Networks query error
 */
function loadSettingsError(errorCode, responseText) {
    globaldispatch({
        type: Action.error,
        errorcode: errorCode,
        msg: "S5",
    })
}

/*
 * Save setting query success
 */
function saveSettingSuccess(responseText) {
    try {
        console.log("success " + responseText)
        globaldispatch({
            type: Action.renderAll,
        })
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
        globaldispatch({
            type: Action.error,
            errorcode: e,
            msg: "S21",
        })
    }
}

/*
 * Save setting query error
 */
function saveSettingError(errorCode, responseText) {
    globaldispatch({
        type: Action.error,
        errorcode: errorCode,
        msg: "S44",
    })
}

/*
 * Save setting
 */
function saveSetting(entry) {
    const cmd = encodeURIComponent(
        "[ESP401]P=" + entry.P + " T=" + entry.T + " V=" + entry.currentValue
    )
    globaldispatch({
        type: Action.fetch_data,
    })
    SendCommand(cmd, saveSettingSuccess, saveSettingError)
}
/*
 * Export Settings
 *
 */
function exportSettings() {
    console.log("export")
    let data, file
    let p = 0
    const filename = "export.json"

    data = "{Settings: [\n"
    for (let entry of esp3dFWSettings.Settings) {
        if (p != 0) data += ","
        data += '{P:"' + entry.P + '",T:"' + entry.T + '",V:"' + entry.V + '"}\n'
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
 * Settings page
 *
 */
export const Esp3DSettings = ({ currentPage }) => {
    if (currentPage != Setting.esp3d) return null
    if (preferences && preferences.settings.autoload) {
        if (preferences.settings.autoload == "true" && !isloaded) loadSettings()
    }
    const listSettings = []
    if (esp3dFWSettings.Settings) {
        let currentfilter = ""
        for (let entry of esp3dFWSettings.Settings) {
            if (entry.F != currentfilter) {
                currentfilter = entry.F
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
                <button
                    type="button"
                    class="btn btn-primary"
                    title={T("S23")}
                    onClick={loadSettings}
                >
                    <RefreshCcw />
                    <span class="hide-low">{" " + T("S50")}</span>
                </button>{" "}
                <button
                    type="button"
                    class={
                        esp3dFWSettings.Settings ? "btn btn-primary" : " d-none"
                    }
                    title={T("S53")}
                    onClick={exportSettings}
                >
                    <ExternalLink />
                    <span class="hide-low">{" " + T("S52")}</span>
                </button>
                <br />
                <br />
            </center>
        </div>
    )
}
