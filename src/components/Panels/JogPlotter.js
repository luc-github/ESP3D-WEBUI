/*
JogPlotter.js - ESP3D WebUI component file

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
import {
    Edit2,
    Home,
    Move,
    ChevronDown,
    Edit3,
    StopCircle,
} from "preact-feather"
import { useHttpFn } from "../../hooks"
import { espHttpURL, replaceVariables } from "../Helpers"
import { useUiContext, useUiContextFn } from "../../contexts"
import { T } from "../Translations"
import { Button, ButtonImg, FullScreenButton, CloseButton, ContainerHelper } from "../Controls"
import { useEffect, useRef } from "preact/hooks"
import { showModal } from "../Modal"
import { useTargetContext, variablesList } from "../../targets"
import { Field } from "../Controls"

let currentVelocity = 0
let currentJogDistance = 100
let currentSteps = 0

/*
 * Local const
 *
 */
//A separate control to avoid the full panel to be updated when the positions are updated
const PositionsControls = () => {
    const { positions } = useTargetContext()
    const steps = useUiContextFn.getValue("steps")
    return (
        <Fragment>
            <div class="jog-positions-ctrls m-1">
                {useUiContextFn.getValue("showx") && (
                    <div class="jog-position-ctrl">
                        {typeof positions.x != "undefined" && (
                            <Fragment>
                                <div class="jog-position-sub-header">X</div>
                                <div class="m-1 jog-position-value">
                                    {positions.x == "?"
                                        ? "?"
                                        : positions.x / steps}
                                </div>
                            </Fragment>
                        )}
                    </div>
                )}
                {useUiContextFn.getValue("showy") && (
                    <div class="jog-position-ctrl">
                        {typeof positions.y != "undefined" && (
                            <Fragment>
                                <div class="jog-position-sub-header">Y</div>
                                <div class="m-1 jog-position-value">
                                    {positions.y == "?"
                                        ? "?"
                                        : positions.y / steps}
                                </div>
                            </Fragment>
                        )}
                    </div>
                )}
                {useUiContextFn.getValue("showpen") && (
                    <div class="jog-position-ctrl">
                        {typeof positions.pen != "undefined" && (
                            <Fragment>
                                <div class="jog-position-sub-header">
                                    {T("HP17")}
                                </div>
                                <div class="m-1 jog-position-value">
                                    {positions.pen == "?" ? (
                                        "?"
                                    ) : positions.pen == "1" ? (
                                        <Edit3 />
                                    ) : (
                                        <span>_</span>
                                    )}
                                </div>
                            </Fragment>
                        )}
                    </div>
                )}
            </div>
        </Fragment>
    )
}

const JogPanel = () => {
    const { modals, toasts } = useUiContext()

    const { createNewRequest } = useHttpFn
    const { positions } = useTargetContext()
    const id = "jogPanel"
    console.log(id)
    //Send a request to the ESP
    const SendCommand = (command) => {
        createNewRequest(
            espHttpURL("command", {
                cmd: replaceVariables(variablesList.commands, command),
            }),
            {
                method: "GET",
                echo: replaceVariables(variablesList.commands, command, true), //need to see the command sent but keep the not printable command as variable
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

    //we could use an array of object {distance, prev, next}
    //but for the 5 entries this works too
    const selectorBtn = (type) => {
        if (type == "+") {
            if (currentJogDistance == 100) clickBtn("move_0_1")
            else if (currentJogDistance == 0.1) clickBtn("move_1")
            else if (currentJogDistance == 1) clickBtn("move_10")
            else if (currentJogDistance == 10) clickBtn("move_50")
            else if (currentJogDistance == 50) clickBtn("move_100")
        } else if (type == "-") {
            if (currentJogDistance == 100) clickBtn("move_50")
            else if (currentJogDistance == 0.1) clickBtn("move_100")
            else if (currentJogDistance == 1) clickBtn("move_0_1")
            else if (currentJogDistance == 10) clickBtn("move_1")
            else if (currentJogDistance == 50) clickBtn("move_10")
        }
    }

    //Send Home command
    const sendParkCommand = () => {
        const command = useUiContextFn.getValue("jogparkcmd")
        const cmds = command.split(";")
        cmds.forEach((cmd) => {
            if (cmd.trim().length > 0) {
                SendCommand(variablesList.formatCommand(cmd))
            }
        })
    }
    const buttonsInfos = {}
    const initButtons = () => {
        const btnYplus = { label: "Y+", tooltip: "HP6", cmd: "Y+" }
        const btnXplus = { label: "X+", tooltip: "HP6", cmd: "X+" }
        const btnYminus = {
            label: "Y-",
            tooltip: "HP7",
            cmd: "Y-",
        }
        const btnXminus = {
            label: "X-",
            tooltip: "HP7",
            cmd: "X-",
        }
        const showxy =
            useUiContextFn.getValue("showx") && useUiContextFn.getValue("showy")
        const invertx = useUiContextFn.getValue("invertx")
        const inverty = useUiContextFn.getValue("inverty")
        const swapxy = showxy ? useUiContextFn.getValue("swapxy") : false

        if (swapxy) {
            if (inverty) {
                buttonsInfos.R = btnYplus
                buttonsInfos.L = btnYminus
            } else {
                buttonsInfos.L = btnYplus
                buttonsInfos.R = btnYminus
            }

            if (invertx) {
                buttonsInfos.B = btnXplus
                buttonsInfos.T = btnXminus
            } else {
                buttonsInfos.T = btnXplus
                buttonsInfos.B = btnXminus
            }
        } else {
            if (inverty) {
                buttonsInfos.B = btnYplus
                buttonsInfos.T = btnYminus
            } else {
                buttonsInfos.T = btnYplus
                buttonsInfos.B = btnYminus
            }

            if (invertx) {
                buttonsInfos.R = btnXplus
                buttonsInfos.L = btnXminus
            } else {
                buttonsInfos.L = btnXplus
                buttonsInfos.R = btnXminus
            }
        }
    }
    initButtons()

    //Send jog command
    const sendJogCommand = (axis) => {
        let velocitycmd = ""
        let jogcmd = "PR"
        if (currentVelocity != 0) velocitycmd = "VS" + currentVelocity + ";"
        switch (axis) {
            case "X+":
                jogcmd += currentJogDistance * currentSteps + ",0;"
                break
            case "X-":
                jogcmd += "-" + currentJogDistance * currentSteps + ",0;"
                break
            case "Y-":
                jogcmd += "0,-" + currentJogDistance * currentSteps + ";"
                break
            case "Y+":
                jogcmd += "0," + currentJogDistance * currentSteps + ";"
                break
            default:
                console.log("Unknow axis: " + axis)
                return
        }
        if (velocitycmd.length != 0) {
            SendCommand(velocitycmd)
        }
        SendCommand(jogcmd)
    }

    //click distance button
    const onCheck = (e, distance) => {
        e.target.blur()
        currentJogDistance = distance
    }

    //Set the current velocity
    const setVelocity = () => {
        let value = currentVelocity
        showModal({
            modals,
            title: T("HP1"),
            button2: { text: T("S28") },
            button1: {
                cb: () => {
                    if (value.length >= 0) currentVelocity = value
                },
                text: T("S43"),
                id: "applyVelocityBtn",
            },
            icon: <Edit2 />,
            id: "inputVelocity",
            content: (
                <Fragment>
                    <div>{T("HP1")}</div>
                    <input
                        class="form-input"
                        type="number"
                        step="1"
                        min="0"
                        value={value}
                        onInput={(e) => {
                            value = e.target.value.trim()
                            console.log(value)
                            if (value < 0 || value.length == 0) {
                                if (
                                    document.getElementById("applyVelocityBtn")
                                ) {
                                    document.getElementById(
                                        "applyVelocityBtn"
                                    ).disabled = true
                                }
                            } else {
                                if (
                                    document.getElementById("applyVelocityBtn")
                                ) {
                                    document.getElementById(
                                        "applyVelocityBtn"
                                    ).disabled = false
                                }
                            }
                        }}
                    />
                </Fragment>
            ),
        })
    }

    //Set the current velocity
    const setSteps = () => {
        let value = currentSteps
        showModal({
            modals,
            title: T("HP2"),
            button2: { text: T("S28") },
            button1: {
                cb: () => {
                    if (value.length >= 0) currentSteps = value
                },
                text: T("S43"),
                id: "applyStepsBtn",
            },
            icon: <Edit2 />,
            id: "inputSteps",
            content: (
                <Fragment>
                    <div>{T("HP2")}</div>
                    <input
                        class="form-input"
                        type="number"
                        step="1"
                        min="1"
                        value={value}
                        onInput={(e) => {
                            value = e.target.value.trim()
                            if (value < 1 || value.length == 0) {
                                if (document.getElementById("applyStepsBtn")) {
                                    document.getElementById(
                                        "applyStepsBtn"
                                    ).disabled = true
                                }
                            } else {
                                if (document.getElementById("applyStepsBtn")) {
                                    document.getElementById(
                                        "applyStepsBtn"
                                    ).disabled = false
                                }
                            }
                        }}
                    />
                </Fragment>
            ),
        })
    }

    useEffect(() => {
        currentVelocity = useUiContextFn.getValue("velocity")
        currentSteps = useUiContextFn.getValue("steps")
    }, [])
    return (
        <div class="panel panel-dashboard" id={id}>
            <ContainerHelper id={id} /> 
            <div class="navbar">
                <span class="navbar-section feather-icon-container">
                    <Move />
                    <strong class="text-ellipsis">{T("S66")}</strong>
                </span>
                <span class="navbar-section">
                    <span class="H-100">
                        <div class="dropdown dropdown-right">
                            <span
                                class="dropdown-toggle btn btn-xs btn-header m-1"
                                tabindex="0"
                            >
                                <ChevronDown size="0.8rem" />
                            </span>

                            <ul class="menu">
                                <li class="menu-item">
                                    <div
                                        class="menu-entry"
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            setVelocity()
                                        }}
                                    >
                                        <div class="menu-panel-item">
                                            <span class="text-menu-item">
                                                {T("HP1")}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                                <li class="menu-item">
                                    <div
                                        class="menu-entry"
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            setSteps()
                                        }}
                                    >
                                        <div class="menu-panel-item">
                                            <span class="text-menu-item">
                                                {T("HP2")}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
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
            <div class="m-1 jog-container">
                <PositionsControls />
                <div class="m-1">
                    <div class="jog-buttons-main-container">
                        <div class="m-1 jog-buttons-container">
                            <div class="jog-buttons-line-top-container">
                                {((useUiContextFn.getValue("showx") &&
                                    buttonsInfos.T.cmd.startsWith("X")) ||
                                    (useUiContextFn.getValue("showy") &&
                                        buttonsInfos.T.cmd.startsWith(
                                            "Y"
                                        ))) && (
                                    <Button
                                        class="button-minimal"
                                        lg
                                        m2
                                        tooltip
                                        nomin
                                        data-tooltip={T(buttonsInfos.T.tooltip)}
                                        id="btnjogup"
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            e.target.blur()
                                            sendJogCommand(buttonsInfos.T.cmd)
                                        }}
                                    >
                                        {buttonsInfos.T.label}
                                    </Button>
                                )}
                            </div>
                            <div class="jog-buttons-line-container">
                                {((useUiContextFn.getValue("showx") &&
                                    buttonsInfos.L.cmd.startsWith("X")) ||
                                    (useUiContextFn.getValue("showy") &&
                                        buttonsInfos.L.cmd.startsWith(
                                            "Y"
                                        ))) && (
                                    <ButtonImg
                                        class="button-minimal"
                                        m2
                                        lg
                                        tooltip
                                        nomin
                                        data-tooltip={T(buttonsInfos.L.tooltip)}
                                        id="btnjogleft"
                                        label={buttonsInfos.L.label}
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            e.target.blur()
                                            sendJogCommand(buttonsInfos.L.cmd)
                                        }}
                                    />
                                )}
                                <ButtonImg
                                    lg
                                    m2
                                    tooltip
                                    icon=<Home />
                                    data-tooltip={T("HP19")}
                                    id={"btnpark"}
                                    onclick={(e) => {
                                        useUiContextFn.haptic()
                                        e.target.blur()
                                        sendParkCommand()
                                    }}
                                />

                                {((useUiContextFn.getValue("showx") &&
                                    buttonsInfos.L.cmd.startsWith("X")) ||
                                    (useUiContextFn.getValue("showy") &&
                                        buttonsInfos.L.cmd.startsWith(
                                            "Y"
                                        ))) && (
                                    <ButtonImg
                                        class="button-minimal"
                                        lg
                                        m2
                                        nomin
                                        label={buttonsInfos.R.label}
                                        tooltip
                                        data-tooltip={T(buttonsInfos.R.tooltip)}
                                        id="btnjogright"
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            e.target.blur()
                                            sendJogCommand(buttonsInfos.R.cmd)
                                        }}
                                    />
                                )}
                            </div>
                            <div class="jog-buttons-line-bottom-container">
                                {((useUiContextFn.getValue("showx") &&
                                    buttonsInfos.B.cmd.startsWith("X")) ||
                                    (useUiContextFn.getValue("showy") &&
                                        buttonsInfos.B.cmd.startsWith(
                                            "Y"
                                        ))) && (
                                    <ButtonImg
                                        class="button-minimal"
                                        lg
                                        m2
                                        nomin
                                        tooltip
                                        data-tooltip={T(buttonsInfos.B.tooltip)}
                                        id="btnjogdown"
                                        label={buttonsInfos.B.label}
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            e.target.blur()
                                            sendJogCommand(buttonsInfos.B.cmd)
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        <div class="m-1 p-2 jog-buttons-container">
                            <div class="btn-group jog-distance-selector-container">
                                <center class="jog-distance-selector-header">
                                    mm
                                </center>
                                <div
                                    class="d-none"
                                    id="btndistSel+"
                                    onClick={() => {
                                        selectorBtn("+")
                                    }}
                                />
                                <div
                                    class="d-none"
                                    id="btndistSel-"
                                    onClick={() => {
                                        selectorBtn("-")
                                    }}
                                />
                                <div
                                    class="flatbtn tooltip tooltip-left"
                                    data-tooltip={T("HP10")}
                                >
                                    <input
                                        type="radio"
                                        id="move_100"
                                        name="select_distance"
                                        value="100"
                                        checked={currentJogDistance == 100}
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            onCheck(e, 100)
                                        }}
                                    />
                                    <label for="move_100">100</label>
                                </div>
                                <div
                                    class="flatbtn tooltip tooltip-left"
                                    data-tooltip={T("HP10")}
                                >
                                    <input
                                        type="radio"
                                        id="move_50"
                                        name="select_distance"
                                        value="50"
                                        checked={currentJogDistance == 50}
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            onCheck(e, 50)
                                        }}
                                    />
                                    <label for="move_50">50</label>
                                </div>
                                <div
                                    class="flatbtn tooltip tooltip-left"
                                    data-tooltip={T("HP10")}
                                >
                                    <input
                                        type="radio"
                                        id="move_10"
                                        name="select_distance"
                                        value="10"
                                        checked={currentJogDistance == 10}
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            onCheck(e, 10)
                                        }}
                                    />
                                    <label for="move_10">10</label>
                                </div>
                                <div
                                    class="flatbtn tooltip tooltip-left"
                                    data-tooltip={T("HP10")}
                                >
                                    <input
                                        type="radio"
                                        id="move_1"
                                        name="select_distance"
                                        value="1"
                                        checked={currentJogDistance == 1}
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            onCheck(e, 1)
                                        }}
                                    />
                                    <label for="move_1">1</label>
                                </div>
                                <div
                                    class="flatbtn tooltip tooltip-left"
                                    data-tooltip={T("HP10")}
                                >
                                    <input
                                        type="radio"
                                        id="move_0_1"
                                        name="select_distance"
                                        value="0.1"
                                        checked={currentJogDistance == 0.1}
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            onCheck(e, 0.1)
                                        }}
                                    />
                                    <label class="last-button" for="move_0_1">
                                        0.1
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="jog-extra-buttons-container">
                    {useUiContextFn.getValue("showpen") && (
                        <Field
                            id="btnPen"
                            type="boolean"
                            inline
                            value={
                                positions.pen == "?" || positions.pen == 0
                                    ? false
                                    : true
                            }
                            setValue={(val, update) => {
                                if (!update) {
                                    if (val) {
                                        SendCommand("PD;")
                                        positions.pen = true
                                    } else {
                                        SendCommand("PU;")
                                        positions.pen = false
                                    }
                                }
                            }}
                            label={T("HP20")}
                        />
                    )}

                    <ButtonImg
                        m1
                        tooltip
                        label={T("HP11")}
                        id="btnStop"
                        icon={
                            <span class="text-error">
                                <StopCircle />
                            </span>
                        }
                        data-tooltip={T("HP11")}
                        onclick={(e) => {
                            useUiContextFn.haptic()
                            e.target.blur()
                            const cmds = useUiContextFn
                                .getValue("jogstopcmd")
                                .split(";")
                            cmds.forEach((cmd) => {
                                if (cmd.trim().length > 0) {
                                    SendCommand(
                                        variablesList.formatCommand(cmd)
                                    )
                                }
                            })
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

const JogPanelElement = {
    id: "jogPanel",
    content: <JogPanel />,
    name: "S66",
    icon: "Move",
    show: "showjogpanel",
    onstart: "openjogonstart",
    settingid: "jog",
}

export { JogPanel, JogPanelElement, PositionsControls }
