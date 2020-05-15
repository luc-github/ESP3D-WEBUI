/*
 terminal.js - ESP3D WebUI terminal file

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
import { T } from "../translations"
import { useState, useEffect } from "preact/hooks"
import { X } from "preact-feather"
import { SendCommand } from "../http"
import { useStoreon } from "storeon/preact"
//const { isVerboseData } = require(`../${process.env.TARGET_ENV}`)

/*
 * Local variables
 *
 */

/*
 * Local constants
 *
 */

/*
 * Files Controls
 *
 */
const FilesControls = () => {
    const { dispatch } = useStoreon()
    const toogleFiles = e => {
        dispatch("panel/showfiles", false)
    }
    return (
        <div class="d-flex flex-wrap p-1">
            <span>Nav Bar</span>

            <div class="ml-auto">
                {" "}
                <button
                    type="button"
                    class="btn btn-light btn-sm"
                    title={T("S86")}
                    onClick={toogleFiles}
                >
                    <X />
                </button>
            </div>
        </div>
    )
}

/*
 *Send command query error
 */
function sendCommandError(errorCode, responseText) {
    globaldispatch({
        type: Action.error,
        errorcode: errorCode,
        msg: "S5",
    })
}

/*
 * Files Window
 *
 */
const FilesPanel = () => {
    const { showFiles } = useStoreon("showFiles")
    if (!showFiles) return null

    return (
        <div>
            <div class="p-1" />
            <div class="border p-2">
                <FilesControls />
                <div class="p-2 border">List files here</div>
            </div>
        </div>
    )
}

export { FilesPanel }
