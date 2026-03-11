/*
 useSettings.js - ESP3D WebUI hooks file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 Modified by Luc LEBOSSE 2021
 
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
import { useState } from "preact/hooks"
import { webUIversion } from "../components/App/version"
import {
    espHttpURL,
    getBrowserTime,
    getBrowserTimeZone,
    isLimitedEnvironment,
} from "../components/Helpers"
import { useHttpQueue } from "../hooks/"
import {
    useUiContext,
    useRouterContext,
    useSettingsContextFn,
    useSettingsContext
} from "../contexts"
import {
    baseLangRessource,
    setCurrentLanguage,
    T,
} from "../components/Translations"
import {
    defaultPreferences,
    useTargetContextFn,
    variablesList,
} from "../targets"
import {
    importPreferencesSection,
    formatPreferences,
} from "../tabs/interface/importHelper"
import { Frown, Info } from "preact-feather"
import { showModal } from "../components/Modal"

/*
 * Local const
 *
 */
const useSettings = () => {
    const { createNewRequest } = useHttpQueue()
    const { ui, toasts, modals, connection, uisettings } = useUiContext()
    const { processData } = useTargetContextFn
    const { interfaceSettings, connectionSettings, activity } =
        useSettingsContext()
    const { defaultRoute, setActiveRoute } = useRouterContext()
    const sendCommand = (cmd, id) => {
        createNewRequest(
            espHttpURL("command", {
                cmd,
            }).toString(),
            {
                method: "GET",
                id: id,
                max: 1,
            },
            {
                onSuccess: (result) => {
                    if (
                        cmd.startsWith("[ESP") &&
                        !result.startsWith("ESP3D says:")
                    ) {
                        processData("response", result, result.startsWith("{"))
                    }
                },
                onFail: (error) => {
                    toasts.addToast({
                        content: error,
                        type: "error",
                    })
                },
            }
        )
    }

    const initPolling = () => {
        //polling commands
        if (
            uisettings.getValue(
                "enablepolling",
                interfaceSettings.current.settings
            )
        ) {
            const pollingList = uisettings.getValue(
                "pollingcmds",
                interfaceSettings.current.settings
            )
            if (Array.isArray(pollingList)) {
                pollingList.forEach((cmdEntry) => {
                    const cmds = cmdEntry.value
                        .find((item) => item.name == "cmds")
                        .value.trim()
                        .split(";")
                    const refreshtime = parseInt(
                        cmdEntry.value.find(
                            (item) => item.name == "refreshtime"
                        ).value
                    )
                    //Send commands at start
                    if (cmds.length > 0) {
                        cmds.forEach((cmd, index) => {
                            if (cmd.trim().length > 0) {
                                if (
                                    typeof variablesList.formatCommand !==
                                    "undefined"
                                ) {
                                    sendCommand(
                                        variablesList.formatCommand(cmd),
                                        cmdEntry.id + "-" + index
                                    )
                                } else {
                                    sendCommand(cmd, cmdEntry.id + "-" + index)
                                }
                            }
                        })

                        if (refreshtime != 0) {
                            if (cmds.length > 0) {
                                activity.startPolling(
                                    cmdEntry.id,
                                    refreshtime,
                                    () => {
                                        cmds.forEach((cmd, index) => {
                                            if (cmd.trim().length > 0) {
                                                if (
                                                    typeof variablesList.formatCommand !==
                                                    "undefined"
                                                ) {
                                                    sendCommand(
                                                        variablesList.formatCommand(
                                                            cmd
                                                        ),
                                                        cmdEntry.id +
                                                            "-" +
                                                            index
                                                    )
                                                } else {
                                                    sendCommand(
                                                        cmd,
                                                        cmdEntry.id +
                                                            "-" +
                                                            index
                                                    )
                                                }
                                            }
                                        })
                                    }
                                )
                            }
                        }
                    }
                })
            }
        }
    }

    const getConnectionSettings = (next) => {
        createNewRequest(
            espHttpURL("command", {
                cmd: `[ESP800]json=yes time=${getBrowserTime()} tz=${getBrowserTimeZone()} version=${webUIversion}`,
            }),
            { method: "GET", id: "connection" },
            {
                onSuccess: (result) => {
                    const jsonResult = JSON.parse(result)
                    if (
                        jsonResult.cmd != 800 ||
                        jsonResult.status == "error" ||
                        !jsonResult.data
                    ) {
                        toasts.addToast({ content: T("S194"), type: "error" })

                        connection.setConnectionState({
                            connected: false,
                            authenticate: false,
                            page: "error",
                            extraMsg: T("S194"),
                        })
                        return
                    }
                    connectionSettings.current = jsonResult.data
                    if (
                        typeof connectionSettings.current.Screen == "undefined"
                    ) {
                        connectionSettings.current.Screen = "none"
                    }
                    processData("core", "ESP800", true)
                    //console.log(connectionSettings.current)
                    document.title = connectionSettings.current.Hostname
                    if (
                        !connectionSettings.current.HostPath ||
                        !connectionSettings.current.HostPath.length
                    ) {
                        connectionSettings.current.HostPath = "/"
                    }

                    if (!connectionSettings.current.HostPath.endsWith("/")) {
                        connectionSettings.current.HostPath =
                            connectionSettings.current.HostPath.concat("/")
                    }
                    if (connectionSettings.current.FlashFileSystem == "none") {
                        // no flash filesystem so host path is on SD card
                        connectionSettings.current.HostTarget = "sdfiles"
                        connectionSettings.current.HostUploadPath =
                            connectionSettings.current.HostPath
                        connectionSettings.current.HostDownloadPath =
                            connectionSettings.current.HostPath
                    } else {
                        //Flashs is supported but stil can use sd card to host files
                        if (
                            connectionSettings.current.HostPath.startsWith(
                                "/sd/"
                            ) &&
                            connectionSettings.current.SDConnection != "none"
                        ) {
                            connectionSettings.current.HostTarget = "sdfiles"
                            connectionSettings.current.HostUploadPath =
                                connectionSettings.current.HostPath.substring(3)
                            connectionSettings.current.HostDownloadPath =
                                connectionSettings.current.HostPath
                        } else {
                            //Flash filesystem is supported and host files are on flash filesystem
                            connectionSettings.current.HostTarget = "files"
                            connectionSettings.current.HostUploadPath =
                                connectionSettings.current.HostPath
                            connectionSettings.current.HostDownloadPath =
                                connectionSettings.current.HostPath
                        }
                    }

                    if (
                        (connectionSettings.current.WiFiMode &&
                            isLimitedEnvironment(
                                connectionSettings.current.WiFiMode
                            )) ||
                        (connectionSettings.current.RadioMode &&
                            isLimitedEnvironment(
                                connectionSettings.current.RadioMode
                            ))
                    ) {
                        showModal({
                            modals,
                            title: T("S123"),
                            icon: <Info />,
                            id: "notification",
                            content: T("S124").replace(
                                "%s",
                                connectionSettings.current.WebSocketIP +
                                    (connectionSettings.current.WebSocketPort !=
                                    "81"
                                        ? ":" +
                                          (parseInt(
                                              connectionSettings.current
                                                  .WebSocketPort
                                          ) -
                                              1)
                                        : "")
                            ),
                            hideclose: true,
                        })
                        return
                    }

                    if (jsonResult.FWTarget == 0) {
                        setActiveRoute("/settings")
                        defaultRoute.current = "/settings"
                    } else {
                        setActiveRoute("/dashboard")
                        defaultRoute.current = "/dashboard"
                    }
                    if (next) next()
                },
                onFail: (error) => {
                    if (!error.startsWith("401")) {
                        connection.setConnectionState({
                            connected: false,
                            authenticate: false,
                            page: "error",
                        })
                        toasts.addToast({ content: error, type: "error" })
                        console.log("Error")
                    }
                },
            }
        )
    }

    const getInterfaceSettings = (setLoading, next) => {
        interfaceSettings.current = { ...defaultPreferences }
        const finalizeDisplay = () => {
            //SetupWs
            connection.setConnectionState({
                connected: true,
                authenticate: true,
                page: "connecting",
            })
            document.title = connectionSettings.current.Hostname
            setTimeout(initPolling, 2000)
            console.log("Ui is ready")
            ui.setReady(true)
        }
        function loadTheme(themepack) {
            if (!themepack) {
                if (next) next()
                if (setLoading) {
                    setLoading(false)
                }
                finalizeDisplay()
                return
            }
            const elem = document.getElementById("themestyle")
            if (elem) elem.parentNode.removeChild(elem)

            if (themepack != "default") {
                //console.log("Loading theme: " + themepack)
                createNewRequest(
                    espHttpURL(
                        useSettingsContextFn.getValue("HostDownloadPath") +
                            themepack
                    ),
                    { method: "GET" },
                    {
                        onSuccess: (result) => {
                            var styleItem = document.createElement("style")
                            styleItem.type = "text/css"
                            styleItem.id = "themestyle"
                            styleItem.innerHTML = result
                            document.head.appendChild(styleItem)
                            if (next) next()
                            if (setLoading) {
                                setLoading(false)
                            }
                            finalizeDisplay()
                        },
                        onFail: (error) => {
                            if (next) next()
                            if (setLoading) {
                                setLoading(false)
                            }
                            finalizeDisplay()
                            console.log("error")
                            toasts.addToast({
                                content: error + " " + themepack,
                                type: "error",
                            })
                        },
                    }
                )
            } else {
                const elem = document.getElementById("themestyle")
                if (elem) elem.parentNode.removeChild(elem)
                if (next) next()
                if (setLoading) {
                    setLoading(false)
                }
                finalizeDisplay()
            }
        }
        createNewRequest(
            espHttpURL(
                useSettingsContextFn.getValue("HostDownloadPath") +
                    "preferences.json"
            ),
            { method: "GET" },
            {
                onSuccess: (result) => {
                    const jsonResult = JSON.parse(result)
                   
                    //console.log("preferences.json")
                    //console.log(jsonResult)
                    const [preferences_settings, haserrors] = importPreferencesSection(
                        defaultPreferences.settings,
                        jsonResult.settings
                    )
                    //console.log("Format preferences.settings")
                    formatPreferences(preferences_settings)
                    //console.log(preferences_settings)
                    uisettings.set(
                        JSON.parse(JSON.stringify(preferences_settings))
                    )
                    if (haserrors) {
                        toasts.addToast({
                            content: (
                                <span class="feather-icon-container">
                                    <Frown />
                                    <span class="m-1">preferences.json</span>
                                </span>
                            ),
                            type: "error",
                        })
                        console.log("error")
                    }
                    interfaceSettings.current.settings = preferences_settings
                    if (jsonResult.custom) {
                        interfaceSettings.current.custom = jsonResult.custom
                    }
                    if (jsonResult.extensions) {
                        interfaceSettings.current.extensions = jsonResult.extensions
                    }
                    //console.log("interfaceSettings.current")
                    //console.log(interfaceSettings.current)

                    //Mobile view
                    if (uisettings.getValue("mobileview", preferences_settings))
                        document
                            .getElementById("app")
                            .classList.add("mobile-view")
                    else
                        document
                            .getElementById("app")
                            .classList.remove("mobile-view")
                    //language
                    const languagepack = uisettings.getValue(
                        "language",
                        preferences_settings
                    )
                    const themepack = uisettings.getValue(
                        "theme",
                        preferences_settings
                    )
                    //set default first
                    setCurrentLanguage(baseLangRessource)
                    if (
                        !(
                            languagepack == "default" ||
                            languagepack == undefined
                        )
                    ) {
                        if (setLoading) {
                            setLoading(false)
                        }
                        createNewRequest(
                            espHttpURL(
                                useSettingsContextFn.getValue(
                                    "HostDownloadPath"
                                ) + languagepack
                            ),
                            { method: "GET" },
                            {
                                onSuccess: (result) => {
                                    const langjson = JSON.parse(result)
                                    setCurrentLanguage(langjson)
                                    loadTheme(themepack)
                                },
                                onFail: (error) => {
                                    loadTheme(themepack)
                                    console.log("Error")
                                    toasts.addToast({
                                        content: error + " " + languagepack,
                                        type: "error",
                                    })
                                },
                            }
                        )
                    } else {
                        loadTheme(themepack)
                    }
                },
                onFail: (error) => {
                    const preferences = defaultPreferences
                    formatPreferences(preferences.settings)
                    uisettings.set(
                        JSON.parse(JSON.stringify(preferences.settings))
                    )
                    interfaceSettings.current = preferences

                    if (setLoading) {
                        setLoading(false)
                    }
                    if (error != "404 - Not Found")
                        toasts.addToast({
                            content: error + " preferences.json",
                            type: "error",
                        })
                    console.log("No valid preferences.json")
                    loadTheme()
                },
            }
        )
    }
    return {
        getInterfaceSettings,
        getConnectionSettings,
    }
}

export { useSettings }
