/*
 index.js - ESP3D WebUI navigation tab file

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
import { ButtonImg, Loading, Progress } from "../../components/Controls"
import { useHttpQueue } from "../../hooks"
import { espHttpURL } from "../../components/Helpers"
import { T } from "../../components/Translations"
import {
    useUiContext,
    useSettingsContext,
    useWsContext,
    useUiContextFn,
} from "../../contexts"
import {
    RefreshCcw,
    RotateCcw,
    Save,
    ExternalLink,
    Flag,
    Download,
} from "preact-feather"
import {
    showConfirmationModal,
    showProgressModal,
} from "../../components/Modal"
import { Field } from "../../components/Controls"
import { formatStructure } from "./formatHelper"
import { exportFeatures } from "./exportHelper"
import { importFeatures } from "./importHelper"
import { restartdelay } from "../../targets"

const FeaturesTab = () => {
    const { toasts, modals, uisettings } = useUiContext()
    const { Disconnect } = useWsContext()
    const { createNewRequest, abortRequest } = useHttpQueue()
    const { featuresSettings } = useSettingsContext()
    const [isLoading, setIsLoading] = useState(true)
    const [showSave, setShowSave] = useState(true)
    const progressBar = {}
    const [features, setFeatures] = useState(featuresSettings.current)
    const inputFile = useRef(null)

    const getFeatures = () => {
        setIsLoading(true)
        createNewRequest(
            espHttpURL("command", { cmd: "[ESP400]json=yes" }),
            { method: "GET" },
            {
                onSuccess: (result) => {
                    try {
                        const jsonResult = JSON.parse(result)
                        if (
                            !jsonResult ||
                            jsonResult.cmd != 400 ||
                            jsonResult.status == "error" ||
                            !jsonResult.data
                        ) {
                            toasts.addToast({
                                content: T("S194"),
                                type: "error",
                            })
                            return
                        }
                        const feat = formatStructure(jsonResult.data)
                        featuresSettings.current = { ...feat }
                        setFeatures(featuresSettings.current)
                    } catch (e) {
                        console.log(e, T("S21"))
                        toasts.addToast({ content: T("S21"), type: "error" })
                    } finally {
                        setIsLoading(false)
                    }
                },
                onFail: (error) => {
                    setIsLoading(false)
                    console.log(error)
                    toasts.addToast({ content: error, type: "error" })
                },
            }
        )
    }

    /**
     * *Aborts the save request and displays an error message.*
     */
    function abortSave() {
        abortRequest("ESP401")
        toasts.addToast({ content: T("S175"), type: "error" })
        endProgression(false)
    }

    /**
     * * Remove the progression modal from the DOM.
     * * Set the `isLoading` flag to `false`.
     * * If the `needrestart` flag is `true`, show a confirmation modal asking the user if they want to
     * restart the board
     * @param needrestart - If true, the board will ask for restart after the progression is finished.
     */
    function endProgression(needrestart) {
        modals.removeModal(modals.getModalIndex("progression"))
        setIsLoading(false)
        if (needrestart) {
            showConfirmationModal({
                modals,
                title: T("S58"),
                content: T("S174"),
                button1: { cb: reStartBoard, text: T("S27") },
                button2: { text: T("S28") },
            })
        }
    }

    /**
     * It sends a command to the ESP to save the current value of the entry to the ESP's memory
     * @param entry - the entry to save
     * @param index - the index of the current entry in the list of entries
     * @param total - the total number of entries to save
     * @param needrestart - If true, the ESP will be restarted after the save.
     */
    function saveEntry(entry, index, total, needrestart) {
        let cmd =
            "[ESP401]P=" +
            entry.id +
            " T=" +
            entry.cast +
            " V=" +
            entry.value +
            " json=yes"
        createNewRequest(
            espHttpURL("command", { cmd }),
            { method: "GET", id: "ESP401" },
            {
                onSuccess: (result) => {
                    try {
                        progressBar.update(index + 1)
                        const jsonResult = JSON.parse(result)
                        if (
                            !jsonResult ||
                            jsonResult.cmd != 401 ||
                            jsonResult.status == "error" ||
                            !jsonResult.data
                        ) {
                            if (jsonResult.cmd != 401)
                                toasts.addToast({
                                    content: T("S194"),
                                    type: "error",
                                })
                            else if (jsonResult.status == "error")
                                toasts.addToast({
                                    content: T("S195"),
                                    type: "error",
                                })
                            return
                        }
                        entry.initial = entry.value
                    } catch (e) {
                        console.log(e)
                        toasts.addToast({ content: e, type: "error" })
                    } finally {
                        if (index == total - 1) {
                            endProgression(needrestart)
                        }
                    }
                },
                onFail: (error) => {
                    progressBar.update(index + 1)
                    console.log(error)
                    toasts.addToast({ content: error, type: "error" })
                    if (index == total - 1) {
                        endProgression(needrestart)
                    }
                },
            }
        )
    }

    /**
     * Save the settings to the board
     */
    function SaveSettings() {
        let needrestart = false
        let index = 0
        let total = 0
        setIsLoading(true)

        Object.keys(features).map((sectionId) => {
            const section = features[sectionId]
            Object.keys(section).map((subsectionId) => {
                const subsection = section[subsectionId]
                Object.keys(subsection).map((entryId) => {
                    const entry = subsection[entryId]
                    if (entry.initial != entry.value) total++
                    if (entry.needRestart == "1") needrestart = true
                })
            })
        })
        showProgressModal({
            modals,
            title: T("S91"),
            button1: { cb: abortSave, text: T("S28") },
            content: <Progress progressBar={progressBar} max={total} />,
        })
        Object.keys(features).map((sectionId) => {
            const section = features[sectionId]
            Object.keys(section).map((subsectionId) => {
                const subsection = section[subsectionId]
                Object.keys(subsection).map((entryId) => {
                    const entry = subsection[entryId]
                    if (entry.initial != entry.value) {
                        saveEntry(entry, index, total, needrestart)
                        index++
                    }
                })
            })
        })
    }

    /**
     * Check if the user has made changes
     * @returns a boolean value.
     */
    function checkSaveStatus() {
        let stringified = JSON.stringify(features)
        let hasmodified =
            stringified.indexOf('"hasmodified":true') == -1 ? false : true
        let haserrors =
            stringified.indexOf('"haserror":true') == -1 ? false : true
        if (haserrors || !hasmodified) return false
        return true
    }

    /**
     * * Create a new request to the ESP HTTP server.
     * * Set the method to GET.
     * * Set the onSuccess callback to reload page
     * * Set the onFail callback to the error toaster
     * * Send the request
     */
    function reStartBoard() {
        createNewRequest(
            espHttpURL("command", { cmd: "[ESP444]RESTART" }),
            { method: "GET" },
            {
                onSuccess: (result) => {
                    Disconnect("restart")
                    setTimeout(() => {
                        window.location.reload()
                    }, restartdelay * 1000)
                },
                onFail: (error) => {
                    console.log(error)
                    toasts.addToast({ content: error, type: "error" })
                },
            }
        )
        console.log("restart")
    }

    const fileSelected = () => {
        let haserrors = false
        if (inputFile.current.files.length > 0) {
            setIsLoading(true)
            const reader = new FileReader()
            reader.onload = function (e) {
                const importFile = e.target.result
                try {
                    const importData = JSON.parse(importFile)
                    ;[featuresSettings.current, haserrors] = importFeatures(
                        featuresSettings.current,
                        importData
                    )
                    if (haserrors) {
                        toasts.addToast({ content: "S56", type: "error" })
                    }
                    setFeatures(featuresSettings.current)
                } catch (e) {
                    console.log(e)
                    console.log("Error")
                    toasts.addToast({ content: "S56", type: "error" })
                } finally {
                    setIsLoading(false)
                }
            }
            reader.readAsText(inputFile.current.files[0])
        }
    }

    /**
     * Generate validation for a field
     * @param fieldData - The data for the field.
     * @returns The validation object
     */
    const generateValidation = (fieldData) => {
        let validation = {
            message: <Flag size="1rem" />,
            valid: true,
            modified: true,
        }
        if (fieldData.type == "text") {
            if (fieldData.cast == "A") {
                if (
                    !/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
                        fieldData.value
                    )
                )
                    validation.valid = false
            } else {
                if (typeof fieldData.min != undefined) {
                    if (fieldData.value.trim().length < fieldData.min) {
                        validation.valid = false
                    } else if (typeof fieldData.minSecondary != undefined) {
                        if (
                            fieldData.value.trim().length <
                                fieldData.minSecondary &&
                            fieldData.value.trim().length > fieldData.min
                        ) {
                            validation.valid = false
                        }
                    }
                }

                if (fieldData.max) {
                    if (fieldData.value.trim().length > fieldData.max) {
                        validation.valid = false
                    }
                }
            }
        } else if (fieldData.type == "number") {
            if (fieldData.max) {
                if (fieldData.value > fieldData.max) {
                    validation.valid = false
                }
            }
            if (fieldData.min) {
                if (fieldData.value < fieldData.min) {
                    validation.valid = false
                }
            }
        } else if (fieldData.type == "select") {
            const index = fieldData.options.findIndex(
                (element) => element.value == parseInt(fieldData.value)
            )
            if (index == -1) {
                validation.valid = false
            }
        }
        if (!validation.valid) {
            validation.message = T("S42")
        }
        fieldData.haserror = !validation.valid
        if (fieldData.value == fieldData.initial) {
            fieldData.hasmodified = false
        } else {
            fieldData.hasmodified = true
        }
        setShowSave(checkSaveStatus())
        if (!fieldData.hasmodified && !fieldData.haserror) return null
        return validation
    }

    useEffect(() => {
        if (
            featuresSettings.current &&
            Object.keys(featuresSettings.current).length != 0
        ) {
            setFeatures(featuresSettings.current)
            setIsLoading(false)
        } else {
            if (uisettings.getValue("autoload")) {
                getFeatures()
            } else setIsLoading(false)
        }
    }, [])
    console.log("feature")
    return (
        <div id="features">
            <input
                ref={inputFile}
                type="file"
                class="d-none"
                accept=".json"
                onChange={fileSelected}
            />
            <h4 class="show-low title">{T("S36")}</h4>
            <div class="m-2" />
            {isLoading && <Loading large />}

            {!isLoading && (
                <Fragment>
                    <div class="panels-container">
                        {Object.keys(features).length != 0 && (
                            <Fragment>
                                {Object.keys(features).map((sectionId) => {
                                    const section = features[sectionId]
                                    return (
                                        <Fragment>
                                            {Object.keys(section).map(
                                                (subsectionId) => {
                                                    const subSection =
                                                        section[subsectionId]
                                                    return (
                                                        <div class="panel panel-features">
                                                            <div class="navbar">
                                                                <span class="navbar-section text-ellipsis">
                                                                    <strong class="text-ellipsis">
                                                                        {T(
                                                                            subsectionId
                                                                        )}
                                                                    </strong>
                                                                </span>
                                                                <span class="navbar-section">
                                                                    <span style="height: 100%;">
                                                                        <span class="label label-primary align-top">
                                                                            {T(
                                                                                sectionId
                                                                            )}
                                                                        </span>
                                                                    </span>
                                                                </span>
                                                            </div>

                                                            <div class="panel-body panel-body-features">
                                                                {subSection.map(
                                                                    (
                                                                        fieldData
                                                                    ) => {
                                                                        const [
                                                                            validation,
                                                                            setvalidation,
                                                                        ] =
                                                                            useState()
                                                                        const {
                                                                            label,
                                                                            options,
                                                                            initial,
                                                                            ...rest
                                                                        } = fieldData
                                                                        const Options =
                                                                            options
                                                                                ? options.reduce(
                                                                                      (
                                                                                          acc,
                                                                                          curval
                                                                                      ) => {
                                                                                          return [
                                                                                              ...acc,
                                                                                              {
                                                                                                  label: T(
                                                                                                      curval.label
                                                                                                  ),
                                                                                                  value: curval.value,
                                                                                              },
                                                                                          ]
                                                                                      },
                                                                                      []
                                                                                  )
                                                                                : null
                                                                        return (
                                                                            <Field
                                                                                label={T(
                                                                                    label
                                                                                )}
                                                                                options={
                                                                                    Options
                                                                                }
                                                                                extra={
                                                                                    subsectionId ==
                                                                                        "sta" &&
                                                                                    label ==
                                                                                        "SSID"
                                                                                        ? "scan"
                                                                                        : null
                                                                                }
                                                                                {...rest}
                                                                                setValue={(
                                                                                    val,
                                                                                    update
                                                                                ) => {
                                                                                    if (
                                                                                        !update
                                                                                    )
                                                                                        fieldData.value =
                                                                                            val
                                                                                    setvalidation(
                                                                                        generateValidation(
                                                                                            fieldData
                                                                                        )
                                                                                    )
                                                                                }}
                                                                                validation={
                                                                                    validation
                                                                                }
                                                                            />
                                                                        )
                                                                    }
                                                                )}
                                                                <div class="m-1" />
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            )}
                                        </Fragment>
                                    )
                                })}
                            </Fragment>
                        )}
                    </div>
                </Fragment>
            )}
            <center>
                <br />
                {!isLoading && (
                    <ButtonImg
                        m2
                        label={T("S50")}
                        tooltip
                        data-tooltip={T("S23")}
                        icon={<RefreshCcw />}
                        onClick={() => {
                            useUiContextFn.haptic()
                            getFeatures()
                        }}
                    />
                )}
                {Object.keys(features).length != 0 && (
                    <Fragment>
                        <ButtonImg
                            m2
                            label={T("S54")}
                            tooltip
                            data-tooltip={T("S55")}
                            icon={<Download />}
                            onClick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                inputFile.current.value = ""
                                inputFile.current.click()
                            }}
                        />
                        <ButtonImg
                            m2
                            label={T("S52")}
                            tooltip
                            data-tooltip={T("S53")}
                            icon={<ExternalLink />}
                            onClick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                exportFeatures(featuresSettings.current)
                            }}
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
                                    SaveSettings()
                                }}
                            />
                        )}

                        <ButtonImg
                            m2
                            tooltip
                            data-tooltip={T("S59")}
                            label={T("S58")}
                            icon={<RotateCcw />}
                            onClick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                showConfirmationModal({
                                    modals,
                                    title: T("S58"),
                                    content: T("S59"),
                                    button1: {
                                        cb: reStartBoard,
                                        text: T("S27"),
                                    },
                                    button2: { text: T("S28") },
                                })
                            }}
                        />
                    </Fragment>
                )}
            </center>
            <br />
        </div>
    )
}

export { FeaturesTab }
