/*
 sensors.js - ESP3D WebUI sensors panel control file

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
import { preferences, getPanelIndex } from "../app"
import { useEffect } from "preact/hooks"
import { showDialog } from "../dialog"
import { XCircle, X, ExternalLink, Trello } from "preact-feather"
import { TimeSeries, SmoothieChart } from "./smoothie"

/*
 * Local constants
 *
 */
//3 colors for sensor
const sensorsChartColors = [
    "255,128,128", //pink
    "0,0,255", //dark blue
    "0,128,0", //dark green
]

/*
 * Local variables
 *
 */

let sensorCharts = []

/**/

let sensorChartlines = []
let sensorsLegends = []

/*
 * Process Sensors buffer
 *
 */
function processSensors(buffer) {
    let sensordata = []
    let timedata = new Date().getTime()
    const { dispatch } = useStoreon()
    let sensorSet = []
    let slist = buffer.split(" ")
    for (let i = 0; i < slist.length; i++) {
        let data = slist[i].split("[")
        let value
        let unit
        if (data.length == 2) {
            if (data[0] == "DISCONNECTED") value = "error"
            else value = data[0]
            unit = data[1].slice(0, -1)
            dispatch("sensors/setData", {
                index: i,
                value: value,
                unit: unit,
            })
            sensorSet.push({ value: value, unit: unit })
        }
    }
    if (sensorSet.length > 0) {
        dispatch("sensors/add", {
            data: sensorSet,
            timestamp: timedata,
        })
    }
}

/*
 * Temperatures graphs
 *
 */
const SensorsGraphs = () => {
    const { SList } = useStoreon("SList")
    const exportcharts = e => {
        let data, file
        let nb = 0
        const filename = "esp3dsensors.csv"
        data = ""
        if (typeof SList[0] != "undefined") {
            let listsize = SList.length

            //formated timestamp
            data += '"' + T("P60") + '"'
            for (let i = 0; i < listsize; i++) {
                data += ',"' + new Date(SList[i].timestamp).toUTCString() + '"'
            }
            data += "\n"
            //raw timestamp
            data += '"' + T("P59") + '"'
            for (let i = 0; i < listsize; i++) {
                data += "," + SList[i].timestamp
            }
            data += "\n"
            //sensors
            if (typeof SList[0].data != "undefined") {
                nb = SList[0].data.length
                for (let index = 0; index < nb; index++) {
                    data += '"' + SList[0].data[index].unit + '"'
                    for (let i = 0; i < listsize; i++) {
                        data += "," + SList[i].data[index].value
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
            setTimeout(function() {
                document.body.removeChild(a)
                window.URL.revokeObjectURL(url)
            }, 0)
        }
    }
    const clearcharts = e => {
        const { dispatch } = useStoreon()
        dispatch("sensors/clear")
        fillCharts(true)
    }
    function fillCharts(cleardata = false) {
        if (typeof SList[0] != "undefined") {
            //Sensors
            let nbsensors = 0
            if (typeof SList[0].data != "undefined") {
                nbsensors = SList[0].data.length
            }
            let legendContent = []
            //one chart per sensor
            for (let i = 0; i < nbsensors; i++) {
                if (typeof sensorCharts[i] == "undefined") {
                    sensorCharts[i] = new SmoothieChart({
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
                }
                if (typeof sensorChartlines[i] != "undefined")
                    sensorCharts[i].removeTimeSeries(sensorChartlines[i])
                sensorChartlines[i] = new TimeSeries()
                sensorCharts[i].addTimeSeries(sensorChartlines[i], {
                    lineWidth: 1,
                    strokeStyle: "rgb(" + sensorsChartColors[i] + ")",
                    fillStyle: "rgba(" + sensorsChartColors[i] + ",0.3)",
                })
                let unit = SList[0].data[i].unit
                if (unit == "C" || unit == "F") {
                    unit = <span>&deg;{unit}</span>
                }
                sensorsLegends[i] = (
                    <span
                        title={T("P11") + i}
                        class="p-1"
                        style={"color:rgb(" + sensorsChartColors[i] + ")"}
                    >
                        -<Trello />
                        {unit}
                    </span>
                )
                document
                    .getElementById("sensors" + i + "Charts")
                    .classList.remove("d-none")
                sensorCharts[i].streamTo(
                    document.getElementById("sensors" + i + "canvas"),
                    1000
                )
            }

            if (cleardata) return
            //calculate number of points to display in canva form complete list
            let now = Date.now()
            let oldest =
                now -
                sensorCharts[0].canvas.clientWidth *
                    sensorCharts[0].options.millisPerPixel
            let startn = SList.length - 1
            let done = false
            while (startn >= 0 && !done) {
                if (SList[startn].timestamp > oldest) {
                    startn--
                } else {
                    done = true
                }
            }
            startn-- //to fix random glitch
            if (startn <= 0) startn = 0

            //fill the data in charts
            for (let n = parseInt(startn); n < SList.length; n++) {
                //Sensors
                for (let i = 0; i < nbsensors; i++) {
                    sensorChartlines[i].append(
                        SList[n].timestamp,
                        parseFloat(SList[n].data[i].value)
                    )
                }
            }
        }
    }

    useEffect(() => {
        fillCharts()
    })
    return (
        <div class="d-flex flex-column">
            <div id="sensors0Charts" class="d-none">
                {sensorsLegends[0]}
                <canvas
                    id="sensors0canvas"
                    style="width:100%;height:100px"
                ></canvas>
            </div>
            <div id="sensors1Charts" class="d-none">
                {sensorsLegends[1]}
                <canvas
                    id="sensors1canvas"
                    style="width:100%;height:100px"
                ></canvas>
            </div>
            <div id="sensors2Charts" class="d-none">
                {sensorsLegends[2]}
                <canvas
                    id="sensors2canvas"
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
 * Temperatures panel control
 *
 */
const SensorsPanel = () => {
    const { showSensors } = useStoreon("showSensors")
    const { SList } = useStoreon("SList")
    const { panelsOrder } = useStoreon("panelsOrder")
    let index = getPanelIndex(panelsOrder, "sensors")

    if (!showSensors) {
        return null
    }
    const onClose = e => {
        const { dispatch } = useStoreon()
        dispatch("panel/showsensors", false)
    }

    let panelClass = "order-" + index + " w-100 panelCard"

    return (
        <div class={panelClass} id="sensorspanel">
            <div class="p-2 ">
                <div class="border rounded p-2 panelCard">
                    <div class="w-100">
                        <div class="d-flex flex-wrap">
                            <div class="p-1">
                                <Trello />
                                <span class="hide-low control-like text-button">
                                    {T("P61")}
                                </span>
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
                        <SensorsGraphs />
                    </div>
                </div>
            </div>
        </div>
    )
}

export { processSensors, SensorsPanel }
