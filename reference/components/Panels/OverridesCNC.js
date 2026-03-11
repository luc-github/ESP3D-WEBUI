/*
SpindleCNC.js - ESP3D WebUI component file

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
import { Repeat } from "preact-feather"
import { useUiContext, useUiContextFn } from "../../contexts"
import { useTargetContext, variablesList } from "../../targets"
import { ButtonImg, FullScreenButton, CloseButton, ContainerHelper } from "../Controls"
import { useHttpFn } from "../../hooks"
import { espHttpURL, replaceVariables } from "../Helpers"

/*
 * Local const
 *
 */

const OverridesControls = () => {
    const { overrides } = useTargetContext()
    if (!useUiContextFn.getValue("showoverridespanel")) return null

    const overrides_array = [
        { id: "spindle", label: "CN64", tooltip: "CN67" },
        { id: "feed", label: "CN9", tooltip: "CN68" },
        { id: "rapid", label: "CN63", tooltip: "CN69" },
    ]
    return (
        <Fragment>
            {overrides && (
                <div class="status-ctrls">
                    {overrides_array.map((element) => {
                        if (overrides[element.id]) {
                            return (
                                <div
                                    class="extra-control mt-1 tooltip tooltip-bottom"
                                    data-tooltip={T(element.tooltip)}
                                >
                                    <div class="extra-control-header">
                                        {T(element.label)}
                                    </div>

                                    <div class="extra-control-value">
                                        {overrides[element.id]}%
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>
            )}
        </Fragment>
    )
}

const OverridesPanel = () => {
    const { toasts, panels } = useUiContext()
    const { createNewRequest } = useHttpFn
    const id = "OverridesPanel"

    const buttons_list = [
        {
            label: "CN67",
            buttons: [
                {
                    label: "-10%",
                    tooltip: "CN67",
                    command: "#SSO-10#",
                },
                {
                    label: "-1%",
                    tooltip: "CN67",
                    command: "#SSO-1#",
                },
                {
                    label: "100%",
                    tooltip: "CN66",
                    command: "#SSO100#",
                },
                {
                    iconRight: true,
                    label: "+1%",
                    tooltip: "CN67",
                    command: "#SSO+1#",
                },
                {
                    iconRight: true,
                    label: "+10%",
                    tooltip: "CN67",
                    command: "#SSO+10#",
                },
            ],
        },
        {
            label: "CN68",
            buttons: [
                {
                    label: "-10%",
                    tooltip: "CN68",
                    command: "#FO-10#",
                },
                {
                    label: "-1%",
                    tooltip: "CN68",
                    command: "#FO-1#",
                },
                {
                    label: "100%",
                    tooltip: "CN66",
                    command: "#FO100#",
                },
                {
                    iconRight: true,
                    label: "+1%",
                    tooltip: "CN68",
                    command: "#FO+1#",
                },
                {
                    iconRight: true,
                    label: "+10%",
                    tooltip: "CN68",
                    command: "#FO+10#",
                },
            ],
        },
        {
            label: "CN69",
            buttons: [
                {
                    label: "25%",
                    tooltip: "CN69",
                    command: "#RO25#",
                },
                {
                    label: "50%",
                    tooltip: "CN69",
                    command: "#RO50#",
                },
                {
                    label: "100%",
                    tooltip: "CN66",
                    command: "#RO100#",
                },
            ],
        },
    ]

    console.log("Overrides panel")
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
                    <Repeat />
                    <strong class="text-ellipsis">{T("CN65")}</strong>
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
                <OverridesControls />
                {buttons_list.map((item) => {
                    return (
                        <fieldset class="fieldset-top-separator fieldset-bottom-separator field-group">
                            <legend>
                                <label class="m-1 buttons-bar-label">
                                    {T(item.label)}
                                </label>
                            </legend>
                            <div class="field-group-content maxwidth">
                                <div class="states-buttons-container">
                                    {item.buttons.map((button, index) => {
                                        return (
                                            <ButtonImg
                                                mt1
                                                className={
                                                    item.buttons.length / 2 >
                                                    index
                                                        ? "tooltip tooltip-right"
                                                        : "tooltip tooltip-left"
                                                }
                                                label={T(button.label)}
                                                data-tooltip={T(button.tooltip)}
                                                onClick={(e) => {
                                                    useUiContextFn.haptic()
                                                    e.target.blur()
                                                    sendCommand(button.command)
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

const OverridesPanelElement = {
    id: "OverridesPanel",
    content: <OverridesPanel />,
    name: "CN65",
    icon: "Repeat",
    show: "showoverridespanel",
    onstart: "openoverridesonstart",
    settingid: "overrides",
}

export { OverridesPanel, OverridesPanelElement, OverridesControls }
