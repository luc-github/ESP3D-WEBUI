/*
 StatusCNC.js - ESP3D WebUI component file

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
import { useRef } from "preact/hooks"
import { useUiContext, useUiContextFn } from "../../contexts"
import { useTargetContext, variablesList } from "../../targets"
import { ButtonImg, Button, FullScreenButton, CloseButton, ContainerHelper } from "../Controls"
import { useHttpFn } from "../../hooks"
import { espHttpURL, replaceVariables } from "../Helpers"
import {
    Layers,
    Unlock,
    RefreshCcw,
    Moon,
    Play,
    Pause,
    PauseCircle,
    PlayCircle,
    StopCircle,
    CheckCircle,
} from "preact-feather"

/*
 * Local const
 *
 */

const StatusControls = () => {
    const { status, message, alarmCode, errorCode, streamStatus } =
        useTargetContext()
    if (!useUiContextFn.getValue("showstatuspanel")) return null
    return (
        <Fragment>
            {status.state && (
                <div class="status-ctrls">
                    <div
                        class="extra-control mt-1 tooltip tooltip-bottom"
                        data-tooltip={T("CN34")}
                    >
                        <div
                            class={`extra-control-header big-text ${
                                status.state == "Alarm" ||
                                status.state == "Error"
                                    ? "text-light bg-error"
                                    : (status.state == "Door") |
                                        (status.state == "Hold")
                                      ? "text-light bg-warning"
                                      : status.state == "Sleep"
                                        ? "text-light bg-dark"
                                        : ""
                            }`}
                        >
                            {T(status.state)}
                        </div>
                        {streamStatus.status && (
                            <div class="extra-control-value">
                                {T(streamStatus.status)}
                                {streamStatus.name
                                    ? ` (${streamStatus.type}) ${
                                          streamStatus.name
                                      } ${
                                          streamStatus.total
                                              ? (
                                                    (streamStatus.processed /
                                                        streamStatus.total) *
                                                    100
                                                ).toFixed(0)
                                              : streamStatus.processed
                                      }%`
                                    : ""}
                            </div>
                        )}
                        {streamStatus.code && (
                            <div class="extra-control-value text-error">
                                {T("S22")}
                                {": " + streamStatus.code}
                            </div>
                        )}
                        {status.code && (
                            <div class="extra-control-value">
                                {T(status.state + ":" + status.code)}
                            </div>
                        )}
                        {message && (
                            <div class="extra-control-value">{T(message)}</div>
                        )}
                        {(alarmCode != 0 || errorCode != 0) && (
                            <div class="extra-control-value text-error">
                                {T(
                                    alarmCode != 0
                                        ? "ALARM:" + alarmCode
                                        : "error:" + errorCode
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Fragment>
    )
}

const StatusPanel = () => {
    const { toasts } = useUiContext()
    const { status, states, pinsStates, streamStatus } = useTargetContext()
    const { createNewRequest } = useHttpFn
    const id = "statusPanel"
    const buttonsList = [
        {
            name: "CN40",
            buttons: [
                {
                    cmd: "$X",
                    icon: <Unlock />,
                    desc: T("CN42"),
                },
                {
                    cmd: "#SOFTRESET#",
                    icon: <RefreshCcw />,
                    desc: T("CN41"),
                },
                {
                    cmd: "$SLP",
                    icon: <Moon />,
                    desc: T("CN43"),
                },
                {
                    cmd: "#FEEDHOLD#",
                    icon: <Pause />,
                    desc: T("Hold"),
                    depend: [
                        "Door",
                        "Sleep",
                        "Alarm",
                        "Error",
                        "Check",
                        "Run",
                        "Idle",
                        "Home",
                        "Jog",
                        "Tool",
                        "?",
                    ],
                },
                {
                    cmd: "#CYCLESTART#",
                    icon: <Play />,
                    desc: T("CN61"),
                    depend: ["Hold", "Tool"],
                },
            ],
        },
        {
            name: "S204",
            depend: () => {
                return streamStatus.status != "no stream" || streamStatus.code
            },
            buttons: [
                {
                    cmd: "[ESP701]action=PAUSE",
                    icon: <PauseCircle />,
                    desc: T("S184"),
                    depend: () => {
                        return streamStatus.status == "processing"
                    },
                },
                {
                    cmd: "[ESP701]action=RESUME",
                    icon: <PlayCircle />,
                    desc: T("CN61"),
                    depend: () => {
                        return streamStatus.status == "pause"
                    },
                },
                {
                    cmd: "[ESP701]action=ABORT",
                    icon: <StopCircle />,
                    desc: T("S205"),
                    depend: () => {
                        return streamStatus.status != "no stream"
                    },
                },
                {
                    cmd: "[ESP701]action=CLEAR_ERROR",
                    icon: <CheckCircle />,
                    desc: T("S206"),
                    depend: () => {
                        return streamStatus.code
                    },
                },
            ],
        },
    ]

    console.log("Status panel")
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

    return (
        <div class="panel panel-dashboard" id={id}>
            <ContainerHelper id={id} /> 
            <div class="navbar">
                <span class="navbar-section feather-icon-container">
                    <Layers />
                    <strong class="text-ellipsis">{T("CN34")}</strong>
                </span>
                <span class="navbar-section">
                    <span class="full-height">
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
            <div class="panel-body panel-body-dashboard">
                <StatusControls />
                {pinsStates && Object.keys(pinsStates).length > 0 && (
                    <fieldset class="fieldset-top-separator fieldset-bottom-separator field-group">
                        <legend>
                            <label class="m-1 buttons-bar-label">
                                {T("CN92")}
                            </label>
                        </legend>
                        <div class="field-group-content maxwidth">
                            <div class="states-buttons-container">
                                {Object.keys(pinsStates).map((pin) => {
                                    return (
                                        <div
                                            class={`badge-container m-1 s-circle ${
                                                pinsStates[pin]
                                                    ? "bg-primary"
                                                    : "bg-secondary"
                                            }`}
                                        >
                                            <div
                                                class={`badge-label m-1 s-circle ${
                                                    pinsStates[pin]
                                                        ? "bg-primary text-white"
                                                        : "bg-secondary text-primary"
                                                }`}
                                            >
                                                {pin}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </fieldset>
                )}

                {states &&
                    Object.keys(states).length > 0 &&
                    states["motion_mode"] &&
                    variablesList.modes && (
                        <fieldset class="fieldset-top-separator fieldset-bottom-separator field-group">
                            <legend>
                                <label class="m-1 buttons-bar-label">
                                    {T("CN44")}
                                </label>
                            </legend>
                            <div class="field-group-content maxwidth">
                                <div class="states-buttons-container">
                                    {variablesList.modes.map((element) => {
                                        if (states[element.id]) {
                                            if (Array.isArray(states[element.id])) {
                                                return states[element.id].map((item) => {
                                                    return(
                                                        <Button
                                                            m1
                                                            tooltip
                                                            data-tooltip={T(
                                                                item.value
                                                            )}
                                                            onClick={(e) => {
                                                                useUiContextFn.haptic()
                                                                e.target.blur()
                                                                //TBD if need to change value from here
                                                            }}
                                                        >
                                                            {item.pre
                                                                ? item.pre
                                                                : null}
                                                            {item.value}
                                                        </Button>
                                                    )
                                                })
                                            } else
                                            return (
                                                <Button
                                                    m1
                                                    tooltip
                                                    data-tooltip={T(
                                                        element.label
                                                    )}
                                                    onClick={(e) => {
                                                        useUiContextFn.haptic()
                                                        e.target.blur()
                                                        //TBD if need to change value from here
                                                    }}
                                                >
                                                    {element.pre
                                                        ? element.pre
                                                        : null}
                                                    {states[element.id].value}
                                                </Button>
                                            )
                                        }
                                    })}
                                </div>
                            </div>
                        </fieldset>
                    )}
                {buttonsList.map((list) => {
                    if (list.depend) {
                        if (list.depend) {
                            if (typeof list.depend === "function") {
                                if (!list.depend()) {
                                    return
                                }
                            } else if (!list.depend.includes(status.state))
                                return
                        }
                    }
                    return (
                        <fieldset class="fieldset-top-separator fieldset-bottom-separator field-group">
                            <legend>
                                <label class="m-1 buttons-bar-label">
                                    {T(list.name)}
                                </label>
                            </legend>
                            <div class="field-group-content maxwidth">
                                <div class="status-buttons-container">
                                    {list.buttons.map((button) => {
                                        if (button.depend) {
                                            if (
                                                typeof button.depend ===
                                                "function"
                                            ) {
                                                if (!button.depend()) {
                                                    return
                                                }
                                            } else if (
                                                !button.depend.includes(
                                                    status.state
                                                )
                                            )
                                                return
                                        }
                                        return (
                                            <ButtonImg
                                                icon={button.icon}
                                                tooltip
                                                data-tooltip={T(button.desc)}
                                                onClick={(e) => {
                                                    useUiContextFn.haptic()
                                                    e.target.blur()
                                                    sendCommand(button.cmd)
                                                }}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        </fieldset>
                    )
                })}
            </div>
        </div>
    )
}

const StatusPanelElement = {
    id: "statusPanel",
    content: <StatusPanel />,
    name: "CN34",
    icon: "Layers",
    show: "showstatuspanel",
    onstart: "openstatusonstart",
    settingid: "status",
}

export { StatusPanel, StatusPanelElement, StatusControls }
