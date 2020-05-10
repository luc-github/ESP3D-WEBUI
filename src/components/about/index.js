/*
 index.js - ESP3D WebUI about file

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
import { T, Translate } from "../translations"
import { Page, esp3dSettings, globaldispatch, Action } from "../app"
import { Esp3dVersion } from "../version"
import { RefreshCcw, Github, UploadCloud } from "preact-feather"
import {
    SendCommand,
    SendPostHttp,
    cancelCurrentUpload,
    lastError,
} from "../http"
import { prefs } from "../settings"

/*
 * Local variables
 *
 */

let browserInformation = ""
let dataStatus = {}
let uploadFiles
let pathUpload = "/files"
let isloaded = false

//from https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
function getBrowserInformation() {
    var ua = navigator.userAgent,
        tem,
        M =
            ua.match(
                /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
            ) || []
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || []
        return "IE " + (tem[1] || "")
    }
    if (M[1] === "Chrome") {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/)
        if (tem != null)
            return tem
                .slice(1)
                .join(" ")
                .replace("OPR", "Opera")
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"]
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1])
    return M.join(" ")
}

/*
 * Update FW
 *
 */
function onClickUpdateFW() {
    console.log("Update FW")
    pathUpload = "/updatefw"
    document.getElementById("uploadControl").setAttribute("accept", ".bin, .bin.gz")
    PrepareUpload()
}

/*
 * Update UI
 *
 */
function onClickUpdateUI() {
    console.log("Update UI")
    pathUpload = "/files"
    document.getElementById("uploadControl").setAttribute("accept", "*")
    document.getElementById("uploadControl").setAttribute("multiple", "true")
    PrepareUpload()
}

/*
 * Prepare Upload and confirmation dialog
 *
 */
function PrepareUpload() {
    document.getElementById("uploadControl").click()
    document.getElementById("uploadControl").onchange = () => {
        console.log("content changed")
        uploadFiles = document.getElementById("uploadControl").files
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
            </center>
        )
        //todo open dialog to confirm
        globaldispatch({
            type: Action.confirmation,
            msg: message,
            nextaction: processUpload,
            nextaction2: cancelUpload,
        })
    }
}

/*
 * delete all upload information
 *
 */
function clearUploadInformation() {
    if (document.getElementById("uploadControl")) {
        console.log("clear upload info")
        document.getElementById("uploadControl").value = ""
    }
}

/*
 * Cancel upload silently
 * e.g: user pressed cancel before upload
 */
function cancelUpload() {
    clearUploadInformation()
    cancelCurrentUpload()
    globaldispatch({
        type: Action.renderAll,
    })
}

/*
 * Start upload
 *
 */
function processUpload() {
    console.log("Now uploading")
    var formData = new FormData()
    var url = pathUpload
    formData.append("path", "/")
    globaldispatch({
        type: Action.upload_progress,
        title: "S32",
        msg: null,
        progress: 0,
        nextaction: cancelUpload,
    })
    for (var i = 0; i < uploadFiles.length; i++) {
        var file = uploadFiles[i]
        var arg = "/" + file.name + "S"
        //append file size first to check updload is complete
        formData.append(arg, file.size)
        formData.append("myfile", file, "/" + file.name)
    }
    SendPostHttp(url, formData, successUpload, errorUpload, progressUpload)
}

/*
 * Upload sucess
 *
 */
function successUpload(response) {
    globaldispatch({
        type: Action.upload_progress,
        progress: 100,
        nextaction: cancelUpload,
    })
    console.log("success")
    clearUploadInformation()
    globaldispatch({
        type: Action.message,
        title: "S34",
        msg: "S35",
    })
    if (pathUpload == "/files") {
        setTimeout(refreshPage, 3000)
    } else {
        //wait for restart due to websocket disconnection
        //so no need to reload
    }
}

/*
 * Refresh page without cache
 *
 */
function refreshPage() {
    window.location.reload(true)
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
function progressUpload(oEvent) {
    if (oEvent.lengthComputable) {
        var percentComplete = (oEvent.loaded / oEvent.total) * 100
        console.log(percentComplete.toFixed(0) + "%")
        globaldispatch({
            type: Action.upload_progress,
            progress: percentComplete.toFixed(0),
            title: "S32",
            nextaction: cancelUpload,
        })
    } else {
        // Impossible because size is unknown
    }
}

/*
 * Link for github ESP3D
 *
 */
function clickGitFW() {
    window.open("https://github.com/luc-github/ESP3D/tree/3.0", "_blank")
}

/*
 * Link for github ESP3D-WEBUI
 *
 */
function clickGitUI() {
    window.open("https://github.com/luc-github/ESP3D-WEBUI/tree/3.0", "_blank")
}

/*
 * About page
 *
 */
export const AboutPage = ({ currentState }) => {
    if (currentState.activePage != Page.about) return null
    if (browserInformation == "" || typeof browserInformation == "undefined") {
        browserInformation = getBrowserInformation()
    }
    if (prefs && prefs.autoload) {
        if (prefs.autoload == "true" && !isloaded) loadStatus()
    }
    return (
        <div class="card-body card-low">
            <h3 class="card-title">{T("S12")}</h3>
            <hr />
            <center>
                <div class="list-left">
                    <div class="card-text">
                        <span class="text-info">{T("S16")}: </span>
                        {esp3dSettings.FWVersion}&nbsp;
                        <button
                            type="button"
                            title={T("S20")}
                            class="btn btn-light btn-sm"
                            onClick={clickGitFW}
                        >
                            <span class="badge badge-pill badge-dark">
                                <Github />
                                <span class="hide-low text-button-pill">
                                    {T("S20")}
                                </span>
                            </span>
                        </button>
                        &nbsp;
                        <button
                            type="button"
                            title={T("S25")}
                            class="btn btn-primary btn-sm"
                            onClick={onClickUpdateFW}
                        >
                            <UploadCloud />
                            <span class="hide-low text-button">{T("S25")}</span>
                        </button>
                    </div>
                    <div style="height:2px" />
                    <div class="card-text">
                        <span class="text-info">{T("S17")}: </span>
                        <Esp3dVersion />
                        &nbsp;
                        <button
                            type="button"
                            title={T("S20")}
                            class="btn btn-light btn-sm"
                            onClick={clickGitUI}
                        >
                            <span class="badge badge-pill badge-dark">
                                <Github />

                                <span class="hide-low text-button-pill">
                                    {T("S20")}
                                </span>
                            </span>
                        </button>
                        &nbsp;
                        <button
                            type="button"
                            title={T("S25")}
                            class="btn btn-primary btn-sm"
                            onClick={onClickUpdateUI}
                        >
                            <UploadCloud />
                            <span class="hide-low text-button">{T("S25")}</span>
                        </button>
                        <input type="file" class="d-none" id="uploadControl" />
                    </div>
                    <div style="height:2px" />
                    <div class="card-text" title={navigator.userAgent}>
                        <span class="text-info">{T("S18")}: </span>
                        {browserInformation}
                    </div>
                    {dataStatus.Status
                        ? dataStatus.Status.map((entry, index) => {
                              if (entry.id == "FW ver") return null
                              return (
                                  <div class="card-text">
                                      <span class="text-info">
                                          {T(entry.id)}:{" "}
                                      </span>
                                      {T(entry.value)}
                                  </div>
                              )
                          })
                        : ""}
                </div>
            </center>
            <hr />
            <center>
                <button
                    type="button"
                    class="btn btn-primary"
                    title={T("S23")}
                    onClick={loadStatus}
                >
                    <RefreshCcw />
                    <span class="hide-low text-button">{T("S50")}</span>
                </button>
            </center>
        </div>
    )
}

/*
 * Load Firmware Status
 */
function loadStatus() {
    const cmd = encodeURIComponent("[ESP420]")
    isloaded = true
    globaldispatch({
        type: Action.fetch_data,
    })
    console.log("load FW status")
    SendCommand(cmd, loadStatusSuccess, loadStatusError)
}

/*
 * Load Firmware Status query success
 */
function loadStatusSuccess(responseText) {
    try {
        dataStatus = JSON.parse(responseText)
        globaldispatch({
            type: Action.renderAll,
        })
    } catch (e) {
        console.log(responseText)
        console.error("Parsing error:", e)
        globaldispatch({
            type: Action.error,
            errorcode: e,
            msg: "S21",
        })
    }
}

/*
 * Load Firmware Status query error
 */
function loadStatusError(errorCode, responseText) {
    globaldispatch({
        type: Action.error,
        errorcode: errorCode,
        msg: "S5",
    })
}
