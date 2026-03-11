/*
 Terminal.js - ESP3D WebUI component file

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

import { h } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"
import { T } from "../Translations"
import {
    Terminal,
    Send,
    CheckCircle,
    Circle,
    PauseCircle,
    ChevronLeft,
    ChevronRight,
} from "preact-feather"
import { useUiContext, useDatasContext, useUiContextFn } from "../../contexts"
import { useTargetContext, variablesList } from "../../targets"
import { useHttpQueue } from "../../hooks"
import { espHttpURL, replaceVariables } from "../Helpers"
import { ButtonImg, FullScreenButton, CloseButton, ContainerHelper } from "../Controls"
import { Menu as PanelMenu } from "./"

/*
 * Local const
 *
 */
const TerminalPanel = () => {
    const { panels, uisettings } = useUiContext()
    const { terminal } = useDatasContext()
    const { processData } = useTargetContext()
    const { createNewRequest } = useHttpQueue()
    if (terminal.isVerbose.current == undefined)
        terminal.isVerbose.current = uisettings.getValue("verbose")
    if (terminal.isAutoScroll.current == undefined)
        terminal.isAutoScroll.current = uisettings.getValue("autoscroll")
    const [isVerbose, setIsVerbose] = useState(terminal.isVerbose.current)
    const [isAutoScroll, setIsAutoScroll] = useState(
        terminal.isAutoScroll.current
    )
    const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false)
    let lastPos = 0
    const inputRef = useRef()
    const messagesEndRef = useRef(null)
    const terminalOutput = useRef(null)
    const id = "terminalPanel"
    const inputHistoryIndex = useRef(terminal.inputHistory.length )
    const scrollToBottom = () => {
        if (
            terminal.isAutoScroll.current &&
            !terminal.isAutoScrollPaused.current
        ) {
            terminalOutput.current.scrollTop =
                terminalOutput.current.scrollHeight
        }
    }
    const historyPrev = () => {
        if (terminal.inputHistory.length > 0 && inputHistoryIndex.current > 0) { 
            inputHistoryIndex.current--
            inputRef.current.value = terminal.inputHistory[inputHistoryIndex.current]
            terminal.input.current = inputRef.current.value
        }
    }

    const historyNext = () => {
        if (
            terminal.inputHistory.length > 0 &&
            inputHistoryIndex.current < terminal.inputHistory.length-1 
        ) {
            inputHistoryIndex.current++
            inputRef.current.value = terminal.inputHistory[inputHistoryIndex.current]
            terminal.input.current = inputRef.current.value
        } else {
            inputRef.current.value = ""
            terminal.input.current = inputRef.current.value
            inputHistoryIndex.current = terminal.inputHistory.length
        } 
    }
    const onKeyUp = (e) => {
        switch (e.keyCode) {
            case 13:
                onSend(e)
                break
            case 38: //prev
                historyPrev()
                break
            case 40: //next
                historyNext()
                break
            default:
            //ignore
        }
    }
    const onSend = (e) => {
        useUiContextFn.haptic()
        inputRef.current.focus()
        if (!terminal.input.current && variablesList.allowEmptyLine)
            terminal.input.current = ""
        if (
            (terminal.input.current &&
                terminal.input.current.trim().length > 0) ||
            variablesList.allowEmptyLine
        ) {
            const cmd = terminal.input.current.trim()
            if (
                cmd.length > 0 &&
                terminal.inputHistory[terminal.inputHistory.length - 1] != cmd
            ) {
                terminal.addInputHistory(cmd)
            }
            inputHistoryIndex.current = terminal.inputHistory.length 
            processData(
                "echo",
                replaceVariables(variablesList.commands, cmd, true)
            )
            createNewRequest(
                espHttpURL("command", {
                    cmd: replaceVariables(variablesList.commands, cmd),
                }),
                { method: "GET" },
                {
                    onSuccess: (result) => {
                        processData("response", result)
                    },
                    onFail: (error) => {
                        console.log(error)
                        processData("error", error)
                    },
                }
            )
        } 
        inputHistoryIndex.current = terminal.inputHistory.length 
        terminal.input.current = ""
        inputRef.current.value = ""
    }
    const onInput = (e) => {
        terminal.input.current = e.target.value
    }
    useEffect(() => {
        scrollToBottom()
    }, [terminal.content])
    useEffect(() => {
        return () => {
            //console.log('Resetting terminal history');
            inputHistoryIndex.current = terminal.inputHistory.length - 1;
        };
    }, []);

    console.log("Terminal panel")

    const toggleVerboseMode = () => {
        useUiContextFn.haptic()
        terminal.isVerbose.current = !isVerbose
        setIsVerbose(!isVerbose)
    }

    const toggleAutoScroll = () => {
        useUiContextFn.haptic()
        if (!isAutoScrollPaused) {
            terminal.isAutoScroll.current = !isAutoScroll
            setIsAutoScroll(!isAutoScroll)
        }
        terminal.isAutoScrollPaused.current = false
        setIsAutoScrollPaused(false)
        scrollToBottom()
    }

    const menu = [
        {
            label: T("S76"),
            displayToggle: () => (
                <span class="feather-icon-container">
                    {isVerbose ? (
                        <CheckCircle size="0.8rem" />
                    ) : (
                        <Circle size="0.8rem" />
                    )}
                </span>
            ),
            onClick: toggleVerboseMode,
        },
        {
            label: T("S77"),
            displayToggle: () => (
                <span class="feather-icon-container">
                    {isAutoScroll ? (
                        isAutoScrollPaused ? (
                            <PauseCircle size="0.8rem" />
                        ) : (
                            <CheckCircle size="0.8rem" />
                        )
                    ) : (
                        <Circle size="0.8rem" />
                    )}
                </span>
            ),
            onClick: toggleAutoScroll,
        },
        { divider: true },
        {
            label: T("S79"),
            onClick: (e) => {
                useUiContextFn.haptic()
                terminal.clear()
            },
            icon: <span class="btn btn-clear" aria-label="Close" />,
        },
    ]

    return (
        <div class="panel panel-dashboard" id={id}>
            <ContainerHelper id={id}/>
            <div class="navbar">
                <span class="navbar-section feather-icon-container">
                    <Terminal />
                    <strong class="text-ellipsis">{T("Terminal")}</strong>
                </span>
                <span class="navbar-section">
                    <span class="full-height">
                        <PanelMenu items={menu} />
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
            <div class="input-group m-2">
                <input
                    type="text"
                    class="form-input"
                    onInput={onInput}
                    onkeyup={onKeyUp}
                    ref={inputRef}
                    value={terminal.input.current}
                    placeholder={T("S80")}
                />
                <ButtonImg
                    group
                    ltooltip
                    data-tooltip={T("S82")}
                    label={T("S81")}
                    icon={<Send />}
                    onClick={onSend}
                />
            </div>
            <div class="show-low">
                <ButtonImg
                    class=" m-2"
                    icon={<ChevronLeft />}
                    onClick={historyPrev}
                />
                <ButtonImg
                    class=" m-2"
                    icon={<ChevronRight />}
                    onClick={historyNext}
                />
            </div>
            <div
                ref={terminalOutput}
                class="panel-body panel-body-dashboard terminal m-1"
                onScroll={(e) => {
                    if (
                        lastPos > e.target.scrollTop &&
                        terminal.isAutoScroll.current
                    ) {
                        terminal.isAutoScrollPaused.current = true
                        setIsAutoScrollPaused(true)
                    }
                    if (
                        terminal.isAutoScrollPaused.current &&
                        Math.abs(
                            e.target.scrollTop +
                                e.target.offsetHeight -
                                e.target.scrollHeight
                        ) < 5
                    ) {
                        terminal.isAutoScrollPaused.current = false
                        setIsAutoScrollPaused(false)
                    }
                    lastPos = e.target.scrollTop
                }}
            >
                {terminal.content &&
                    terminal.content.map((line) => {
                        let className = ""
                        switch (line.type) {
                            case "echo":
                                className = "echo"
                                break
                            case "error":
                                className = "error"
                                break
                            default:
                            //do nothing
                        }
                        if (line.isAction) {
                            return (
                                <pre class="action" title={line.actionType}>
                                    {line.content}
                                </pre>
                            )
                        } else if (
                            isVerbose ||
                            isVerbose === line.isverboseOnly
                        ) {
                            return <pre class={className}>{line.content}</pre>
                        }
                    })}
                <div ref={messagesEndRef} />
            </div>
        </div>
    )
}

const TerminalPanelElement = {
    id: "terminalPanel",
    content: <TerminalPanel />,
    name: "S75",
    icon: "Terminal",
    show: "showterminalpanel",
    onstart: "openterminalonstart",
    settingid: "terminal",
}

export { TerminalPanel, TerminalPanelElement }
