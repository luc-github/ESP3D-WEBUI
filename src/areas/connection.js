/*
 connection.js - ESP3D WebUI area file

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
import { h } from "preact"
import { useEffect, useState, useRef } from "preact/hooks"
import { useUiContext, useSettingsContext, useUiContextFn } from "../contexts"
import { Loading } from "../components/Controls"
import { AppLogo } from "../targets"
import {
    Minus,
    HardDrive,
    Frown,
    AlertTriangle,
    Slash,
    Lock,
} from "preact-feather"
import { T } from "../components/Translations"
import { espHttpURL } from "../components/Helpers"
import { restartdelay } from "../targets"

/*
 * Local const
 *
 */
const ConnectionContainer = () => {
    const { connection } = useUiContext()
    const { connectionSettings } = useSettingsContext()
    const timerCtrl = useRef()
    let contentIcon
    let contentSubtitle
    let contentTitle
    let contentAction
    let intervalTimer = 0

    if (
        !connection.connectionState.connected ||
        !connection.connectionState.authenticate ||
        connection.connectionState.updating
    ) {
        const refreshTimer = () => {
            if (intervalTimer > 0) {
                intervalTimer--
                if (timerCtrl) timerCtrl.current.innerHTML = intervalTimer
                setTimeout(refreshTimer, 1000)
            }
        }
        const onclick = (e) => {
            useUiContextFn.haptic()
            connection.setConnectionState({
                connected: false,
                authenticate: connection.connectionState.authenticate,
                page: "connecting",
            })
            window.location.href = espHttpURL()
        }
        switch (connection.connectionState.page) {
            case "notauthenticated":
                useUiContextFn.beepError()
                contentTitle = T("S1") //"Connection error"
                contentIcon = <Lock size="50px" />
                contentSubtitle = T("S145") //"Authentication required"
                document.title =
                    (connectionSettings.current &&
                    connectionSettings.current.Hostname
                        ? connectionSettings.current.Hostname
                        : "ESP3D") +
                    "(" +
                    T("S22") +
                    ")"
                contentAction = (
                    <button class="btn" onClick={onclick}>
                        {T("S11")}
                    </button>
                )
                break
            //No connection
            case "error":
                useUiContextFn.beepError()
                contentTitle = T("S1") //"Connection error"
                contentIcon = <Frown size="50px" />
                contentSubtitle = T("S5") //"Cannot connect with board"
                if (connection.connectionState.extraMsg)
                    contentSubtitle +=
                        ": " + connection.connectionState.extraMsg
                document.title =
                    (connectionSettings.current &&
                    connectionSettings.current.Hostname
                        ? connectionSettings.current.Hostname
                        : "ESP3D") +
                    "(" +
                    T("S22") +
                    ")"
                contentAction = (
                    <button class="btn" onClick={onclick}>
                        {T("S8")}
                    </button>
                )
                break
            //Session timeout
            case "sessiontimeout":
            //Error connection lost
            case "connectionlost":
                useUiContextFn.beepError()
                contentTitle = T("S1") //"Connection error"
                contentIcon = <AlertTriangle size="50px" />
                contentSubtitle =
                    connection.connectionState.page == "connectionlost"
                        ? T("S10")
                        : T("S173") //"Connection with board is lost"
                document.title =
                    (connectionSettings.current &&
                    connectionSettings.current.Hostname
                        ? connectionSettings.current.Hostname
                        : "ESP3D") +
                    "(" +
                    T("S9") +
                    ")"
                contentAction = (
                    <button class="btn" onClick={onclick}>
                        {T("S11")}
                    </button>
                )
                break
            //Disconnected
            case "already connected":
                useUiContextFn.beep()
                contentTitle = T("S9")
                contentIcon = <Slash size="50px" />
                contentSubtitle = T("S3")
                document.title =
                    (connectionSettings.current &&
                    connectionSettings.current.Hostname
                        ? connectionSettings.current.Hostname
                        : "ESP3D") +
                    "(" +
                    T("S9") +
                    ")"
                contentAction = (
                    <button class="btn" onClick={onclick}>
                        {T("S11")}
                    </button>
                )
                break
            //restart
            case "restart":
                intervalTimer = restartdelay
                setTimeout(refreshTimer, 1000)
                document.title =
                    (connectionSettings.current &&
                    connectionSettings.current.Hostname
                        ? connectionSettings.current.Hostname
                        : "ESP3D") +
                    "(" +
                    T("S35") +
                    ")"
                contentTitle = T("S35") //"restarting";
                contentIcon = (
                    <div class="d-inline-block" style="padding:0 20px">
                        <Loading large />
                    </div>
                )
                contentSubtitle = (
                    <span>
                        {T("S60")}
                        <span ref={timerCtrl}>{restartdelay}</span>
                        {T("S119")}
                    </span>
                )
                contentAction = ""
                break
            default: //"Please wait..."
                if (connection.connectionState.updating) {
                    contentTitle = T("S35") //"restarting";
                    connection.setConnectionState({
                        connected: connection.connectionState.connected,
                        authenticate: connection.connectionState.authenticate,
                        page: connection.connectionState.page,
                        updating: false,
                    })
                } else {
                    document.title =
                        (connectionSettings.current &&
                        connectionSettings.current.Hostname
                            ? connectionSettings.current.Hostname
                            : "ESP3D") +
                        "(" +
                        T("S2") +
                        ")"
                    contentTitle = T("S2") //"Connecting";
                }
                contentIcon = (
                    <div class="d-inline-block" style="padding:0 20px">
                        <Loading large />
                    </div>
                )
                contentSubtitle = T("S60")
                contentAction = ""
        }
        return (
            <div class="empty fullscreen">
                <div class="centered text-primary">
                    <div class="empty-icon">
                        <div
                            class="d-flex p-centered"
                            style="flex-wrap:nowrap!important"
                        >
                            <AppLogo />
                            <Minus size="50px" class="hide-low" />
                            {contentIcon}
                            <Minus size="50px" class="hide-low" />
                            <HardDrive size="50px" />
                        </div>
                    </div>
                    <div class="empty-title h5">{contentTitle}</div>
                    <div class="empty-subtitle">{contentSubtitle}</div>
                    <div class="empty-action">{contentAction}</div>
                </div>
            </div>
        )
    }
}

export { ConnectionContainer }
