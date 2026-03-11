/*
 Status.js - ESP3D WebUI component file

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
import { useRef } from "preact/hooks"
import { T } from "../Translations"
import { Layers, PlayCircle, PauseCircle, StopCircle } from "preact-feather"
import { useUiContext, useUiContextFn } from "../../contexts"
import { useTargetContext } from "../../targets"
import { ButtonImg, FullScreenButton, CloseButton, ContainerHelper } from "../Controls"
import { useHttpFn } from "../../hooks"
import { espHttpURL } from "../Helpers"

const TimeControl = ({ label, time }) => {
    if (!time) return null
    time.day = time.day ? time.day.toString() : "0"
    time.hour = time.hour ? time.hour.toString() : "0"
    time.min = time.min ? time.min.toString() : "0"
    time.sec = time.sec ? time.sec.toString() : "0"
    if (time.day == "Infinity") return null
    return (
        <div class="extra-control-value flex-row-between">
            <div class="m-1">{T(label)}:</div>
            {time.day != "0" && (
                <div class="m-1">
                    {time.day}
                    {T("P108")}
                </div>
            )}
            {(time.day != "0" || time.hour != "0") && (
                <div class="m-1">
                    {time.hour}
                    {T("P109")}
                </div>
            )}
            {(time.day != "0" || time.hour != "0" || time.min != "0") && (
                <div class="m-1">
                    {time.min}
                    {T("P110")}
                </div>
            )}
            {time.sec && (
                <div class="m-1">
                    {time.sec}
                    {T("P111")}
                </div>
            )}
        </div>
    )
}

/*
 * Local const
 *
 */

const StatusControls = () => {
    const { streamStatus, status } = useTargetContext()
    if (!useUiContextFn.getValue("showstatuspanel")) return null
    //console.log("streamStatus")
    //console.log(streamStatus)
    //console.log("status")
    //console.log(status)
    return (
        <Fragment>
            {streamStatus &&
                streamStatus.status &&
                streamStatus.status != "no stream" && (
                    <div class="status-ctrls">
                        <div
                            class="extra-control mt-1 tooltip tooltip-bottom"
                            data-tooltip={T("P97")}
                        >
                            <div class="extra-control-header">
                                {T(streamStatus.status)}
                            </div>
                            {streamStatus.name &&
                                streamStatus.name.length > 0 && (
                                    <div class="extra-control-value m-1">
                                        {streamStatus.name}
                                    </div>
                                )}
                            {streamStatus &&
                                streamStatus.status &&
                                streamStatus.status != "no stream" && (
                                    <Fragment>
                                        <div class="extra-control-value">
                                            {streamStatus.progress}%
                                        </div>

                                        <TimeControl
                                            label="P105"
                                            time={streamStatus.printTime}
                                        />
                                        <TimeControl
                                            label="P112"
                                            time={streamStatus.printLeftTime}
                                        />
                                    </Fragment>
                                )}
                        </div>
                    </div>
                )}
            {status.state && status.state.length > 0 && (
                <div class="status-ctrls">
                    <div
                        class="status-control mt-1 tooltip tooltip-bottom"
                        data-tooltip={T("P67")}
                    >
                        <div class="status-control-header">{T("P67")}</div>
                        <div class="status-control-value">{status.state}</div>
                    </div>
                </div>
            )}
            {status.printState && status.printState.status != "Unknown" && (
                <div class="status-ctrls">
                    <div
                        class="extra-control mt-1 tooltip tooltip-bottom"
                        data-tooltip={T("P97")}
                    >
                        <div class="extra-control-header">
                            {status.printState.status}
                        </div>
                        {status.filename && status.filename.length > 0 && (
                            <div class="extra-control-value">
                                {status.filename}
                            </div>
                        )}
                        {status.printState.printing &&
                            status.printState.progress != "NaN" && (
                                    <Fragment>
                                        <div class="extra-control-value">
                                            {status.printState.progress}%
                                        </div>

                                        <TimeControl
                                            label="P105"
                                            time={status.printTime}
                                        />
                                        <TimeControl
                                            label="P112"
                                            time={status.printLeftTime}
                                        />
                                    </Fragment>
                                )}
                    </div>
                </div>
            )}
        </Fragment>
    )
}

const StatusPanel = () => {
    const { toasts, panels } = useUiContext()
    const { status, streamStatus } = useTargetContext()
    //console.log(status, streamStatus)
    const { createNewRequest } = useHttpFn
    const id = "statusPanel"

    const deviceList = [
        {
            name: "S190",
            depend: ["sd"],
            buttons: [
                {
                    cmd: () => {
                        if (status.printState && status.printState.printing) {
                            return "sdresumecmd"
                        }
                        return "[ESP701]RESUME"
                    },
                    depend: { streamStatus: ["pause"], status: [] },
                    icon: <PlayCircle />,
                    desc: T("P99"),
                },
                {
                    cmd: () => {
                        if (status.printState && status.printState.printing) {
                            return "sdpausecmd"
                        }
                        return "[ESP701]PAUSE"
                    },
                    depend: { streamStatus: ["processing"], status: [] },
                    icon: <PauseCircle />,
                    desc: T("P98"),
                },
                {
                    cmd: () => {
                        if (status.printState && status.printState.printing) {
                            return "sdstopcmd"
                        }
                        return "[ESP701]ABORT"
                    },
                    icon: <StopCircle />,
                    desc: T("P100"),
                },
            ],
        },
        {
            name: "S188",
            depend: ["tftsd"],
            buttons: [
                {
                    cmd: () => {
                        return "tftsdresumecmd"
                    },
                    icon: <PlayCircle />,
                    desc: T("P99"),
                },
                {
                    cmd: () => {
                        "tftsdpausecmd"
                    },
                    icon: <PauseCircle />,
                    desc: T("P98"),
                },
                {
                    cmd: () => {
                        "tftsdstopcmd"
                    },
                    icon: <StopCircle />,
                    desc: T("P100"),
                },
            ],
        },
        {
            name: "S189",
            depend: ["tftusb"],
            buttons: [
                {
                    cmd: () => {
                        "tftusbresumecmd"
                    },
                    icon: <PlayCircle />,
                    desc: T("P99"),
                },
                {
                    cmd: () => {
                        "tftusbpausecmd"
                    },
                    icon: <PauseCircle />,
                    desc: T("P98"),
                },
                {
                    cmd: () => {
                        "tftusbstopcmd"
                    },
                    icon: <StopCircle />,
                    desc: T("P100"),
                },
            ],
        },
    ]

    console.log("Status panel")
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
    const isVisible = (button) => {
        if (button.depend) {
            if (
                streamStatus &&
                streamStatus.status &&
                button.depend.streamStatus
            ) {
                if (!button.depend.streamStatus.includes(streamStatus.status)) {
                    return false
                }
            }
        }
        return true
    }
    return (
        <div class="panel panel-dashboard" id={id}>
            <ContainerHelper id={id} /> 
            <div class="navbar">
                <span class="navbar-section feather-icon-container">
                    <Layers />
                    <strong class="text-ellipsis">{T("P97")}</strong>
                </span>
                <span class="navbar-section">
                    <span class="full-height">
                        <FullScreenButton
                            elementId={id}/>
                        <CloseButton
                            elementId={id}
                            hideOnFullScreen={true}
                        />
                    </span>
                </span>
            </div>
            <div class="panel-body panel-body-dashboard">
                <StatusControls />
                {((status.printState && status.printState.printing) ||
                    (streamStatus &&
                        streamStatus.status &&
                        streamStatus.status != "no stream" &&
                        streamStatus.name != "")) &&
                    deviceList.map((device) => {
                        if (
                            !device.depend.every((d) =>
                                useUiContextFn.getValue(d)
                            )
                        )
                            return null
                        return (
                            <fieldset class="fieldset-top-separator fieldset-bottom-separator field-group">
                                <legend>
                                    <label class="m-1">{T(device.name)}</label>
                                </legend>
                                <div class="field-group-content maxwidth">
                                    <div class="print-buttons-container">
                                        {device.buttons.map((button) => {
                                            if (!isVisible(button)) return null
                                            return (
                                                <ButtonImg
                                                    icon={button.icon}
                                                    tooltip
                                                    data-tooltip={T(
                                                        button.desc
                                                    )}
                                                    onClick={(e) => {
                                                        useUiContextFn.haptic()
                                                        e.target.blur()
                                                        console.log(
                                                            button.cmd()
                                                        )
                                                        const cmd =
                                                            status.printState &&
                                                            status.printState
                                                                .printing
                                                                ? useUiContextFn.getValue(
                                                                      button.cmd()
                                                                  )
                                                                : button.cmd()
                                                        const cmds =
                                                            cmd.split("\n")
                                                        cmds.forEach((cmd) => {
                                                            sendCommand(cmd)
                                                        })
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
    name: "P97",
    icon: "Layers",
    show: "showstatuspanel",
    onstart: "openstatusonstart",
    settingid: "status",
}

export { StatusPanel, StatusPanelElement, StatusControls }
