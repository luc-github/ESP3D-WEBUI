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
import { Router } from "../components/Router";
import About from "../pages/about";
import Dashboard from "../pages/dashboard";
import Settings from "../pages/settings";
import { Informations } from "../areas/informations";

const routes = {
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
  return (
    <div id="main" class="main-page-container">
      <Router routesList={routes} />
    </div>
  );
};

export { MainContainer };
