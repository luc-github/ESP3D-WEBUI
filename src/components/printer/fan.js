/*
 fan.js - ESP3D WebUI fan control file

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
import { Fan } from "./icon"
import { useStoreon } from "storeon/preact"
import { esp3dSettings, preferences, getPanelIndex } from "../app"
import { useEffect } from "preact/hooks"
import { SendCommand } from "../http"
import { showDialog } from "../dialog"

/*
 * Local variables
 *
 */
let currentPercent = "none"
let lastfanpercent = "none"

/*
 * sync fan with printer output
 */
function processFanPercent(msg) {
    let f
    const { dispatch } = useStoreon()
    if (typeof msg == "object") {
        f = Math.round(parseFloat(msg.fanPercent[0]))
        if (isNaN(f)) {
            f = "error"
        }
        if (dispatch) {
            dispatch("updateFanPercent", f)
            lastfanpercent = f
            updateState(currentPercent, "fan_input")
        } else {
            console.log("no dispatch")
        }
    } else {
        let found = false
        switch (esp3dSettings.FWTarget) {
            case "repetier":
                if (msg.startsWith("Fanspeed:")) {
                    f = msg
                    f = f.replace("Fanspeed:", "")
                    f = parseInt(f)
                    if (isNaN(f)) {
                        f = "error"
                    } else {
                        //M106 does not use % but 0 to 255
                        f = Math.round((100 * f) / 255)
                    }
                    found = true
                }
                break
            case "marlin-embedded":
            case "marlin":
            case "marlinkimbra":
            case "smoothieware":
            default:
                return
        }
        if (found) {
            const { dispatch } = useStoreon()
            if (dispatch) {
                dispatch("updateFanPercent", f)
                lastfanpercent = f
                updateState(currentPercent, "fan_input")
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
    if (index == "fan_input") {
        controlId = document.getElementById(index)
    }
    if (controlId) {
        controlId.classList.remove("is-invalid")
        controlId.classList.remove("is-changed")
        switch (state) {
            case "modified":
                controlId.classList.add("is-changed")
                if (index == "fan_input") {
                    document
                        .getElementById("fan_unit")
                        .classList.remove("error")
                    document
                        .getElementById("fan_unit")
                        .classList.add("bg-warning")
                    document
                        .getElementById("fan_sendbtn")
                        .classList.remove("invisible")
                    document
                        .getElementById("fanslider")
                        .classList.remove("error")
                    document
                        .getElementById("fanslider")
                        .classList.add("is-changed")
                }
                break
            case "success":
                controlId.classList.add("is-valid")
                break
            case "error":
                controlId.classList.add("is-invalid")
                if (index == "fan_input") {
                    document.getElementById("fan_unit").classList.add("error")
                    document
                        .getElementById("fan_unit")
                        .classList.remove("bg-warning")
                    document
                        .getElementById("fan_sendbtn")
                        .classList.add("invisible")
                    document.getElementById("fanslider").classList.add("error")
                    document
                        .getElementById("fanslider")
                        .classList.remove("is-changed")
                }
                break
            default:
                if (index == "fan_input") {
                    document
                        .getElementById("fan_unit")
                        .classList.remove("error")

                    document
                        .getElementById("fan_unit")
                        .classList.remove("bg-warning")
                    document
                        .getElementById("fan_sendbtn")
                        .classList.add("invisible")
                    document
                        .getElementById("fanslider")
                        .classList.remove("error")
                    document
                        .getElementById("fanslider")
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
    if (
        String(entry).length == 0 ||
        parseFloat(entry) < 0 ||
        parseFloat(entry) > 100 ||
        String(entry).indexOf(".") != -1 ||
        String(entry).indexOf("+") != -1
    )
        return false
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
        if (index == "fan_input") {
            if (entry != lastfanpercent) {
                state = "modified"
            }
        }
    }
    setState(index, state)
}

/*
 * FeedRate slider control
 *
 */
const FanSlider = () => {
    if (currentPercent == "none") {
        currentPercent = lastfanpercent
    }
    const onInputSpeedSlider = e => {
        document.getElementById("fan_input").value = e.target.value
        currentPercent = e.target.value
        updateState(e.target.value, "fan_input")
    }
    const onInputSpeedInput = e => {
        document.getElementById("fanslider").value = e.target.value
        currentPercent = e.target.value
        updateState(e.target.value, "fan_input")
    }
    const onSet = e => {
        //M106 does not use % but 0 to 255
        let cmd =
            "M106 S" + Math.round((parseFloat(currentPercent) * 255) / 100)
        SendCommand(cmd, null, sendCommandError)
    }
    useEffect(() => {
        updateState(currentPercent, "fan_input")
    }, [currentPercent])
    return (
        <div class="input-group justify-content-center rounded">
            <div class="slider-control hide-low">
                <div class="slidecontainer">
                    <input
                        onInput={onInputSpeedSlider}
                        type="range"
                        min="0"
                        max="100"
                        value={isNaN(currentPercent) ? "" : currentPercent}
                        class="slider"
                        id="fanslider"
                    />
                </div>
            </div>
            <input
                style="max-width:6rem!important;"
                onInput={onInputSpeedInput}
                type="number"
                min="0"
                max="100"
                value={isNaN(currentPercent) ? "" : currentPercent}
                class="form-control"
                id="fan_input"
            />

            <div class="input-group-append">
                <span class="input-group-text" id="fan_unit">
                    %
                </span>
                <button
                    id="fan_sendbtn"
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
 * Fan panel control
 *
 */
const FanPanel = () => {
    const { showFan } = useStoreon("showFan")
    const { panelsOrder } = useStoreon("panelsOrder")
    let index = getPanelIndex(panelsOrder, "fan")
    if (!showFan) {
        return null
    }
    const toogle = e => {
        const { dispatch } = useStoreon()
        dispatch("panel/showfan", false)
    }
    const onSet0 = e => {
        document.getElementById("fanslider").value = 0
        currentPercent = 0
        document.getElementById("fan_input").value = 0
        updateState(0, "fan_input")
    }
    const onSet100 = e => {
        document.getElementById("fanslider").value = 100
        currentPercent = 100
        document.getElementById("fan_input").value = 100
        updateState(100, "fan_input")
    }
    const onReset = e => {
        document.getElementById("fanslider").value = lastfanpercent
        currentPercent = lastfanpercent
        document.getElementById("fan_input").value = lastfanpercent
        updateState(lastfanpercent, "fan_input")
    }
    let panelClass = "order-" + index + " w-100 panelCard"
    return (
        <div class={panelClass}>
            <div class="p-2 ">
                <div class="border rounded p-2 panelCard">
                    <div class="w-100">
                        <div class="d-flex flex-wrap">
                            <div class="p-1">
                                <Fan />
                                <span class="hide-low control-like text-button">
                                    {T("P31")}
                                </span>
                            </div>
                            <div class="p-1" />
                            <div class="p-1">
                                <button
                                    type="button"
                                    class="btn btn-default"
                                    title="0%"
                                    onClick={onSet0}
                                >
                                    0%
                                </button>
                            </div>
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
                        <FanSlider />
                    </div>
                </div>
            </div>
        </div>
    )
}

export { FanPanel, processFanPercent }
