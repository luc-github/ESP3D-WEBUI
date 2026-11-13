/*
ToolChangeCNC.js - ESP3D WebUI component file

 Copyright (c) 2026 Luc LEBOSSE. All rights reserved.

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.
 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.
 You should have received a copy of the GNU Lesser General Public
 License along with This code; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

import { Fragment, h } from "preact"
import { T } from "../Translations"
import {
    Tool,
    Play,
    Check,
    CheckCircle,
    XCircle,
    Underline,
} from "preact-feather"
import { useUiContext, useUiContextFn } from "../../contexts"
import { useTargetContext, variablesList } from "../../targets"
import { ButtonImg, Field } from "../Controls"
import { PanelShell } from "./"
import { useHttpFn } from "../../hooks"
import { espHttpURL, replaceVariables } from "../Helpers"

/*
 * Local const
 *
 */
const toolNumber = {}
const toolMode = {}

const ToolChangePanel = () => {
    const { toasts } = useUiContext()
    const { status, states } = useTargetContext()
    const { createNewRequest } = useHttpFn
    const id = "ToolChangePanel"

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

    const currentTool =
        states && states.active_tool ? states.active_tool.value : "?"
    //the panel actions are driven by the firmware Tool state,
    //so re-entering the panel while a change is pending resumes the flow
    const isToolState = status.state == "Tool"

    const onStart = (e) => {
        useUiContextFn.haptic()
        e.target.blur()
        if (status.state != "Idle") {
            toasts.addToast({ content: T("CN115"), type: "error" })
            return
        }
        if (toolMode.current == "set") {
            //set current tool number, no movement
            sendCommand("M61Q" + toolNumber.current)
        } else {
            //manual tool change protocol: T<n> M6 -> Tool state -> ack -> finish
            sendCommand("T" + toolNumber.current + " M6")
        }
        //refresh the modal states display
        sendCommand("$G")
    }

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
            {!isToolState && (
                <fieldset class="fieldset-top-separator fieldset-bottom-separator field-group">
                    <div class="field-group-content maxwidth">
                        <div class="states-buttons-container">
                            <Field
                                inline
                                id="toolchangenumber"
                                type="number"
                                label={T("CN117")}
                                min={0}
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
                                disabled={status.state != "Idle"}
                                onclick={onStart}
                            />
                        </div>
                    </div>
                </fieldset>
            )}
            {isToolState && (
                <fieldset class="fieldset-top-separator fieldset-bottom-separator field-group">
                    <div class="field-group-content maxwidth">
                        <div class="states-buttons-container">
                            <ButtonImg
                                m1
                                icon={<Check />}
                                label={T("CN118")}
                                tooltip
                                data-tooltip={T("CN118")}
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    sendCommand("#TOOLCHANGE#")
                                }}
                            />
                            <ButtonImg
                                m1
                                icon={<Underline />}
                                label={T("CN37")}
                                tooltip
                                data-tooltip={T("CN37")}
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    sendCommand("$TPW")
                                }}
                            />
                            <ButtonImg
                                m1
                                icon={<CheckCircle />}
                                label={T("CN119")}
                                tooltip
                                data-tooltip={T("CN119")}
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    sendCommand("#CYCLESTART#")
                                    //refresh the modal states display
                                    sendCommand("$G")
                                }}
                            />
                            <ButtonImg
                                m1
                                icon={<XCircle />}
                                label={T("S28")}
                                tooltip
                                data-tooltip={T("S28")}
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    sendCommand("#SOFTRESET#")
                                }}
                            />
                        </div>
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
