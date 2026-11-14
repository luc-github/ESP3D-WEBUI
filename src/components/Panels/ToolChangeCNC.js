/*
ToolChangeCNC.js - ESP3D WebUI component file

 Copyright (c) 2026 Luc LEBOSSE. All rights reserved.

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
import { useEffect, useRef, useState } from "preact/hooks"
import { T } from "../Translations"
import { Tool, Play, XCircle, Underline, Check } from "preact-feather"
import { useUiContext, useUiContextFn } from "../../contexts"
import { useTargetContext, variablesList } from "../../targets"
import { ButtonImg, Field } from "../Controls"
import { PanelShell } from "./"
import { useHttpFn } from "../../hooks"
import { espHttpURL, replaceVariables } from "../Helpers"
import { processor } from "../../targets/CNC/grblHAL/processor"

/*
 * Local const
 *
 */
const toolNumber = {}
const toolMode = {}
const previousTool = {}

//common flow with the pendant: 60s on MOVING_TO_CHANGE / PROBING /
//COMPLETING, no timeout on WAITING_USER (human driven)
const FLOW_TIMEOUT = 60000
//delay after a soft reset before declaring the alarm lock persistent
const RECOVERY_TIMEOUT = 5000

const ToolChangePanel = () => {
    const { toasts } = useUiContext()
    const { status, states } = useTargetContext()
    const { createNewRequest } = useHttpFn
    const id = "ToolChangePanel"

    //phases, aligned on the pendant state names:
    //idle -> moving -> user -> (probing) -> completing
    //cancel/recovery: cancel-reset -> (cancel-alarm) -> cancel-check -> idle
    const [phase, setPhase] = useState("idle")
    const [tcMode, setTcMode] = useState() //$341 value, undefined = unknown
    const flowTimer = useRef(null)
    const prevState = useRef()
    const statesAtCheck = useRef(null)
    const cancelFromAlarm = useRef(false)

    if (typeof toolNumber.current === "undefined") {
        toolNumber.current = 1
    }
    if (typeof toolMode.current === "undefined") {
        toolMode.current = "change"
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

    const clearFlowTimer = () => {
        if (flowTimer.current) {
            clearTimeout(flowTimer.current)
            flowTimer.current = null
        }
    }
    const armFlowTimer = (fn, ms) => {
        clearFlowTimer()
        flowTimer.current = setTimeout(fn, ms)
    }
    useEffect(() => () => clearFlowTimer(), [])

    //read $341 (tool change mode) once at mount to gate the flow:
    //4 = M6 ignored -> Start blocked, 0 and 3 -> no $TPW, 1 and 2 -> $TPW
    const readToolChangeMode = () => {
        const onFeedback = (feedback) => {
            if (feedback.status == "ok" && feedback.content) {
                const line = feedback.content.find((l) =>
                    l.startsWith("$341=")
                )
                if (line) setTcMode(line.substring(5).trim())
            }
        }
        if (
            processor.startCatchResponse(
                "CMD",
                "eeprom",
                onFeedback,
                null,
                null
            )
        ) {
            sendCommand("$$")
        }
    }

    //refresh the modal states display on mount so active tool is resolved
    useEffect(() => {
        sendCommand("$G")
        readToolChangeMode()
    }, [])

    const failFlow = () => {
        clearFlowTimer()
        toasts.addToast({ content: T("CN124"), type: "error" })
    }

    //cancel / recovery rule (common with the pendant):
    //soft reset, then once back to Idle re-read $G and restore the previous
    //tool with M61Q only if the number actually changed
    const startCancelSequence = () => {
        clearFlowTimer()
        cancelFromAlarm.current =
            status.state == "Alarm" || status.state == "Error"
        setPhase("cancel-reset")
        sendCommand("#SOFTRESET#")
        armFlowTimer(() => {
            //reset did not bring Idle back: alarm lock persists
            toasts.addToast({ content: T("CN127"), type: "error" })
            setPhase("cancel-alarm")
        }, RECOVERY_TIMEOUT)
    }

    const gotoCancelCheck = () => {
        clearFlowTimer()
        statesAtCheck.current = states
        setPhase("cancel-check")
        sendCommand("$G")
        armFlowTimer(() => setPhase("idle"), RECOVERY_TIMEOUT)
    }

    const onFlowTimeout = () => {
        failFlow()
        startCancelSequence()
    }

    const currentTool =
        states && states.active_tool ? states.active_tool.value : "?"
    const isToolState = status.state == "Tool"
    const isErrorState = status.state == "Alarm" || status.state == "Error"

    //main flow, driven by the firmware state
    //note: the 0xA3 acknowledge is sent globally by BackgroundContainer
    //on Tool state entry, so a job streaming M6 is never stuck
    useEffect(() => {
        const s = status.state
        if (phase == "moving") {
            if (s == "Tool") {
                clearFlowTimer()
                setPhase("user")
            } else if (s == "Alarm" || s == "Error") {
                failFlow()
                setPhase("user")
            }
        } else if (phase == "probing") {
            if (s == "Tool" && prevState.current != "Tool") {
                //probe motion done, back to Tool
                clearFlowTimer()
                setPhase("user")
            } else if (s == "Alarm" || s == "Error") {
                failFlow()
                setPhase("user")
            }
        } else if (phase == "completing") {
            if (s == "Idle") {
                clearFlowTimer()
                toasts.addToast({ content: T("CN125"), type: "success" })
                setPhase("idle")
            } else if (s == "Tool") {
                //mode 3: automatic touch off done, another cycle start needed
                clearFlowTimer()
                setPhase("user")
            } else if (s == "Alarm" || s == "Error") {
                failFlow()
                setPhase("user")
            }
        } else if (phase == "user") {
            if (s == "Idle") {
                //completed from the status bar cycle start
                toasts.addToast({ content: T("CN125"), type: "success" })
                setPhase("idle")
            } else if (s == "Alarm" || s == "Error") {
                failFlow()
            }
        } else if (phase == "cancel-reset") {
            if (s == "Idle") {
                gotoCancelCheck()
            } else if (
                (s == "Alarm" || s == "Error") &&
                !cancelFromAlarm.current
            ) {
                //reset during motion raised an alarm: unlock required
                clearFlowTimer()
                toasts.addToast({ content: T("CN127"), type: "error" })
                setPhase("cancel-alarm")
            }
        } else if (phase == "cancel-alarm") {
            if (s == "Idle") gotoCancelCheck()
        }
        prevState.current = s
    }, [status.state, phase])

    //recovery final step: fresh parser state received after the reset,
    //restore the previous tool number only if it actually changed
    useEffect(() => {
        if (phase == "cancel-check" && states !== statesAtCheck.current) {
            clearFlowTimer()
            const current = states.active_tool
                ? states.active_tool.value
                : undefined
            if (
                typeof previousTool.current !== "undefined" &&
                typeof current !== "undefined" &&
                String(current) != String(previousTool.current)
            ) {
                sendCommand("M61Q" + previousTool.current)
            }
            previousTool.current = undefined
            setPhase("idle")
        }
    }, [states, phase])

    const onStart = (e) => {
        useUiContextFn.haptic()
        e.target.blur()
        if (status.state != "Idle") {
            toasts.addToast({ content: T("CN115"), type: "error" })
            return
        }
        if (tcMode == "4") {
            toasts.addToast({ content: T("CN126"), type: "error" })
            return
        }
        if (toolMode.current == "set") {
            //set current tool number, no movement
            sendCommand("M61Q" + toolNumber.current)
        } else {
            //manual tool change protocol: T<n> M6 -> Tool state
            //previous tool is read at Start, not at mount: a job or the
            //other UI may have changed it in between
            previousTool.current = currentTool
            setPhase("moving")
            sendCommand("T" + toolNumber.current + " M6")
            armFlowTimer(onFlowTimeout, FLOW_TIMEOUT)
        }
        //refresh the modal states display
        sendCommand("$G")
    }

    const onProbe = (e) => {
        useUiContextFn.haptic()
        e.target.blur()
        setPhase("probing")
        sendCommand("$TPW")
        armFlowTimer(onFlowTimeout, FLOW_TIMEOUT)
    }

    const onFinish = (e) => {
        useUiContextFn.haptic()
        e.target.blur()
        setPhase("completing")
        sendCommand("#CYCLESTART#")
        armFlowTimer(onFlowTimeout, FLOW_TIMEOUT)
    }

    const onCancel = (e) => {
        useUiContextFn.haptic()
        e.target.blur()
        startCancelSequence()
    }

    const isRecovering = phase == "cancel-reset" || phase == "cancel-alarm" || phase == "cancel-check"
    const showIdleSection = phase == "idle" && !isToolState && !isErrorState
    const canProbe =
        typeof tcMode === "undefined" || tcMode == "1" || tcMode == "2"
    const showFlowButtons =
        isToolState && phase != "moving" && phase != "completing" && !isRecovering

    return (
        <PanelShell id={id} icon={<Tool />} title={T("CN109")}>
            <div class="status-ctrls">
                <div
                    class="extra-control mt-1 tooltip tooltip-bottom"
                    data-tooltip={T("CN58")}
                >
                    <div class="extra-control-header">{T("CN58")}</div>
                    <div class="extra-control-value">{currentTool}</div>
                </div>
            </div>
            {showIdleSection && (
                <fieldset class="fieldset-top-separator fieldset-bottom-separator field-group mt-2">
                    <legend />
                    <div class="field-group-content maxwidth">
                        <div class="states-buttons-container">
                            <Field
                                inline
                                id="toolchangenumber"
                                type="number"
                                label={T("CN117")}
                                min={0}
                                width="4rem"
                                value={toolNumber.current}
                                setValue={(val, update = false) => {
                                    if (!update) toolNumber.current = val
                                }}
                            />
                            <Field
                                inline
                                id="toolchangemode"
                                type="select"
                                label={T("CN91")}
                                options={[
                                    { label: T("CN120"), value: "set" },
                                    { label: T("CN121"), value: "change" },
                                ]}
                                value={toolMode.current}
                                setValue={(val, update = false) => {
                                    if (!update) toolMode.current = val
                                }}
                            />
                            <ButtonImg
                                m1
                                icon={<Play />}
                                label={T("CN109")}
                                tooltip
                                data-tooltip={T("CN109")}
                                disabled={status.state != "Idle" || tcMode == "4"}
                                onclick={onStart}
                            />
                        </div>
                        {tcMode == "4" && (
                            <div class="m-1 text-error">{T("CN126")}</div>
                        )}
                    </div>
                </fieldset>
            )}
            {!showIdleSection && (
                <fieldset class="fieldset-top-separator fieldset-bottom-separator field-group mt-2">
                    <legend />
                    <div class="field-group-content maxwidth">
                        <div class="states-buttons-container">
                            {phase == "probing" && (
                                <div class="m-1">{T("CN123")}</div>
                            )}
                            {showFlowButtons && (
                                <Fragment>
                                    {canProbe && (
                                        <ButtonImg
                                            m1
                                            icon={<Underline />}
                                            label={T("CN122")}
                                            tooltip
                                            data-tooltip={T("CN122")}
                                            onclick={onProbe}
                                        />
                                    )}
                                    <ButtonImg
                                        m1
                                        icon={<Check />}
                                        label={T("CN119")}
                                        tooltip
                                        data-tooltip={T("CN119")}
                                        onclick={onFinish}
                                    />
                                </Fragment>
                            )}
                            {!isRecovering && (
                                <ButtonImg
                                    m1
                                    icon={<XCircle />}
                                    label={T("S28")}
                                    tooltip
                                    data-tooltip={T("S28")}
                                    onclick={onCancel}
                                />
                            )}
                        </div>
                        {showFlowButtons &&
                            canProbe &&
                            (tcMode == "1" || tcMode == "2") && (
                                <div class="m-1">
                                    {T(tcMode == "1" ? "CN128" : "CN129")}
                                </div>
                            )}
                    </div>
                </fieldset>
            )}
        </PanelShell>
    )
}

const ToolChangePanelElement = {
    id: "ToolChangePanel",
    content: <ToolChangePanel />,
    name: "CN109",
    icon: "Tool",
    show: "showtoolpanel",
    onstart: "opentoolonstart",
    settingid: "tool",
}

export { ToolChangePanel, ToolChangePanelElement }
