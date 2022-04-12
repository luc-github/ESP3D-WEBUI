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

const isVisible = (tool) => {
    const setting = {
        T: "showextruderctrls",
        B: "showbedctrls",
        C: "showchamberctrls",
        P: "showprobectrls",
        R: "showredondantctrls",
        M: "showboardctrls",
    }
    return setting[tool] != undefined
        ? useUiContextFn.getValue(setting[tool])
        : false
}

const sensorName = (tool, index, size) => {
    const name = { T: "P41", B: "P37", C: "P43", P: "P42", R: "P44", M: "P90" }
    return name[tool] != undefined
        ? T(name[tool]).replace("$", size == 1 ? "" : index + 1)
        : ""
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

const ChartsPanel = () => {
    const { panels } = useUiContext()
    const { temperatures, temperaturesList } = useTargetContext()
    const lineRef = useRef()
    const chart = useRef()
    const id = "chartsPanel"
    console.log(id)
    const smoothieChart1 = useRef(null)
    const smoothieChart2 = useRef(null)
    const smoothieChart3 = useRef(null)
    const chart1 = useRef()
    const chart2 = useRef()
    const chart3 = useRef()

    const smoothieOpt = {
        millisPerPixel: 100,
        labels: { fillStyle: "#dadee4" },
        grid: {
            fillStyle: "#ffffff",
            strokeStyle: "#eef0f3",
            sharpLines: true,
            millisPerLine: 10000,
            verticalSections: 3,
            borderVisible: false,
            limitFPS: 15,
            maxValue: 400,
            minValue: -20,
        },
        limitFPS: 15,
    }
    const smoothieOpt2 = {
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

    Object.keys(temperatures).forEach((tool) => {
        // if (temperatures[tool].length != 0) hasTemp = true
    })
    useEffect(() => {
        chart1.current = new SmoothieChart(smoothieOpt2)
        chart1.current.streamTo(smoothieChart1.current, 3000)
        chart2.current = new SmoothieChart(smoothieOpt2)
        chart2.current.streamTo(smoothieChart2.current, 3000)
        chart3.current = new SmoothieChart(smoothieOpt2)
        chart3.current.streamTo(smoothieChart3.current, 3000)
        lineRef.current = new TimeSeries()
        chart1.current.addTimeSeries(lineRef.current, {
            lineWidth: 1,
            strokeStyle: "#a55eea",
            fillStyle: "rgba(255, 128, 255, 0.3)",
        })
        temperaturesList.current.forEach((entry, index) => {
            lineRef.current.append(entry.time, entry.temperatures.T[0].current)
        })
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
                    <canvas
                        class="chart"
                        id="chart1"
                        width="340"
                        height="100"
                        ref={smoothieChart1}
                    />
                    <canvas
                        class="chart"
                        id="chart2"
                        width="340"
                        height="100"
                        ref={smoothieChart2}
                    />
                    <canvas
                        class="chart"
                        id="chart3"
                        width="340"
                        height="100"
                        ref={smoothieChart3}
                    />
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
