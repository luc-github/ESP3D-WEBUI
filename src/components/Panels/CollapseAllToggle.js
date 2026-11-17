/*
 CollapseAllToggle.js - ESP3D WebUI component file

 Copyright (c) 2026 Luc Lebosse. All rights reserved.

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public
 License as published by the Free Software Foundation; either
 version 3 of the License, or (at your option) any later version.

 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.

 You should have received a copy of the GNU General Public
 License along with This code; if not, see <https://www.gnu.org/licenses/>.
*/

/*
 * Collapse all / expand all toggle button
 *
 * Targets every panel (.panel[id]) found under `containerSelector`.
 * Only displayed when panels can actually collapse, i.e. in mobile view
 * or on narrow screens (see .collapse-all-toggle in _app.scss).
 */
import { h } from "preact"
import { useState, useEffect } from "preact/hooks"
import { ChevronsUp, ChevronsDown } from "preact-feather"
import { T } from "../Translations"
import { eventBus } from "../../hooks/eventBus"
import {
    setPanelsCollapsed,
    getCollapsedIds,
    CHANGE_EVENT,
} from "./collapseHelper"

const CollapseAllToggle = ({ containerSelector }) => {
    const [allCollapsed, setAllCollapsed] = useState(false)

    const getPanelIds = () => {
        const ids = []
        document
            .querySelectorAll(`${containerSelector} .panel[id]`)
            .forEach((element) => ids.push(element.id))
        return ids
    }

    const refresh = () => {
        const ids = getPanelIds()
        if (ids.length == 0) {
            setAllCollapsed(false)
            return
        }
        const collapsedIds = getCollapsedIds()
        setAllCollapsed(
            ids.every((id) => collapsedIds.indexOf(id) !== -1)
        )
    }

    useEffect(() => {
        const listenerId = eventBus.on(CHANGE_EVENT, refresh)
        refresh()
        return () => eventBus.off(CHANGE_EVENT, listenerId)
    }, [])

    return (
        <span
            class="btn tooltip tooltip-right m-1 collapse-all-toggle"
            tabindex="0"
            data-tooltip={allCollapsed ? T("S262") : T("S261")}
            aria-label={allCollapsed ? T("S262") : T("S261")}
            onclick={() => {
                setPanelsCollapsed(getPanelIds(), !allCollapsed)
            }}
        >
            {allCollapsed ? <ChevronsDown /> : <ChevronsUp />}
        </span>
    )
}

export default CollapseAllToggle
export { CollapseAllToggle }
