/*
 index.js - ESP3D WebUI areas file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

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
import { h, Fragment } from "preact"
import { Menu } from "./menu"
import { ConnectionContainer } from "./connection"
import { MainContainer } from "./main"
import { useUiContext } from "../contexts/UiContext"
import { useSettingsContext } from "../contexts/SettingsContext"
import { useSettings, useHttpQueue } from "../hooks"
import { useEffect } from "preact/hooks"
import { showLogin, showKeepConnected } from "../components/Modal"
import { createExtensionBridge } from "./extensionBridge"

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
    const { connectionSettings, interfaceSettings, featuresSettings } =
        useSettingsContext()
    const { createNewRequest } = useHttpQueue()
    const { toasts, modals } = useUiContext()
    //extension messages (postMessage from the extension iframes)
    //are handled by the bridge, see extensionBridge.js
    const processExtensionMessage = createExtensionBridge({
        createNewRequest,
        toasts,
        modals,
        connectionSettings,
        interfaceSettings,
        featuresSettings,
    })

    useEffect(() => {
        getConnectionSettings(getInterfaceSettings)
        window.addEventListener("message", processExtensionMessage, false)
    }, [])
    return <ViewContainer />
}

export { ContentContainer }
