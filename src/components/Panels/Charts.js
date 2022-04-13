/*
charts.js - ESP3D WebUI component file

 Copyright (c) 2021 Luc LEBOSSE. All rights reserved.

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

import { Fragment, h } from "preact"
import { T } from "../Translations"
import { useUiContext, useUiContextFn } from "../../contexts"
import { useState, useRef, useEffect } from "preact/hooks"
import { ButtonImg, Loading } from "../Controls"
import { Image } from "preact-feather"
import { useTargetContext } from "../../targets"
import { SmoothieChart, TimeSeries } from "smoothie"

/*
 * Local const
 *
 */

/*
temperatures set
{
    T: [{value:XXX, target:xxx},{value:XXX, target:xxx},...], //0->8 T0->T8 Extruders
    R: [{value:XXX, target:xxx}], //0->1 R Redondant
    B: [{value:XXX, target:xxx}], //0->1 B Bed
    C: [{value:XXX, target:xxx}], //0->1  Chamber
    P: [{value:XXX, target:xxx}], //0->1 Probe
    M: [{value:XXX, target:xxx}], //0->1 M Board
    L: [{value:XXX, target:xxx}], //0->1 L is only for laser so should be out of scope
    S: [{value:XXX, target:xxx}], //0->1 S is for sensors
  }
temperaturesList set
[
    {temperatures:< temperature set>, time:<timeStamp>},
    {temperatures:< temperature set>, time:<timeStamp>},
    ...
]    
*/

// Chart data organization
const charts = [
    {
        //chart 1 (index =0)
        chart: {}, //SmoothieChart
        ref: {}, //SmoothieChart reference
        series: {
            //TimeSeries
            //extruders
            T: [],

            //redondant
            R: [],
        },
    },
    {
        //chart 2
        chart: {}, //SmoothieChart
        ref: {}, //SmoothieChart reference
        series:
            //TimeSeries
            {
                //Bed
                B: [],
                //chamber
                C: [],
                //probe
                P: [],
                //chamber
                C: [],
                //motherboard
                M: [],
            },
    },
    {
        //chart 3
        chart: {}, //SmoothieChart
        ref: {}, //SmoothieChart reference
        series:
            //TimeSeries
            {
                //sensors
                S: [],
            },
    },
]

const isVisible = (tool) => {
    const setting = {
        T: "showextruderchart",
        B: "showbedchart",
        C: "showchamberchart",
        P: "showprobechart",
        R: "showredondantchart",
        M: "showboardchart",
        S: "showsensorchart",
    }
    return setting[tool] != undefined
        ? useUiContextFn.getValue(setting[tool])
        : false
}

const isChartVisible = (index) => {
    if (index == 0) {
        if (isVisible("T") || isVisible("R")) {
            return true
        }
    }
    if (index == 1) {
        if (
            isVisible("B") ||
            isVisible("C") ||
            isVisible("M") ||
            isVisible("P")
        ) {
            return true
        }
    }
    if (index == 2) {
        if (isVisible("S")) {
            return true
        }
    }
    return false
}

const chartColors = [
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
    "0,0,0", //purple
]

const smoothieOptions = {
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
}

const colorIndex = (chart, tool, index) => {
    let found = false
    let i = Object.keys(chart.series).reduce((acc, key) => {
        if (!found) {
            for (let j = 0; j < chart.series[key].length; j++) {
                if (key == tool && j == index) {
                    found = true
                } else {
                    acc++
                }
            }
        }
        return acc
    }, 0)

    console.log(tool, index, " colorIndex:", i)

    return i
}

const createTimeSeries = (chart, tool, index) => {
    console.log("createTimeSeries", tool, index)
    chart.series[tool][index] = new TimeSeries()
    chart.chart.addTimeSeries(chart.series[tool][index], {
        lineWidth: 1,
        strokeStyle: "rgb(" + chartColors[colorIndex(chart, tool, index)] + ")",
    })
}

const /* Creating the charts. */
    buildCharts = (temperaturesList, delay) => {
        console.log("buildCharts", temperaturesList, delay)
        //we parse each chart
        charts.forEach((chart, index) => {
            //check is visible
            if (isChartVisible(index)) {
                //create the chart
                chart.chart = new SmoothieChart(smoothieOptions)
                //parse defined tools
                Object.keys(chart.series).forEach((tool) => {
                    //if tool is visible
                    if (isVisible(tool)) {
                        console.log(tool, "is visible", temperaturesList)
                        //for each index of tool
                        if (temperaturesList.length > 0) {
                            console.log(temperaturesList[0].temperatures[tool])
                            if (temperaturesList[0].temperatures[tool])
                                temperaturesList[0].temperatures[tool].forEach(
                                    (entry, num) => {
                                        //create new serie
                                        createTimeSeries(chart, tool, num) /
                                            //fill with existing data from temperaturesList
                                            temperaturesList.forEach(
                                                (entry) => {
                                                    console.log(
                                                        "add ",
                                                        entry.temperatures[
                                                            tool
                                                        ][num]
                                                    )
                                                    chart.series[tool][
                                                        num
                                                    ].append(
                                                        entry.time,
                                                        entry.temperatures[
                                                            tool
                                                        ][num].value
                                                    )
                                                }
                                            )
                                    }
                                )
                        }
                    } else {
                        chart.series[tool] = []
                    }
                })
                //add the chart to the page
                chart.chart.streamTo(chart.ref.current, delay)
            } else {
                //no display so no need datas
                chart.chart = null
                chart.series = []
            }
        })
    }

const updateCharts = (temperatures) => {
    charts.forEach((chart, index) => {
        //check is visible
        if (isChartVisible(index)) {
            //parse defined tools
            Object.keys(chart.series).forEach((tool) => {
                //if tool is visible
                if (isVisible(tool)) {
                    //for each index of tool
                    if (temperatures[tool]) {
                        temperatures[tool].map((entry, num) => {
                            //console.log(chart.series[tool])
                            //if serie do not exists create it
                            if (
                                typeof chart.series[tool][num] == "undefined" ||
                                !chart.series[tool][num]
                            ) {
                                createTimeSeries(chart, tool, num) //create new serie
                            }
                            //add new data to the serie
                            //console.log(tool, num, chart.series[tool][num])
                            chart.series[tool][num].append(
                                Date.now(),
                                parseFloat(temperatures[tool][num].value)
                            )
                        })
                    }
                }
            })
        }
    })
}

const sensorName = (tool, index, size) => {
    const name = { T: "P41", B: "P37", C: "P43", P: "P42", R: "P44", M: "P90" }
    return name[tool] != undefined
        ? T(name[tool]).replace("$", size == 1 ? "" : index + 1)
        : ""
}

const ChartsPanel = () => {
    const { panels } = useUiContext()
    const { temperatures, temperaturesList } = useTargetContext()
    charts[0].ref = useRef(null)
    charts[1].ref = useRef(null)
    charts[1].ref = useRef(null)
    const id = "chartsPanel"
    console.log(id)

    useEffect(() => {
        const delay = useUiContextFn.getValue("pollingrefresh")
        buildCharts(temperaturesList.current, delay)
    }, [])
    useEffect(() => {
        updateCharts(temperatures)
    }, [temperatures])
    return (
        <div class="panel panel-dashboard">
            <div class="navbar">
                <span class="navbar-section feather-icon-container">
                    <Image />
                    <strong class="text-ellipsis">{T("P56")}</strong>
                </span>
                <span class="navbar-section">
                    <span style="height: 100%;">
                        <button
                            class="btn btn-clear btn-close m-1"
                            aria-label="Close"
                            onclick={(e) => {
                                panels.hide(id)
                            }}
                        />
                    </span>
                </span>
            </div>
            <div class="panel-body panel-body-dashboard">
                <div style="display:flex; flex-direction:column;height:100%; justify-content:space-between">
                    {isChartVisible(0) && (
                        <canvas
                            class="chart"
                            id="chart1"
                            width="340"
                            height="100"
                            ref={charts[0].ref}
                        />
                    )}
                    {isChartVisible(1) && (
                        <canvas
                            class="chart"
                            id="chart2"
                            width="340"
                            height="100"
                            ref={charts[1].ref}
                        />
                    )}
                    {isChartVisible(2) && (
                        <canvas
                            class="chart"
                            id="chart3"
                            width="340"
                            height="100"
                            ref={charts[2].ref}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

const ChartsPanelElement = {
    id: "chartsPanel",
    content: <ChartsPanel />,
    name: "P56",
    icon: "Image",
    show: "showchartspanel",
    onstart: "openchartsonstart",
}

export { ChartsPanel, ChartsPanelElement }
