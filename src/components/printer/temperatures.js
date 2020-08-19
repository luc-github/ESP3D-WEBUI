/*
 temperatures.js - ESP3D WebUI temperatures panel control file

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
import { X, MapPin, Sliders } from "preact-feather"
import { useStoreon } from "storeon/preact"
import { preferences, getPanelIndex } from "../app"
import { useEffect } from "preact/hooks"
import { SendCommand } from "../http"
import { showDialog } from "../dialog"
import { Bed } from "./icon"
import { Thermometer, XCircle, Send, Box } from "preact-feather"
import { TimeSeries, SmoothieChart } from "./smoothie"

/*
 * Local variables
 *
 */
let currentTemperature = []
let currentTargetTemperature = []
let extrudersChart = new SmoothieChart({
    responsive: true,
    tooltip: false,
    millisPerPixel: 200,
    maxValueScale: 1.1,
    minValueScale: 1.1,
    enableDpiScaling: false,
    interpolation: "linear",
    grid: {
        fillStyle: "#ffffff",
        strokeStyle: "rgba(128,128,128,0.5)",
        verticalSections: 5,
        millisPerLine: 0,
        borderVisible: true,
    },
    labels: {
        fillStyle: "#000000",
        precision: 1,
        showIntermediateLabels: true,
        enableTopYLabel: false,
    },
})
let bedChart
let extruder_0_line = new TimeSeries()
let maxdata = 0
let setupDone = false
let count = 0
let graphsView = false

/*
 * Process temperatures buffer
 *
 */
function processTemperatures(buffer) {
    const regexTemp = /((B|T|C|P|R)(\d*)):\s*([+|-]?[0-9]*\.?[0-9]+|inf)? (\/)([+]?[0-9]*\.?[0-9]+)?/gi
    let result
    let timestamp = Date.now()
    let extruders = []
    let beds = []
    let probes = []
    let redondants = []
    let chambers = []
    let timedata = new Date().getTime()
    const { dispatch } = useStoreon()
    if (typeof buffer == "object") {
        let size = buffer.heaters.length
        for (let index = 0; index < size; index++) {
            let value, value2, tool
            if (typeof buffer.temps.bed != "undefined" && index == 0) {
                tool = "B"
            } else if (index != 0) {
                tool = "T"
                if (index > 1) tool += index + 1
            }
            if (
                isNaN(parseFloat(buffer.heaters[index])) ||
                parseFloat(buffer.heaters[index]) < 5
            )
                value = "error"
            else
                value = parseFloat(buffer.heaters[index])
                    .toFixed(2)
                    .toString()
            if (isNaN(parseFloat(buffer.active[index]))) value2 = "0.00"
            else
                value2 = parseFloat(buffer.active[index])
                    .toFixed(2)
                    .toString()
            if (tool.startsWith("T") || tool.startsWith("B")) {
                if (tool == "T") tool = "T0"
                if (tool == "B") tool = "B0"
                let index = parseInt(tool.substring(1))
                if (dispatch) {
                    if (tool[0] == "T") extruders[index] = value
                    else beds[index] = value

                    dispatch("temperatures/updateT" + tool[0], {
                        index: index,
                        value: value,
                        target: value2,
                    })
                } else {
                    console.log("no dispatch")
                }
            }
        }
    } else {
        let dispatched = ""
        while ((result = regexTemp.exec(buffer)) !== null) {
            var tool = result[1]
            var value
            var value2
            if (isNaN(parseFloat(result[4])) || parseFloat(result[4]) < 5)
                value = "error"
            else
                value = parseFloat(result[4])
                    .toFixed(2)
                    .toString()
            if (isNaN(parseFloat(result[6]))) value2 = "0.00"
            else
                value2 = parseFloat(result[6])
                    .toFixed(2)
                    .toString()
            if (
                tool.startsWith("T") ||
                tool.startsWith("B") ||
                tool.startsWith("C") ||
                tool.startsWith("P") ||
                tool.startsWith("R")
            ) {
                if (dispatched.indexOf(tool) == -1) {
                    dispatched += "*" + tool
                    if (tool == "T") tool = "T0"
                    if (tool == "B") tool = "B0"
                    if (tool == "C") tool = "C0"
                    if (tool == "R") tool = "R0"
                    if (tool == "P") tool = "P0"
                    let index = parseInt(tool.substring(1))
                    if (dispatch) {
                        switch (tool[0]) {
                            case "T":
                                extruders[index] = value
                                break
                            case "B":
                                beds[index] = value
                                break
                            case "C":
                                chambers[index] = value
                                break
                            case "P":
                                probes[index] = value
                                break
                            case "R":
                                redondants[index] = value
                                break
                            default:
                                break
                        }
                        dispatch("temperatures/updateT" + tool[0], {
                            index: index,
                            value: value,
                            target: value2,
                        })
                    } else {
                        console.log("no dispatch")
                    }
                }
            }
        }
    }
    if (
        extruders.length > 0 ||
        beds.length > 0 ||
        chambers.length > 0 ||
        probes.length > 0 ||
        redondants.length > 0
    ) {
        //extruder_0_line.append(timedata, parseFloat(extruders[0]));
        dispatch("temperatures/addT", {
            timestamp: timestamp,
            extruders: extruders,
            beds: beds,
            chambers: chambers,
            probes: probes,
            redondants: redondants,
            timestamp: timedata,
        })
    }
}

/*
 * Send command query error
 */
function sendCommandError(errorCode, responseText) {
    showDialog({ type: "error", numError: errorCode, message: T("S5") })
}

/*
 * Send command to set temperature
 */
function setTemperature(temperature, type, index) {
    let cmd = ""
    if (type == "extruder") {
        if (currentTemperature["extruder"].length > 1) {
            cmd = "T" + index
            SendCommand(cmd, null, sendCommandError)
        }
        cmd = "M104 S"
    } else if (type == "bed") {
        //TODO add syntax for multi bed
        //reprap use P and H
        //MK4DUO use T
        //Marlin/Marlin no support so need to use extruder
        //Smoothieware mo support but can define custom tool
        if (typeof currentTemperature["bed"] != "undefined") {
            if (currentTemperature["bed"].length > 1) {
                cmd = "T" + index
                SendCommand(cmd, null, sendCommandError)
            }
        }
        cmd = "M140 S"
    } else if (type == "chamber") {
        cmd = "M141 S"
    }
    cmd += temperature
    SendCommand(cmd, null, sendCommandError)
    //this need to be done for stop and stop all buttons for consistency
    if (
        typeof document.getElementById(type + "_" + index + "_input") !=
            "undefined" &&
        document.getElementById(type + "_" + index + "_input")
    ) {
        document.getElementById(
            type + "_" + index + "_input"
        ).value = temperature
        document.getElementById(
            type + "_" + index + "_slider"
        ).value = temperature
        document.getElementById(
            type + "_" + index + "_preheat"
        ).value = temperature
        currentTemperature[type][index] = temperature
    }
    if (typeof currentTemperature[type] != "undefined") {
        //currently there is not check the command is success
        //but if the value is not applied the control will go back to modified
        currentTargetTemperature[type][index] = currentTemperature[type][index]
        updateState(currentTargetTemperature[type][index], type + "_" + index)
    }
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
                document
                    .getElementById(id + "_slider")
                    .classList.remove("error")
                document
                    .getElementById(id + "_slider")
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
                document.getElementById(id + "_slider").classList.add("error")
                document
                    .getElementById(id + "_slider")
                    .classList.remove("is-changed")
                break
            default:
                document.getElementById(id + "_unit").classList.remove("error")
                document
                    .getElementById(id + "_unit")
                    .classList.remove("bg-warning")
                document
                    .getElementById(id + "_sendbtn")
                    .classList.add("invisible")
                document
                    .getElementById(id + "_slider")
                    .classList.remove("error")
                document
                    .getElementById(id + "_slider")
                    .classList.remove("is-changed")
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
function checkValue(entry, type) {
    if (entry.length == 0 || entry < 0) return false
    switch (type) {
        case "extruder":
            if (entry > preferences.settings.extrudermax) return false
            break
        case "bed":
            if (entry > preferences.settings.bedmax) return false
            break
        case "chamber":
            if (entry > preferences.settings.chambermax) return false
            break
        default:
            break
    }
    return true
}

/*
 * Update control state
 *
 */
function updateState(entry, id) {
    if (typeof entry == "undefined") {
        //console.log("undefined state")
        return
    }
    let type = id.split("_")[0]
    let index = parseInt(id.split("_")[1])
    let state = "default"
    if (!checkValue(entry, type)) {
        state = "error"
    } else {
        if (
            parseFloat(entry) !=
            parseFloat(currentTargetTemperature[type][index])
        ) {
            state = "modified"
        }
    }
    setState(id, state)
}

/*
 * Temperature slider control
 *
 */
const TemperatureSlider = ({ id, type, index }) => {
    const { TT, TB, TC } = useStoreon("TT", "TB", "TC")
    if (typeof currentTemperature[type] == "undefined") {
        currentTemperature[type] = []
    }
    if (typeof currentTargetTemperature[type] == "undefined") {
        currentTargetTemperature[type] = []
    }
    if (typeof currentTemperature[type][index] == "undefined") {
        if (type == "extruder") {
            if (TT.length > 0)
                currentTemperature[type][index] = TT[index].target
        } else if (type == "bed") {
            currentTemperature[type][index] = TB[index].target
        } else if (type == "chamber") {
            currentTemperature[type][index] = TC[index].target
        }
    }

    if (type == "extruder") {
        if (TT.length > 0)
            currentTargetTemperature[type][index] =
                typeof TT[index].target != "undefined"
                    ? TT[index].target
                    : "0.00"
    } else if (type == "bed") {
        currentTargetTemperature[type][index] =
            typeof TB[index].target != "undefined" ? TB[index].target : "0.00"
    } else if (type == "chamber") {
        currentTargetTemperature[type][index] =
            typeof TC[index].target != "undefined" ? TC[index].target : "0.00"
    }

    const onInputTemperatureSlider = e => {
        document.getElementById(id + "_input").value = e.target.value
        currentTemperature[type][index] = e.target.value
        updateState(e.target.value, id)
    }
    const onInputTemperatureInput = e => {
        document.getElementById(id + "_slider").value = e.target.value
        currentTemperature[type][index] = e.target.value
        updateState(e.target.value, id)
    }
    const onSet = e => {
        setTemperature(currentTemperature[type][index], type, index)
    }

    const onStop = e => {
        setTemperature(0, type, index)
    }

    const onChange = e => {
        if (e.target.value.length > 0) {
            document.getElementById(id + "_input").value = e.target.value
            currentTemperature[type][index] = e.target.value
            document.getElementById(id + "_slider").value = e.target.value
            updateState(e.target.value, id)
        } else {
            document.getElementById(id + "_input").value =
                currentTargetTemperature[type][index]
            currentTemperature[type][index] =
                currentTargetTemperature[type][index]
            document.getElementById(id + "_slider").value =
                currentTargetTemperature[type][index]
            updateState(currentTargetTemperature[type][index], id)
        }
    }
    let optionsList = []
    let tvalues
    if (type == "extruder") {
        tvalues = preferences.settings.extruderpreheat.split(";")
    } else {
        tvalues = preferences.settings.bedpreheat.split(";")
    }
    optionsList.push(<option value="0"></option>)
    for (let i = 0; i < tvalues.length; i++) {
        optionsList.push(<option value={tvalues[i]}>{tvalues[i]}</option>)
    }
    useEffect(() => {
        updateState(currentTemperature[type][index], id)
    })
    return (
        <div>
            <div class="d-flex flex-column border p-1 rounded">
                <div class="d-flex flex-wrap p-1">
                    <div class="control-like p-1">
                        {type == "extruder" ? (
                            <Thermometer />
                        ) : type == "bed" ? (
                            <Bed />
                        ) : (
                            <Box />
                        )}
                        {type == "extruder"
                            ? T("P41")
                            : type == "bed"
                            ? T("P37")
                            : T("P43")}
                        {type == "extruder"
                            ? TT.length > 1
                                ? index + 1
                                : ""
                            : type == "bed"
                            ? TB.length > 1
                                ? index + 1
                                : ""
                            : ""}
                    </div>
                    <div class="p-1">
                        <button
                            class="btn btn-danger"
                            type="button"
                            onClick={onStop}
                            title={T("P38")}
                        >
                            <XCircle />
                            <span class="hide-low text-button-setting">
                                {T("P39")}
                            </span>
                        </button>
                    </div>
                    <div>
                        <div class="input-group p-1">
                            <div class="input-group-prepend">
                                <span class="input-group-text">{T("P35")}</span>
                            </div>
                            <select
                                class="form-control"
                                id={type + "_" + index + "_preheat"}
                                value={currentTemperature[type][index]}
                                onchange={onChange}
                            >
                                {optionsList}
                            </select>
                        </div>
                    </div>
                </div>
                <div class="input-group justify-content-center rounded">
                    <div class="slider-control hide-low">
                        <div class="slidecontainer">
                            <input
                                onInput={onInputTemperatureSlider}
                                type="range"
                                min="0"
                                max={
                                    type == "extruder"
                                        ? preferences.settings.extrudermax
                                        : type == "bed"
                                        ? preferences.settings.bedmax
                                        : preferences.settings.chambermax
                                }
                                value={currentTemperature[type][index]}
                                class="slider"
                                id={id + "_slider"}
                            />
                        </div>
                    </div>
                    <input
                        style="max-width:6rem!important;"
                        onInput={onInputTemperatureInput}
                        type="number"
                        min="0"
                        max={
                            type == "extruder"
                                ? preferences.settings.extrudermax
                                : type == "bed"
                                ? preferences.settings.bedmax
                                : preferences.settings.chambermax
                        }
                        value={currentTemperature[type][index]}
                        class="form-control"
                        id={id + "_input"}
                    />

                    <div class="input-group-append">
                        <span class="input-group-text" id={id + "_unit"}>
                            &deg;C
                        </span>
                        <button
                            id={id + "_sendbtn"}
                            class="btn btn-warning invisible rounded-right"
                            type="button"
                            onClick={onSet}
                            title={T("S43")}
                        >
                            <Send size="1.2em" />
                            <span class="hide-low text-button-setting">
                                {T("S43")}
                            </span>
                        </button>
                    </div>
                    <div
                        class="invalid-feedback text-center"
                        style="text-align:center!important"
                    >
                        {T("S42")}
                    </div>
                </div>
            </div>
            <div class="p-1" />
        </div>
    )
}

/*
 * Temperatures graphs
 *
 */
const TemperaturesGraphs = ({ visible }) => {
    const { TT, TB, TC, TList } = useStoreon("TT", "TB", "TC", "TList")
    if (!visible) return null
    useEffect(() => {
        if (typeof extrudersChart != "undefined")
            extrudersChart.removeTimeSeries(extruder_0_line)
        extruder_0_line = new TimeSeries()
        extrudersChart.addTimeSeries(extruder_0_line, {
            lineWidth: 1,
            strokeStyle: "#ff8080",
            fillStyle: "rgba(255,128,128,0.3)",
        })

        extrudersChart.canvas = document.getElementById("mycanvas")

        setupDone = false
        extrudersChart.delay = 3000
        extrudersChart.start()

        let startn = 0
        maxdata = 36 //to calculate based on
        if (TList.length > maxdata && maxdata) startn = TList.length - maxdata
        if (startn <= 0) startn = 0
        let nb = 0
        for (let n = parseInt(startn); n < TList.length; n++) {
            extruder_0_line.append(
                TList[n].timestamp,
                parseFloat(TList[n].extruders[0])
            )
            nb++
        }
    })
    return (
        <div class="d-flex flex-column">
            <canvas id="mycanvas" style="width:100%;height:100px"></canvas>
        </div>
    )
}

/*
 * Temperatures controls
 *
 */
const TemperaturesControls = ({ visible }) => {
    const { TT, TB, TC, TList } = useStoreon("TT", "TB", "TC", "TList")
    if (!visible) return null
    let temperaturesControls = []
    let size = TT.length
    if (size == 0) size = 1
    for (let i = 0; i < size; i++) {
        temperaturesControls.push(
            <TemperatureSlider id={"extruder_" + i} type="extruder" index={i} />
        )
    }
    for (let i = 0; i < TB.length; i++) {
        temperaturesControls.push(
            <TemperatureSlider id={"bed_" + i} type="bed" index={i} />
        )
    }
    for (let i = 0; i < TC.length; i++) {
        temperaturesControls.push(
            <TemperatureSlider id={"chamber_" + i} type="chamber" index={i} />
        )
    }
    return <div class="d-flex flex-column">{temperaturesControls}</div>
}
/*
 * Temperatures panel control
 *
 */
const TemperaturesPanel = () => {
    const { showTemperatures } = useStoreon("showTemperatures")
    const { TT, TB, TC, TList } = useStoreon("TT", "TB", "TC", "TList")
    const { panelsOrder } = useStoreon("panelsOrder")
    let index = getPanelIndex(panelsOrder, "temperatures")

    if (!showTemperatures) {
        return null
    }
    const onClose = e => {
        const { dispatch } = useStoreon()
        dispatch("panel/showtemperatures", false)
    }
    const onToogleView = e => {
        graphsView = !graphsView
        showDialog({ displayDialog: false, refreshPage: true })
    }

    let panelClass = "order-" + index + " w-100 panelCard"

    const onStopAll = e => {
        if (typeof currentTemperature["extruder"] != "undefined") {
            for (let i = 0; i < currentTemperature["extruder"].length; i++)
                setTemperature(0, "extruder", i)
        } else setTemperature(0, "extruder", 0)
        if (typeof currentTemperature["bed"] != "undefined") {
            for (let i = 0; i < currentTemperature["bed"].length; i++)
                setTemperature(0, "bed", i)
        } else setTemperature(0, "bed", 0)
        if (typeof currentTemperature["chamber"] != "undefined") {
            for (let i = 0; i < currentTemperature["chamber"].length; i++)
                setTemperature(0, "chamber", i)
        } else setTemperature(0, "chamber", 0)
    }
    let iconView = graphsView ? <Sliders /> : <MapPin />

    return (
        <div class={panelClass} id="temperaturespanel">
            <div class="p-2 ">
                <div class="border rounded p-2 panelCard">
                    <div class="w-100">
                        <div class="d-flex flex-wrap">
                            <div class="p-1">
                                <Thermometer />
                                <span class="hide-low control-like text-button">
                                    {T("P29")}
                                </span>
                            </div>
                            <div class="p-1">
                                <button
                                    class="btn btn-danger"
                                    type="button"
                                    onClick={onStopAll}
                                    title={T("P38")}
                                >
                                    <XCircle />
                                    <span class="hide-low text-button-setting">
                                        {T("P40")}
                                    </span>
                                </button>
                            </div>
                            <div class="p-1">
                                <button
                                    class="btn btn-info"
                                    type="button"
                                    onClick={onToogleView}
                                    title={graphsView ? T("P57") : T("P56")}
                                >
                                    {iconView}
                                    <span class="hide-low text-button-setting">
                                        {graphsView ? T("P57") : T("P56")}
                                    </span>
                                </button>
                            </div>
                            <div class="ml-auto text-right">
                                <button
                                    type="button"
                                    class="btn btn-light btn-sm red-hover"
                                    title={T("S86")}
                                    onClick={onClose}
                                >
                                    <X />
                                </button>
                            </div>
                        </div>
                        <TemperaturesControls visible={!graphsView} />
                        <TemperaturesGraphs visible={graphsView} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export { processTemperatures, TemperaturesPanel }
