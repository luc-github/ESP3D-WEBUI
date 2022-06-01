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
import { useUiContext, useUiContextFn, useWsContext } from "../../../contexts"
import { restartdelay } from "./index"
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
import {
    HelpCircle,
    XCircle,
    Flag,
    ExternalLink,
    Download,
    DownloadCloud,
    CheckCircle,
    Edit,
    Edit3,
    Save,
    RotateCcw,
} from "preact-feather"
import { CMD } from "./CMD-source"
import {
    formatArrayYamlToFormatedArray,
    formatYamlToFormatedArray,
} from "./importHelper"
import { saveArrayYamlToLocalFile, formatArrayToYaml } from "./exportHelper"
import { showConfirmationModal } from "../../../components/Modal"

let currentConfig = ""
let activeConfig = ""
let currentFileConfig = []
let editedCurrentFileConfig = []
let editionMode = false
let isImport = false
let hasRemovedLines = false

const MachineSettings = () => {
    const [isLoading, setIsLoading] = useState(false)
    const { createNewRequest, abortRequest } = useHttpFn
    const { modals, toasts, uisettings } = useUiContext()
    const { Disconnect } = useWsContext()
    const [currentConfigFilename, setCurrentConfigFileName] =
        useState(currentConfig)
    const [activeConfigFilename, setActiveConfigFilename] =
        useState(activeConfig)
    const [isEditionMode, setIsEditionMode] = useState(editionMode)
    const inputFile = useRef(null)
    const editorRef = useRef()
    const id = "Machine Tab"

    const configFilesList = uisettings
        .getValue("configfilenames")
        .trim()
        .split(";")
        .reduce((acc, curr) => {
            if (curr.trim().length > 0)
                acc.push({ label: curr.trim(), value: curr.trim() })
            return acc
        }, [])

    const askReStartBoard = (ismanual = false) => {
        showConfirmationModal({
            modals,
            title: T("S26"),
            content: ismanual ? T("S59") : T("S174"),
            button1: { cb: reStartBoard, text: T("S27") },
            button2: { text: T("S28") },
        })
    }

    const reStartBoard = () => {
        sendSerialCmd("[ESP444]RESTART", () => {
            Disconnect("restart")
            setTimeout(() => {
                window.location.reload()
            }, restartdelay * 1000)
        })
        console.log("restart")
    }

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

    const processFeedback = (feedback) => {
        if (feedback.status) {
            if (feedback.command == "configFileName") {
                activeConfig = feedback.content[0].split("=")[1]

                setActiveConfigFilename(activeConfig)
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

    const getConfigFileName = (e) => {
        if (e) {
            useUiContextFn.haptic()
            e.target, blur()
        }
        const response = CMD.command("configFileName")
        //send query
        if (
            processor.startCatchResponse(
                "CMD",
                "configFileName",
                processFeedback
            )
        ) {
            setIsLoading(true)
            sendSerialCmd(response.cmd)
        }
    }

    const onCancel = (e) => {
        useUiContextFn.haptic()
        toasts.addToast({
            content: T("S175"),
            type: "error",
        })
        processor.stopCatchResponse()
        setIsLoading(false)
    }

    const onLoad = (e) => {
        if (e) e.target.blur()
        setIsLoading(true)
        createNewRequest(
            espHttpURL(currentConfig),
            { method: "GET" },
            {
                onSuccess: (result) => {
                    isImport = false
                    hasRemovedLines = false
                    currentFileConfig = formatYamlToFormatedArray(result)
                    setIsLoading(false)
                },
                onFail: (error) => {
                    currentFileConfig = ""
                    console.log(error)
                    setIsLoading(false)
                    toasts.addToast({ content: error, type: "error" })
                },
            }
        )
    }

    const onSet = (e) => {
        if (e) {
            useUiContextFn.haptic()
            e.target.blur()
        }
        sendSerialCmd("$Config/Filename=" + currentConfig)
    }

    const onSaveArrayYamlToFS = (formatedArray, filename) => {
        const blob = new Blob([formatArrayToYaml(formatedArray)], {
            type: "text/plain",
        })

        const formData = new FormData()
        const file = new File([blob], filename)
        formData.append("path", "/")
        formData.append(filename + "S", filename.length)
        formData.append("myfiles", file, filename)
        setIsLoading(true)
        createNewRequest(
            espHttpURL("files"),
            { method: "POST", id: "yamlconfig", body: formData },
            {
                onSuccess: (result) => {
                    isImport = false
                    hasRemovedLines = false
                    for (let i = 0; i < currentFileConfig.length; i++) {
                        const element = currentFileConfig[i]
                        if (element.type == "entry")
                            element.initial = element.value
                    }
                    setIsLoading(false)
                    askReStartBoard()
                },
                onFail: (error) => {
                    setIsLoading(false)
                },
            }
        )
    }

    const fileSelected = () => {
        if (inputFile.current.files.length > 0) {
            setIsLoading(true)
            const reader = new FileReader()
            reader.onload = function (e) {
                useUiContextFn.haptic()
                const importFile = e.target.result
                try {
                    isImport = true
                    hasRemovedLines = true
                    currentFileConfig = formatYamlToFormatedArray(importFile)
                    for (let i = 0; i < currentFileConfig.length; i++) {
                        const element = currentFileConfig[i]
                        if (element.type == "entry")
                            element.initial = element.value + "[newItem]"
                    }
                } catch (e) {
                    console.log(e)
                    console.log("Error")
                    currentFileConfig = ""
                    toasts.addToast({ content: "S56", type: "error" })
                } finally {
                    setIsLoading(false)
                }
            }
            reader.readAsText(inputFile.current.files[0])
        }
    }

    const syncChanges = () => {
        //check existing value
        editedCurrentFileConfig.forEach((entry) => {
            const previousEntry = currentFileConfig.find((element) => {
                if (
                    element.label == entry.label &&
                    element.path == entry.path &&
                    element.type == entry.type
                )
                    return true
                return false
            })
            //entry exists
            if (previousEntry) entry.initial = previousEntry.initial
            else entry.initial = "[new entry]"
        })
        //check removed values

        for (let p = 0; p < currentFileConfig.length; p++) {
            const entry = currentFileConfig[p]

            const hasEntry = editedCurrentFileConfig.find((element) => {
                if (
                    element.label == entry.label &&
                    element.path == entry.path &&
                    element.type == entry.type
                )
                    return true
                return false
            })

            if (hasEntry == undefined) {
                hasRemovedLines = true
                break
            } else hasRemovedLines = false
        }
        currentFileConfig = editedCurrentFileConfig
    }

    const generateValidation = (fieldData) => {
        const validation = {
            message: <Flag size="1rem" />,
            valid: true,
            modified: true,
        }

        if (fieldData.type == "entry" || fieldData.type == "section") {
            if (fieldData.value == fieldData.initial) {
                fieldData.hasmodified = false
            } else {
                fieldData.hasmodified = true
            }
        }
        if (isImport) fieldData.hasmodified = true
        if (!validation.valid) {
            validation.message = T("S42")
        }
        fieldData.haserror = !validation.valid
        //setShowSave(checkSaveStatus());
        if (!fieldData.hasmodified && !fieldData.haserror) {
            validation.message = null
            validation.valid = true
            validation.modified = false
        }
        return validation
    }

    useEffect(() => {
        if (activeConfig == "") {
            getConfigFileName()
        }
    }, [])

    const button = (
        <Fragment>
            <ButtonImg
                style="margin-left:5px; margin-right:5px"
                icon={<DownloadCloud />}
                label={T("FL4")}
                tooltip
                data-tooltip={T("FL3")}
                onclick={onLoad}
            />

            <ButtonImg
                id="buttonSetConfigFileName"
                className={
                    currentConfig && currentConfig.length > 0 ? "" : "d-none"
                }
                icon={<CheckCircle />}
                label={T("FL9")}
                tooltip
                data-tooltip={T("FL8")}
                onclick={onSet}
            />
        </Fragment>
    )

    return (
        <div class="container">
            <input
                ref={inputFile}
                type="file"
                class="d-none"
                accept=".yml,.yaml"
                onChange={fileSelected}
            />
            <h4 class="show-low title">{Target}</h4>
            <div class="m-2" />
            <center>
                {isLoading && (
                    <Fragment>
                        <Loading class="m-2" />
                        <ButtonImg
                            donotdisable
                            icon={<XCircle />}
                            label={T("S28")}
                            tooltip
                            data-tooltip={T("S28")}
                            onclick={onCancel}
                        />
                    </Fragment>
                )}
                {!isLoading && (
                    <center>
                        <span class="m-1">{T("FL6")}:</span>
                        <span class="m-1 form-input d-inline">
                            {activeConfigFilename}
                        </span>
                        <ButtonImg
                            icon={<HelpCircle />}
                            label={T("FL7")}
                            tooltip
                            data-tooltip={T("FL5")}
                            onclick={getConfigFileName}
                        />
                        <div class="d-flex" style="justify-content:center">
                            <Field
                                type="select"
                                label={T("FL2")}
                                options={configFilesList}
                                inline
                                setValue={(value) => {
                                    currentConfig = value
                                        ? value
                                        : currentConfig
                                    setCurrentConfigFileName(currentConfig)
                                    if (value && value.length > 0)
                                        if (
                                            document.getElementById(
                                                "buttonSetConfigFileName"
                                            )
                                        )
                                            document
                                                .getElementById(
                                                    "buttonSetConfigFileName"
                                                )
                                                .classList.remove("d-none")
                                }}
                                value={currentConfig}
                                button={button}
                            />
                        </div>
                        {currentConfigFilename && isEditionMode && (
                            <textarea
                                spellcheck="false"
                                ref={editorRef}
                                class="m-1 yaml-editor"
                                value={formatArrayToYaml(currentFileConfig)}
                                onchange={(e) => {
                                    editedCurrentFileConfig =
                                        formatYamlToFormatedArray(
                                            e.target.value
                                        )
                                }}
                            ></textarea>
                        )}
                        {currentFileConfig.length > 0 && !isEditionMode && (
                            <div>
                                <CenterLeft
                                    bordered={
                                        isImport || hasRemovedLines
                                            ? "warning"
                                            : "normal"
                                    }
                                >
                                    {currentFileConfig.map((element) => {
                                        if (element.type == "newline")
                                            return <div />
                                        if (element.type == "comment")
                                            return (
                                                <div class="m-1 text-primary text-italic">
                                                    <div
                                                        style={`white-space: pre;`}
                                                    >
                                                        {element.value}
                                                    </div>
                                                </div>
                                            )

                                        const [validation, setvalidation] =
                                            useState()
                                        return (
                                            <div class="m-1">
                                                <div
                                                    style={`margin-left:${element.indentation}rem!important`}
                                                >
                                                    <Field
                                                        inline="true"
                                                        type={
                                                            element.type ==
                                                            "section"
                                                                ? "label"
                                                                : "text"
                                                        }
                                                        label={element.label}
                                                        value={element.value}
                                                        setValue={(
                                                            val,
                                                            update = false
                                                        ) => {
                                                            if (!update) {
                                                                element.value =
                                                                    val
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
                                            </div>
                                        )
                                    })}
                                </CenterLeft>
                            </div>
                        )}
                    </center>
                )}
            </center>
            {!isLoading && currentConfigFilename && (
                <center>
                    <ButtonImg
                        m2
                        icon={isEditionMode ? <Edit3 /> : <Edit />}
                        label={isEditionMode ? T("FL12") : T("FL11")}
                        tooltip
                        data-tooltip={T("FL10")}
                        onclick={(e) => {
                            useUiContextFn.haptic()
                            e.target.blur()
                            if (editionMode) {
                                editedCurrentFileConfig =
                                    formatYamlToFormatedArray(
                                        editorRef.current.value
                                    )
                                syncChanges()
                            }
                            editionMode = !editionMode
                            setIsEditionMode(editionMode)
                        }}
                    />
                    {!isEditionMode && (
                        <ButtonImg
                            m2
                            icon={<Download />}
                            label={T("S54")}
                            tooltip
                            data-tooltip={T("S55")}
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                inputFile.current.value = ""
                                inputFile.current.click()
                            }}
                        />
                    )}
                    {!isEditionMode && (
                        <ButtonImg
                            m2
                            icon={<ExternalLink />}
                            label={T("S52")}
                            tooltip
                            data-tooltip={T("S53")}
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                saveArrayYamlToLocalFile(
                                    currentFileConfig,
                                    currentConfigFilename
                                )
                            }}
                        />
                    )}
                    {!isEditionMode && (
                        <ButtonImg
                            m2
                            icon={<Save />}
                            label={T("S61")}
                            tooltip
                            data-tooltip={T("S62")}
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                onSaveArrayYamlToFS(
                                    currentFileConfig,
                                    currentConfigFilename
                                )
                            }}
                        />
                    )}
                    {!isEditionMode && (
                        <ButtonImg
                            m2
                            icon={<RotateCcw />}
                            label={T("S58")}
                            tooltip
                            data-tooltip={T("S59")}
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                askReStartBoard(true)
                            }}
                        />
                    )}
                </center>
            )}
        </div>
    )
}

export { MachineSettings }
