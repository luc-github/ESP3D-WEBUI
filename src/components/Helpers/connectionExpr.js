/*
 connectionExpr.js - ESP3D WebUI helper file

 Copyright (c) 2026 Luc LEBOSSE. All rights reserved.

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

//Parser for the connection condition expressions found in "depend" data
//(e.g. { connection_id: "SDConnection", value: "!='none'" } or
//{ connection_id: "axis", value: ">3" }). Replaces the previous eval()
//with identical semantics:
//- literal quoted ('...')  -> string comparison against the raw value
//- literal bare            -> numeric comparison (both sides coerced)
//Unknown expressions fail open (condition considered true), matching the
//existing "missing connection setting => visible" behavior.

const CONNECTION_OPS = {
    "==": (a, b) => a == b,
    "!=": (a, b) => a != b,
    ">=": (a, b) => a >= b,
    "<=": (a, b) => a <= b,
    ">": (a, b) => a > b,
    "<": (a, b) => a < b,
}

const evalConnectionValue = (actual, expr) => {
    const str = String(expr).trim()
    const quoted = str.endsWith("'")
    const m = /^(==|!=|>=|<=|>|<)\s*'?(.*?)'?$/.exec(str)
    if (!m) {
        console.log("Unsupported connection condition:", expr)
        return true
    }
    if (quoted) return CONNECTION_OPS[m[1]](String(actual), m[2])
    return CONNECTION_OPS[m[1]](Number(actual), Number(m[2]))
}

const connectionContains = (actual, searched) =>
    String(actual).indexOf(searched) != -1

export { evalConnectionValue, connectionContains }
