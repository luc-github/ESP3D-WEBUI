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
const formatFileSerialLine = (acc, line) => {
    if (line.endsWith("/")) {
        acc.push({ name: line.substring(0, line.length - 1), size: -1 })
    } else {
        const pos = line.lastIndexOf(" ")
        if (pos != -1) {
            //TODO: check it is valid file name / size
            //check size is number ?
            //filename ?
            acc.push({
                name: line.substring(0, pos),
                size: formatFileSizeToString(line.substring(pos + 1)),
            })
        }
    }

    return acc
}

const capabilities = {
    Process: (path, filename) => {
        return (
            canProcessFile(filename) &&
            path.indexOf(" ") == -1 &&
            filename.indexOf(" ") == -1
        )
    },
    UseFilters: () => true,
    IsFlatFS: () => false,
    Upload: (path, filename, eMsg = false) => {
        if (eMsg) return "E1"
        //TODO
        //check 8.1 if become true
        return false
    },
    UploadMultiple: () => {
        return false
    },
    Download: () => {
        return false
    },
    DeleteFile: (path, filename) => {
        return path.indexOf(" ") == -1 && filename.indexOf(" ") == -1
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
        //console.log("path: ", path)
        const spath = (path + (path == "/" ? "" : "/")).replaceAll("//", "/")
        const cmd =
            "echo BeginFiles;" +
            useUiContextFn
                .getValue("sdlistcmd")
                .replace("#", spath)
                .replaceAll("//", "/") +
            ";echo EndFiles"
        return {
            type: "cmd",
            cmd,
        }
    },
    formatResult: (result) => {
        const res = {}
        const files = result.content.reduce((acc, line) => {
            if (line.startsWith("echo:")) return acc
            return formatFileSerialLine(acc, line)
        }, [])
        if (useUiContextFn.getValue("sort_sd_files")){
            res.files = sortedFilesList(files)
        } else {
            res.files = files
        }
        res.status = formatStatus(result.status)
        return res
    },
    filterResult: (data, path) => {
        const res = {}
        if (useUiContextFn.getValue("sort_sd_files")){
        res.files = sortedFilesList(filterResultFiles(data.files, path))
        } else {
            res.files = filterResultFiles(data.files, path)
        }
        res.status = formatStatus(data.status)
        return res
    },
    play: (path, filename) => {
        const spath = (path + (path == "/" ? "" : "/") + filename).replaceAll(
            "//",
            "/"
        )
        const cmd = useUiContextFn
            .getValue("sdplaycmd")
            .replace("#", spath)
            .replaceAll("//", "/")
        return {
            type: "cmd",
            cmd,
        }
    },
    delete: (path, filename) => {
        const spath = (path + (path == "/" ? "" : "/") + filename).replaceAll(
            "//",
            "/"
        )
        const cmd =
            useUiContextFn
                .getValue("sddeletecmd")
                .replace("#", spath)
                .replaceAll("//", "/") +
            ";echo:delete:" +
            filename
        return {
            type: "cmd",
            cmd,
        }
    },
}

const responseSteps = {
    list: {
        start: (data) => data.startsWith("echo: BeginFiles"),
        end: (data) => data.startsWith("echo: EndFiles"),
        error: (data) => {
            return (
                data.indexOf("error") != -1 ||
                data.indexOf("echo: No SD card") != -1
            )
        },
    },
    delete: {
        start: (data) => {
            if (data.startsWith("Could not delete")) return false
            else return true
        },
        end: (data) => {
            if (data.startsWith("Could not delete")) return false
            else return true
        }, //no feedback for delete success
        error: (data) => {
            return data.startsWith("Could not delete")
        },
    },
}

const SD = { capabilities, commands, responseSteps }

export { SD }
