/*
 PanelHeader.js - ESP3D WebUI component file

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
import { useContext } from "preact/hooks"
import { Anchor, ChevronDown, RefreshCcw } from "preact-feather"
import { useUiContextFn } from "../../contexts"
import { PanelDragContext } from "../../hooks/panelDragContext"
import { T } from "../Translations"
import FullScreenButton from "./FullScreenButton"
import CloseButton from "./CloseButton"
import ButtonImg from "./ButtonImg"

/*
 * Universal panel header — flex navbar with:
 *   left : icon + title
 *   right: [drag?] [menu?] [refresh?] [fullscreen?] [close?]
 *
 * Props:
 *   id          — panel element id (required)
 *   icon        — feather icon element
 *   title       — string / element
 *   items       — menu item array  → shows dropdown
 *   onRefresh   — fn               → shows refresh button
 *   hasFullScreen (default true)
 *   hasClose    (default true)
 */
const PanelHeader = ({
    id,
    icon,
    title,
    items,
    onRefresh,
    hasFullScreen = true,
    hasClose = true,
    closeElementId,
}) => {
    const dragCtx = useContext(PanelDragContext)

    return (
        <div class="navbar">
            <span class="navbar-section feather-icon-container">
                {icon}
                <span class="panel-title text-ellipsis">{title}</span>
            </span>
            <span class="navbar-section panel-header-actions">
                {/* Drag handle — only rendered inside dashboard */}
                {dragCtx && (
                    <span
                        class="panel-drag-handle tooltip tooltip-left"
                        data-tooltip={T("S256")}
                        draggable
                        onDragStart={dragCtx.onDragStart}
                        onDragEnd={() => document.body.classList.remove("panel-dragging")}
                        aria-label={T("S256")}
                    >
                        <Anchor size="0.8rem" />
                    </span>
                )}

                {/* Dropdown menu */}
                {items && (
                    <div
                        class="dropdown dropdown-right"
                        onClick={() => useUiContextFn.haptic()}
                    >
                        <span
                            class="dropdown-toggle btn btn-xs btn-header m-1"
                            tabindex="0"
                        >
                            <ChevronDown size="0.8rem" />
                        </span>
                        <ul class="menu">
                            {items.map((item, i) => {
                                if (item.divider)
                                    return <li class="divider" key={i} />
                                return (
                                    <li class="menu-item" key={i}>
                                        <div
                                            class="menu-entry"
                                            onclick={item.onClick}
                                        >
                                            <div class="menu-panel-item">
                                                <span class="text-menu-item">
                                                    {item.label}
                                                </span>
                                                {item.displayToggle
                                                    ? item.displayToggle()
                                                    : item.icon}
                                            </div>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )}

                {/* Refresh button — extra content panels */}
                {onRefresh && (
                    <ButtonImg
                        xs
                        m1
                        className="btn-header"
                        nomin="yes"
                        icon={<RefreshCcw size="0.8rem" />}
                        onclick={onRefresh}
                    />
                )}

                {/* Fullscreen */}
                {hasFullScreen && <FullScreenButton elementId={id} />}

                {/* Close */}
                {hasClose && (
                    <CloseButton elementId={closeElementId || id} hideOnFullScreen={true} />
                )}
            </span>
        </div>
    )
}

export default PanelHeader
