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
import { preferences, getPanelIndex } from "../app"
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
        let cmd = "T" + (currentExtruder - 1) + "\nG91\nG1 E"
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
                            <div class="p-1">{selectedextruder}</div>
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
