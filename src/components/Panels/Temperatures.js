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
import { ButtonImg, Loading, PanelHeader, ContainerHelper } from "../Controls"
import { useHttpFn } from "../../hooks"
import { espHttpURL } from "../Helpers"
import { Thermometer, Power, ChevronDown } from "preact-feather"
import { useTargetContext } from "../../targets"

/*
 * Local const
 *
 */
// Module-level store for stop commands (indexed by tool+index)
const stopcmds = {}

const isEditable = (tool) => tool === "T" || tool === "B" || tool === "C"

const isVisible = (tool) => {
    const setting = {
        T: "showextruderctrls",
        B: "showbedctrls",
        C: "showchamberctrls",
        P: "showprobectrls",
        R: "showredundantctrls",
        M: "showboardctrls",
    }
    return setting[tool] != undefined
        ? useUiContextFn.getValue(setting[tool])
        : false
}

const preheatList = (tool) => {
    if (!isEditable(tool)) return []
    const key =
        tool === "T"
            ? "extruderpreheat"
            : tool === "B"
              ? "bedpreheat"
              : "chamberpreheat"
    const list = useUiContextFn.getValue(key)
    if (!list) return []
    return list.split(";").filter(Boolean).map((item) => item.trim())
}

const heaterCommand = (tool, index, value) => {
    if (!isEditable(tool)) return ""
    const key =
        tool === "T"
            ? "heatextruder"
            : tool === "B"
              ? "heatbed"
              : "heatchamber"
    const cmd = useUiContextFn.getValue(key)
    return cmd ? cmd.replace("#", index).replace("$", value) : ""
}

const sensorName = (tool, index, size) => {
    const name = { T: "P41", B: "P37", C: "P43", P: "P42", R: "P44", M: "P90" }
    return name[tool] != undefined
        ? T(name[tool]).replace("$", size === 1 ? "" : index + 1)
        : ""
}

const getMaxTemperature = (tool) => {
    const setting = { T: "extrudermax", B: "bedmax", C: "chambermax" }
    return setting[tool] != undefined
        ? parseFloat(useUiContextFn.getValue(setting[tool])) || 0
        : 0
}

// ─── Top-bar mini chips (used by InformationsControls) ────────────────────────
const TemperaturesControls = () => {
    const { temperatures } = useTargetContext()
    return (
        <div class="temperatures-ctrls">
            {Object.keys(temperatures).map((tool) => {
                if (temperatures[tool].length === 0 || !isVisible(tool)) return
                return (
                    <Fragment>
                        {temperatures[tool].map((temp, index) => (
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
                                    {temperatures[tool].length > 1 ? index : ""}
                                </div>
                                <div class="temperatures-value">{temp.value}</div>
                                {temp.target > 0 && (
                                    <div class="temperatures-target">
                                        {temp.target}
                                    </div>
                                )}
                            </div>
                        ))}
                    </Fragment>
                )
            })}
        </div>
    )
}

// ─── Live display (isolated — re-renders on every temp tick) ─────────────────
// Renders the full visual block: header (label+dot), value, target row, track
const TempLiveDisplay = ({ tool, index, size, maxTemp, onOff }) => {
    const { temperatures } = useTargetContext()
    const temp = temperatures[tool] && temperatures[tool][index]
    if (!temp) return null

    const current = parseFloat(temp.value) || 0
    const target = parseFloat(temp.target) || 0
    const pct = maxTemp > 0 ? Math.min(100, (current / maxTemp) * 100) : 0

    const dotClass =
        "temp-dot" +
        (target > 0
            ? " heating"
            : current >= 40
              ? " warm"
              : " cool")

    const valueClass =
        "temp-current" +
        (current > 100 ? " hot" : current > 40 ? " warm" : "")

    const trackClass =
        current > 100 ? "tf-hot" : current > 40 ? "tf-warm" : "tf-cool"

    return (
        <Fragment>
            <div class="temp-header">
                <div class="temp-label">
                    <Thermometer size="0.75em" />
                    {sensorName(tool, index, size)}
                </div>
                <div class={dotClass} />
            </div>
            <div class={valueClass}>{Math.round(current)}</div>
            <div class="temp-target-row">
                {target > 0 ? (
                    <div class="temp-target">
                        {"→ "}
                        <span>{target + T("P72")}</span>
                    </div>
                ) : (
                    <div class="temp-target" />
                )}
                {target > 0 && onOff ? (
                    <button
                        class="temp-set-btn temp-off-btn tooltip tooltip-top"
                        data-tooltip={T("P38")}
                        onclick={onOff}
                    >
                        <Power size="0.8em" />
                    </button>
                ) : (
                    <div class="temp-unit">{T("P72")}</div>
                )}
            </div>
            <div class="temp-track">
                <div
                    class={"temp-fill " + trackClass}
                    style={"width:" + pct + "%"}
                />
            </div>
        </Fragment>
    )
}

// ─── One card per sensor ──────────────────────────────────────────────────────
const TemperatureCard = ({ tool, index, size }) => {
    const { toasts } = useUiContext()
    const { createNewRequest } = useHttpFn
    const editable = isEditable(tool)
    const max = getMaxTemperature(tool)
    const [inputVal, setInputVal] = useState("0")
    const [dropOpen, setDropOpen] = useState(false)
    const key = tool + index

    // Store stop command once
    if (editable && !stopcmds[key]) {
        stopcmds[key] = heaterCommand(tool, index, 0)
    }

    const sendCommand = (command) => {
        if (!command) return
        createNewRequest(
            espHttpURL("command", { cmd: command }),
            { method: "GET", echo: command },
            {
                onSuccess: () => {},
                onFail: (error) => {
                    toasts.addToast({ content: error, type: "error" })
                },
            }
        )
    }

    const isValid = () => {
        const v = parseFloat(inputVal)
        return !isNaN(v) && v >= 0 && (max <= 0 || v <= max)
    }

    const presets = preheatList(tool)

    const handleOff = editable
        ? (e) => {
              useUiContextFn.haptic()
              e.currentTarget.blur()
              sendCommand(stopcmds[key])
          }
        : null

    return (
        <div class="temp-cell">
            <TempLiveDisplay tool={tool} index={index} size={size} maxTemp={max} onOff={handleOff} />
            {editable && (
                <div class="temp-input-wrap">
                    <input
                        class="temp-input"
                        type="number"
                        min="0"
                        step="1"
                        max={max > 0 ? max : undefined}
                        value={inputVal}
                        onInput={(e) => setInputVal(e.target.value)}
                    />
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
                                                setInputVal(v)
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
                    <button
                        class={
                            "temp-set-btn" +
                            (!isValid() ? " d-invisible" : "")
                        }
                        onclick={(e) => {
                            useUiContextFn.haptic()
                            e.target.blur()
                            sendCommand(heaterCommand(tool, index, inputVal))
                        }}
                    >
                        {T("S43")}
                    </button>
                </div>
            )}
        </div>
    )
}

// ─── Panel ────────────────────────────────────────────────────────────────────
const TemperaturesPanel = () => {
    const { temperatures } = useTargetContext()
    const { toasts } = useUiContext()
    const { createNewRequest } = useHttpFn
    const id = "temperaturesPanel"
    console.log(id)

    let hasTemp = false
    Object.keys(temperatures).forEach((tool) => {
        if (temperatures[tool].length) hasTemp = true
    })

    const sendCommand = (command) => {
        if (!command) return
        createNewRequest(
            espHttpURL("command", { cmd: command }),
            { method: "GET", echo: command },
            {
                onSuccess: () => {},
                onFail: (error) => {
                    toasts.addToast({ content: error, type: "error" })
                },
            }
        )
    }

    return (
        <div class="panel panel-dashboard" id={id}>
            <ContainerHelper id={id} />
            <PanelHeader
                id={id}
                icon={<Thermometer />}
                title={T("P29")}
            />
            <div class="panel-body panel-body-dashboard">
                {hasTemp ? (
                    <Fragment>
                        <div class="temp-grid">
                            {Object.keys(temperatures).map((tool) => {
                                if (
                                    temperatures[tool].length === 0 ||
                                    !isVisible(tool)
                                )
                                    return null
                                return temperatures[tool].map((_, index) => (
                                    <TemperatureCard
                                        tool={tool}
                                        index={index}
                                        size={temperatures[tool].length}
                                    />
                                ))
                            })}
                        </div>
                        <div class="temp-stop-all">
                            <ButtonImg
                                id="stop-all"
                                icon={<Power />}
                                label={T("P40")}
                                className="btn-error"
                                tooltip
                                data-tooltip={T("P38")}
                                onClick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    Object.values(stopcmds).forEach(sendCommand)
                                }}
                            />
                        </div>
                    </Fragment>
                ) : (
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
    settingid: "temperatures",
}

export { TemperaturesPanel, TemperaturesPanelElement, TemperaturesControls }
