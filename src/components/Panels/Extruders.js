/*
Extruders.js - ESP3D WebUI component file

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
import { useState } from "preact/hooks"
import { useUiContext, useUiContextFn } from "../../contexts"
import { ButtonImg, Loading, Field } from "../Controls"
import { useHttpFn } from "../../hooks"
import { espHttpURL } from "../Helpers"
import {
    iconsTarget,
    useTargetContext,
    MixedExtrudersControl,
} from "SubTargetDir"
import { Plus, Minus, Edit3 } from "preact-feather"
import { Menu as PanelMenu } from "./"
import { showModal } from "../Modal"

const extrudeDistance = []
const extruderFeedRate = { value: 0 }

const distancesList = () => {
    const list = useUiContextFn.getValue("extruderdistance")
    if (list)
        return list.split(";").map((item) => {
            return { display: item + T("P16"), value: item }
        })

    return ""
}

const ExtruderInputControl = ({ index, size, hasdivider }) => {
    const { toasts } = useUiContext()
    const { createNewRequest } = useHttpFn
    const [validation, setvalidation] = useState({
        message: null,
        valid: true,
        modified: false,
    })
    const generateValidation = (index) => {
        let validation = {
            message: null,
            valid: true,
            modified: false,
        }
        if (extrudeDistance[index] == 0 || extrudeDistance[index] <= 0) {
            //No error message to keep all control aligned
            //may be have a better way ?
            // validation.message = T("S42");
            validation.valid = false
        }
        return validation
    }
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
    const distances = distancesList()

    if (extrudeDistance[index] === undefined) {
        extrudeDistance[index] = distances[0].value
    }

    return (
        <Fragment>
            <div>
                <div class="extruder-ctrl-name">
                    {T("P41").replace("$", size == 1 ? "" : index + 1)}
                </div>
                <div class="extruder-ctrls-container m-1">
                    <div class="m-1" />
                    <div>
                        <Field
                            id={"input-extruder-" + index}
                            type="number"
                            value={extrudeDistance[index]}
                            min="0"
                            step="0.5"
                            width="4rem"
                            extra="dropList"
                            append={T("P16")}
                            options={distances}
                            setValue={(val, update) => {
                                if (!update) extrudeDistance[index] = val
                                setvalidation(generateValidation(index))
                            }}
                            validation={validation}
                        />
                    </div>
                    <ButtonImg
                        id={"btn-extrude-plus" + index}
                        class={`extruder-ctrl-send m-2 ${
                            !validation.valid ? "d-invisible" : ""
                        }`}
                        icon={<Plus />}
                        tooltip
                        data-tooltip={T("P53")}
                        onClick={(e) => {
                            useUiContextFn.haptic()
                            e.target.blur()
                            const cmd =
                                "T" +
                                index +
                                "\nG91\nG1 E" +
                                extrudeDistance[index] +
                                " F" +
                                extruderFeedRate.value +
                                "\nG90"
                            const cmds = cmd.split("\n")
                            cmds.forEach((cmd) => {
                                sendCommand(cmd)
                            })
                        }}
                    />
                    <ButtonImg
                        id={"btn-extrude-minus" + index}
                        class={`extruder-ctrl-send m-2 ${
                            !validation.valid ? "d-invisible" : ""
                        }`}
                        icon={<Minus />}
                        tooltip
                        data-tooltip={T("P54")}
                        onClick={(e) => {
                            useUiContextFn.haptic()
                            e.target.blur()
                            const cmd =
                                "T" +
                                index +
                                "\nG91\nG1 E-" +
                                extrudeDistance[index] +
                                " F" +
                                extruderFeedRate.value +
                                "\nG90"
                            const cmds = cmd.split("\n")
                            cmds.forEach((cmd) => {
                                sendCommand(cmd)
                            })
                        }}
                    />
                </div>{" "}
            </div>
            {hasdivider && <div class="divider W-100"></div>}
        </Fragment>
    )
}

/*
 * Local const
 *
 */
const ExtrudersPanel = () => {
    const { panels, modals } = useUiContext()
    const { temperatures } = useTargetContext()
    if (extruderFeedRate.value == 0) {
        extruderFeedRate.value = useUiContextFn.getValue("efeedrate")
    }
    const isMixedExtruder = !!useUiContextFn.getValue("ismixedextruder")
    const id = "extrudersPanel"
    //Set the current feedrate for extruder
    const setFeedrateExtruder = () => {
        useUiContextFn.haptic()
        let value = extruderFeedRate.value
        showModal({
            modals,
            title: T("P50"),
            button2: { text: T("S28") },
            button1: {
                cb: () => {
                    if (value.length > 0.1) extruderFeedRate.value = value
                },
                text: T("S43"),
                id: "applyFrBtn",
            },
            icon: <Edit3 />,
            id: "inputFeedrate",
            content: (
                <Fragment>
                    <div>{T("P50")}</div>
                    <input
                        class="form-input"
                        type="number"
                        step="0.1"
                        value={value}
                        onInput={(e) => {
                            value = e.target.value.trim()
                            if (value < 0.1) {
                                if (document.getElementById("applyFrBtn")) {
                                    document.getElementById(
                                        "applyFrBtn"
                                    ).disabled = true
                                }
                            } else {
                                if (document.getElementById("applyFrBtn")) {
                                    document.getElementById(
                                        "applyFrBtn"
                                    ).disabled = false
                                }
                            }
                        }}
                    />
                </Fragment>
            ),
        })
    }
    const menu = [
        {
            label: T("P50"),
            onClick: setFeedrateExtruder,
        },
    ]
    console.log(id)

    return (
        <div class="panel panel-dashboard">
            <div class="navbar">
                <span class="navbar-section feather-icon-container">
                    {iconsTarget["Extruder"]}
                    <strong class="text-ellipsis">{T("P36")}</strong>
                </span>
                <span class="navbar-section">
                    <span class="H-100">
                        <PanelMenu items={menu} />
                        <span
                            class="btn btn-clear btn-close m-1"
                            aria-label="Close"
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                panels.hide(id)
                            }}
                        />
                    </span>
                </span>
            </div>
            <div class="panel-body panel-body-dashboard">
                <div class="extruders-container">
                    {!isMixedExtruder &&
                        temperatures["T"].map((temp, index) => {
                            return (
                                <ExtruderInputControl
                                    index={index}
                                    size={temperatures["T"].length}
                                    hasdivider={
                                        index < temperatures["T"].length - 1
                                    }
                                />
                            )
                        })}
                    {isMixedExtruder && (
                        <MixedExtrudersControl feedrate={extruderFeedRate} />
                    )}
                    {!isMixedExtruder && temperatures["T"].length == 0 && (
                        <div class="loading-panel">
                            <div class="m-2">
                                <div class="m-1">{T("P89")}</div>
                                <Loading />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const ExtrudersPanelElement = {
    id: "extrudersPanel",
    content: <ExtrudersPanel />,
    name: "P36",
    icon: "Extruder",
    show: "showextruderspanel",
    onstart: "openextrudersonstart",
}

export { ExtrudersPanel, ExtrudersPanelElement }
