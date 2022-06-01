/*
 SD-source.js - ESP3D WebUI Target file

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
import { canProcessFile } from "../../helpers"
import {
    formatFileSizeToString,
    sortedFilesList,
    formatStatus,
    filterResultFiles,
} from "../../../components/Helpers"
import { useUiContextFn, useSettingsContextFn } from "../../../contexts"

//Extract information from string - specific to FW / source
const formatFileSerialLine = (lines) => {
    const filesFilter = useUiContextFn.getValue("filesfilter") //get extension list
    const extRegExp = new RegExp("([\$a-zA-Z0-9!#\u0020\+\-]+)", 'g')
    const extensionsPattern = [...filesFilter.matchAll(extRegExp)].map(item => item[1].trim()).join('|')
    const lineParserPattern = `^(?:(?<path>.*\\.(?:${extensionsPattern}))? *(?<size>\\d+)? )?(?:(?<pathAlt>.*\\.(?:${extensionsPattern}))? *((?<sizeAlt>\\d*) *)?)$`
    return lines.reduce((acc, file) => {
        const fileRegex = new RegExp(lineParserPattern, "ig")
        const m = fileRegex.exec(file.trim())
        if (m) {
            const { path, size, pathAlt, sizeAlt } = m.groups
            return [...acc, { name: (pathAlt || path), size: formatFileSizeToString(sizeAlt || size) }]
        }
        return acc
    }, [])
}

const capabilities = {
    Process: (path, filename) => {
        return canProcessFile(filename)
    },
    UseFilters: () => true,
    IsFlatFS: () => true,
    Upload: (path, filename, eMsg = false) => {
        if (eMsg) return "E1"
        //TODO
        //check 8.1 if become true
        return useSettingsContextFn.getValue("SerialProtocol") == "MKS"
    },
    UploadMultiple: () => {
        return false
    },
    Download: () => {
        return false
    },
    DeleteFile: () => {
        return useSettingsContextFn.getValue("SerialProtocol") != "MKS"
    },
    DeleteDir: () => {
        return false
    },
    CreateDir: () => {
        return false
    },
}

const commands = {
    list: (path, filename) => {
        return {
            type: "cmd",
            cmd: useUiContextFn.getValue("sdlistcmd").replace(";", "\n"),
        }
    },
    upload: (path, filename) => {
        if (useSettingsContextFn.getValue("SerialProtocol") == "MKS")
            return {
                type: "url",
                url: "upload",
                args: { path },
            }
        //other is not supported so return list command for safety
        return {
            type: "cmd",
            cmd: useUiContextFn.getValue("sdlistcmd").replace(";", "\n"),
        }
    },
    postUpload: (path, filename) => {
        if (useSettingsContextFn.getValue("SerialProtocol") == "MKS") {
            return {
                type: "refresh",
                arg: false,
                timeOut: 3000,
            }
        }
        return { type: "none" }
    },
    formatResult: (result) => {
        const files = formatFileSerialLine(result.content)
        return {
            files: sortedFilesList(files),
            status: formatStatus(result.status),
        }
    },
    filterResult: (data, path) => {
        const res = {}
        res.files = sortedFilesList(filterResultFiles(data.files, path))
        res.status = formatStatus(data.status)
        return res
    },
    play: (path, filename) => {
        return {
            type: "cmd",
            cmd: "M23 " + path + (path == "/" ? "" : "/") + filename + "\nM24",
        }
    },
    delete: (path, filename) => {
        return {
            type: "cmd",
            cmd: "M30 " + path + (path == "/" ? "" : "/") + filename,
        }
    },
}

const responseSteps = {
    list: {
        start: (data) => data.startsWith("Begin file list"),
        end: (data) => data.startsWith("End file list"),
        error: (data) => {
            return (
                data.indexOf("error") != -1 ||
                data.indexOf("echo:No SD card") != -1 ||
                data.indexOf("echo:No media") != -1 ||
                data.indexOf('echo:Unknown command: "M21"') != -1 ||
                data.indexOf('echo:Unknown command: "M20"') != -1
            )
        },
    },
    delete: {
        start: (data) => data.startsWith("File deleted"),
        end: (data) => data.startsWith("ok"),
        error: (data) => {
            return data.startsWith("Deletion failed")
        },
    },
}

const SD = { capabilities, commands, responseSteps }

export { SD }
