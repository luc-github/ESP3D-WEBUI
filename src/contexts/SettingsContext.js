/*
 WsContext.js - ESP3D WebUI context file

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
import { h, createContext } from "preact"
import { useRef, useContext } from "preact/hooks"
import { useUiContext } from "./UiContext"
import { espHttpURL } from "../components/Helpers"

/*
 * Local const
 *
 */
const SettingsContext = createContext("SettingsContext")
const useSettingsContext = () => useContext(SettingsContext)
const useSettingsContextFn = {}

const SettingsContextProvider = ({ children }) => {
    const { uisettings } = useUiContext()
    const interfaceValues = useRef({})
    const connectionValues = useRef({})
    const featuresValues = useRef({})
    const pollingInterval = useRef([])
    useSettingsContextFn.getValue = (val) => connectionValues.current[val]

    function startPolling(id, interval, fn) {
        stopPolling(id)
        if (interval > 0 && fn) {
            const newInterval = setInterval(() => {
                fn()
            }, interval)
            pollingInterval.current.push({ id: id, interval: newInterval })
        }
    }

    /*
     * Stop polling query
     */
    function stopPolling(id) {
        if (typeof id == "undefined") {
            pollingInterval.current.forEach((item) => {
                clearInterval(item.interval)
            })
            pollingInterval.current = []
        } else {
            const index = pollingInterval.current.findIndex(
                (item) => item.id == id
            )
            if (index != -1) {
                clearInterval(pollingInterval.current[index].interval)
                pollingInterval.current.splice(index, 1)
            }
        }
    }

    const store = {
        interfaceSettings: interfaceValues,
        connectionSettings: connectionValues,
        featuresSettings: featuresValues,
        activity: { startPolling, stopPolling },
    }

    return (
        <SettingsContext.Provider value={store}>
            {children}
        </SettingsContext.Provider>
    )
}

export { SettingsContextProvider, useSettingsContext, useSettingsContextFn }
