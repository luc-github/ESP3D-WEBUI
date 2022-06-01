/*
ScanPacksList.js - ESP3D WebUI component file

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
import { ButtonImg, Loading } from "./../Controls"
import { useHttpQueue } from "../../hooks"
import { espHttpURL } from "../../components/Helpers"
import { useUiContext, useUiContextFn } from "../../contexts"
import { T, getLanguageName } from "./../Translations"
import { CheckCircle } from "preact-feather"

const ScanPacksList = ({ id, setValue, refreshfn }) => {
    const { modals, toasts } = useUiContext()
    const [isLoading, setIsLoading] = useState(true)

    const [packsList, setPacksList] = useState([])
    const { createNewRequest } = useHttpQueue()
    const ScanPacks = () => {
        setIsLoading(true)
        createNewRequest(
            espHttpURL("files", { path: "/" }),
            { method: "GET" },
            {
                onSuccess: (result) => {
                    setIsLoading(false)
                    const listFiles = JSON.parse(result)
                    setPacksList(listFiles.files)
                },
                onFail: (error) => {
                    setIsLoading(false)
                    toasts.addToast({ content: error, type: "error" })
                    setPacksList([])
                },
            }
        )
    }
    useEffect(() => {
        ScanPacks()
        refreshfn(ScanPacks)
    }, [])
    return (
        <Fragment>
            {isLoading && <Loading />}

            {!isLoading && (
                <table class="table">
                    <thead class="hide-low">
                        <tr>
                            <th>
                                {id == "languagePickup" ? T("S67") : T("S183")}
                            </th>
                            <th>{T("S178")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                {id == "languagePickup"
                                    ? T("lang", true)
                                    : T("none")}
                            </td>

                            <td>
                                <ButtonImg
                                    m2
                                    ltooltip
                                    data-tooltip={
                                        id == "languagePickup"
                                            ? T("S179")
                                            : T("S180")
                                    }
                                    icon={<CheckCircle />}
                                    onClick={() => {
                                        useUiContextFn.haptic()
                                        setValue("default")
                                        modals.removeModal(
                                            modals.getModalIndex(id)
                                        )
                                    }}
                                />
                            </td>
                        </tr>
                        {packsList.map((e) => {
                            if (
                                (id == "languagePickup" &&
                                    e.name.match(/^lang-\w*.json(.gz)*/g)) ||
                                (id == "themePickup" &&
                                    e.name.match(/^theme-\w*(.gz)*/g))
                            )
                                return (
                                    <tr>
                                        <td>
                                            <span
                                                class="tooltip tooltip-right"
                                                data-tooltip={e.name}
                                            >
                                                {id == "languagePickup"
                                                    ? getLanguageName(
                                                          e.name.replace(
                                                              ".gz",
                                                              ""
                                                          )
                                                      )
                                                    : e.name
                                                          .replace(".gz", "")
                                                          .replace(
                                                              "theme-",
                                                              ""
                                                          )}
                                            </span>
                                        </td>

                                        <td>
                                            <ButtonImg
                                                m2
                                                ltooltip
                                                data-tooltip={T("S179")}
                                                icon={<CheckCircle />}
                                                onClick={() => {
                                                    useUiContextFn.haptic()
                                                    setValue(
                                                        e.name.replace(
                                                            ".gz",
                                                            ""
                                                        )
                                                    )
                                                    modals.removeModal(
                                                        modals.getModalIndex(id)
                                                    )
                                                }}
                                            />
                                        </td>
                                    </tr>
                                )
                        })}
                    </tbody>
                </table>
            )}
        </Fragment>
    )
}
export { ScanPacksList }
