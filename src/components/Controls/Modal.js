/*
 Modal.js - ESP3D WebUI component file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 
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
import { createComponent } from "../Helpers"

/*
 * Local const
 *
 */
const modifiers = {
    lg: "text-lg",
    large: "text-lg",
    sm: "text-sm",
    small: "text-sm",
}
const Modal = createComponent("div", "modal", modifiers)
Modal.Overlay = createComponent("a", "modal-overlay")
Modal.Container = createComponent("div", "modal-container")
Modal.Header = createComponent("div", "modal-header")
Modal.Body = createComponent("div", "modal-body")
Modal.Footer = createComponent("div", "modal-footer")

export default Modal
