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
        <div>
            <div class="d-flex flex-wrap">
                <div class={T == "none" ? "d-none" : "p-2"}>
                    {" "}
                    <span
                        class={
                            Tt == "0.00"
                                ? "badge badge-pill badge-info"
                                : "badge badge-pill badge-danger"
                        }
                    >
                        <Thermometer />
                        <span>1</span>
                    </span>
                    {T}
                    <span class={Tt == "0.00" ? "d-none" : ""}>/{Tt}</span>
                    &deg;C
                </div>
                <div class={T1 == "none" ? "d-none" : "p-2"}>
                    {" "}
                    <span
                        class={
                            T1t == "0.00"
                                ? "badge badge-pill badge-info"
                                : "badge badge-pill badge-danger"
                        }
                    >
                        <Thermometer />
                        <span>2</span>
                    </span>
                    {T1}
                    <span class={T1t == "0.00" ? "d-none" : ""}>/{T1t}</span>
                    &deg;C
                </div>
                <div class={B == "none" ? "d-none" : "p-2"}>
                    {" "}
                    <span
                        class={
                            Bt == "0.00"
                                ? "badge badge-pill badge-info"
                                : "badge badge-pill badge-danger"
                        }
                    >
                        <Bed />
                    </span>
                    {B}
                    <span class={Bt == "0.00" ? "d-none" : ""}>/{Bt}</span>
                    &deg;C
                </div>
            </div>
        </div>
    )
}

export { Notifications }
