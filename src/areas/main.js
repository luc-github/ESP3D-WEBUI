/*
 main.js - ESP3D WebUI MainPage file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.
  Original code inspiration : 2021 Alexandre Aussourd

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

import { useState, useEffect, useRef } from "preact/hooks"
import { Router } from "../components/Router"
import { useUiContext, useSettingsContext } from "../contexts"
import About from "../pages/about"
import Dashboard from "../pages/dashboard"
import Settings from "../pages/settings"
import ExtraPage from "../pages/extrapages"
import { FooterContainer } from "./footer"
import { processor, BackgroundContainer } from "../targets"

const mainRoutes = { current: {} }

const defRoutes = {
    DASHBOARD: {
        component: <Dashboard />,
        path: "/dashboard",
    },
    ABOUT: {
        component: <About />,
        path: "/about",
    },
    SETTINGS: {
        component: <Settings />,
        path: "/settings",
    },
}

const PANEL_HEIGHT_DEFAULT = 550
const PANEL_HEIGHT_MIN = 200
const PANEL_HEIGHT_MAX = 1200
const PANEL_MIN_WIDTH_DEFAULT = 340
const PANEL_MIN_WIDTH_MIN = 200
const PANEL_MIN_WIDTH_MAX = 600
const PANEL_MAX_WIDTH_DEFAULT = 520
const PANEL_MAX_WIDTH_MIN = 0
const PANEL_MAX_WIDTH_MAX = 1200

const clamp = (val, lo, hi, def) => {
    if (val == null || val === "") return def
    const num = parseInt(String(val), 10)
    if (Number.isNaN(num)) return def
    return Math.min(hi, Math.max(lo, num))
}

const MainContainer = () => {
    const { uisettings, modals } = useUiContext()
    const { connectionSettings } = useSettingsContext()
    const [routes, setRoutes] = useState({ ...defRoutes })

    useEffect(() => {
        const raw = uisettings.getValue("panelheight")
        const num =
            raw != null && raw !== ""
                ? Math.min(
                      PANEL_HEIGHT_MAX,
                      Math.max(PANEL_HEIGHT_MIN, parseInt(String(raw), 10))
                  )
                : PANEL_HEIGHT_DEFAULT
        document.documentElement.style.setProperty(
            "--panel-height",
            (Number.isNaN(num) ? PANEL_HEIGHT_DEFAULT : num) + "px"
        )
    }, [uisettings.current])

    useEffect(() => {
        const minW = clamp(
            uisettings.getValue("panelminwidth"),
            PANEL_MIN_WIDTH_MIN,
            PANEL_MIN_WIDTH_MAX,
            PANEL_MIN_WIDTH_DEFAULT
        )
        const maxW = clamp(
            uisettings.getValue("panelmaxwidth"),
            PANEL_MAX_WIDTH_MIN,
            PANEL_MAX_WIDTH_MAX,
            PANEL_MAX_WIDTH_DEFAULT
        )
        document.documentElement.style.setProperty(
            "--panel-min-width",
            minW + "px"
        )
        /* If max is 0 or min > max, use 1fr (no limit: columns grow to fill space) */
        document.documentElement.style.setProperty(
            "--panel-max-width",
            maxW === 0 || minW > maxW ? "1fr" : maxW + "px"
        )
    }, [uisettings.current])
    mainRoutes.current = { ...defRoutes }
    const newroutes = () => {
        if (uisettings.getValue("showextracontents")) {
            const extraContents = uisettings.getValue("extracontents")
            const extraPages = extraContents.reduce((acc, curr) => {
                const item = curr.value.reduce((accumulator, current) => {
                    accumulator[current.name] = current.initial
                    return accumulator
                }, {})

                if (item.target == "page") {
                    acc["EXTRA-" + curr.id] = {
                        component: (
                            <ExtraPage
                                id={curr.id}
                                label={item.name}
                                source={item.source}
                                refreshtime={item.refreshtime}
                                type={item.type}
                            />
                        ),
                        path: "/extrapage/" + curr.id,
                    }
                }
                return acc
            }, routes)
            mainRoutes.current = { ...extraPages }
            return extraPages
        } else {
            mainRoutes.current = { ...defRoutes }
            return defRoutes
        }
    }

    useEffect(() => {
        setRoutes(newroutes())
    }, [uisettings])

    useEffect(() => {
        setInterval(() => {
            processor.handle()
        }, 10000)
    }, [])

    return (
        <div id="main" class="main-page-container">
            <BackgroundContainer />
            <Router routesList={routes} />
            <FooterContainer />
        </div>
    )
}

export { MainContainer, mainRoutes }
