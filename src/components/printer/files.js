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
import { X, RefreshCcw, UploadCloud, FolderPlus } from "preact-feather"
import { SendCommand } from "../http"
import { useStoreon } from "storeon/preact"
import { showDialog } from "../dialog"
import { esp3dSettings, prefs } from "../app"

/*
 * Local variables
 *
 */

let currentFilesType = "FS"

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

function refreshFileList() {
    console.log("refresh " + currentFilesType)
}

const FilesTypeSelector = () => {
    let optionsList = []
    const selectChange = e => {
        currentFilesType = e.target.value
        refreshFileList()
    }
    optionsList.push(<option value="FS">ESP</option>)
    //direct or serial (sd is serial on smoothieware
    optionsList.push(<option value="SD">SD</option>)
    //secondary serial or direct ext can be direct or serial TBD
    //optionsList.push(<option value="SDext">SD2</option>)
    if (prefs.tftsd)optionsList.push(<option value="TFTSD">TFT SD</option>)
    if (prefs.tftusb)optionsList.push(<option value="TFTUSB">TFT USB</option>)
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

function canCreateDirectory() {
    if (
        currentFilesType == "TFTSD" ||
        currentFilesType == "TFTUSB" ||
        esp3dSettings.FWTarget == "marlin"
    ) {
        return false
    }

    return true
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
                        onClick={refreshFileList}
                    >
                        <RefreshCcw />
                        <span class="hide-low text-button">{T("S50")}</span>
                    </button>
                </div>
                <div class="p-1">
                    <button
                        type="button"
                        title={T("S89")}
                        class="btn btn-secondary"
                        onClick={refreshFileList}
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
                        class={canCreateDirectory() ? "btn btn-info" : "d-none"}
                        onClick={refreshFileList}
                    >
                        <FolderPlus />
                        <span class="hide-low text-button">{T("S90")}</span>
                    </button>
                </div>
                <div class="p-1">
                    <span> /full path/to file</span>
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
    return (
        <div class="w-100 panelCard">
            <div class="p-2 ">
                <div class="border rounded p-2 panelCard">
                    <div class="w-100">
                        <FilesControls />
                        <div class="card filespanel">
                            <div class="card-body">{filesList}</div>
                            <div class="card-footer">{filesStatus}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { FilesPanel }
