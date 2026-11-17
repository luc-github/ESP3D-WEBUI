/*
 stream.js - ESP3D WebUI Target file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

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
import { matchVerboseLine } from "../../../components/Helpers/verboseFilters"
import { isTemperatures, isPositions } from "./filters"

const isVerboseOnly = (type, data, filters) => {
    const line = data.trim()
    if (line.length === 0) return true
    if (filters && Array.isArray(filters) && filters.length > 0) {
        return matchVerboseLine(line, filters)
    }
    return (
        isTemperatures(line) ||
        isPositions(line) ||
        line.startsWith("echo:") ||
        line.startsWith("ok") ||
        line.startsWith("M105") ||
        line.startsWith("M114") ||
        line.startsWith("FR:") ||
        line.startsWith("SENSOR:") ||
        (line.startsWith("{") && line.endsWith("}"))
    )
}

export { isVerboseOnly }
