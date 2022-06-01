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

const formatYamlLine = (acc, line) => {
    console.log(line)
    if (line.indexOf(":") != -1 && !line.startsWith("[")) {
        acc.push(line)
    }

    return acc
}

const commands = {
    configFileName: () => {
        return { type: "cmd", cmd: "$Config/Filename" }
    },
    yamlFile: () => {
        return { type: "cmd", cmd: "$CD" }
    },
}

const responseSteps = {
    yamlFile: {
        start: (data) => data.startsWith("[MSG: BeginData]"),
        end: (data) => data.startsWith("[MSG: EndData]"),
        error: (data) => {
            return data.startsWith("error:")
        },
    },
    configFileName: {
        start: (data) => data.startsWith("$Config/Filename="),
        end: (data) => data.startsWith("$Config/Filename="),
        error: (data) => {
            return data.startsWith("error:")
        },
    },
}

function capability() {
    const [cap, ...rest] = arguments
    if (capabilities[cap]) return capabilities[cap](...rest)
    console.log("Unknow capability ", cap)
    return false
}

function command() {
    const [cmd, ...rest] = arguments
    if (commands[cmd]) return commands[cmd](...rest)
    console.log("Unknow command ", cmd)
    return { type: "error" }
}

const CMD = { capability, command, responseSteps }

export { CMD }
