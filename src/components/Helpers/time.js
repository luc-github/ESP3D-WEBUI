/*
 time.js - ESP3D WebUI helpers file

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
import { h } from 'preact'

function getBrowserTime() {
    //ISO 8601 format string
    function padNumber(num, size) {
        const s = num.toString().padStart(size, '0')
        return s
    }
    const d = new Date()
    return `${d.getFullYear()}-${padNumber(d.getMonth() + 1, 2)}-${padNumber(
        d.getDate(),
        2
    )}T${padNumber(d.getHours(), 2)}:${padNumber(
        d.getMinutes(),
        2
    )}:${padNumber(d.getSeconds(), 2)}`
}

export { getBrowserTime }
