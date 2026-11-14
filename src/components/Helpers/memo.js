/*
 memo.js - ESP3D WebUI Helper file

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
import { Component, h } from "preact"

/*
 * Minimal drop-in replacement for preact/compat `memo`:
 * wraps a function component and skips re-render when props are
 * shallowly equal. Avoids bundling the whole preact/compat module.
 */
const shallowEqual = (a, b) => {
    if (a === b) return true
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    return keysA.every((key) => a[key] === b[key])
}

const memo = (Comp) => {
    class Memoized extends Component {
        shouldComponentUpdate(nextProps) {
            return !shallowEqual(this.props, nextProps)
        }
        render(props) {
            return h(Comp, props)
        }
    }
    Memoized.displayName = Comp.displayName || Comp.name
    return Memoized
}

export { memo }
