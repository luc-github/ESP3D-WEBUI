/*
 ExtraControls.js - ESP3D WebUI component file

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

import { h } from "preact"
import { useState } from "preact/hooks"
import { T } from "../Translations"
import { Sliders, Send } from "preact-feather"
import { useUiContext, useUiContextFn } from "../../contexts"
import { useTargetContext } from "../../targets"
import { ButtonImg, Loading, Field } from "../Controls"
import { useHttpFn } from "../../hooks"
import { espHttpURL } from "../Helpers"

/*
 * Local const
 *
 */
/*for fan, flowrate, speed
/*each element has current, min, max
/*like
/*[
    [{current:0, min:0, max:100}, {current:0, min:0, max:100}],
    [{current:100, min:1, max:300}, {current:100, min:1, max:300}],
    [{current:100, min:1, max:300}]
]
*/
const target_values = [[], [], []]

const isVisible = (pos) => {
    const setting = ["showfanctrls", "showflowratectrls", "showspeedctrls"]

    return setting[pos] != undefined
        ? useUiContextFn.getValue(setting[pos])
        : false
}

const presetList = (pos) => {
    const setting = ["fanpresets", "flowratepresets", "speedpresets"]
    if (setting[pos] != undefined) {
        const list = useUiContextFn.getValue(setting[pos])
        if (list)
            return list.split(";").map((item) => {
                return { display: item + "%", value: item }
            })
    }
    return ""
}

const controlCommand = (pos, index, value) => {
    const setting = ["fancmd", "flowratecmd", "speedcmd"]

    if (setting[pos] != undefined) {
        const cmd = useUiContextFn.getValue(setting[pos])
        if (cmd)
            return cmd
                .replace("#", index)
                .replace("$", pos == 0 ? (parseInt(value) * 255) / 100 : value)
                .replace(";", "\n")
    }
    return ""
}

const controlMinMax = (pos) => {
    const setting = ["fanpresets", "flowratepresets", "speedpresets"]
    if (setting[pos] != undefined) {
        const element = useUiContextFn.getElement(setting[pos])
        if (element) return { min: element.min, max: element.max }
    }
    return ""
}

const ExtraControls = () => {
    const { temperatures, fanSpeed, flowRate, feedRate, sensor } =
        useTargetContext()
    if (
        !(
            useUiContextFn.getValue("showfanctrls") ||
            useUiContextFn.getValue("showflowratectrls") ||
            useUiContextFn.getValue("showfeedratectrls") ||
            useUiContextFn.getValue("showsensorctrls")
        )
    )
        return null
    return (
        <div class="extra-ctrls">
            {useUiContextFn.getValue("showfanctrls") &&
                fanSpeed.current.map((element, index) => {
                    const desc =
                        T("P31") +
                        (temperatures["T"].length > 1 ? index + 1 : "")
                    if (typeof element != "undefined")
                        return (
                            <div
                                class="extra-control mt-1 tooltip tooltip-bottom"
                                data-tooltip={desc}
                            >
                                <div class="extra-control-header">{desc}</div>
                                <div class="extra-control-value">{element}</div>
                            </div>
                        )
                })}
            {useUiContextFn.getValue("showflowratectrls") &&
                flowRate.current.map((element, index) => {
                    const desc =
                        T("P30") +
                        (temperatures["T"].length > 1 ? index + 1 : "")
                    if (typeof element != "undefined")
                        return (
                            <div
                                class="extra-control mt-1 tooltip tooltip-bottom"
                                data-tooltip={desc}
                            >
                                <div class="extra-control-header">{desc}</div>
                                <div class="extra-control-value">{element}</div>
                            </div>
                        )
                })}
            {useUiContextFn.getValue("showspeedctrls") &&
                feedRate.current.map((element, index) => {
                    const desc =
                        T("P12") +
                        (feedRate.current.length > 1 ? index + 1 : "")
                    if (typeof element != "undefined")
                        return (
                            <div
                                class="extra-control mt-1 tooltip tooltip-bottom"
                                data-tooltip={desc}
                            >
                                <div class="extra-control-header">{desc}</div>
                                <div class="extra-control-value">{element}</div>
                            </div>
                        )
                })}
            {useUiContextFn.getValue("showsensorctrls") &&
                sensor.S.map((element, index) => {
                    return (
                        <div
                            class="extra-control mt-1 tooltip tooltip-bottom"
                            data-tooltip={
                                T("sensor") + " (" + element.unit + ")"
                            }
                        >
                            <div class="extra-control-header">
                                {element.unit}
                            </div>
                            <div class="extra-control-value">
                                {element.value}
                            </div>
                        </div>
                    )
                })}
        </div>
    )
}

const ExtraInputControl = ({ element, index, size, pos }) => {
    if (!isVisible(pos)) return null
    const { toasts } = useUiContext()
    const { createNewRequest } = useHttpFn
    const sendCommand = (command) => {
        createNewRequest(
            espHttpURL("command", { cmd: command }),
            { method: "GET", echo: command },
            {
                onSuccess: (result) => {},
                onFail: (error) => {
                    toasts.addToast({ content: error, type: "error" })
                    console.log(error)
                },
            }
        )
    }
    const [validation, setvalidation] = useState({
        message: null,
        valid: true,
        modified: false,
    })
    //Sanity check
    //value
    if (typeof target_values[pos][index] == "undefined") {
        target_values[pos][index] = {}
        target_values[pos][index].current =
            typeof element.list.current[index] == "undefined" ||
            element.list.current[index] == -1
                ? pos == 0
                    ? 0
                    : 100
                : element.list.current[index]
    }
    if (typeof target_values[pos][index].min == "undefined") {
        const minmax = controlMinMax(pos)
        if (minmax) {
            target_values[pos][index].min = parseInt(minmax.min)
            target_values[pos][index].max = parseInt(minmax.max)
        }
    }
    const boundaries = controlMinMax(pos)
    const generateValidation = (tool, index) => {
        let validation = {
            message: null,
            valid: true,
            modified: false,
        }
        if (
            target_values[tool][index].current.length == 0 ||
            target_values[tool][index].current <
                target_values[tool][index].min ||
            target_values[tool][index].current > target_values[tool][index].max
        ) {
            //No error message to keep all control aligned
            //may be have a better way ?
            // validation.message = T("S42");
            validation.valid = false
        }

        return validation
    }
    return (
        <div class="extra-ctrls-container m-1">
            <div class="extra-ctrl-name">
                {T(element.name)
                    .replace("$", size > 1 ? index + 1 : "")
                    .trim()}
            </div>
            <div class="extra-ctrls-container2">
                <div>
                    <Field
                        id={"input-extra-" + pos + "-" + index}
                        type="number"
                        value={target_values[pos][index].current}
                        min={boundaries.min}
                        step="1"
                        max={boundaries.max}
                        width="4rem"
                        extra="dropList"
                        options={presetList(pos)}
                        setValue={(val, update) => {
                            if (!update) {
                                target_values[pos][index].current = val
                            }
                            setvalidation(generateValidation(pos, index))
                        }}
                        validation={validation}
                    />
                </div>
                <ButtonImg
                    id={"btn-send-extra-" + pos + "-" + index}
                    class={`extra-ctrl-send ${
                        !validation.valid ? "d-invisible" : ""
                    }`}
                    icon={<Send />}
                    tooltip
                    data-tooltip={T("S43")}
                    onClick={(e) => {
                        useUiContextFn.haptic()
                        e.target.blur()
                        sendCommand(
                            controlCommand(
                                pos,
                                index,
                                target_values[pos][index].current
                            )
                        )
                        element.list.current[index] =
                            target_values[pos][index].current
                    }}
                />
            </div>
        </div>
    )
}

const ExtraControlsPanel = () => {
    const { panels, uisettings } = useUiContext()
    const { temperatures, fanSpeed, flowRate, feedRate } = useTargetContext()
    const id = "extraControlsPanel"
    const hidePanel = () => {
        useUiContextFn.haptic()
        panels.hide(id)
    }
    const inputList = [
        { name: "P91", list: fanSpeed },
        { name: "P92", list: flowRate },
        { name: "P93", list: feedRate },
    ]

    console.log("Extra Controls panel")

    return (
        <div class="panel panel-dashboard">
            <div class="navbar">
                <span class="navbar-section feather-icon-container">
                    <Sliders />
                    <strong class="text-ellipsis">{T("P96")}</strong>
                </span>
                <span class="navbar-section">
                    <span style="height: 100%;">
                        <span
                            class="btn btn-clear btn-close m-1"
                            aria-label="Close"
                            onclick={hidePanel}
                        />
                    </span>
                </span>
            </div>
            <div class="panel-body panel-body-dashboard">
                <ExtraControls />
                {temperatures["T"].length > 0 && (
                    <div class="extruders-container">
                        {inputList.map((element, pos) => {
                            return temperatures["T"].map((item, index) => {
                                if (pos == 2 && index > 0) return null
                                return (
                                    <ExtraInputControl
                                        element={element}
                                        index={index}
                                        size={
                                            pos == 2
                                                ? 1
                                                : temperatures["T"].length
                                        }
                                        pos={pos}
                                    />
                                )
                            })
                        })}
                    </div>
                )}
                {temperatures["T"].length == 0 && (
                    <div class="loading-panel">
                        <div class="m-2">
                            <div class="m-1">{T("P89")}</div>
                            <Loading />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const ExtraControlsPanelElement = {
    id: "extraControlsPanel",
    content: <ExtraControlsPanel />,
    name: "P96",
    icon: "Sliders",
    show: "showextracontrolspanel",
    onstart: "openextracontrolsonstart",
}

export { ExtraControlsPanel, ExtraControlsPanelElement, ExtraControls }
