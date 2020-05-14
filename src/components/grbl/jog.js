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
    AlertCircle,
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
                        {T("G8")}
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
                cmd = "G28"
                break
            default:
                console.log("unknow id:" + id)
                return
                break
        }
        SendCommand(encodeURIComponent(cmd), null, sendCommandError)
    }

    const sendJogCommand = e => {
        let cmd
        let id
        let distance
        let feedrate
        if (e.target.classList.contains("btn")) {
            id = e.target.id
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
            case "Yplus":
                distance = "Y" + jogDistance
                feedrate = currentFeedRate["xyfeedrate"]
                break
            case "Yminus":
                distance = "Y-" + jogDistance
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
            
            default:
                console.log("unknow id:" + id)
                return
                break
        }
        cmd = "G91\nG1 " + distance + " F" + feedrate + "\nG90"
        SendCommand(encodeURIComponent(cmd), null, sendCommandError)
    }

    const sendZeroCommand = e => {
        console.log(e.target.id)
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
    let allAxis = T("G3");
    let axis = "A"
    return (
        <div>
            Axis:{esp3dSettings.NbAxis}
            <div class="d-flex flex-row justify-content-center">
                <div class="d-flex flex-column justify-content-center border">
                    <div class="p-2" title={T("G11").replace("{axis}","X")} >
                        <button
                            class="btn btn-default jogbtn"
                            id="Xplus"
                            onclick={sendJogCommand}
                        >
                            X+
                        </button>
                    </div>
                    <div class="p-2" title={T("G9").replace("{axis}","X")}>
                        <button
                            class="btn btn-default jogbtn"
                            id="HomeX"
                            onclick={sendHomeCommand}
                        >
                            <div class="no-pointer">
                                {" "}
                                <Home />
                            </div>
                        </button>
                    </div>
                    <div class="p-2" title={T("G10").replace("{axis}","X")}>
                        <button
                            class="btn btn-default jogbtn"
                            id="ZeroX"
                            onclick={sendZeroCommand}
                        >
                            <span class="zeroLabel">&Oslash;</span>
                        </button>
                    </div>
                    <div class="p-2" title={T("G12").replace("{axis}","X")}>
                        <button
                            class="btn btn-default jogbtn"
                            id="Xminus"
                            onclick={sendJogCommand}
                        >
                            X-
                        </button>
                    </div>
                </div>
                <div class="p-1" />
                <div class="d-flex flex-column justify-content-center border">
                    <div class="p-2" title={T("G11").replace("{axis}","Y")}>
                        <button
                            class="btn btn-default jogbtn"
                            id="Yplus"
                            onclick={sendJogCommand}
                        >
                            Y+
                        </button>
                    </div>
                    <div class="p-2" title={T("G9").replace("{axis}","Y")}>
                        <button
                            class="btn btn-default jogbtn"
                            id="HomeY"
                            onclick={sendHomeCommand}
                        >
                            <div class="no-pointer">
                                <Home/>
                            </div>
                        </button>
                    </div>
                     <div class="p-2" title={T("G10").replace("{axis}","Y")}>
                        <button
                            class="btn btn-default jogbtn"
                            id="ZeroY"
                            onclick={sendZeroCommand}
                        >
                            <span class="zeroLabel">&Oslash;</span>
                        </button>
                    </div>
                    <div class="p-2" title={T("G12").replace("{axis}","Y")}>
                        <button
                            class="btn btn-default jogbtn"
                            id="Yminus"
                            onclick={sendJogCommand}
                        >
                            Y-
                        </button>
                    </div>
                </div>
                <div class="p-1" />
                <div class="d-flex flex-column justify-content-center border">
                    <div class="p-2" title={T("G11").replace("{axis}",axis)}>
                        <button
                            class="btn btn-default jogbtn"
                            id={axis+"plus"}
                            onclick={sendJogCommand}
                        >
                            {axis}+
                        </button>
                    </div>
                    <div class="p-2" title={T("G9").replace("{axis}",axis)}>
                        <button
                            class="btn btn-default jogbtn"
                            id={"Home" +axis}
                            onclick={sendHomeCommand}
                        >
                            <div class="no-pointer">
                                <Home />
                            </div>
                        </button>
                    </div>
                    <div class="p-2" title={T("G10").replace("{axis}",axis)}>
                        <button
                            class="btn btn-default jogbtn"
                            id={"Zero" + axis}
                            onclick={sendZeroCommand}
                        >
                            <span class="zeroLabel">&Oslash;</span>
                        </button>
                    </div>
                    <div class="p-2" title={T("G12").replace("{axis}",axis)}>
                        <button
                            class="btn btn-default jogbtn"
                            id={axis+"minus"}
                            onclick={sendJogCommand}
                        >
                            {axis}-
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
                <div class="p-2" title={T("G13")}>
                    <button
                        class="btn btn-default"
                        id="HomeAll"
                        onclick={sendHomeCommand}
                    >
                        <span class="no-pointer">
                            <Home size="1.3rem"/>
                        </span>
                        <span class="text-button axisLabel">{allAxis}</span>
                    </button>
                </div>
                 <div class="p-2" title={T("G14")}>
                    <button
                        class="btn btn-default"
                        id="ZeroAll"
                        onclick={sendZeroCommand}
                    >
                        <span class="zeroLabel">&Oslash;</span>
                        <span class="text-button axisLabel">{allAxis}</span>
                    </button>
                </div>
            </div>
            <div class="d-flex flex-wrap justify-content-center">
                <FeedRateInput
                    entry={currentFeedRate["xyfeedrate"]}
                    label={T("G4")}
                    id="xyfeedrate"
                />
                <FeedRateInput
                    entry={currentFeedRate["zfeedrate"]}
                    label={T("G5").replace("{axis}",axis)}
                    id="zfeedrate"
                />

                <div class="p-2">
                    <div class="p-1 bg-warning">
                        <button
                            type="button"
                            class="btn btn-sm btn-danger"
                            onclick={emergencyStop}
                        >
                            <AlertCircle size="1.4em" />
                            <span class="hide-low text-button">{T("G7")}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { JogPanel, processFeedRate }
