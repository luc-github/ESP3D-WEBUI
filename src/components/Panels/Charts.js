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
import { Menu as PanelMenu } from "./"

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
    S: [{value:XXX, unit:xxx}], //0->1 S is for sensors, unit is the unit of the sensor
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

/*const isDataVisible = (index, temperatures) => {
    //this could be automate using a map and the charts object descriptions
    //but I am lazy to do it and benefit is arguable
    if (index == 0) {
        if (
            (temperatures.T && temperatures.T.length > 0) ||
            (temperatures.R && temperatures.R.length > 0)
        ) {
            return true
        }
    }
    if (index == 1) {
        if (
            (temperatures.B && temperatures.B.length > 0) ||
            (temperatures.C && temperatures.C.length > 0) ||
            (temperatures.P && temperatures.P.length > 0) ||
            (temperatures.M && temperatures.M.length > 0)
        ) {
            return true
        }
    }
    if (index == 2) {
        if (temperatures.S && temperatures.S.length > 0) {
            return true
        }
    }
    return false
}*/

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
    const arrayTool = Object.keys(chart.series)
    let i = 0
    for (let j = 0; j < arrayTool.length; j++) {
        if (arrayTool[j] == tool) {
            i = i + index
            break
        } else {
            i = i + chart.series[arrayTool[j]].length
        }
    }
    return i
}

const createTimeSeries = (chart, tool, index) => {
    chart.series[tool][index] = new TimeSeries()
    chart.chart.addTimeSeries(chart.series[tool][index], {
        lineWidth: 1,
        strokeStyle: "rgb(" + chartColors[colorIndex(chart, tool, index)] + ")",
    })
}

const /* Creating the charts. */
    buildCharts = (index, temperaturesList, delay) => {
        //we parse each chart
        const chart = charts[index]
        //check is visible
        if (isChartVisible(index)) {
            //create the chart
            chart.chart = new SmoothieChart(smoothieOptions)
            //parse defined tools
            Object.keys(chart.series).forEach((tool) => {
                //if tool is visible
                if (isVisible(tool)) {
                    //for each index of tool
                    if (temperaturesList.length > 0) {
                        if (temperaturesList[0].temperatures[tool])
                            temperaturesList[0].temperatures[tool].forEach(
                                (entry, num) => {
                                    //create new serie
                                    createTimeSeries(chart, tool, num) /
                                        //fill with existing data from temperaturesList
                                        temperaturesList.forEach((entry) => {
                                            chart.series[tool][num].append(
                                                entry.time,
                                                entry.temperatures[tool][num]
                                                    .value
                                            )
                                        })
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
    }

const updateCharts = (index, temperatures) => {
    const chart = charts[index]
    //check is visible
    if (isChartVisible(index)) {
        //parse defined tools
        Object.keys(chart.series).forEach((tool) => {
            //if tool is visible
            if (isVisible(tool)) {
                //for each index of tool
                if (temperatures[tool]) {
                    temperatures[tool].map((entry, num) => {
                        //if serie do not exists create it
                        if (
                            typeof chart.series[tool][num] == "undefined" ||
                            !chart.series[tool][num]
                        ) {
                            createTimeSeries(chart, tool, num) //create new serie
                        }
                        //add new data to the serie
                        chart.series[tool][num].append(
                            Date.now(),
                            parseFloat(temperatures[tool][num].value)
                        )
                    })
                }
            }
        })
    }
}

const sensorName = (tool, index, size, temperatures) => {
    const name = {
        T: "P41",
        B: "P37",
        C: "P43",
        P: "P42",
        R: "P44",
        M: "P90",
        S: "sensor",
    }
    if (tool == "S") {
        return name[tool] != undefined
            ? T("sensor") + " (" + temperatures.S[index].unit + ")"
            : ""
    }
    return name[tool] != undefined
        ? T(name[tool]).replace("$", size == 1 ? "" : index + 1)
        : ""
}

const Legendes = ({ index, temperatures, temperaturesList }) => {
    const labels = []
    //to workareound a display glich that I do not understand
    //we wait at least 2 data to display the legend
    if (temperaturesList.current.length < 2) return
    Object.keys(charts[index].series).forEach((tool) => {
        if (isVisible(tool) && temperatures[tool]) {
            temperatures[tool].map((entry, num) => {
                labels.push(
                    <div
                        className="legend-name"
                        style={`color:rgb(${
                            chartColors[colorIndex(charts[index], tool, num)]
                        })`}
                    >
                        {sensorName(
                            tool,
                            num,
                            temperatures[tool].length,
                            temperatures
                        )}
                    </div>
                )
            })
        }
    })

    return <div className="chart-legend">{labels}</div>
}

const ChartsPanel = () => {
    const { panels } = useUiContext()
    const { temperatures, temperaturesList, sensor, sensorList } =
        useTargetContext()
    charts[0].ref = useRef(null)
    charts[1].ref = useRef(null)
    charts[1].ref = useRef(null)
    const id = "chartsPanel"
    const clearCharts = () => {
        useUiContextFn.haptic()
        temperaturesList.clear()
        charts.forEach((chart) => {
            if (chart.chart) {
                Object.keys(chart.series).forEach((tool) => {
                    if (chart.series[tool]) {
                        chart.series[tool].forEach((serie) => {
                            if (serie) {
                                serie.clear()
                            }
                        })
                    }
                })
            }
        })
    }
    const menu = [
        {
            label: T("P58"),
            onClick: clearCharts,
        },
    ]
    console.log(id)

    useEffect(() => {
        const delay = useUiContextFn.getValue("pollingrefresh")
        buildCharts(0, temperaturesList.current, delay)
        buildCharts(1, temperaturesList.current, delay)
        buildCharts(2, sensorList.current, delay)
    }, [])
    useEffect(() => {
        updateCharts(0, temperatures)
        updateCharts(1, temperatures)
    }, [temperatures])
    useEffect(() => {
        updateCharts(2, sensor)
    }, [sensor])
    return (
        <div class="panel panel-dashboard">
            <div class="navbar">
                <span class="navbar-section feather-icon-container">
                    <Image />
                    <strong class="text-ellipsis">{T("P56")}</strong>
                </span>
                <span class="navbar-section">
                    <span class="H-100">
                        <PanelMenu items={menu} />
                        <span
                            class="btn btn-clear btn-close m-1"
                            aria-label="Close"
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                panels.hide(id)
                            }}
                        />
                    </span>
                </span>
            </div>
            <div class="panel-body panel-body-dashboard">
                <div class="charts-container">
                    {isChartVisible(0) && (
                        <div class="charts-subcontainer">
                            <canvas
                                class="chart"
                                id="chart1"
                                width="320"
                                height="100"
                                ref={charts[0].ref}
                            />
                            <Legendes
                                index="0"
                                temperatures={temperatures}
                                temperaturesList={temperaturesList}
                            />
                        </div>
                    )}

                    {isChartVisible(1) && (
                        <div class="charts-subcontainer">
                            <canvas
                                class="chart"
                                id="chart2"
                                width="320"
                                height="100"
                                ref={charts[1].ref}
                            />
                            <Legendes
                                index="1"
                                temperatures={temperatures}
                                temperaturesList={temperaturesList}
                            />
                        </div>
                    )}
                    {isChartVisible(2) && (
                        <div class="charts-subcontainer">
                            <canvas
                                class="chart"
                                id="chart3"
                                width="320"
                                height="100"
                                ref={charts[2].ref}
                            />
                            <Legendes
                                index="2"
                                temperatures={sensor}
                                temperaturesList={sensorList}
                            />
                        </div>
                    )}
                    <div class="m-1" />
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
