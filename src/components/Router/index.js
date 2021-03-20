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
import { h, Fragment } from "preact";
import { useRouterContext } from "../../contexts";
import { useState, useEffect, useCallback } from "preact/hooks";
import { Loading } from "../Spectre";

const Router = ({ children, routesList }) => {
  const [isLoading, setIsLoading] = useState(true);
  const {
    setActiveRoute,
    setRoutes,
    activeRoute,
    routes,
    defaultRoute,
  } = useRouterContext();
  const [ActiveComponent, setActiveComponent] = useState(
    routesList.DEFAULT.component
  );
  const parseLocation = () =>
    typeof window !== "undefined"
      ? location.hash.slice(1).toLowerCase()
      : defaultRoute;
  const handleHashChange = useCallback(() => {
    setActiveRouteAndComp();
  }, []);

  const setActiveRouteAndComp = () => {
    let found = false;
    setIsLoading(true);
    const location = parseLocation().split("/");
    for (let i = 0; i < location.length; i++) {
      const subLocation = location.slice(0, i + 1).join("/");
      for (const key in routesList) {
        if (Object.prototype.hasOwnProperty.call(routesList, key)) {
          const element = routesList[key];
          if (element.path === subLocation) {
            setActiveRoute(element.path);
            setActiveComponent(element.component);
            found = true;
            setIsLoading(false);
            break;
          }
        }
      }
    }
    if (!found) {
      window.location.href = "/#" + defaultRoute;
    }
  };
  useEffect(() => {
    setRoutes({ ...routes, ...routesList });
    setActiveRouteAndComp();
  }, []);

  useEffect(() => {
    setActiveRouteAndComp();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [handleHashChange, activeRoute]);

  return isLoading ? (
    <Loading large />
  ) : (
    <Fragment>
      {ActiveComponent}
      {children}
    </Fragment>
  );
};

const Link = ({
  activeClassName = "",
  className = "",
  href,
  children,
  ...rest
}) => {
  const { activeRoute } = useRouterContext();
  const [mergedClassName, setMergedClassName] = useState();

  useEffect(() => {
    setMergedClassName(
      activeRoute === href ? `${className} ${activeClassName}` : className
    );
  }, [activeRoute]);

  return (
    mergedClassName && (
      <a href={`#${href}`} className={mergedClassName} {...rest}>
        {children}
      </a>
    )
  );
};

export { Router, Link };
