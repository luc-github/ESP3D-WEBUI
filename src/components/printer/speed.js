/*
 speed.js - ESP3D WebUI speed control file

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
import { Activity } from "preact-feather"
import { useStoreon } from "storeon/preact"
import { preferences } from "../app"
import { useEffect } from "preact/hooks"
import { SendCommand } from "../http"
import { showDialog } from "../dialog"

/*
 * Local variables
 *
 */
let lastSpeed = 100
let currentSpeed = 100

/*
 * sync feedrate with printer output
 */
function processFeedRate(msg) {
    if (msg.startsWith("FR:") && msg.indexOf("%") != -1) {
        let f = msg
        f = f.replace("FR:", "")
        f = parseInt(f)
        if (lastSpeed == currentSpeed) {
            if (currentSpeed != f) {
                currentSpeed = f
                lastSpeed = f
                document.getElementById("speed_input").value = f
                document.getElementById("speedslider").value = f
            }
        } else {
            lastSpeed = f
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
    let controlLabel
    let controlUnit
    if (document.getElementById(index + "_jogfeedrate")) {
        controlId = document.getElementById(index + "_jogfeedrate")
    }
    if (index == "speed_input") {
        controlId = document.getElementById(index)
    }
    if (document.getElementById(index + "_joglabel")) {
        controlLabel = document.getElementById(index + "_joglabel")
    }
    if (document.getElementById(index + "_jogunit")) {
        controlUnit = document.getElementById(index + "_jogunit")
    }
    if (controlId) {
        controlId.classList.remove("is-invalid")
        controlId.classList.remove("is-changed")
        switch (state) {
            case "modified":
                controlId.classList.add("is-changed")
                if (index == "speed_input") {
                    document
                        .getElementById("speed_resetbtn")
                        .classList.remove("btn-danger")
                    document
                        .getElementById("speed_resetbtn")
                        .classList.remove("btn-default")
                    document
                        .getElementById("speed_resetbtn")
                        .classList.add("btn-warning")
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
                    document
                        .getElementById("speed_resetbtn")
                        .classList.add("btn-danger")
                    document
                        .getElementById("speed_resetbtn")
                        .classList.remove("btn-default")
                    document
                        .getElementById("speed_resetbtn")
                        .classList.remove("btn-warning")
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
                        .getElementById("speed_resetbtn")
                        .classList.remove("btn-danger")
                    document
                        .getElementById("speed_resetbtn")
                        .classList.add("btn-default")
                    document
                        .getElementById("speed_resetbtn")
                        .classList.remove("btn-warning")
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
    if (controlLabel) {
        controlLabel.classList.remove("error")
        controlLabel.classList.remove("success")
        controlLabel.classList.remove("bg-warning")
        switch (state) {
            case "modified":
                controlLabel.classList.add("bg-warning")
                break
            case "success":
                controlLabel.classList.add("success")
                break
            case "error":
                controlLabel.classList.add("error")
                break
            default:
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
        hasError[index] = true
    } else {
        hasError[index] = false
        if (index == "speed_input") {
            if (entry != lastSpeed) {
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
    const onReset = e => {
        document.getElementById("speedslider").value = 100
        currentSpeed = 100
        document.getElementById("speed_input").value = 100
        updateState(100, "speed_input")
    }
    const onSet = e => {
        let cmd = "M220 S" + currentSpeed
        lastSpeed = currentSpeed
        updateState(currentSpeed, "speed_input")
        SendCommand(cmd, null, sendCommandError)
    }
    useEffect(() => {
        updateState(currentSpeed, "speed_input")
    }, [currentSpeed])
    return (
        <div class="input-group justify-content-center rounded">
            <div class="input-group-prepend">
                <span class="input-group-text" id="speed_input_joglabel">
                    <Activity />
                    <span class="hide-low text-button">{T("P12")}</span>
                </span>
            </div>
            <div class="slider-control hide-low">
                <div class="slidecontainer">
                    <input
                        onInput={onInputSpeedSlider}
                        type="range"
                        min="1"
                        max="300"
                        value={currentSpeed}
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
                value={currentSpeed}
                class="form-control"
                id="speed_input"
            />

            <div class="input-group-append">
                <button
                    id="speed_resetbtn"
                    class="btn btn-default rounded-right"
                    type="button"
                    onClick={onReset}
                    title={T("100%")}
                >
                    %
                </button>
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

export { processFeedRate }
