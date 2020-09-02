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
import { StatusControl } from "./status"
import {
    Thermometer,
    AlertTriangle,
    Home,
    AlertCircle,
    Box,
    Underline,
    Trello,
} from "preact-feather"
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
    const { TT, TB, TC, TR, TP } = useStoreon("TT", "TB", "TR", "TP", "TC")
    const { x, y, z } = useStoreon("x", "y", "z")
    const { feedrate } = useStoreon("feedrate")
    const { flowrate } = useStoreon("flowrate")
    const { fanpercent } = useStoreon("fanpercent")
    const { SData } = useStoreon("SData")
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
    const toggleshowSensors = e => {
        const { dispatch } = useStoreon()
        dispatch("setPage", Page.dashboard)
        dispatch("panel/showsensors", false)
        dispatch("panel/showsensors", true)
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
    function pushUI(temperatures, list, index, icon, title, action, unit) {
        if (typeof unit == "undefined") unit = <span>&deg;C</span>
        temperatures.push(
            <div
                class="p-1 d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row hotspotNotification"
                onclick={action}
                title={title}
            >
                <span
                    class={
                        list[index].target == "0.00"
                            ? "bg-default input-group-text text-center textNotification justify-content-center"
                            : "error input-group-text text-center textNotification justify-content-center"
                    }
                >
                    {icon}
                    <span>{list.length > 1 ? index + 1 : ""}</span>
                </span>
                <span
                    class="bg-white input-group-text text-center textNotification justify-content-center"
                    style="min-width:5em"
                >
                    {list[index].value == "error" ? (
                        <AlertTriangle size="1.0em" />
                    ) : (
                        list[index].value
                    )}
                </span>
                <span
                    class={
                        list[index].target == "0.00"
                            ? "bg-default input-group-text text-center textNotification justify-content-center"
                            : "error input-group-text text-center textNotification justify-content-center"
                    }
                >
                    <span class={list[index].target == "0.00" ? "d-none" : ""}>
                        {list[index].target}
                    </span>
                    <span>{unit}</span>
                </span>
            </div>
        )
    }
    let temperatures = []
    if (preferences.settings.showtemperaturespanel == true) {
        for (let index = 0; index < TT.length; index++) {
            pushUI(
                temperatures,
                TT,
                index,
                <Thermometer size="1.0em" />,
                Trans("P41") + (TT.length > 1 ? index + 1 : ""),
                toggleshowTemperatures
            )

            if (TR.length > index) {
                pushUI(
                    temperatures,
                    TR,
                    index,
                    <div>
                        <Thermometer size="1.0em" />
                        <sub>R</sub>
                        <span>{TT.length > 1 ? index + 1 : ""}</span>
                    </div>,
                    Trans("P44") + (TT.length > 1 ? index + 1 : ""),
                    toggleshowTemperatures
                )
            }
        }
        for (let index = 0; index < TB.length; index++) {
            pushUI(
                temperatures,
                TB,
                index,
                <Bed height="1em" />,
                Trans("P37") + (TB.length > 1 ? index + 1 : ""),
                toggleshowTemperatures
            )
        }
        for (let index = 0; index < TP.length; index++) {
            pushUI(
                temperatures,
                TP,
                index,
                <Underline size="1.0em" />,
                Trans("P42") + (TP.length > 1 ? index + 1 : ""),
                toggleshowTemperatures
            )
        }
        for (let index = 0; index < TC.length; index++) {
            pushUI(
                temperatures,
                TC,
                index,
                <Box size="1.0em" />,
                Trans("P43") + (TC.length > 1 ? index + 1 : ""),
                toggleshowTemperatures
            )
        }
    }
    if (temperatures.length == 0) {
        temperatures.push(
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
    if (preferences.settings.showsensorspanel == true) {
        for (let index = 0; index < SData.length; index++) {
            SData[index].target = "0.00"
            let unit = SData[index].unit
            if (unit == "C" || unit == "F") {
                unit = <span>&deg;{unit}</span>
            }
            pushUI(
                temperatures,
                SData,
                index,
                <Trello height="1em" />,
                Trans("P61"),
                toggleshowSensors,
                unit
            )
        }
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
            <div
                class={
                    preferences.settings.showjogpanel
                        ? "d-flex flex-wrap p-1"
                        : "d-none"
                }
            >
                <div
                    class={
                        x == "none"
                            ? preferences.settings.showjogpanel
                                ? "p-1 hotspotNotification"
                                : "d-none"
                            : "d-none"
                    }
                >
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
                <div class={preferences.settings.showjogpanel ? "" : "d-none"}>
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
            </div>
            <div class="d-flex flex-wrap">
                <div
                    class={
                        preferences.settings.showspeedpanel ? "p-1" : "d-none"
                    }
                >
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
                <div
                    class={
                        preferences.settings.showflowratepanel
                            ? "p-1"
                            : "d-none"
                    }
                >
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

                <div
                    class={
                        preferences.settings.showfanspanel ? "p-1" : "d-none"
                    }
                >
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

                <div
                    class={
                        preferences.settings.showextruderspanel
                            ? "p-1"
                            : "d-none"
                    }
                >
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

            <div class="d-flex flex-wrap p-1">
                <div class="p-1 hotspotNotification">
                    <div class="align-self-center">
                        <div class="p-1 bg-warning rounded">
                            <button
                                type="button"
                                class="btn btn-sm btn-danger"
                                onclick={emergencyStop}
                            >
                                <AlertCircle />
                                <span class="hide-low text-button">
                                    {Trans("P15")}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
                <StatusControl />
            </div>
        </div>
    )
}

export { Notifications }
