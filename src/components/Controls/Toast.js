/*
Toast.js - ESP3D WebUI component file

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

const modifiers = {
    primary: "toast-primary",
    success: "toast-success",
    warning: "toast-warning",
    error: "toast-error",
}

const Toast = createComponent("div", "toast", modifiers)
Toast.Close = createComponent("button", "btn btn-clear float-right")

export default Toast
