/*
 index.js - ESP3D WebUI settings file

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
import { RefreshCcw, ExternalLink, Save, Download } from "preact-feather"
import { Setting } from "../app"
import { preferences } from "../uisettings"
import { setSettingPage } from "./index"

/*
 * Local variables
 *
 */

function loadSettings() {}

function importSettings() {}

function exportSettings() {}

function saveAndApply() {}
/*
 * Settings page
 *
 */
export const WebUISettings = ({ currentPage }) => {
    if (currentPage != Setting.ui) return null
    const listSettings = []
    return (
        <div>
            <hr />
            <center>
                <div class="list-left">{listSettings}</div>
            </center>

            <hr />
            <center>
                <button
                    type="button"
                    class="btn btn-primary"
                    title={T("S23")}
                    onClick={loadSettings}
                >
                    <RefreshCcw />
                    <span class="hide-low">{" " + T("S50")}</span>
                </button>
                <span class={preferences.settings ? "" : " d-none"}>
                    {" "}
                    <button
                        type="button"
                        class="btn btn-primary"
                        title={T("S55")}
                        onClick={importSettings}
                    >
                        <Download />
                        <span class="hide-low">{" " + T("S54")}</span>
                    </button>
                </span>
                <span class={preferences.settings ? "" : " d-none"}>
                    {" "}
                    <button
                        type="button"
                        class="btn btn-primary"
                        title={T("S53")}
                        onClick={exportSettings}
                    >
                        <ExternalLink />
                        <span class="hide-low">{" " + T("S52")}</span>
                    </button>
                </span>{" "}
                <button
                    type="button"
                    class="btn btn-danger"
                    title={T("S62")}
                    onClick={saveAndApply}
                >
                    <Save />
                    <span class="hide-low">{" " + T("S61")}</span>
                </button>
                <input type="file" class="d-none" id="importControl" />
                <br />
                <br />
            </center>
        </div>
    )
}
