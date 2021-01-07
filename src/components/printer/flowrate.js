/*
flowrate.js - ESP3D WebUI flowrate control file

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
import { X, Send, RotateCcw } from "preact-feather"
import { FlowRate } from "./icon"
import { useStoreon } from "storeon/preact"
import { esp3dSettings, preferences, getPanelIndex } from "../app"
import { useEffect } from "preact/hooks"
import { SendCommand } from "../http"
import { showDialog } from "../dialog"

/*
 * Local variables
 *
 */
let currentFlow = "none"
let lastflowrate = "none"

/*
 * sync flowrate with printer output
 */
function processFlowRate(msg) {
    let f
    const { dispatch } = useStoreon()
    if (typeof msg == "object") {
        f = parseInt(msg.efactor[0])
        if (isNaN(f)) {
            f = "error"
        }
        if (dispatch) {
            dispatch("updateFlowRate", f)
            lastflowrate = f
            updateState(currentFlow, "flow_input")
        } else {
            console.log("no dispatch")
        }
    } else {
        let found = false
        switch (esp3dSettings.FWTarget) {
            case "repetier":
                if (msg.startsWith("FlowMultiply:")) {
                    f = msg
                    f = f.replace("FlowMultiply:", "")
                    f = parseInt(f)
                    if (isNaN(f)) {
                        f = "error"
                    }
                    found = true
                }
                break
            case "marlin-embedded":
            case "marlin":
            case "marlinkimbra":
                if (
                    msg.startsWith("echo:") &&
                    msg.indexOf("Flow:") &&
                    msg.indexOf("%") != -1
                ) {
                    f = msg
                    f = f.substring(f.indexOf("Flow:") + 5)
                    f = parseInt(f)
                    if (isNaN(f)) {
                        f = "error"
                    }
                    found = true
                }
                break
            case "smoothieware":
                if (msg.startsWith("Flow rate at ") && msg.indexOf("%") != -1) {
                    f = msg
                    f = f.replace("Flow rate at ", "")
                    f = parseInt(f)
                    if (isNaN(f)) {
                        f = "error"
                    }
                    found = true
                }
                break
            default:
                return
        }
        if (found) {
            if (dispatch) {
                dispatch("updateFlowRate", f)
                lastflowrate = f
                updateState(currentFlow, "flow_input")
            } else {
                console.log("no dispatch")
            }
        }
    }
}

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
function setState(index, state) {
    let controlId
    let controlUnit
    if (index == "flow_input") {
        controlId = document.getElementById(index)
    }
    if (controlId) {
        controlId.classList.remove("is-invalid")
        controlId.classList.remove("is-changed")
        switch (state) {
            case "modified":
                controlId.classList.add("is-changed")
                if (index == "flow_input") {
                    document
                        .getElementById("flow_unit")
                        .classList.remove("error")
                    document
                        .getElementById("flow_unit")
                        .classList.add("bg-warning")
                    document
                        .getElementById("flow_sendbtn")
                        .classList.remove("invisible")
                    document
                        .getElementById("flowslider")
                        .classList.remove("error")
                    document
                        .getElementById("flowslider")
                        .classList.add("is-changed")
                }
                break
            case "success":
                controlId.classList.add("is-valid")
                break
            case "error":
                controlId.classList.add("is-invalid")
                if (index == "flow_input") {
                    document.getElementById("flow_unit").classList.add("error")
                    document
                        .getElementById("flow_unit")
                        .classList.remove("bg-warning")
                    document
                        .getElementById("flow_sendbtn")
                        .classList.add("invisible")
                    document.getElementById("flowslider").classList.add("error")
                    document
                        .getElementById("flowslider")
                        .classList.remove("is-changed")
                }
                break
            default:
                if (index == "flow_input") {
                    document
                        .getElementById("flow_unit")
                        .classList.remove("error")

                    document
                        .getElementById("flow_unit")
                        .classList.remove("bg-warning")
                    document
                        .getElementById("flow_sendbtn")
                        .classList.add("invisible")
                    document
                        .getElementById("flowslider")
                        .classList.remove("error")
                    document
                        .getElementById("flowslider")
                        .classList.remove("is-changed")
                }
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
    if (entry.length == 0 || entry < 1) return false
    return true
}

/*
 * Update control state
 *
 */
function updateState(entry, index) {
    let state = "default"
    if (!checkValue(entry)) {
        state = "error"
    } else {
        if (index == "flow_input") {
            if (entry != lastflowrate) {
                state = "modified"
            }
        }
    }
    setState(index, state)
}

/*
 * FlowRate slider control
 *
 */
const FlowRateSlider = () => {
    if (currentFlow == "none") {
        currentFlow = lastflowrate
    }
    const onInputFlowSlider = e => {
        document.getElementById("flow_input").value = e.target.value
        currentFlow = e.target.value
        updateState(e.target.value, "flow_input")
    }
    const onInputFlowInput = e => {
        document.getElementById("flowslider").value = e.target.value
        currentFlow = e.target.value
        updateState(e.target.value, "flow_input")
    }
    const onSet = e => {
        let cmd = "M221 S" + currentFlow
        SendCommand(cmd, null, sendCommandError)
    }
    useEffect(() => {
        updateState(currentFlow, "flow_input")
    }, [currentFlow])
    return (
        <div class="input-group justify-content-center rounded">
            <div class="slider-control hide-low">
                <div class="slidecontainer">
                    <input
                        onInput={onInputFlowSlider}
                        type="range"
                        min="1"
                        max="300"
                        value={isNaN(currentFlow) ? "" : currentFlow}
                        class="slider"
                        id="flowslider"
                    />
                </div>
            </div>
            <input
                style="max-width:6rem!important;"
                onInput={onInputFlowInput}
                type="number"
                min="1"
                max="300"
                value={isNaN(currentFlow) ? "" : currentFlow}
                class="form-control"
                id="flow_input"
            />

            <div class="input-group-append">
                <span class="input-group-text" id="flow_unit">
                    %
                </span>
                <button
                    id="flow_sendbtn"
                    class="btn btn-warning invisible rounded-right"
                    type="button"
                    onClick={onSet}
                    title={T("S43")}
                >
                    <Send size="1.2em" />
                    <span class="hide-low text-button-setting">{T("S43")}</span>
                </button>
            </div>
            <div
                class="invalid-feedback text-center"
                style="text-align:center!important"
            >
                {T("S42")}
            </div>
        </div>
    )
}

/*
 * Flowrate panel control
 *
 */
const FlowratePanel = () => {
    const { showFlowRate } = useStoreon("showFlowRate")
    const { panelsOrder } = useStoreon("panelsOrder")
    let index = getPanelIndex(panelsOrder, "flowrate")
    if (!showFlowRate) {
        return null
    }
    const toogle = e => {
        const { dispatch } = useStoreon()
        dispatch("panel/showflowrate", false)
    }
    const onSet100 = e => {
        document.getElementById("flowslider").value = 100
        currentFlow = 100
        document.getElementById("flow_input").value = 100
        updateState(100, "flow_input")
    }
    const onReset = e => {
        document.getElementById("flowslider").value = lastflowrate
        currentFlow = lastflowrate
        document.getElementById("flow_input").value = lastflowrate
        updateState(lastflowrate, "flow_input")
    }
    let panelClass = "order-" + index + " w-100 panelCard"
    return (
        <div class={panelClass}>
            <div class="p-2 ">
                <div class="border rounded p-2 panelCard">
                    <div class="w-100">
                        <div class="d-flex flex-wrap">
                            <div class="p-1">
                                <FlowRate />
                                <span class="hide-low control-like text-button">
                                    {T("P30")}
                                </span>
                            </div>
                            <div class="p-1" />
                            <div class="p-1">
                                <button
                                    type="button"
                                    class="btn btn-default"
                                    title="100%"
                                    onClick={onSet100}
                                >
                                    100%
                                </button>
                            </div>
                            <div class="p-1">
                                <button
                                    type="button"
                                    class="btn btn-default"
                                    title={T("P19")}
                                    onClick={onReset}
                                >
                                    <RotateCcw size="1.2em" />
                                    <span class="hide-low text-button">
                                        {T("P19")}
                                    </span>
                                </button>
                            </div>
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
                        <div class="p-1" />
                        <FlowRateSlider />
                    </div>
                </div>
            </div>
        </div>
    )
}

export { FlowratePanel, processFlowRate }
