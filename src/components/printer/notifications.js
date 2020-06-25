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
import { Bed, Fan } from "./icon"
import { Thermometer, AlertTriangle, Home } from "preact-feather"

/*
 * Local variables
 *
 */

/*
 * Printer specific notifications
 *
 */
const Notifications = () => {
    const { T, Tt, T1, T1t, B, Bt } = useStoreon(
        "T",
        "Tt",
        "T1",
        "T1t",
        "B",
        "Bt"
    )
    const { x, y, z } = useStoreon("x", "y", "z")
    const showJog = e => {
        const { dispatch } = useStoreon()
        dispatch("panel/showjog", true)
    }
    return (
        <div class="p-1">
            <div class="d-flex flex-wrap p-1">
                <div class={T == "none" ? "" : "d-none"}>
                    <button class="btn btn-info">
                        <Thermometer size="1.2em" />
                        <span class="hide-low text-button">{Trans("P29")}</span>
                    </button>
                </div>
                <div
                    class={
                        T == "none"
                            ? "d-none"
                            : "p-1 d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row hotspotNotification"
                    }
                >
                    <span
                        class={
                            Tt == "0.00"
                                ? "bg-default input-group-text text-center textNotification justify-content-center"
                                : "error input-group-text text-center textNotification justify-content-center"
                        }
                    >
                        <Thermometer size="1.0em" />
                        <span>1</span>
                    </span>
                    <span
                        class="bg-white input-group-text text-center textNotification justify-content-center"
                        style="min-width:5em"
                    >
                        {T == "error" ? <AlertTriangle size="1.0em" /> : T}
                    </span>
                    <span
                        class={
                            Tt == "0.00"
                                ? "bg-default input-group-text text-center textNotification justify-content-center"
                                : "error input-group-text text-center textNotification justify-content-center"
                        }
                    >
                        <span class={Tt == "0.00" ? "d-none" : ""}>{Tt}</span>
                        <span>&deg;C</span>
                    </span>
                </div>

                <div
                    class={
                        T1 == "none"
                            ? "d-none"
                            : "p-1 d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row hotspotNotification"
                    }
                >
                    <span
                        class={
                            T1t == "0.00"
                                ? "bg-default input-group-text text-center textNotification justify-content-center"
                                : "error input-group-text text-center textNotification justify-content-center"
                        }
                    >
                        <Thermometer size="1.0em" />
                        <span>2</span>
                    </span>
                    <span
                        class="bg-white input-group-text text-center textNotification justify-content-center"
                        style="min-width:5em"
                    >
                        {T1 == "error" ? <AlertTriangle size="1.0em" /> : T1}
                    </span>
                    <span
                        class={
                            T1t == "0.00"
                                ? "bg-default input-group-text text-center textNotification justify-content-center"
                                : "error input-group-text text-center textNotification justify-content-center"
                        }
                    >
                        <span class={T1t == "0.00" ? "d-none" : ""}>{T1t}</span>
                        <span>&deg;C</span>
                    </span>
                </div>
                <div
                    class={
                        B == "none"
                            ? "d-none"
                            : "p-1 d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row hotspotNotification"
                    }
                >
                    <span
                        class={
                            Bt == "0.00"
                                ? "bg-default input-group-text text-center textNotification justify-content-center"
                                : "error input-group-text text-center textNotification justify-content-center"
                        }
                    >
                        <Bed height="1.0em" />
                    </span>
                    <span
                        class="bg-white input-group-text text-center textNotification justify-content-center"
                        style="min-width:5em"
                    >
                        {B == "error" ? <AlertTriangle size="1.0em" /> : B}
                    </span>
                    <span
                        class={
                            Bt == "0.00"
                                ? "bg-default input-group-text text-center textNotification justify-content-center"
                                : "error input-group-text text-center textNotification justify-content-center"
                        }
                    >
                        <span class={Bt == "0.00" ? "d-none" : ""}>{Bt}</span>
                        <span>&deg;C</span>
                    </span>
                </div>
            </div>
            <div class="d-flex flex-wrap p-1">
                <div class={x == "none" ? "" : "d-none"}>
                    <button class="btn btn-default" onclick={showJog}>
                        <Home size="1.2em" />
                        <span class="hide-low text-button">
                            {Trans("S116")}
                        </span>
                    </button>
                </div>
                <div
                    class={
                        x == "none"
                            ? "d-none"
                            : "p-1 d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row hotspotNotification"
                    }
                    onclick={showJog}
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
                <div
                    class={
                        y == "none"
                            ? "d-none"
                            : "p-1 d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row hotspotNotification"
                    }
                    onclick={showJog}
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
                <div
                    class={
                        z == "none"
                            ? "d-none"
                            : "p-1 d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row hotspotNotification"
                    }
                    onclick={showJog}
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
    )
}

export { Notifications }
