/*
 speed.js - ESP3D WebUI feedrate (spped) control file

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
import { FeedRate } from "./icon"
import { useStoreon } from "storeon/preact"
import { esp3dSettings, preferences, getPanelIndex } from "../app"
import { useEffect } from "preact/hooks"
import { SendCommand } from "../http"
import { showDialog } from "../dialog"

/*
 * Local variables
 *
 */
let currentSpeed = "none"
let lastfeedrate = "none"

/*
 * sync feedrate with printer output
 */
function processFeedRate(msg) {
    let f
    const { dispatch } = useStoreon()
    if (typeof msg == "object") {
        f = parseInt(msg.sfactor)
        if (isNaN(f)) {
            f = "error"
        }
        if (dispatch) {
            dispatch("updateFeedRate", f)
            lastfeedrate = f
            updateState(currentSpeed, "speed_input")
        } else {
            console.log("no dispatch")
        }
    } else {
        let found = false
        switch (esp3dSettings.FWTarget) {
            case "repetier":
                if (msg.startsWith("SpeedMultiply:")) {
                    f = msg
                    f = f.replace("SpeedMultiply:", "")
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
                if (msg.startsWith("FR:") && msg.indexOf("%") != -1) {
                    f = msg
                    f = f.replace("FR:", "")
                    f = parseInt(f)
                    if (isNaN(f)) {
                        f = "error"
                    }
                    found = true
                }
                break
            case "smoothieware":
                if (
                    msg.startsWith("Speed factor at ") &&
                    msg.indexOf("%") != -1
                ) {
                    f = msg
                    f = f.replace("Speed factor at ", "")
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
            const { dispatch } = useStoreon()
            if (dispatch) {
                dispatch("updateFeedRate", f)
                lastfeedrate = f
                updateState(currentSpeed, "speed_input")
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
    if (index == "speed_input") {
        controlId = document.getElementById(index)
    }
    if (controlId) {
        controlId.classList.remove("is-invalid")
        controlId.classList.remove("is-changed")
        switch (state) {
            case "modified":
                controlId.classList.add("is-changed")
                if (index == "speed_input") {
                    document
                        .getElementById("speed_unit")
                        .classList.remove("error")
                    document
                        .getElementById("speed_unit")
                        .classList.add("bg-warning")
                    document
                        .getElementById("speed_sendbtn")
                        .classList.remove("invisible")
                    document
                        .getElementById("speedslider")
                        .classList.remove("error")
                    document
                        .getElementById("speedslider")
                        .classList.add("is-changed")
                }
                break
            case "success":
                controlId.classList.add("is-valid")
                break
            case "error":
                controlId.classList.add("is-invalid")
                if (index == "speed_input") {
                    document.getElementById("speed_unit").classList.add("error")
                    document
                        .getElementById("speed_unit")
                        .classList.remove("bg-warning")
                    document
                        .getElementById("speed_sendbtn")
                        .classList.add("invisible")
                    document
                        .getElementById("speedslider")
                        .classList.add("error")
                    document
                        .getElementById("speedslider")
                        .classList.remove("is-changed")
                }
                break
            default:
                if (index == "speed_input") {
                    document
                        .getElementById("speed_unit")
                        .classList.remove("error")

                    document
                        .getElementById("speed_unit")
                        .classList.remove("bg-warning")
                    document
                        .getElementById("speed_sendbtn")
                        .classList.add("invisible")
                    document
                        .getElementById("speedslider")
                        .classList.remove("error")
                    document
                        .getElementById("speedslider")
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
        if (index == "speed_input") {
            if (entry != lastfeedrate) {
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
const FeedRateSlider = () => {
    if (currentSpeed == "none") {
        currentSpeed = lastfeedrate
    }
    const onInputSpeedSlider = e => {
        document.getElementById("speed_input").value = e.target.value
        currentSpeed = e.target.value
        updateState(e.target.value, "speed_input")
    }
    const onInputSpeedInput = e => {
        document.getElementById("speedslider").value = e.target.value
        currentSpeed = e.target.value
        updateState(e.target.value, "speed_input")
    }
    const onSet = e => {
        let cmd = "M220 S" + currentSpeed
        SendCommand(cmd, null, sendCommandError)
    }
    useEffect(() => {
        updateState(currentSpeed, "speed_input")
    }, [currentSpeed])
    return (
        <div class="input-group justify-content-center rounded">
            <div class="slider-control hide-low">
                <div class="slidecontainer">
                    <input
                        onInput={onInputSpeedSlider}
                        type="range"
                        min="1"
                        max="300"
                        value={isNaN(currentSpeed) ? "" : currentSpeed}
                        class="slider"
                        id="speedslider"
                    />
                </div>
            </div>
            <input
                style="max-width:6rem!important;"
                onInput={onInputSpeedInput}
                type="number"
                min="1"
                max="300"
                value={isNaN(currentSpeed) ? "" : currentSpeed}
                class="form-control"
                id="speed_input"
            />

            <div class="input-group-append">
                <span class="input-group-text" id="speed_unit">
                    %
                </span>
                <button
                    id="speed_sendbtn"
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
 * Feedrate panel control
 *
 */
const FeedratePanel = () => {
    const { showFeedRate } = useStoreon("showFeedRate")
    const { panelsOrder } = useStoreon("panelsOrder")
    let index = getPanelIndex(panelsOrder, "feedrate")
    if (!showFeedRate) {
        return null
    }
    const toogle = e => {
        const { dispatch } = useStoreon()
        dispatch("panel/showfeedrate", false)
    }
    const onSet100 = e => {
        document.getElementById("speedslider").value = 100
        currentSpeed = 100
        document.getElementById("speed_input").value = 100
        updateState(100, "speed_input")
    }
    const onReset = e => {
        document.getElementById("speedslider").value = lastfeedrate
        currentSpeed = lastfeedrate
        document.getElementById("speed_input").value = lastfeedrate
        updateState(lastfeedrate, "speed_input")
    }
    let panelClass = "order-" + index + " w-100 panelCard"
    return (
        <div class={panelClass}>
            <div class="p-2 ">
                <div class="border rounded p-2 panelCard">
                    <div class="w-100">
                        <div class="d-flex flex-wrap">
                            <div class="p-1">
                                <FeedRate />
                                <span class="hide-low control-like text-button">
                                    {T("P12")}
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
                        <FeedRateSlider />
                    </div>
                </div>
            </div>
        </div>
    )
}

export { FeedratePanel, processFeedRate }
