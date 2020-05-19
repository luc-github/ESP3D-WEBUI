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
import { AlertCircle, Send, Home, Crosshair } from "preact-feather"
import { defaultMachineValues } from "./preferences"
import { useEffect } from "preact/hooks"
import { SendCommand } from "../http"
import { esp3dSettings } from "../app"
import { useStoreon } from "storeon/preact"
import { showDialog } from "../dialog"

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
    //TODO
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
                        class="input-group-text hide-low rounded-right"
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
    const { axis } = useStoreon("axis")
    const sendHomeCommand = e => {
        let cmd
        let id
        if (e.target.classList.contains("btn")) {
            id = e.target.id
        }
        cmd = "$H"
        if (id != "HomeAll") {
            cmd += id[4]
        }
        console.log(cmd)
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
            (hasError["zfeedrate"] && id.startsWith("Z")) ||
            (hasError["afeedrate"] && id.startsWith("A")) ||
            (hasError["bfeedrate"] && id.startsWith("B")) ||
            (hasError["cfeedrate"] && id.startsWith("C"))
        ) {
            showDialog({ type: "error", numError: 500, message: T("S83") })
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
            case "Aplus":
                distance = "A" + jogDistance
                feedrate = currentFeedRate["afeedrate"]
                break
            case "Aminus":
                distance = "A-" + jogDistance
                feedrate = currentFeedRate["afeedrate"]
                break
            case "Bplus":
                distance = "B" + jogDistance
                feedrate = currentFeedRate["bfeedrate"]
                break
            case "Bminus":
                distance = "B-" + jogDistance
                feedrate = currentFeedRate["bfeedrate"]
                break
            case "Cplus":
                distance = "C" + jogDistance
                feedrate = currentFeedRate["cfeedrate"]
                break
            case "Cminus":
                distance = "C-" + jogDistance
                feedrate = currentFeedRate["cfeedrate"]
                break
            default:
                console.log("unknow id:" + id)
                return
                break
        }
        cmd = "$J=G91 G21 F" + feedrate + " " + distance
        console.log(cmd)
        SendCommand(encodeURIComponent(cmd), null, sendCommandError)
    }

    const sendZeroCommand = e => {
        let cmd = "G10 L20 P0 "
        let id = e.target.id
        if (id == "ZeroAll") {
            cmd += "X0 "
            if (esp3dSettings.NbAxis > 1) cmd += "Y0 "
            if (esp3dSettings.NbAxis > 2) cmd += "Z0 "
            if (esp3dSettings.NbAxis > 3) cmd += "A0 "
            if (esp3dSettings.NbAxis > 4) cmd += "B0 "
            if (esp3dSettings.NbAxis > 5) cmd += "C0 "
        } else {
            cmd += id[4] + "0"
        }
        SendCommand(encodeURIComponent(cmd), null, sendCommandError)
    }

    const onCheck = e => {
        let id = "distance100"
        switch (jogDistance) {
            case 100:
                id = "distance100"
                break
            case 10:
                id = "distance10"
                break
            case 1:
                id = "distance1"
                break
            case 0.1:
            default:
                id = "distance0_1"
                break
        }
        document.getElementById(id).classList.remove("btn-primary")
        document.getElementById(id).classList.add("btn-default")
        switch (e.target.id) {
            case "distance100":
                jogDistance = 100
                break
            case "distance10":
                jogDistance = 10
                break
            case "distance1":
                jogDistance = 1
                break
            case "distance0_1":
            default:
                jogDistance = 0.1
                break
        }
        document.getElementById(e.target.id).classList.add("btn-primary")
        document.getElementById(e.target.id).classList.remove("btn-default")
    }

    const emergencyStop = e => {
        SendCommand("M112", null, sendCommandError)
    }
    const selectChange = e => {
        const { dispatch } = useStoreon()
        dispatch("axis/set", e.target.value)
    }

    if (typeof preferences.zfeedrate == "undefined")
        preferences.zfeedrate = defaultMachineValues("zfeedrate")
    if (typeof preferences.xyfeedrate == "undefined")
        preferences.xyfeedrate = defaultMachineValues("xyfeedrate")
    if (typeof preferences.afeedrate == "undefined")
        preferences.afeedrate = defaultMachineValues("afeedrate")
    if (typeof preferences.bfeedrate == "undefined")
        preferences.bfeedrate = defaultMachineValues("bfeedrate")
    if (typeof preferences.cfeedrate == "undefined")
        preferences.cfeedrate = defaultMachineValues("cfeedrate")
    if (typeof currentFeedRate["xyfeedrate"] == "undefined")
        currentFeedRate["xyfeedrate"] = preferences.xyfeedrate
    if (typeof currentFeedRate["zfeedrate"] == "undefined")
        currentFeedRate["zfeedrate"] = preferences.zfeedrate
    if (typeof currentFeedRate["afeedrate"] == "undefined")
        currentFeedRate["afeedrate"] = preferences.afeedrate
    if (typeof currentFeedRate["bfeedrate"] == "undefined")
        currentFeedRate["bfeedrate"] = preferences.bfeedrate
    if (typeof currentFeedRate["cfeedrate"] == "undefined")
        currentFeedRate["cfeedrate"] = preferences.cfeedrate
    let allAxis = T("G3")
    let axisList = []
    if (esp3dSettings.NbAxis > 2) axisList.push(<option value="Z">Z</option>)
    if (esp3dSettings.NbAxis > 3) axisList.push(<option value="A">A</option>)
    if (esp3dSettings.NbAxis > 4) axisList.push(<option value="B">B</option>)
    if (esp3dSettings.NbAxis > 5) axisList.push(<option value="C">C</option>)
    return (
        <div class="p-2">
            <div class="d-flex flex-wrap justify-content-center p-2 border rounded">
                <div class="d-flex flex-column justify-content-center">
                    <div class="border rounded">
                        <center>
                            <div
                                class="p-2"
                                title={T("G11").replace("{axis}", "X")}
                            >
                                <button
                                    class="btn btn-default jogbtn"
                                    id="Xplus"
                                    onclick={sendJogCommand}
                                >
                                    +X
                                </button>
                            </div>
                            <div
                                class="p-2"
                                title={T("G9").replace("{axis}", "X")}
                            >
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
                            <div
                                class="p-2"
                                title={T("G10").replace("{axis}", "X")}
                            >
                                <button
                                    class="btn btn-default jogbtn"
                                    id="ZeroX"
                                    onclick={sendZeroCommand}
                                >
                                    <span class="zeroLabel no-pointer">
                                        &Oslash;
                                    </span>
                                </button>
                            </div>
                            <div
                                class="p-2"
                                title={T("G12").replace("{axis}", "X")}
                            >
                                <button
                                    class="btn btn-default jogbtn"
                                    id="Xminus"
                                    onclick={sendJogCommand}
                                >
                                    -X
                                </button>
                            </div>
                        </center>
                    </div>
                    <div
                        class={esp3dSettings.NbAxis > 1 ? "p-2" : "d-none"}
                        title={T("G13")}
                    >
                        <button
                            class="btn btn-default"
                            id="HomeAll"
                            onclick={sendHomeCommand}
                        >
                            <span class="no-pointer">
                                <Home size="1.3rem" />

                                <span class="text-button axisLabel">
                                    {allAxis}
                                </span>
                            </span>
                        </button>
                    </div>
                </div>
                <div class="p-1" />
                <div
                    class={
                        esp3dSettings.NbAxis > 1
                            ? "d-flex flex-column justify-content-center"
                            : "d-none"
                    }
                >
                    <div class="border rounded">
                        <center>
                            <div
                                class="p-2"
                                title={T("G11").replace("{axis}", "Y")}
                            >
                                <button
                                    class="btn btn-default jogbtn"
                                    id="Yplus"
                                    onclick={sendJogCommand}
                                >
                                    +Y
                                </button>
                            </div>
                            <div
                                class="p-2"
                                title={T("G9").replace("{axis}", "Y")}
                            >
                                <button
                                    class="btn btn-default jogbtn"
                                    id="HomeY"
                                    onclick={sendHomeCommand}
                                >
                                    <div class="no-pointer">
                                        <Home />
                                    </div>
                                </button>
                            </div>
                            <div
                                class="p-2"
                                title={T("G10").replace("{axis}", "Y")}
                            >
                                <button
                                    class="btn btn-default jogbtn"
                                    id="ZeroY"
                                    onclick={sendZeroCommand}
                                >
                                    <span class="zeroLabel no-pointer">
                                        &Oslash;
                                    </span>
                                </button>
                            </div>
                            <div
                                class="p-2"
                                title={T("G12").replace("{axis}", "Y")}
                            >
                                <button
                                    class="btn btn-default jogbtn"
                                    id="Yminus"
                                    onclick={sendJogCommand}
                                >
                                    -Y
                                </button>
                            </div>
                        </center>
                    </div>
                    <div class="p-2" title={T("G14")}>
                        <button
                            class="btn btn-default"
                            id="ZeroAll"
                            onclick={sendZeroCommand}
                        >
                            <span class="zeroLabel no-pointer">&Oslash;</span>
                            <span class="text-button axisLabel">{allAxis}</span>
                        </button>
                    </div>
                </div>
                <div class="p-1" />
                <div
                    class={
                        esp3dSettings.NbAxis > 2
                            ? "d-flex flex-column"
                            : "d-none"
                    }
                >
                    <div class="d-flex flex-column justify-content-center border rounded">
                        <center>
                            <div
                                class="p-2"
                                title={T("G11").replace("{axis}", axis)}
                            >
                                <button
                                    class="btn btn-default jogbtn"
                                    id={axis + "plus"}
                                    onclick={sendJogCommand}
                                >
                                    +{axis}
                                </button>
                            </div>
                            <div
                                class="p-2"
                                title={T("G9").replace("{axis}", axis)}
                            >
                                <button
                                    class="btn btn-default jogbtn"
                                    id={"Home" + axis}
                                    onclick={sendHomeCommand}
                                >
                                    <div class="no-pointer">
                                        <Home />
                                    </div>
                                </button>
                            </div>
                            <div
                                class="p-2"
                                title={T("G10").replace("{axis}", axis)}
                            >
                                <button
                                    class="btn btn-default jogbtn"
                                    id={"Zero" + axis}
                                    onclick={sendZeroCommand}
                                >
                                    <span class="zeroLabel no-pointer">
                                        &Oslash;
                                    </span>
                                </button>
                            </div>
                            <div
                                class="p-2"
                                title={T("G12").replace("{axis}", axis)}
                            >
                                <button
                                    class="btn btn-default jogbtn"
                                    id={axis + "minus"}
                                    onclick={sendJogCommand}
                                >
                                    -{axis}
                                </button>
                            </div>
                            <div
                                class={
                                    esp3dSettings.NbAxis > 3 ? "p-2" : "d-none"
                                }
                            >
                                <select
                                    onchange={selectChange}
                                    value={axis}
                                    class="form-control"
                                >
                                    {axisList}
                                </select>
                            </div>
                        </center>
                    </div>
                </div>
                <div class="p-1" />
                <div>
                    <div class="p-1 d-block d-sm-none" />
                    <div class="d-flex flex-row">
                        <div
                            class="d-flex flex-column border rounded"
                            title={T("G4")}
                        >
                            <span class="badge badge-secondary">mm</span>
                            <div class="d-flex flex-row justify-content-left  p-1">
                                <div class="p-1">
                                    <button
                                        style="width:4rem"
                                        class={
                                            jogDistance == 100
                                                ? "btn btn-primary"
                                                : "btn btn-default"
                                        }
                                        id="distance100"
                                        onclick={onCheck}
                                    >
                                        100
                                    </button>
                                </div>
                                <div class="p-1">
                                    <button
                                        style="width:4rem"
                                        class={
                                            jogDistance == 10
                                                ? "btn btn-primary"
                                                : "btn btn-default"
                                        }
                                        id="distance10"
                                        onclick={onCheck}
                                    >
                                        10
                                    </button>
                                </div>
                                <div class="p-1">
                                    <button
                                        style="width:4rem"
                                        class={
                                            jogDistance == 1
                                                ? "btn btn-primary"
                                                : "btn btn-default"
                                        }
                                        id="distance1"
                                        onclick={onCheck}
                                    >
                                        1
                                    </button>
                                </div>
                                <div class="p-1">
                                    <button
                                        style="width:4rem"
                                        class={
                                            jogDistance == 0.1
                                                ? "btn btn-primary"
                                                : "btn btn-default"
                                        }
                                        id="distance0_1"
                                        onclick={onCheck}
                                    >
                                        0.1
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <FeedRateInput
                        entry={currentFeedRate["xyfeedrate"]}
                        label={T("G5").replace(
                            "{axis}",
                            esp3dSettings.NbAxis > 1 ? "XY" : "X"
                        )}
                        id="xyfeedrate"
                    />
                    <div class={esp3dSettings.NbAxis > 2 ? "" : "d-none"}>
                        <FeedRateInput
                            entry={
                                currentFeedRate[axis.toLowerCase() + "feedrate"]
                            }
                            label={T("G5").replace("{axis}", axis)}
                            id={axis.toLowerCase() + "feedrate"}
                        />
                    </div>
                    <div class="p-2">
                        <div class="d-flex justify-content-center">
                            <div class="p-1 bg-warning rounded">
                                <button
                                    type="button"
                                    class="btn btn-sm btn-danger"
                                    onclick={emergencyStop}
                                >
                                    <AlertCircle size="1.4em" />
                                    <span class="hide-low text-button">
                                        {T("G7")}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { JogPanel, processFeedRate }
