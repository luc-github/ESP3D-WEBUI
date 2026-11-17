/*
Jog.js - ESP3D WebUI component file

 Copyright (c) 2021 Luc LEBOSSE. All rights reserved.

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public
 License as published by the Free Software Foundation; either
 version 3 of the License, or (at your option) any later version.
 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.
 You should have received a copy of the GNU General Public
 License along with This code; if not, see <https://www.gnu.org/licenses/>.
*/

import { Fragment, h } from "preact"
import { Move, Crosshair, Home, ZapOff, Edit3 } from "preact-feather"
import { useHttpFn } from "../../hooks"
import { espHttpURL } from "../Helpers"
import { useUiContext, useUiContextFn } from "../../contexts"
import { T } from "../Translations"
import { Button, ButtonImg } from "../Controls"
import { useEffect, useState, useRef } from "preact/hooks"
import { showModal } from "../Modal"
import { useTargetContext } from "../../targets"
import { Menu as PanelMenu, PanelShell } from "./"
import { JogSvg } from "./JogSvg"

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
        <PanelShell
            id={id}
            icon={<Move />}
            title={T("S66")}
            headerRight={<PanelMenu items={menu} />}
        >
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
                        <JogSvg
                            axes={{
                                H: H_axis,
                                V: V_axis,
                                Z: Z_axis,
                            }}
                            dirs={{
                                V_top: V_axis_top_dir,
                                V_bottom: V_axis_bottom_dir,
                                H_left: H_axis_left_dir,
                                H_right: H_axis_right_dir,
                                Z_top: Z_axis_top_dir,
                                Z_bottom: Z_axis_bottom_dir,
                            }}
                            labels={{
                                vTop: label_v_axis_top,
                                vBottom: label_v_axis_bottom,
                                hLeft: label_h_axis_left,
                                hRight: label_h_axis_right,
                                zTop: label_z_axis_top,
                                zBottom: label_z_axis_bottom,
                            }}
                            labelPos={{
                                vTop: pos_x_v_axis_label_top,
                                vBottom: pos_x_v_axis_label_bottom,
                                zTop: pos_x_z_axis_label_top,
                                zBottom: pos_x_z_axis_label_bottom,
                            }}
                            moveToTitleXY={moveToTitleXY}
                            moveToTitleZ={moveToTitleZ}
                            sendJogCommand={sendJogCommand}
                            sendHomeCommand={sendHomeCommand}
                            sendMoveCommand={sendMoveCommand}
                            onMouseDown={onMouseDown}
                            onOut={onOut}
                            onHoverJog={onHoverJog}
                            onOutJog={onOutJog}
                        />
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
        </PanelShell>
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
    hasMenu: true,
}

export { JogPanel, JogPanelElement, PositionsControls }
