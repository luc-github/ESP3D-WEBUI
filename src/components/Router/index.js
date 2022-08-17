/*
 Router.js - ESP3D WebUI router file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 modified by Luc LEBOSSE 2021
 
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
import { h, Fragment } from "preact"
import { useState, useEffect, useCallback } from "preact/hooks"
import { Loading } from "../Controls"
import { useRouterContext } from "../../contexts"

const Router = ({ children, routesList, parentRoutes, localDefault }) => {
    const [isLoading, setIsLoading] = useState(true)
    const {
        setActiveRoute,
        setRoutes,
        activeRoute,
        routes,
        defaultRoute,
        activeTab,
    } = useRouterContext()

    function parseLocation() {
        if (typeof window !== "undefined") {
            const location = window.location.hash.slice(1).toLowerCase()
            if (location == "/settings") {
                window.location.href = "/#" + activeTab.current
                return activeTab.current
            } else {
                return location
            }
        } else {
            return defaultRoute
        }
    }
    const localDefaultRoute = localDefault
        ? activeTab.current
        : defaultRoute.current

    const elements = Object.values(routesList)
    const defaultElement = elements.find(
        (element) => element.path == localDefaultRoute
    )
    const [ActiveComponent, setActiveComponent] = useState(
        defaultElement.component
    )

    const handleHashChange = useCallback(() => {
        setActiveRouteAndComp()
    }, [])

    const setActiveRouteAndComp = () => {
        let found = false
        setIsLoading(true)
        const location = parseLocation().split("/")
        const path = parseLocation()
        /* A for loop. */
        for (let i = 0; i < location.length; i++) {
            const subLocation = location.slice(0, i + 1).join("/")
            for (const key in routesList) {
                if (Object.prototype.hasOwnProperty.call(routesList, key)) {
                    const element = routesList[key]
                    if (
                        element.path === subLocation ||
                        subLocation == element.path
                    ) {
                        setActiveRoute(element.path)
                        setActiveComponent(element.component)
                        found = true
                        setIsLoading(false)
                        break
                    }
                }
            }
        }
        if (!found) {
            //console.log("not found ", location, " in ", routesList)
            if (parentRoutes) {
                //console.log("checking parentRoutes", parentRoutes)
                for (let i = 0; i < location.length; i++) {
                    const subLocation = location.slice(0, i + 1).join("/")
                    for (const key in parentRoutes.current) {
                        if (
                            Object.prototype.hasOwnProperty.call(
                                parentRoutes.current,
                                key
                            )
                        ) {
                            const element = parentRoutes.current[key]
                            if (
                                element.path === subLocation ||
                                subLocation == element.path
                            ) {
                                setActiveRoute(element.path)
                                setActiveComponent(element.component)
                                found = true
                                setIsLoading(false)
                                break
                            }
                        }
                    }
                }
            } else {
                //console.log("no parentRoutes")
                //.log("checking defaultRoute", defaultRoute)
                window.location.href = "/#" + defaultRoute.current
            }
        } else {
            // console.log("found ", path, " in ", routesList)
        }

        if (!found) {
            /*if (parentRoutes) {
                console.log(
                    "not found ",
                    path,
                    " in main menu and settings ",
                    routesList,
                    parentRoutes.current
                )
            } else {
                console.log("not found ", path, " in main menu ", routesList)
            }*/
            if (path.startsWith("/settings/")) {
                window.location.href = "/#" + activeTab.current
            } else {
                if (path.startsWith("/extrapage/")) {
                    //console.log("not valid extra page")
                } else {
                    // console.log("root page")
                    window.location.href = "/#" + defaultRoute.current
                }
            }
        }
    }

    useEffect(() => {
        setRoutes({ ...routes, ...routesList })
        setActiveRouteAndComp()
    }, [])

    useEffect(() => {
        if (activeRoute.startsWith("/settings/")) {
            if (activeTab.current != activeRoute) {
                activeTab.current = activeRoute
                setActiveRouteAndComp()
            }
        }
    }, [activeRoute])

    useEffect(() => {
        setActiveRouteAndComp()
        if (activeRoute.startsWith("/settings/")) {
            activeTab.current = activeRoute
        }
        window.addEventListener("hashchange", handleHashChange)
        return () => window.removeEventListener("hashchange", handleHashChange)
    }, [])

    return isLoading ? (
        <Loading large />
    ) : (
        <Fragment>
            {ActiveComponent}
            {children}
        </Fragment>
    )
}

const Link = ({
    activeClassName = "",
    className = "",
    href,
    children,
    ...rest
}) => {
    const { activeRoute } = useRouterContext()
    const [mergedClassName, setMergedClassName] = useState()

    useEffect(() => {
        const route = window.location.hash.slice(1).toLowerCase()
        if (
            (activeRoute == "/settings" && href == route) ||
            (route.startsWith("/settings") && href == "/settings")
        ) {
            setMergedClassName(`${className} ${activeClassName}`)
        } else
            setMergedClassName(
                activeRoute === href
                    ? `${className} ${activeClassName}`
                    : className
            )
    }, [activeRoute])

    return (
        mergedClassName && (
            <a href={`#${href}`} className={mergedClassName} {...rest}>
                {children}
            </a>
        )
    )
}

export { Router, Link }
