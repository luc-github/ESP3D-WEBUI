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
import { RefreshCcw, RotateCcw, Upload, Search } from "preact-feather"
import { Setting, globaldispatch, Action } from "../app"
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
function setState(entry, state) {
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
    document.getElementById("setting" + entry).className = classSetting
    document.getElementById("button_setting" + entry).className = classButton
    document.getElementById("label_setting" + entry).className = classLabel
}

/*
 * Change state of control according context / check
 */
function updateState(entry) {
    let state
    if (entry.currentValue != entry.V) {
        if (checkValue(entry)) {
            state = "modified"
        } else {
            state = "error"
        }
    }
    setState(entry.P, state)
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
        for (let sub_key in entry.O[key]) {
            let sub_val = entry.O[key][sub_key]
            sub_val = sub_val.trim()
            sub_key = sub_key.trim()
            optionList.push(
                <option value={sub_val}>
                    {isNaN(sub_key) ? T(sub_key) : sub_key}
                </option>
            )
        }
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
const FlagEntry = ({ entry }) => {
    return <div></div>
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
        setState(res[1], "success")
        for (let entry of esp3dFWSettings.Settings) {
            if (entry.P == res[1]) {
                entry.V = entry.currentValue
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
 * Generate a UI for a setting
 */
const Entry = ({ entry }) => {
    if (typeof entry.currentValue == "undefined") {
        entry.V = entry.V.trim()
        entry.currentValue = entry.V
    }
    let e
    const onSet = e => {
        //entry.currentValue = e.target.value
        saveSetting(entry)
    }
    if (!entry.O) e = <InputEntry entry={entry} />
    else {
        if (entry.T != "F") e = <SelectEntry entry={entry} />
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
                {e}
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
            <div class="card">
                <div class="card-body">
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
                </button>
                <br />
                <br />
            </center>
        </div>
    )
}
