/*
Temperatures.js - ESP3D WebUI component file

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
import { useState } from "preact/hooks"
import { ButtonImg, Loading, Field } from "../Controls"
import { useHttpFn } from "../../hooks"
import { espHttpURL } from "../Helpers"
import { Thermometer, Power, Send } from "preact-feather"
import { useTargetContext } from "../../targets"

/*
 * Local const
 *
 */
//each one has
//{current: 0, max: tbd}
const target_temperatures = {
    T: [], //0->8 T0->T8 Extruders
    B: [], //0->1 B Bed
    C: [], //0->1  Chamber
}

const isEditable = (tool) => {
    if (tool == "T" || tool == "B" || tool == "C") return true
    return false
}

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

const preheatList = (tool) => {
    if (tool == "T" || tool == "B" || tool == "C") {
        const list = useUiContextFn.getValue(
            tool == "T"
                ? "extruderpreheat"
                : tool == "B"
                ? "bedpreheat"
                : "chamberpreheat"
        )
        if (list)
            return list.split(";").map((item) => {
                return { display: item + T("P72"), value: item }
            })
    }
    return ""
}

const heaterCommand = (tool, index, value) => {
    if (tool == "T" || tool == "B" || tool == "C") {
        const cmd = useUiContextFn.getValue(
            tool == "T"
                ? "heatextruder"
                : tool == "B"
                ? "heatbed"
                : "heatchamber"
        )
        if (cmd)
            return cmd
                .replace("#", index)
                .replace("$", value)
                .replace(";", "\n")
    }
    return ""
}

const sensorName = (tool, index, size) => {
    const name = { T: "P41", B: "P37", C: "P43", P: "P42", R: "P44", M: "P90" }
    return name[tool] != undefined
        ? T(name[tool]).replace("$", size == 1 ? "" : index + 1)
        : ""
}

//A separate control to avoid the full panel to be updated when the temperatures are updated
const TemperaturesControls = () => {
    const { temperatures } = useTargetContext()
    return (
        <div class="temperatures-ctrls">
            {Object.keys(temperatures).map((tool) => {
                if (temperatures[tool].length == 0 || !isVisible(tool)) return
                return (
                    <Fragment>
                        {temperatures[tool].map((temp, index) => {
                            return (
                                <div
                                    class="temperatures-ctrl mt-1 tooltip tooltip-bottom"
                                    data-tooltip={sensorName(
                                        tool,
                                        index,
                                        temperatures[tool].length
                                    )}
                                >
                                    <div class="temperatures-header">
                                        {tool}
                                        {temperatures[tool].length > 1
                                            ? index
                                            : ""}
                                    </div>
                                    <div class="temperatures-value">
                                        {temp.value}
                                    </div>
                                    {temp.target > 0 && (
                                        <div class=" temperatures-target">
                                            {temp.target}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </Fragment>
                )
            })}
        </div>
    )
}

const TemperatureInputControl = ({ tool, index, size }) => {
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
    //we won't handle modified state just handle error
    //too many user cases where changing value to show button is not suitable
    const [validation, setvalidation] = useState({
        message: null,
        valid: true,
        modified: false,
    })

    const getMaxTemperature = (tool) => {
        const setting = {
            T: "extrudermax",
            B: "bedmax",
            C: "chambermax",
        }
        return setting[tool] != undefined
            ? useUiContextFn.getValue(setting[tool])
            : 0
    }
    const generateValidation = (tool, index) => {
        let validation = {
            message: null,
            valid: true,
            modified: false,
        }
        if (
            target_temperatures[tool][index].current.length == 0 ||
            target_temperatures[tool][index].current < 0 ||
            (target_temperatures[tool][index].max &&
                target_temperatures[tool][index].current >
                    target_temperatures[tool][index].max)
        ) {
            //No error message to keep all control aligned
            //may be have a better way ?
            // validation.message = T("S42");
            validation.valid = false
        }

        return validation
    }
    //todo extract max value from settings
    const max = parseFloat(getMaxTemperature(tool))
    if (target_temperatures[tool][index] == undefined)
        target_temperatures[tool][index] = {
            current: 0,
            max: max > 0 ? max : null,
            stopcmd: heaterCommand(tool, index, 0),
        }
    return (
        <div class="temperature-ctrls-container m-1">
            <div class="temperature-ctrl-name">
                {sensorName(tool, index, size)}
            </div>
            <div class="temperature-ctrls-container2">
                <ButtonImg
                    id={"btn-stop-" + tool + index}
                    class="temperature-ctrl-stop m-1"
                    icon={<Power />}
                    tooltip
                    data-tooltip={T("P38")}
                    onClick={(e) => {
                        useUiContextFn.haptic()
                        e.target.blur()
                        sendCommand(target_temperatures[tool][index].stopcmd)
                    }}
                />
                <div class="m-1" />
                <div>
                    <Field
                        id={"input-" + tool + index}
                        type="number"
                        value={target_temperatures[tool][index].current}
                        min="0"
                        step="0.5"
                        max={max > 0 ? max : null}
                        width="4rem"
                        extra="dropList"
                        options={preheatList(tool)}
                        setValue={(val, update) => {
                            if (!update)
                                target_temperatures[tool][index].current = val
                            setvalidation(generateValidation(tool, index))
                        }}
                        validation={validation}
                    />
                </div>
                <ButtonImg
                    id={"btn-send" + tool + index}
                    class={`temperature-ctrl-send ${
                        !validation.valid ? "d-invisible" : ""
                    }`}
                    icon={<Send />}
                    tooltip
                    data-tooltip={T("S43")}
                    onClick={(e) => {
                        useUiContextFn.haptic()
                        e.target.blur()
                        sendCommand(
                            heaterCommand(
                                tool,
                                index,
                                target_temperatures[tool][index].current
                            )
                        )
                    }}
                />
            </div>
        </div>
    )
}

const TemperaturesPanel = () => {
    const { panels } = useUiContext()
    const { temperatures } = useTargetContext()
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
    const id = "temperaturesPanel"
    console.log(id)
    let hasTemp = false
    Object.keys(temperatures).forEach((tool) => {
        if (temperatures[tool].length != 0) hasTemp = true
    })
    return (
        <div class="panel panel-dashboard">
            <div class="navbar">
                <span class="navbar-section feather-icon-container">
                    <Thermometer />
                    <strong class="text-ellipsis">{T("P29")}</strong>
                </span>
                <span class="navbar-section">
                    <span style="height: 100%;">
                        <button
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
                {hasTemp && (
                    <div class="temperatures-container">
                        <TemperaturesControls />
                        {Object.keys(temperatures).map((tool) => {
                            if (
                                temperatures[tool].length == 0 ||
                                !isVisible(tool) ||
                                !isEditable(tool)
                            )
                                return
                            return (
                                <Fragment>
                                    {temperatures[tool].map((temp, index) => {
                                        return (
                                            <TemperatureInputControl
                                                tool={tool}
                                                index={index}
                                                size={temperatures[tool].length}
                                            />
                                        )
                                    })}
                                </Fragment>
                            )
                        })}
                        <div class="temperature-extra-buttons-container m-2">
                            <ButtonImg
                                id="stop-all"
                                icon={<Power />}
                                label={T("P40")}
                                tooltip
                                data-tooltip={T("P38")}
                                onClick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    Object.keys(target_temperatures).forEach(
                                        (tool) => {
                                            if (
                                                target_temperatures[tool]
                                                    .length == 0
                                            )
                                                return
                                            target_temperatures[tool].forEach(
                                                (temp, index) => {
                                                    sendCommand(temp.stopcmd)
                                                }
                                            )
                                        }
                                    )
                                }}
                            />
                        </div>
                    </div>
                )}
                {!hasTemp && (
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

const TemperaturesPanelElement = {
    id: "temperaturesPanel",
    content: <TemperaturesPanel />,
    name: "P29",
    icon: "Thermometer",
    show: "showtemperaturespanel",
    onstart: "opentemperaturesonstart",
}

export { TemperaturesPanel, TemperaturesPanelElement, TemperaturesControls }
