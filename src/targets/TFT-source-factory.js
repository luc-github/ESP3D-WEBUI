/*
 TFT-source-factory.js - ESP3D WebUI shared Target file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.
 LGPL v2.1 (see other target files for the full license text).

 Factory for TFT file sources (TFT SD card / TFT USB stick).
 The Marlin, Repetier and Smoothieware TFT sources were strictly identical
 except for the settings keys (sd vs usb): they are now generated from
 this single implementation to avoid maintaining 6 copies.
*/
import { canProcessFile } from "./helpers"
import {
    formatFileSizeToString,
    sortedFilesList,
    formatStatus,
    filterResultFiles,
} from "../components/Helpers"
import { useUiContextFn, useSettingsContextFn } from "../contexts"

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

const makeTftSource = ({ sortKey, mksCmds, bttCmds }) => {
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
                .getValue(mksCmds.list)
                .replace("#", spath)
            return {
                type: "cmd",
                cmd,
            }
        } else {
            const cmd = useUiContextFn
                .getValue(bttCmds.list)
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
        
        if (useUiContextFn.getValue(sortKey)){
            res.files = sortedFilesList(files)
        } else {
            res.files = files
        } 
       
        res.status = formatStatus(result.status)
        return res
    },
    filterResult: (data, path) => {
        const res = {}
        if (useUiContextFn.getValue(sortKey)){
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
                .getValue(mksCmds.play)
                .replace("#", spath)
            return {
                type: "cmd",
                cmd,
            }
        } else {
            const cmd = useUiContextFn
                .getValue(bttCmds.play)
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
                .getValue(mksCmds.delete)
                .replace("#", spath)
            return {
                type: "cmd",
                cmd,
            }
        } else {
            const cmd = useUiContextFn
                .getValue(bttCmds.delete)
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

    return { capabilities, commands, responseSteps }
}

export { makeTftSource }
