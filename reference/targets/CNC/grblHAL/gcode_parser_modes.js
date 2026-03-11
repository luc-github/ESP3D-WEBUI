/*
 filters.js - ESP3D WebUI helper file

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
const gcode_parser_modes = [
    {
        id: "motion_mode",
        values: [
            "G0",
            "G1",
            "G2",
            "G3",
            "G5",
            "G5.1",
            "G33",
            "G38.2",
            "G38.3",
            "G38.4",
            "G38.5",
            "G80",
            "G81",
            "G82",
            "G83",
            "G85",
            "G86",
            "G89",
        ],
        label: "CN45",
    },
    {
        id: "coordinate_system_select",
        values: [
            "G54",
            "G55",
            "G56",
            "G57",
            "G58",
            "G59",
            "G59.1",
            "G59.2",
            "G59.3",
        ],
        label: "CN46",
    },
    { id: "global_offset", values: ["G92"], label: "CN107" },
    { id: "diameter_mode", values: ["G7", "G8"], label: "CN108" },
    { id: "plane_select", values: ["G17", "G18", "G19"], label: "CN47" },
    { id: "distance_mode", values: ["G90", "G91"], label: "CN48" },
    { id: "arc_distance_mode", values: ["G91.1"], label: "CN49" },
    { id: "feed_rate_mode", values: ["G93", "G94", "G95"], label: "CN50" },
    { id: "units", values: ["G20", "G21"], label: "CN51" },
    { id: "cutter_compensation_mode", values: ["G40"], label: "CN52" },
    {
        id: "tool_length_offset_mode",
        values: ["G43", "G43.1", "G43.2", "G49"],
        label: "CN53",
    },
    {
        id: "retract_mode",
        values: ["G98", "G99"],
        label: "CN105",
    },
    { id: "scaling", values: ["G50", "G51"], label: "CN106" },
    {
        id: "control_mode",
        values: ["M0", "M1", "M2", "M30", "M60"],
        label: "CN54",
    },
    { id: "spindle_mode", values: ["M3", "M4", "M5", "M6"], label: "CN55", multiple: true },
    { id: "tool_change", values: ["M6"], label: "CN109" },
    { id: "coolant_mode", values: ["M7", "M8", "M9"], label: "CN56", multiple: true },
    { id: "ovc_feed_rate_disable", values: ["M50"], label: "CN110" },
    { id: "ovc_rpm_disable", values: ["M51"], label: "CN111" },
    { id: "ovc_hold_disable", values: ["M53"], label: "CN112" },
    { id: "ovc_parking_disable", values: ["M56"], label: "CN113" },
    { id: "T", pre: "T", label: "CN58" },
    { id: "S", pre: "S", label: "CN59" },
    { id: "F", pre: "F", label: "CN60" },
]

export { gcode_parser_modes }
