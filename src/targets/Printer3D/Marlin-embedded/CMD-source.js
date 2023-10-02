/*
 CMD-source.js - ESP3D WebUI Target file

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
import { h } from 'preact'

const formatCapabilityLine = (acc, line) => {
    //TODO:
    //isolate description
    //sort enabled
    //sort disabled
    acc.push({ data: line })
    return acc
}

const formatEepromLine = (acc, line) => {
    //format G20 / G21
    //it is comment
    if (line.startsWith('echo:')) {
        //it is setting
        const data = line
            .substring(
                5,
                line.indexOf(';') != -1 ? line.indexOf(';') : line.length
            )
            .trim()
        const extra =
            line.indexOf(';') != -1
                ? line.substring(line.indexOf(';') + 1).trim()
                : ''
        if (extra.length > 0) acc.push({ type: 'comment', value: extra })
        if (data.length > 0)
            acc.push({ type: 'text', value: data, initial: data })
    }

    return acc
}

const capabilities = {
    capabilities: () => true,
}

const commands = {
    capabilities: () => {
        return { type: 'cmd', cmd: 'M115' }
    },
    formatCapabilities: (result) => {
        if (!result || result.length == 0) return []
        const capabilityList = result.reduce((acc, line) => {
            return formatCapabilityLine(acc, line)
        }, [])
        return capabilityList
    },
    eeprom: () => {
        return { type: 'cmd', cmd: 'M503' }
    },
    formatEeprom: (result) => {
        if (!result || result.length == 0) return []
        const res = result.reduce((acc, line) => {
            return formatEepromLine(acc, line)
        }, [])
        return res
    },
}

const responseSteps = {
    capabilities: {
        start: (data) => data.startsWith('FIRMWARE_NAME:'),
        end: (data) =>
            !(data.startsWith('Cap:') || data.startsWith('FIRMWARE_NAME:')),
        error: (data) => {
            return data.indexOf('error') != -1
        },
    },
    eeprom: {
        start: (data) => data.startsWith('echo:;'),
        end: (data) => data.startsWith('ok') && !data.startsWith('ok T:'),
        error: (data) => {
            return (
                data.indexOf('Unknown command') != -1 ||
                data.indexOf('error') != -1
            )
        },
    },
}

function capability() {
    const [cap, ...rest] = arguments
    if (capabilities[cap]) return capabilities[cap](...rest)
    //console.log("Unknow capability ", cap)
    return false
}

function command() {
    const [cmd, ...rest] = arguments
    if (commands[cmd]) return commands[cmd](...rest)
    //console.log("Unknow command ", cmd)
    return { type: 'error' }
}

const CMD = { capability, command, responseSteps }

export { CMD }
