/*
 filters.js - ESP3D WebUI helper file

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
import { useSettingsContextFn } from "../../../contexts"
/*
 * Local variables
 */
let pos = []
////////////////////////////////////////////////////////
//
// Status format is : <...>

const isPositions = (str) => {
    const positions_patern = /(?<xpos>\d+),(?<ypos>\d+),(?<pen>[0|1]+)/
    return positions_patern.test(str)
}

const getPositions = (str) => {
    const positions_patern = /(?<xpos>\d+),(?<ypos>\d+),(?<pen>[0|1]+)/
    const result = {}
    let res = null

    //position
    if ((res = positions_patern.exec(str)) !== null) {
        result.x = parseInt(res.groups.xpos)
        result.y = parseInt(res.groups.ypos)
        result.pen = parseInt(res.groups.pen)
    }
    return result
}

////////////////////////////////////////////////////////
//
// Sensor format is : SENSOR:SENSOR_DATA]

const isSensor = (str) => {
    return str.startsWith("SENSOR:")
}

const getSensor = (str) => {
    const result = []
    const data = " " + str.substring(7)
    let res = null
    const reg_search = /\s(?<value>[^\[]+)\[(?<unit>[^\]]+)\]/g
    while ((res = reg_search.exec(data))) {
        if (res.groups) result.push(res.groups)
    }
    return result
}

////////////////////////////////////////////////////////
//
// Streaming status
const isStreamingStatus = (str) => {
    try {
        const res = JSON.parse(str)
        if (res.cmd == "701" && typeof res.data != "undefined") return true
    } catch (e) {
        return false
    }
}

const getStreamingStatus = (str) => {
    const res = JSON.parse(str)
    if (res.data.status) return res.data
    return { status: res.data }
}
export {
    isPositions,
    getPositions,
    isSensor,
    getSensor,
    isStreamingStatus,
    getStreamingStatus,
}
