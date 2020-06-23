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
import { T } from "../translations"
import { useStoreon } from "storeon/preact"
import { Bed, Fan } from "./icon"
import { Thermometer } from "preact-feather"

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

    return (
        <div class="p-1">
            <div class="d-flex flex-wrap">
                <div class="p-1">
                    <div class={T == "none" ? "d-none" : "input-group"}>
                        <div class="input-group-prepend">
                            <span
                                class={
                                    Tt == "0.00"
                                        ? "input-group-text"
                                        : "input-group-text error"
                                }
                            >
                                <Thermometer />
                                <span>1</span>
                            </span>
                        </div>
                        <span
                            class="input-group-text textNotification bg-white"
                            style="width:5em"
                        >
                            {T}
                        </span>
                        <div class="input-group-append">
                            <span
                                class={
                                    Tt == "0.00"
                                        ? "d-none"
                                        : "input-group-text textNotification bg-light"
                                }
                            >
                                {Tt}
                            </span>
                            <span class="input-group-text textNotification bg-light">
                                &deg;C
                            </span>
                        </div>
                    </div>
                </div>
                <div class="p-1">
                    <div class={T == "none" ? "d-none" : "input-group"}>
                        <div class="input-group-prepend">
                            <span
                                class={
                                    T1t == "0.00"
                                        ? "input-group-text"
                                        : "input-group-text error"
                                }
                            >
                                <Thermometer />
                                <span>2</span>
                            </span>
                        </div>
                        <span
                            class="input-group-text textNotification bg-white"
                            style="width:5em"
                        >
                            {T1}
                        </span>
                        <div class="input-group-append">
                            <span
                                class={
                                    T1t == "0.00"
                                        ? "d-none"
                                        : "input-group-text textNotification bg-light"
                                }
                            >
                                {T1t}
                            </span>
                            <span class="input-group-text textNotification bg-light">
                                &deg;C
                            </span>
                        </div>
                    </div>
                </div>
                <div class="p-1">
                    <div class={B == "none" ? "d-none" : "input-group"}>
                        <div class="input-group-prepend">
                            <span
                                class={
                                    Bt == "0.00"
                                        ? "input-group-text"
                                        : "input-group-text error"
                                }
                            >
                                <Bed />
                            </span>
                        </div>
                        <span
                            class="input-group-text textNotification bg-white"
                            style="width:5em"
                        >
                            {B}
                        </span>
                        <div class="input-group-append">
                            <span
                                class={
                                    Bt == "0.00"
                                        ? "d-none"
                                        : "input-group-text textNotification bg-light"
                                }
                            >
                                {Bt}
                            </span>
                            <span class="input-group-text textNotification bg-light">
                                &deg;C
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex flex-wrap p-1">
                <div class={x == "none" ? "d-none" :"p-1 d-flex flex-column"}>
                    <div class="bg-default rounded text-center textNotification p-1 show-low">X</div>
                    <div class="input-group">
                        <div class="input-group-prepend hide-low">
                            <span class="input-group-text textNotification">
                                X
                            </span>
                        </div>
                        <span
                            class="input-group-text textNotification bg-white"
                            style="width:5em"
                        >
                            {x}
                        </span>
                    </div>
                </div>
                <div class={y == "none" ? "d-none" :"p-1 d-flex flex-column"}>
                    <div class="bg-default rounded text-center textNotification p-1 show-low">Y</div>
                    <div class="input-group">
                        <div class="input-group-prepend hide-low">
                            <span class="input-group-text textNotification">
                                Y
                            </span>
                        </div>
                        <span
                            class="input-group-text textNotification bg-white"
                            style="width:5em"
                        >
                            {y}
                        </span>
                    </div>
                </div>
                <div class={z == "none" ? "d-none" :"p-1 d-flex flex-column"}>
                    <div class="bg-default rounded text-center textNotification p-1 show-low">Z</div>
                    <div class="input-group">
                        <div class="input-group-prepend hide-low">
                            <span class="input-group-text textNotification">
                                Z
                            </span>
                        </div>
                        <span
                            class="input-group-text textNotification bg-white"
                            style="width:5em"
                        >
                            {z}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { Notifications }
