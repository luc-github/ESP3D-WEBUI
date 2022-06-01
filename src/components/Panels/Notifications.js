/*
 Notifications.js - ESP3D WebUI component file

 Copyright (c) 2021 Luc LEBOSSE. All rights reserved.

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
import { useEffect, useRef, useState } from "preact/hooks"
import { T } from "../Translations"
import {
    MessageSquare,
    AlertCircle,
    CheckCircle,
    Circle,
    PauseCircle,
} from "preact-feather"
import { useUiContext, useUiContextFn } from "../../contexts"
import { Menu as PanelMenu } from "./"

/*
 * Local const
 *
 */
const NotificationsPanel = () => {
    const { panels, uisettings, notifications } = useUiContext()
    if (notifications.isAutoScroll.current == undefined)
        notifications.isAutoScroll.current =
            uisettings.getValue("notifautoscroll")
    const [isAutoScroll, setIsAutoScroll] = useState(
        notifications.isAutoScroll.current
    )
    const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false)
    let lastPos = 0
    const messagesEndRef = useRef(null)
    const notificationsOutput = useRef(null)
    const id = "notificationsPanel"

    const scrollToBottom = () => {
        if (
            notifications.isAutoScroll.current &&
            !notifications.isAutoScrollPaused.current
        ) {
            notificationsOutput.current.scrollTop =
                notificationsOutput.current.scrollHeight
        }
    }

    const hidePanel = () => {
        useUiContextFn.haptic()
        panels.hide(id)
    }
    const clearNotificationList = () => {
        useUiContextFn.haptic()
        notifications.clear()
    }
    const toggleAutoScroll = (e) => {
        useUiContextFn.haptic()
        if (!isAutoScrollPaused) {
            notifications.isAutoScroll.current = !isAutoScroll
            setIsAutoScroll(!isAutoScroll)
        }
        notifications.isAutoScrollPaused.current = false
        setIsAutoScrollPaused(false)
        scrollToBottom()
    }

    const menu = [
        {
            label: T("S77"),
            displayToggle: () => (
                <span class="feather-icon-container">
                    {isAutoScroll ? (
                        isAutoScrollPaused ? (
                            <PauseCircle size="0.8rem" />
                        ) : (
                            <CheckCircle size="0.8rem" />
                        )
                    ) : (
                        <Circle size="0.8rem" />
                    )}
                </span>
            ),
            onClick: toggleAutoScroll,
        },
        { divider: true },
        {
            label: T("S79"),
            onClick: clearNotificationList,
            icon: <span class="btn btn-clear" aria-label="Close" />,
        },
    ]

    useEffect(() => {
        scrollToBottom()
    }, [notifications.list])

    console.log("Notifications panel")

    return (
        <div class="panel panel-dashboard">
            <div class="navbar">
                <span class="navbar-section feather-icon-container">
                    <MessageSquare />
                    <strong class="text-ellipsis">{T("notification")}</strong>
                </span>
                <span class="navbar-section">
                    <span style="height: 100%;">
                        <PanelMenu items={menu} />
                        <span
                            class="btn btn-clear btn-close m-1"
                            aria-label="Close"
                            onclick={hidePanel}
                        />
                    </span>
                </span>
            </div>
            <div class="m-1" />
            <div
                ref={notificationsOutput}
                class="panel-body panel-body-dashboard terminal m-1"
                onScroll={(e) => {
                    if (
                        lastPos > e.target.scrollTop &&
                        notifications.isAutoScroll.current
                    ) {
                        notifications.isAutoScrollPaused.current = true
                        setIsAutoScrollPaused(true)
                    }
                    if (
                        notifications.isAutoScrollPaused.current &&
                        Math.abs(
                            e.target.scrollTop +
                                e.target.offsetHeight -
                                e.target.scrollHeight
                        ) < 5
                    ) {
                        notifications.isAutoScrollPaused.current = false
                        setIsAutoScrollPaused(false)
                    }
                    lastPos = e.target.scrollTop
                }}
            >
                {notifications.list &&
                    notifications.list.map((line) => {
                        let icon = ""
                        let classText = "text-primary"
                        switch (line.type) {
                            case "error":
                                icon = <AlertCircle size="1rem" />
                                classText = "text-error"
                                break
                            case "notification":
                                icon = <MessageSquare size="1rem" />
                                break
                            case "success":
                                icon = <CheckCircle size="1rem" />
                                break
                            default:
                                break
                        }

                        return (
                            <div
                                class={`${classText} feather-icon-container notification-line`}
                            >
                                {icon}
                                <label class="m-1">{line.time}</label>
                                <label>{line.content}</label>
                            </div>
                        )
                    })}
                <div ref={messagesEndRef} />
            </div>
        </div>
    )
}

const NotificationsPanelElement = {
    id: "notificationsPanel",
    content: <NotificationsPanel />,
    name: "notification",
    icon: "MessageSquare",
    show: "shownotificationspanel",
    onstart: "opennotificationsonstart",
}

export { NotificationsPanel, NotificationsPanelElement }
