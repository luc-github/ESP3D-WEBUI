/*
ScanExtensions.js - ESP3D WebUI component file

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

import { Fragment, h } from "preact"
import { useState, useEffect } from "preact/hooks"
import { useUiContext } from "../../contexts"
import { T } from "../Translations"

const ScanExtensionsList = ({ id, refreshfn }) => {
    const { modals } = useUiContext()
    const [extensionsList, setExtensionsList] = useState([])

    const scanExtensions = () => {
        // TODO: API liste fichiers + manifest (étape 4–5)
        setExtensionsList([])
    }

    useEffect(() => {
        scanExtensions()
        if (refreshfn) refreshfn(scanExtensions)
    }, [])

    return (
        <Fragment>
            <div class="form-group" data-extra="extensions">
                <table class="table">
                    <thead class="hide-low">
                        <tr>
                            <th>{T("S121")}</th>
                            <th>{T("S129")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {extensionsList.length === 0 ? (
                            <tr>
                                <td colspan="2" class="text-gray">
                                    —
                                </td>
                            </tr>
                        ) : (
                            extensionsList.map((e) => (
                                <tr key={e.id}>
                                    <td>{e.name}</td>
                                    <td>{e.displayName || e.name}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Fragment>
    )
}

export { ScanExtensionsList }
