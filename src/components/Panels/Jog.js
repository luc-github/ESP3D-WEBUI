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
import { Move, Crosshair, Home, ZapOff, Edit3, ChevronDown } from "preact-feather"
import { useHttpFn } from "../../hooks"
import { espHttpURL } from "../Helpers"
import { useUiContext, useUiContextFn } from "../../contexts"
import { T } from "../Translations"
import {
    Button,
    ButtonImg,
    ContainerHelper,
    PanelHeader,
} from "../Controls"
import { useEffect, useState, useRef } from "preact/hooks"
import { showModal } from "../Modal"
import { useTargetContext } from "../../targets"
import { SimpleExtruderControl } from "SubTargetDir"

let currentFeedRate = []
const jogAxisStep = { X: null, Y: null, Z: null }
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
    const { toasts } = useUiContext()
    const { createNewRequest } = useHttpFn

    const sendCommand = (cmd) => {
        createNewRequest(
            espHttpURL("command", { cmd }),
            { method: "GET", echo: cmd },
            {
                onSuccess: () => {},
                onFail: (err) => toasts.addToast({ content: err, type: "error" }),
            }
        )
    }

    const zeroAxis = (axis) => {
        useUiContextFn.haptic()
        const template = useUiContextFn.getValue("zeroaxiscmd") || "G92 #0"
        sendCommand(template.replace("#", axis))
    }

    const zeroAll = () => {
        useUiContextFn.haptic()
        const cmd = useUiContextFn.getValue("zeroallcmd") || "G92 X0 Y0 Z0"
        sendCommand(cmd)
    }

    return (
        <div class="dro-container">
            <div class="dro-axes">
                {["X", "Y", "Z"].map((axis) => (
                    <div class="dro-axis">
                        <div class="dro-header">
                            <span class="dro-label">
                                <Move size="0.9em" />
                                {axis}
                            </span>
                            <button
                                class="dro-zero-btn tooltip tooltip-top"
                                data-tooltip={T("P129")}
                                onclick={() => zeroAxis(axis)}
                            >
                                <Crosshair size="0.6em" />
                            </button>
                        </div>
                        <div class="dro-value-wrap">
                            <span class="dro-value">
                                {positions[axis.toLowerCase()]}
                            </span>
                            <span class="dro-unit">{T("P16")}</span>
                        </div>
                    </div>
                ))}
            </div>
            <ButtonImg
                m1
                className="btn-primary"
                icon={<Crosshair />}
                label={T("P130")}
                onclick={zeroAll}
            />
        </div>
    )
}

const JogPanel = () => {
    const { modals, toasts, panels, shortcuts } = useUiContext()
    const { temperatures } = useTargetContext()
    const { createNewRequest } = useHttpFn
    const setExtruderFeedrateRef = useRef(null)
    const extruderCount = temperatures?.T?.length || 0
    const isMixedExtruder = !!useUiContextFn.getValue("ismixedextruder")
    const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(
        shortcuts.enabled
    )

    const [moveToTitleXY, setMoveToTitleXY] = useState(
        T("P20") + movetoX + "," + movetoY
    )
    const [moveToTitleZ, setMoveToTitleZ] = useState(T("P75") + movetoZ)

    const getStepPresets = (id) => {
        const v = useUiContextFn.getValue(id)
        return v ? v.split(";") : []
    }
    const xStepPresets = getStepPresets("xsteps")
    const yStepPresets = getStepPresets("ysteps")
    const zStepPresets = getStepPresets("zsteps")
    if (!jogAxisStep.X) jogAxisStep.X = xStepPresets.length ? parseFloat(xStepPresets[0]) : 1
    if (!jogAxisStep.Y) jogAxisStep.Y = yStepPresets.length ? parseFloat(yStepPresets[0]) : 1
    if (!jogAxisStep.Z) jogAxisStep.Z = zStepPresets.length ? parseFloat(zStepPresets[0]) : 1

    const [xStep, setXStep] = useState(jogAxisStep.X)
    const [yStep, setYStep] = useState(jogAxisStep.Y)
    const [zStep, setZStep] = useState(jogAxisStep.Z)
    const [xDropOpen, setXDropOpen] = useState(false)
    const [yDropOpen, setYDropOpen] = useState(false)
    const [zDropOpen, setZDropOpen] = useState(false)

    const renderStepRow = (step, setStep, dropOpen, setDropOpen, presets, axisKey) => (
        <div class="jog-axis-step">
            <div class="jog-step-wrap">
                <input
                    class="temp-input"
                    type="number"
                    min="0.01"
                    step="0.1"
                    value={step}
                    onInput={(e) => {
                        const v = parseFloat(e.target.value)
                        if (!isNaN(v) && v > 0) {
                            jogAxisStep[axisKey] = v
                            setStep(v)
                        }
                    }}
                />
                <span class="jog-step-unit">{T("P16")}</span>
            </div>
            {presets.length > 0 && (
                <div
                    class="temp-preset-dropdown"
                    tabIndex={-1}
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget))
                            setDropOpen(false)
                    }}
                >
                    <button
                        class={"temp-preset-toggle" + (dropOpen ? " active" : "")}
                        onclick={() => setDropOpen(!dropOpen)}
                    >
                        <ChevronDown size="0.7em" />
                    </button>
                    {dropOpen && (
                        <div class="temp-preset-list">
                            {presets.map((v) => (
                                <button
                                    class="temp-preset-item"
                                    onclick={() => {
                                        const pv = parseFloat(v)
                                        jogAxisStep[axisKey] = pv
                                        setStep(pv)
                                        setDropOpen(false)
                                    }}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )

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
        else {
            const step = axis.startsWith("Z")
                ? jogAxisStep.Z
                : axis.startsWith("Y")
                ? jogAxisStep.Y
                : jogAxisStep.X
            movement = axis + (step || 1)
        }
        let cmd = "G91\nG1 " + movement + " F" + feedrate + "\nG90"
        if (id && currentButtonPressed != id) {
            console.log(id, " is different than ", currentButtonPressed)
            return
        }
        SendCommand(cmd)
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
                class: "btn-warning",
            },
            icon: <Edit3 />,
            id: "inputFeedrate",
            content: (
                <Fragment>
                    <label class="form-label">{axis == "XY" ? T("P10") : T("P11")}</label>
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
        ...(SimpleExtruderControl && !isMixedExtruder
            ? [{ label: T("P50"), onClick: () => setExtruderFeedrateRef.current?.() }]
            : []),
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
            pos_x_v_axis_label_top = "114"
            pos_x_v_axis_label_bottom = "113"
        }
    } else {
        if (useUiContextFn.getValue("swap_x_y")) {
            H_axis_left_dir = "-"
            H_axis_right_dir = "+"
        } else {
            V_axis_top_dir = "+"
            V_axis_bottom_dir = "-"
            pos_x_v_axis_label_top = "113"
            pos_x_v_axis_label_bottom = "114"
        }
    }

    if (useUiContextFn.getValue("invert_x")) {
        if (useUiContextFn.getValue("swap_x_y")) {
            V_axis_top_dir = "-"
            V_axis_bottom_dir = "+"
            pos_x_v_axis_label_top = "114"
            pos_x_v_axis_label_bottom = "113"
        } else {
            H_axis_left_dir = "+"
            H_axis_right_dir = "-"
        }
    } else {
        if (useUiContextFn.getValue("swap_x_y")) {
            V_axis_top_dir = "+"
            V_axis_bottom_dir = "-"
            pos_x_v_axis_label_top = "113"
            pos_x_v_axis_label_bottom = "114"
        } else {
            H_axis_left_dir = "-"
            H_axis_right_dir = "+"
        }
    }

    if (useUiContextFn.getValue("invert_z")) {
        Z_axis_top_dir = "+"
        Z_axis_bottom_dir = "-"
        pos_x_z_axis_label_top = 44
        pos_x_z_axis_label_bottom = 44
    } else {
        Z_axis_top_dir = "-"
        Z_axis_bottom_dir = "+"
        pos_x_z_axis_label_top = 44
        pos_x_z_axis_label_bottom = 44
    }
    label_z_axis_bottom = Z_axis_bottom_dir + Z_axis
    label_z_axis_top = Z_axis_top_dir + Z_axis
    label_h_axis_left = H_axis_left_dir + H_axis
    label_h_axis_right = H_axis_right_dir + H_axis
    label_v_axis_bottom = V_axis_bottom_dir + V_axis
    label_v_axis_top = V_axis_top_dir + V_axis
    useEffect(() => {
  // Nettoyage précédent si nécessaire
  const cleanup = () => {
    // On peut laisser vide ou ajouter removeEventListener si tu veux être très propre
  };

  const attach = (id, handlers) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (handlers.down) el.addEventListener('mousedown', handlers.down);
    if (handlers.up) el.addEventListener('mouseup', handlers.up);
    if (handlers.out) el.addEventListener('mouseout', handlers.out);
    if (handlers.over) el.addEventListener('mouseover', handlers.over);
  };

  // === Home buttons ===
  attach("HomeAll", {
    down: () => onMouseDown("HomeAll"),
    up: () => sendHomeCommand("", "HomeAll"),
    out: () => onOut("HomeAll")
  });

  attach("HomeX", {
    down: () => onMouseDown("HomeX"),
    up: () => sendHomeCommand("X", "HomeX"),
    out: () => onOut("HomeX")
  });

  attach("HomeY", {
    down: () => onMouseDown("HomeY"),
    up: () => sendHomeCommand("Y", "HomeY"),
    out: () => onOut("HomeY")
  });

  attach("HomeZ", {
    down: () => onMouseDown("HomeZ"),
    up: () => sendHomeCommand("Z", "HomeZ"),
    out: () => onOut("HomeZ")
  });

  // === Jog circles (factorisé) ===
  const jogSizes = ['100', '10', '1', '0_1'];
  const directions = [
    { prefix: 'V_top',    axis: V_axis, dist: (s) => V_axis_top_dir + s.replace('_', '.') },
    { prefix: 'H_right',  axis: H_axis, dist: (s) => H_axis_right_dir + s.replace('_', '.') },
    { prefix: 'V_bottom', axis: V_axis, dist: (s) => V_axis_bottom_dir + s.replace('_', '.') },
    { prefix: 'H_left',   axis: H_axis, dist: (s) => H_axis_left_dir + s.replace('_', '.') },
  ];

  jogSizes.forEach(size => {
    directions.forEach(dir => {
      const btnId = `${dir.prefix}_${size}`;
      const labelId = size === '0_1' ? 'label_circle_0_1' : `label_circle_${size}`;

      attach(btnId, {
        down: () => onMouseDown(btnId),
        up: () => sendJogCommand(dir.axis, btnId, dir.dist(size)),
        out: () => onOutJog(labelId, btnId),
        over: () => onHoverJog(labelId)
      });
    });
  });

  // === Z Bar buttons ===
  const zDirections = [
    { id: 'Z_top_100',    dist: Z_axis_top_dir + '100' },
    { id: 'Z_top_10',     dist: Z_axis_top_dir + '10' },
    { id: 'Z_top_1',      dist: Z_axis_top_dir + '1' },
    { id: 'Z_top_0_1',    dist: Z_axis_top_dir + '0.1' },
    { id: 'Z_bottom_0_1', dist: Z_axis_bottom_dir + '0.1' },
    { id: 'Z_bottom_1',   dist: Z_axis_bottom_dir + '1' },
    { id: 'Z_bottom_10',  dist: Z_axis_bottom_dir + '10' },
    { id: 'Z_bottom_100', dist: Z_axis_bottom_dir + '100' },
  ];

  zDirections.forEach(z => {
    const labelId = z.id.includes('100') ? 'z100' : 
                    z.id.includes('10') ? 'z10' : 
                    z.id.includes('1') && !z.id.includes('0_1') ? 'z1' : 'z0_1';

    attach(z.id, {
      down: () => onMouseDown(z.id),
      up: () => sendJogCommand(Z_axis, z.id, z.dist),
      out: () => onOutJog(labelId, z.id),
      over: () => onHoverJog(labelId)
    });
  });

  // === Centre posxy et posz ===
  attach("posxy", {
    down: () => onMouseDown("posxy"),
    up: () => sendMoveCommand("posxy", "posxy"),
    out: () => onOut("posxy"),
    over: () => onHoverJog("posxy")
  });

  attach("posz", {
    down: () => onMouseDown("posz"),
    up: () => sendMoveCommand("posz", "posz"),
    out: () => onOut("posz"),
    over: () => onHoverJog("posz")
  });

  return cleanup;
}, [V_axis, H_axis, V_axis_top_dir, V_axis_bottom_dir, H_axis_left_dir, H_axis_right_dir, Z_axis_top_dir, Z_axis_bottom_dir, moveToTitleXY, moveToTitleZ]);
    return (
        <div class="panel panel-dashboard" id={id} >
            <ContainerHelper id={id} />
            <PanelHeader
                id={id}
                icon={<Move />}
                title={T("S66")}
                items={menu}
            />
            <div class="panel-body panel-body-dashboard">
                <div class="m-1 jog-container">
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
                                success
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
                            {renderStepRow(xStep, setXStep, xDropOpen, setXDropOpen, xStepPresets, "X")}
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
                                success
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
                            {renderStepRow(yStep, setYStep, yDropOpen, setYDropOpen, yStepPresets, "Y")}
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
                                success
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
                            {renderStepRow(zStep, setZStep, zDropOpen, setZDropOpen, zStepPresets, "Z")}
                        </div>
                    </div>
                </div>

                {!shortcuts.enabled && (
                    <div class="hide-low jog-svg-container">
                        <svg
  viewBox="0 -5 325 255"
  xmlns="http://www.w3.org/2000/svg"
  version="1.1"
  class="jog-svg"
>
  <defs>
    <filter id="f1" x="-1" y="-1" width="300%" height="300%">
      <feOffset result="offOut" in="SourceAlpha" dx="3" dy="3"/>
      <feGaussianBlur result="blurOut" in="offOut" stdDeviation="4"/>
      <feBlend in="SourceGraphic" in2="blurOut" mode="normal"/>
    </filter>
    <symbol id="HomeIcon" viewBox="0 0 20 18">
      <path class="home" d="M3,18 v-8 l7,-6 l7,6 v8 h-5 v-6 h-4 v6 z" fill="black"/>
      <path class="home" d="M0,10 l10-8.5 l10,8.5" stroke-width="1.5" fill="none"/>
      <path class="home" d="M15,3 v2.8 l1,.8 v-3.6 z"/>
    </symbol>
  </defs>

  {/* Home buttons */}
  <g id="HomeAll" class="std">
    <title>{T("P6")}</title>
    <path class="std" d="M10 182.5 h-10 v57.5 h57.5 v-10 a 125,125 0 0,1 -47.5 -47.5 Z" fill="#f0f0f0"/>
    <use x="3" y="217" width="20" height="18" href="#HomeIcon"/>
  </g>

  <g id="HomeX" class="std">
    <title>{T("P7")}</title>
    <path class="std" d="M10 57.5 h-10 v-57.5 h57.5 v10 a125,125 0 0,0 -47.5 47.5Z" fill="Khaki"/>
    <use x="3" y="5" width="20" height="18" href="#HomeIcon"/>
    <text x="25" y="20" class="home">X</text>
  </g>

  <g id="HomeY" class="std">
    <title>{T("P8")}</title>
    <path class="std" d="M230 57.5 h10 v-57.5 h-57.5 v10 a125,125 0 0,1 47.5 47.5z" fill="SteelBlue"/>
    <use x="217" y="5" width="20" height="18" href="#HomeIcon"/>
    <text x="202" y="20" class="home">Y</text>
  </g>

  <g id="HomeZ" class="std">
    <title>{T("P9")}</title>
    <path class="std" d="M230 182.5 h10 v57.5 h-57.5 v-10 a125,125 0 0,0 47.5 -47.5z" fill="DarkSeaGreen"/>
    <use x="217" y="217" width="20" height="18" href="#HomeIcon"/>
    <text x="202" y="232" class="home">Z</text>
  </g>

  {/* Jog circles */}
  <g id="Jog100" fill="#c0c0c0" class="std">
    <g id="V_top_100" transform="translate(120 120)"><path class="std" d="M-60 -67.07 L-75.93,-83 A112.5,112.5 0 0,1 75,-83 L60,-67.07 A90,90 0 0,0 -60,-67.07 z"/></g>
    <g id="H_right_100" transform="translate(120 120)"><path class="std" d="M67.07,-60 L83,-75.93 A112.5,112.5 0 0,1 83,75.93 L67.07,60 A90,90 0 0,0 67.07,-60"/></g>
    <g id="V_bottom_100" transform="translate(120 120)"><path class="std" d="M-60,67.07 L-75.93,83 A112.5,112.5 0 0,0 75,83 L60,67.07 A90,90 0 0,1 -60,67.07 z"/></g>
    <g id="H_left_100" transform="translate(120 120)"><path class="std" d="M-67.07,-60 L-83,-75.93 A112.5,112.5 0 0,0 -83,75.93 L-67.07,60 A90,90 0 0,1 -67.07,-60 z"/></g>
  </g>

  <g id="Jog10" fill="#d0d0d0" class="std">
    <g id="V_top_10" transform="translate(120 120)"><path class="std" d="M-44.06 -51.13 L-60,-67.07 A90,90 0 0,1 60,-67 L44.06,-51.13 A67.5,67.5 0 0,0 -44.06,-51.13 z"/></g>
    <g id="H_right_10" transform="translate(120 120)"><path class="std" d="M51.13 44.06 L67.07,60 A90,90 0 0,0 67.07,-60 L51.13,-44.06 A67.5,67.5 0 0,1 51.13,44.06 z"/></g>
    <g id="V_bottom_10" transform="translate(120 120)"><path class="std" d="M-44.06 51.13 L-60,67.07 A90,90 0 0,0 60,67 L44.06,51.13 A67.5,67.5 0 0,1 -44.06,51.13 z"/></g>
    <g id="H_left_10" transform="translate(120 120)"><path class="std" d="M-51.13 44.06 L-67.07,60 A90,90 0 0,1 -67.07,-60 L-51.13,-44.06 A67.5,67.5 0 0,0 -51.13,44.06 z"/></g>
  </g>

  <g id="Jog1" fill="#e0e0e0" class="std">
    <g id="V_top_1" transform="translate(120 120)"><path class="std" d="M-28.09 -35.16 L-44.06,-51.13 A67.5,67.5 0 0,1 44.06,-51.13 L28.09,-35.16 A45,45 0 0,0 -28.09,-35.16 z"/></g>
    <g id="H_right_1" transform="translate(120 120)"><path class="std" d="M35.16 -28.09 L51.13,-44.06 A67.5,67.5 0 0,1 51.13,44.06 L35.16,28.09 A45,45 0 0,0 35.16,-28.09 z"/></g>
    <g id="V_bottom_1" transform="translate(120 120)"><path class="std" d="M-28.09 35.16 L-44.06,51.13 A67.5,67.5 0 0,0 44.06,51.13 L28.09,35.16 A45,45 0 0,1 -28.09,35.16 z"/></g>
    <g id="H_left_1" transform="translate(120 120)"><path class="std" d="M-35.16 -28.09 L-51.13,-44.06 A67.5,67.5 0 0,0 -51.13,44.06 L-35.16,28.09 A45,45 0 0,1 -35.16,-28.09 z"/></g>
  </g>

  <g id="Jog0_1" fill="#f0f0f0" class="std">
    <g id="V_top_0_1" transform="translate(120 120)"><path class="std" d="M-28.09 -35.16 A45,45 0 0,1 29.09,-35.16 L0,-7.07 z"/></g>
    <g id="H_right_0_1" transform="translate(120 120)"><path class="std" d="M35.16 -28.09 A45,45 0 0,1 35.16,28.09 L7.07,0 z"/></g>
    <g id="V_bottom_0_1" transform="translate(120 120)"><path class="std" d="M-28.09 35.16 A45,45 0 0,0 29.09,35.16 L0,7.07 z"/></g>
    <g id="H_left_0_1" transform="translate(120 120)"><path class="std" d="M-35.16 -28.09 A45,45 0 0,0 -35.16,28.09 L-7.07,0 z"/></g>
  </g>

  {/* Labels des cercles */}
  <g id="label_circle_0_1" style="opacity:0.2">
    <circle class="scl" cx="144" cy="96" r="9.5"/>
    <text class="scl" x="140" y="100" font-size="10">0.1</text>
  </g>
  <g id="label_circle_1" style="opacity:0.2">
    <circle class="scl" cx="159.5" cy="80.5" r="10.5"/>
    <text class="scl" x="157" y="86" font-size="14">1</text>
  </g>
  <g id="label_circle_10" style="opacity:0.2">
    <circle class="scl" cx="175" cy="65" r="12"/>
    <text class="scl" x="169.5" y="70" font-size="15">10</text>
  </g>
  <g id="label_circle_100" style="opacity:0.2">
    <circle class="scl" cx="195" cy="45" r="15"/>
    <text class="scl" x="185" y="50" font-size="15">100</text>
  </g>

  {/* Decoration */}
  <g id="Decoration" pointer-events="none" fill-opacity=".6">
    <path class="std" d="M120,20 l17,17 h-10 v11 h-14 v-11 h-10 z" fill="SteelBlue"/>
    <path class="std" d="M120,220 l17,-17 h-10 v-11 h-14 v11 h-10 z" fill="SteelBlue"/>
    <path class="std" d="M20,120 l17,17 v-10 h11 v-14 h-11 v-10 z" fill="Khaki"/>
    <path class="std" d="M220,120 l-17,-17 v10 h-11 v14 h11 v10 z" fill="Khaki"/>
    <text class="jog" x={pos_x_v_axis_label_top} y="36">{label_v_axis_top}</text>
    <text class="jog" x={pos_x_v_axis_label_bottom} y="212">{label_v_axis_bottom}</text>
    <text class="jog" x="29" y="124">{label_h_axis_left}</text>
    <text class="jog" x="200" y="124">{label_h_axis_right}</text>
  </g>

  {/* Centre XY */}
  <g id="posxy">
    <title>{moveToTitleXY}</title>
    <circle class="std" cx="120.2" cy="120.3" r="15"/>
    <circle class="cross" cx="116" cy="120.3" r="4"/>
    <line x1="116" y1="125.3" x2="116" y2="129" stroke="black" stroke-width="1"/>
    <line x1="116" y1="115.3" x2="116" y2="111.6" stroke="black" stroke-width="1"/>
    <line x1="121" y1="120.3" x2="124.7" y2="120.3" stroke="black" stroke-width="1"/>
    <line x1="111" y1="120.3" x2="107.3" y2="120.3" stroke="black" stroke-width="1"/>
    <text class="posscl" x="125" y="118">X</text>
    <text class="posscl" x="125" y="130">Y</text>
  </g>

  {/* JogBar Z */}
  <g id="JogBar" transform="translate(250,0)">
    <g id="Z_top_100" fill="#d0d0d0" class="std">
      <path class="std" d="M5,0 h30 a5,5 0 0,1 5,5 v27 h-40 v-27 a5,5 0 0,1 5,-5 z"/>
      <g id="z100" style="opacity:0.2"><circle class="scl" cx="20" cy="16" r="14"/><text class="scl" x="12
      " y="22" font-size="14">100</text></g>
    </g>
    <g id="Z_top_10" fill="#d0d0d0" class="std">
      <rect class="std" x="0" y="32" width="40" height="30"/>
      <g id="z10" style="opacity:0.2"><circle class="scl" cx="20" cy="47" r="12"/><text class="scl" x="15" y="53" font-size="15">10</text></g>
    </g>
    <g id="Z_top_1" fill="#e0e0e0" class="std">
      <rect class="std" x="0" y="62" width="40" height="26"/>
      <g id="z1" style="opacity:0.2"><circle class="scl" cx="20" cy="75" r="10.5"/><text class="scl" x="18" y="80" font-size="14">1</text></g>
    </g>
    <g id="ZSpace" fill="#000000" style="pointer-events:none;">
      <rect class="std" x="0" y="112" width="40" height="16"/>
    </g>
    <g id="Z_top_0_1" fill="#f0f0f0" class="std">
      <rect class="std" x="0" y="88" width="40" height="24"/>
      <g id="z0_1" style="opacity:0.2"><circle class="scl" cx="20" cy="100" r="9.5"/><text class="scl" x="15" y="103.5" font-size="10">0.1</text></g>
    </g>
    <g id="Z_bottom_0_1" fill="#f0f0f0" class="std">
      <rect class="std" x="0" y="128" width="40" height="24"/>
    </g>
    <g id="Z_bottom_1" fill="#e0e0e0" class="std">
      <rect class="std" x="0" y="152" width="40" height="26"/>
    </g>
    <g id="Z_bottom_10" fill="#d0d0d0" class="std">
      <rect class="std" x="0" y="178" width="40" height="30"/>
    </g>
    <g id="Z_bottom_100" fill="#d0d0d0" class="std">
      <path class="std" d="M0,208 h40 v27 a5,5 0 0,1 -5,5 h-30 a5,5 0 0,1 -5,-5 z"/>
    </g>

    <g id="+Z" fill-opacity=".6" pointer-events="none">
      <path class="std" d="M50,20 l17,17 h-10 v11 h-14 v-11 h-10 z" fill="DarkSeaGreen"/>
      <text class="jog" x={pos_x_z_axis_label_top} y="36">{label_z_axis_top}</text>
    </g>
    <g id="-Z" fill-opacity=".6" pointer-events="none">
      <path class="std" d="M50,220 l-17,-17 h10 v-11 h14 v11 h10 z" fill="DarkSeaGreen"/>
      <text class="jog" x={pos_x_z_axis_label_bottom} y="210">{label_z_axis_bottom}</text>
    </g>

    <g id="posz">
      <title>{moveToTitleZ}</title>
      <rect class="movez" x="-1" y="110" width="42" height="20" rx="5"/>
      <circle class="cross" cx="13" cy="120.3" r="4"/>
      <line x1="13" y1="125.3" x2="13" y2="128.8" stroke="black" stroke-width="1"/>
      <line x1="13" y1="115.3" x2="13" y2="111.6" stroke="black" stroke-width="1"/>
      <line x1="4" y1="120.3" x2="8.7" y2="120.3" stroke="black" stroke-width="1"/>
      <line x1="18" y1="120.3" x2="21.7" y2="120.3" stroke="black" stroke-width="1"/>
      <text class="posscl" x="25" y="122">Z</text>
    </g>
  </g>
</svg>
                    </div>
                )}
                <div
                    class={
                        shortcuts.enabled ? "m-1 full-width" : "m-1 show-low full-width"
                    }
                >
                    <div class="jog-extra-buttons-container">
                        <Button
                            m1
                            success
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
                            class="btn-warning"
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
                            class="btn-warning"
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
                        className="btn-error"
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
                {SimpleExtruderControl && !isMixedExtruder && (
                    <SimpleExtruderControl
                        extruderCount={extruderCount}
                        setFeedrateRef={setExtruderFeedrateRef}
                    />
                )}
                {/* Hidden step cycle buttons — triggered by Shift+X/Y/Z keyboard shortcuts */}
                <button class="d-none" id="btnCycleX" onClick={() => {
                    if (!xStepPresets.length) return
                    const idx = xStepPresets.findIndex(p => parseFloat(p) === xStep)
                    const next = parseFloat(xStepPresets[(idx + 1) % xStepPresets.length])
                    jogAxisStep.X = next; setXStep(next)
                }} />
                <button class="d-none" id="btnCycleY" onClick={() => {
                    if (!yStepPresets.length) return
                    const idx = yStepPresets.findIndex(p => parseFloat(p) === yStep)
                    const next = parseFloat(yStepPresets[(idx + 1) % yStepPresets.length])
                    jogAxisStep.Y = next; setYStep(next)
                }} />
                <button class="d-none" id="btnCycleZ" onClick={() => {
                    if (!zStepPresets.length) return
                    const idx = zStepPresets.findIndex(p => parseFloat(p) === zStep)
                    const next = parseFloat(zStepPresets[(idx + 1) % zStepPresets.length])
                    jogAxisStep.Z = next; setZStep(next)
                }} />
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
    hasMenu: true,
}

export { JogPanel, JogPanelElement, PositionsControls }
