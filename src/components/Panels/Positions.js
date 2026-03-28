/*
Positions.js - ESP3D WebUI component file

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
import { useState } from "preact/hooks"
import { Crosshair, ChevronDown, RotateCcw } from "preact-feather"
import { T } from "../Translations"
import { ContainerHelper, PanelHeader } from "../Controls"
import { PositionsControls } from "./Jog"
import { useTargetContext, iconsTarget } from "../../targets"
import { useUiContext, useUiContextFn } from "../../contexts"
import { useHttpFn } from "../../hooks"
import { espHttpURL } from "../Helpers"

/*
 * Local const
 *
 */
const sfPresets = (pos) => {
    const setting = ["fanpresets", "flowratepresets", "speedpresets"]
    if (setting[pos] == undefined) return []
    const list = useUiContextFn.getValue(setting[pos])
    return list ? list.split(";").filter(Boolean).map((s) => s.trim()) : []
}

const sfCommand = (pos, index, value) => {
    const setting = ["fancmd", "flowratecmd", "speedcmd"]
    if (setting[pos] == undefined) return ""
    const cmd = useUiContextFn.getValue(setting[pos])
    return cmd ? cmd.replace("#", index).replace("$", value) : ""
}

const sfMinMax = (pos) => {
    const setting = ["fanpresets", "flowratepresets", "speedpresets"]
    if (setting[pos] == undefined) return { min: 0, max: 100 }
    const el = useUiContextFn.getElement(setting[pos])
    return el ? { min: parseInt(el.min) || 0, max: parseInt(el.max) || 100 } : { min: 0, max: 100 }
}

// pos=0 fan, pos=1 flow, pos=2 speed
const sfMeta = [
    { labelKey: "P31", icon: "Fan",      resetVal: 0   },
    { labelKey: "P30", icon: "FlowRate", resetVal: 100 },
    { labelKey: "P12", icon: "FeedRate", resetVal: 100 },
]

// Single card with built-in index selector for fan/flow
const SFCard = ({ pos, dataList, count }) => {
    const { toasts } = useUiContext()
    const { createNewRequest } = useHttpFn
    const [selIndex, setSelIndex] = useState(0)
    const [inputVal, setInputVal] = useState("100")
    const [dropOpen, setDropOpen] = useState(false)
    const [idxDropOpen, setIdxDropOpen] = useState(false)

    const meta = sfMeta[pos]
    const presets = sfPresets(pos)
    const { min, max } = sfMinMax(pos)
    const currentVal = dataList[selIndex]
    const isValid = () => {
        const v = parseFloat(inputVal)
        return !isNaN(v) && v >= min && v <= max
    }

    const sendCommand = (cmd) => {
        if (!cmd) return
        createNewRequest(
            espHttpURL("command", { cmd }),
            { method: "GET", echo: cmd },
            {
                onSuccess: () => {},
                onFail: (err) => toasts.addToast({ content: err, type: "error" }),
            }
        )
    }

    const doSend = (val) => sendCommand(sfCommand(pos, selIndex, val))

    return (
        <div class="sf-card">
            <div class="sf-header">
                {count > 1 ? (
                    <div
                        class="temp-preset-dropdown sf-label-dropdown"
                        tabIndex={-1}
                        onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget))
                                setIdxDropOpen(false)
                        }}
                    >
                        <button
                            class={"sf-label-btn" + (idxDropOpen ? " active" : "")}
                            onclick={() => setIdxDropOpen(!idxDropOpen)}
                        >
                            {iconsTarget[meta.icon]}
                            {T(meta.labelKey)}
                            <span class="sf-label-idx">{selIndex + 1}</span>
                            <ChevronDown size="0.65em" />
                        </button>
                        {idxDropOpen && (
                            <div class="temp-preset-list">
                                {Array.from({ length: count }, (_, i) => (
                                    <button
                                        class="temp-preset-item"
                                        onclick={() => {
                                            setSelIndex(i)
                                            setIdxDropOpen(false)
                                        }}
                                    >
                                        {T(meta.labelKey)} {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <span class="sf-label">
                        {iconsTarget[meta.icon]}
                        {T(meta.labelKey)}
                    </span>
                )}
                <div class="sf-current-wrap">
                    <span class="sf-current">{currentVal ?? "—"}</span>
                    <span class="sf-unit">%</span>
                </div>
            </div>
            <div class="sf-input-row">
                <button
                    class="sf-reset-btn tooltip tooltip-top"
                    data-tooltip={meta.resetVal + "%"}
                    onclick={(e) => {
                        useUiContextFn.haptic()
                        e.target.blur()
                        const v = String(meta.resetVal)
                        setInputVal(v)
                        doSend(v)
                    }}
                >
                    <RotateCcw size="0.8em" />
                </button>
                <div class="jog-step-wrap">
                    <input
                        class="temp-input sf-input"
                        type="number"
                        min={min}
                        max={max}
                        step="1"
                        value={inputVal}
                        onInput={(e) => setInputVal(e.target.value)}
                    />
                    <span class="jog-step-unit">%</span>
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
                    class={"btn btn-primary sf-set-btn" + (!isValid() ? " d-invisible" : "")}
                    onclick={(e) => {
                        useUiContextFn.haptic()
                        e.target.blur()
                        doSend(inputVal)
                    }}
                >
                    {T("S43")}
                </button>
            </div>
        </div>
    )
}

const PositionsPanel = () => {
    const id = "positionsPanel"
    const { temperatures, flowRate, feedRate, fanSpeed } = useTargetContext()
    console.log(id)

    const showSpeed = useUiContextFn.getValue("showspeedctrls")
    const showFlow  = useUiContextFn.getValue("showflowratectrls")
    const showFan   = useUiContextFn.getValue("showfanctrls")

    const hasExtras = showSpeed || showFlow || showFan

    return (
        <div class="panel panel-dashboard" id={id}>
            <ContainerHelper id={id} />
            <PanelHeader
                id={id}
                icon={<Crosshair />}
                title={T("S116")}
            />
            <div class="panel-body panel-body-dashboard">
                <PositionsControls />
                {hasExtras && temperatures["T"].length > 0 && (
                    <div class="sf-cards">
                        {showSpeed && (
                            <SFCard pos={2} dataList={feedRate.current} count={1} />
                        )}
                        {showFlow && (
                            <SFCard pos={1} dataList={flowRate.current} count={temperatures["T"].length} />
                        )}
                        {showFan && (
                            <SFCard pos={0} dataList={fanSpeed.current} count={temperatures["T"].length} />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

const PositionsPanelElement = {
    id: "positionsPanel",
    content: <PositionsPanel />,
    name: "S116",
    icon: "Crosshair",
    show: "showpositionspanel",
    onstart: "openpositionsonstart",
    settingid: "positions",
}

export { PositionsPanel, PositionsPanelElement }
