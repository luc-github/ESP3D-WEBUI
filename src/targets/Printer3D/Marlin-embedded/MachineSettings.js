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
import { useEffect, useState } from "preact/hooks"
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
    CenterLeft,
    Progress,
} from "../../../components/Controls"
import { RefreshCcw, XCircle, Save, Flag } from "preact-feather"
import { CMD } from "./CMD-source"
import {
    showConfirmationModal,
    showProgressModal,
} from "../../../components/Modal"

const machineSetting = {}
machineSetting.cache = []
machineSetting.toSave = []
machineSetting.totalToSave = 0

const MachineSettings = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [collected, setCollected] = useState("0 B")
    const { createNewRequest, abortRequest } = useHttpFn
    const { modals, toasts, uisettings } = useUiContext()
    const [showSave, setShowSave] = useState(false)
    const progressBar = {}
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
        const cmd = entry.value.trim()
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
        if (machineSetting.toSave.length > 0) {
            const index = machineSetting.toSave.pop()
            saveEntry(
                machineSetting.cache[index],
                machineSetting.totalToSave - machineSetting.toSave.length - 1,
                machineSetting.totalToSave
            )
        } else {
            endProgression()
        }
    }

    const saveSettings = () => {
        machineSetting.totalToSave = 0
        machineSetting.toSave = []
        machineSetting.cache.map((entry, index) => {
            if (entry.type != "comment") {
                if (entry.initial.trim() != entry.value.trim()) {
                    machineSetting.totalToSave++
                    machineSetting.toSave.push(index)
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
                    max={machineSetting.totalToSave}
                />
            ),
        })
        processSaving()
    }

    function checkSaveStatus() {
        let stringified = JSON.stringify(machineSetting.cache)
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
            if (feedback.command == "eeprom") {
                machineSetting.cache = CMD.command(
                    "formatEeprom",
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
        machineSetting.cache = []
        setIsLoading(false)
    }

    const onRefresh = (e) => {
        if (e) useUiContextFn.haptic()
        //get command
        const response = CMD.command("eeprom")
        //send query
        if (
            processor.startCatchResponse(
                "CMD",
                "eeprom",
                processFeedback,
                null,
                processCallBack
            )
        ) {
            setCollected("O B")
            setIsLoading(true)
            sendSerialCmd(response.cmd)
        }
    }

    const generateValidation = (fieldData) => {
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
            //TODO: Use Regex for validation
            if (
                fieldData.value.trim().length < 3 ||
                !(
                    fieldData.value.trim().startsWith("G") ||
                    fieldData.value.trim().startsWith("M")
                )
            )
                validation.valid = false
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
        if (uisettings.getValue("autoload") && machineSetting.cache == "") {
            //load settings
            onRefresh()
        }
    }, [])

    return (
        <div class="container">
            <h4 class="show-low title">{Target}</h4>
            <div class="m-2" />
            <center>
                {isLoading && (
                    <Fragment>
                        <Loading class="m-2" />
                        <div>{collected}</div>
                        <ButtonImg
                            donotdisable
                            showlow
                            icon={<XCircle />}
                            label={T("S28")}
                            tooltip
                            data-tooltip={T("S28")}
                            onClick={onCancel}
                        />
                    </Fragment>
                )}
                {!isLoading && (
                    <center class="m-2">
                        {machineSetting.cache.length > 0 && (
                            <div>
                                <CenterLeft bordered>
                                    {machineSetting.cache.map((element) => {
                                        if (element.type == "comment")
                                            return (
                                                <div class="comment m-1  ">
                                                    {element.value}
                                                </div>
                                            )
                                        const [validation, setvalidation] =
                                            useState()
                                        element.generateValidation = () => {
                                            setvalidation(
                                                generateValidation(element)
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
                                                                element
                                                            )
                                                        )
                                                    }}
                                                    validation={validation}
                                                />
                                            </div>
                                        )
                                    })}
                                </CenterLeft>
                            </div>
                        )}

                        <ButtonImg
                            m2
                            icon={<RefreshCcw />}
                            label={T("S50")}
                            tooltip
                            data-tooltip={T("S23")}
                            onClick={onRefresh}
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
            </center>
        </div>
    )
}

export { MachineSettings }
