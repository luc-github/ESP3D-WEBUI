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
/*
 * Local variables
 *
 */

var httpCommandList = []
var isProcessingHttpCommand = false
var currentHttpCommand = {}
var currentPageId = ""

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
    if (
        httpCommandList.length > 0 &&
        typeof httpCommandList[0].resultfn != "undefined"
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
    httpCommandList.shift()
    isProcessingHttpCommand = false
    processCommands()
}

/*
 * Process Get HTTP query
 */
function ProcessGetHttp(url, resultfn, errorfn) {
    var xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                if (typeof resultfn != "undefined" && resultfn != null)
                    resultfn(xmlhttp.responseText)
            } else {
                if (xmlhttp.status == 401) requestAuthentication()
                if (typeof errorfn != "undefined" && errorfn != null) {
                    errorfn(xmlhttp.status, xmlhttp.responseText)
                } else {
                    console.log("Code error")
                }
            }
        }
    }
    if (url.indexOf("?") != -1) url += "&PAGEID=" + currentPageId
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}

/*
 * Process all commands one by one
 */
function processCommands() {
    if (httpCommandList.length > 0 && !isProcessingHttpCommand) {
        console.log("Processing command")
        if (httpCommandList[0].type == "GET") {
            isProcessingHttpCommand = true
            ProcessGetHttp(
                httpCommandList[0].cmd,
                defaultHttpResultFn,
                defaultHttpErrorFn
            )
        } else if (httpCommandList[0].type == "POST") {
            //TODO POST queries
            /* isProcessingHttpCommand = true;
            if (!(httpCommandList[0].isupload)) {
                ProcessPostHttp(httpCommandList[0].cmd, httpCommandList[0].data, defaultHttpResultFn, defaultHttpErrorFn);
            } else {
                ProcessFileHttp(httpCommandList[0].cmd, httpCommandList[0].data, httpCommandList[0].progressfn, defaultHttpResultFn, defaultHttpErrorFn);
            }*/
        } else if (httpCommandList[0].type == "CMD") {
            isProcessingHttpCommand = true
            var fn = httpCommandList[0].cmd
            fn()
            nextCommand()
        }
    } else {
        if (isProcessingHttpCommand) console.log("Busy, process ongoing")
        else console.log("Command list is empty")
    }
}

/*
 * Add get query to command list
 */
function SendGetCommand(url, result_fn, error_fn, id, max_id) {
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
        cmd: url,
        type: "GET",
        isupload: false,
        resultfn: result_fn,
        errorfn: error_fn,
        id: cmd_id,
    }
    httpCommandList.push(cmd)
    processCommands()
}

/*
 * Add local function to command list
 */
function AddCommand(cmd_fn, error_fn, id) {
    if (httpCommandList.length > maxCmdInList && maxCmdInList != -1) {
        console.log("[HTTP]Command rejected: full")
        if (typeof error_fn != "undefined") error_fn(errorListFull)
        return
    }
    var cmd_id = 0
    if (typeof id != "undefined") cmd_id = id
    var cmd = {
        cmd: cmd_fn,
        errorfn: error_fn,
        type: "CMD",
        id: cmd_id,
    }
    httpCommandList.push(cmd)
    processCommands()
}

export { clearCommandList, SendGetCommand, AddCommand }
