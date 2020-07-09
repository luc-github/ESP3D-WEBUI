/*
 Notifications.js - ESP3D WebUI file

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
import { T as Trans } from "../translations"
import { useStoreon } from "storeon/preact"
import { Bed, Fan, FeedRate, FlowRate, Extruder } from "./icon"
import { Thermometer, AlertTriangle, Home, AlertCircle } from "preact-feather"
import { SendCommand } from "../http"
import { showDialog } from "../dialog"
import { esp3dSettings, preferences, Page } from "../app"

/*
 * Local variables
 *
 */

/*
 * Send command query error
 */
function sendCommandError(errorCode, responseText) {
    showDialog({ type: "error", numError: errorCode, message: T("S5") })
}

/*
 * Printer specific notifications
 *
 */
const Notifications = () => {
    const { TT, TB } = useStoreon("TT", "TB")
    const { x, y, z } = useStoreon("x", "y", "z")
    const { feedrate } = useStoreon("feedrate")
    const { flowrate } = useStoreon("flowrate")
    const { fanpercent } = useStoreon("fanpercent")
    if (esp3dSettings.length == 0 || esp3dSettings.FWTarget == "unknown") {
        return null
    }
    const toggleShowJog = e => {
        const { dispatch } = useStoreon()
        dispatch("setPage", Page.dashboard)
        dispatch("panel/showjog", false)
        dispatch("panel/showjog", true)
    }
    const toggleshowTemperatures = e => {
        const { dispatch } = useStoreon()
        dispatch("setPage", Page.dashboard)
        dispatch("panel/showtemperatures", false)
        dispatch("panel/showtemperatures", true)
    }
    const toggleShowFeedRate = e => {
        const { dispatch } = useStoreon()
        dispatch("setPage", Page.dashboard)
        dispatch("panel/showfeedrate", false)
        dispatch("panel/showfeedrate", true)
    }
    const toggleShowFlowRate = e => {
        const { dispatch } = useStoreon()
        dispatch("setPage", Page.dashboard)
        dispatch("panel/showflowrate", false)
        dispatch("panel/showflowrate", true)
    }
    const toggleShowFan = e => {
        const { dispatch } = useStoreon()
        dispatch("setPage", Page.dashboard)
        dispatch("panel/showfan", false)
        dispatch("panel/showfan", true)
    }
    const toggleShowExtrusion = e => {
        const { dispatch } = useStoreon()
        dispatch("setPage", Page.dashboard)
        dispatch("panel/showextrusion", false)
        dispatch("panel/showextrusion", true)
    }
    const emergencyStop = e => {
        SendCommand("M112", null, sendCommandError)
    }
    let temperatures = []
    if (preferences.settings.showtemperaturespanel == true) {
        for (let index = 0; index < TT.length; index++) {
            temperatures.push(
                <div
                    class="p-1 d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row hotspotNotification"
                    onclick={toggleshowTemperatures}
                >
                    <span
                        class={
                            TT[index].target == "0.00"
                                ? "bg-default input-group-text text-center textNotification justify-content-center"
                                : "error input-group-text text-center textNotification justify-content-center"
                        }
                    >
                        <Thermometer size="1.0em" />
                        <span>{TT.length > 1 ? index + 1 : ""}</span>
                    </span>
                    <span
                        class="bg-white input-group-text text-center textNotification justify-content-center"
                        style="min-width:5em"
                    >
                        {TT[index].value == "error" ? (
                            <AlertTriangle size="1.0em" />
                        ) : (
                            TT[index].value
                        )}
                    </span>
                    <span
                        class={
                            TT[index].target == "0.00"
                                ? "bg-default input-group-text text-center textNotification justify-content-center"
                                : "error input-group-text text-center textNotification justify-content-center"
                        }
                    >
                        <span
                            class={TT[index].target == "0.00" ? "d-none" : ""}
                        >
                            {TT[index].target}
                        </span>
                        <span>&deg;C</span>
                    </span>
                </div>
            )
        }
        for (let index = 0; index < TB.length; index++) {
            temperatures.push(
                <div
                    class="p-1 d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row hotspotNotification"
                    onclick={toggleshowTemperatures}
                >
                    <span
                        class={
                            TB[index].target == "0.00"
                                ? "bg-default input-group-text text-center textNotification justify-content-center"
                                : "error input-group-text text-center textNotification justify-content-center"
                        }
                    >
                        <Bed size="1.0em" />
                        <span>{TB.length > 1 ? index + 1 : ""}</span>
                    </span>
                    <span
                        class="bg-white input-group-text text-center textNotification justify-content-center"
                        style="min-width:5em"
                    >
                        {TB[index].value == "error" ? (
                            <AlertTriangle size="1.0em" />
                        ) : (
                            TB[index].value
                        )}
                    </span>
                    <span
                        class={
                            TB[index].target == "0.00"
                                ? "bg-default input-group-text text-center textNotification justify-content-center"
                                : "error input-group-text text-center textNotification justify-content-center"
                        }
                    >
                        <span
                            class={TB[index].target == "0.00" ? "d-none" : ""}
                        >
                            {TB[index].target}
                        </span>
                        <span>&deg;C</span>
                    </span>
                </div>
            )
        }
    }
    if (temperatures.length == 0) {
        temperatures = (
            <div class="p-1 hotspotNotification">
                <button
                    class="btn btn-default"
                    onclick={toggleshowTemperatures}
                >
                    <Thermometer size="1.2em" />
                    <span class="hide-low text-button">{Trans("P29")}</span>
                </button>
            </div>
        )
    }

    return (
        <div class="p-1">
            <div
                class={
                    preferences.settings.showtemperaturespanel
                        ? "d-flex flex-wrap p-1"
                        : "d-none"
                }
            >
                {temperatures}
            </div>
            <div class="d-flex flex-wrap p-1">
                <div class={x == "none" ? "p-1 hotspotNotification" : "d-none"}>
                    <button class="btn btn-default" onclick={toggleShowJog}>
                        <Home size="1.2em" />
                        <span class="hide-low text-button">
                            {Trans("S116")}
                        </span>
                    </button>
                </div>
                <div>
                    <div
                        class={
                            x == "none"
                                ? "d-none"
                                : "p-1 d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row hotspotNotification"
                        }
                        onclick={toggleShowJog}
                    >
                        <span class="bg-default input-group-text text-center textNotification justify-content-center">
                            X
                        </span>
                        <span
                            class="bg-white input-group-text  text-center textNotification justify-content-center"
                            style="width:5em"
                        >
                            {x == "error" ? <AlertTriangle size="1.0em" /> : x}
                        </span>
                    </div>
                </div>
                <div>
                    <div
                        class={
                            y == "none"
                                ? "d-none"
                                : "p-1 d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row hotspotNotification"
                        }
                        onclick={toggleShowJog}
                    >
                        <span class="bg-default input-group-text text-center textNotification justify-content-center">
                            Y
                        </span>
                        <span
                            class="bg-white input-group-text  text-center textNotification justify-content-center"
                            style="width:5em"
                        >
                            {y == "error" ? <AlertTriangle size="1.0em" /> : y}
                        </span>
                    </div>
                </div>
                <div>
                    <div
                        class={
                            z == "none"
                                ? "d-none"
                                : "p-1 d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row hotspotNotification"
                        }
                        onclick={toggleShowJog}
                    >
                        <span class="bg-default input-group-text text-center textNotification justify-content-center">
                            Z
                        </span>
                        <span
                            class="bg-white input-group-text  text-center textNotification justify-content-center"
                            style="width:5em"
                        >
                            {z == "error" ? <AlertTriangle size="1.0em" /> : z}
                        </span>
                    </div>
                </div>
                <div class="ml-auto align-self-center hotspotNotification">
                    <div class="p-1 bg-warning rounded">
                        <button
                            type="button"
                            class="btn btn-sm btn-danger"
                            onclick={emergencyStop}
                        >
                            <AlertCircle size="1.2em" />
                            <span class="hide-low text-button">
                                {Trans("P15")}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="d-flex flex-wrap">
                <div class="p-1">
                    <div
                        class={
                            feedrate == "none"
                                ? "p-1 hotspotNotification"
                                : "d-none"
                        }
                    >
                        <button
                            class="btn btn-default"
                            onclick={toggleShowFeedRate}
                        >
                            <FeedRate />
                            <span class="hide-low text-button">
                                {Trans("P12")}
                            </span>
                        </button>
                    </div>
                    <div
                        class={
                            feedrate == "none"
                                ? "d-none"
                                : "p-1 d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row hotspotNotification"
                        }
                        onclick={toggleShowFeedRate}
                    >
                        <span class="bg-default input-group-text text-center textNotification justify-content-center">
                            <FeedRate height="1.2em" />
                        </span>
                        <span
                            class="bg-white input-group-text  text-center textNotification justify-content-center"
                            style="width:4em"
                        >
                            {feedrate == "error" ? (
                                <AlertTriangle size="1.0em" />
                            ) : (
                                feedrate
                            )}
                        </span>
                        <span class="bg-default input-group-text text-center textNotification justify-content-center">
                            <span>%</span>
                        </span>
                    </div>
                </div>
                <div class="p-1">
                    <div
                        class={
                            flowrate == "none"
                                ? "p-1 hotspotNotification"
                                : "d-none"
                        }
                    >
                        <button
                            class="btn btn-default"
                            onclick={toggleShowFlowRate}
                        >
                            <FlowRate />
                            <span class="hide-low text-button">
                                {Trans("P30")}
                            </span>
                        </button>
                    </div>
                    <div
                        class={
                            flowrate == "none"
                                ? "d-none"
                                : "p-1 d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row hotspotNotification"
                        }
                        onclick={toggleShowFlowRate}
                    >
                        <span class="bg-default input-group-text text-center textNotification justify-content-center">
                            <FlowRate height="1.2em" />
                        </span>
                        <span
                            class="bg-white input-group-text  text-center textNotification justify-content-center"
                            style="width:4em"
                        >
                            {flowrate == "error" ? (
                                <AlertTriangle size="1.0em" />
                            ) : (
                                flowrate
                            )}
                        </span>
                        <span class="bg-default input-group-text text-center textNotification justify-content-center">
                            <span>%</span>
                        </span>
                    </div>
                </div>

                <div class="p-1">
                    <div
                        class={
                            fanpercent == "none"
                                ? "p-1 hotspotNotification"
                                : "d-none"
                        }
                    >
                        <button class="btn btn-default" onclick={toggleShowFan}>
                            <Fan />
                            <span class="hide-low text-button">
                                {Trans("P31")}
                            </span>
                        </button>
                    </div>
                    <div
                        class={
                            fanpercent == "none"
                                ? "d-none"
                                : "p-1 d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row hotspotNotification"
                        }
                        onclick={toggleShowFan}
                    >
                        <span class="bg-default input-group-text text-center textNotification justify-content-center">
                            <Fan height="1.2em" />
                        </span>
                        <span
                            class="bg-white input-group-text  text-center textNotification justify-content-center"
                            style="width:4em"
                        >
                            {fanpercent == "error" ? (
                                <AlertTriangle size="1.0em" />
                            ) : (
                                fanpercent
                            )}
                        </span>
                        <span class="bg-default input-group-text text-center textNotification justify-content-center">
                            <span>%</span>
                        </span>
                    </div>
                </div>

                <div class="p-1">
                    <div class="p-1 hotspotNotification">
                        <button
                            class="btn btn-default"
                            onclick={toggleShowExtrusion}
                        >
                            <Extruder />
                            <span class="hide-low text-button">
                                {Trans("P32")}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { Notifications }
