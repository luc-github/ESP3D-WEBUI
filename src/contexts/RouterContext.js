/*
 RouterContext.js - ESP3D WebUI context file
 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 Modified by Luc LEBOSSE 2021
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
import { h, createContext } from "preact";
import { useContext, useState } from "preact/hooks";

let defaultRoute;
let defaultTab;

/*
 * Local const
 *
 */
const MenuContext = createContext("MenuContext");
const useMenuContext = () => useContext(MenuContext);
const MenuContextProvider = ({ children, initialDefaultRoute }) => {
  if (typeof defaultRoute === "undefined") {
    defaultRoute = initialDefaultRoute;
  }
  const [activeRoute, setActiveRoute] = useState(defaultRoute);
  function setDefaultRoute(newDefaultRoute) {
    defaultRoute = newDefaultRoute;
  }
  function getDefaultRoute() {
    return defaultRoute;
  }
  const [routes, setRoutes] = useState({});
  const store = {
    activeRoute,
    setActiveRoute,
    routes,
    setRoutes,
    setDefaultRoute,
    getDefaultRoute,
  };
  return <MenuContext.Provider value={store}>{children}</MenuContext.Provider>;
};

const TabContext = createContext("TabContext");
const useTabContext = () => useContext(TabContext);
const TabContextProvider = ({ children, initialDefaultRoute }) => {
  if (typeof defaultTab === "undefined") {
    defaultTab = initialDefaultRoute;
  }
  const [activeRoute, setActiveRoute] = useState(defaultTab);
  function setDefaultRoute(newDefaultRoute) {
    defaultTab = newDefaultRoute;
  }
  function getDefaultRoute() {
    return defaultTab;
  }
  const [routes, setRoutes] = useState({});
  const store = {
    activeRoute,
    setActiveRoute,
    routes,
    setRoutes,
    setDefaultRoute,
    getDefaultRoute,
  };
  return <TabContext.Provider value={store}>{children}</TabContext.Provider>;
};

export {
  MenuContextProvider,
  useMenuContext,
  TabContextProvider,
  useTabContext,
};
