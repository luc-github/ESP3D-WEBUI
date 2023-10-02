/*
 index.js - ESP3D WebUI areas file

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
import { h, Fragment } from "preact"
import { Menu } from "./menu"
import { Informations } from "./informations"
import { ConnectionContainer } from "./connection"
import { MainContainer } from "./main"
import { useUiContext, useUiContextFn } from "../contexts/UiContext"
import { useSettingsContext } from "../contexts/SettingsContext"
import { useSettings, useHttpQueue } from "../hooks"
import { useEffect } from "preact/hooks"
import { showLogin, showKeepConnected, showModal } from "../components/Modal"
import { espHttpURL, dispatchToExtensions } from "../components/Helpers"
import { T, baseLangRessource } from "../components/Translations"
import { HelpCircle, Layout } from "preact-feather"
/*
 * Local const
 *
 */

const ViewContainer = () => {
    const { connection, dialogs } = useUiContext()
    if (dialogs.needLogin == true) {
        dialogs.setNeedLogin(false)
        showLogin()
    }
    if (dialogs.showKeepConnected == true) {
        dialogs.setShowKeepConnected(false)
        showKeepConnected()
    }
    if (
        connection.connectionState.connected &&
        connection.connectionState.authenticate &&
        !connection.connectionState.updating
    )
        return (
            <Fragment>
                <Menu />
                <MainContainer />
            </Fragment>
        )
    else {
        return <ConnectionContainer />
    }
}

const ContentContainer = () => {
    const { getConnectionSettings, getInterfaceSettings } = useSettings()
    const { connectionSettings } = useSettingsContext()
    const { createNewRequest } = useHttpQueue()
    const { toasts, modals } = useUiContext()

    const processExtensionMessage = (eventMsg) => {
        if (eventMsg.data.type && eventMsg.data.target == "webui") {
            switch (eventMsg.data.type) {
                case "response":
                    //TBD: if need real both way communication
                    //between iFrame and Main UI
                    break
                case "cmd":
                    createNewRequest(
                        espHttpURL("command", {
                            cmd: eventMsg.data.content,
                        }),
                        { method: "GET" },
                        {
                            onSuccess: (result) => {
                                if (!eventMsg.data.noDispatch)
                                    dispatchToExtensions(
                                        "cmd",
                                        {
                                            status: "success",
                                            response: result,
                                            initiator: eventMsg.data,
                                        },
                                        eventMsg.data.id
                                    )
                            },
                            onFail: (error) => {
                                toasts.addToast({
                                    content: error,
                                    type: "error",
                                })
                                console.log(error)
                                if (!eventMsg.data.noDispatch)
                                    dispatchToExtensions(
                                        "cmd",
                                        {
                                            status: "error",
                                            error: error,
                                            initiator: eventMsg.data,
                                        },
                                        eventMsg.data.id
                                    )
                            },
                        }
                    )
                    break
                case "query":
                    createNewRequest(
                        espHttpURL(eventMsg.data.url, eventMsg.data.args),
                        { method: "GET" },
                        {
                            onSuccess: (result) => {
                                if (!eventMsg.data.noDispatch)
                                    dispatchToExtensions(
                                        "query",
                                        {
                                            status: "success",
                                            response: result,
                                            initiator: eventMsg.data,
                                        },
                                        eventMsg.data.id
                                    )
                            },
                            onFail: (error) => {
                                toasts.addToast({
                                    content: error,
                                    type: "error",
                                })
                                console.log(error)
                                if (!eventMsg.data.noDispatch)
                                    dispatchToExtensions(
                                        "query",
                                        {
                                            status: "error",
                                            error: error,
                                            initiator: eventMsg.data,
                                        },
                                        eventMsg.data.id
                                    )
                            },
                        }
                    )
                    break
                case "upload":
                    const formData = new FormData()
                    const file = new File(
                        [eventMsg.data.content],
                        eventMsg.data.filename
                    )
                    const initiator = {
                        type: "upload",
                        id: eventMsg.data.id,
                        url: eventMsg.data.url,
                        target: eventMsg.data.target,
                        path: eventMsg.data.path,
                        filename: eventMsg.data.filename,
                        size: eventMsg.data.size,
                        args: eventMsg.data.args,
                        noDispatch: eventMsg.data.noDispatch,
                    }
                    //TODO add support for additional POST arguments if needed
                    formData.append("path", eventMsg.data.path)
                    formData.append(
                        eventMsg.data.filename + "S",
                        eventMsg.data.size
                    )
                    formData.append("myfiles", file, eventMsg.data.filename)
                    createNewRequest(
                        espHttpURL(eventMsg.data.url, eventMsg.data.args),
                        {
                            method: "POST",
                            id: eventMsg.data.id,
                            body: formData,
                        },
                        {
                            onSuccess: (result) => {
                                if (!eventMsg.data.noDispatch)
                                    dispatchToExtensions(
                                        "upload",
                                        {
                                            status: "success",
                                            response: result,
                                            initiator: initiator,
                                        },
                                        eventMsg.data.id
                                    )
                            },
                            onFail: (error) => {
                                toasts.addToast({
                                    content: error,
                                    type: "error",
                                })
                                if (!eventMsg.data.noDispatch)
                                    dispatchToExtensions(
                                        "upload",
                                        {
                                            status: "error",
                                            error,
                                            finitiator: initiator,
                                        },
                                        eventMsg.data.id
                                    )
                            },
                            onProgress: (e) => {
                                if (!eventMsg.data.noDispatch)
                                    dispatchToExtensions(
                                        "upload",
                                        {
                                            status: "progress",
                                            progress: e,
                                            initiator: initiator,
                                        },
                                        eventMsg.data.id
                                    )
                            },
                        }
                    )
                    break
                case "download":
                    createNewRequest(
                        espHttpURL(eventMsg.data.url, eventMsg.data.args),
                        { method: "GET", id: "download" },
                        {
                            onSuccess: (result) => {
                                if (!eventMsg.data.noDispatch)
                                    dispatchToExtensions(
                                        "download",
                                        {
                                            status: "success",
                                            response: result,
                                            initiator: eventMsg.data,
                                        },
                                        eventMsg.data.id
                                    )
                            },
                            onFail: (error) => {
                                toasts.addToast({
                                    content: error,
                                    type: "error",
                                })
                                if (!eventMsg.data.noDispatch)
                                    dispatchToExtensions(
                                        "download",
                                        {
                                            status: "error",
                                            error: error,
                                            initiator: eventMsg.data,
                                        },
                                        eventMsg.data.id
                                    )
                            },
                            onProgress: (e) => {
                                if (!eventMsg.data.noDispatch)
                                    dispatchToExtensions(
                                        "download",
                                        {
                                            status: "progress",
                                            progress: e,
                                            initiator: eventMsg.data,
                                        },
                                        eventMsg.data.id
                                    )
                            },
                        }
                    )
                    break
                case "toast":
                    toasts.addToast({
                        content: eventMsg.data.content.text,
                        type: eventMsg.data.content.type,
                    })
                    break
                case "modal":
                    let inputData = ""
                    const content = eventMsg.data.content
                    const cb1 = () => {
                        setTimeout(() => {
                            dispatchToExtensions(
                                "modal",
                                {
                                    response: content.response1,
                                    inputData: inputData,
                                    initiator: eventMsg.data,
                                },
                                eventMsg.data.id
                            )
                        }, 500)
                    }
                    const cb2 = () => {
                        setTimeout(() => {
                            dispatchToExtensions(
                                "modal",
                                {
                                    response: content.response2,
                                    inputData: inputData,
                                    initiator: eventMsg.data,
                                },
                                eventMsg.data.id
                            )
                        }, 500)
                    }

                    showModal({
                        modals,
                        title: T(content.title),
                        button2: content.bt2Txt
                            ? {
                                  cb: cb2,
                                  text: T(content.bt2Txt),
                              }
                            : null,
                        button1: content.bt1Txt
                            ? {
                                  cb: cb1,
                                  text: T(content.bt1Txt),
                              }
                            : null,
                        icon:
                            content.style == "question" ? (
                                <HelpCircle />
                            ) : (
                                <Layout />
                            ),
                        id: content.id,
                        content: (
                            <Fragment>
                                <div>{T(content.text)}</div>
                                {content.style == "input" && (
                                    <input
                                        class="form-input"
                                        onInput={(e) => {
                                            inputData = e.target.value.trim()
                                        }}
                                    />
                                )}
                            </Fragment>
                        ),
                        hideclose: content.hideclose,
                        overlay: content.overlay,
                    })
                    break
                case "sound":
                    if (eventMsg.data.content == "beep") useUiContextFn.beep()
                    if (eventMsg.data.content == "error")
                        useUiContextFn.beepError()
                    if (eventMsg.data.content == "seq")
                        useUiContextFn.beepSeq(eventMsg.data.seq)
                    break
                case "translate":
                    if (eventMsg.data.all) {
                        dispatchToExtensions(
                            "translate",
                            {
                                response: baseLangRessource,
                                initiator: eventMsg.data,
                            },
                            eventMsg.data.id
                        )
                    } else {
                        dispatchToExtensions(
                            "translate",
                            {
                                response: T(eventMsg.data.content),
                                initiator: eventMsg.data,
                            },
                            eventMsg.data.id
                        )
                    }
                    break
                case "capabilities":
                    dispatchToExtensions(
                        "capabilities",
                        {
                            response: JSON.parse(
                                JSON.stringify(connectionSettings.current)
                            ),
                            initiator: eventMsg.data,
                        },
                        eventMsg.data.id
                    )
                    break
                case "dispatch":
                    dispatchToExtensions(
                        "dispatch",
                        {
                            response: eventMsg.data.content,
                            initiator: eventMsg.data,
                        },
                        eventMsg.data.targetid
                    )
                    break

                default:
                    //core and stream are only supposed to come from ESP3D or main FW
                    return
            }
        }
    }

    useEffect(() => {
        getConnectionSettings(getInterfaceSettings)
        window.addEventListener("message", processExtensionMessage, false)
    }, [])
    return <ViewContainer />
}

export { ContentContainer }
