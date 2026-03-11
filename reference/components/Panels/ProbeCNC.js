/*
ProbeCNC.js - ESP3D WebUI component file

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
import { Underline } from "preact-feather"
import {
    useUiContext,
    useUiContextFn,
    useSettingsContext,
} from "../../contexts"
import { useTargetContext, variablesList } from "../../targets"
import { ButtonImg, Field, FullScreenButton, CloseButton, ContainerHelper } from "../Controls"
import { useHttpFn } from "../../hooks"
import { espHttpURL, replaceVariables, checkDependencies } from "../Helpers"

/*
 * Local const
 *
 */

const maxprobe = {}
const probefeedrate = {}
const probethickness = {}
const probetype = {}
const probeaxis = {}

const ProbeControls = () => {
    const { gcodeParameters, pinsStates } = useTargetContext()
    if (!useUiContextFn.getValue("showprobepanel")) return null
    return (
        <Fragment>
            <div class="status-ctrls">
                <div
                    class="extra-control mt-1 tooltip tooltip-bottom"
                    data-tooltip={T("CN103")}
                >
                    <div class="extra-control-header">{T("CN104")}</div>
                    <div class="extra-control-value">
                        {gcodeParameters.PRB
                            ? T(gcodeParameters.PRB.success ? "CN101" : "CN102")
                            : "?"}
                    </div>
                    {pinsStates && (
                        <div class="extra-control-value">
                            <div
                                class={`badge-container m-1 s-circle ${
                                    pinsStates.P ? "bg-primary" : "bg-secondary"
                                }`}
                            >
                                <div
                                    class={`badge-label m-1 s-circle ${
                                        pinsStates.P
                                            ? "bg-primary text-white"
                                            : "bg-secondary text-primary"
                                    }`}
                                >
                                    P
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    )
}

const ProbePanel = () => {
    const { toasts } = useUiContext()
    const { interfaceSettings, connectionSettings } = useSettingsContext()
    //const { status } = useTargetContext()
    const { createNewRequest } = useHttpFn
    const id = "ProbePanel"

    console.log("Probe panel")
    if (typeof maxprobe.current === "undefined") {
        maxprobe.current = useUiContextFn.getValue("maxprobe")
    }
    if (typeof probefeedrate.current === "undefined") {
        probefeedrate.current = useUiContextFn.getValue("probefeedrate")
    }
    if (typeof probethickness.current === "undefined") {
        probethickness.current = useUiContextFn.getValue("probethickness")
    }
    if (typeof probetype.current === "undefined") {
        probetype.current = "G38.2"
    }
    if (typeof probeaxis.current === "undefined") {
        probeaxis.current = "Z"
    }

    const hasError = () => {
        return !(probefeedrate.valid && probethickness.valid && maxprobe.valid)
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
    const probe_controls = [
        {
            label: "",
            id: "probe_group",
            controls: [
                {
                    id: "probe_type",
                    elements: [
                        {
                            id: "probe_axis",
                            type: "select",
                            label: "CN99",
                            tooltip: "CN98",
                            options: [
                                {
                                    label: "X",
                                    value: "X",
                                    depend: [
                                        { id: "showx", value: true },
                                        {
                                            connection_id: "Axisletters",
                                            contains: "X",
                                        },
                                    ],
                                },
                                {
                                    label: "Y",
                                    value: "Y",
                                    depend: [
                                        { id: "showy", value: true },
                                        {
                                            connection_id: "Axisletters",
                                            contains: "Y",
                                        },
                                    ],
                                },
                                {
                                    label: "Z",
                                    value: "Z",
                                    depend: [
                                        { id: "showz", value: true },
                                        {
                                            connection_id: "Axisletters",
                                            contains: "Z",
                                        },
                                    ],
                                },
                                ,
                                {
                                    label: "A",
                                    value: "A",
                                    depend: [
                                        { id: "showa", value: true },
                                        {
                                            connection_id: "Axisletters",
                                            contains: "A",
                                        },
                                    ],
                                },
                                ,
                                {
                                    label: "B",
                                    value: "B",
                                    depend: [
                                        { id: "showb", value: true },
                                        {
                                            connection_id: "Axisletters",
                                            contains: "B",
                                        },
                                    ],
                                },
                                ,
                                {
                                    label: "C",
                                    value: "C",
                                    depend: [
                                        { id: "showc", value: true },
                                        {
                                            connection_id: "Axisletters",
                                            contains: "C",
                                        },
                                    ],
                                },
                                ,
                                {
                                    label: "U",
                                    value: "U",
                                    depend: [
                                        { id: "showu", value: true },
                                        {
                                            connection_id: "Axisletters",
                                            contains: "U",
                                        },
                                    ],
                                },
                                {
                                    label: "V",
                                    value: "V",
                                    depend: [
                                        { id: "showv", value: true },
                                        {
                                            connection_id: "Axisletters",
                                            contains: "V",
                                        },
                                    ],
                                },
                                ,
                                {
                                    label: "W",
                                    value: "W",
                                    depend: [
                                        { id: "showw", value: true },
                                        {
                                            connection_id: "Axisletters",
                                            contains: "W",
                                        },
                                    ],
                                },
                            ],

                            value: probeaxis,
                            variableName: "#selected_axis#",
                        },
                        {
                            id: "probe_type",
                            type: "select",
                            label: "CN98",
                            tooltip: "CN98",
                            options: [
                                { label: "G38.2", value: "G38.2" },
                                { label: "G38.3", value: "G38.3" },
                                { label: "G38.4", value: "G38.4" },
                                { label: "G38.5", value: "G38.5" },
                            ],
                            value: probetype,
                        },
                    ],
                },
                {
                    id: "probe_max",
                    elements: [
                        {
                            id: "probe_max_distance",
                            type: "number",
                            label: "CN93",
                            tooltip: "CN93",
                            min: 1,
                            value: maxprobe,
                            append: "CN96",
                        },
                    ],
                },

                {
                    id: "probe_feedrate",
                    elements: [
                        {
                            id: "probe_feedrate",
                            type: "number",
                            label: "CN9",
                            tooltip: "CN9",
                            append: "CN1",
                            min: 1,
                            value: probefeedrate,
                        },
                    ],
                },
                {
                    id: "probe_thickness",
                    elements: [
                        {
                            id: "probe_thickness",
                            type: "number",
                            label: "CN94",
                            tooltip: "CN94",
                            min: 0,
                            step: useUiContextFn.getElement("probethickness")
                                .step,
                            value: probethickness,
                            append: "CN96",
                            variableName: "#probe_thickness#",
                        },
                    ],
                },
                {
                    id: "spacer",
                    elements: [
                        {
                            id: "spacer",
                            type: "m2",
                        },
                    ],
                },
                {
                    id: "probe_buttons",
                    elements: [
                        {
                            id: "probe_button",
                            m2: true,
                            icon: <Underline />,
                            type: "button",
                            label: "CN37",
                            tooltip: "CN100",
                            onclick: (e) => {
                                const commands = [
                                    "G91",
                                    () => {
                                        const signe =
                                            probetype.current == "G38.2" ||
                                            probetype.current == "G38.3"
                                                ? "-"
                                                : ""
                                        return (
                                            probetype.current +
                                            " " +
                                            probeaxis.current +
                                            signe +
                                            maxprobe.current +
                                            " F" +
                                            probefeedrate.current
                                        )
                                    },
                                    "G90",

                                    ...useUiContextFn
                                        .getValue("probepostcommand")
                                        .split(";"),
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
                    <Underline />
                    <strong class="text-ellipsis">{T("CN37")}</strong>
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
                <ProbeControls />
                {probe_controls.map((block) => {
                    return (
                        <fieldset
                            class={`field-group${
                                block.label.length > 0
                                    ? " fieldset-top-separator fieldset-bottom-separator"
                                    : ""
                            }`}
                        >
                            <legend>
                                {block.label.length > 0 && (
                                    <label class="m-1 buttons-bar-label">
                                        {T(block.label)}
                                    </label>
                                )}
                            </legend>

                            <div class="field-group-content maxwidth text-dark">
                                {block.controls.map((control) => {
                                    return (
                                        <div class="states-buttons-container">
                                            {control.elements.map((element) => {
                                                if (element.type === "m2") {
                                                    return <div class="m-2" />
                                                } else if (
                                                    element.type === "button"
                                                ) {
                                                    let classname = "tooltip"
                                                    return (
                                                        <ButtonImg
                                                            label={T(
                                                                element.label
                                                            )}
                                                            disabled={hasError()}
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
                                                            element.type ===
                                                                "select" &&
                                                            -1 ==
                                                                filterOptions(
                                                                    element.options
                                                                ).findIndex(
                                                                    (item) =>
                                                                        item.value ==
                                                                        element
                                                                            .value
                                                                            .current
                                                                )
                                                        ) {
                                                            element.value.current =
                                                                filterOptions(
                                                                    element.options
                                                                )[0].value
                                                        }
                                                        if (
                                                            typeof element.step !==
                                                            "undefined"
                                                        ) {
                                                            //hack to avoid float precision issue
                                                            const mult =
                                                                (
                                                                    1 /
                                                                    element.step
                                                                ).toFixed(0) > 0
                                                                    ? (
                                                                          1 /
                                                                          element.step
                                                                      ).toFixed(
                                                                          0
                                                                      )
                                                                    : 1
                                                            const valueMult =
                                                                Math.round(
                                                                    element
                                                                        .value
                                                                        .current *
                                                                        mult
                                                                )
                                                            const stepMult =
                                                                Math.round(
                                                                    element.step *
                                                                        mult
                                                                )
                                                            console.log(
                                                                "Element:",
                                                                element.value
                                                                    .current,
                                                                "Step:",
                                                                element.step,
                                                                "Mult",
                                                                mult,
                                                                "Modal:",
                                                                "Value mult",
                                                                valueMult,
                                                                "Step mult",
                                                                stepMult,
                                                                "Modulo",
                                                                valueMult %
                                                                    stepMult
                                                            )
                                                            if (
                                                                valueMult %
                                                                    stepMult !=
                                                                0
                                                            ) {
                                                                console.log(
                                                                    "not valid"
                                                                )
                                                                validation.valid = false
                                                            }
                                                        }
                                                        if (
                                                            element.type ===
                                                                "number" &&
                                                            (element.value
                                                                .current <
                                                                element.min ||
                                                                element.value
                                                                    .current
                                                                    .length ===
                                                                    0)
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
                                                    const filterOptions = (
                                                        options
                                                    ) => {
                                                        if (options)
                                                            return options.filter(
                                                                (option) => {
                                                                    return checkDependencies(
                                                                        option.depend,
                                                                        interfaceSettings
                                                                            .current
                                                                            .settings,
                                                                        connectionSettings.current
                                                                    )
                                                                }
                                                            )
                                                        return options
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
                                                            options={filterOptions(
                                                                element.options
                                                            )}
                                                            min={element.min}
                                                            max={element.max}
                                                            step={element.step}
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

const ProbePanelElement = {
    id: "ProbePanel",
    content: <ProbePanel />,
    name: "CN37",
    icon: "Underline",
    show: "showprobepanel",
    onstart: "openprobeonstart",
    settingid: "probe",
}

export { ProbePanel, ProbePanelElement, ProbeControls }
