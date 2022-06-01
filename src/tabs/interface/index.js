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
import { useState, useRef } from "preact/hooks"
import {
    useUiContext,
    useSettingsContext,
    useUiContextFn,
} from "../../contexts"
import { ButtonImg, Loading } from "../../components/Controls"
import { useHttpQueue, useSettings } from "../../hooks"
import { espHttpURL } from "../../components/Helpers"
import { T } from "../../components/Translations"
import { RefreshCcw, Save, ExternalLink, Flag, Download } from "preact-feather"
import { Field, FieldGroup } from "../../components/Controls"
import { exportPreferences } from "./exportHelper"
import { importPreferences, formatPreferences } from "./importHelper"

const isDependenciesMet = (depend) => {
    const { interfaceSettings } = useSettingsContext()
    let met = false
    depend.forEach((d) => {
        if (d.id) {
            const element = useUiContextFn.getElement(
                d.id,
                interfaceSettings.current.settings
            )
            if (element.value == d.value) {
                met = true
            }
        }
    })
    return met
}

const InterfaceTab = () => {
    const { toasts, modals, connection } = useUiContext()
    const { createNewRequest, abortRequest } = useHttpQueue()
    const { getInterfaceSettings } = useSettings()
    const { interfaceSettings } = useSettingsContext()
    const [isLoading, setIsLoading] = useState(false)
    const [showSave, setShowSave] = useState(true)
    const inputFile = useRef(null)

    console.log("Interface")

    const generateValidation = (fieldData) => {
        const validation = {
            message: <Flag size="1rem" />,
            valid: true,
            modified: true,
        }
        if (fieldData.step) {
            if (fieldData.value % fieldData.step !== 0) {
                validation.message = <Flag size="1rem" color="red" />
                validation.valid = false
            }
        }
        if (fieldData.type == "list") {
            const stringified = JSON.stringify(fieldData.value)
            //check new item or modified item
            if (
                stringified.includes('"newItem":true') ||
                fieldData.nb != fieldData.value.length
            )
                fieldData.hasmodified = true
            else
                fieldData.hasmodified =
                    stringified.includes('"hasmodified":true')
            //check order change
            fieldData.value.forEach((element, index) => {
                if (element.index != index) fieldData.hasmodified = true
            })
            validation.valid = !stringified.includes('"haserror":true')
        }
        if (fieldData.type == "text") {
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
        } else if (fieldData.type == "number") {
            if (fieldData.max != undefined) {
                if (fieldData.value > parseInt(fieldData.max)) {
                    validation.valid = false
                }
            }
            if (fieldData.min != undefined) {
                if (fieldData.minSecondary != undefined) {
                    if (
                        fieldData.value != parseInt(fieldData.min) &&
                        fieldData.value < parseInt(fieldData.minsecondary)
                    ) {
                        validation.valid = false
                    }
                } else if (fieldData.value < parseInt(fieldData.min)) {
                    validation.valid = false
                }
            }
        } else if (fieldData.type == "select") {
            if (fieldData.name == "type" && fieldData.value == "camera") {
                //Update camera source automaticaly
                //Note: is there a less complexe way to do ?
                const sourceId = fieldData.id.split("-")[0]
                const extraList =
                    interfaceSettings.current.settings.extracontents
                //look for extra panels entry
                const subextraList =
                    extraList[
                        extraList.findIndex((element) => {
                            return element.id == "extracontents"
                        })
                    ].value
                //look for extra panel specific id
                const datavalue =
                    subextraList[
                        subextraList.findIndex((element) => {
                            return element.id == sourceId
                        })
                    ].value
                //get source item
                const sourceItemValue =
                    datavalue[
                        datavalue.findIndex((element) => {
                            return element.id == sourceId + "-source"
                        })
                    ]
                //force /snap as source
                sourceItemValue.value = "/snap"
            }
            const index = fieldData.options.findIndex(
                (element) =>
                    element.value == parseInt(fieldData.value) ||
                    element.value == fieldData.value
            )
            if (index == -1) {
                validation.valid = false
            }
        }
        if (!validation.valid) {
            validation.message = T("S42")
        }
        fieldData.haserror = !validation.valid
        if (fieldData.type != "list") {
            if (fieldData.value == fieldData.initial) {
                fieldData.hasmodified = false
            } else {
                fieldData.hasmodified = true
            }
            if (fieldData.newItem) fieldData.hasmodified = true
        }
        setShowSave(checkSaveStatus())
        if (!fieldData.hasmodified && !fieldData.haserror) {
            validation.message = null
            validation.valid = true
            validation.modified = false
        }
        return validation
    }

    function checkSaveStatus() {
        let stringified = JSON.stringify(interfaceSettings.current.settings)
        let hasmodified = stringified.includes('"hasmodified":true')
        let haserrors = stringified.includes('"haserror":true')
        if (haserrors || !hasmodified) return false
        return true
    }

    const getInterface = () => {
        useUiContextFn.haptic()
        setIsLoading(true)
        getInterfaceSettings(setIsLoading)
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
                    ;[interfaceSettings.current, haserrors] = importPreferences(
                        interfaceSettings.current,
                        importData
                    )
                    formatPreferences(interfaceSettings.current.settings)
                    if (haserrors) {
                        toasts.addToast({ content: "S56", type: "error" })
                        console.log("Error")
                    }
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

    const SaveSettings = () => {
        const preferencestosave = JSON.stringify(
            exportPreferences(interfaceSettings.current, false),
            null,
            " "
        )
        const blob = new Blob([preferencestosave], {
            type: "application/json",
        })
        const preferencesFileName = "preferences.json"
        const formData = new FormData()
        const file = new File([blob], preferencesFileName)
        formData.append("path", "/")
        formData.append(preferencesFileName + "S", preferencestosave.length)
        formData.append("myfiles", file, preferencesFileName)
        setIsLoading(true)
        createNewRequest(
            espHttpURL("files"),
            { method: "POST", id: "preferences", body: formData },
            {
                onSuccess: (result) => {
                    setTimeout(() => {
                        window.location.reload()
                    }, 1000)
                },
                onFail: (error) => {
                    setIsLoading(false)
                },
            }
        )
    }

    return (
        <div id="interface">
            <input
                ref={inputFile}
                type="file"
                class="d-none"
                accept=".json"
                onChange={fileSelected}
            />
            <h4 class="show-low title">{T("S17")}</h4>
            <div class="m-2" />
            {isLoading && <Loading large />}

            {!isLoading && (
                <Fragment>
                    {interfaceSettings.current.settings && (
                        <div class="panels-container">
                            {Object.keys(
                                interfaceSettings.current.settings
                            ).map((sectionId) => {
                                const section =
                                    interfaceSettings.current.settings[
                                        sectionId
                                    ]
                                return (
                                    <Fragment>
                                        <div class="panel panel-interface">
                                            <div class="navbar">
                                                <span class="navbar-section text-ellipsis">
                                                    <strong class="text-ellipsis">
                                                        {T(sectionId)}
                                                    </strong>
                                                </span>
                                            </div>
                                            <div class="panel-body panel-body-interface">
                                                {Object.keys(section).map(
                                                    (subsectionId) => {
                                                        const fieldData =
                                                            section[
                                                                subsectionId
                                                            ]
                                                        // console.log(fieldData);

                                                        if (
                                                            fieldData.type ==
                                                            "group"
                                                        ) {
                                                            //show group
                                                            if (
                                                                fieldData.depend
                                                            ) {
                                                                if (
                                                                    !isDependenciesMet(
                                                                        fieldData.depend
                                                                    )
                                                                ) {
                                                                    return
                                                                }
                                                            }
                                                            return (
                                                                <FieldGroup
                                                                    id={
                                                                        fieldData.id
                                                                    }
                                                                    label={T(
                                                                        fieldData.label
                                                                    )}
                                                                >
                                                                    {Object.keys(
                                                                        fieldData.value
                                                                    ).map(
                                                                        (
                                                                            subData
                                                                        ) => {
                                                                            const subFieldData =
                                                                                fieldData
                                                                                    .value[
                                                                                    subData
                                                                                ]
                                                                            const [
                                                                                validation,
                                                                                setvalidation,
                                                                            ] =
                                                                                useState()
                                                                            const {
                                                                                label,
                                                                                initial,
                                                                                type,
                                                                                ...rest
                                                                            } = subFieldData
                                                                            return (
                                                                                <Field
                                                                                    label={T(
                                                                                        label
                                                                                    )}
                                                                                    type={
                                                                                        type
                                                                                    }
                                                                                    validationfn={
                                                                                        generateValidation
                                                                                    }
                                                                                    inline={
                                                                                        type ==
                                                                                            "boolean" ||
                                                                                        type ==
                                                                                            "icon"
                                                                                            ? true
                                                                                            : false
                                                                                    }
                                                                                    {...rest}
                                                                                    setValue={(
                                                                                        val,
                                                                                        update = false
                                                                                    ) => {
                                                                                        if (
                                                                                            !update
                                                                                        ) {
                                                                                            subFieldData.value =
                                                                                                val
                                                                                        }
                                                                                        setvalidation(
                                                                                            generateValidation(
                                                                                                subFieldData
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
                                                                </FieldGroup>
                                                            )
                                                        } else {
                                                            const [
                                                                validation,
                                                                setvalidation,
                                                            ] = useState()
                                                            const {
                                                                label,
                                                                initial,
                                                                type,
                                                                ...rest
                                                            } = fieldData
                                                            return (
                                                                <Field
                                                                    label={T(
                                                                        label
                                                                    )}
                                                                    type={type}
                                                                    validationfn={
                                                                        type ==
                                                                        "list"
                                                                            ? generateValidation
                                                                            : null
                                                                    }
                                                                    inline={
                                                                        type ==
                                                                            "boolean" ||
                                                                        type ==
                                                                            "icon"
                                                                            ? true
                                                                            : false
                                                                    }
                                                                    {...rest}
                                                                    setValue={(
                                                                        val,
                                                                        update = false
                                                                    ) => {
                                                                        if (
                                                                            !update
                                                                        ) {
                                                                            fieldData.value =
                                                                                val
                                                                        }
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
                                                    }
                                                )}
                                                <div class="m-1" />
                                            </div>
                                        </div>
                                    </Fragment>
                                )
                            })}
                        </div>
                    )}
                    <center>
                        <br />
                        <ButtonImg
                            m2
                            label={T("S50")}
                            tooltip
                            data-tooltip={T("S23")}
                            icon={<RefreshCcw />}
                            onClick={getInterface}
                        />
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
                                exportPreferences(interfaceSettings.current)
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
                    </center>
                </Fragment>
            )}
        </div>
    )
}

export { InterfaceTab }
