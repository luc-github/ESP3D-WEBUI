/*
 TFT-SD-source.js - ESP3D WebUI Target file

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
    //possible format and corresponding regexp extract
    const regList = [
        {
            regex:
                useSettingsContextFn.getValue("SerialProtocol") == "MKS"
                    ? "^(.*).DIR$"
                    : "^\\/(.*)\\/$",
            extract: (res) => {
                return { name: res[1], size: -1 }
            },
        },
        {
            regex: "^(.*\\.GCODE)$",
            extract: (res) => {
                return { name: res[1], size: "" }
            },
        },
    ]
    //get extension list
    const extList = useUiContextFn.getValue("filesfilter")
    const filter =
        "(" +
        extList.split(";").reduce((acc, item) => {
            if (acc.length == 0) {
                acc = item.trim()
            } else {
                acc += "|" + item.trim()
            }
            return acc
        }, "") +
        ")"

    for (let i = 0; i < regList.length; i++) {
        let regFn
        try {
            regFn = regList[i].regex.replaceAll("GCODE", filter)
            //console.log("regex is :", regFn)
            const reg_ex = new RegExp(regFn, "ig")
            const result = reg_ex.exec(line)
            if (result) {
                //console.log(result)
                const extract = regList[i].extract(result)
                //console.log(regList[i].extract(result))
                acc.push({
                    name: extract.name,
                    size: formatFileSizeToString(extract.size),
                })
                return acc
            }
        } catch (e) {
            console.log("error in regex", regFn, e)
            return acc
        }
    }
    //nothing was found
    return acc
}

const capabilities = {
    Process: (path, filename) => {
        return canProcessFile(filename)
    },
    UseFilters: () => true,
    IsFlatFS: () => false,
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
        const spath = (path + (path == "/" ? "" : "/")).replaceAll("//", "/")
        if (
            useSettingsContextFn.getValue("SerialProtocol") == "MKS" ||
            useUiContextFn.getValue("tftfs") == "mks"
        ) {
            const cmd = useUiContextFn
                .getValue("tftmkssdlistcmd")
                .replace("#", spath)
            return {
                type: "cmd",
                cmd,
            }
        } else {
            const cmd = useUiContextFn
                .getValue("tftbttsdlistcmd")
                .replace("#", spath)
            return {
                type: "cmd",
                cmd,
            }
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
            cmd: useUiContextFn.getValue("sdlistcmd"),
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
        const res = {}
        const files = result.content.reduce((acc, line) => {
            return formatFileSerialLine(acc, line)
        }, [])
        //res.files = sortedFilesList(files)
        
        if (useUiContextFn.getValue("sort_tftsd_files")){
            res.files = sortedFilesList(files)
        } else {
            res.files = files
        } 
       
        res.status = formatStatus(result.status)
        return res
    },
    filterResult: (data, path) => {
        const res = {}
        if (useUiContextFn.getValue("sort_tftsd_files")){
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
        if (
            useSettingsContextFn.getValue("SerialProtocol") == "MKS" ||
            useUiContextFn.getValue("tftfs") == "mks"
        ) {
            const cmd = useUiContextFn
                .getValue("tftmkssdplaycmd")
                .replace("#", spath)
            return {
                type: "cmd",
                cmd,
            }
        } else {
            const cmd = useUiContextFn
                .getValue("tftbttsdplaycmd")
                .replace("#", spath)
            return {
                type: "cmd",
                cmd,
            }
        }
    },
    delete: (path, filename) => {
        const spath = (path + (path == "/" ? "" : "/") + filename).replaceAll(
            "//",
            "/"
        )
        if (
            useSettingsContextFn.getValue("SerialProtocol") == "MKS" ||
            useUiContextFn.getValue("tftfs") == "mks"
        ) {
            const cmd = useUiContextFn
                .getValue("tftmkssddeletecmd")
                .replace("#", spath)
            return {
                type: "cmd",
                cmd,
            }
        } else {
            const cmd = useUiContextFn
                .getValue("tftbttsddeletecmd")
                .replace("#", spath)
            return {
                type: "cmd",
                cmd,
            }
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
                data.indexOf('echo:Unknown command: "M20"') != -1
            )
        },
    },
    delete: {
        start: (data) => data.startsWith("File deleted"),
        end: (data) => data.startsWith("ok") && !data.startsWith("ok T:"),
        error: (data) => {
            return data.startsWith("Deletion failed")
        },
    },
}

const TFTSD = { capabilities, commands, responseSteps }

export { TFTSD }
