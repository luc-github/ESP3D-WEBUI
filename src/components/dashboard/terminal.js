/*
 terminal.js - ESP3D WebUI terminal file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

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

import { h } from "preact"
import { T } from "../translations"
import { useState, useEffect } from "preact/hooks"
import { initApp } from "../uisettings"
import { globaldispatch, Page, Action } from "../app"
import { Terminal, XCircle, Send } from "preact-feather"
import { SendCommand } from "../http"

/*
 * Local variables
 *
 */
let monitorDataQuiet = []
let monitorDataVerbose = []
let currentOutput = []
let verboseOutput = true
let autoscrollOutput = true
let pauseAutoscroll = false
let visible = false
var commandHistory = []
var commandHistoryIndex = -1

/*
 * Local constants
 *
 */
const MAX_HISTORY_SIZE = 40
const MAX_LINES_MONITOR = 300

/*
 * Update Terminal window
 *
 */
function updateTerminal(data) {
    updateQuietTerminal(data)
    updateVerboseTerminal(data)
    updateContentType()
}

/*
 * Update quiet Terminal window
 *
 */
function updateQuietTerminal(data) {
    if (
        !(
            data.startsWith("wait") ||
            data.startsWith("ok") ||
            data.startsWith("T:")
        )
    ) {
        monitorDataQuiet.push(<div>{data}</div>)
        if (autoscrollOutput && pauseAutoscroll) {
            if (monitorDataQuiet.length > 2 * MAX_LINES_MONITOR)
                monitorDataQuiet = monitorDataQuiet.slice(-MAX_LINES_MONITOR)
        } else {
            monitorDataQuiet = monitorDataQuiet.slice(-MAX_LINES_MONITOR)
        }
    }
}

/*
 * Update Verbose Terminal window
 *
 */
function updateVerboseTerminal(data) {
    monitorDataVerbose.push(<div>{data}</div>)
    if (autoscrollOutput && pauseAutoscroll) {
        if (monitorDataVerbose.length > 2 * MAX_LINES_MONITOR)
            monitorDataVerbose = monitorDataVerbose.slice(-MAX_LINES_MONITOR)
    } else {
        monitorDataVerbose = monitorDataVerbose.slice(-MAX_LINES_MONITOR)
    }
}

/*
 * Update type of content of Terminal window
 *
 */
function updateContentType() {
    if (verboseOutput) currentOutput = monitorDataVerbose
    else currentOutput = monitorDataQuiet
    globaldispatch({
        type: Action.renderAll,
    })
}

/*
 * Terminal Controls
 *
 */
const TerminalControls = ({ visible }) => {
    if (!visible) return null
    const [isVerbose, setVerbose] = useState(verboseOutput)
    const toogleVerbose = e => {
        verboseOutput = e.target.checked
        setVerbose(e.target.checked)
        updateContentType()
    }
    const [isAutoscroll, setAutoscroll] = useState(autoscrollOutput)
    const toogleAutoscroll = e => {
        setAutoscroll(e.target.checked)
        autoscrollOutput = e.target.checked
        if (autoscrollOutput) pauseAutoscroll = false
        doAutoscroll()
    }
    const clearterminal = e => {
        currentOutput = []
        monitorDataQuiet = []
        monitorDataVerbose = []
        updateContentType()
    }
    return (
        <div class="d-flex flex-row">
            <div style="width:2rem" />
            <div class="control-like">
                <label
                    class="checkbox-control"
                    id="checkverbose"
                    title={T("S76")}
                >
                    {T("S76")}
                    <input
                        type="checkbox"
                        checked={isVerbose}
                        onChange={toogleVerbose}
                    />
                    <span class="checkmark"></span>
                </label>
            </div>
            <div style="width:2rem" />
            <div class="control-like">
                <label
                    class="checkbox-control"
                    id="checkautoscroll"
                    title={T("S77")}
                >
                    {T("S77")}
                    <input
                        type="checkbox"
                        checked={isAutoscroll}
                        onChange={toogleAutoscroll}
                    />
                    <span class="checkmark"></span>
                </label>
            </div>
            <div style="width:2rem" />
            <span>
                <button
                    type="button"
                    class="btn btn-secondary"
                    title={T("S79")}
                    onClick={clearterminal}
                >
                    <XCircle />
                    <span class="hide-low text-button nowrap">{T("S78")}</span>
                </button>
            </span>
        </div>
    )
}

/*
 *Send command query error
 */
function sendCommandError(errorCode, responseText) {
    globaldispatch({
        type: Action.error,
        errorcode: errorCode,
        msg: "S5",
    })
}

/*
 *Send command
 *
 */
function sendCommand(cmd) {
    commandHistory.push(cmd)
    commandHistory.slice(-MAX_HISTORY_SIZE)
    commandHistoryIndex = commandHistory.length
    SendCommand(encodeURIComponent(cmd), null, sendCommandError)
}

/*
 *Do autoscroll
 *
 *
 */
function doAutoscroll() {
    if (autoscrollOutput && !pauseAutoscroll) {
        document.getElementById(
            "outputTerminalWindow"
        ).scrollTop = document.getElementById(
            "outputTerminalWindow"
        ).scrollHeight
    }
}

/*
 * Terminal Window
 *
 */
const TerminalWindow = ({ visible }) => {
    if (!visible) return null
    const [command, setCommand] = useState("")
    const onclick = e => {
        if (command.length > 0) {
            sendCommand(command)
            setCommand("")
        }
    }
    const onInput = e => {
        setCommand(e.target.value.trim())
    }
    const onScroll = e => {
        if (e.target.scrollTop + e.target.offsetHeight != e.target.scrollHeight)
            pauseAutoscroll = true
        else pauseAutoscroll = false
    }
    const onKeyUp = e => {
        if (e.keyCode == 13) {
            sendCommand(command)
            setCommand("")
        }

        if (e.keyCode == 38 || e.keyCode == 40) {
            if (
                e.keyCode == 38 &&
                commandHistory.length > 0 &&
                commandHistoryIndex > 0
            ) {
                commandHistoryIndex--
            } else if (
                e.keyCode == 40 &&
                commandHistoryIndex < commandHistory.length - 1
            ) {
                commandHistoryIndex++
            }
            if (
                commandHistoryIndex >= 0 &&
                commandHistoryIndex < commandHistory.length
            ) {
                setCommand(commandHistory[commandHistoryIndex])
            }
        }
    }
    useEffect(() => {
        doAutoscroll()
    }, [currentOutput])
    return (
        <div>
            <div class="controlSpacer" />
            <div class="controlSpacer" />
            <div class="card">
                <div class="card-body">
                    <div class="input-group">
                        <input
                            type="text"
                            class="form-control"
                            onInput={onInput}
                            onkeyup={onKeyUp}
                            value={command}
                            placeholder={T("S80")}
                        />
                        <div class="input-group-append" title={T("S82")}>
                            <button
                                class="btn btn-primary form-control"
                                onClick={onclick}
                                type="button"
                            >
                                <Send />
                                <span class="hide-low text-button">
                                    {T("S81")}
                                </span>
                            </button>
                        </div>
                    </div>
                    <div class="controlSpacer" />
                    <div class="card">
                        <div
                            id="outputTerminalWindow"
                            class="card-body customscroll"
                            style="min-height:200px;max-height:200px; overflow: auto;"
                            onscroll={onScroll}
                        >
                            {currentOutput}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/*
 * Terminal panel
 *
 */
const TerminalPanel = ({ currentState }) => {
    if (currentState.activePage != Page.dashboard) return null
    const [show, showIt] = useState(visible)
    const toogle = e => {
        visible = !show
        showIt(!show)
    }
    let title
    if (show) {
        title = T("S73")
    } else {
        title = T("S75")
    }
    return (
        <div>
            <div class="controlSpacer" />
            <div class="d-flex flex-row no_wrap">
                <button
                    type="button"
                    class="btn btn-dark"
                    title={T("S74")}
                    onClick={toogle}
                >
                    <Terminal />
                    <span class="hide-low text-button">{title}</span>
                </button>
                <TerminalControls visible={show} />
            </div>
            <TerminalWindow visible={show} />
        </div>
    )
}

export { TerminalPanel, updateTerminal }
