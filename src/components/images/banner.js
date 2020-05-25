/*
 index.js - ESP3D WebUI images file

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

/*
 *ESP3D banner
 *
 */
const ESP3DBanner = ({ visible = true, title, text }) => {
    const onclick = e => {
        window.open(
            "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=Y8FFE7NA4LJWQ"
        )
    }
    return (
        <div class={visible ? "d-block" : "d-none"}>
            <div class="espbanner" onclick={onclick}>
                <span title={title}>{text}</span>
            </div>
        </div>
    )
}
export { ESP3DBanner }
