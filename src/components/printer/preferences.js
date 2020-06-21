/*
 preferences.js - ESP3D WebUI file

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
import { useEffect } from "preact/hooks"
import { useStoreon } from "storeon/preact"
import { showDialog } from "../dialog"
import { esp3dSettings, preferences, prefs } from "../app"

/*
 * Local variables
 *
 */

let hasError = []

/*
 * check if any active error
 */
function hasSettingError() {
    if (
        hasError["xyfeedrate"] ||
        hasError["zfeedrate"] ||
        hasError["xpos"] ||
        hasError["filesfilter"] ||
        hasError["ypos"]
    ) {
        return true
    }
    return false
}

/*
 * check entry is valid
 */
function checkValue(id) {
    const { dispatch } = useStoreon()
    let isvalid = true
    if (
        id == "filesfilter" ||
        id == "tftusb" ||
        id == "tftsd" ||
        id == "printersd"
    ) {
    } else {
        if (prefs[id] == null || isNaN(prefs[id])) {
            prefs[id] = ""
            isvalid = false
        } else {
            if (id == "xyfeedrate" || id == "zfeedrate") {
                if (prefs[id] < 1) isvalid = false
            }
            if (id == "xpos" || id == "ypos") {
            }
            if (id == "pollingrefresh") {
                if (prefs[id] < 1) isvalid = false
            }
        }
    }
    hasError[id] = !isvalid
    dispatch("error/set", hasSettingError())
    return isvalid
}

/*
 *Set state of control
 */
function setState(entry, state) {
    let controlId
    let controlIdLabel
    let controlIdUnit
    if (document.getElementById(entry + "-UI-checkbox"))
        controlId = document.getElementById(entry + "-UI-checkbox")
    if (document.getElementById(entry + "-UI-input")) {
        controlId = document.getElementById(entry + "-UI-input")
        controlIdLabel = document.getElementById(entry + "-UI-label")
        controlIdUnit = document.getElementById(entry + "-UI-unit")
    }
    if (document.getElementById(entry + "-UI-select")) {
        controlId = document.getElementById(entry + "-UI-select")
        controlIdLabel = document.getElementById(entry + "-UI-label")
    }
    if (controlId) {
        controlId.classList.remove("is-valid")
        controlId.classList.remove("is-changed")
        controlId.classList.remove("is-invalid")
        switch (state) {
            case "modified":
                controlId.classList.add("is-changed")
                break
            case "success":
                controlId.classList.add("is-valid")
                break
            case "error":
                controlId.classList.add("is-invalid")
                break
            default:
                break
        }
    }
    if (controlIdLabel) {
        controlIdLabel.classList.remove("error")
        controlIdLabel.classList.remove("success")
        controlIdLabel.classList.remove("bg-warning")
        switch (state) {
            case "modified":
                controlIdLabel.classList.add("bg-warning")
                break
            case "success":
                controlIdLabel.classList.add("success")
                break
            case "error":
                controlIdLabel.classList.add("error")
                break
            default:
                break
        }
    }
    if (controlIdUnit) {
        controlIdUnit.classList.remove("error")
        controlIdUnit.classList.remove("success")
        controlIdUnit.classList.remove("bg-warning")
        switch (state) {
            case "modified":
                controlIdUnit.classList.add("bg-warning")
                break
            case "success":
                controlIdUnit.classList.add("success")
                break
            case "error":
                controlIdUnit.classList.add("error")
                break
            default:
                break
        }
    }
}

/*
 * Change state of control according context / check
 */
function updateState(index) {
    let state = "default"
    hasError[index] = false
    if (prefs[index] != preferences.settings[index]) {
        if (checkValue(index)) {
            state = "modified"
        } else {
            state = "error"
        }
    }
    setState(index, state)
}

/*
 * MachineUIEntry
 */
const MachineUIEntry = ({ id, label, help, type }) => {
    const onInput = e => {
        if (type == "text") {
            prefs[id] = e.target.value
        } else {
            prefs[id] = parseInt(e.target.value)
        }
        updateState(id)
    }
    useEffect(() => {
        updateState(id)
    }, [prefs[id]])
    return (
        <div class="p-2">
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text" id={id + "-UI-label"}>
                        {label}
                    </span>
                </div>
                <input
                    id={id + "-UI-input"}
                    onInput={onInput}
                    type={type}
                    style="max-width:10em"
                    class="form-control rounded-right"
                    placeholder={T("S41")}
                    value={prefs[id]}
                />
                <div class="input-group-append">
                    <span
                        class="input-group-text hide-low rounded-right"
                        id={id + "-UI-unit"}
                    >
                        {help}
                    </span>
                </div>
                <div
                    class="invalid-feedback text-center"
                    style="text-align:center!important"
                >
                    {T("S42")}
                </div>
            </div>
        </div>
    )
}

/*
 * Init Default Machine Values
 */
function initDefaultMachineValues() {
    //defaults values in preferences
    if (typeof preferences.settings.xyfeedrate == "undefined") {
        preferences.settings.xyfeedrate = 1000
    }
    if (typeof preferences.settings.zfeedrate == "undefined") {
        preferences.settings.zfeedrate = 100
    }
    if (typeof preferences.settings.xpos == "undefined") {
        preferences.settings.xpos = 100
    }
    if (typeof preferences.settings.ypos == "undefined") {
        preferences.settings.ypos = 100
    }
    if (typeof preferences.settings.filesfilter == "undefined") {
        preferences.settings.filesfilter = "g;G;gco;GCO;gcode;GCODE"
    }
    if (typeof preferences.settings.tftsd == "undefined") {
        preferences.settings.tftsd = false
    }
    if (typeof preferences.settings.tftusb == "undefined") {
        preferences.settings.tftusb = false
    }
    if (typeof preferences.settings.printersd == "undefined") {
        if (esp3dSettings.SDConnection == "none")
            preferences.settings.printersd = true
        else preferences.settings.printersd = false
    }
    if (typeof preferences.settings.enablepolling == "undefined") {
        preferences.settings.enablepolling = false
    }
    if (typeof preferences.settings.pollingrefresh == "undefined") {
        preferences.settings.pollingrefresh = 3
    }
    if (typeof preferences.settings.pollingcommands == "undefined") {
        preferences.settings.pollingcommands = "M105;M114;M27"
    }

    //Copy values to current settings
    if (typeof prefs.xyfeedrate == "undefined") {
        prefs.xyfeedrate = preferences.settings.xyfeedrate
    }
    if (typeof prefs.xpos == "undefined") {
        prefs.xpos = preferences.settings.xpos
    }
    if (typeof prefs.ypos == "undefined") {
        prefs.ypos = preferences.settings.ypos
    }
    if (typeof prefs.zfeedrate == "undefined") {
        prefs.zfeedrate = preferences.settings.zfeedrate
    }
    if (typeof prefs.filesfilter == "undefined") {
        prefs.filesfilter = preferences.settings.filesfilter
    }
    if (typeof prefs.tftsd == "undefined") {
        prefs.tftsd = preferences.settings.tftsd
    }
    if (typeof prefs.tftusb == "undefined") {
        prefs.tftusb = preferences.settings.tftusb
    }
    if (typeof prefs.printersd == "undefined") {
        prefs.tftusb = preferences.settings.printersd
    }
    if (typeof prefs.enablepolling == "undefined") {
        prefs.enablepolling = preferences.settings.enablepolling
    }
    if (typeof prefs.pollingrefresh == "undefined") {
        prefs.pollingrefresh = preferences.settings.pollingrefresh
    }
    if (typeof prefs.pollingcommands == "undefined") {
        prefs.pollingcommands = preferences.settings.pollingcommands
    }
}

/*
 * CheckboxControl
 */
const CheckboxControl = ({ id, title, label }) => {
    const toggleCheckbox = e => {
        prefs[id] = e.target.checked
        updateState(id)
        showDialog({ displayDialog: false, refreshPage: true })
    }
    useEffect(() => {
        updateState(id)
    }, [prefs[id]])
    return (
        <label class="checkbox-control" id={id + "-UI-checkbox"} title={title}>
            {label}
            <input
                type="checkbox"
                checked={prefs[id]}
                onChange={toggleCheckbox}
            />
            <span class="checkmark"></span>
        </label>
    )
}

/*
 * Printer specific files settings
 *
 */
const MachineFilesPreferences = () => {
    return (
        <div>
            <MachineUIEntry
                id="filesfilter"
                label={T("S96")}
                help={T("S97")}
                type="text"
            />
            <div class="p-1" />
            <CheckboxControl id="printersd" title={T("P26")} label={T("P25")} />
            <div class="p-1" />
            <CheckboxControl id="tftsd" title={T("P23")} label={T("P21")} />
            <div class="p-1" />
            <CheckboxControl id="tftusb" title={T("P24")} label={T("P22")} />
        </div>
    )
}

const MachinePollingPreferences = () => {
    return (
        <div class="card">
            <div class="card-header">
                <CheckboxControl
                    id="enablepolling"
                    title={T("S112")}
                    label={T("S112")}
                />
            </div>
            <div class={prefs["enablepolling"] ? "card-body" : "d-none"}>
                <MachineUIEntry
                    id="pollingrefresh"
                    label={T("S113")}
                    help={T("S114")}
                    type="number"
                />
                <div class="p-1" />
                <MachineUIEntry
                    id="pollingcommands"
                    label={T("S115")}
                    help={T("S97")}
                    type="text"
                />
            </div>
        </div>
    )
}

/*
 * Printer specific settings
 *
 */
const MachineUIPreferences = () => {
    return (
        <div class="card">
            <div class="card-header">
                <CheckboxControl
                    id="showjogpanel"
                    title={T("S94")}
                    label={T("S94")}
                />
            </div>
            <div class={prefs["showjogpanel"] ? "card-body" : "d-none"}>
                <MachineUIEntry
                    id="xyfeedrate"
                    label={T("P10")}
                    help={T("P14")}
                    type="number"
                />
                <MachineUIEntry
                    id="zfeedrate"
                    label={T("P11")}
                    help={T("P14")}
                    type="number"
                />
                <div class="card">
                    <div class="card-header control-padding">{T("P18")}</div>
                    <div class="card-body padding-low">
                        <MachineUIEntry
                            id="xpos"
                            label="X"
                            help={T("P16")}
                            type="number"
                        />
                        <MachineUIEntry
                            id="ypos"
                            label="Y"
                            help={T("P16")}
                            type="number"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export {
    MachineUIPreferences,
    MachineFilesPreferences,
    initDefaultMachineValues,
    MachinePollingPreferences,
}
