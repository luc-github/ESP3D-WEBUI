/*
TabNar.js - ESP3D WebUI Tabs bar file

 Copyright (c) 2021 Luc Lebosse. All rights reserved.
 Original code inspiration : 2021 Alexandre Aussourd

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
import { Link } from "../Router"
import { T } from "../Translations"
import { AppLogo, WebUILogo, Target } from "../../targets"
import {
    useSettingsContext,
    useUiContext,
    useUiContextFn,
} from "../../contexts"
import { Tool } from "preact-feather"

/*
 * Local const
 *
 */
const defaultLinks = [
    {
        label: "S36",
        icon: <AppLogo height="24px" />,
        href: "/settings/features",
    },
    {
        label: "S17",
        icon: <WebUILogo height="24px" />,
        href: "/settings/interface",
    },
    { label: Target, icon: <Tool />, href: "/settings/machine" },
]
const TabBar = () => {
    const { connectionSettings } = useSettingsContext()
    const { uisettings } = useUiContext()

    return (
        <ul class="tab tab-block">
            {defaultLinks &&
                defaultLinks.map(({ label, icon, href }) => {
                    if (
                        href == "/settings/machine" &&
                        !uisettings.getValue("showmachinesettings")
                    )
                        return
                    return (
                        <li class="tab-item">
                            <Link
                                className={
                                    connectionSettings.current.FWTarget == 0 &&
                                    href == "/settings/machine"
                                        ? "d-none"
                                        : "btn btn-link no-box feather-icon-container"
                                }
                                activeClassName="active"
                                href={href}
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                }}
                            >
                                {icon}
                                <label class="hide-low">{T(label)}</label>
                            </Link>
                        </li>
                    )
                })}
        </ul>
    )
}

export { TabBar }
