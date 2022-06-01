/*
 MachineSettings.js - ESP3D WebUI Target file

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
import { Fragment, h } from "preact"
import { useEffect, useState, useRef } from "preact/hooks"
import { T } from "../../../components/Translations"
import { processor } from "./processor"
import { useHttpFn } from "../../../hooks"
import { useUiContext, useUiContextFn } from "../../../contexts"
import { Target } from "./index"
import {
    espHttpURL,
    disableUI,
    formatFileSizeToString,
} from "../../../components/Helpers"
import {
    Field,
    Loading,
    ButtonImg,
    Progress,
} from "../../../components/Controls"
import { RefreshCcw, XCircle, Save, Flag, RotateCw } from "preact-feather"
import { CMD } from "./CMD-source"
import {
    showConfirmationModal,
    showProgressModal,
} from "../../../components/Modal"

const machineSettings = {}
machineSettings.cache = []
machineSettings.override = []
machineSettings.toSave = []
machineSettings.totalToSave = 0
let configSelected = true

const MachineSettings = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [collected, setCollected] = useState("0 B")
    const [showSave, setShowSave] = useState(false)
    const progressBar = {}
    const { createNewRequest, abortRequest } = useHttpFn
    const { modals, toasts, uisettings } = useUiContext()
    const configTab = useRef()
    const overrideTab = useRef()
    const id = "Machine Tab"
    const sendSerialCmd = (cmd, updateUI) => {
        createNewRequest(
            espHttpURL("command", { cmd }),
            { method: "GET", echo: cmd },
            {
                onSuccess: (result) => {
                    //Result is handled on ws so just do nothing
                    if (updateUI) updateUI(result)
                },
                onFail: (error) => {
                    console.log("Error:", error)
                    setIsLoading(false)
                    toasts.addToast({ content: error, type: "error" })
                    processor.stopCatchResponse()
                },
            }
        )
    }

    const saveEntry = (entry, index, total) => {
        const { type, cmd } = CMD.command(
            configSelected ? "configset" : "overrideset",
            entry
        )
        console.log(cmd)
        createNewRequest(
            espHttpURL("command", { cmd }),
            { method: "GET", id: "saveMachineSetting" },
            {
                onSuccess: (result) => {
                    if (progressBar.update) progressBar.update(index + 1)
                    try {
                        entry.initial = entry.value.trim()
                    } catch (e) {
                        console.log(e)
                        toasts.addToast({ content: e, type: "error" })
                    } finally {
                        entry.generateValidation()
                        processSaving()
                    }
                },
                onFail: (error) => {
                    if (progressBar.update) progressBar.update(index + 1)
                    console.log(error)
                    toasts.addToast({ content: error, type: "error" })
                    processSaving()
                },
            }
        )
    }

    function abortSave() {
        abortRequest("saveMachineSetting")
        toasts.addToast({ content: T("S175"), type: "error" })
        endProgression()
    }

    function endProgression() {
        modals.removeModal(modals.getModalIndex("progression"))
    }

    const processSaving = () => {
        if (machineSettings.toSave.length > 0) {
            const index = machineSettings.toSave.pop()
            saveEntry(
                configSelected
                    ? machineSettings.cache[index]
                    : machineSettings.override[index],
                machineSettings.totalToSave - machineSettings.toSave.length - 1,
                machineSettings.totalToSave
            )
        } else {
            //if overide do M500
            if (!configSelected) {
                createNewRequest(
                    espHttpURL("command", { cmd: "M500" }),
                    { method: "GET", id: "saveMachineSetting" },
                    {
                        onSuccess: (result) => {
                            endProgression()
                        },
                        onFail: (error) => {
                            endProgression()
                            console.log(error)
                            toasts.addToast({ content: error, type: "error" })
                        },
                    }
                )
            } else {
                endProgression()
            }
        }
    }

    const saveSettings = () => {
        console.log("Save settings")
        machineSettings.totalToSave = 0
        machineSettings.toSave = []
        const settings = configSelected
            ? machineSettings.cache
            : machineSettings.override
        settings.map((entry, index) => {
            if (
                !(
                    entry.type == "comment" ||
                    entry.type == "disabled" ||
                    entry.type == "help"
                )
            ) {
                if (entry.initial.trim() != entry.value.trim()) {
                    machineSettings.totalToSave++
                    machineSettings.toSave.push(index)
                }
            }
        })

        showProgressModal({
            modals,
            title: T("S91"),
            button1: { cb: abortSave, text: T("S28") },
            content: (
                <Progress
                    progressBar={progressBar}
                    max={machineSettings.totalToSave}
                />
            ),
        })
        processSaving()
    }

    function checkSaveStatus() {
        let stringified = JSON.stringify(
            configSelected ? machineSettings.cache : machineSettings.override
        )
        let hasmodified =
            stringified.indexOf('"hasmodified":true') == -1 ? false : true
        let haserrors =
            stringified.indexOf('"haserror":true') == -1 ? false : true
        if (haserrors || !hasmodified) return false
        return true
    }

    const processCallBack = (data, total) => {
        setCollected(formatFileSizeToString(total))
    }

    const processFeedback = (feedback) => {
        if (feedback.status) {
            if (feedback.command == "config") {
                machineSettings.cache = CMD.command(
                    "formatConfig",
                    feedback.content
                )
            }
            if (feedback.command == "override") {
                machineSettings.override = CMD.command(
                    "formatOverride",
                    feedback.content
                )
            }
            if (feedback.status == "error") {
                console.log("got error")
                toasts.addToast({
                    content: T("S4"),
                    type: "error",
                })
            }
        }
        setIsLoading(false)
    }

    const onCancel = (e) => {
        useUiContextFn.haptic()
        toasts.addToast({
            content: T("S175"),
            type: "error",
        })
        processor.stopCatchResponse()
        machineSettings.cache = []
        setIsLoading(false)
    }

    const restartBoard = () => {
        createNewRequest(
            espHttpURL("command", { cmd: "reset" }),
            { method: "GET", id: "saveMachineSetting" },
            {
                onSuccess: (result) => {
                    //TBD
                },
                onFail: (error) => {
                    console.log(error)
                    toasts.addToast({ content: error, type: "error" })
                },
            }
        )
    }

    const onReset = (e) => {
        useUiContextFn.haptic()
        showConfirmationModal({
            modals,
            title: T("S26"),
            content: T("S59"),
            button1: { cb: restartBoard, text: T("S27") },
            button2: { text: T("S28") },
        })
    }

    const onRefresh = (e) => {
        useUiContextFn.haptic()
        const refreshContext = { target: "", command: "" }
        if (configSelected) {
            refreshContext.target = "config"
            //get command
            refreshContext.command = CMD.command(
                "config",
                uisettings.getValue("configfilename")
            )
        } else {
            refreshContext.target = "override"
            //get command
            refreshContext.command = CMD.command("override")
        }

        //send query
        if (
            processor.startCatchResponse(
                "CMD",
                refreshContext.target,
                processFeedback,
                null,
                processCallBack
            )
        ) {
            setCollected("O B")
            setIsLoading(true)
            sendSerialCmd(refreshContext.command.cmd)
        }
    }

    const generateValidation = (fieldData, isOverride) => {
        const validation = {
            message: <Flag size="1rem" />,
            valid: true,
            modified: true,
        }
        if (fieldData.type == "text") {
            if (fieldData.value.trim() == fieldData.initial.trim()) {
                fieldData.hasmodified = false
            } else {
                fieldData.hasmodified = true
            }
            if (isOverride) {
                if (
                    !(
                        fieldData.value.trim().startsWith("M") ||
                        fieldData.value.trim().startsWith("G")
                    )
                )
                    validation.valid = false
            } else {
                if (fieldData.value.trim().indexOf(" ") != -1)
                    validation.valid = false
            }
        }
        if (!validation.valid) {
            validation.message = T("S42")
        }
        fieldData.haserror = !validation.valid
        setShowSave(checkSaveStatus())
        if (!fieldData.hasmodified && !fieldData.haserror) {
            validation.message = null
            validation.valid = true
            validation.modified = false
        }
        return validation
    }
    useEffect(() => {
        if (uisettings.getValue("autoload") && machineSettings.cache == "") {
            //load settings
            onRefresh()
        }
    }, [])

    return (
        <div class="container" style="max-width:600px">
            <h4 class="show-low title">{Target}</h4>
            <div class="m-2" />

            {isLoading && (
                <center>
                    <Loading class="m-2" />
                    <div class="m-2">{collected}</div>
                    <ButtonImg
                        donotdisable
                        showlow
                        icon={<XCircle />}
                        label={T("S28")}
                        tooltip
                        data-tooltip={T("S28")}
                        onClick={onCancel}
                    />
                </center>
            )}
            {!isLoading && (
                <center>
                    <div class="text-primary m-2">
                        <div class="form-group">
                            <label class="form-radio form-inline">
                                <input
                                    type="radio"
                                    name="configtype"
                                    checked={configSelected}
                                    onclick={(e) => {
                                        useUiContextFn.haptic()
                                        configSelected = true
                                        if (
                                            uisettings.getValue("autoload") &&
                                            machineSettings.cache == ""
                                        ) {
                                            //load settings
                                            onRefresh()
                                        }
                                        configTab.current.classList.remove(
                                            "d-none"
                                        )
                                        overrideTab.current.classList.add(
                                            "d-none"
                                        )
                                        setShowSave(checkSaveStatus())
                                    }}
                                />
                                <i class="form-icon"></i>{" "}
                                {uisettings.getValue("configfilename")}
                            </label>
                            <label class="form-radio form-inline">
                                <input
                                    type="radio"
                                    name="configtype"
                                    checked={!configSelected}
                                    onclick={(e) => {
                                        useUiContextFn.haptic()
                                        configSelected = false
                                        if (
                                            uisettings.getValue("autoload") &&
                                            machineSettings.override == ""
                                        ) {
                                            //load settings
                                            onRefresh()
                                        }
                                        configTab.current.classList.add(
                                            "d-none"
                                        )
                                        overrideTab.current.classList.remove(
                                            "d-none"
                                        )
                                        setShowSave(checkSaveStatus())
                                    }}
                                />
                                <i class="form-icon"></i>
                                {T("SM1")}
                            </label>
                        </div>
                    </div>
                    <div
                        ref={configTab}
                        class={!configSelected ? "d-none" : ""}
                    >
                        {machineSettings.cache.length > 0 && (
                            <div class="bordered ">
                                {machineSettings.cache.map((element, index) => {
                                    if (element.type == "comment")
                                        return (
                                            <div class="comment m-1 text-left">
                                                {element.value}
                                            </div>
                                        )
                                    if (element.type == "disabled")
                                        return (
                                            <div class="text-secondary m-1 text-left">
                                                {element.value}
                                            </div>
                                        )
                                    if (element.type == "help")
                                        return (
                                            <div
                                                class="text-small text-gray text-italic text-left"
                                                style={`margin-left:2rem;${
                                                    machineSettings.cache[
                                                        index + 1
                                                    ]
                                                        ? machineSettings.cache[
                                                              index + 1
                                                          ].type == "help"
                                                            ? ""
                                                            : "margin-bottom:1rem"
                                                        : "margin-bottom:1rem"
                                                }`}
                                            >
                                                {element.value}
                                            </div>
                                        )

                                    const [validation, setvalidation] =
                                        useState()
                                    element.generateValidation = () => {
                                        setvalidation(
                                            generateValidation(element, false)
                                        )
                                    }
                                    return (
                                        <div class="m-1">
                                            <Field
                                                style="max-width:10rem;"
                                                inline
                                                label={element.label}
                                                type={element.type}
                                                value={element.value}
                                                setValue={(
                                                    val,
                                                    update = false
                                                ) => {
                                                    if (!update) {
                                                        element.value = val
                                                    }
                                                    setvalidation(
                                                        generateValidation(
                                                            element,
                                                            false
                                                        )
                                                    )
                                                }}
                                                validation={validation}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div
                        ref={overrideTab}
                        class={configSelected ? "d-none" : ""}
                    >
                        {machineSettings.override.length > 0 && (
                            <div class="bordered ">
                                {machineSettings.override.map(
                                    (element, index) => {
                                        if (element.type == "comment")
                                            return (
                                                <div class="comment m-1 text-left">
                                                    {element.value}
                                                </div>
                                            )

                                        const [validation, setvalidation] =
                                            useState()
                                        element.generateValidation = () => {
                                            setvalidation(
                                                generateValidation(
                                                    element,
                                                    true
                                                )
                                            )
                                        }
                                        return (
                                            <div class="m-1">
                                                <Field
                                                    type={element.type}
                                                    value={element.value}
                                                    setValue={(
                                                        val,
                                                        update = false
                                                    ) => {
                                                        if (!update) {
                                                            element.value = val
                                                        }
                                                        setvalidation(
                                                            generateValidation(
                                                                element,
                                                                true
                                                            )
                                                        )
                                                    }}
                                                    validation={validation}
                                                />
                                            </div>
                                        )
                                    }
                                )}
                            </div>
                        )}
                    </div>

                    <div class="m-2" />
                    <ButtonImg
                        m2
                        icon={<RefreshCcw />}
                        label={T("S50")}
                        tooltip
                        data-tooltip={T("S23")}
                        onClick={onRefresh}
                    />
                    <ButtonImg
                        m2
                        icon={<RotateCw />}
                        label={T("SM3")}
                        tooltip
                        data-tooltip={T("SM3")}
                        onClick={onReset}
                    />
                    {showSave && (
                        <ButtonImg
                            m2
                            tooltip
                            data-tooltip={T("S62")}
                            label={T("S61")}
                            icon={<Save />}
                            onClick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                saveSettings()
                            }}
                        />
                    )}
                </center>
            )}
        </div>
    )
}

export { MachineSettings }
