/*
 index.js - ESP3D WebUI dialog file

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
import { AlertTriangle } from "preact-feather"

/*
 * Dialog page
 *
 */
export const DialogPage = ({ currentState }) => {
    if (currentState.showDialog) {
        let classname = "modal d-block"
        let icon 
        if(currentState.error!=0){
            icon = <AlertTriangle classeName color='red'/>
        } else {
            icon = ""
        }
        if (currentState.data.type == "disconnect") classname += " greybg"
        return (
            <modal tabindex="-1" className={classname}>
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content">
                        <div class="modal-header"></div>
                        <div class="modal-body">
                            <center>{icon}{currentState.data.message}</center>
                        </div>
                        <div class="modal-footer"></div>
                    </div>
                </div>
            </modal>
        )
    }
}
