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
import { initApp } from "../uisettings"
import { Page, esp3dSettings, globaldispatch, Action } from "../app"
import { SendCommand } from "../http"
import { Esp3dVersion } from "../version"
import { RefreshCcw, Github, UploadCloud } from "preact-feather"

/*
 * Local variables
 *
 */

let browserInformation = ""
let dataStatus = {}

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
}

/*
 * Update UI
 *
 */
function onClickUpdateUI() {
    console.log("Update UI")
}

/*
 * About page
 *
 */
export const AboutPage = ({ currentState }) => {
    if (currentState.activePage != Page.about) return null
    if (browserInformation == "") {
        browserInformation = getBrowserInformation()
        loadStatus()
    }
    return (
        <div class="card-body">
            <h3 class="card-title">{T("S12")}</h3>
            <div class="card-text">
                <a
                    class="link-text"
                    href="https://www.github.com/luc-github/ESP3D"
                    title={T("S20")}
                    target="_blank"
                >
                    <hr />
                    <span class="text-info">{T("S16")}: </span>
                    {esp3dSettings.FWVersion}&nbsp;
                </a>
                <button
                    type="button"
                    title={T("S25")}
                    class="btn btn-sm btn-dark"
                    onClick={onClickUpdateFW}
                >
                    <UploadCloud />
                    <span class="hide-low">{" " + T("S25")}</span>
                </button>
            </div>
            <div style="height:2px" />
            <div class="card-text">
                <a
                    class="link-text"
                    href="https://www.github.com/luc-github/ESP3D-WEBUI"
                    title={T("S20")}
                    target="_blank"
                >
                    <span class="text-info">{T("S17")}: </span>
                    <Esp3dVersion />
                    &nbsp;
                </a>
                <button
                    type="button"
                    title={T("S25")}
                    class="btn btn-sm btn-dark"
                    onClick={onClickUpdateUI}
                >
                    <UploadCloud />
                    <span class="hide-low">{" " + T("S25")}</span>
                </button>
            </div>
            <div style="height:2px" />
            <div class="card-text" title={navigator.userAgent}>
                <span class="text-info">{T("S18")}: </span>
                {browserInformation}
            </div>
            {dataStatus.Status
                ? dataStatus.Status.map((entry, index) => {
                      if (entry.id == "FW version") return null
                      return (
                          <div class="card-text">
                              <span class="text-info">
                                  {Translate(entry.id)}:{" "}
                              </span>
                              {Translate(entry.value)}
                          </div>
                      )
                  })
                : ""}
            <hr />
            <button
                type="button"
                class="btn btn-primary"
                title={T("S23")}
                onClick={loadStatus}
            >
                <RefreshCcw />
            </button>
        </div>
    )
}

/*
 * Load Firmware Status
 */
function loadStatus() {
    const cmd = encodeURIComponent("[ESP420]")
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
        console.log("status :" + dataStatus.Status[0].id)
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
