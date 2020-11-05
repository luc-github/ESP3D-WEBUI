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
import { Page, esp3dSettings } from "../app"
import { Esp3dVersion } from "../version"
import { RefreshCcw, Github, UploadCloud } from "preact-feather"
import { showDialog, updateProgress } from "../dialog"
import { useStoreon } from "storeon/preact"
import {
    SendCommand,
    SendPostHttp,
    cancelCurrentQuery,
    lastError,
} from "../http"
import { prefs } from "../settings"
const { gitHubURL } = require(`../${process.env.TARGET_ENV}`)

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
    document
        .getElementById("uploadControl")
        .setAttribute("accept", ".bin, .bin.gz")
    PrepareUpload()
}

/*
 * Update UI
 *
 */
function onClickUpdateUI() {
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
        showDialog({
            type: "confirmation",
            message: message,
            title: T("S26"),
            button1text: T("S27"),
            next1: processUpload,
            next2: cancelUpload,
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
    cancelCurrentQuery()
    showDialog({ displayDialog: false, refreshPage: true })
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
    let progressDlg = {
        type: "progress",
        progress: 0,
        title: T("S32"),
        button1text: T("S28"),
        next1: cancelUpload,
    }
    for (var i = 0; i < uploadFiles.length; i++) {
        var file = uploadFiles[i]
        var arg = "/" + file.name + "S"
        //append file size first to check updload is complete
        formData.append(arg, file.size)
        formData.append("myfile", file, "/" + file.name)
    }
    SendPostHttp(
        url,
        formData,
        successUpload,
        errorUpload,
        progressUpload,
        progressDlg
    )
}

/*
 * Restart sucess
 *
 */
function restart() {
    clearUploadInformation()
    showDialog({ type: "loader", message: T("S34"), title: T("S35") })
    if (pathUpload == "/files") {
        setTimeout(refreshPage, 3000)
    } else {
        setTimeout(refreshPage, 5000)
    }
}

/*
 * Upload success
 *
 */
function successUpload(response) {
    updateProgress({ progress: 100 })
    console.log("success wait 2s")
    setTimeout(restart, 2000)
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
        cancelCurrentQuery(errorCode, response)
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
        updateProgress({ progress: percentComplete.toFixed(0) })
    } else {
        // Impossible because size is unknown
    }
}

/*
 * Link for github ESP3D
 *
 */
function clickGitFW() {
    window.open(gitHubURL(), "_blank")
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
    const { activePage } = useStoreon("activePage")
    if (activePage != Page.about) return null
    if (browserInformation == "" || typeof browserInformation == "undefined") {
        browserInformation = getBrowserInformation()
    }
    if (prefs && prefs.autoload) {
        if (prefs.autoload && !isloaded) loadStatus()
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
                            class={
                                esp3dSettings.WebUpdate == "Enabled"
                                    ? "btn btn-primary btn-sm"
                                    : "d-none"
                            }
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
                                      {T(entry.value)
                                          .replace("&#39;", "'")
                                          .replace("&#34;", '"')}
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
    const cmd = "[ESP420]"
    isloaded = true
    showDialog({ type: "loader", message: T("S1") })
    console.log("load FW status")
    SendCommand(cmd, loadStatusSuccess, loadStatusError)
}

/*
 * Load Firmware Status query success
 */
function loadStatusSuccess(responseText) {
    try {
        dataStatus = JSON.parse(responseText)
        showDialog({ displayDialog: false, refreshPage: true })
    } catch (e) {
        console.log(responseText)
        console.error("Parsing error:", e)
        showDialog({ type: "error", numError: e, message: T("S21") })
    }
}

/*
 * Load Firmware Status query error
 */
function loadStatusError(errorCode, responseText) {
    showDialog({ type: "error", numError: errorCode, message: T("S5") })
}
