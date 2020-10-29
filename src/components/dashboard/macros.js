/*
 macros.js - ESP3D WebUI macro file

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
import { T } from "../translations"
import { useState, useEffect } from "preact/hooks"
import { SendCommand } from "../http"
import { useStoreon } from "storeon/preact"
import { showDialog } from "../dialog"
import { preferences } from "../app"
import { Grid, Minimize2, Maximize2 } from "preact-feather"
const { getIcon, startJobFile } = require(`../${process.env.TARGET_ENV}`)

/*
 * Local variables
 *
 */
let expandmacrosbuttons

/*
 * Local constants
 *
 */

/*
 * Macro Button
 */
const MacroButton = ({ data, index }) => {
    const onClick = e => {
        switch (data.target) {
            case "FS":
                let cmd = "[ESP700]" + data.parameter
                SendCommand(cmd, null, sendCommandError)
                break
            case "TARGETSD":
            case "TFTUSB":
            case "TFTSD":
                startJobFile(data.target, data.parameter)
                break
            case "CMD":
                let cmdlist = data.parameter.split(";")
                for (let i = 0; i < cmdlist.length; i++) {
                    let cmd = cmdlist[i].trim()
                    if (cmd.length > 0) SendCommand(cmd, null, sendCommandError)
                }
                break
            case "URI":
                window.open(data.parameter)
                break
            default:
                console.log("Unknow target")
        }
    }
    return (
        <div class="p-1">
            <button
                type="button"
                class="btn overlay"
                style={
                    "min-height:2.5em!important;min-width:2.5em!important;" +
                    "background-color:" +
                    data.color +
                    ";color:" +
                    data.textcolor
                }
                title={data.name}
                onClick={onClick}
            >
                <div class="d-flex align-items-center">
                    {data.icon != "None" ? getIcon(data.icon) : null}
                    <span
                        class="hide-low text-button no_wrap"
                        style="max-width:8em;overflow: hidden;text-overflow: ellipsis;"
                    >
                        {data.name}
                    </span>
                </div>
            </button>
        </div>
    )
}

/*
 * Macros Controls
 *
 */
const MacrosControls = () => {
    let ribon = []
    if (!preferences.settings.showmacros) return null
    if (preferences.macros.length == 0) return null
    if (typeof expandmacrosbuttons == "undefined")
        expandmacrosbuttons = preferences.settings.expandmacrosbuttonsonstart
    const toogleMacros = e => {
        expandmacrosbuttons = !expandmacrosbuttons
        showDialog({ displayDialog: false, refreshPage: true })
    }
    if (expandmacrosbuttons) {
        for (let index = 0; index < preferences.macros.length; index++) {
            ribon.push(
                <MacroButton data={preferences.macros[index]} index={index} />
            )
        }
    }
    return (
        <Fragment>
            <div class="p-1">
                <button
                    class="btn btn-primary"
                    title={T("S121")}
                    onclick={toogleMacros}
                >
                    <Grid />
                    <span class="hide-low text-button">{T("S121")}</span>
                    {expandmacrosbuttons ? <Minimize2 /> : <Maximize2 />}
                </button>
            </div>
            {ribon}
        </Fragment>
    )
}

/*
 *Send command query error
 */
function sendCommandError(errorCode, responseText) {
    showDialog({
        type: "error",
        numError: errorCode,
        message: errorCode == 0 ? T("S5") : T("S109"),
    })
    let tresponse = responseText.split("\n")
    for (let n = 0; n < tresponse.length; n++) {
        updateTerminal(T(tresponse[n]))
    }
}

export { MacrosControls }
