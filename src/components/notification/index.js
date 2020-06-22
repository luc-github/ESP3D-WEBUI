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
import { useEffect } from "preact/hooks"
import { useStoreon } from "storeon/preact"
const { Notifications } = require(`../${process.env.TARGET_ENV}`)

function onResize() {
    if (document.getElementById("notif")) {
        const { dispatch } = useStoreon()
        let currentpos =
            document.getElementById("notif").clientHeight +
            document.getElementById("notif").getClientRects()[0].top
        dispatch("setNotificationBottom", currentpos)
    }
}

/*
 * Notification component
 *
 */
export const Notification = () => {
    useEffect(() => {
        new ResizeObserver(onResize).observe(document.getElementById("notif"))
    })
    return (
        <div id="notif" class="espnotification fixed-top">
            <Notifications />
        </div>
    )
}
