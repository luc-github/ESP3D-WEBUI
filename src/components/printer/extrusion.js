/*
 extrusion.js - ESP3D WebUI extrusion panel control file

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
import { X } from "preact-feather"
import { useStoreon } from "storeon/preact"
import { preferences, getPanelIndex } from "../app"
import { useEffect } from "preact/hooks"
import { SendCommand } from "../http"
import { showDialog } from "../dialog"

/*
 * Local variables
 *
 */

/*
 * Send command query error
 */
function sendCommandError(errorCode, responseText) {
    showDialog({ type: "error", numError: errorCode, message: T("S5") })
}

/*
 * Temperatures panel control
 *
 */
const ExtrusionPanel = () => {
    const { showExtrusion } = useStoreon("showExtrusion")
    const { panelsOrder } = useStoreon("panelsOrder")
    let index = getPanelIndex(panelsOrder, "extrusion")
    if (!showExtrusion) {
        return null
    }
    const toogle = e => {
        const { dispatch } = useStoreon()
        dispatch("panel/showextrusion", false)
    }
    let panelClass = "order-" + index + " w-100 panelCard"
    return (
        <div class={panelClass}>
            <div class="p-2 ">
                <div class="border rounded p-2 panelCard">
                    <div class="w-100">
                        <div class="ml-auto text-right">
                            <button
                                type="button"
                                class="btn btn-light btn-sm red-hover"
                                title={T("S86")}
                                onClick={toogle}
                            >
                                <X />
                            </button>
                            <div class="text-center">Extrusion</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { ExtrusionPanel }
