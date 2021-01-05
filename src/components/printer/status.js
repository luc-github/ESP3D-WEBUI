/*
 status.js - ESP3D WebUI status control file

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

import { h, Fragment } from "preact"
import { T } from "../translations"
import { useStoreon } from "storeon/preact"
import { useEffect } from "preact/hooks"
import { esp3dSettings } from "../app"
import { SendCommand } from "../http"

/*
 * Local variables
 *
 */
let printFileName = ""
let lastStatus = ""
let lastStatusReset = 0

/*
 * Send command query error
 */
function sendCommandError(errorCode, responseText) {
    showDialog({ type: "error", numError: errorCode, message: T("S5") })
}

/*
 * process printer Status output
 */
function processStatus(buffer) {
    const { dispatch } = useStoreon()
    let resetTimeout = false
    if (typeof buffer == "object") {
        //TODO add support for M408
    } else {
        //"SD printing byte "
        if (buffer.startsWith("SD printing byte ")) {
            lastStatusReset = 0
            let buf = buffer
            buf = buf.replace("SD printing byte ", "")
            let status = buf.split("/")
            if (parseInt(status[1]) == 0) {
                dispatch("status/print", T("P64"))
            } else {
                let percent = (
                    (100 * parseInt(status[0])) /
                    parseInt(status[1])
                ).toFixed(2)
                let output = T("P63")
                if (printFileName.length > 0) output = printFileName
                lastStatus = ": " + percent + "%"
                output += lastStatus
                dispatch("status/print", output)
            }
            //busy:XXXX
        } else if (buffer.indexOf("busy:") != -1) {
            let status = buffer.split("busy:")
            resetTimeout = true
            dispatch(
                "status/msg",
                <span class="text-info">{T(status[1])}</span>
            )
            //Not SD printing
        } else if (buffer == "Not SD printing") {
            lastStatus = ""
            dispatch("status/print", T("P64"))
            lastStatusReset = 0
            //fatal
        } else if (buffer.startsWith("fatal:")) {
            let status = buffer.split("fatal:")
            resetTimeout = true
            dispatch(
                "status/msg",
                <span class="text-danger">{T(status[1])}</span>
            )
            //Current file:
        } else if (buffer.startsWith("Current file: ")) {
            let status = buffer.split("Current file: ")
            printFileName = status[1]
            if (printFileName == "(no file)") printFileName = ""
            if (printFileName == "") {
                lastStatus = ""
                dispatch("status/print", T("P64"))
            } else dispatch("status/print", printFileName + lastStatus)
            lastStatusReset = 0
        } else {
            resetTimeout = false
        }
    }
    //clear status after 20s if no update
    let now = new Date().getTime()
    if (resetTimeout) {
        lastStatusReset = now
    }
    if (now - lastStatusReset > 20000) {
        dispatch("status/msg", "")
    }
}

/*
 * Status control
 *
 */
const StatusControl = () => {
    const { printstatus, msgstatus } = useStoreon("printstatus", "msgstatus")
    return (
        <Fragment>
            <div class="p-1 label align-self-center">{printstatus}</div>
            <div class="p-1 label align-self-center">{msgstatus}</div>
        </Fragment>
    )
}

export { StatusControl, processStatus }
