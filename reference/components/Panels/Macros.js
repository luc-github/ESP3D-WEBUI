/*
Macros.js - ESP3D WebUI component file

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
import { T } from "../Translations"
import { Cast } from "preact-feather"
import { useRef } from "preact/hooks"
import { useUiContext, useUiContextFn } from "../../contexts"
import { ButtonImg, FullScreenButton, CloseButton, ContainerHelper } from "../Controls"
import { useHttpFn } from "../../hooks"
import { espHttpURL, replaceVariables } from "../Helpers"
import { iconsFeather } from "../Images"
import {
    iconsTarget,
    useTargetContextFn,
    files,
    variablesList,
} from "../../targets"

/*
 * Local const
 *
 */
const MacrosPanel = () => {
    const { panels, uisettings } = useUiContext()
    const { processData } = useTargetContextFn
    const { createNewRequest } = useHttpFn
    const iconsList = { ...iconsTarget, ...iconsFeather }
    const id = "macrosPanel"
    console.log(id)
    const getSDSource = () => {
        for (const source of files.supported) {
            if (source.value == "SD" || source.value == "DIRECTSD") {
                return source.value
            }
        }
        return "NONE"
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

    const macroList = uisettings.getValue("macros")
    const macroButtons = macroList.reduce((acc, curr) => {
        const item = curr.value.reduce((accumulator, current) => {
            accumulator[current.name] = current.initial
            return accumulator
        }, {})
        item.id = curr.id
        acc.push(item)
        return acc
    }, [])
    const processMacro = (action, type) => {
        switch (type) {
            case "FS":
                //[ESP700] //ESP700 should send status to telnet / websocket
                //Todo: handle response from ESP700
                sendCommand("[ESP700]" + action)
                break
            case "SD":
                //get command accoring target FW
                const response = files.command(
                    getSDSource(),
                    "play",
                    "",
                    action
                )
                const cmds = response.cmd.split("\n")
                cmds.forEach((cmd) => {
                    sendCommand(cmd)
                })

                break
            //TODO:
            //TFT SD ? same as above
            //TFT USB ? same as above
            case "URI":
                //open new page or silent command
                const uri = action.trim().replace("[SILENT]", "")
                if (action.trim().startsWith("[SILENT]")) {
                    const uri = action.trim().replace("[SILENT]", "")
                    var myInit = {
                        method: "GET",
                        mode: "cors",
                        cache: "default",
                    }
                    fetch(uri, myInit)
                        .then(function (response) {
                            if (response.ok) {
                                console.log("Request succeeded")
                            } else {
                                console.log("Request failed")
                            }
                        })
                        .catch(function (error) {
                            console.log("Request failed: " + error.message)
                        })
                } else {
                    window.open(action)
                }
                break
            case "CMD":
                //split by ; and show in terminal
                const commandsList = action.trim().split(";")
                commandsList.forEach((command) => {
                    sendCommand(command)
                })
                break
            default:
                console.log("type:", type, " action:", action)
                break
        }
    }

    return (
        <div class="panel panel-dashboard" id={id}>
            <ContainerHelper id={id} /> 
            <div class="navbar">
                <span class="navbar-section feather-icon-container">
                    <Cast />
                    <strong class="text-ellipsis">{T("macros")}</strong>
                </span>
                <span class="navbar-section">
                    <span class="full-height">
                        <FullScreenButton elementId={id}/>
                        <CloseButton
                            elementId={id}
                            hideOnFullScreen={true}
                        />
                    </span>
                </span>
            </div>
            <div class="panel-body panel-body-dashboard">
                <div class="macro-buttons-panel">
                    {macroButtons.map((element) => {
                        const displayIcon = iconsList[element.icon]
                            ? iconsList[element.icon]
                            : ""
                        return (
                            <ButtonImg
                                id={element.id}
                                m1
                                showlow
                                label={element.name}
                                icon={displayIcon}
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    processMacro(element.action, element.type)
                                }}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

const MacrosPanelElement = {
    id: "macrosPanel",
    content: <MacrosPanel />,
    name: "macros",
    icon: "Cast",
    show: "showmacrospanel",
    onstart: "openmacrosonstart",
    settingid: "macros",
}

export { MacrosPanel, MacrosPanelElement }
