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
import { Move, Crosshair, Home, ZapOff, Edit3 } from "preact-feather"
import { useHttpFn } from "../../hooks"
import { espHttpURL } from "../Helpers"
import { useUiContext, useUiContextFn } from "../../contexts"
import { T } from "../Translations"
import {
    Button,
    ButtonImg,
    FullScreenButton,
    CloseButton,
    ContainerHelper,
} from "../Controls"
import { useEffect, useState, useRef } from "preact/hooks"
import { showModal } from "../Modal"
import { useTargetContext } from "../../targets"
import { Menu as PanelMenu } from "./"

let currentFeedRate = []
let jogDistance = 100
let movetoX
let movetoY
let movetoZ
let currentButtonPressed

/*
 * Local const
 *
 */
//A separate control to avoid the full panel to be updated when the positions are updated
const PositionsControls = () => {
    const { positions } = useTargetContext()
    return (
        <div class="jog-positions-ctrls">
            <div class="jog-position-ctrl">
                <div class="jog-position-header">X</div>
                <div class="m-1 jog-position-value">{positions.x}</div>
            </div>
            <div class="jog-position-ctrl">
                <div class="jog-position-header">Y</div>
                <div class="m-1 jog-position-value">{positions.y}</div>
            </div>
            <div class="jog-position-ctrl">
                <div class="jog-position-header">Z</div>
                <div class="m-1 jog-position-value">{positions.z}</div>
            </div>
        </div>
    )
}

const JogPanel = () => {
    const { modals, toasts, panels, shortcuts } = useUiContext()

    const { createNewRequest } = useHttpFn
    const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(
        shortcuts.enabled
    )

    const [moveToTitleXY, setMoveToTitleXY] = useState(
        T("P20") + movetoX + "," + movetoY
    )
    const [moveToTitleZ, setMoveToTitleZ] = useState(T("P75") + movetoZ)
    const id = "jogPanel"
    console.log(id)

    //Send a request to the ESP
    const SendCommand = (command) => {
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

    //Send Home command
    const sendHomeCommand = (axis, id) => {
        const cmd = useUiContextFn.getValue("homecmd").replace("$", axis)
        onOut(id)
        if (id && currentButtonPressed != id) return
        SendCommand(cmd)
    }

    //mouse down event
    const onMouseDown = (id) => {
        currentButtonPressed = id
        if (document.getElementById(id)) {
            const list_item = document
                .getElementById(id)
                .querySelector(id == "posz" ? ".movez" : ".std")
            if (list_item) {
                list_item.classList.add("pressedbutton")
                list_item.classList.remove(id == "posz" ? "movez" : "std")
            }
        }
    }

    //Send jog command
    const sendJogCommand = (axis, id, distance) => {
        let movement
        onOut(id)
        let feedrate = axis.startsWith("Z")
            ? currentFeedRate["zfeedrate"]
            : currentFeedRate["xyfeedrate"]
        if (distance) movement = axis + distance
        else movement = axis + jogDistance
        let cmd = "G91\nG1 " + movement + " F" + feedrate + "\nG90"
        if (id && currentButtonPressed != id) {
            console.log(id, " is different than ", currentButtonPressed)
            return
        }
        SendCommand(cmd)
    }

    //click distance button
    const onCheck = (e, distance) => {
        e.target.blur()
        jogDistance = distance
    }

    //mouse hover jog button
    const onHoverJog = (id) => {
        if (document.getElementById(id))
            document.getElementById(id).style.opacity = "1"
    }

    //mouse out of button
    const onOut = (id) => {
        if (document.getElementById(id)) {
            const list_item = document
                .getElementById(id)
                .querySelector(".pressedbutton")
            if (list_item) {
                list_item.classList.add(id == "posz" ? "movez" : "std")
                list_item.classList.remove("pressedbutton")
            }
        }
    }

    //mouse out of the jog button
    const onOutJog = (id, buttonId) => {
        if (document.getElementById(id))
            document.getElementById(id).style.opacity = "0.2"
        onOut(buttonId)
    }

    //Move command
    const sendMoveCommand = (buttonId, id) => {
        onOut(buttonId)
        if (id && currentButtonPressed != id) return
        let cmd
        if (buttonId == "posxy")
            cmd =
                "G1 X" +
                movetoX +
                " Y" +
                movetoY +
                " F" +
                currentFeedRate["xyfeedrate"]
        else cmd = "G1 Z" + movetoZ + " F" + currentFeedRate["zfeedrate"]
        SendCommand(cmd)
    }

    //Set the current feedrate for axis
    const setFeedrate = (axis) => {
        let value = currentFeedRate[axis == "XY" ? "xyfeedrate" : "zfeedrate"]
        showModal({
            modals,
            title: axis == "XY" ? T("P10") : T("P11"),
            button2: { text: T("S28") },
            button1: {
                cb: () => {
                    if (value.length > 0.1)
                        currentFeedRate[
                            axis == "XY" ? "xyfeedrate" : "zfeedrate"
                        ] = value
                },
                text: T("S43"),
                id: "applyFrBtn",
            },
            icon: <Edit3 />,
            id: "inputFeedrate",
            content: (
                <Fragment>
                    <div>{axis == "XY" ? T("P10") : T("P11")}</div>
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

    //Set the current feedrate for XY axis
    const setFeedrateXY = (e) => {
        useUiContextFn.haptic()
        setFeedrate("XY")
    }

    //Set the current feedrate for Z axis
    const setFeedrateZ = (e) => {
        useUiContextFn.haptic()
        setFeedrate("Z")
    }

    useEffect(() => {
        if (!currentFeedRate["xyfeedrate"])
            currentFeedRate["xyfeedrate"] =
                useUiContextFn.getValue("xyfeedrate")
        if (!currentFeedRate["zfeedrate"])
            currentFeedRate["zfeedrate"] = useUiContextFn.getValue("zfeedrate")
        if (typeof movetoX == "undefined")
            movetoX = useUiContextFn.getValue("xpos")
        if (typeof movetoY == "undefined")
            movetoY = useUiContextFn.getValue("ypos")
        setMoveToTitleXY(T("P20") + movetoX + "," + movetoY)
        if (typeof movetoZ == "undefined")
            movetoZ = useUiContextFn.getValue("zpos")
        setMoveToTitleZ(T("P75") + movetoZ)
    }, [])

    const menu = [
        {
            label: T("P10"),
            onClick: setFeedrateXY,
        },
        {
            label: T("P11"),
            onClick: setFeedrateZ,
        },
    ]
    let label_h_axis_left = ""
    let label_h_axis_right = ""
    let label_v_axis_bottom = ""
    let label_v_axis_top = ""

    let H_axis = "X"
    let H_axis_left_dir
    let H_axis_right_dir
    let V_axis = "Y"
    let V_axis_top_dir
    let V_axis_bottom_dir
    let pos_x_v_axis_label_top
    let pos_x_v_axis_label_bottom
    let Z_axis = "Z"
    let label_z_axis_bottom = ""
    let label_z_axis_top = ""
    let pos_x_z_axis_label_top
    let pos_x_z_axis_label_bottom
    let Z_axis_bottom_dir = ""
    let Z_axis_top_dir = ""
    if (useUiContextFn.getValue("swap_x_y")) {
        H_axis = "Y"
        V_axis = "X"
    } else {
        H_axis = "X"
        V_axis = "Y"
    }

    if (useUiContextFn.getValue("invert_y")) {
        if (useUiContextFn.getValue("swap_x_y")) {
            H_axis_left_dir = "+"
            H_axis_right_dir = "-"
        } else {
            V_axis_top_dir = "-"
            V_axis_bottom_dir = "+"
            pos_x_v_axis_label_top = "113"
            pos_x_v_axis_label_bottom = "110"
        }
    } else {
        if (useUiContextFn.getValue("swap_x_y")) {
            H_axis_left_dir = "-"
            H_axis_right_dir = "+"
        } else {
            V_axis_top_dir = "+"
            V_axis_bottom_dir = "-"
            pos_x_v_axis_label_top = "110"
            pos_x_v_axis_label_bottom = "113"
        }
    }

    if (useUiContextFn.getValue("invert_x")) {
        if (useUiContextFn.getValue("swap_x_y")) {
            V_axis_top_dir = "-"
            V_axis_bottom_dir = "+"
            pos_x_v_axis_label_top = "113"
            pos_x_v_axis_label_bottom = "110"
        } else {
            H_axis_left_dir = "+"
            H_axis_right_dir = "-"
        }
    } else {
        if (useUiContextFn.getValue("swap_x_y")) {
            V_axis_top_dir = "+"
            V_axis_bottom_dir = "-"
            pos_x_v_axis_label_top = "110"
            pos_x_v_axis_label_bottom = "113"
        } else {
            H_axis_left_dir = "-"
            H_axis_right_dir = "+"
        }
    }

    if (useUiContextFn.getValue("invert_z")) {
        Z_axis_top_dir = "+"
        Z_axis_bottom_dir = "-"
        pos_x_z_axis_label_top = 41
        pos_x_z_axis_label_bottom = 43
    } else {
        Z_axis_top_dir = "-"
        Z_axis_bottom_dir = "+"
        pos_x_z_axis_label_top = 43
        pos_x_z_axis_label_bottom = 41
    }
    label_z_axis_bottom = Z_axis_bottom_dir + Z_axis
    label_z_axis_top = Z_axis_top_dir + Z_axis
    label_h_axis_left = H_axis_left_dir + H_axis
    label_h_axis_right = H_axis_right_dir + H_axis
    label_v_axis_bottom = V_axis_bottom_dir + V_axis
    label_v_axis_top = V_axis_top_dir + V_axis

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
                        <PanelMenu items={menu} />
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
                <div class="m-1" />
                <div class={shortcuts.enabled ? "m-1" : "show-low m-1"}>
                    <div class="jog-buttons-main-container">
                        <div class="m-1 jog-buttons-container">
                            <Button
                                m2
                                tooltip
                                data-tooltip={T("P76")}
                                id="btn+X"
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    sendJogCommand("X+")
                                }}
                            >
                                +X
                            </Button>
                            <Button
                                m2
                                tooltip
                                data-tooltip={T("P7")}
                                id="btnHX"
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    sendHomeCommand("X")
                                }}
                            >
                                <Home size="1rem" />
                                <span class="text-tiny">x</span>
                            </Button>
                            <Button
                                m2
                                tooltip
                                data-tooltip={T("P77")}
                                id="btn-X"
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    sendJogCommand("X-")
                                }}
                            >
                                -X
                            </Button>
                        </div>
                        <div class="m-1 jog-buttons-container">
                            <Button
                                m2
                                tooltip
                                data-tooltip={T("P76")}
                                id="btn+Y"
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    sendJogCommand("Y+")
                                }}
                            >
                                +Y
                            </Button>
                            <Button
                                m2
                                tooltip
                                data-tooltip={T("P8")}
                                id="btnHY"
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    sendHomeCommand("Y")
                                }}
                            >
                                <Home size="1rem" />
                                <span class="text-tiny">y</span>
                            </Button>
                            <Button
                                m2
                                tooltip
                                data-tooltip={T("P77")}
                                id="btn-Y"
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    sendJogCommand("Y-")
                                }}
                            >
                                -Y
                            </Button>
                        </div>

                        <div class="m-1 jog-buttons-container">
                            <Button
                                m2
                                tooltip
                                data-tooltip={T("P76")}
                                id="btn+Z"
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    sendJogCommand("Z+")
                                }}
                            >
                                +Z
                            </Button>
                            <Button
                                m2
                                tooltip
                                data-tooltip={T("P9")}
                                id="btnHZ"
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    sendHomeCommand("Z")
                                }}
                            >
                                <Home size="1rem" />
                                <span class="text-tiny">z</span>
                            </Button>
                            <Button
                                m2
                                tooltip
                                data-tooltip={T("P77")}
                                id="btn-Z"
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    sendJogCommand("Z-")
                                }}
                            >
                                -Z
                            </Button>
                        </div>
                        <div class="m-1 p-2 jog-buttons-container">
                            <div class="btn-group jog-distance-selector-container">
                                <center class="jog-distance-selector-header">
                                    mm
                                </center>

                                <div
                                    class="flatbtn tooltip tooltip-left"
                                    data-tooltip={T("P78")}
                                >
                                    <input
                                        type="radio"
                                        id="move_100"
                                        name="select_distance"
                                        value="100"
                                        checked={jogDistance == 100}
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            onCheck(e, 100)
                                        }}
                                    />
                                    <label for="move_100">100</label>
                                </div>
                                <div
                                    class="flatbtn tooltip tooltip-left"
                                    data-tooltip={T("P78")}
                                >
                                    <input
                                        type="radio"
                                        id="move_10"
                                        name="select_distance"
                                        value="10"
                                        checked={jogDistance == 10}
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            onCheck(e, 10)
                                        }}
                                    />
                                    <label for="move_10">10</label>
                                </div>
                                <div
                                    class="flatbtn tooltip tooltip-left"
                                    data-tooltip={T("P78")}
                                >
                                    <input
                                        type="radio"
                                        id="move_1"
                                        name="select_distance"
                                        value="1"
                                        checked={jogDistance == 1}
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            onCheck(e, 1)
                                        }}
                                    />
                                    <label for="move_1">1</label>
                                </div>
                                <div
                                    class="flatbtn tooltip tooltip-left"
                                    data-tooltip={T("P78")}
                                >
                                    <input
                                        type="radio"
                                        id="move_0_1"
                                        name="select_distance"
                                        value="0.1"
                                        checked={jogDistance == 0.1}
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

                {!shortcuts.enabled && (
                    <div class="hide-low jog-svg-container">
                        <svg
                            viewBox="0 -5 325 255"
                            xmlns="http://www.w3.org/2000/svg"
                            version="1.1"
                        >
                            <defs>
                                <filter
                                    id="f1"
                                    x="-1"
                                    y="-1"
                                    width="300%"
                                    height="300%"
                                >
                                    <feOffset
                                        result="offOut"
                                        in="SourceAlpha"
                                        dx="3"
                                        dy="3"
                                    ></feOffset>
                                    <feGaussianBlur
                                        result="blurOut"
                                        in="offOut"
                                        stdDeviation="4"
                                    ></feGaussianBlur>
                                    <feBlend
                                        in="SourceGraphic"
                                        in2="blurOut"
                                        mode="normal"
                                    ></feBlend>
                                </filter>
                                <symbol
                                    id="HomeIcon"
                                    viewBox="0 0 20 18"
                                    pointer-events="none"
                                >
                                    <desc>HomeIcon - house</desc>
                                    <path
                                        class="home"
                                        d="M3,18 v-8 l7,-6 l7,6 v8 h-5 v-6 h-4 v6 z"
                                        fill="black"
                                    ></path>
                                    <path
                                        class="home"
                                        d="M0,10 l10-8.5 l10,8.5"
                                        stroke-width="1.5"
                                        fill="none"
                                    ></path>
                                    <path
                                        class="home"
                                        d="M15,3 v2.8 l1,.8 v-3.6 z"
                                    ></path>
                                </symbol>
                            </defs>
                            <g
                                id="HomeAll"
                                onmouseup={(e) =>
                                    sendHomeCommand("", "HomeAll")
                                }
                                onmousedown={(e) => onMouseDown("HomeAll")}
                                onmouseout={(e) => onOut("HomeAll")}
                            >
                                <title>{T("P6")}</title>
                                <path
                                    class="std"
                                    d="M10 182.5 h-10 v57.5 h57.5 v-10 a 125,125 0 0,1 -47.5 -47.5 Z"
                                    fill="#f0f0f0"
                                ></path>
                                <use
                                    x="3"
                                    y="217"
                                    width="20"
                                    height="18"
                                    xlinkHref="#HomeIcon"
                                ></use>
                            </g>
                            <g
                                id="HomeX"
                                onmouseup={(e) => sendHomeCommand("X", "HomeX")}
                                onmousedown={(e) => onMouseDown("HomeX")}
                                onmouseout={(e) => onOut("HomeX")}
                            >
                                <title>{T("P7")}</title>
                                <path
                                    class="std"
                                    d="M10 57.50 h-10 v-57.5 h57.5 v10 a 125,125 0 0,0 -47.5 47.5 Z"
                                    fill="Khaki"
                                ></path>
                                <use
                                    x="3"
                                    y="5"
                                    width="20"
                                    height="18"
                                    xlinkHref="#HomeIcon"
                                ></use>
                                <text x="25" y="20" class="home">
                                    X
                                </text>
                            </g>
                            <g
                                id="HomeY"
                                onmouseup={(e) => sendHomeCommand("Y", "HomeY")}
                                onmousedown={(e) => onMouseDown("HomeY")}
                                onmouseout={(e) => onOut("HomeY")}
                            >
                                <title>{T("P8")}</title>
                                <path
                                    class="std"
                                    d="M230 57.50 h10 v-57.5 h-57.5 v10 a 125,125 0 0,1 47.5 47.5 z"
                                    fill="SteelBlue"
                                ></path>
                                <use
                                    x="217"
                                    y="5"
                                    width="20"
                                    height="18"
                                    xlinkHref="#HomeIcon"
                                ></use>
                                <text x="202" y="20" class="home">
                                    Y
                                </text>
                            </g>
                            <g
                                id="HomeZ"
                                onmouseup={(e) => sendHomeCommand("Z", "HomeZ")}
                                onmousedown={(e) => onMouseDown("HomeZ")}
                                onmouseout={(e) => onOut("HomeZ")}
                            >
                                <title>{T("P9")}</title>
                                <path
                                    class="std"
                                    d="M230 182.5 h10 v57.5 h-57.5 v-10 a 125,125 0 0,0 47.5 -47.5 z"
                                    fill="DarkSeaGreen"
                                ></path>
                                <use
                                    x="217"
                                    y="217"
                                    width="20"
                                    height="18"
                                    xlinkHref="#HomeIcon"
                                ></use>
                                <text
                                    x="202"
                                    y="232"
                                    class="home"
                                    id="homeZlabel"
                                >
                                    Z
                                </text>
                            </g>
                            <g id="Jog100" fill="#c0c0c0" class="std">
                                <g
                                    id="V_top_100"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            V_axis,
                                            "V_top_100",
                                            V_axis_top_dir + "100"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_100")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("V_top_100")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog(
                                            "label_circle_100",
                                            "V_top_100"
                                        )
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M-60 -67.07 L-75.93,-83 A112.5,112.5 0 0,1 75,-83 L60,-67.07 A90,90 0 0,0 -60.00,-67.07 z"
                                    ></path>
                                </g>
                                <g
                                    id="H_right_100"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            H_axis,
                                            "H_right_100",
                                            H_axis_right_dir + "100"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_100")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("H_right_100")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog(
                                            "label_circle_100",
                                            "H_right_100"
                                        )
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M67.07,-60 L83,-75.93 A112.5,112.5 0 0,1 83,75.93 L67.07,60 A90,90 0 0,0 67.07,-60"
                                    ></path>
                                </g>
                                <g
                                    id="V_bottom_100"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            V_axis,
                                            "V_bottom_100",
                                            V_axis_bottom_dir + "100"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_100")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("V_bottom_100")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog(
                                            "label_circle_100",
                                            "V_bottom_100"
                                        )
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M-60,67.07 L-75.93,83 A112.5,112.5 0 0,0 75,83 L60,67.07 A90,90 0 0,1 -60.00,67.07 z"
                                    ></path>
                                </g>
                                <g
                                    id="H_left_100"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            H_axis,
                                            "H_left_100",
                                            H_axis_left_dir + "100"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_100")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("H_left_100")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog(
                                            "label_circle_100",
                                            "H_left_100"
                                        )
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M-67.07,-60 L-83,-75.93 A112.5,112.5 0 0,0 -83,75.93 L-67.07,60 A90,90 0 0,1 -67.07,-60 z"
                                    ></path>
                                </g>
                            </g>
                            <g id="Jog10" fill="#d0d0d0">
                                <g
                                    id="V_top_10"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            V_axis,
                                            "V_top_10",
                                            V_axis_top_dir + "10"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_10")
                                    }}
                                    onmousedown={(e) => onMouseDown("V_top_10")}
                                    onmouseout={(e) => {
                                        onOutJog("label_circle_10", "V_top_10")
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M-44.06 -51.13 L-60,-67.07 A90,90 0 0,1 60,-67 L44.06,-51.13 A67.5,67.5 0 0,0 -44.06,-51.13 z"
                                    ></path>
                                </g>
                                <g
                                    id="H_right_10"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            H_axis,
                                            "H_right_10",
                                            H_axis_right_dir + "10"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_10")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("H_right_10")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog(
                                            "label_circle_10",
                                            "H_right_10"
                                        )
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M51.13 44.06 L67.07,60 A90,90 0 0,0 67.07,-60 L51.13,-44.06 A67.5,67.5 0 0,1 51.13,44.06 z"
                                    ></path>
                                </g>
                                <g
                                    id="V_bottom_10"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            V_axis,
                                            "V_bottom_10",
                                            V_axis_bottom_dir + "10"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_10")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("V_bottom_10")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog(
                                            "label_circle_10",
                                            "V_bottom_10"
                                        )
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M-44.06 51.13 L-60,67.07 A90,90 0 0,0 60,67 L44.06,51.13 A67.5,67.5 0 0,1 -44.06,51.13 z"
                                    ></path>
                                </g>
                                <g
                                    id="H_left_10"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            H_axis,
                                            "H_left_10",
                                            H_axis_left_dir + "10"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_10")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("H_left_10")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog("label_circle_10", "H_left_10")
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M-51.13 44.06 L-67.07,60 A90,90 0 0,1 -67.07,-60 L-51.13,-44.06 A67.5,67.5 0 0,0 -51.13,44.06 z"
                                    ></path>
                                </g>
                            </g>
                            <g id="Jog1" fill="#e0e0e0">
                                <g
                                    id="V_top_1"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            V_axis,
                                            "V_top_1",
                                            V_axis_top_dir + "1"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_1")
                                    }}
                                    onmousedown={(e) => onMouseDown("V_top_1")}
                                    onmouseout={(e) => {
                                        onOutJog("label_circle_1", "V_top_1")
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M-28.09 -35.16 L-44.06,-51.13 A67.5,67.5 0 0,1 44.06,-51.13 L28.09,-35.16 A45,45 0 0,0 -28.09,-35.16 z"
                                    ></path>
                                </g>
                                <g
                                    id="H_right_1"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            H_axis,
                                            "H_right_1",
                                            H_axis_right_dir + "1"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_1")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("H_right_1")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog("label_circle_1", "H_right_1")
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M35.16 -28.09 L51.13,-44.06 A67.5,67.05 0 0,1 51.13,44.06 L35.16,28.09 A45,45 0 0,0 35.16,-28.09 z"
                                    ></path>
                                </g>
                                <g
                                    id="V_bottom_1"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            V_axis,
                                            "V_bottom_1",
                                            V_axis_bottom_dir + "1"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_1")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("V_bottom_1")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog("label_circle_1")
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M-28.09 35.16 L-44.06,51.13 A67.5,67.5 0 0,0 44.06,51.13 L28.09,35.16 A45,45 0 0,1 -28.09,35.16 z"
                                    ></path>
                                </g>
                                <g
                                    id="H_left_1"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            H_axis,
                                            "H_left_1",
                                            H_axis_left_dir + "1"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_1")
                                    }}
                                    onmousedown={(e) => onMouseDown("H_left_1")}
                                    onmouseout={(e) => {
                                        onOutJog("label_circle_1", "H_left_1")
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M-35.16 -28.09 L-51.13,-44.06 A67.5,67.05 0 0,0 -51.13,44.06 L-35.16,28.09 A45,45 0 0,1 -35.16,-28.09 z"
                                    ></path>
                                </g>
                            </g>
                            <g id="Jog0_1" fill="#f0f0f0">
                                <g
                                    id="V_top_0_1"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            V_axis,
                                            "V_top_0_1",
                                            V_axis_top_dir + "0.1"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_0_1")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("V_top_0_1")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog("label_circle_0_1"),
                                            "V_top_0_1"
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M-28.09 -35.16 A45,45 0 0,1 29.09,-35.16 L0,-7.07 z"
                                    ></path>
                                </g>
                                <g
                                    id="H_right_0_1"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            H_axis,
                                            "H_right_0_1",
                                            H_axis_right_dir + "0.1"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_0_1")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("H_right_0_1")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog(
                                            "label_circle_0_1",
                                            "H_right_0_1"
                                        )
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M35.16 -28.09 A45,45 0 0,1 35.16,28.09 L7.07,0 z"
                                    ></path>
                                </g>
                                <g
                                    id="V_bottom_0_1"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            V_axis,
                                            "V_bottom_0_1",
                                            V_axis_bottom_dir + "0.1"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_0_1")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("V_bottom_0_1")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog(
                                            "label_circle_0_1",
                                            "V_bottom_0_1"
                                        )
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M-28.09 35.16 A45,45 0 0,0 29.09,35.16 L0,7.07 z"
                                    ></path>
                                </g>
                                <g
                                    id="H_left_0_1"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            H_axis,
                                            "H_left_0_1",
                                            H_axis_left_dir + "0.1"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("label_circle_0_1")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("H_left_0_1")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog("label_circle_0_1")
                                    }}
                                    transform="translate(120 120)"
                                >
                                    <path
                                        class="std"
                                        d="M-35.16 -28.09 A45,45 0 0,0 -35.16,28.09 L-7.07,0 z"
                                    ></path>
                                </g>
                            </g>
                            <g id="label_circle_0_1" style="opacity:0.2">
                                <circle
                                    class="scl"
                                    cx="144"
                                    cy="96"
                                    r="9.5"
                                ></circle>
                                <text class="scl" x="137" y="99" font-size="10">
                                    0.1
                                </text>
                            </g>
                            <g id="label_circle_1" style="opacity:0.2">
                                <circle
                                    class="scl"
                                    cx="159.5"
                                    cy="80.5"
                                    r="10.5"
                                ></circle>
                                <text class="scl" x="155" y="85" font-size="14">
                                    1
                                </text>
                            </g>
                            <g id="label_circle_10" style="opacity:0.2">
                                <circle
                                    class="scl"
                                    cx="175"
                                    cy="65"
                                    r="12"
                                ></circle>
                                <text class="scl" x="166" y="70" font-size="15">
                                    10
                                </text>
                            </g>
                            <g id="label_circle_100" style="opacity:0.2">
                                <circle
                                    class="scl"
                                    cx="195"
                                    cy="45"
                                    r="15"
                                ></circle>
                                <text class="scl" x="182" y="50" font-size="15">
                                    100
                                </text>
                            </g>
                            <g
                                id="Decoration"
                                pointer-events="none"
                                fill-opacity=".6"
                            >
                                <path
                                    class="std"
                                    d="M120,20 l17,17 h-10 v11 h-14 v-11 h-10 z"
                                    fill="SteelBlue"
                                ></path>
                                <path
                                    class="std"
                                    d="M120,220 l17,-17 h-10 v-11 h-14 v11 h-10 z"
                                    fill="SteelBlue"
                                ></path>
                                <path
                                    class="std"
                                    d="M20,120 l17,17 v-10 h11 v-14 h-11 v-10 z"
                                    fill="Khaki"
                                ></path>
                                <path
                                    class="std"
                                    d="M220,120 l-17,-17 v10 h-11 v14 h11 v10 z"
                                    fill="Khaki"
                                ></path>
                                <text
                                    class="jog"
                                    x={pos_x_v_axis_label_top}
                                    y="36"
                                >
                                    {label_v_axis_top}
                                </text>
                                <text
                                    class="jog"
                                    x={pos_x_v_axis_label_bottom}
                                    y="212"
                                >
                                    {label_v_axis_bottom}
                                </text>
                                <text class="jog" x="27" y="124">
                                    {label_h_axis_left}
                                </text>
                                <text class="jog" x="196" y="124">
                                    {label_h_axis_right}
                                </text>
                            </g>
                            <g
                                id="posxy"
                                onmouseup={(e) => {
                                    sendMoveCommand("posxy", "posxy")
                                }}
                                onmouseover={(e) => {
                                    onHoverJog("posxy")
                                }}
                                onmousedown={(e) => onMouseDown("posxy")}
                                onmouseout={(e) => {
                                    onOut("posxy")
                                }}
                            >
                                <title>{moveToTitleXY}</title>
                                <circle
                                    class="std"
                                    cx="120.2"
                                    cy="120.3"
                                    r="15"
                                ></circle>
                                <circle
                                    class="cross"
                                    cx="116"
                                    cy="120.3"
                                    r="4"
                                ></circle>
                                <line
                                    x1="116"
                                    y1="125.3"
                                    x2="116"
                                    y2="129"
                                    style="stroke:black;stroke-width:1"
                                />
                                <line
                                    x1="116"
                                    y1="115.3"
                                    x2="116"
                                    y2="111.6"
                                    style="stroke:black;stroke-width:1"
                                />
                                <line
                                    x1="121"
                                    y1="120.3"
                                    x2="124.7"
                                    y2="120.3"
                                    style="stroke:black;stroke-width:1"
                                />
                                <line
                                    x1="111"
                                    y1="120.3"
                                    x2="107.3"
                                    y2="120.3"
                                    style="stroke:black;stroke-width:1"
                                />
                                <text class="posscl" x="125" y="118">
                                    X
                                </text>
                                <text class="posscl" x="125" y="130">
                                    Y
                                </text>
                            </g>
                            <g id="JogBar" transform="translate(250,0)">
                                <g
                                    id="Z_top_100"
                                    fill="#d0d0d0"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            Z_axis,
                                            "Z_top_100",
                                            Z_axis_top_dir + "100"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("z100")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("Z_top_100")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog("z100", "Z_top_100")
                                    }}
                                >
                                    <path
                                        class="std"
                                        d=" M5,0 h30 a5,5 0 0,1 5,5 v27 h-40 v-27 a5,5 0 0,1 5,-5 z"
                                    ></path>
                                    <g id="z100" style="opacity:0.2">
                                        <circle
                                            class="scl"
                                            cx="20"
                                            cy="16"
                                            r="14"
                                        ></circle>
                                        <text
                                            class="scl"
                                            x="8"
                                            y="22"
                                            font-size="14"
                                        >
                                            100
                                        </text>
                                    </g>
                                </g>
                                <g
                                    id="Z_top_10"
                                    fill="#d0d0d0"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            Z_axis,
                                            "Z_top_10",
                                            Z_axis_top_dir + "10"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("z10")
                                    }}
                                    onmousedown={(e) => onMouseDown("Z_top_10")}
                                    onmouseout={(e) => {
                                        onOutJog("z10", "Z_top_10")
                                    }}
                                >
                                    <rect
                                        class="std"
                                        x="0"
                                        y="32"
                                        width="40"
                                        height="30"
                                    ></rect>
                                    <g id="z10" style="opacity:0.2">
                                        <circle
                                            class="scl"
                                            cx="20"
                                            cy="47"
                                            r="12"
                                        ></circle>
                                        <text
                                            class="scl"
                                            x="11"
                                            y="53"
                                            font-size="15"
                                        >
                                            10
                                        </text>
                                    </g>
                                </g>
                                <g
                                    id="Z_top_1"
                                    fill="#e0e0e0"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            Z_axis,
                                            "Z_top_1",
                                            Z_axis_top_dir + "1"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("z1")
                                    }}
                                    onmousedown={(e) => onMouseDown("Z_top_1")}
                                    onmouseout={(e) => {
                                        onOutJog("z1", "Z_top_1")
                                    }}
                                >
                                    <rect
                                        class="std"
                                        x="0"
                                        y="62"
                                        width="40"
                                        height="26"
                                    ></rect>
                                    <g id="z1" style="opacity:0.2">
                                        <circle
                                            class="scl"
                                            cx="20"
                                            cy="75"
                                            r="10.5"
                                        ></circle>
                                        <text
                                            class="scl"
                                            x="16"
                                            y="80"
                                            font-size="14"
                                        >
                                            1
                                        </text>
                                    </g>
                                </g>
                                <g
                                    id="ZSpace"
                                    fill="#000000"
                                    style="pointer-events:none;"
                                >
                                    <rect
                                        class="std"
                                        x="0"
                                        y="112"
                                        width="40"
                                        height="16"
                                    ></rect>
                                </g>
                                <g
                                    id="Z_top_0_1"
                                    fill="#f0f0f0"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            Z_axis,
                                            "Z_top_0_1",
                                            Z_axis_top_dir + "0.1"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("z0_1")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("Z_top_0_1")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog("z0_1", "Z_top_0_1")
                                    }}
                                >
                                    <rect
                                        class="std"
                                        x="0"
                                        y="88"
                                        width="40"
                                        height="24"
                                    ></rect>
                                    <g id="z0_1" style="opacity:0.2">
                                        <circle
                                            class="scl"
                                            cx="20"
                                            cy="100"
                                            r="9.5"
                                        ></circle>
                                        <text
                                            class="scl"
                                            x="13.5"
                                            y="103.5"
                                            font-size="10"
                                        >
                                            0.1
                                        </text>
                                    </g>
                                </g>
                                <g
                                    id="Z_bottom_0_1"
                                    fill="#f0f0f0"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            Z_axis,
                                            "Z_bottom_0_1",
                                            Z_axis_bottom_dir + "0.1"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("z0_1")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("Z_bottom_0_1")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog("z0_1", "Z_bottom_0_1")
                                    }}
                                >
                                    <rect
                                        class="std"
                                        x="0"
                                        y="128"
                                        width="40"
                                        height="24"
                                    ></rect>
                                </g>
                                <g
                                    id="Z_bottom_1"
                                    fill="#e0e0e0"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            Z_axis,
                                            "Z_bottom_1",
                                            Z_axis_bottom_dir + "1"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("z1")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("Z_bottom_1")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog("z1", "Z_bottom_1")
                                    }}
                                >
                                    <rect
                                        class="std"
                                        x="0"
                                        y="152"
                                        width="40"
                                        height="26"
                                    ></rect>
                                </g>
                                <g
                                    id="Z_bottom_10"
                                    fill="#d0d0d0"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            Z_axis,
                                            "Z_bottom_10",
                                            Z_axis_bottom_dir + "10"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("z10")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("Z_bottom_10")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog("z10", "Z_bottom_10")
                                    }}
                                >
                                    <rect
                                        class="std r10"
                                        x="0"
                                        y="178"
                                        width="40"
                                        height="30"
                                    ></rect>
                                </g>

                                <g
                                    id="Z_bottom_100"
                                    fill="#d0d0d0"
                                    onmouseup={(e) =>
                                        sendJogCommand(
                                            Z_axis,
                                            "Z_bottom_100",
                                            Z_axis_bottom_dir + "100"
                                        )
                                    }
                                    onmouseover={(e) => {
                                        onHoverJog("z100")
                                    }}
                                    onmousedown={(e) =>
                                        onMouseDown("Z_bottom_100")
                                    }
                                    onmouseout={(e) => {
                                        onOutJog("z100", "Z_bottom_100")
                                    }}
                                >
                                    <path
                                        class="std"
                                        d=" M0,208 h40 v27 a5,5 0 0,1 -5,5 h-30 a5,5 0 0,1 -5,-5 z"
                                    ></path>
                                </g>
                                <g
                                    id="+Z"
                                    fill-opacity=".6"
                                    pointer-events="none"
                                >
                                    <path
                                        class="std"
                                        d="M50,20 l17,17 h-10 v11 h-14 v-11 h-10 z"
                                        fill="DarkSeaGreen"
                                    ></path>
                                    <text
                                        class="jog"
                                        x={pos_x_z_axis_label_top}
                                        y="36"
                                        id="axisup"
                                    >
                                        {label_z_axis_top}
                                    </text>
                                </g>
                                <g
                                    id="-Z"
                                    fill-opacity=".6"
                                    pointer-events="none"
                                >
                                    <path
                                        class="std"
                                        d="M50,220 l-17,-17 h10 v-11 h14 v11 h10 z"
                                        fill="DarkSeaGreen"
                                    ></path>
                                    <text
                                        class="jog"
                                        x={pos_x_z_axis_label_bottom}
                                        y="210"
                                        id="axisdown"
                                    >
                                        {label_z_axis_bottom}
                                    </text>
                                </g>
                                <g
                                    id="posz"
                                    onmouseup={(e) => {
                                        sendMoveCommand("posz", "posz")
                                    }}
                                    onmouseover={(e) => {
                                        onHoverJog("posz")
                                    }}
                                    onmousedown={(e) => onMouseDown("posz")}
                                    onmouseout={(e) => {
                                        onOut("posz")
                                    }}
                                >
                                    <title>{moveToTitleZ}</title>
                                    <rect
                                        class="movez"
                                        x="-1"
                                        y="110"
                                        width="42"
                                        height="20"
                                        rx="5"
                                    />
                                    <circle
                                        class="cross"
                                        cx="13"
                                        cy="120.3"
                                        r="4"
                                    ></circle>
                                    <line
                                        x1="13"
                                        y1="125.3"
                                        x2="13"
                                        y2="128.8"
                                        style="stroke:black;stroke-width:1"
                                    />
                                    <line
                                        x1="13"
                                        y1="115.3"
                                        x2="13"
                                        y2="111.6"
                                        style="stroke:black;stroke-width:1"
                                    />
                                    <line
                                        x1="4"
                                        y1="120.3"
                                        x2="8.7"
                                        y2="120.3"
                                        style="stroke:black;stroke-width:1"
                                    />
                                    <line
                                        x1="18"
                                        y1="120.3"
                                        x2="21.7"
                                        y2="120.3"
                                        style="stroke:black;stroke-width:1"
                                    />
                                    <text class="posscl" x="25" y="122">
                                        Z
                                    </text>
                                </g>
                            </g>
                        </svg>
                    </div>
                )}
                <div
                    class={
                        shortcuts.enabled ? "m-1 W-100" : "m-1 show-low W-100"
                    }
                >
                    <div class="jog-extra-buttons-container">
                        <Button
                            m1
                            tooltip
                            data-tooltip={T("P6")}
                            id="btnHXYZ"
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                sendHomeCommand("")
                            }}
                        >
                            <Home />
                            <span class="text-tiny">xyz</span>
                        </Button>
                        <Button
                            m1
                            tooltip
                            data-tooltip={moveToTitleXY}
                            id="btnMoveXY"
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                sendMoveCommand("posxy")
                            }}
                        >
                            <Crosshair />
                            <span class="text-tiny">xy</span>
                        </Button>
                        <Button
                            m1
                            tooltip
                            data-tooltip={moveToTitleZ}
                            id="btnMoveZ"
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                sendMoveCommand("posz")
                            }}
                        >
                            <Crosshair />
                            <span class="text-tiny">z</span>
                        </Button>
                    </div>
                </div>
                <div class="jog-extra-buttons-container">
                    <ButtonImg
                        m1
                        tooltip
                        label={T("P13")}
                        data-tooltip={T("P13")}
                        icon={<ZapOff />}
                        id="btnMotorOff"
                        onclick={(e) => {
                            useUiContextFn.haptic()
                            const cmds = useUiContextFn
                                .getValue("motoroff")
                                .split(";")
                            e.target.blur()
                            cmds.forEach((cmd) => {
                                SendCommand(cmd)
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
