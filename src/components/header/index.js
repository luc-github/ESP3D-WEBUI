/*
 index.js - ESP3D WebUI header file

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
import { ESP3DLogo } from "../images"
import { Server, Settings } from "preact-feather"
/*
 * Dialog page
 *
 */
export const Header = () => {
    return (
        <nav class="navbar navbar-light navbar-expand fixed-top justify-content-left espheader">
            <div class="nav-item active" title="About">
                <ESP3DLogo />
            </div>
            <div class="nav-item" title="Dashboard">
                <Server />
                <span class="disable-select hide-low">Dashboard</span>
            </div>
            <div class="nav-item" title="Settings">
                <Settings />
                <span class="disable-select hide-low">Settings</span>
            </div>
            <a
                href="https://www.paypal.com/donate/?token=i9zEP0Z2LvWbjDpuoToVilO9aYpjpfQUNFZXjgCdudQOj7WOO2D8BPJRMqgCWYwmRqJDaW&country.x=GB&locale.x=GB"
                target="_blank"
            >
                <div class="ribbon ribbon-top-right">
                    <span>Support us</span>
                </div>
            </a>
        </nav>
    )
}
