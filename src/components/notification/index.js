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
import { Page } from "../app"
const { Notifications } = require(`../${process.env.TARGET_ENV}`)

function onResize() {
    const { activePage } = useStoreon("activePage")
    const { dispatch } = useStoreon()
    let currentpos = 0
    if (document.getElementById("headerbar")) {
        currentpos = document.getElementById("headerbar").clientHeight
    }
    if (document.getElementById("notifficationButton")) {
        if (document.getElementById("notifficationButton").clientHeight == 0) {
            if (activePage == Page.notifications)
                dispatch("setPage", Page.dashboard)
        }
    }
    if (document.getElementById("notif")) {
        if (
            typeof document.getElementById("notif").getClientRects()[0] !==
            "undefined"
        ) {
            currentpos =
                document.getElementById("notif").clientHeight +
                document.getElementById("notif").getClientRects()[0].top
        }
    }
    dispatch("setNotificationBottom", currentpos)
}

/*
 * Notification component
 *
 */
const Notification = () => {
    useEffect(() => {
        new ResizeObserver(onResize).observe(document.getElementById("notif"))
    })
    return (
        <div>
            <div id="notif" class="espnotification fixed-top">
                <div class="hide-low">
                    <Notifications />
                </div>
            </div>
        </div>
    )
}
/*
 * Notification component
 *
 */
const NotificationPage = () => {
    const { activePage } = useStoreon("activePage")
    if (activePage != Page.notifications) return null
    return (
        <div class="show-low">
            <Notifications />
        </div>
    )
}

export { Notification, NotificationPage }
