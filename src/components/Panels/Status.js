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
import { T } from "../Translations"
import { PlayCircle, PauseCircle, StopCircle, Printer } from "preact-feather"
import { useUiContext, useUiContextFn } from "../../contexts"
import { useTargetContext } from "../../targets"
import { ButtonImg } from "../Controls"
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
        <div class="print-time-row">
            <span class="print-time-label">{T(label)}:</span>
            <span class="print-time-value">
                {time.day != "0" && <span>{time.day}{T("P108")} </span>}
                {(time.day != "0" || time.hour != "0") && <span>{time.hour}{T("P109")} </span>}
                {(time.day != "0" || time.hour != "0" || time.min != "0") && <span>{time.min}{T("P110")} </span>}
                {time.sec && <span>{time.sec}{T("P111")}</span>}
            </span>
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

    const isStreaming = streamStatus && streamStatus.status && streamStatus.status != "no stream"
    const hasPrintState = status.printState && status.printState.status != "Unknown"

    if (!isStreaming && !hasPrintState) return null

    const filename = isStreaming ? streamStatus.name : status.filename
    const progress = isStreaming
        ? streamStatus.progress
        : (status.printState.printing && status.printState.progress != "NaN" ? status.printState.progress : null)
    const printTime = isStreaming ? streamStatus.printTime : (status.printState.printing ? status.printTime : null)
    const printLeftTime = isStreaming ? streamStatus.printLeftTime : (status.printState.printing ? status.printLeftTime : null)
    const printStatusLabel = isStreaming ? T(streamStatus.status) : status.printState.status

    return (
        <div class="print-card-wrap">
            <div class="sf-card">
                <div class="sf-header">
                    <div class="sf-label">
                        <Printer size="0.75em" />
                        {T("P97")}
                    </div>
                    <span class="print-state-badge">{printStatusLabel}</span>
                </div>
                {filename && filename.length > 0 && (
                    <div class="print-filename">{filename}</div>
                )}
                {progress != null && (
                    <div class="print-progress-wrap">
                        <div class="print-progress-track">
                            <div
                                class="print-progress-fill"
                                style={`width: ${Math.min(100, Math.max(0, progress))}%`}
                            />
                        </div>
                        <div class="print-pct-wrap">
                            <span class="sf-current">{progress}</span>
                            <span class="sf-unit">%</span>
                        </div>
                    </div>
                )}
                {(printTime || printLeftTime) && (
                    <div class="print-times">
                        <TimeControl label="P105" time={printTime} />
                        <TimeControl label="P112" time={printLeftTime} />
                    </div>
                )}
            </div>
        </div>
    )
}

const StatusButtons = () => {
    const { toasts } = useUiContext()
    const { status, streamStatus } = useTargetContext()
    const { createNewRequest } = useHttpFn

    if (
        !(
            (status.printState && status.printState.printing) ||
            (streamStatus &&
                streamStatus.status &&
                streamStatus.status != "no stream" &&
                streamStatus.name != "")
        )
    )
        return null

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

    const sendCommand = (command) => {
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
    const isVisible = (button) => {
        if (button.depend && streamStatus && streamStatus.status && button.depend.streamStatus) {
            if (!button.depend.streamStatus.includes(streamStatus.status)) return false
        }
        return true
    }
    return (
        <Fragment>
            {deviceList.map((device) => {
                if (!device.depend.every((d) => useUiContextFn.getValue(d))) return null
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
                                            data-tooltip={T(button.desc)}
                                            onClick={(e) => {
                                                useUiContextFn.haptic()
                                                e.target.blur()
                                                const cmd =
                                                    status.printState && status.printState.printing
                                                        ? useUiContextFn.getValue(button.cmd())
                                                        : button.cmd()
                                                cmd.split("\n").forEach(sendCommand)
                                            }}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </fieldset>
                )
            })}
        </Fragment>
    )
}

export { StatusControls, StatusButtons }
