/*
 realCommandsTable.js - ESP3D WebUI helpers file

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

const realCommandsTable = [
    { name: "#SOFTRESET#", value: "\x18" },
    { name: "#SAFETYDOOR#", value: "\x84" },
    { name: "#JOGCANCEL#", value: "\x85" },
    { name: "#FO100#", value: "\x90" },
    { name: "#FO+10#", value: "\x91" },
    { name: "#FO-10#", value: "\x92" },
    { name: "#FO+1#", value: "\x93" },
    { name: "#FO-1#", value: "\x94" },
    { name: "#RO100#", value: "\x95" },
    { name: "#RO50#", value: "\x96" },
    { name: "#RO25#", value: "\x97" },
    { name: "#SSO100#", value: "\x99" },
    { name: "#SSO+10#", value: "\x9A" },
    { name: "#SSO-10#", value: "\x9B" },
    { name: "#SSO+1#", value: "\x9C" },
    { name: "#SSO-1#", value: "\x9D" },
    { name: "#T-SPINDLESTOP#", value: "\x9E" },
    { name: "#T-FLOODCOOLANT#", value: "\xA0" },
    { name: "#T-FLOODCOOLANT#", value: "\xA1" },
]

export default realCommandsTable
