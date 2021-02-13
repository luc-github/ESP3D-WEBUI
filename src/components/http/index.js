/*
 index.js - ESP3D WebUI HTTP queries file

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
import { getPageId, pausePing } from "../websocket"
import { showDialog } from "../dialog"
import { T } from "../translations"
import { updateTerminal, esp3dSettings, disconnectWsServer } from "../app"

/*
 * Local variables
 *
 */
let httpCommandList = []
let isProcessingHttpCommand = false
let currentHttpCommand = {}
let lastError = {}

/*
 * Some constants
 */
const maxCmdInList = 20
const errorListFull = -2
const errorInvalidId = -3

/*
 * Clear the current queries list
 */
function clearCommandList() {
    httpCommandList = []
    isProcessingHttpCommand = false
}

function showError() {
    showDialog({ type: "error", numError: lastError.code, message: T("S33") })
}

/*
 * Cancel the current upload
 */
function cancelCurrentQuery(code, message) {
    currentHttpCommand.abort()
    lastError.code = typeof code == "undefined" ? 205 : code
    lastError.message =
        typeof message == "undefined" ? " Reset Content" : message
    console.log("Abort Upload :" + lastError.code + " " + lastError.message)
    setTimeout(showError, 2000)
}

/*
 * Handle query success
 */
function defaultHttpResultFn(response_text) {
    isProcessingHttpCommand = false
    pausePing(false)
    if (
        httpCommandList.length > 0 &&
        typeof httpCommandList[0].resultfn != "undefined" &&
        httpCommandList[0].resultfn
    ) {
        httpCommandList[0].resultfn(response_text)
    }
    console.log("Success : " + response_text)
    nextCommand()
}

/*
 * Handle query error
 */
function defaultHttpErrorFn(errorcode, response_text) {
    if (errorcode == 401) {
        requestAuthentication()
        return
    }
    if (
        httpCommandList.length > 0 &&
        typeof httpCommandList[0].errorfn != "undefined" &&
        httpCommandList[0].errorfn
    ) {
        var fn = httpCommandList[0].errorfn
        fn(errorcode, response_text)
    } else {
        console.log("Error : " + errorcode + " : " + response_text)
    }
    nextCommand()
}

/*
 * Request Login/Password
 */
function requestAuthentication() {
    console.log("Request authentication")
    //remove previous failed command
    if (httpCommandList.length > 0) {
        if (httpCommandList[0].id == "login") {
            console.log("Removing login command from list")
            httpCommandList.shift()
        }
    }
    showDialog({ type: "login" })
}

/*
 * Go to next command in queries list
 */
function nextCommand() {
    console.log("pop Uri")
    httpCommandList.shift()
    isProcessingHttpCommand = false
    pausePing(false)
    processCommands()
}

/*
 * Add get query to command list
 */
function SendGetHttp(url, result_fn, error_fn, progress_fn, id, max_id) {
    if (httpCommandList.length > maxCmdInList && maxCmdInList != -1) {
        console.log("[HTTP]Command rejected: full")
        console.log(httpCommandList)
        if (typeof error_fn != "undefined") error_fn(errorListFull)
        return
    }
    var cmd_id = 0
    var cmd_max_id = 1
    if (typeof id != "undefined") {
        cmd_id = id
        if (typeof max_id != "undefined") cmd_max_id = max_id
        for (let p = 0; p < httpCommandList.length; p++) {
            if (httpCommandList[p].id == cmd_id) {
                cmd_max_id--
            }
            if (cmd_max_id <= 0) {
                console.log(
                    "[HTTP]Command rejected: invalid ID: " +
                        id +
                        " max id:" +
                        cmd_max_id
                )
                if (typeof error_fn != "undefined") error_fn(errorInvalidId)
                return
            }
        }
    }
    var cmd = {
        uri: url,
        type: "GET",
        resultfn: result_fn,
        errorfn: error_fn,
        progressfn: progress_fn,
        progressdlg: null,
        id: cmd_id,
    }
    httpCommandList.push(cmd)
    processCommands()
}

/*
 * Add post query to command list
 */
function SendPostHttp(
    url,
    postdata,
    result_fn,
    error_fn,
    progress_fn,
    progressDlg,
    id,
    max_id
) {
    if (httpCommandList.length > maxCmdInList && maxCmdInList != -1) {
        console.log("[HTTP]Command rejected: full")
        console.log(httpCommandList)
        if (typeof error_fn != "undefined") error_fn(errorListFull)
        return
    }
    var cmd_id = 0
    var cmd_max_id = 1
    if (typeof id != "undefined") {
        cmd_id = id
        if (typeof max_id != "undefined") cmd_max_id = max_id
        for (let p = 0; p < httpCommandList.length; p++) {
            if (httpCommandList[p].id == cmd_id) {
                cmd_max_id--
            }
            if (cmd_max_id <= 0) {
                console.log(
                    "[HTTP]Command rejected: invalid ID: " +
                        id +
                        " max id:" +
                        cmd_max_id
                )
                if (typeof error_fn != "undefined") error_fn(errorInvalidId)
                return
            }
        }
    }
    var cmd = {
        uri: url,
        type: "POST",
        data: postdata,
        resultfn: result_fn,
        errorfn: error_fn,
        progressfn: progress_fn,
        progressdlg: progressDlg,
        id: cmd_id,
    }
    //do a check before sending command to keep in buffer if authentication failed
    if (esp3dSettings.Authentication == "Enabled") {
        httpCommandList.push({
            uri: "/command?ping=yes",
            type: "GET",
            resultfn: null,
            errorfn: null,
            progressfn: null,
            progressdlg: null,
            id: "ping",
        })
    }
    //put command at the end of list
    httpCommandList.push(cmd)
    console.log(httpCommandList)
    processCommands()
}

/*
 * Send login credentials
 */
function SubmitCredentials(login, password, newpassword, timeout) {
    console.log("Submit credentials");
    let url = "/login"
    let formData = new FormData()

    if (typeof login != "undefined") {
        formData.append("USER", login)
        formData.append("PASSWORD", password)
        //to allow to change user password
        if (typeof newpassword != "undefined") {
            formData.append("NEWPASSWORD", newpassword)
        }
        //to change the session timeout (default in FW is 360000)
        if (typeof timeout != "undefined") {
            formData.append("TIMEOUT", timeout)
        }
        formData.append("SUBMIT", "yes")
    } else {
        formData.append("DISCONNECT", "yes")
    }
    console.log(formData);
    var cmd = {
        uri: url,
        type: "POST",
        data: formData,
        resultfn: null,
        errorfn: null,
        progressfn: null,
        progressdlg: null,
        id: "login",
    }
    //put command at the top of list
    httpCommandList.unshift(cmd)
    isProcessingHttpCommand = false
    processCommands()
}

/*
 * Process all commands one by one
 */
function processCommands() {
    console.log("Entering processing commands")
    console.log(Object.values(httpCommandList))
    if (httpCommandList.length > 0 && !isProcessingHttpCommand) {
        console.log(
            "Processing " +
                httpCommandList[0].type +
                " command:" +
                httpCommandList[0].uri
        )
        if (
            httpCommandList[0].type == "GET" ||
            httpCommandList[0].type == "POST"
        ) {
            isProcessingHttpCommand = true
            pausePing(true)
            currentHttpCommand = new XMLHttpRequest()
            let isdownload = false
            if (typeof httpCommandList[0].id != "undefined") {
                if (httpCommandList[0].id == "download") isdownload = true
            }
            if (isdownload) currentHttpCommand.responseType = "blob"
            currentHttpCommand.onerror = function() {
                console.log("Failing HTTP request " + (httpCommandList[0].uri)?httpCommandList[0].uri:" Uri")
                disconnectWsServer({
                    type: "disconnect",
                    numError: 1,
                    message: T("S10"),
                    button1text: T("S8"),
                })
            }
            currentHttpCommand.ontimeout = currentHttpCommand.onerror
            currentHttpCommand.onreadystatechange = function() {
                if (currentHttpCommand.readyState == 4) {
                    if (currentHttpCommand.status == 200) {
                        defaultHttpResultFn(
                            isdownload
                                ? currentHttpCommand.response
                                : currentHttpCommand.responseText
                        )
                    } else {
                        console.log(
                            httpCommandList[0].uri +
                                " Command status " +
                                currentHttpCommand.status
                        )
                        defaultHttpErrorFn(
                            currentHttpCommand.status,
                            isdownload
                                ? currentHttpCommand.response
                                : currentHttpCommand.responseText
                        )
                    }
                }
            }
            let url = httpCommandList[0].uri
            if (url.indexOf("?") != -1) url += "&PAGEID=" + getPageId()
            currentHttpCommand.open(httpCommandList[0].type, url, true)
            currentHttpCommand.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0")
            if (
                typeof httpCommandList[0].progressfn != "undefined" &&
                httpCommandList[0].progressfn != null
            )
                if (isdownload) {
                    currentHttpCommand.addEventListener(
                        "progress",
                        httpCommandList[0].progressfn,
                        false
                    )
                } else {
                    currentHttpCommand.upload.addEventListener(
                        "progress",
                        httpCommandList[0].progressfn,
                        false
                    )
                }
            if (httpCommandList[0].type == "POST") {
                console.log("Post query")
                console.log(httpCommandList[0].data)
            }
            if (httpCommandList[0].progressdlg != null) {
                console.log("Display progress dialog")
                showDialog(httpCommandList[0].progressdlg)
            }
            currentHttpCommand.send(
                httpCommandList[0].type == "POST"
                    ? httpCommandList[0].data
                    : null
            )
        } else {
            console.log("Unknow request")
        }
    } else {
        if (isProcessingHttpCommand) console.log("busy processing")
        if (httpCommandList.length == 0) console.log("Command list is empty")
    }
}

function SendCommand(cmd, result_fn, error_fn, progress_fn, id, max_id) {
    const url = "/command?cmd=" + encodeURIComponent(cmd)
    if (id != "noterminal")
        updateTerminal(<div class="text-primary">&gt; {cmd}</div>)
    return SendGetHttp(url, result_fn, error_fn, progress_fn, id, max_id)
}

export {
    clearCommandList,
    SendCommand,
    SendGetHttp,
    SendPostHttp,
    cancelCurrentQuery,
    lastError,
    SubmitCredentials,
}
