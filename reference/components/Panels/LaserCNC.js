/*
LaserCNC.js - ESP3D WebUI component file

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
import { useState, useRef } from "preact/hooks"
import { T } from "../Translations"
import { Loader, Sun, Power } from "preact-feather"
import { useUiContext, useUiContextFn } from "../../contexts"
import { useTargetContext, variablesList, eventsList } from "../../targets"
import { ButtonImg, Field, FullScreenButton, CloseButton, ContainerHelper } from "../Controls"
import { useHttpFn } from "../../hooks"
import { espHttpURL, replaceVariables, checkDependencies } from "../Helpers"

/*
 * Local const
 *
 */
const laserPercentage = {}
const lasertestduration = {}
const laserMaxPower = {}

/*
 * Callback function when reset is detected
 *
 */ const onReset = (data) => {
    console.log("reset Happend:", data)
    //Todo: TBD
}

const LaserControls = () => {
    const { states } = useTargetContext()
    //Add callback to reset event
    eventsList.on("reset", onReset)
    if (!useUiContextFn.getValue("showlaserpanel")) return null

    const states_array = [{ id: "spindle_mode", label: "CN91" }]
    return (
        <Fragment>
            {states && states.spindle_mode && (
                <div class="status-ctrls">
                    {states_array.map((element) => {
                        if (states[element.id]) {
                            return (
                                <div
                                    class="extra-control mt-1 tooltip tooltip-bottom"
                                    data-tooltip={T(element.label)}
                                >
                                    <div class="extra-control-header">
                                        {T(element.label)}
                                    </div>

                                    <div class="extra-control-value">
                                        {states[element.id].value}
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>
            )}
        </Fragment>
    )
}

const LaserPanel = () => {
    const { toasts, panels } = useUiContext()
    const { states } = useTargetContext()
    const { createNewRequest } = useHttpFn
    const id = "laserPanel"

    console.log("Laser panel")
    if (typeof laserPercentage.current === "undefined") {
        laserPercentage.current = useUiContextFn.getValue("lasertestprecent")
    }
    if (typeof lasertestduration.current === "undefined") {
        lasertestduration.current = useUiContextFn.getValue("lasertest")
    }
    if (typeof laserMaxPower.current === "undefined") {
        laserMaxPower.current = useUiContextFn.getValue("lasermax")
    }

    const hasError = () => {
        return !(
            laserPercentage.valid &&
            lasertestduration.valid &&
            laserMaxPower.valid
        )
    }

    const sendCommand = (command) => {
        createNewRequest(
            espHttpURL("command", {
                cmd: replaceVariables(variablesList.commands, command),
            }),
            {
                method: "GET",
                echo: replaceVariables(variablesList.commands, command, true),
            },
            {
                onSuccess: (result) => {},
                onFail: (error) => {
                    toasts.addToast({ content: error, type: "error" })
                    console.log(error)
                },
            }
        )
    }
    const laser_controls = [
        {
            label: "CN90",
            id: "laser_group",
            controls: [
                {
                    id: "maximum_power",
                    elements: [
                        {
                            id: "maximum_power",
                            type: "number",
                            label: "CN84",
                            tooltip: "CN84",
                            min: 0,
                            value: laserMaxPower,
                            variableName: "#laser_max#",
                        },
                    ],
                },

                {
                    id: "test_laser",
                    elements: [
                        {
                            id: "test_laser_duration",
                            type: "number",
                            label: "CN85",
                            tooltip: "CN85",
                            append: "S114",
                            min: 0,
                            value: lasertestduration,
                        },
                    ],
                },
                {
                    id: "laser_power",
                    elements: [
                        {
                            id: "laser_power_slider",
                            type: "slider",
                            label: "CN89",
                            tooltip: "CN89",
                            min: 0,
                            max: 100,
                            value: laserPercentage,
                            append: "%",
                        },
                    ],
                },

                {
                    id: "laser_buttons",
                    elements: [
                        {
                            id: "laser_test",
                            icon: <Sun />,
                            type: "button",
                            label: "CN86",
                            tooltip: "CN88",
                            useinput: "true",
                            command: "M3 S#",
                            desc: "M3",
                            mode: "spindle_mode",
                            onclick: (e) => {
                                const commands = [
                                    "G1 F1",
                                    () => {
                                        return (
                                            "M3 S" +
                                            (
                                                (parseInt(
                                                    laserMaxPower.current
                                                ) *
                                                    parseInt(
                                                        laserPercentage.current
                                                    )) /
                                                100
                                            ).toString()
                                        )
                                    },
                                    () => {
                                        return (
                                            "G4 P" +
                                            (
                                                parseFloat(
                                                    lasertestduration.current
                                                ) / 1000
                                            ).toString()
                                        )
                                    },
                                    "M5 S0",
                                ]
                                e.target.blur()
                                useUiContextFn.haptic()
                                commands.forEach((command) => {
                                    if (typeof command === "function") {
                                        sendCommand(command())
                                    } else {
                                        sendCommand(command)
                                    }
                                })
                            },
                        },
                        {
                            id: "laser_off",
                            icon: <Power />,
                            type: "button",
                            label: "CN23",
                            tooltip: "CN87",
                            desc: "M5",
                            command: "M5 S0",
                            mode: "spindle_mode",
                            onclick: () => {
                                sendCommand("M5 S0")
                            },
                        },
                    ],
                },
            ],
        },
    ]
    return (
        <div class="panel panel-dashboard" id={id}>
            <ContainerHelper id={id} /> 
            <div class="navbar">
                <span class="navbar-section feather-icon-container">
                    <Loader />
                    <strong class="text-ellipsis">{T("CN35")}</strong>
                </span>
                <span class="navbar-section">
                    <span class="full-height">
                        <FullScreenButton
                            elementId={id}
                        />
                        <CloseButton
                            elementId={id}
                            hideOnFullScreen={true}
                        />
                    </span>
                </span>
            </div>
            <div class="panel-body panel-body-dashboard">
                <LaserControls />
                {laser_controls.map((block) => {
                    return (
                        <fieldset class="fieldset-top-separator fieldset-bottom-separator field-group">
                            <legend>
                                <label class="m-1 buttons-bar-label">
                                    {T(block.label)}
                                </label>
                            </legend>
                            <div class="field-group-content maxwidth">
                                {block.controls.map((control) => {
                                    return (
                                        <div class="states-buttons-container">
                                            {control.elements.map((element) => {
                                                if (element.type === "button") {
                                                    let classname = "tooltip"
                                                    if (
                                                        states &&
                                                        element.mode &&
                                                        states[element.mode]
                                                    ) {
                                                        if (
                                                            states[element.mode]
                                                                .value ==
                                                            element.desc
                                                        ) {
                                                            classname +=
                                                                " btn-primary"
                                                        }
                                                    }
                                                    return (
                                                        <ButtonImg
                                                            label={T(
                                                                element.label
                                                            )}
                                                            disabled={
                                                                element.useinput
                                                                    ? hasError()
                                                                    : false
                                                            }
                                                            icon={element.icon}
                                                            tooltip
                                                            iconRight={
                                                                element.iconRight
                                                            }
                                                            data-tooltip={T(
                                                                element.tooltip
                                                            )}
                                                            mode={element.mode}
                                                            useinput={
                                                                element.useinput
                                                            }
                                                            onclick={
                                                                element.onclick
                                                            }
                                                        />
                                                    )
                                                } else {
                                                    //we won't handle modified state just handle error
                                                    //too many user cases where changing value to show button is not suitable
                                                    const [
                                                        validation,
                                                        setvalidation,
                                                    ] = useState({
                                                        message: null,
                                                        valid: true,
                                                        modified: false,
                                                    })

                                                    const generateValidation = (
                                                        element
                                                    ) => {
                                                        let validation = {
                                                            message: null,
                                                            valid: true,
                                                            modified: false,
                                                        }
                                                        if (
                                                            element.value
                                                                .current <
                                                                element.min ||
                                                            element.value
                                                                .current
                                                                .length === 0
                                                        ) {
                                                            //No error message to keep all control aligned
                                                            //may be have a better way ?
                                                            // validation.message = T("S42");
                                                            validation.valid = false
                                                        }
                                                        element.value.valid =
                                                            validation.valid
                                                        return validation
                                                    }

                                                    return (
                                                        <Field
                                                            inline
                                                            id={element.id}
                                                            type={element.type}
                                                            label={T(
                                                                element.label
                                                            )}
                                                            append={
                                                                element.append
                                                            }
                                                            min={element.min}
                                                            max={element.max}
                                                            value={
                                                                element.value
                                                                    .current
                                                            }
                                                            setValue={(
                                                                val,
                                                                update = false
                                                            ) => {
                                                                if (!update) {
                                                                    element.value.current =
                                                                        val
                                                                }
                                                                const validationObj =
                                                                    generateValidation(
                                                                        element
                                                                    )
                                                                setvalidation(
                                                                    validationObj
                                                                )
                                                                if (
                                                                    validationObj.valid &&
                                                                    element.variableName
                                                                ) {
                                                                    variablesList.addCommand(
                                                                        {
                                                                            name: element.variableName,
                                                                            value: element
                                                                                .value
                                                                                .current,
                                                                        }
                                                                    )
                                                                }
                                                            }}
                                                            validation={
                                                                validation
                                                            }
                                                        />
                                                    )
                                                }
                                            })}
                                        </div>
                                    )
                                })}
                            </div>
                        </fieldset>
                    )
                })}
            </div>
        </div>
    )
}

const LaserPanelElement = {
    id: "laserPanel",
    content: <LaserPanel />,
    name: "CN35",
    icon: "Loader",
    show: "showlaserpanel",
    onstart: "openlaseronstart",
    settingid: "laser",
}

export { LaserPanel, LaserPanelElement, LaserControls }
