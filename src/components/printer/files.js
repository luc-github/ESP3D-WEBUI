/*
 terminal.js - ESP3D WebUI terminal file

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
import { T } from "../translations"
import { useState, useEffect } from "preact/hooks"
import {
    X,
    RefreshCcw,
    UploadCloud,
    FolderPlus,
    File,
    Folder,
    CornerRightUp,
    Trash2,
    Printer,
} from "preact-feather"
import {
    SendCommand,
    SendGetHttp,
    SendPostHttp,
    cancelCurrentUpload,
    lastError,
} from "../http"
import { useStoreon } from "storeon/preact"
import { showDialog, updateProgress } from "../dialog"
import { esp3dSettings, prefs } from "../app"

/*
 * Local variables
 *
 */

let currentFilesType = "FS"
let currentPath = []
let currentFileList = []
let fileSystemLoaded = []
let isloaded = false
let processingEntry
let uploadFiles
let pathUpload = "/files"

/*
 * Local constants
 *
 */

/*
 * Give Configuration command and parameters
 */
function listFilesCmd(type = 0) {
    switch (esp3dSettings.FWTarget) {
        case "repetier":
        case "repetier4davinci":
            return ["M205", "EPR", "wait", "error"]
        case "marlin-embedded":
        case "marlin":
        case "marlinkimbra":
            return ["M503", "echo:  G21", "ok", "error"]
        case "smoothieware":
            if (!override)
                return ["cat " + smoothiewareConfigFile, "#", "ok", "error"]
            return ["M503", ";", "ok", "error"]
        default:
            return "Unknown"
    }
}

/*
 * Check is can create directory
 */
function canDelete(entry) {
    if (
        currentFilesType == "TFTSD" ||
        currentFilesType == "TFTUSB" ||
        (esp3dSettings.FWTarget == "marlin" && currentFilesType != "FS")
    ) {
        return false
    }

    return true
}

/*
 * Check if can print file
 */
function canPrint(entry) {
    if (currentFilesType == "FS" || entry.size == -1) {
        return false
    }
    let filefilter = prefs.filesfilter.trim()
    if (filefilter != "*" && filefilter.length > 0) {
        let tfilters = filefilter.split(";")
        for (let p of tfilters) {
            if (entry.name.endsWith("." + p)) return true
        }
        return false
    }
    return true
}

/*
 * Check if can create directory
 */
function canCreateDirectory() {
    if (
        currentFilesType == "TFTSD" ||
        currentFilesType == "TFTUSB" ||
        (esp3dSettings.FWTarget == "marlin" && currentFilesType != "FS")
    ) {
        return false
    }

    return true
}

/*
 * Check if can upload
 */
function canUpload() {
    if (currentFilesType == "TFTSD" || currentFilesType == "TFTUSB") {
        return false
    }

    return true
}

/*
 * Delete selected file or directory
 */
function processDelete() {
    let cmd
    showDialog({ type: "loader", message: T("S102") })
    switch (currentFilesType) {
        case "FS":
            cmd =
                "files?path=" +
                encodeURIComponent(currentPath[currentFilesType]) +
                "&action=" +
                (processingEntry.size == -1 ? "deletedir" : "delete") +
                "&filename=" +
                encodeURIComponent(processingEntry.name)
            SendGetHttp(
                cmd,
                refreshFilesListSuccess,
                refreshFilesListError,
                null,
                "fslist",
                1
            )
            break
        default:
            console.log(currentFilesType + " is not a valid file system")
            showDialog({ displayDialog: false })
    }
}

/*
 * Close dialog
 *
 */
function closeDialog() {
    showDialog({ displayDialog: false })
}

/*
 * Upload sucess
 *
 */
function successDownload(response) {
    updateProgress({ progress: 100 })

    var file = new Blob([response], { type: "application/octet-stream" })
    if (window.navigator.msSaveOrOpenBlob)
        // IE10+
        window.navigator.msSaveOrOpenBlob(file, processingEntry.name)
    else {
        // Others
        let a = document.createElement("a"),
            url = URL.createObjectURL(file)
        a.href = url
        a.download = processingEntry.name
        document.body.appendChild(a)
        a.click()
        setTimeout(function() {
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        }, 0)
    }
    setTimeout(closeDialog, 1000)
}

/*
 * Cancel upload silently
 * e.g: user pressed cancel before upload
 */
function cancelDownload() {
    cancelCurrentUpload()
    showDialog({ displayDialog: false })
}

/*
 * Download failed
 *
 */
function errorDownload(errorCode, response) {
    console.log("error upload code : " + lastError.code + " " + errorCode)
    clearUploadInformation()
    if (!lastError.code && errorCode == 0) {
        cancelCurrentUpload(errorCode, response)
    }
    showDialog({ type: "error", numError: errorCode, message: T("S103") })
}

/*
 * File List item for file or directory
 */
const FileEntry = ({ entry, pos }) => {
    let timestamp
    if (typeof entry.time != "undefined") timestamp = entry.time
    let topclass = "d-flex flex-row justify-content-around p-1 hotspot rounded"
    if (pos > 0) topclass += " border-top"
    const openDir = e => {
        currentPath[currentFilesType] +=
            (currentPath[currentFilesType] == "/" ? "" : "/") + entry.name
        refreshFilesList()
    }
    const deleteFile = e => {
        processingEntry = entry
        let message = (
            <div class="d-flex flex-wrap">
                <div>{entry.size == -1 ? T("S101") : T("S100")}:</div>
                <div class="p-1"></div>
                <div style="text-align: left; display: inline-block; overflow: hidden;text-overflow: ellipsis;">
                    {currentPath[currentFilesType]}
                    {currentPath[currentFilesType] == "/" ? "" : "/"}
                    {entry.name}
                </div>
            </div>
        )

        showDialog({
            type: "confirmation",
            message: message,
            title: T("S26"),
            button1text: T("S27"),
            next: processDelete,
        })
    }
    const printFile = e => {
        let filename =
            currentPath[currentFilesType] +
            (currentPath[currentFilesType] == "/" ? "" : "/") +
            entry.name
        console.log("print " + filename)
    }
    const downloadFile = e => {
        let filename =
            currentPath[currentFilesType] +
            (currentPath[currentFilesType] == "/" ? "" : "/") +
            entry.name
        console.log("download " + filename)
        processingEntry = entry
        showDialog({
            type: "progress",
            title: T("S108"),
            message: <div class="p-1">{entry.name}</div>,
            button1text: T("S28"),
            next: cancelUpload,
            progress: 0,
        })
        SendGetHttp(
            filename,
            successDownload,
            errorDownload,
            progressAction,
            "download",
            1
        )
    }

    if (entry.size != -1)
        return (
            <div class={topclass}>
                <div class="d-flex flex-row flex-grow-1" onclick={downloadFile}>
                    <div class="p-1 hide-low">
                        <File />
                    </div>
                    <div
                        class="p-1 text-truncate flex-grow-1"
                        title={entry.name}
                    >
                        {entry.name}
                    </div>
                    <div class="p-1 hide-low text-right">{timestamp}</div>
                    <div class="hide-low p-1 text-right" style="width:6rem;">
                        {entry.size}
                    </div>
                </div>
                <div
                    class={
                        canPrint(entry)
                            ? ""
                            : currentFilesType == "FS"
                            ? "d-none"
                            : "invisible"
                    }
                >
                    <button class="btn btn-outline-dark" onclick={printFile}>
                        <Printer size="1.2em" />
                    </button>
                </div>
                <div class="p-1"></div>
                <div class={canDelete(entry) ? "" : "invisible"}>
                    <button class="btn btn-outline-danger" onclick={deleteFile}>
                        <Trash2 size="1.2em" />
                    </button>
                </div>
            </div>
        )
    else
        return (
            <div class={topclass}>
                <div class="d-flex flex-row flex-grow-1" onclick={openDir}>
                    <div class="p-1 hide-low">
                        <Folder />
                    </div>
                    <div class="p-1 d-flex flex-wrap">
                        <div class="show-low">[</div>
                        <div class="text-break">{entry.name}</div>
                        <div class="show-low">]</div>
                    </div>
                </div>
                <div class={canDelete(entry) ? "" : "d-none"}>
                    <button class="btn btn-outline-danger" onclick={deleteFile}>
                        <Trash2 size="1.2em" />
                    </button>
                </div>
            </div>
        )
}

/*
 * Generate output files list based on generic formated list
 */
function buildFilesList(data) {
    const { dispatch } = useStoreon()
    let nb = 0
    currentFileList[currentFilesType] = []
    const levelUp = e => {
        let pos = currentPath[currentFilesType].lastIndexOf("/")
        let newpath = currentPath[currentFilesType].substring(0, pos)
        if (newpath.length == 0) newpath = "/"
        currentPath[currentFilesType] = newpath
        refreshFilesList()
    }
    //add up directory command
    if (currentPath[currentFilesType] != "/") {
        currentFileList[currentFilesType].push(
            <div class="p-1 hotspot" onclick={levelUp}>
                <CornerRightUp />
                <span class="p-1" style="font: 700 18px/1 Lato, sans-serif;">
                    ...
                </span>
            </div>
        )
        nb++
    }

    //files first
    for (let entry of data) {
        if (entry.size != -1) {
            currentFileList[currentFilesType].push(
                <FileEntry entry={entry} pos={nb} />
            )
        }
        nb++
    }
    for (let entry of data) {
        if (entry.size == -1) {
            currentFileList[currentFilesType].push(
                <FileEntry entry={entry} pos={nb} />
            )
        }
        nb++
    }
    dispatch("setFilesList", currentFileList[currentFilesType])
    showDialog({ displayDialog: false })
}

/*
 * Generate output status
 */
function buildStatus(data) {
    const { dispatch } = useStoreon()
    let newstatus = []
    if (
        typeof data.total != "undefined" &&
        typeof data.used != "undefined" &&
        typeof data.occupation != "undefined"
    ) {
        let style = "width:" + data.occupation + "%;"
        newstatus.push(
            <div class="d-flex flex wrap">
                <div>{T("S98")}:</div>
                <div class="p-1" />
                <div>{data.total}</div>
                <div class="p-1" />
                <div>-</div>
                <div class="p-1" />
                <div>{T("S99")}:</div>
                <div class="p-1" />
                <div>{data.used}</div>
                <div class="d-flex flex wrap hide-low flex-grow-1">
                    <div class="p-1" />
                    <div class="flex-grow-1 p-1">
                        <div class="progress ">
                            <div class="progress-bar  bg-success" style={style}>
                                <div
                                    class={
                                        data.occupation >= 10 ? "" : "d-none"
                                    }
                                >
                                    {data.occupation}%
                                </div>
                            </div>
                            <div class={data.occupation < 10 ? "" : "d-none"}>
                                {data.occupation}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    if (typeof data.status != "undefined") {
        if (data.status != "ok") {
            newstatus.push(<div>{data.status}</div>)
        }
    }
    dispatch("setFilesStatus", newstatus)
}

/*
 * Handle query success
 */
function refreshFilesListSuccess(responseText) {
    try {
        switch (currentFilesType) {
            case "FS":
                let responsejson = JSON.parse(responseText)
                buildFilesList(responsejson.files)
                buildStatus(responsejson)
                fileSystemLoaded[currentFilesType] = true
                break
            default:
                console.log(currentFilesType + " is not a valid file system")
        }
    } catch (errorcode) {
        showDialog({ type: "error", numError: 500, message: T("S4") })
    }
}

/*
 * Handle query error
 */
function refreshFilesListError(errorCode, responseText) {
    fileSystemLoaded[currentFilesType] = false
    showDialog({ type: "error", numError: errorCode, message: T("S103") })
}

/*
 * Refresh files list primary command
 */
function refreshFilesList() {
    if (typeof currentPath[currentFilesType] == "undefined")
        currentPath[currentFilesType] = "/"
    let cmd
    showDialog({ type: "loader", message: T("S1") })
    switch (currentFilesType) {
        case "FS":
            cmd =
                "files?path=" +
                encodeURIComponent(currentPath[currentFilesType]) +
                "&action=list"
            SendGetHttp(
                cmd,
                refreshFilesListSuccess,
                refreshFilesListError,
                null,
                "fslist",
                1
            )
            break
        default:
            const { dispatch } = useStoreon()
            console.log(currentFilesType + " is not a valid file system")
            dispatch("setFilesList", [])
            dispatch("setFilesStatus", [])
            showDialog({ displayDialog: false })
    }
}

/*
 * Create directory on target FS
 */
function processCreateDir() {
    if (processingEntry.length > 0) {
        let cmd
        showDialog({ type: "loader", message: T("S1") })
        switch (currentFilesType) {
            case "FS":
                cmd =
                    "files?path=" +
                    encodeURIComponent(currentPath[currentFilesType]) +
                    "&action=createdir&filename=" +
                    encodeURIComponent(processingEntry)
                SendGetHttp(
                    cmd,
                    refreshFilesListSuccess,
                    refreshFilesListError,
                    null,
                    "fslist",
                    1
                )
                break
            default:
                console.log(currentFilesType + " is not a valid file system")
                showDialog({ displayDialog: false })
        }
    }
}

/*
 * Create directory requested by click
 */
function clickCreateDirectory() {
    const onInput = e => {
        processingEntry = e.target.value
    }
    const onKeyUp = e => {
        if (e.keyCode == 13) {
            processCreateDir()
        }
    }
    let message = (
        <div class="d-flex flex-wrap">
            <input
                type="text"
                class="form-control"
                onInput={onInput}
                onkeyup={onKeyUp}
                value=""
                placeholder={T("S105")}
            />
        </div>
    )
    processingEntry = ""
    showDialog({
        type: "confirmation",
        message: message,
        title: T("S104"),
        button1text: T("S106"),
        next: processCreateDir,
    })
}

/*
 * List of available files system
 */
const FilesTypeSelector = () => {
    let optionsList = []
    const selectChange = e => {
        currentFilesType = e.target.value
        showDialog({ displayDialog: false, refreshPage: true })
        refreshFilesList()
    }
    optionsList.push(<option value="FS">ESP</option>)
    //TODO
    //direct or serial (sd is serial on smoothieware
    //optionsList.push(<option value="SD">SD</option>)
    //secondary serial or direct ext can be direct or serial TBD
    //optionsList.push(<option value="SDext">SD2</option>)
    //if (prefs.tftsd) optionsList.push(<option value="TFTSD">TFT SD</option>)
    //if (prefs.tftusb) optionsList.push(<option value="TFTUSB">TFT USB</option>)
    return (
        <div>
            <select
                onchange={selectChange}
                value={currentFilesType}
                class="form-control"
            >
                {optionsList}
            </select>
        </div>
    )
}

/*
 * Upload requested by click
 */
function clickUpload() {
    if (currentFilesType == "FS") {
        document
            .getElementById("uploadFilesControl")
            .setAttribute("accept", "*")
        document
            .getElementById("uploadFilesControl")
            .setAttribute("multiple", "true")
        pathUpload = "/files"
    } else {
        let f = prefs.filesfilter.trim()
        if (f.length > 0 && f != "*") {
            f = "." + f.replace(/;/g, ",.")
        } else f = "*"

        document.getElementById("uploadFilesControl").setAttribute("accept", f)
        document
            .getElementById("uploadFilesControl")
            .setAttribute("multiple", "false")
        pathUpload = "/sdfiles"
    }
    PrepareUpload()
}

/*
 * Prepare Upload and confirmation dialog
 *
 */
function PrepareUpload() {
    document.getElementById("uploadFilesControl").click()
    document.getElementById("uploadFilesControl").onchange = () => {
        uploadFiles = document.getElementById("uploadFilesControl").files
        let fileList = []
        let message = []
        fileList.push(<div>{T("S30")}</div>)
        fileList.push(<br />)
        for (let i = 0; i < uploadFiles.length; i++) {
            fileList.push(<li>{uploadFiles[i].name}</li>)
        }
        message.push(
            <center>
                <div style="text-align: left; display: inline-block; overflow: hidden;text-overflow: ellipsis;">
                    <ul>{fileList}</ul>
                </div>
                <div>
                    {T("S107")}:<span class="p-1" />
                    {currentPath[currentFilesType]}
                </div>
            </center>
        )
        showDialog({
            type: "confirmation",
            message: message,
            title: T("S26"),
            button1text: T("S27"),
            next: processUpload,
            next2: cancelUpload,
        })
    }
}

/*
 * delete all upload information
 *
 */
function clearUploadInformation() {
    if (document.getElementById("uploadFilesControl")) {
        document.getElementById("uploadFilesControl").value = ""
    }
}

/*
 * Cancel upload silently
 * e.g: user pressed cancel before upload
 */
function cancelUpload() {
    clearUploadInformation()
    cancelCurrentUpload()
    showDialog({ displayDialog: false, refreshPage: true })
}

/*
 * Start upload
 *
 */
function processUpload() {
    var formData = new FormData()
    var url = pathUpload
    formData.append("path", currentPath[currentFilesType])
    showDialog({
        type: "progress",
        progress: 0,
        title: T("S32"),
        button1text: T("S28"),
        next: cancelUpload,
    })
    for (var i = 0; i < uploadFiles.length; i++) {
        var file = uploadFiles[i]
        var arg =
            currentPath[currentFilesType] +
            (currentPath[currentFilesType] == "/" ? "" : "/") +
            file.name +
            "S"
        //append file size first to check updload is complete
        formData.append(arg, file.size)
        formData.append(
            "myfile",
            file,
            currentPath[currentFilesType] +
                (currentPath[currentFilesType] == "/" ? "" : "/") +
                file.name
        )
    }
    SendPostHttp(url, formData, successUpload, errorUpload, progressAction)
}

/*
 * Finalize upload
 *
 */
function finalizeUpload() {
    refreshFilesList()
    clearUploadInformation()
}

/*
 * Upload success
 *
 */
function successUpload(response) {
    updateProgress({ progress: 100 })
    setTimeout(finalizeUpload, 2000)
}

/*
 * Upload failed
 *
 */
function errorUpload(errorCode, response) {
    console.log("error upload code : " + lastError.code + " " + errorCode)
    clearUploadInformation()
    if (!lastError.code && errorCode == 0) {
        cancelCurrentUpload(errorCode, response)
    }
}

/*
 * Upload progress
 *
 */
function progressAction(oEvent) {
    if (oEvent.lengthComputable) {
        var percentComplete = (oEvent.loaded / oEvent.total) * 100
        console.log(percentComplete.toFixed(0) + "%")
        updateProgress({ progress: percentComplete.toFixed(0) })
    } else {
        // Impossible because size is unknown
    }
}

/*
 * Files Controls
 *
 */
const FilesControls = () => {
    const { dispatch } = useStoreon()
    const toogleFiles = e => {
        dispatch("panel/showfiles", false)
    }
    return (
        <div>
            <div class="d-flex flex-wrap p-1">
                <div class="p-1">
                    <FilesTypeSelector />
                </div>
                <div class="p-1">
                    <button
                        type="button"
                        title={T("S23")}
                        class="btn btn-primary"
                        onClick={refreshFilesList}
                    >
                        <RefreshCcw />
                        <span class="hide-low text-button">{T("S50")}</span>
                    </button>
                </div>
                <div class={(fileSystemLoaded[currentFilesType] && canUpload()) ? "p-1" : "d-none"}>
                    <button
                        type="button"
                        title={T("S89")}
                        class="btn btn-secondary"
                        onClick={clickUpload}
                    >
                        <UploadCloud />
                        <span class="hide-low text-button">{T("S88")}</span>
                    </button>
                </div>
                <div class="ml-auto">
                    <button
                        type="button"
                        class="btn btn-light btn-sm red-hover"
                        title={T("S86")}
                        onClick={toogleFiles}
                    >
                        <X />
                    </button>
                </div>
            </div>
            <div class="d-flex flex-wrap p-1">
                <div class="p-1">
                    <button
                        type="button"
                        title={T("S90")}
                        class={(fileSystemLoaded[currentFilesType] && canCreateDirectory()) ? "btn btn-info" : "d-none"}
                        onClick={clickCreateDirectory}
                    >
                        <FolderPlus />
                        <span class="hide-low text-button">{T("S90")}</span>
                    </button>
                </div>
                <div class="p-1">
                    <span class="text-break">
                        {" "}
                        {currentPath[currentFilesType]}
                    </span>
                </div>
            </div>
        </div>
    )
}

/*
 *Send command query error
 */
function sendCommandError(errorCode, responseText) {
    showDialog({ type: "error", numError: errorCode, message: T("S5") })
}

/*
 * Files Window
 *
 */
const FilesPanel = () => {
    const { showFiles } = useStoreon("showFiles")
    if (!showFiles) return null
    const { filesStatus } = useStoreon("filesStatus")
    const { filesList } = useStoreon("filesList")
    if (typeof fileSystemLoaded[currentFilesType] == "undefined")fileSystemLoaded[currentFilesType] = false
    if (fileSystemLoaded[currentFilesType] == false && prefs.autoload) refreshFilesList()
    return (
        <div class="w-100 panelCard">
            <div class="p-2 ">
                <div class="border rounded p-2 panelCard">
                    <div class="w-100">
                        <FilesControls />
                        <div class="card filespanel">
                            <div
                                class="card-body"
                                style="overflow:auto; padding:0 0;"
                            >
                                <div class="d-flex flex-column">
                                    {filesList}
                                </div>
                            </div>
                            <div class="card-footer">{filesStatus}</div>
                        </div>
                    </div>
                </div>
            </div>
            <input type="file" class="d-none" id="uploadFilesControl" />
        </div>
    )
}

export { FilesPanel }
