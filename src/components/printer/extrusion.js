/*
 extrusion.js - ESP3D WebUI extrusion panel control file

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
import { X } from "preact-feather"
import { useStoreon } from "storeon/preact"
import { esp3dSettings, preferences, getPanelIndex } from "../app"
import { useEffect } from "preact/hooks"
import { SendCommand } from "../http"
import { showDialog } from "../dialog"
import { Extruder } from "./icon"

/*
 * Local variables
 *
 */
let currentExtruder = 1
let currentFeedRate
let extrudeDistance = 10
let userextrudeDistance = 5
let userextrudeselected = false
let mixedpercent = []
let islocked = []

/*
 * Send command query error
 */
function sendCommandError(errorCode, responseText) {
    showDialog({ type: "error", numError: errorCode, message: T("S5") })
}

/*
 * Set control UI according state
 *
 */
function setState(id, state) {
    let controlId
    let controlUnit
    controlId = document.getElementById(id + "_input")
    if (controlId) {
        controlId.classList.remove("is-invalid")
        controlId.classList.remove("is-changed")
        switch (state) {
            case "modified":
                controlId.classList.add("is-changed")
                document.getElementById(id + "_unit").classList.remove("error")
                document
                    .getElementById(id + "_unit")
                    .classList.add("bg-warning")
                document
                    .getElementById(id + "_sendbtn")
                    .classList.remove("invisible")
                document.getElementById(id + "slider").classList.remove("error")
                document
                    .getElementById(id + "slider")
                    .classList.add("is-changed")
                break
            case "success":
                controlId.classList.add("is-valid")
                break
            case "error":
                controlId.classList.add("is-invalid")

                document.getElementById(id + "_unit").classList.add("error")
                document
                    .getElementById(id + "_unit")
                    .classList.remove("bg-warning")
                document
                    .getElementById(id + "_sendbtn")
                    .classList.add("invisible")
                document.getElementById(id + "slider").classList.add("error")
                document
                    .getElementById(id + "slider")
                    .classList.remove("is-changed")
                break
            default:
                document.getElementById(id + "_unit").classList.remove("error")
                document
                    .getElementById(id + "_unit")
                    .classList.remove("bg-warning")
                break
        }
    }
    if (controlUnit) {
        controlUnit.classList.remove("error")
        controlUnit.classList.remove("success")
        controlUnit.classList.remove("bg-warning")
        switch (state) {
            case "modified":
                controlUnit.classList.add("bg-warning")
                break
            case "success":
                controlUnit.classList.add("success")
                break
            case "error":
                controlUnit.classList.add("error")
                break
            default:
                break
        }
    }
}

/*
 * Check control value
 *
 */
function checkValue(entry) {
    if (entry.length == 0 || entry <= 0) return false
    return true
}

/*
 * Update control state
 *
 */
function updateState(entry, id) {
    if (typeof entry == "undefined") {
        console.log("undefined state")
        return
    }
    let state = "default"
    if (!checkValue(entry)) {
        state = "error"
    }
    setState(id, state)
}

/*
 * FeedRate input control
 *
 */
const FeedRateInput = ({ id, label }) => {
    const onInput = e => {
        currentFeedRate = e.target.value
        updateState(currentFeedRate, id)
    }
    if (typeof currentFeedRate == "undefined")
        currentFeedRate = preferences.settings.efeedrate
    return (
        <div class="p-2">
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text" id={id + "_label"}>
                        {label}
                    </span>
                </div>
                <input
                    type="number"
                    min="1"
                    style="max-width:10em"
                    class="form-control rounded-right"
                    placeholder={T("S41")}
                    value={currentFeedRate}
                    oninput={onInput}
                    id={id + "_input"}
                />
                <div class="input-group-append ">
                    <span
                        class="input-group-text hide-low rounded-right"
                        id={id + "_unit"}
                    >
                        {T("P14")}
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
 * CheckboxControl
 */
const CheckboxControl = ({ id, label }) => {
    let ids = id.split("_")
    if (typeof islocked[parseInt(ids[1])] == "undefined")
        islocked[parseInt(ids[1])] = false
    const toggleCheckbox = e => {
        if (e.target.checked && !canLockMixer()) e.target.checked = false
        islocked[parseInt(ids[1])] = e.target.checked
    }
    return (
        <label class="checkbox-control locker" id={id}>
            {label}
            <input
                type="checkbox"
                checked={islocked[parseInt(ids[1])]}
                onChange={toggleCheckbox}
            />
            <span class="checkmark"></span>
        </label>
    )
}

/*
 * adjustMixer to be sure total proportion is 100%
 */
function adjustMixer(id, ignorezero = false) {
    let total = -100
    let next = -1
    let value
    total = -100
    for (let i = 0; i < preferences.settings.enumber; i++) {
        total += parseFloat(mixedpercent[i])
        if (!(i == id || islocked[i]) && next == -1) {
            if (ignorezero) {
                if (parseFloat(mixedpercent[i]) != 0) {
                    value = parseFloat(mixedpercent[i])
                    next = i
                }
            } else {
                value = parseFloat(mixedpercent[i])
                next = i
            }
        }
    }
    if (total == 0) {
        return
    }
    if (total < 0) {
        let newval = value - total
        mixedpercent[next] = newval
    } else {
        let newval = value - total
        if (newval < 0) {
            newval = 0
            mixedpercent[next] = newval
            if (canDecrease(id)) {
                adjustMixer(id, true)
            } else {
                let lockvalue = mixedpercent[id] - total
                mixedpercent[id] = lockvalue
            }
        } else {
            mixedpercent[next] = newval
        }
    }
    for (let i = 0; i < preferences.settings.enumber; i++) {
        document.getElementById("inputmixed_" + i).value = mixedpercent[i]
        document.getElementById("slidermixed_" + i).value = mixedpercent[i]
    }
}

/*
 * canDecrease check if can adjust or need to lock slider
 */
function canDecrease(id) {
    for (let i = 0; i < preferences.settings.enumber; i++) {
        if (!islocked[i] && i != id && mixedpercent[i] > 0) return true
    }
    return false
}

/*
 * canLockMixer to check if this control can be locked or not
 */
function canLockMixer() {
    let total = 0
    for (let i = 0; i < preferences.settings.enumber; i++) {
        if (islocked[i]) total++
    }
    if (preferences.settings.enumber - total > 2) return true
    return false
}

/*
 * MixedExtrusionPanel
 */
const MixedExtrusionPanel = ({ visible }) => {
    if (!visible || esp3dSettings.FWTarget == "smoothieware") return null
    const onChange = e => {
        let id = e.target.id.split("_")
        if (islocked[parseInt(id[1])]) {
            e.target.value = mixedpercent[parseInt(id[1])]
            return
        }
        mixedpercent[parseInt(id[1])] = parseInt(e.target.value)
        document.getElementById("inputmixed_" + id[1]).value = e.target.value
        adjustMixer(parseInt(id[1]))
    }
    const onInput = e => {
        let id = e.target.id.split("_")
        if (islocked[parseInt(id[1])]) {
            e.target.value = mixedpercent[parseInt(id[1])]
            return
        }
        if (e.target.value < 0 || isNaN(e.target.value)) e.target.value = 0
        if (e.target.value.length == 0) {
            mixedpercent[parseInt(id[1])] = 0
            e.target.value = ""
        } else mixedpercent[parseInt(id[1])] = parseInt(e.target.value)
        document.getElementById("slidermixed_" + id[1]).value =
            mixedpercent[parseInt(id[1])]
        adjustMixer(parseInt(id[1]))
    }
    let panel = []
    let bgcolors = preferences.settings.ecolors.split(";")
    for (let i = 0; i < preferences.settings.enumber; i++) {
        let line = []
        let colorbg
        if (typeof bgcolors[i] != "undefined") {
            colorbg = "background-color:" + bgcolors[i]
        }
        if (typeof mixedpercent[i] == "undefined") mixedpercent[i] = 0
        line.push(
            <div
                style="padding-top:0.5em"
                class={
                    preferences.settings.enumber > 2
                        ? "justify-content-center"
                        : "d-none"
                }
            >
                <CheckboxControl id={"lockMixed_" + i} />{" "}
            </div>
        )
        line.push(
            <div
                style={
                    "padding-left:0.5em!important;padding-right:0.5em!important;" +
                    colorbg
                }
                class="control-like border border-secondary rounded"
            >
                <span class="badge  badge-pill border border-secondary badge-light">
                    {String.fromCharCode(65 + i)}
                </span>
            </div>
        )
        line.push(<div class="p-1"></div>)
        line.push(
            <div class="slider-control hide-low">
                <div class="slidecontainer">
                    <input
                        onInput={onChange}
                        type="range"
                        min="0"
                        max="100"
                        value={mixedpercent[i]}
                        class="slider"
                        id={"slidermixed_" + i}
                    />
                </div>
            </div>
        )
        line.push(
            <div>
                <div class="input-group">
                    <input
                        class="form-control"
                        style="width:5em"
                        type="number"
                        id={"inputmixed_" + i}
                        min="0"
                        max="100"
                        oninput={onInput}
                        value={mixedpercent[i]}
                    />
                    <div class="input-group-append ">
                        <span class="input-group-text hide-low rounded-right">
                            %
                        </span>
                    </div>
                </div>
            </div>
        )
        panel.push(
            <div class="d-flex flex-wrap justify-content-center p-1 ">
                {line}
            </div>
        )
    }
    return <div class="d-flex flex-column">{panel}</div>
}

/*
 * Extrusion panel control
 *
 */
const ExtrusionPanel = () => {
    const { showExtrusion } = useStoreon("showExtrusion")
    const { TT } = useStoreon("TT")
    const { panelsOrder } = useStoreon("panelsOrder")
    let index = getPanelIndex(panelsOrder, "extrusion")
    if (!showExtrusion) {
        return null
    }
    const toogle = e => {
        const { dispatch } = useStoreon()
        dispatch("panel/showextrusion", false)
    }
    const onChange = e => {
        currentExtruder = e.target.value
    }
    const onExtrude = e => {
        let distance = extrudeDistance
        let cmd
        if (!preferences.settings.ismixedextruder) {
            cmd = "T" + (currentExtruder - 1) + "\n"
        } else {
            switch (esp3dSettings.FWTarget) {
                case "repetier":
                    //one command per extruder
                    cmd = ""
                    for (let i = 0; i < preferences.settings.enumber; i++) {
                        cmd += "M163 S" + i + "P" + mixedpercent[i] / 100 + "\n"
                    }
                    break
                case "marlin-embedded":
                case "marlin":
                case "marlinkimbra":
                    cmd = "M165 "
                    //one command for all extruders
                    for (let i = 0; i < preferences.settings.enumber; i++) {
                        cmd +=
                            String.fromCharCode(65 + i) +
                            mixedpercent[i] / 100 +
                            " "
                    }
                    cmd += "\n"
                    break
                case "smoothieware":
                    console.log(
                        "Smoothieware does not support properly mixed extrusion at this time"
                    )
                default:
                    break
            }
        }
        cmd += "G91\nG1 E"
        if (e.target.id == "reversebtn") distance = -distance
        cmd += distance + " F" + currentFeedRate + "\nG90"
        SendCommand(cmd, null, sendCommandError)
    }

    const onInput = e => {
        if (isNaN(e.target.value)) e.target.value = userextrudeDistance
        if (e.target.value < 0) e.target.value = Math.abs(e.target.value)
        if (e.target.value.length == 0) {
            e.target.value = ""
            userextrudeDistance = 0
        } else userextrudeDistance = e.target.value
        onCheck(e)
        extrudeDistance = userextrudeDistance
    }
    const onCheck = e => {
        let id
        switch (extrudeDistance) {
            case 100:
                id = "extrude100"
                break
            case 10:
                id = "extrude10"
                break
            case 1:
                id = "extrude1"
                break
            default:
                id = "extrudeuser"
                break
        }
        document.getElementById(id).classList.remove("btn-primary")
        document.getElementById(id).classList.add("btn-default")
        id = e.target.id
        userextrudeselected = false
        switch (id) {
            case "extrude100":
                extrudeDistance = 100
                break
            case "extrude10":
                extrudeDistance = 10
                break
            case "extrude1":
                extrudeDistance = 1
                break
            default:
                id = "extrudeuser"
                userextrudeselected = true
                extrudeDistance = userextrudeDistance
                break
        }
        document.getElementById(id).classList.add("btn-primary")
        document.getElementById(id).classList.remove("btn-default")
    }
    let extrudersids = []
    for (let i = 1; i <= TT.length; i++) {
        extrudersids.push(<option value={i}>{i}</option>)
    }
    let selectedextruder = []
    if (TT.length > 1) {
        selectedextruder.push(
            <select
                id="currentextruder"
                onchange={onChange}
                class="form-control"
                value={currentExtruder}
            >
                {extrudersids}
            </select>
        )
    }

    let panelClass = "order-" + index + " w-100 panelCard"
    return (
        <div class={panelClass}>
            <div class="p-2 ">
                <div class="border rounded p-2 panelCard">
                    <div class="w-100">
                        <div class="d-flex flex-wrap">
                            <div class="p-1">
                                <Extruder />
                                <span class="hide-low control-like text-button">
                                    {T("P32")}
                                </span>
                            </div>
                            <div
                                class={
                                    !preferences.settings.ismixedextruder
                                        ? "p-1"
                                        : "d-none"
                                }
                            >
                                {selectedextruder}
                            </div>
                            <div class="p-1" />
                            <div class="ml-auto text-right">
                                <button
                                    type="button"
                                    class="btn btn-light btn-sm red-hover"
                                    title={T("S86")}
                                    onClick={toogle}
                                >
                                    <X />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="p-1" />
                    <div class="d-flex flex-wrap justify-content-center">
                        <FeedRateInput id="extrusion" label={T("P50")} />
                    </div>
                    <div class="p-1" />
                    <div class="d-flex flex-wrap justify-content-center">
                        <div
                            class="d-flex flex-column border rounded"
                            title={T("P55")}
                        >
                            <span class="badge badge-secondary">mm</span>
                            <div class="d-flex flex-wrap justify-content-left  p-1">
                                <div class="p-1">
                                    <button
                                        style="width:4rem"
                                        class={
                                            extrudeDistance == 1
                                                ? userextrudeselected
                                                    ? "btn btn-default"
                                                    : "btn btn-primary"
                                                : "btn btn-default"
                                        }
                                        id="extrude1"
                                        onclick={onCheck}
                                    >
                                        1
                                    </button>
                                </div>
                                <div class="p-1">
                                    <button
                                        style="width:4rem"
                                        class={
                                            extrudeDistance == 10
                                                ? userextrudeselected
                                                    ? "btn btn-default"
                                                    : "btn btn-primary"
                                                : "btn btn-default"
                                        }
                                        id="extrude10"
                                        onclick={onCheck}
                                    >
                                        10
                                    </button>
                                </div>
                                <div class="p-1">
                                    <button
                                        style="width:4rem"
                                        class={
                                            extrudeDistance == 100
                                                ? userextrudeselected
                                                    ? "btn btn-default"
                                                    : "btn btn-primary"
                                                : "btn btn-default"
                                        }
                                        id="extrude100"
                                        onclick={onCheck}
                                    >
                                        100
                                    </button>
                                </div>
                                <div class="p-1">
                                    <div
                                        class={
                                            userextrudeselected
                                                ? "btn btn-primary p-1"
                                                : "btn btn-default p-1"
                                        }
                                        id="extrudeuser"
                                        onclick={onCheck}
                                    >
                                        <input
                                            type="number"
                                            min="0"
                                            class=" W4"
                                            id="extrudeuserinput"
                                            oninput={onInput}
                                            value={userextrudeDistance}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="p-1" />
                    <MixedExtrusionPanel
                        visible={preferences.settings.ismixedextruder}
                    />
                    <div
                        class={
                            preferences.settings.ismixedextruder
                                ? "p-1"
                                : "d-none"
                        }
                    />
                    <div class="d-flex flex-wrap justify-content-center">
                        <button
                            class="btn btn-dark"
                            onclick={onExtrude}
                            id="extrudebtn"
                        >
                            {T("P53")}
                        </button>
                        <div class="p-1" />
                        <button
                            class="btn btn-info"
                            onclick={onExtrude}
                            id="reversebtn"
                        >
                            {T("P54")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { ExtrusionPanel }
