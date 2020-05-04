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
import { useState } from "preact/hooks"
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
let visible = false
var commandHistory = []
var commandHistoryIndex = -1

/*
 * Local constants
 *
 */
const MAX_HISTORY_SIZE = 40

/*
 * Update Terminal window
 *
 */
function updateTerminal(data) {
    console.log("[Terminal]" + data)
    currentOutput.push(<div>{data}</div>)
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
    const [isVerbose, setVerbose] = useState(true)
    const toogleVerbose = e => {
        setVerbose(e.target.checked)
    }
    const [isAutoscroll, setAutoscroll] = useState(true)
    const toogleAutoscroll = e => {
        setAutoscroll(e.target.checked)
    }
    const clearterminal = e => {
        currentOutput = []
        globaldispatch({
            type: Action.renderAll,
        })
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
                            class="card-body"
                            style="max-height:200px; overflow-y: scroll;"
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
