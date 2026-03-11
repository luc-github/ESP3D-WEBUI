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
    { name: "#SOFTRESET#", value: "\x18", notprintable: true },
    { name: "#STATUSREPORT#", value: "?", notprintable: false },
    { name: "#CYCLESTART#", value: "~", notprintable: false },
    { name: "#FEEDHOLD#", value: "!", notprintable: false },
    { name: "#SAFETYDOOR#", value: "\x84", notprintable: true },
    { name: "#JOGCANCEL#", value: "\x85", notprintable: true },
    { name: "#FO100#", value: "\x90", notprintable: true },
    { name: "#FO+10#", value: "\x91", notprintable: true },
    { name: "#FO-10#", value: "\x92", notprintable: true },
    { name: "#FO+1#", value: "\x93", notprintable: true },
    { name: "#FO-1#", value: "\x94", notprintable: true },
    { name: "#RO100#", value: "\x95", notprintable: true },
    { name: "#RO50#", value: "\x96", notprintable: true },
    { name: "#RO25#", value: "\x97", notprintable: true },
    { name: "#SSO100#", value: "\x99", notprintable: true },
    { name: "#SSO+10#", value: "\x9A", notprintable: true },
    { name: "#SSO-10#", value: "\x9B", notprintable: true },
    { name: "#SSO+1#", value: "\x9C", notprintable: true },
    { name: "#SSO-1#", value: "\x9D", notprintable: true },
    { name: "#T-SPINDLESTOP#", value: "\x9E", notprintable: true },
    { name: "#T-FLOODCOOLANT#", value: "\xA0", notprintable: true },
    { name: "#T-MISTCOOLANT#", value: "\xA1", notprintable: true },
]

export default realCommandsTable
