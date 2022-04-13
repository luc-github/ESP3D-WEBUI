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

// Chart data organization
const charts = [
    {
        //chart 1 (index =0)
        chart: {}, //SmoothieChart
        ref: {}, //SmoothieChart reference
        series: {
            //TimeSeries
            //extruders
            T: [{}, {}, {}, {}, {}, {}],

            //redondant
            R: [{}],
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
                B: [{}],
                //chamber
                C: [{}],
                //probe
                P: [{}],
                //chamber
                C: [{}],
                //motherboard
                M: [{}],
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
                S: [{}],
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
const buildCharts = (temperaturesList, delay) => {
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
                    //for each index of tool
                    temperaturesList[tool].forEach(
                        (temperaturesList, index) => {
                            //create new serie
                            chart.series[tool][index] = new TimeSeries()
                            chart.chart.current.addTimeSeries(
                                chart.series[tool][index],
                                {
                                    lineWidth: 1,
                                    strokeStyle:
                                        "rgb(" + chartColors[index] + ")",
                                }
                            )
                            //fill with existing data from temperaturesList
                            temperaturesList.current.forEach((entry) => {
                                chart.series[tool][index].append(
                                    entry.time,
                                    entry.temperatures[tool][index].value
                                )
                            })
                        }
                    )
                } else {
                    chart.series[tool] = []
                }
            })
            //add the chart to the page
            chart.chart.streamTo(chart.ref, delay)
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
                    temperatures[tool].forEach((entry, index) => {
                        //add new data to the serie
                        chart.series[tool][index].append(
                            Date.now(),
                            parseFloat(temperatures[tool][index].value)
                        )
                    })
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

const lineRef = {}
const chart = {}
const smoothieChart1 = {}
const chart1 = {}
const ChartsPanel = () => {
    const { panels } = useUiContext()
    const { temperatures, temperaturesList } = useTargetContext()

    const id = "chartsPanel"
    console.log(id)

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

    useEffect(() => {
        chart1.current = new SmoothieChart(smoothieOptions)
        lineRef.current = new TimeSeries()
        chart1.current.addTimeSeries(lineRef.current, {
            lineWidth: 1,
            strokeStyle: "#a55eea",
        })
        temperaturesList.current.forEach((entry, index) => {
            lineRef.current.append(entry.time, entry.temperatures.T[0].value)
        })
        chart1.current.streamTo(smoothieChart1.current, 3000)
    }, [])
    useEffect(() => {
        if (temperatures.T.length != 0) {
            lineRef.current.append(
                Date.now(),
                parseFloat(temperatures.T[0].value)
            )
        }
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
                            ref={smoothieChart1}
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
