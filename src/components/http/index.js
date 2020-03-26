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

"use strict"
import { getPageId } from "../websocket"

/*
 * Local variables
 *
 */
var httpCommandList = []
var isProcessingHttpCommand = false
var currentHttpCommand = {}

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

/*
 * Handle query success
 */
function defaultHttpResultFn(response_text) {
    isProcessingHttpCommand = false
    if (
        httpCommandList.length > 0 &&
        typeof httpCommandList[0].resultfn != "undefined"
    ) {
        httpCommandList[0].resultfn(response_text)
    }
    //console.log("Success : " + response_text)
    nextCommand()
}

/*
 * Handle query error
 */
function defaultHttpErrorFn(errorcode, response_text) {
    if (
        httpCommandList.length > 0 &&
        typeof httpCommandList[0].errorfn != "undefined"
    ) {
        var fn = httpCommandList[0].errorfn
        if (errorcode == 401) {
            requestAuthentication()
            console.log("Authentication issue pls log")
        } else {
            fn(errorcode, response_text)
        }
        console.log("Error : " + errorcode + " : " + response_text)
    }
    nextCommand()
}

/*
 * Request Login/Password
 */
function requestAuthentication() {
    //TODO
    console.log("Need login password")
}

/*
 * Go to next command in queries list
 */
function nextCommand() {
    //console.log("pop " + httpCommandList[0].uri)
    httpCommandList.shift()
    isProcessingHttpCommand = false
    processCommands()
}

/*
 * Add get query to command list
 */
function SendGetHttp(url, result_fn, error_fn, progress_fn, id, max_id) {
    if (httpCommandList.length > maxCmdInList && maxCmdInList != -1) {
        console.log("[HTTP]Command rejected: full")
        if (typeof error_fn != "undefined") error_fn(errorListFull)
        return
    }
    var cmd_id = 0
    var cmd_max_id = 1
    if (typeof id != "undefined") {
        cmd_id = id
        if (typeof max_id != "undefined") cmd_max_id = max_id
        for (p = 0; p < httpCommandList.length; p++) {
            if (httpCommandList[p].id == cmd_id) {
                cmd_max_id--
            }
            if (cmd_max_id <= 0) {
                console.log("[HTTP]Command rejected: invalid ID")
                if (typeof error_fn != "undefined") error_fn(errorInvalidId)
                return
            }
        }
    }
    var cmd = {
        uri: url,
        type: "GET",
        isupload: false,
        resultfn: result_fn,
        errorfn: error_fn,
        progressfn: progress_fn,
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
    id,
    max_id
) {
    if (httpCommandList.length > maxCmdInList && maxCmdInList != -1) {
        console.log("[HTTP]Command rejected: full")
        if (typeof error_fn != "undefined") error_fn(errorListFull)
        return
    }
    var cmd_id = 0
    var cmd_max_id = 1
    if (typeof id != "undefined") {
        cmd_id = id
        if (typeof max_id != "undefined") cmd_max_id = max_id
        for (p = 0; p < httpCommandList.length; p++) {
            if (httpCommandList[p].id == cmd_id) {
                cmd_max_id--
            }
            if (cmd_max_id <= 0) {
                console.log("[HTTP]Command rejected: invalid ID")
                if (typeof error_fn != "undefined") error_fn(errorInvalidId)
                return
            }
        }
    }
    var cmd = {
        uri: url,
        type: "POST",
        isupload: false,
        data: postdata,
        resultfn: result_fn,
        errorfn: error_fn,
        progressfn: progress_fn,
        id: cmd_id,
    }
    httpCommandList.push(cmd)
    processCommands()
}

/*
 * Process all commands one by one
 */
function processCommands() {
    if (httpCommandList.length > 0 && !isProcessingHttpCommand) {
        /*console.log(
            "Processing " +
                httpCommandList[0].type +
                " command:" +
                httpCommandList[0].uri
        )*/
        if (
            httpCommandList[0].type == "GET" ||
            httpCommandList[0].type == "POST"
        ) {
            isProcessingHttpCommand = true
            currentHttpCommand = new XMLHttpRequest()
            currentHttpCommand.onreadystatechange = function() {
                if (currentHttpCommand.readyState == 4) {
                    if (currentHttpCommand.status == 200) {
                        defaultHttpResultFn(currentHttpCommand.responseText)
                    } else {
                        if (currentHttpCommand.status == 401)
                            requestAuthentication()
                        defaultHttpErrorFn(
                            currentHttpCommand.status,
                            currentHttpCommand.responseText
                        )
                    }
                }
            }
            let url = httpCommandList[0].uri
            if (url.indexOf("?") != -1) url += "&PAGEID=" + getPageId()
            currentHttpCommand.open(httpCommandList[0].type, url, true)
            if (
                typeof httpCommandList[0].progressfn != "undefined" &&
                progressfn != null
            )
                currentHttpCommand.upload.addEventListener(
                    "progress",
                    httpCommandList[0].progressfn,
                    false
                )
            if (httpCommandList[0].type == "POST") {
                //console.log("Post query")
                console.log(httpCommandList[0].data)
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
        //if (httpCommandList.length == 0) console.log("Command list is empty")
    }
}

export { clearCommandList, SendGetHttp, SendPostHttp }
