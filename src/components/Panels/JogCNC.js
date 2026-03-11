/*
Jog.js - ESP3D WebUI component file

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
    Move,
    Home,
    ChevronDown,
    Edit3,
    StopCircle,
    MoreHorizontal,
} from "preact-feather"
import { useHttpFn } from "../../hooks"
import { espHttpURL, replaceVariables } from "../Helpers"
import { useUiContext, useUiContextFn } from "../../contexts"
import { T } from "../Translations"
import { Button, ButtonImg, FullScreenButton, CloseButton, ContainerHelper } from "../Controls"
import { useEffect, useState, useRef } from "preact/hooks"
import { showModal } from "../Modal"
import { useTargetContext, variablesList } from "../../targets"

let currentFeedRate = []
let currentJogDistance = 100
let currentAxis = "-1"

const feedList = ["XY", "Z", "A", "B", "C", "U", "V", "W"]
const mainAxisLettersList = ["X", "Y", "Z"]
const selectableAxisLettersList = ["A", "B", "C", "U", "V", "W"]

/*
 * Local const
 *
 */
//A separate control to avoid the full panel to be updated when the positions are updated
const PositionsControls = () => {
    const { positions } = useTargetContext()
    const posLines = [
        ["x", "y", "z"],
        ["a", "b", "c"],
        ["u", "v", "w"],
    ]
    return (
        <Fragment>
            {posLines.map((line) => {
                if (
                    typeof positions[line[0]] != "undefined" ||
                    typeof positions["w" + line[0]] != "undefined"
                )
                    return (
                        <div class="jog-positions-ctrls m-1">
                            {line.map((letter) => {
                                if (
                                    (typeof positions[letter] != "undefined" ||
                                        typeof positions["w" + letter] !=
                                            "undefined") &&
                                    useUiContextFn.getValue("show" + letter)
                                ) {
                                    return (
                                        <div class="jog-position-ctrl">
                                            {typeof positions[letter] !=
                                                "undefined" && (
                                                <Fragment>
                                                    <div class="jog-position-sub-header">
                                                        MPos{" "}
                                                        {letter.toUpperCase()}
                                                    </div>
                                                    <div class="m-1 jog-position-value">
                                                        {positions[letter]}
                                                    </div>
                                                </Fragment>
                                            )}
                                            {typeof positions["w" + letter] !=
                                                "undefined" && (
                                                <Fragment>
                                                    <div class="jog-position-sub-header">
                                                        WPos{" "}
                                                        {letter.toUpperCase()}
                                                    </div>
                                                    <div class="m-1 jog-position-value">
                                                        {
                                                            positions[
                                                                "w" + letter
                                                            ]
                                                        }
                                                    </div>
                                                </Fragment>
                                            )}
                                        </div>
                                    )
                                }
                            })}
                        </div>
                    )
            })}
        </Fragment>
    )
}

const JogPanel = () => {
    const { modals, toasts, panels } = useUiContext()
    const { createNewRequest } = useHttpFn
    const [currentSelectedAxis, setCurrentSelectedAxis] = useState(currentAxis)
    const { positions } = useTargetContext()
    const id = "jogPanel"
    console.log(id)
    function onChangeAxis(e) {
        let value = e.target ? e.target.value : e
        setCurrentSelectedAxis(value)
        currentAxis = value
    }

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

    //Click button defined by id
    const clickBtn = (id) => {
        if (document.getElementById(id)) {
            document.getElementById(id).click()
        }
    }

    //Send Home command
    const sendHomeCommand = (axis) => {
        let selected_axis
        if (axis == "Axis") selected_axis = currentAxis
        else selected_axis = axis
        const cmd = useUiContextFn
            .getValue("homecmd")
            .replace("#", selected_axis)
        SendCommand(cmd)
    }

    //Send Zero command
    const sendZeroCommand = (axis) => {
        let selected_axis
        if (axis == "Axis") selected_axis = currentAxis + "0"
        else selected_axis = axis + "0"
        if (axis.length == 0) {
            selected_axis = ""
            "xyzabcuvw".split("").reduce((acc, letter) => {
                if (positions[letter] || positions["w" + letter])
                    acc += selected_axis += " " + letter.toUpperCase() + "0"
                return acc
            }, "")
        }
        const cmd = useUiContextFn
            .getValue("zerocmd")
            .replace("#", selected_axis.trim())
        SendCommand(cmd)
    }

    //Send jog command
    const sendJogCommand = (axis) => {
        let selected_axis
        let feedrate =
            axis.startsWith("X") || axis.startsWith("Y")
                ? currentFeedRate["XY"]
                : axis.startsWith("Z")
                  ? currentFeedRate["Z"]
                  : currentFeedRate[currentAxis]
        if (axis.startsWith("Axis"))
            selected_axis = axis.replace("Axis", currentAxis)
        else selected_axis = axis
        let cmd =
            "$J=G91 G21 " + selected_axis + currentJogDistance + " F" + feedrate
        SendCommand(cmd)
    }

    //click distance button
    const onCheck = (e, distance) => {
        e.target.blur()
        currentJogDistance = distance
    }

    //Set the current feedrate for axis
    const setFeedrate = (axis) => {
        let value = currentFeedRate[axis]
        let t
        if (axis == "XY") {
            t = T("CN2")
        } else {
            t = T("CN3").replace("$", axis)
        }
        showModal({
            modals,
            title: t,
            button2: { text: T("S28") },
            button1: {
                cb: () => {
                    if (value.length > 0.1) currentFeedRate[axis] = value
                },
                text: T("S43"),
                id: "applyFrBtn",
            },
            icon: <Edit3 />,
            id: "inputFeedrate",
            content: (
                <Fragment>
                    <div>{t}</div>
                    <input
                        class="form-input"
                        type="number"
                        step="0.1"
                        value={value}
                        onInput={(e) => {
                            value = e.target.value.trim()
                            if (value < 0.1) {
                                if (document.getElementById("applyFrBtn")) {
                                    document.getElementById(
                                        "applyFrBtn"
                                    ).disabled = true
                                }
                            } else {
                                if (document.getElementById("applyFrBtn")) {
                                    document.getElementById(
                                        "applyFrBtn"
                                    ).disabled = false
                                }
                            }
                        }}
                    />
                </Fragment>
            ),
        })
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
        } else if (type == "prev" || type == "next") {
            {
                const axisList = selectableAxisLettersList.reduce(
                    (acc, letter) => {
                        if (
                            (positions[letter.toLowerCase()] ||
                                positions["w" + letter.toLowerCase()]) &&
                            useUiContextFn.getValue(
                                "show" + [letter.toLowerCase()]
                            )
                        ) {
                            acc.push(letter)
                        }

                        return acc
                    },
                    []
                )

                if (axisList.length > 1) {
                    let index = axisList.indexOf(currentAxis)
                    if (type == "next") {
                        index++
                        if (index >= axisList.length) index = 0
                    } else {
                        index--
                        if (index < 0) index = axisList.length - 1
                    }

                    if (document.getElementById("selectAxisList")) {
                        document.getElementById("selectAxisList").value =
                            axisList[index]
                        onChangeAxis(axisList[index])
                    }
                }
            }
        }
    }

    useEffect(() => {
        if (currentAxis == "-1") {
            feedList.forEach((letter) => {
                if (!currentFeedRate[letter]) {
                    currentFeedRate[letter] = useUiContextFn.getValue(
                        letter.toLowerCase() + "feedrate"
                    )
                }
                feedList.forEach((letter) => {
                    if (!(letter == "XY" || letter == "Z")) {
                        if (
                            currentAxis == "-1" &&
                            useUiContextFn.getValue(
                                "show" + letter.toLowerCase()
                            ) &&
                            (positions[letter.toLowerCase()] ||
                                positions["w" + letter.toLowerCase()])
                        ) {
                            currentAxis = letter
                        }
                    }
                })
            })
            setCurrentSelectedAxis(currentAxis)
        }
    })
    return (
        <div class="panel panel-dashboard" id={id} >
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
                                {feedList.map((letter) => {
                                    let help
                                    let condition = false
                                    if (letter.length == 2) {
                                        help = T("CN2")
                                        condition =
                                            (useUiContextFn.getValue("showx") &&
                                                (positions.x ||
                                                    positions.wx)) ||
                                            (useUiContextFn.getValue("showy") &&
                                                (positions.y || positions.wy))
                                    } else {
                                        help = T("CN3").replace("$", letter)
                                        condition =
                                            (positions[letter.toLowerCase()] ||
                                                positions[
                                                    "w" + letter.toLowerCase()
                                                ]) &&
                                            useUiContextFn.getValue(
                                                "show" + letter.toLowerCase()
                                            )
                                    }
                                    if (condition)
                                        return (
                                            <li class="menu-item">
                                                <div
                                                    class="menu-entry"
                                                    onclick={(e) => {
                                                        useUiContextFn.haptic()
                                                        setFeedrate(letter)
                                                    }}
                                                >
                                                    <div class="menu-panel-item">
                                                        <span class="text-menu-item">
                                                            {help}
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                })}
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
                        {mainAxisLettersList.map((letter) => {
                            if (
                                (positions[letter.toLowerCase()] ||
                                    positions["w" + letter.toLowerCase()]) &&
                                useUiContextFn.getValue(
                                    "show" + letter.toLowerCase()
                                )
                            ) {
                                return (
                                    <div class="m-1 jog-buttons-container">
                                        <Button
                                            m2
                                            tooltip
                                            data-tooltip={T("CN12")}
                                            id={"btn+" + letter}
                                            onclick={(e) => {
                                                useUiContextFn.haptic()
                                                e.target.blur()
                                                sendJogCommand(letter + "+")
                                            }}
                                        >
                                            +{letter}
                                        </Button>
                                        {useUiContextFn.getValue(
                                            "homesingleaxis"
                                        ) && (
                                            <Button
                                                m2
                                                tooltip
                                                data-tooltip={T("CN10")}
                                                id={"btnH" + letter}
                                                onclick={(e) => {
                                                    useUiContextFn.haptic()
                                                    e.target.blur()
                                                    sendHomeCommand(letter)
                                                }}
                                            >
                                                <Home size="1rem" />
                                                <span class="text-tiny">
                                                    {letter.toLowerCase()}
                                                </span>
                                            </Button>
                                        )}

                                        <Button
                                            m2
                                            tooltip
                                            data-tooltip={T("CN19")}
                                            id={"btnZ" + letter}
                                            onclick={(e) => {
                                                useUiContextFn.haptic()
                                                e.target.blur()
                                                sendZeroCommand(letter)
                                            }}
                                        >
                                            &Oslash;
                                            <span class="text-tiny">
                                                {letter.toLowerCase()}
                                            </span>
                                        </Button>
                                        <Button
                                            m2
                                            tooltip
                                            data-tooltip={T("CN13")}
                                            id={"btn-" + letter}
                                            onclick={(e) => {
                                                useUiContextFn.haptic()
                                                e.target.blur()
                                                sendJogCommand(letter + "-")
                                            }}
                                        >
                                            -{letter}
                                        </Button>
                                    </div>
                                )
                            }
                        })}
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
                                    data-tooltip={T("CN18")}
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
                                    data-tooltip={T("CN18")}
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
                                    data-tooltip={T("CN18")}
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
                                    data-tooltip={T("CN18")}
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
                                    data-tooltip={T("CN18")}
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

                {selectableAxisLettersList.reduce((acc, letter) => {
                    if (
                        useUiContextFn.getValue(
                            "show" + letter.toLowerCase()
                        ) &&
                        (positions[letter.toLowerCase()] ||
                            positions["w" + letter.toLowerCase()])
                    )
                        acc = true
                    return acc
                }, false) && (
                    <div class="m-1 jog-buttons-container-horizontal">
                        <div
                            class="d-none"
                            id="btnaxisSel+"
                            onClick={() => {
                                selectorBtn("next")
                            }}
                        />
                        <div
                            class="d-none"
                            id="btnaxisSel-"
                            onClick={() => {
                                selectorBtn("prev")
                            }}
                        />
                        <div class="form-group m-2 text-primary">
                            <select
                                id="selectAxisList"
                                class="form-select"
                                onchange={(e) => {
                                    onChangeAxis(e)
                                }}
                                value={currentSelectedAxis}
                            >
                                {selectableAxisLettersList.map((letter) => {
                                    if (
                                        (positions[letter.toLowerCase()] ||
                                            positions[
                                                "w" + letter.toLowerCase()
                                            ]) &&
                                        useUiContextFn.getValue(
                                            "show" + letter.toLowerCase()
                                        )
                                    )
                                        return (
                                            <option value={letter}>
                                                {letter}
                                            </option>
                                        )
                                })}
                            </select>
                        </div>
                        <Button
                            m2
                            tooltip
                            data-tooltip={T("CN12")}
                            id="btn+axis"
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                sendJogCommand("Axis+")
                            }}
                        >
                            +{currentSelectedAxis}
                        </Button>
                        {useUiContextFn.getValue("homesingleaxis") && (
                            <Button
                                m2
                                tooltip
                                data-tooltip={T("CN10")}
                                id="btnHaxis"
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    sendHomeCommand("Axis")
                                }}
                            >
                                <Home size="1rem" />
                                <span class="text-tiny">
                                    {currentSelectedAxis}
                                </span>
                            </Button>
                        )}

                        <Button
                            m2
                            tooltip
                            data-tooltip={T("CN19")}
                            id="btnZaxis"
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                sendZeroCommand("Axis")
                            }}
                        >
                            &Oslash;
                            <span class="text-tiny">{currentSelectedAxis}</span>
                        </Button>
                        <Button
                            m2
                            tooltip
                            data-tooltip={T("CN13")}
                            id="btn-axis"
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                sendJogCommand("Axis-")
                            }}
                        >
                            -{currentSelectedAxis}
                        </Button>
                    </div>
                )}
                {(positions.x ||
                    positions.wx ||
                    positions.y ||
                    positions.wy ||
                    positions.z ||
                    positions.wz ||
                    positions.a ||
                    positions.wa ||
                    positions.b ||
                    positions.wb ||
                    positions.c ||
                    positions.wc) && (
                    <div class="jog-extra-buttons-container">
                        <Button
                            m1
                            tooltip
                            data-tooltip={T("CN21")}
                            id="btnHAll"
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                sendHomeCommand("")
                            }}
                        >
                            <Home />
                            <MoreHorizontal />
                        </Button>
                        <Button
                            m1
                            tooltip
                            data-tooltip={T("CN20")}
                            id="btnZAll"
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                sendZeroCommand("")
                            }}
                        >
                            <label class="text-like-icon">
                                &Oslash;
                            </label>
                            <MoreHorizontal />
                        </Button>
                        <ButtonImg
                            m1
                            tooltip
                            label={T("CN23")}
                            id="btnStop"
                            icon={
                                <span class="text-error">
                                    <StopCircle />
                                </span>
                            }
                            data-tooltip={T("CN23")}
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                const cmds = useUiContextFn
                                    .getValue("jogstopcmd")
                                    .split(";")
                                cmds.forEach((cmd) => {
                                    SendCommand(cmd)
                                })
                            }}
                        />
                    </div>
                )}
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
