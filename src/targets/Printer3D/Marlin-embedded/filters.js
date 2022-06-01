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

////////////////////////////////////////////////////////
//
//Temperatures

//Marlin Temperatures
//ok T:25.00 /120.00 B:25.00 /0.00 @:127 B@:0
//(ok )T:25.00 /0.00 B:25.00 /0.00 T0:25.00 /0.00 T1:25.00 /0.00 @:0 B@:0 @0:0 @1:0
//T:25.00 /50.00 B:25.00 /0.00 T0:25.00 /50.00 T1:25.00 /0.00 @:127 B@:0 @0:127 @1:0 W:?
//T:25.00 /0.00 B:25.00 /50.00 T0:25.00 /0.00 T1:25.00 /0.00 @:0 B@:127 @0:0 @1:0
//echo:busy: processing

const isTemperatures = (str) => {
    const regex_search = /T:.*\s@:[0-1]/g
    return regex_search.test(str)
}

const getTemperatures = (str) => {
    let result = null
    const response = {
        T: [], //0->8 T0->T8 Extruders
        R: [], //0->1 R Redondant
        B: [], //0->1 B Bed
        C: [], //0->1  Chamber
        P: [], //0->1 Probe
        M: [], //0->1 M Board
        L: [], //0->1 L is only for laser so should beout of scope
    }
    const regex_search =
        /(B|T|C|P|R)([\d]*):([+|-]?[0-9]*\.?[0-9]+|inf)? \/([+]?[0-9]*\.?[0-9]+)/g
    //result[0] = full match
    //result[1] = tool
    //result[2] = index if multiple
    //result[3] = current
    //result[4] = target
    //Note :on multiple extruders T is the active one, it will be erased by the next T0
    while ((result = regex_search.exec(str)) !== null) {
        response[result[1]][result[2] == "" ? 0 : result[2]] = {
            value: result[3],
            target: result[4],
        }
    }
    return response
}

////////////////////////////////////////////////////////
//
//Positions

//Marlin positions
//X:0.00 Y:0.00 Z:0.00 E:0.00 Count X:0 Y:0 Z:0
const isPositions = (str) => {
    const regex_search =
        /X:\s*[+,-]?[0-9]*\.?[0-9]+?\s*Y:\s*[+,-]?[0-9]*\.?[0-9]+?\s*Z:\s*[+,-]?[0-9]*\.?[0-9]+?\s*E/
    return regex_search.test(str)
}

const getPositions = (str) => {
    let result = null
    const regex_search =
        /X:\s*([+,-]?[0-9]*\.?[0-9]+)?\s*Y:\s*([+,-]?[0-9]*\.?[0-9]+)?\s*Z:\s*([+,-]?[0-9]*\.?[0-9]+)?\s*E/
    if ((result = regex_search.exec(str)) !== null) {
        return { x: result[1], y: result[2], z: result[3] }
    }
    return null
}

////////////////////////////////////////////////////////
//
//Print status

const isPrintStatus = (str) => {
    let result = null
    const reg_search1 = /(Not\sSD\sprinting|Done\sprinting\sfile)/
    const reg_search2 = /SD\sprinting\sbyte\s([0-9]*)\/([0-9]*)/
    if ((result = reg_search1.exec(str)) !== null) {
        return true
    }
    if ((result = reg_search2.exec(str)) !== null) {
        return true
    }
    return false
}

const getPrintStatus = (str) => {
    let result = null
    const reg_search1 = /(Not\sSD\sprinting|Done\sprinting\sfile)/
    const reg_search2 = /SD\sprinting\sbyte\s([0-9]*)\/([0-9]*)/
    if ((result = reg_search1.exec(str)) !== null) {
        return {
            status: result[1],
            printing: false,
            progress: result[1].startsWith("Done") ? 100 : 0,
        }
    }
    if ((result = reg_search2.exec(str)) !== null) {
        return {
            status: "Printing",
            printing: true,
            progress: (
                (100 * parseFloat(result[1])) /
                parseInt(result[2])
            ).toFixed(2),
        }
    }
    return { status: "Unknown", printing: false, progress: 0 }
}

////////////////////////////////////////////////////////
//
//Print file name

const isPrintFileName = (str) => {
    let result = null
    const reg_search1 = /Current\sfile:\s(.*)/
    if ((result = reg_search1.exec(str)) !== null) {
        return true
    }
    return false
}

const getPrintFileName = (str) => {
    let result = null
    const reg_search1 = /Current\sfile:\s(.*)/
    if ((result = reg_search1.exec(str)) !== null) {
        return result[1]
    }
    return "Unknown"
}

////////////////////////////////////////////////////////
//
//Status
const isStatus = (str) => {
    let result = null
    const reg_search1 = /echo:busy:\s(.*)/
    const reg_search2 = /Error:(.*)/
    if ((result = reg_search1.exec(str)) !== null) {
        return true
    }
    if ((result = reg_search2.exec(str)) !== null) {
        return true
    }
    return false
}

const getStatus = (str) => {
    let result = null
    const reg_search1 = /echo:busy:\s(.*)/
    const reg_search2 = /Error:(.*)/
    if ((result = reg_search1.exec(str)) !== null) {
        return result[1]
    }
    if ((result = reg_search2.exec(str)) !== null) {
        return result[1]
    }
    return "Unknown"
}

////////////////////////////////////////////////////////
//
//Flow rate
const isFlowRate = (str) => {
    let result = null
    const reg_search1 = /echo:E([0-9])\sFlow:\s(.*)\%/
    if ((result = reg_search1.exec(str)) !== null) {
        return true
    }
    return false
}

const getFlowRate = (str) => {
    let result = null
    const reg_search1 = /echo:E([0-9])\sFlow:\s(.*)\%/
    if ((result = reg_search1.exec(str)) !== null) {
        return { index: parseInt(result[1]), value: result[2] }
    }
    return null
}

////////////////////////////////////////////////////////
//
//Feed rate
const isFeedRate = (str) => {
    let result = null
    const reg_search1 = /FR:(.*)\%/
    if ((result = reg_search1.exec(str)) !== null) {
        return true
    }
    return false
}

const getFeedRate = (str) => {
    let result = null
    const reg_search1 = /FR:(.*)\%/
    if ((result = reg_search1.exec(str)) !== null) {
        //only one index currently supported feven on multiple extruders
        return { index: 0, value: result[1] }
    }
    return null
}

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

export {
    isTemperatures,
    getTemperatures,
    isPositions,
    getPositions,
    isPrintStatus,
    getPrintStatus,
    isPrintFileName,
    getPrintFileName,
    isStatus,
    getStatus,
    isFlowRate,
    getFlowRate,
    isFeedRate,
    getFeedRate,
    isSensor,
    getSensor,
}
