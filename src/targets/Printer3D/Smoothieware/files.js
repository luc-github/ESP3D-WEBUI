/*
 files.js - ESP3D WebUI Target file

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
import { FLASH } from "../../FLASH-source"
import { DIRECTSD } from "./DIRECTSD-source"
import { SD } from "./SD-source"
import { DIRECTSDEXT } from "./DIRECTSDEXT-source"
import { SDEXT } from "./SDEXT-source"
import { TFTSD } from "./TFT-SD-source"
import { TFTUSB } from "./TFT-USB-source"
import { useSettingsContextFn, useUiContextFn } from "../../../contexts"

//List of supported files systems
const supportedFileSystems = [
    {
        value: "FLASH",
        name: "S137",
        depend: () => {
            return useUiContextFn.getValue("showfilespanel")
        },
    },
    {
        value: "SD",
        name: "S190",
        depend: () => {
            return (
                useUiContextFn.getValue("sd") &&
                !useUiContextFn.getValue("is_sd_direct")
            )
        },
    },
    {
        value: "DIRECTSD",
        name: "S190",
        depend: () => {
            return (
                useUiContextFn.getValue("is_sd_direct") &&
                useSettingsContextFn.getValue("SDConnection") != "none"
            )
        },
    },
    {
        value: "SDEXT",
        name: "S191",
        depend: () => {
            return (
                useUiContextFn.getValue("sdext") &&
                !useUiContextFn.getValue("is_extra_sd_direct")
            )
        },
    },
    {
        value: "DIRECTSDEXT",
        name: "S191",
        depend: () => {
            return (
                useUiContextFn.getValue("is_extra_sd_direct") &&
                useSettingsContextFn.getValue("SDConnection") != "none"
            )
        },
    },
    {
        value: "TFTSD",
        name: "S188",
        depend: () => {
            return useUiContextFn.getValue("tftsd")
        },
    },
    {
        value: "TFTUSB",
        name: "S189",
        depend: () => {
            return useUiContextFn.getValue("tftusb")
        },
    },
]

const capabilities = {
    FLASH: FLASH.capabilities,
    DIRECTSD: DIRECTSD.capabilities,
    SD: SD.capabilities,
    DIRECTSDEXT: DIRECTSDEXT.capabilities,
    SDEXT: SDEXT.capabilities,
    TFTUSB: TFTUSB.capabilities,
    TFTSD: TFTSD.capabilities,
}

const commands = {
    FLASH: FLASH.commands,
    DIRECTSD: DIRECTSD.commands,
    SD: SD.commands,
    DIRECTSDEXT: DIRECTSDEXT.commands,
    SDEXT: SDEXT.commands,
    TFTUSB: TFTUSB.commands,
    TFTSD: TFTSD.commands,
}

function capability() {
    const [filesystem, cap, ...rest] = arguments
    if (capabilities[filesystem] && capabilities[filesystem][cap])
        return capabilities[filesystem][cap](...rest)
    console.log("Unknow capability ", cmd, " for ", filesystem)
    return false
}

function command() {
    const [filesystem, cmd, ...rest] = arguments
    if (commands[filesystem] && commands[filesystem][cmd])
        return commands[filesystem][cmd](...rest)
    console.log("Unknow command ", cmd, " for ", filesystem)
    return { type: "error" }
}

//everything in one object
const files = {
    command,
    capability,
    supported: supportedFileSystems,
}

export { files }
