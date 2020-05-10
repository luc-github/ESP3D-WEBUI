/*
 index.js - ESP3D WebUI notification file

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
import { useEffect, useRef } from "preact/hooks"
import { globaldispatch, Action, setNotificationBottom } from "../app"
import { Server, Settings } from "preact-feather"
import { T } from "../translations"
import { useStoreon } from "storeon/preact"

/*
 * Notification component
 *
 */
export const Notification = () => {
    const notificationRef = useRef(null)
    const { temperatures } = useStoreon("temperatures")
    const { x, y, z } = useStoreon("x", "y", "z")

    let T
    if (typeof temperatures[2] != "undefined") {
        T = temperatures[2].value
    }
    useEffect(() => {
        setNotificationBottom(
            notificationRef.current.clientHeight +
                notificationRef.current.getClientRects()[0].top
        )
    })
    return (
        <div ref={notificationRef} id="notif" class="espnotification fixed-top">
            {T}
        </div>
    )
}