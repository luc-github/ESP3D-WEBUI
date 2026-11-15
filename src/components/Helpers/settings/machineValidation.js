/*
 machineValidation.js - ESP3D WebUI settings helper file

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
import { h } from "preact"
import { Flag } from "preact-feather"
import { T } from "../../Translations"

/**
 * Shared per-entry validation for the MachineSettings tabs (ESP400 / $$).
 * Keeps the exact contract of the previous per-target copies:
 * - sets fieldData.hasmodified (trimmed compare, text/number entries only)
 *   and fieldData.haserror
 * - returns the { message, valid, modified } object expected by Field
 *
 * @param {Object} fieldData - the entry being edited (mutated: flags)
 * @param {(f: Object) => boolean} [rule] - target-specific validity rule,
 *        return true when the value is acceptable; rules that only apply
 *        to text entries must start with `if (f.type != "text") return true`
 * @param {() => void} [onStatus] - optional callback after flags update
 *        (e.g. refresh the save button state)
 */
const machineSettingValidation = (fieldData, rule, onStatus) => {
    const validation = {
        message: <Flag size="1rem" />,
        valid: true,
        modified: true,
    }
    if (fieldData.type == "text" || fieldData.type == "number") {
        fieldData.hasmodified =
            String(fieldData.value).trim() != String(fieldData.initial).trim()
    }
    if (rule && !rule(fieldData)) validation.valid = false
    if (!validation.valid) validation.message = T("S42")
    fieldData.haserror = !validation.valid
    if (onStatus) onStatus()
    if (!fieldData.hasmodified && !fieldData.haserror) {
        validation.message = null
        validation.valid = true
        validation.modified = false
    }
    return validation
}

export { machineSettingValidation }
