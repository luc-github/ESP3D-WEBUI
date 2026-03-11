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
import { gcode_parser_modes } from "./gcode_parser_modes"
/*
 * Local variables
 */
let wpos = []
let mpos = []

////////////////////////////////////////////////////////
//
// ok acknowledge
const isOk = (str) => {
    if (str == "ok") {
        return true
    }
    return false
}

////////////////////////////////////////////////////////
//
// Status format is : <...>

const isStatus = (str) => {
    const status_patern = /<?(.*)>/
    return status_patern.test(str)
}

const getStatus = (str) => {
    const res = {
        positions: {},
        status: {},
        ov: {},
        pn: {},
        a: {},
        ln: {},
        f: {},
        rpm: {},
        bf: {},
        sd: {},
    }
    const mpos_pattern = /\|MPos:(?<mpos>[^\|>]+)/i
    const wpos_pattern = /\|WPos:(?<wpos>[^\|>]+)/i
    const WCO_pattern = /\|WCO:(?<wco>[^\|>]+)/i
    const status_pattern = /<(?<state>[^:\|]+):*(?<code>[^\|:]*)\|/i
    const ov_patern = /\|Ov:(?<ov>[^\|>]+)/i
    const pn_patern = /\|Pn:(?<pn>[^\|>]+)/i
    const fs_patern = /\|Fs:(?<fs>[^\|>]+)/i
    const a_patern = /\|A:(?<a>[^\|>]+)/i
    const bf_patern = /\|Bf:(?<bf>[^\|>]+)/i
    const f_patern = /\|F:(?<f>[^\|>]+)/i
    const ln_patern = /\|Ln:(?<ln>[^\|>]+)/i
    const sd_stream = /SD:(?<sd>[^\|>]+)/i
    let result = null

    //line number
    if ((result = sd_stream.exec(str)) !== null) {
        const status = result.groups.sd.split(",")
        res.sd.status = "processing"
        res.sd.processed = status[0]
        res.sd.type = "SD"
        res.sd.name = status[1]
    }
    //buffer state
    if ((result = bf_patern.exec(str)) !== null) {
        const r = result.groups.bf.split(",")
        res.bf.blocks = r[0]
        res.bf.bytes = r[1]
    }
    //line number
    if ((result = ln_patern.exec(str)) !== null) {
        res.ln.value = result.groups.ln
    }
    //feed rate and speed
    if ((result = fs_patern.exec(str)) !== null) {
        const r = result.groups.fs.split(",")
        res.f.value = r[0]
        res.rpm.value = r[1]
    }
    //feed rate
    if ((result = f_patern.exec(str)) !== null) {
        res.f.value = result.groups.f
    }
    //set each flag to a variable
    if ((result = a_patern.exec(str)) !== null) {
        res.a = result.groups.a.split("").reduce((acc, cur) => {
            acc[cur] = true
            return acc
        }, {})
    }
    //set each flag to a variable
    if ((result = pn_patern.exec(str)) !== null) {
        res.pn = result.groups.pn.split("").reduce((acc, cur) => {
            acc[cur] = true
            return acc
        }, {})
    }
    //extract status and optional message code
    if ((result = status_pattern.exec(str)) !== null) {
        res.status.state = result.groups.state
        res.status.code = result.groups.code
    }
    //extract override values
    if ((result = ov_patern.exec(str)) !== null) {
        const ov = result.groups.ov.split(",")
        res.ov = { feed: ov[0], rapid: ov[1], spindle: ov[2] }
    } else {
        res.ov = null
    }
    //extract override values
    if ((result = ov_patern.exec(str)) !== null) {
        const ov = result.groups.ov.split(",")
        res.ov = { feed: ov[0], rapid: ov[1], spindle: ov[2] }
    } else {
        res.ov = null
    }
    //extract positions
    //MPos
    if ((result = mpos_pattern.exec(str)) !== null) {
        try {
            const mpos_array = result.groups.mpos.split(",")
            const precision = mpos_array[0].split(".")[1].length
            mpos = mpos_array.map((e) =>
                parseFloat(e).toFixed(precision).toString()
            )

            //Work coordinates
            if ((result = WCO_pattern.exec(str)) !== null) {
                try {
                    const wpos_array = result.groups.wco.split(",")
                    wpos = wpos_array.map((e, index) =>
                        (parseFloat(mpos[index]) - parseFloat(e))
                            .toFixed(precision)
                            .toString()
                    )
                } catch (e) {
                    console.error(e)
                }
            }
        } catch (e) {
            console.error(e)
        }
    }
    //WPos
    if ((result = wpos_pattern.exec(str)) !== null) {
        try {
            const wpos_array = result.groups.wpos.split(",")
            const precision = wpos_array[0].split(".")[1].length
            wpos = wpos_array.map((e) =>
                parseFloat(e).toFixed(precision).toString()
            )

            //Work coordinates
            if ((result = WCO_pattern.exec(str)) !== null) {
                try {
                    const mpos_array = result.groups.wco.split(",")
                    mpos = mpos_array.map((e, index) =>
                        (parseFloat(wpos[index]) + parseFloat(e))
                            .toFixed(precision)
                            .toString()
                    )
                } catch (e) {
                    console.error(e)
                }
            }
        } catch (e) {
            console.error(e)
        }
    }
    //export positions
    const defaultletters = "xyzabc"
    const definedletters = useSettingsContextFn.getValue("Axisletters")
    const letterslist = definedletters
        ? definedletters.toLowerCase().split("")
        : defaultletters.split("")
    letterslist.forEach((letter, index) => {
        res.positions[letter] = index < mpos.length ? mpos[index] : undefined
        res.positions["w" + letter] =
            index < wpos.length ? wpos[index] : undefined
    })
    return res
}

////////////////////////////////////////////////////////
//
// States format is :  [GC:G0 G54 G17 G21 G90 G94 M5 M9 T0 F0.0 S0]

const isStates = (str) => {
    const reg_search = /\[GC:.*\]/g
    return reg_search.test(str)
}

const getStates = (str) => {
    let res = {}
    let result = null
    const reg_search = /\[GC:(?<states>.*)\]/g
    if ((result = reg_search.exec(str)) !== null) {
        res = result.groups.states.split(" ").reduce((acc, cur) => {
            if (
                cur.startsWith("F") ||
                cur.startsWith("S") ||
                cur.startsWith("T")
            ) {
                acc[
                    cur[0] == "F"
                        ? "feed_rate"
                        : cur[0] == "T"
                          ? "active_tool"
                          : "spindle_speed"
                ] = { value: parseFloat(cur.substring(1)) }
            } else {
                gcode_parser_modes.forEach((mode) => {
                    if (mode.values && mode.values.includes(cur)) {
                        if (mode.multiple) {
                            if (!acc[mode.id]) acc[mode.id] = []
                            acc[mode.id].push ({ "value": cur })
                        } else {
                        acc[mode.id] = { "value": cur }
                        }
                    }
                })
            }
            return acc
        }, {})
    }
    return res
}

////////////////////////////////////////////////////////
//
// Message format is :  [MSG:MSG_TEXT]

const isMessage = (str) => {
    const reg_search = /\[MSG:.*\]/g
    return reg_search.test(str)
}

const getMessage = (str) => {
    let result = null
    const reg_search = /\[MSG:(?<msg>.*)\]/g
    if ((result = reg_search.exec(str)) !== null) {
        return result.groups.msg
    }
    return result
}

////////////////////////////////////////////////////////
//
// error format is :  error:error_CODE

const isError = (str) => {
    const reg_search = /error:[0-9]+/g
    return reg_search.test(str)
}

const getError = (str) => {
    let result = null
    const reg_search = /error:(?<code>.*)/g
    if ((result = reg_search.exec(str)) !== null) {
        return parseInt(result.groups.code)
    }
    return result
}

////////////////////////////////////////////////////////
//
// ALARM format is :  ALARM:ALARM_CODE

const isAlarm = (str) => {
    const reg_search = /ALARM:[0-9]+/g
    return reg_search.test(str)
}

const getAlarm = (str) => {
    let result = null
    const reg_search = /ALARM:(?<code>.*)/g
    if ((result = reg_search.exec(str)) !== null) {
        return parseInt(result.groups.code)
    }
    return result
}

////////////////////////////////////////////////////////
//
//  gcode parameters $# output format is : [G54:], [G55:], [G56:], [G57:], [G58:], [G59:], [G28:], [G30:], [G92:], [TLO:], and [PRB:]

const isGcodeParameter = (str) => {
    const reg_search =
        /\[(G54|G55|G56|G57|G58|G59|G59.1|G59.2|G59.3|G28|G30|G92|TLO|PRB):.+\]/g
    return reg_search.test(str)
}

const getGcodeParameter = (str) => {
    let result = null
    const reg_search =
        /\[(?<code>G54|G55|G56|G57|G58|G59|G59.1|G59.2|G59.3|G28|G30|G92|TLO|PRB):(?<data>.+)\]/g
    if ((result = reg_search.exec(str)) !== null) {
        const datacontent = result.groups.data.split(":")
        result = { code: result.groups.code, data: datacontent[0].split(",") }
        if (datacontent.length > 1) {
            result.success = datacontent[1] == "1"
        }
    }
    return result
}

////////////////////////////////////////////////////////
//
// Version format is :  [VER:VERSION:xxx]

const isVersion = (str) => {
    const reg_search = /\[VER:.+\]/g
    return reg_search.test(str)
}

const getVersion = (str) => {
    let result = null
    const reg_search = /\[VER:(?<version>[^:]+):(?<string>.*)\]/g
    if ((result = reg_search.exec(str)) !== null) {
        return { value: result.groups.version, string: result.groups.string }
    }
    return result
}

////////////////////////////////////////////////////////
//
// OPT format is :  [OPT:,15,128]

const isOptions = (str) => {
    const reg_search = /\[OPT:.+\]/g
    return reg_search.test(str)
}

const getOptions = (str) => {
    let result = null
    const reg_search = /\[OPT:(?<data>.+)\]/g
    if ((result = reg_search.exec(str)) !== null) {
        const datacontent = result.groups.data.split(",")

        result = {
            options: datacontent[0].split(""),
            blockBufffer: datacontent[1],
            rxBuffer: datacontent[2],
        }
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
// Reset
const isReset = (str) => {
    const reg_search = /^Grbl\s[0-9]+.[0-9]+[a-z]+\s\['\$'\sfor\shelp\]/g
    return reg_search.test(str)
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
    isOk,
    isStatus,
    getStatus,
    isStates,
    getStates,
    isMessage,
    getMessage,
    isSensor,
    getSensor,
    isAlarm,
    getAlarm,
    isError,
    getError,
    isGcodeParameter,
    getGcodeParameter,
    isVersion,
    getVersion,
    isOptions,
    getOptions,
    isReset,
    isStreamingStatus,
    getStreamingStatus,
}
