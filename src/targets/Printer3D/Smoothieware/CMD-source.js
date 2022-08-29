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
import { h } from "preact"

const formatCapabilityLine = (acc, line) => {
    //TODO:
    //isolate description
    //update http encoded
    //sort enabled
    //sort disabled
    acc.push({ data: line })
    return acc
}

const formatOverrideLine = (acc, line) => {
    if (line.startsWith(";")) {
        acc.push({
            type: "comment",
            value: line
                .substring(1)
                .replace(String.fromCharCode(65533), String.fromCharCode(178))
                .trim(), //replace the 2 square
        })
    } else {
        if (line.startsWith("M") || line.startsWith("G"))
            acc.push({ type: "text", value: line.trim(), initial: line.trim() })
    }

    return acc
}

const formatConfigLine = (acc, line) => {
    if (line.trim().length == 0) return acc
    if (line.trim().startsWith("#")) {
        //commented line
        if (line.startsWith("               "))
            //multilined comment of value
            acc.push({ type: "help", value: line.trim().substring(1).trim() })
        else if (line.trim().substring(1).indexOf("#") != -1) {
            //value commented
            acc.push({
                type: "disabled",
                value: line.trim().substring(1).trim(),
            })
        } //title of section
        else
            acc.push({
                type: "comment",
                value: line.trim().substring(1).trim(),
            })
    } else {
        const p1 = line.trim().indexOf(" ")
        const label = line.trim().substring(0, p1).trim()
        const part2 = line.trim().substring(p1).trim()
        const p2 = part2.indexOf("#")
        const value = p2 == -1 ? part2.trim() : part2.substring(0, p2).trim()
        const help = p2 == -1 ? "" : part2.substring(p2 + 1).trim()
        acc.push({ type: "text", label, value, initial: value, append: help })
        acc.push({ type: "help", value: help })
    }
    return acc
}

const capabilities = {
    capabilities: () => true,
}

const commands = {
    capabilities: () => {
        return { type: "cmd", cmd: "M115" }
    },
    formatCapabilities: (result) => {
        if (!result || result.length == 0) return []
        const capabilityList = result.reduce((acc, line) => {
            return formatCapabilityLine(acc, line)
        }, [])
        return capabilityList
    },
    config: (name) => {
        return { type: "cmd", cmd: `cat /sd/${name}\necho configDone` }
    },
    configset: (element) => {
        return {
            type: "cmd",
            cmd: `config-set sd ${element.label} ${element.value}`,
        }
    },
    overrideset: (element) => {
        return {
            type: "cmd",
            cmd: element.value,
        }
    },
    override: () => {
        return { type: "cmd", cmd: "M503\necho overrideDone" }
    },
    formatConfig: (result) => {
        if (!result || result.length == 0) return []
        const res = result.reduce((acc, line) => {
            if (line == "ok") return acc
            return formatConfigLine(acc, line)
        }, [])
        return res
    },
    formatOverride: (result) => {
        if (!result || result.length == 0) return []
        const res = result.reduce((acc, line) => {
            if (line == "ok") return acc
            return formatOverrideLine(acc, line)
        }, [])
        return res
    },
}

const responseSteps = {
    capabilities: {
        start: (data) => data.startsWith("FIRMWARE_NAME:"),
        end: (data) => data.startsWith("FIRMWARE_NAME:"),
        error: (data) => {
            return data.indexOf("error:") != -1
        },
    },
    config: {
        start: (data) => data.startsWith("#"),
        end: (data) => data.startsWith("echo: configDone"),
        error: (data) => {
            return (
                data.indexOf("error:") != -1 ||
                data.indexOf("File not found:") != -1
            )
        },
    },
    override: {
        start: (data) => data.startsWith(";"),
        end: (data) => data.startsWith("echo: overrideDone"),
        error: (data) => {
            return (
                data.indexOf("error:") != -1 ||
                data.indexOf("File not found:") != -1
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
    return { type: "error" }
}

const CMD = { capability, command, responseSteps }

export { CMD }
