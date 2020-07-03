/*
 temperatures.js - ESP3D WebUI temperatures panel control file

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
 * Process temperatures buffer
 *
 */
function processTemperatures(buffer) {
    const regexTemp = /(B|T(\d*)):\s*([+|-]?[0-9]*\.?[0-9]+|inf)? (\/)([+]?[0-9]*\.?[0-9]+)?/gi
    let result
    let timestamp = Date.now()
    let extruders = []
    let beds = []
    const { dispatch } = useStoreon()
    if (typeof buffer == "object") {
        let size = buffer.heaters.length
        for (let index = 0; index < size; index++) {
            let value, value2, tool
            if (typeof buffer.temps.bed != "undefined" && index == 0) {
                tool = "B"
            } else if (index != 0) {
                tool = "T"
                if (index > 1) tool += index + 1
            }
            if (
                isNaN(parseFloat(buffer.heaters[index])) ||
                parseFloat(buffer.heaters[index]) < 5
            )
                value = "error"
            else
                value = parseFloat(buffer.heaters[index])
                    .toFixed(2)
                    .toString()
            if (isNaN(parseFloat(buffer.active[index]))) value2 = "0.00"
            else
                value2 = parseFloat(buffer.active[index])
                    .toFixed(2)
                    .toString()
            if (tool.startsWith("T") || tool.startsWith("B")) {
                if (tool == "T") tool = "T0"
                if (tool == "B") tool = "B0"
                let index = parseInt(tool.substring(1))
                if (dispatch) {
                    if (tool[0] == "T") extruders[index] = value
                    else beds[index] = value
                    dispatch("temperatures/updateT" + tool[0], {
                        index: index,
                        value: value,
                        target: value2,
                    })
                } else {
                    console.log("no dispatch")
                }
            }
        }
    } else {
        while ((result = regexTemp.exec(buffer)) !== null) {
            var tool = result[1]
            var value
            var value2
            if (isNaN(parseFloat(result[3])) || parseFloat(result[3]) < 5)
                value = "error"
            else
                value = parseFloat(result[3])
                    .toFixed(2)
                    .toString()
            if (isNaN(parseFloat(result[5]))) value2 = "0.00"
            else
                value2 = parseFloat(result[5])
                    .toFixed(2)
                    .toString()
            if (tool.startsWith("T") || tool.startsWith("B")) {
                if (tool == "T") tool = "T0"
                if (tool == "B") tool = "B0"
                let index = parseInt(tool.substring(1))
                if (dispatch) {
                    if (tool[0] == "T") extruders[index] = value
                    else beds[index] = value
                    dispatch("temperatures/updateT" + tool[0], {
                        index: index,
                        value: value,
                        target: value2,
                    })
                } else {
                    console.log("no dispatch")
                }
            }
        }
    }
    if (extruders.length > 0 || beds.length > 0) {
        dispatch("temperatures/addT", {
            timestamp: timestamp,
            extruders: extruders,
            beds: beds,
        })
    }
}

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
const TemperaturesPanel = () => {
    const { showTemperatures } = useStoreon("showTemperatures")
    const { panelsOrder } = useStoreon("panelsOrder")
    let index = getPanelIndex(panelsOrder, "temperatures")
    if (!showTemperatures) {
        return null
    }
    const toogle = e => {
        const { dispatch } = useStoreon()
        dispatch("panel/showtemperatures", false)
    }
    let panelClass = "order-" + index + " w-100 panelCard"
    return (
        <div class={panelClass} id="temperaturespanel">
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
                            <div class="text-center">Temp</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { processTemperatures, TemperaturesPanel }
