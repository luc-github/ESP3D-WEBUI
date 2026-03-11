/*
 Button.js - ESP3D WebUI component file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.

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
import { createComponent } from "../Helpers"

/*
 * Local const
 *
 */

const modifiers = {
    donotdisable: "do-not-disable",
    group: "input-group-btn",
    link: "btn-link",
    primary: "btn-primary",
    error: "btn-error",
    success: "btn-success",
    lg: "btn-lg",
    sm: "btn-sm",
    xs: "btn-xs",
    block: "btn-block",
    action: "btn-action",
    circle: "s-circle",
    active: "active",
    disable: "disable",
    loading: "loading",
    tooltip: "tooltip",
    btooltip: "tooltip-bottom",
    ltooltip: "tooltip tooltip-left",
    rtooltip: "tooltip tooltip-right",
    mx2: "mx-2",
    m05: "m-05",
    m2: "m-2",
    m1: "m-1",
    mt1: "mt-1",
    min2rem: "min2rem",
    min1rem: "min1rem",
}
const Button = createComponent("button", "btn", modifiers)

export default Button
