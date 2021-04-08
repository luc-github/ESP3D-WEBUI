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
import { useStoreon } from "storeon/preact"
import { preferences, getPanelIndex, esp3dSettings } from "../app"
import { useEffect } from "preact/hooks"
import { SendCommand } from "../http"
import { showDialog } from "../dialog"
import { Bed, Extruder } from "./icon"
import {
    Thermometer,
    XCircle,
    Send,
    Box,
    XOctagon,
    X,
    MapPin,
    Sliders,
    ExternalLink,
    Underline,
} from "preact-feather"
import { TimeSeries, SmoothieChart } from "./smoothie"

/*
 * Local constants
 *
 */
//12 colors for extruders
const extrudersChartColors = [
    "255,128,128", //pink
    "0,0,255", //dark blue
    "0,128,0", //dark green
    "198,165,0", //gold
    "255,0,0", //red
    "0,0,128", //blue
    "128,255,128", //light green
    "255,128,0", //orange
    "178,0,255", //purple
    "0,128,128", //green blue
    "128,128,0", //kaki
    "128,128,128", //grey
]
//4 colors for extruders
const bedsChartColors = [
    "128,128,128", //grey
    "255,0,0", //red
    "0,0,255", //blue
    "128,255,128", //light green
]

//1 color for chamber
const chamberChartColor = "128,128,0" //kaki

//1 color for probe
const probeChartColor = "0,0,0" //black

//1 color for redondant
const redondantChartColor = "0,0,0" //black

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
let extraChart = new SmoothieChart({
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

let extrudersline = []
let bedsline = []
let redondantline
let probeline
let chamberline
let graphsView = false
let extrudersLegend
let extraLegend
let needExtraChart = false

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
            else value = parseFloat(buffer.heaters[index]).toFixed(2).toString()
            if (isNaN(parseFloat(buffer.active[index]))) value2 = "0.00"
            else value2 = parseFloat(buffer.active[index]).toFixed(2).toString()
            //FIXME - TODO
            //how to detect chamber with M408?
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
            if (
                (isNaN(parseFloat(result[4])) || parseFloat(result[4]) < 5) &&
                parseInt(result[4]) != 0
            )
                value = "error"
            else value = parseFloat(result[4]).toFixed(2).toString()
            if (isNaN(parseFloat(result[6]))) value2 = "0.00"
            else value2 = parseFloat(result[6]).toFixed(2).toString()
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
                        console.log(
                            tool[0],
                            " ",
                            esp3dSettings.serialprotocol,
                            " ",
                            value
                        )
                        if (
                            !(
                                parseInt(value) == 0 &&
                                esp3dSettings.serialprotocol == "MKS"
                            )
                        )
                            dispatch("temperatures/updateT" + tool[0], {
                                index: index,
                                value: value,
                                target: value2,
                            })
                    } else {
                        console.log("no dispatch--------")
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
        console.log("undefined state")
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

    const onInputTemperatureSlider = (e) => {
        document.getElementById(id + "_input").value = e.target.value
        currentTemperature[type][index] = e.target.value
        updateState(e.target.value, id)
    }
    const onInputTemperatureInput = (e) => {
        document.getElementById(id + "_slider").value = e.target.value
        currentTemperature[type][index] = e.target.value
        updateState(e.target.value, id)
    }
    const onSet = (e) => {
        setTemperature(currentTemperature[type][index], type, index)
    }

    const onStop = (e) => {
        setTemperature(0, type, index)
    }

    const onChange = (e) => {
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
                            <XOctagon />
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
    const exportcharts = (e) => {
        let data, file
        let nb = 0
        const filename = "esp3dcharts.csv"
        data = ""
        if (typeof TList[0] != "undefined") {
            let listsize = TList.length

            //formated timestamp
            data += '"' + T("P60") + '"'
            for (let i = 0; i < listsize; i++) {
                data += ',"' + new Date(TList[i].timestamp).toUTCString() + '"'
            }
            data += "\n"
            //raw timestamp
            data += '"' + T("P59") + '"'
            for (let i = 0; i < listsize; i++) {
                data += "," + TList[i].timestamp
            }
            data += "\n"
            //extruders
            if (typeof TList[0].extruders != "undefined") {
                nb = TList[0].extruders.length
                for (let index = 0; index < nb; index++) {
                    data +=
                        '"' + T("P41") + " " + (nb > 1 ? index + 1 : "") + '"'
                    for (let i = 0; i < listsize; i++) {
                        data += "," + TList[i].extruders[index]
                    }
                    data += "\n"
                }
            }
            //redondant
            if (typeof TList[0].redondants != "undefined") {
                if (TList[0].redondants.length > 0) {
                    data += '"' + T("P44") + " " + (nb > 1 ? 1 : "") + '"'
                    for (let i = 0; i < listsize; i++) {
                        data += "," + TList[i].redondants
                    }
                    data += "\n"
                }
            }
            //beds
            if (typeof TList[0].beds != "undefined") {
                let nb = TList[0].beds.length
                for (let index = 0; index < nb; index++) {
                    data +=
                        '"' + T("P37") + " " + (nb > 1 ? index + 1 : "") + '"'
                    for (let i = 0; i < listsize; i++) {
                        data += "," + TList[i].beds[index]
                    }
                    data += "\n"
                }
            }
            //probe
            if (typeof TList[0].probes != "undefined") {
                if (TList[0].probes.length > 0) {
                    data += '"' + T("P42") + '"'
                    for (let i = 0; i < listsize; i++) {
                        data += "," + TList[i].probes
                    }
                    data += "\n"
                }
            }
            //chamber
            if (typeof TList[0].chambers != "undefined") {
                if (TList[0].chambers.length > 0) {
                    data += '"' + T("P43") + '"'
                    for (let i = 0; i < listsize; i++) {
                        data += "," + TList[i].chambers
                    }
                    data += "\n"
                }
            }
        }
        file = new Blob([data], { type: "application/json" })
        if (window.navigator.msSaveOrOpenBlob)
            // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename)
        else {
            // Others
            let a = document.createElement("a"),
                url = URL.createObjectURL(file)
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            setTimeout(function () {
                document.body.removeChild(a)
                window.URL.revokeObjectURL(url)
            }, 0)
        }
    }
    const clearcharts = (e) => {
        const { dispatch } = useStoreon()
        dispatch("temperatures/clear")
        fillCharts(true)
    }
    function fillCharts(cleardata = false) {
        if (typeof TList[0] != "undefined") {
            //extruders
            let nbExtruders = 0
            let nbBeds = 0
            if (typeof TList[0].extruders != "undefined") {
                nbExtruders = TList[0].extruders.length
            }
            let alpha = "0.3"
            extrudersLegend = []
            extraLegend = []
            let legendContent = []

            for (let i = 0; i < nbExtruders; i++) {
                if (typeof extrudersline[i] != "undefined")
                    extrudersChart.removeTimeSeries(extrudersline[i])
                extrudersline[i] = new TimeSeries()
                if (i > 0) alpha = "0"
                extrudersChart.addTimeSeries(extrudersline[i], {
                    lineWidth: 1,
                    strokeStyle: "rgb(" + extrudersChartColors[i] + ")",
                    fillStyle:
                        "rgba(" + extrudersChartColors[i] + "," + alpha + ")",
                })
                legendContent.push(
                    <span
                        title={
                            T("P41") +
                            (nbExtruders > 1 ? "(" + (i + 1) + ")" : "")
                        }
                        class="p-1"
                        style={"color:rgb(" + extrudersChartColors[i] + ")"}
                    >
                        -<Extruder />
                        {nbExtruders > 1 ? i + 1 : ""}
                    </span>
                )
                if (i == 0) {
                    if (typeof TList[0].redondants != "undefined")
                        if (TList[0].redondants.length > 0)
                            legendContent.push(
                                <span
                                    title={T("P44") + "(1)"}
                                    class="p-1"
                                    style={
                                        "color:rgb(" + redondantChartColor + ")"
                                    }
                                >
                                    -<Extruder />
                                    <sub>R</sub>1
                                </span>
                            )
                }
            }

            //redondants (if any)
            if (typeof TList[0].redondants != "undefined") {
                if (typeof redondantline != "undefined")
                    extrudersChart.removeTimeSeries(redondantline)
                redondantline = new TimeSeries()
                extrudersChart.addTimeSeries(redondantline, {
                    lineWidth: 1,
                    strokeStyle: "rgb(" + redondantChartColor + ")",
                    fillStyle:
                        "rgba(" + redondantChartColor + "," + alpha + ")",
                })
            }

            extrudersLegend.push(
                <div class="d-flex flex-wrap p-1">{legendContent}</div>
            )
            extrudersChart.streamTo(
                document.getElementById("extruderscanvas"),
                1000
            )
            //beds (if any)
            if (typeof TList[0].beds != "undefined") {
                nbBeds = TList[0].beds.length

                legendContent = []
                if (TList[0].beds.length > 0) {
                    needExtraChart = true
                    alpha = "0.3"
                    for (let i = 0; i < nbBeds; i++) {
                        if (typeof bedsline[i] != "undefined")
                            extraChart.removeTimeSeries(bedsline[i])
                        bedsline[i] = new TimeSeries()
                        if (i > 0) alpha = "0"
                        extraChart.addTimeSeries(bedsline[i], {
                            lineWidth: 1,
                            strokeStyle: "rgb(" + bedsChartColors[i] + ")",
                            fillStyle:
                                "rgba(" +
                                bedsChartColors[i] +
                                "," +
                                alpha +
                                ")",
                        })
                        legendContent.push(
                            <span
                                title={
                                    T("P37") +
                                    (nbBeds > 1 ? "(" + (i + 1) + ")" : "")
                                }
                                class="p-1"
                                style={"color:rgb(" + bedsChartColors[i] + ")"}
                            >
                                -<Bed />
                                {nbBeds > 1 ? i + 1 : ""}
                            </span>
                        )
                    }
                }
            }

            //probes (if any)
            if (typeof TList[0].probes != "undefined") {
                if (typeof probeline != "undefined")
                    extraChart.removeTimeSeries(probeline)
                probeline = new TimeSeries()
                extraChart.addTimeSeries(probeline, {
                    lineWidth: 1,
                    strokeStyle: "rgb(" + probeChartColor + ")",
                    fillStyle: "rgba(" + probeChartColor + "," + alpha + ")",
                })

                if (TList[0].probes.length > 0) {
                    needExtraChart = true
                    legendContent.push(
                        <span
                            title={T("P42")}
                            class="p-1"
                            style={"color:rgb(" + probeChartColor + ")"}
                        >
                            -<Underline />
                        </span>
                    )
                }
            }

            //chamber (if any)
            if (typeof TList[0].chambers != "undefined") {
                if (typeof chamberline != "undefined")
                    extraChart.removeTimeSeries(chamberline)
                chamberline = new TimeSeries()
                extraChart.addTimeSeries(chamberline, {
                    lineWidth: 1,
                    strokeStyle: "rgb(" + chamberChartColor + ")",
                    fillStyle: "rgba(" + chamberChartColor + "," + alpha + ")",
                })

                if (TList[0].chambers.length > 0) {
                    needExtraChart = true
                    legendContent.push(
                        <span
                            title={T("P43")}
                            class="p-1"
                            style={"color:rgb(" + chamberChartColor + ")"}
                        >
                            -<Box />
                        </span>
                    )
                }
            }
            extraLegend.push(
                <div class="d-flex flex-wrap p-1">{legendContent}</div>
            )
            if (needExtraChart) {
                document
                    .getElementById("extraCharts")
                    .classList.remove("d-none")
                extraChart.streamTo(
                    document.getElementById("extracanvas"),
                    1000
                )
            }
            if (cleardata) return
            //calculate number of points to display in canva form complete list
            let now = Date.now()
            let oldest =
                now -
                extrudersChart.canvas.clientWidth *
                    extrudersChart.options.millisPerPixel
            let startn = TList.length - 1
            let done = false
            while (startn >= 0 && !done) {
                if (TList[startn].timestamp > oldest) {
                    startn--
                } else {
                    done = true
                }
            }
            startn-- //to fix random glitch
            if (startn <= 0) startn = 0
            //fill the data in charts
            for (let n = parseInt(startn); n < TList.length; n++) {
                //extruders
                for (let i = 0; i < nbExtruders; i++) {
                    extrudersline[i].append(
                        TList[n].timestamp,
                        parseFloat(TList[n].extruders[i])
                    )
                }
                //redondant (if any)
                redondantline.append(
                    TList[n].timestamp,
                    parseFloat(TList[n].redondants)
                )
                //beds (if any)
                for (let i = 0; i < nbBeds; i++) {
                    bedsline[i].append(
                        TList[n].timestamp,
                        parseFloat(TList[n].beds[i])
                    )
                }
                //probe (if any)
                probeline.append(
                    TList[n].timestamp,
                    parseFloat(TList[n].probes)
                )
                //chamber (if any)
                chamberline.append(
                    TList[n].timestamp,
                    parseFloat(TList[n].chambers)
                )
            }
        }
    }

    useEffect(() => {
        fillCharts()
    })
    return (
        <div class="d-flex flex-column">
            <div id="extrudersCharts">
                {extrudersLegend}
                <canvas
                    id="extruderscanvas"
                    style="width:100%;height:100px"
                ></canvas>
            </div>
            <div id="extraCharts" class="d-none">
                {extraLegend}
                <canvas
                    id="extracanvas"
                    style="width:100%;height:100px"
                ></canvas>
            </div>
            <div class="p-1" />
            <div class="d-flex flex-wrap justify-content-center p-1 ">
                <div class="text-button-setting">
                    <button
                        type="button"
                        class="btn btn-primary"
                        title={T("S53")}
                        onClick={exportcharts}
                    >
                        <ExternalLink />
                        <span class="hide-low text-button">{T("S52")}</span>
                    </button>
                </div>

                <div class="text-button-setting">
                    <button
                        type="button"
                        class="btn btn-danger"
                        title={T("P58")}
                        onClick={clearcharts}
                    >
                        <XCircle />
                        <span class="hide-low text-button">{T("P58")}</span>
                    </button>
                </div>
            </div>
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
    const onClose = (e) => {
        const { dispatch } = useStoreon()
        dispatch("panel/showtemperatures", false)
    }
    const onToogleView = (e) => {
        graphsView = !graphsView
        showDialog({ displayDialog: false, refreshPage: true })
    }

    let panelClass = "order-" + index + " w-100 panelCard"

    const onStopAll = (e) => {
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
                                    <XOctagon />
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
