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
import { h } from "preact";

import { useState, useEffect, useRef } from "preact/hooks";
import { Router } from "../components/Router";
import { useUiContext, useSettingsContext } from "../contexts";
import About from "../pages/about";
import Dashboard from "../pages/dashboard";
import Settings from "../pages/settings";
import ExtraPage from "../pages/extrapages";
import { Informations } from "../areas/informations";
import { FooterContainer } from "./footer";
import { isLimitedEnvironment } from "../components/Helpers";
import { T } from "../components/Translations";
import { showModal } from "../components/Modal";
import { Info } from "preact-feather";
import { processor } from "../targets";

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
  INFORMATIONS: {
    component: <Informations type="page" />,
    path: "/informations",
  },
};

const MainContainer = () => {
  const { uisettings, modals } = useUiContext();
  const { connectionSettings } = useSettingsContext();
  const [routes, setRoutes] = useState({ ...defRoutes });

  const newroutes = () => {
    if (uisettings.getValue("showextracontents")) {
      const extraContents = uisettings.getValue("extracontents");
      const extraPages = extraContents.reduce((acc, curr) => {
        const item = curr.value.reduce((accumulator, current) => {
          accumulator[current.name] = current.initial;
          return accumulator;
        }, {});

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
          };
        }
        return acc;
      }, routes);
      return extraPages;
    } else {
      return defRoutes;
    }
  };

  useEffect(() => {
    if (connectionSettings.current && connectionSettings.current.WiFiMode) {
      if (isLimitedEnvironment(connectionSettings.current.WiFiMode))
        showModal({
          modals,
          title: T("S123"),
          button1: { text: T("S24") },
          icon: <Info />,
          id: "notification",
          content: T("S124").replace(
            "%s",
            connectionSettings.current.WebSocketIP +
              (connectionSettings.current.WebSocketport != "81"
                ? ":" + (parseInt(connectionSettings.current.WebSocketport) - 1)
                : "")
          ),
        });
    }
  }, [connectionSettings.current]);

  useEffect(() => {
    setRoutes(newroutes);
  }, [uisettings]);

  useEffect(() => {
    setInterval(() => {
      console.log("check time out");
      processor.handle();
    }, 10000);
  }, []);

  return (
    <div id="main" class="main-page-container">
      <Router routesList={routes} />
      <FooterContainer />
    </div>
  );
};

export { MainContainer };
