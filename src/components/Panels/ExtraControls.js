/*
 ExtraControls.js - ESP3D WebUI component file

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
import { T } from "../Translations"
import { Sliders, ChevronDown, RotateCcw, Send, Sunset } from "preact-feather"
import { useUiContext, useUiContextFn } from "../../contexts"
import { useTargetContext, iconsTarget } from "../../targets"
import {
    ButtonImg,
    Field,
    Loading,
    PanelHeader,
    ContainerHelper,
} from "../Controls"
import { useHttpFn } from "../../hooks"
import { espHttpURL } from "../Helpers"

/*
 * Local const
 *
 */
/*for fan, flowrate, speed
/*each element has current, min, max
/*like
/*[
    [{current:0, min:0, max:100}, {current:0, min:0, max:100}],
    [{current:100, min:1, max:300}, {current:100, min:1, max:300}],
    [{current:100, min:1, max:300}]
]
*/
const target_values = [[], [], []]

const isVisible = (pos) => {
    const setting = ["showfanctrls", "showflowratectrls", "showspeedctrls"]

    return setting[pos] != undefined
        ? useUiContextFn.getValue(setting[pos])
        : false
}

const presetList = (pos) => {
    const setting = ["fanpresets", "flowratepresets", "speedpresets"]
    if (setting[pos] != undefined) {
        const list = useUiContextFn.getValue(setting[pos])
        if (list)
            return list.split(";").map((item) => {
                return { display: item + "%", value: item }
            })
    }
    return ""
}

const controlCommand = (pos, index, value) => {
    const setting = ["fancmd", "flowratecmd", "speedcmd"]

    if (setting[pos] != undefined) {
        const cmd = useUiContextFn.getValue(setting[pos])
        if (cmd)
            return cmd
                .replace("#", index)
                .replace("$", pos == 0 ? (parseInt(value) * 255) / 100 : value)
    }
    return ""
}

const controlMinMax = (pos) => {
    const setting = ["fanpresets", "flowratepresets", "speedpresets"]
    if (setting[pos] != undefined) {
        const element = useUiContextFn.getElement(setting[pos])
        if (element) return { min: element.min, max: element.max }
    }
    return ""
}

const ExtraControls = () => {
    const { temperatures, fanSpeed, flowRate, feedRate, sensor } =
        useTargetContext()
    if (
        !(
            useUiContextFn.getValue("showfanctrls") ||
            useUiContextFn.getValue("showflowratectrls") ||
            useUiContextFn.getValue("showfeedratectrls") ||
            useUiContextFn.getValue("showsensorctrls")
        )
    )
        return null
    return (
        <div class="extra-ctrls">
            {useUiContextFn.getValue("showfanctrls") &&
                fanSpeed.current.map((element, index) => {
                    const desc =
                        T("P31") +
                        (temperatures["T"].length > 1 ? index + 1 : "")
                    if (typeof element != "undefined")
                        return (
                            <div
                                class="extra-control mt-1 tooltip tooltip-bottom"
                                data-tooltip={desc}
                            >
                                <div class="extra-control-header">{desc}</div>
                                <div class="extra-control-value">{element}</div>
                            </div>
                        )
                })}
            {useUiContextFn.getValue("showflowratectrls") &&
                flowRate.current.map((element, index) => {
                    const desc =
                        T("P30") +
                        (temperatures["T"].length > 1 ? index + 1 : "")
                    if (typeof element != "undefined")
                        return (
                            <div
                                class="extra-control mt-1 tooltip tooltip-bottom"
                                data-tooltip={desc}
                            >
                                <div class="extra-control-header">{desc}</div>
                                <div class="extra-control-value">{element}</div>
                            </div>
                        )
                })}
            {useUiContextFn.getValue("showspeedctrls") &&
                feedRate.current.map((element, index) => {
                    const desc =
                        T("P12") +
                        (feedRate.current.length > 1 ? index + 1 : "")
                    if (typeof element != "undefined")
                        return (
                            <div
                                class="extra-control mt-1 tooltip tooltip-bottom"
                                data-tooltip={desc}
                            >
                                <div class="extra-control-header">{desc}</div>
                                <div class="extra-control-value">{element}</div>
                            </div>
                        )
                })}
            {useUiContextFn.getValue("showsensorctrls") &&
                sensor.S.map((element, index) => {
                    return (
                        <div
                            class="extra-control mt-1 tooltip tooltip-bottom"
                            data-tooltip={
                                T("sensor") + " (" + element.unit + ")"
                            }
                        >
                            <div class="extra-control-header">
                                {element.unit}
                            </div>
                            <div class="extra-control-value">
                                {element.value}
                            </div>
                        </div>
                    )
                })}
        </div>
    )
}

const ExtraInputControl = ({ element, index, size, pos }) => {
    if (!isVisible(pos)) return null
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
    const [validation, setvalidation] = useState({
        message: null,
        valid: true,
        modified: false,
    })
    //Sanity check
    //value
    if (typeof target_values[pos][index] == "undefined") {
        target_values[pos][index] = {}
        target_values[pos][index].current =
            typeof element.list.current[index] == "undefined" ||
            element.list.current[index] == -1
                ? pos == 0
                    ? 0
                    : 100
                : element.list.current[index]
    }
    if (typeof target_values[pos][index].min == "undefined") {
        const minmax = controlMinMax(pos)
        if (minmax) {
            target_values[pos][index].min = parseInt(minmax.min)
            target_values[pos][index].max = parseInt(minmax.max)
        }
    }
    const boundaries = controlMinMax(pos)
    const generateValidation = (tool, index) => {
        let validation = {
            message: null,
            valid: true,
            modified: false,
        }
        if (
            target_values[tool][index].current.length == 0 ||
            target_values[tool][index].current <
                target_values[tool][index].min ||
            target_values[tool][index].current > target_values[tool][index].max
        ) {
            //No error message to keep all control aligned
            //may be have a better way ?
            // validation.message = T("S42");
            validation.valid = false
        }

        return validation
    }
    return (
        <div class="extra-ctrls-container m-1">
            <div class="extra-ctrl-name">
                {T(element.name)
                    .replace("$", size > 1 ? index + 1 : "")
                    .trim()}
            </div>
            <div class="extra-ctrls-container2">
                <div>
                    <Field
                        id={"input-extra-" + pos + "-" + index}
                        type="number"
                        value={target_values[pos][index].current}
                        min={boundaries.min}
                        step="1"
                        max={boundaries.max}
                        width="4rem"
                        extra="dropList"
                        options={presetList(pos)}
                        setValue={(val, update) => {
                            if (!update) {
                                target_values[pos][index].current = val
                            }
                            setvalidation(generateValidation(pos, index))
                        }}
                        validation={validation}
                    />
                </div>
                <ButtonImg
                    id={"btn-send-extra-" + pos + "-" + index}
                    class={`extra-ctrl-send ${
                        !validation.valid ? "d-invisible" : ""
                    }`}
                    icon={<Send />}
                    tooltip
                    data-tooltip={T("S43")}
                    onClick={(e) => {
                        useUiContextFn.haptic()
                        e.target.blur()
                        const cmds = controlCommand(
                            pos,
                            index,
                            target_values[pos][index].current
                        ).split(";")
                        cmds.forEach((cmd) => {
                            sendCommand(cmd)
                        })
                        element.list.current[index] =
                            target_values[pos][index].current
                    }}
                />
            </div>
        </div>
    )
}

const SensorCard = () => {
    const { sensor } = useTargetContext()
    if (!sensor.S || sensor.S.length === 0) return null
    return (
        <div class="sensor-card-wrap">
            <div class="temp-grid">
                <div class="temp-cell">
                    <div class="temp-header">
                        <div class="temp-label">
                            <Sunset size="0.75em" />
                            {T("sensor")}
                        </div>
                        <div class="temp-dot cool" />
                    </div>
                    {sensor.S.map((s) => (
                        <div class="sensor-reading">
                            <span class="sensor-value">{s.value}</span>
                            <span class="temp-unit">{s.unit}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// pos=0 fan, pos=1 flow, pos=2 speed
const sfMeta = [
    { labelKey: "P31", icon: "Fan",      resetVal: 0   },
    { labelKey: "P30", icon: "FlowRate", resetVal: 100 },
    { labelKey: "P12", icon: "FeedRate", resetVal: 100 },
]

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
                    <div class="sf-label-wrap">
                        <span class="sf-label-icon">{iconsTarget[meta.icon]}</span>
                        <div
                            class="temp-preset-dropdown"
                            tabIndex={-1}
                            onBlur={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget))
                                    setIdxDropOpen(false)
                            }}
                        >
                            <button
                                class={"temp-preset-toggle sf-label-toggle" + (idxDropOpen ? " active" : "")}
                                onclick={() => setIdxDropOpen(!idxDropOpen)}
                            >
                                {T(meta.labelKey) + " " + (selIndex + 1)}
                                <ChevronDown size="0.7em" />
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
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
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
                    class={"temp-set-btn sf-set-btn" + (!isValid() ? " d-invisible" : "")}
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

const ExtraControlsPanel = () => {
    const { temperatures, flowRate, feedRate, fanSpeed, sensor } = useTargetContext()
    const id = "extraControlsPanel"

    const showSpeed = useUiContextFn.getValue("showspeedctrls")
    const showFlow  = useUiContextFn.getValue("showflowratectrls")
    const showFan   = useUiContextFn.getValue("showfanctrls")
    const showSensor = useUiContextFn.getValue("showsensorctrls")

    const hasContent = showSpeed || showFlow || showFan || showSensor

    return (
        <div class="panel panel-dashboard" id={id}>
            <ContainerHelper id={id} />
            <PanelHeader
                id={id}
                icon={<Sliders />}
                title={T("P96")}
            />
            <div class="panel-body panel-body-dashboard">
                {hasContent ? (
                    <Fragment>
                        {(showSpeed || showFlow || showFan) && temperatures["T"].length > 0 && (
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
                        {showSensor && <SensorCard />}
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

const ExtraControlsPanelElement = {
    id: "extraControlsPanel",
    content: <ExtraControlsPanel />,
    name: "P96",
    icon: "Sliders",
    show: "showextracontrolspanel",
    onstart: "openextracontrolsonstart",
    settingid: "controls",
}

export { ExtraControls, ExtraInputControl, ExtraControlsPanel, ExtraControlsPanelElement }
