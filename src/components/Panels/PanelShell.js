/*
PanelShell.js - ESP3D WebUI component file

 Copyright (c) 2021 Luc LEBOSSE. All rights reserved.

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

import { h } from "preact"
import { FullScreenButton, CloseButton, ContainerHelper } from "../Controls"

/*
 * Shared dashboard panel wrapper:
 * header (icon, title, optional menu, fullscreen, close) + body
 */
const PanelShell = ({
    id,
    icon,
    title,
    headerRight,
    beforeBody,
    bodyClass,
    bodyProps,
    children,
}) => (
    <div class="panel panel-dashboard" id={id}>
        <ContainerHelper id={id} />
        <div class="navbar">
            <span class="navbar-section feather-icon-container">
                {icon}
                <strong class="text-ellipsis">{title}</strong>
            </span>
            <span class="navbar-section">
                <span class="full-height">
                    {headerRight}
                    <FullScreenButton elementId={id} />
                    <CloseButton elementId={id} hideOnFullScreen={true} />
                </span>
            </span>
        </div>
        {beforeBody}
        <div
            class={
                "panel-body panel-body-dashboard" +
                (bodyClass ? " " + bodyClass : "")
            }
            {...bodyProps}
        >
            {children}
        </div>
    </div>
)

export { PanelShell }
