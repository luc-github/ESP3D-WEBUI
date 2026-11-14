/*
 listKinds.js - ESP3D WebUI settings helper file

 Copyright (c) 2026 Luc LEBOSSE. All rights reserved.

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

//Static metadata describing the editable list kinds used by preferences
//(macros, pollingcmds, verbosefilters, extrapanels, keymap, panelsorder).
//The depend blocks below are DATA consumed by the frozen dependency engine
//(checkDependencies / connectionDepend): keep them verbatim.

const VERBOSE_TYPE_OPTIONS = [
    { label: "S229", value: "startswith" },
    { label: "S230", value: "endswith" },
    { label: "S231", value: "contain" },
    { label: "S232", value: "regex" },
]

const MACRO_TYPE_OPTIONS = [
    {
        label: "S137",
        value: "FS",
        depend: [
            {
                id: "flashfs",
                value: true,
            },
            {
                connection_id: "FlashFileSystem",
                value: "!='none'",
            },
            {
                connection_id: "FWTargetID",
                value: "!='30'",
            },
        ],
    },
    {
        label: "S138",
        value: "SD",
        depend: [
            {
                ids: [
                    {
                        id: "sd",
                        value: true,
                    },
                    {
                        id: "directsd",
                        value: true,
                    },
                    {
                        id: "ext",
                        value: true,
                    },
                    {
                        id: "directsdext",
                        value: true,
                    },
                    {
                        id: "tftsd",
                        value: true,
                    },
                ],
            },
            {
                connection_id: "SDConnection",
                value: "!='none'",
            },
        ],
    },
    { label: "S139", value: "URI" },
    { label: "S140", value: "CMD" },
]

const EXTRAPANEL_TYPE_OPTIONS = [
    { label: "S160", value: "image" },
    { label: "S161", value: "content" },
    { label: "S121", value: "extension" },
    { label: "S162", value: "camera" },
]

const TARGET_OPTIONS = [
    { label: "S158", value: "page" },
    { label: "S157", value: "panel" },
]

//select options for the "type" field, per list kind
const typeOptionsFor = (kind) =>
    kind === "verbosefilters"
        ? VERBOSE_TYPE_OPTIONS
        : kind === "macros"
          ? MACRO_TYPE_OPTIONS
          : EXTRAPANEL_TYPE_OPTIONS

//per-field editor metadata shared by all list kinds;
//"type" options and "value" label are resolved per kind in fieldMeta
const FIELD_META = {
    cmds: { type: "text", label: "S115", help: "S97" },
    key: { type: "text", label: "key", shortkey: true },
    name: { type: "text", label: "S129" },
    icon: { type: "icon", label: "S132" },
    refreshtime: {
        type: "number",
        min: 0,
        minsecondary: 100,
        step: 100,
        append: "S114",
        label: "S113",
    },
    type: { type: "select", label: "S135" },
    target: { type: "select", label: "S136", options: TARGET_OPTIONS },
    openonstart: { type: "boolean", label: "S93" },
    source: { type: "text", label: "S139", min: "2" },
    action: { type: "text", label: "S159", min: "1" },
    value: { type: "text" },
}

//editor metadata for one field of a list item
const fieldMeta = (key, kind) => {
    const meta = FIELD_META[key]
    if (!meta) return { type: "text", label: key }
    const out = { ...meta }
    if (key === "type") out.options = typeOptionsFor(kind)
    if (key === "value") out.label = kind === "verbosefilters" ? "S233" : key
    return out
}

export {
    VERBOSE_TYPE_OPTIONS,
    MACRO_TYPE_OPTIONS,
    EXTRAPANEL_TYPE_OPTIONS,
    fieldMeta,
}
