/*
 extensionBridge.js - ESP3D WebUI extension message bridge

 Copyright (c) 2020 Luc Lebosse. All rights reserved.
 Modified by Luc LEBOSSE 2021

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public
 License as published by the Free Software Foundation; either
 version 3 of the License, or (at your option) any later version.

 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.

 You should have received a copy of the GNU General Public
 License along with This code; if not, see <https://www.gnu.org/licenses/>.
*/

/*
 * Message bridge between the WebUI and the extensions running in
 * iframe.extensionContainer elements. Extensions post messages
 * ({ type, target: "webui", id, ... }) to the parent window; each type
 * has a handler in the table below. Responses are dispatched back with
 * dispatchToExtensions().
 *
 * createExtensionBridge(deps) builds the window "message" listener;
 * deps: { createNewRequest, toasts, modals, connectionSettings,
 *         interfaceSettings, featuresSettings }
 */
import { h, Fragment, render } from "preact"
import { HelpCircle, Layout } from "preact-feather"
import { Field, FieldGroup } from "../components/Controls"
import { showModal } from "../components/Modal"
import {
    espHttpURL,
    dispatchToExtensions,
    clone,
    scanFlag,
} from "../components/Helpers"
import { T, baseLangRessource } from "../components/Translations"
import { iconsFeather } from "../components/Images"
import { machineSettings } from "../targets"
import { useUiContextFn } from "../contexts/UiContext"
import { useSettingsContextFn } from "../contexts/SettingsContext"
import {
    generateValidationGlobal as generateValidation,
    exportPreferencesSection,
    importPreferencesSection,
} from "../tabs/interface"

//Only accept messages coming from real extensions
//(iframes with class extensionContainer)
const isFromExtension = (eventMsg) => {
    try {
        const sourceWin = eventMsg.source
        if (!sourceWin || typeof document === "undefined") return false
        const frames = document.querySelectorAll("iframe.extensionContainer")
        for (let i = 0; i < frames.length; i++) {
            if (frames[i].contentWindow === sourceWin) return true
        }
    } catch (e) {
        // If anything goes wrong determining the source, ignore the message
    }
    return false
}

const createExtensionBridge = ({
    createNewRequest,
    toasts,
    modals,
    connectionSettings,
    interfaceSettings,
    featuresSettings,
}) => {
    //proxy an ESP request and dispatch the outcome to the initiating extension
    const proxyRequest = (
        type,
        data,
        url,
        options,
        initiator = data,
        withProgress = false
    ) => {
        const callbacks = {
            onSuccess: (result) => {
                if (!data.noDispatch)
                    dispatchToExtensions(
                        type,
                        { status: "success", response: result, initiator },
                        data.id
                    )
            },
            onFail: (error) => {
                console.log(error)
                if (!data.noDispatch)
                    dispatchToExtensions(
                        type,
                        { status: "error", error, initiator },
                        data.id
                    )
            },
        }
        if (withProgress) {
            callbacks.onProgress = (e) => {
                if (!data.noDispatch)
                    dispatchToExtensions(
                        type,
                        { status: "progress", progress: e, initiator },
                        data.id
                    )
            }
        }
        createNewRequest(url, options, callbacks)
    }

    const showExtensionModal = (data) => {
        let inputData = null
        const validationBtn = {}
        const content = data.content
        const hasError = () => {
            if (content.style == "fields") {
                return scanFlag(content.fields, "haserror")
            }
            return false
        }

        const exportResult = () => {
            const settingsValues = {}
            if (content.style == "fields") {
                settingsValues.values = inputData
                settingsValues.export = exportPreferencesSection(
                    settingsValues,
                    false
                )
            } else {
                settingsValues.export = inputData
            }

            return settingsValues.export
        }
        const cb1 = () => {
            if (
                (content.style == "fields" || content.style == "input") &&
                content.validation == "bt1"
            ) {
                if (hasError()) {
                    return
                }
                modals.removeModal(modals.getModalIndex(content.id))
            }

            setTimeout(() => {
                dispatchToExtensions(
                    "modal",
                    {
                        response: content.response1,
                        inputData:
                            content.validation == "bt1" ? exportResult() : "",
                        initiator: data,
                    },
                    data.id
                )
            }, 500)
        }
        const cb2 = () => {
            if (
                (content.style == "fields" || content.style == "input") &&
                content.validation == "bt2"
            ) {
                if (hasError()) {
                    return
                }
                modals.removeModal(modals.getModalIndex(content.id))
            }

            setTimeout(() => {
                dispatchToExtensions(
                    "modal",
                    {
                        response: content.response2,
                        //was: exportPreferences(exportResult(), false) which
                        //referenced a non-imported symbol (ReferenceError)
                        inputData:
                            content.validation == "bt2" ? exportResult() : "",
                        initiator: data,
                    },
                    data.id
                )
            }, 500)
        }
        if (content.style == "fields") {
            if (content.validation == "bt1") {
                validationBtn.id = content.bt1Id ? content.bt1Id : "bt1"
            }
            if (content.validation == "bt2") {
                validationBtn.id = content.bt2Id ? content.bt2Id : "bt2"
            }
        }
        if (content.style == "input") {
            inputData = content.value
        }
        const modalContent = {}
        if (content.style == "fields") {
            //merge format and fields

            const [newFields, hasErrors] = importPreferencesSection(
                content.fields,
                content.values
            )
            inputData = newFields

            //This function is a replacement of the hook feature which is not available in this context
            const checkValidation = (fieldData) => {
                const id_group = "group-" + fieldData.id
                if (typeof fieldData.initial == "undefined") {
                    fieldData.initial = fieldData.value
                }
                const validation = generateValidation(fieldData)
                const element = document.getElementById(id_group)
                const divToRemove =
                    element.getElementsByClassName("form-input-hint")
                if (divToRemove.length > 0) {
                    element.removeChild(divToRemove[0])
                }
                if (validation.modified && validation.valid) {
                    element.classList.add("has-modification")
                    const newDiv = document.createElement("div")
                    render(validation.message, newDiv)
                    newDiv.appendChild = validation.message
                    newDiv.classList.add("form-input-hint", "text-center")
                    element.appendChild(newDiv)
                } else {
                    document
                        .getElementById(id_group)
                        .classList.remove("has-modification")
                }
                if (!validation.valid) {
                    document.getElementById(id_group).classList.add("has-error")
                    const newDiv = document.createElement("div")
                    newDiv.innerHTML = T(validation.message)
                    newDiv.classList.add("form-input-hint", "text-center")

                    element.appendChild(newDiv)
                } else {
                    document
                        .getElementById(id_group)
                        .classList.remove("has-error")
                }

                if (document.getElementById(validationBtn.id)) {
                    if (hasError()) {
                        document.getElementById(
                            validationBtn.id
                        ).style.visibility = "hidden"
                    } else {
                        document.getElementById(
                            validationBtn.id
                        ).style.visibility = "visible"
                    }
                }
            }
            const renderFields = () => {
                const section = inputData
                return Object.keys(section).map((subsectionId) => {
                    const fieldData = section[subsectionId]
                    //console.log(fieldData)
                    if (fieldData.type == "group") {
                        return (
                            <FieldGroup
                                id={fieldData.id}
                                label={T(fieldData.label)}
                            >
                                {Object.keys(fieldData.value).map((subData) => {
                                    const subFieldData = fieldData.value[subData]
                                    const {
                                        label,
                                        initial,
                                        type,
                                        ...rest
                                    } = subFieldData
                                    return (
                                        <Field
                                            label={T(subFieldData.label)}
                                            value={subFieldData.value}
                                            type={subFieldData.type}
                                            setValue={(val, update = false) => {
                                                if (!update) {
                                                    subFieldData.value = val
                                                }
                                                checkValidation(subFieldData)
                                            }}
                                            {...rest}
                                        />
                                    )
                                })}
                            </FieldGroup>
                        )
                    } else {
                        const { label, initial, type, ...rest } = fieldData
                        return (
                            <Field
                                label={T(label)}
                                type={type}
                                inline={
                                    type == "boolean" || type == "icon"
                                        ? true
                                        : false
                                }
                                {...rest}
                                setValue={(val, update = false) => {
                                    if (!update) {
                                        fieldData.value = val
                                    }
                                    checkValidation(fieldData)
                                }}
                            />
                        )
                    }
                })
            }

            modalContent.content = renderFields()
        } else {
            modalContent.content = T(content.text)
        }
        let modal_content = modalContent.content
        if (content.style != "fields") {
            modal_content = (
                <div
                    dangerouslySetInnerHTML={{ __html: modalContent.content }}
                ></div>
            )
        }
        showModal({
            modals,
            title: T(content.title),
            button2: content.bt2Txt
                ? {
                      cb: cb2,
                      text: T(content.bt2Txt),
                      id: "bt2",
                      noclose: content.validation == "bt2" ? true : false,
                  }
                : null,
            button1: content.bt1Txt
                ? {
                      cb: cb1,
                      text: T(content.bt1Txt),
                      id: "bt1",
                      noclose: content.validation == "bt1" ? true : false,
                  }
                : null,
            icon: content.icon ? (
                iconsFeather[content.icon]
            ) : content.style == "question" ? (
                <HelpCircle />
            ) : (
                <Layout />
            ),
            id: content.id,
            content: (
                <Fragment>
                    {modal_content}
                    {content.style == "input" && (
                        <input
                            class="form-input"
                            onInput={(e) => {
                                inputData = e.target.value.trim()
                            }}
                            value={content.value}
                        />
                    )}
                </Fragment>
            ),
            hideclose: content.hideclose,
            overlay: content.overlay,
        })
    }

    const saveExtensionData = (data) => {
        //Get extension name
        const section = data.id
        //Get extensions settings
        const dataToSave = data.content
        //Some sanity check
        if (!interfaceSettings.current.extensions) {
            interfaceSettings.current.extensions = {}
        }
        if (!interfaceSettings.current.extensions[section]) {
            interfaceSettings.current.extensions[section] = {}
        }
        //Update the settings
        //Note: it will overwrite the whole section
        interfaceSettings.current.extensions[section] = dataToSave

        //now do a copy of interfaceSettings
        const interfaceSettingsData = clone(interfaceSettings.current)

        //now update the settings section with export version
        interfaceSettingsData.settings = exportPreferencesSection(
            interfaceSettingsData.settings,
            false,
            true
        )

        //now stringify and save
        const preferencestosave = JSON.stringify(interfaceSettingsData)
        //Create a blob
        const blob = new Blob([preferencestosave], {
            type: "application/json",
        })
        //Create a file
        const preferencesFileName =
            useSettingsContextFn.getValue("HostUploadPath") + "preferences.json"
        const formDataExtensions = new FormData()
        const file_to_save = new File([blob], preferencesFileName)
        formDataExtensions.append(
            "path",
            useSettingsContextFn.getValue("HostUploadPath")
        )
        formDataExtensions.append("creatPath", "true")
        formDataExtensions.append(
            preferencesFileName + "S",
            preferencestosave.length
        )
        formDataExtensions.append("myfiles", file_to_save, preferencesFileName)
        //Send the file
        createNewRequest(
            espHttpURL(useSettingsContextFn.getValue("HostTarget")),
            {
                method: "POST",
                id: "preferences",
                body: formDataExtensions,
            },
            {
                onSuccess: (result) => {
                    dispatchToExtensions(
                        "extensionsData",
                        {
                            response: { status: "success" },
                            initiator: data,
                        },
                        data.id
                    )
                },
                onFail: (error) => {
                    dispatchToExtensions(
                        "extensionsData",
                        {
                            response: { status: "error" },
                            initiator: data,
                        },
                        data.id
                    )
                },
            }
        )
    }

    const sendCapabilities = (data) => {
        let response = {}
        switch (data.id) {
            case "connection":
                response = clone(connectionSettings.current)
                break
            case "settings":
                response = clone(machineSettings)
                break
            case "interface":
                response = clone(interfaceSettings.current)
                break
            case "features":
                response = clone(featuresSettings.current)
                break
            case "extensions":
                if (
                    interfaceSettings.current.extensions &&
                    interfaceSettings.current.extensions[data.name]
                ) {
                    response = clone(interfaceSettings.current.extensions[data.name])
                } else {
                    //string on purpose: historical shape of the empty answer
                    response = "{}"
                }
                break
            default:
                response = {}
        }
        dispatchToExtensions(
            "capabilities",
            { response: response, initiator: data },
            data.id
        )
    }

    const sendIcon = (data) => {
        const iconToSend = iconsFeather[data.id]
        let iconSvgString = ""
        if (iconToSend) {
            //Temporary DOM
            const tempElement = document.createElement("div")
            //DO icon rendering
            render(iconToSend, tempElement)
            //Get the SVG string
            iconSvgString = tempElement.firstChild.outerHTML
            //Delete the temporary DOM
            tempElement.remove()
        } else {
            console.error("Icon not found:", data.id)
        }

        dispatchToExtensions(
            "icon",
            {
                response: iconSvgString.replaceAll("\"", "'"),
                initiator: data,
            },
            data.id
        )
    }

    //one handler per extension message type
    const handlers = {
        //TBD: if need real both way communication between iFrame and Main UI
        response: () => {},
        cmd: (data) =>
            proxyRequest(
                "cmd",
                data,
                espHttpURL("command", { cmd: data.content }),
                { method: "GET" }
            ),
        query: (data) =>
            proxyRequest("query", data, espHttpURL(data.url, data.args), {
                method: "GET",
                echo: data.url == "command" ? data.args.cmd : null,
            }),
        upload: (data) => {
            const formData = new FormData()
            const file = new File([data.content], data.filename)
            const initiator = {
                type: "upload",
                id: data.id,
                url: data.url,
                target: data.target,
                path: data.path,
                filename: data.filename,
                size: data.size,
                args: data.args,
                noDispatch: data.noDispatch,
            }
            //TODO add support for additional POST arguments if needed
            formData.append("path", data.path)
            formData.append(data.filename + "S", data.size)
            formData.append("myfiles", file, data.filename)
            proxyRequest(
                "upload",
                data,
                espHttpURL(data.url, data.args),
                { method: "POST", id: data.id, body: formData },
                initiator,
                true
            )
        },
        download: (data) =>
            proxyRequest(
                "download",
                data,
                espHttpURL(data.url, data.args),
                { method: "GET", id: "download" },
                data,
                true
            ),
        toast: (data) =>
            toasts.addToast({
                content: data.content.text,
                type: data.content.type,
            }),
        modal: showExtensionModal,
        sound: (data) => {
            if (data.content == "beep") useUiContextFn.beep()
            if (data.content == "error") useUiContextFn.beepError()
            if (data.content == "seq") useUiContextFn.beepSeq(data.seq)
        },
        translate: (data) =>
            dispatchToExtensions(
                "translate",
                {
                    response: data.all
                        ? baseLangRessource
                        : T(data.content),
                    initiator: data,
                },
                data.id
            ),
        icon: sendIcon,
        extensionsData: saveExtensionData,
        capabilities: sendCapabilities,
        dispatch: (data) =>
            dispatchToExtensions(
                "dispatch",
                { response: data.content, initiator: data },
                data.targetid
            ),
    }

    const processExtensionMessage = (eventMsg) => {
        if (!isFromExtension(eventMsg)) return
        const data = eventMsg.data
        if (!data || !data.type || data.target != "webui") return
        const handler = handlers[data.type]
        //unknown types (core, stream...) are only supposed to come from
        //ESP3D or the main FW: ignore them
        if (!handler) return
        handler(data)
    }

    return processExtensionMessage
}

export { createExtensionBridge }
