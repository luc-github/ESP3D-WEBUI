/*
 jog.js - ESP3D WebUI job file

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
    ZapOff,
    AlertCircle,
    Activity,
    Send,
    Home,
    Crosshair,
} from "preact-feather"
import { defaultMachineValues } from "./preferences"
import { useEffect } from "preact/hooks"
import { SendCommand } from "../http"
import { globaldispatch, Action, esp3dSettings } from "../app"

/*
 * Local variables
 *
 */
let lastSpeed = 100
let currentSpeed = 100
let currentFeedRate = []
let hasError = []
let jogDistance = 100

/*
 * sync feedrate with printer output
 */
function processFeedRate(msg) {
    if (msg.startsWith("FR:") && msg.indexOf("%") != -1) {
        let f = msg
        f = f.replace("FR:", "")
        f = parseInt(f)
        console.log(f)
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
    globaldispatch({
        type: Action.error,
        errorcode: errorCode,
        msg: "S5",
    })
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
        SendCommand(encodeURIComponent(cmd), null, sendCommandError)
    }
    useEffect(() => {
        updateState(currentSpeed, "speed_input")
    }, [currentSpeed])
    return (
        <div class="input-group justify-content-center">
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
                    class="btn btn-default"
                    type="button"
                    onClick={onReset}
                    title={T("100%")}
                >
                    %
                </button>
                <button
                    id="speed_sendbtn"
                    class="btn btn-warning invisible"
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
 * FeedRate input control
 *
 */
const FeedRateInput = ({ entry, label, id }) => {
    const onInput = e => {
        currentFeedRate[id] = e.target.value
        updateState(e.target.value, id)
    }
    useEffect(() => {
        updateState(entry, id)
    }, [entry])
    return (
        <div class="p-2">
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text" id={id + "_joglabel"}>
                        {label}
                    </span>
                </div>
                <input
                    type="number"
                    min="1"
                    style="max-width:10em"
                    class="form-control"
                    placeholder={T("S41")}
                    value={entry}
                    oninput={onInput}
                    id={id + "_jogfeedrate"}
                />
                <div class="input-group-append">
                    <span
                        class="input-group-text hide-low"
                        id={id + "_jogunit"}
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
 * Jog panel
 *
 */
const JogPanel = ({ preferences }) => {
    const sendHomeCommand = e => {
        let cmd
        let id
        if (e.target.classList.contains("btn")) {
            id = e.target.id
        } else {
            id = e.target.parentElement.id
            e.target.classList.add("std")
            e.target.classList.remove("pressedbutton")
        }
        switch (id) {
            case "HomeX":
                cmd = "G28 X0"
                break
            case "HomeY":
                cmd = "G28 Y0"
                break
            case "HomeZ":
                cmd = "G28 Z0"
                break
            case "HomeAll":
            default:
                cmd = "G28"
                break
        }
        SendCommand(encodeURIComponent(cmd), null, sendCommandError)
    }

    const onMouseDown = e => {
        e.target.classList.add("pressedbutton")
        e.target.classList.remove("std")
    }

    const onOut = e => {
        e.target.classList.add("std")
        e.target.classList.remove("pressedbutton")
    }

    const sendJogCommand = e => {
        let cmd
        let id
        let distance
        let feedrate
        if (e.target.classList.contains("btn")) {
            id = e.target.id
        } else {
            id = e.target.parentElement.id
            e.target.classList.add("std")
            e.target.classList.remove("pressedbutton")
        }
        if (
            (hasError["xyfeedrate"] &&
                (id.startsWith("X") || id.startsWith("Y"))) ||
            (hasError["zfeedrate"] && id.startsWith("Z"))
        ) {
            globaldispatch({
                type: Action.error,
                errorcode: 500,
                msg: "S83",
            })
            return
        }
        switch (id) {
            case "Xplus":
                distance = "X" + jogDistance
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "Xminus":
                distance = "X-" + jogDistance
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "X+100":
                distance = "X100"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "X-100":
                distance = "X-100"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "X+10":
                distance = "X10"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "X-10":
                distance = "X-10"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "X+1":
                distance = "X1"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "X-1":
                distance = "X-1"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "X+0_1":
                distance = "X0.1"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "X-0_1":
                distance = "X-0.1"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "Yplus":
                distance = "Y" + jogDistance
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "Yminus":
                distance = "Y-" + jogDistance
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "Y+100":
                distance = "Y100"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "Y-100":
                distance = "Y-100"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "Y+10":
                distance = "Y10"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "Y-10":
                distance = "Y-10"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "Y+1":
                distance = "Y1"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "Y-1":
                distance = "Y-1"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "Y+0_1":
                distance = "Y0.1"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "Y-0_1":
                distance = "Y-0.1"
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "Zplus":
                distance = "Z" + jogDistance
                feedrate = currentFeedRate["zfeedrate"]
                break
            case "Zminus":
                distance = "Z-" + jogDistance
                feedrate = currentFeedRate["zfeedrate"]
                break
            case "Z+100":
                distance = "Z100"
                feedrate = currentFeedRate["zfeedrate"]
                break
            case "Z-100":
                distance = "Z-100"
                feedrate = currentFeedRate["zfeedrate"]
                break
            case "Z+10":
                distance = "Z10"
                feedrate = currentFeedRate["zfeedrate"]
                break
            case "Z-10":
                distance = "Z-10"
                feedrate = currentFeedRate["zfeedrate"]
                break
            case "Z+1":
                distance = "Z1"
                feedrate = currentFeedRate["zfeedrate"]
                break
            case "Z-1":
                distance = "Z-1"
                feedrate = currentFeedRate["zfeedrate"]
                break
            case "Z+0_1":
                distance = "Z0.1"
                feedrate = currentFeedRate["zfeedrate"]
                break
            case "Z-0_1":
                distance = "Z-0.1"
                feedrate = currentFeedRate["zfeedrate"]
                break
            default:
                console.log("unknow id:" + id)
                return
                break
        }
        cmd = "G91\nG1 " + distance + " F" + feedrate + "\nG90"
        SendCommand(encodeURIComponent(cmd), null, sendCommandError)
    }

    const sendMoveCommand = e => {
        if (e.target.classList.contains("btn")) {
            //nothing
        } else {
            e.target.classList.add("std")
            e.target.classList.remove("pressedbutton")
        }
        if (hasError["xyfeedrate"] || hasError["zfeedrate"]) {
            globaldispatch({
                type: Action.error,
                errorcode: 500,
                msg: "S83",
            })
            return
        }
        let cmd =
            "G1 X" +
            preferences.xpos +
            " Y" +
            preferences.ypos +
            " F" +
            currentFeedRate["xyfeedrate"]
        SendCommand(encodeURIComponent(cmd), null, sendCommandError)
    }

    const onHoverJog = e => {
        switch (e.target.parentElement.id) {
            case "X+100":
            case "Y+100":
            case "X-100":
            case "Y-100":
                document.getElementById("xy100").style.opacity = "1"
                break
            case "X+10":
            case "Y+10":
            case "X-10":
            case "Y-10":
                document.getElementById("xy10").style.opacity = "1"
                break
            case "X+1":
            case "Y+1":
            case "X-1":
            case "Y-1":
                document.getElementById("xy1").style.opacity = "1"
                break
            case "X+0_1":
            case "Y+0_1":
            case "X-0_1":
            case "Y-0_1":
                document.getElementById("xy0_1").style.opacity = "1"
                break
            case "Z+0_1":
            case "Z-0_1":
                document.getElementById("z0_1").style.opacity = "1"
                break
            case "Z+1":
            case "Z-1":
                document.getElementById("z1").style.opacity = "1"
                break
            case "Z+10":
            case "Z-10":
                document.getElementById("z10").style.opacity = "1"
                break
        }
    }

    const onOutJog = e => {
        onOut(e)
        switch (e.target.parentElement.id) {
            case "X+100":
            case "Y+100":
            case "X-100":
            case "Y-100":
                document.getElementById("xy100").style.opacity = "0.2"
                break
            case "X+10":
            case "Y+10":
            case "X-10":
            case "Y-10":
                document.getElementById("xy10").style.opacity = "0.2"
                break
            case "X+1":
            case "Y+1":
            case "X-1":
            case "Y-1":
                document.getElementById("xy1").style.opacity = "0.2"
                break
            case "X+0_1":
            case "Y+0_1":
            case "X-0_1":
            case "Y-0_1":
                document.getElementById("xy0_1").style.opacity = "0.2"
                break
            case "Z+0_1":
            case "Z-0_1":
                document.getElementById("z0_1").style.opacity = "0.2"
                break
            case "Z+1":
            case "Z-1":
                document.getElementById("z1").style.opacity = "0.2"
                break
            case "Z+10":
            case "Z-10":
                document.getElementById("z10").style.opacity = "0.2"
                break
        }
    }

    const onMouseDownJog = e => {
        onMouseDown(e)
    }
    const onCheck = e => {
        switch (e.target.id) {
            case "distanceRadio100":
                jogDistance = 100
                break
            case "distanceRadio10":
                jogDistance = 10
                break
            case "distanceRadio1":
                jogDistance = 1
                break
            case "distanceRadio0_1":
            default:
                jogDistance = 0.1
                break
        }
    }

    const emergencyStop = e => {
        SendCommand("M112", null, sendCommandError)
    }

    const disableMotor = e => {
        SendCommand("M84", null, sendCommandError)
    }

    if (typeof preferences.zfeedrate == "undefined")
        preferences.zfeedrate = defaultMachineValues("zfeedrate")
    if (typeof preferences.xyfeedrate == "undefined")
        preferences.xyfeedrate = defaultMachineValues("xyfeedrate")
    if (typeof preferences.xpos == "undefined")
        preferences.zfeedrate = defaultMachineValues("xpos")
    if (typeof preferences.ypos == "undefined")
        preferences.zfeedrate = defaultMachineValues("ypos")
    if (typeof currentFeedRate["xyfeedrate"] == "undefined")
        currentFeedRate["xyfeedrate"] = preferences.xyfeedrate
    if (typeof currentFeedRate["zfeedrate"] == "undefined")
        currentFeedRate["zfeedrate"] = preferences.zfeedrate
    return (
        <div>
            Axis:{esp3dSettings.NbAxis}
            <div class="d-flex flex-row justify-content-center">
                <div class="d-flex flex-column justify-content-center border">
                    <div class="p-2">
                        <button
                            class="btn btn-default"
                            id="Xplus"
                            onclick={sendJogCommand}
                        >
                            X+
                        </button>
                    </div>
                    <div class="p-2">
                        <button
                            class="btn btn-default"
                            id="HomeX"
                            onclick={sendHomeCommand}
                        >
                            <div class="no-pointer">
                                {" "}
                                <Home />
                            </div>
                        </button>
                    </div>
                    <div class="p-2">
                        <button
                            class="btn btn-default"
                            id="Xminus"
                            onclick={sendJogCommand}
                        >
                            X-
                        </button>
                    </div>
                </div>
                <div class="p-1" />
                <div class="d-flex flex-column justify-content-center border">
                    <div class="p-2">
                        <button
                            class="btn btn-default"
                            id="Yplus"
                            onclick={sendJogCommand}
                        >
                            Y+
                        </button>
                    </div>
                    <div class="p-2">
                        <button
                            class="btn btn-default"
                            id="HomeY"
                            onclick={sendHomeCommand}
                        >
                            <div class="no-pointer">
                                {" "}
                                <Home />
                            </div>
                        </button>
                    </div>
                    <div class="p-2">
                        <button
                            class="btn btn-default"
                            id="Yminus"
                            onclick={sendJogCommand}
                        >
                            Y-
                        </button>
                    </div>
                </div>
                <div class="p-1" />
                <div class="d-flex flex-column justify-content-center border">
                    <div class="p-2">
                        <button
                            class="btn btn-default"
                            id="Zplus"
                            onclick={sendJogCommand}
                        >
                            Z+
                        </button>
                    </div>
                    <div class="p-2">
                        <button
                            class="btn btn-default"
                            id="HomeZ"
                            onclick={sendHomeCommand}
                        >
                            <div class="no-pointer">
                                {" "}
                                <Home />
                            </div>
                        </button>
                    </div>
                    <div class="p-2">
                        <button
                            class="btn btn-default"
                            id="Zminus"
                            onclick={sendJogCommand}
                        >
                            Z-
                        </button>
                    </div>
                </div>
                <div class="p-1" />
                <div class="d-flex flex-column justify-content-left border p-1">
                    <span class="badge badge-secondary">mm</span>
                    <div class="p-1">
                        <div class="form-check">
                            <input
                                class="form-check-input"
                                type="radio"
                                name="distanceRadio"
                                id="distanceRadio100"
                                value="option1"
                                checked={jogDistance == 100 ? true : false}
                                onChange={onCheck}
                            />
                            <label
                                class="form-check-label"
                                for="distanceRadio100"
                                style="width:2rem"
                            >
                                100
                            </label>
                        </div>
                    </div>
                    <div class="p-1">
                        <div class="form-check">
                            <input
                                class="form-check-input"
                                type="radio"
                                name="distanceRadio"
                                id="distanceRadio10"
                                value="option1"
                                checked={jogDistance == 10 ? true : false}
                                onChange={onCheck}
                            />
                            <label
                                class="form-check-label"
                                for="distanceRadio10"
                                style="width:2rem"
                            >
                                10
                            </label>
                        </div>
                    </div>
                    <div class="p-1">
                        <div class="form-check justify-content-left">
                            <input
                                class="form-check-input"
                                type="radio"
                                name="distanceRadio"
                                id="distanceRadio1"
                                value="option1"
                                checked={jogDistance == 1 ? true : false}
                                onChange={onCheck}
                            />
                            <label
                                class="form-check-label"
                                for="distanceRadio1"
                                style="width:2rem"
                            >
                                1
                            </label>
                        </div>
                    </div>
                    <div class="p-1">
                        <div class="form-check ">
                            <input
                                class="form-check-input"
                                type="radio"
                                name="distanceRadio"
                                id="distanceRadio0_1"
                                value="option1"
                                checked={jogDistance == 0.1 ? true : false}
                                onChange={onCheck}
                            />
                            <label
                                class="form-check-label"
                                for="distanceRadio0_1"
                                style="width:2rem"
                            >
                                0.1
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex flex-row justify-content-center">
                <div class="p-2">
                    <button
                        class="btn btn-default"
                        id="HomeAll"
                        onclick={sendHomeCommand}
                        style="width:12rem"
                    >
                        <span class="no-pointer">
                            {" "}
                            <Home />
                        </span>
                        <span class="text-button">XYZ</span>
                    </button>
                </div>
                <div class="p-2">
                    <button
                        class="btn btn-default"
                        id="posxy"
                        onclick={sendMoveCommand}
                    >
                        <span class="no-pointer">
                            {" "}
                            <Crosshair />
                        </span>
                        <span class="text-button">XY </span>
                    </button>
                </div>
            </div>
            <div class="d-flex flex-wrap justify-content-center">
                <FeedRateInput
                    entry={currentFeedRate["xyfeedrate"]}
                    label={T("P10")}
                    id="xyfeedrate"
                />
                <FeedRateInput
                    entry={currentFeedRate["zfeedrate"]}
                    label={T("P11")}
                    id="zfeedrate"
                />

                <div class="p-2">
                    <button
                        type="button"
                        class="btn btn-primary"
                        onclick={disableMotor}
                    >
                        <ZapOff size="1.4em" />
                        <span class="hide-low text-button">{T("P13")}</span>
                    </button>
                </div>
                <div class="p-2">
                    <div class="p-1 bg-warning">
                        <button
                            type="button"
                            class="btn btn-sm btn-danger"
                            onclick={emergencyStop}
                        >
                            <AlertCircle size="1.4em" />
                            <span class="hide-low text-button">{T("P15")}</span>
                        </button>
                    </div>
                </div>
            </div>
            <FeedRateSlider />
        </div>
    )
}

export { JogPanel, processFeedRate }
