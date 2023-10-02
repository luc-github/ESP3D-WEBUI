/*
 settings.js - ESP3D WebUI navigation page file

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
import { Router } from "../../components/Router"
import { FeaturesTab } from "../../tabs/features"
import { InterfaceTab } from "../../tabs/interface"
import { MachineTab } from "../../tabs/machine"
import { TabBar } from "../../components/TabBar"
import { T } from "../../components/Translations"
import { mainRoutes } from "../../areas/main"

const routes = {
    FEATURES: {
        component: <FeaturesTab />,
        path: "/settings/features",
    },
    INTERFACE: {
        component: <InterfaceTab />,
        path: "/settings/interface",
    },
    MACHINE: {
        component: <MachineTab />,
        path: "/settings/machine",
    },
}

const Settings = () => {
    return (
        <div id="settings" class="container">
            <TabBar />
            <Router
                routesList={routes}
                parentRoutes={mainRoutes}
                localDefault={"/settings/features"}
            />
        </div>
    )
}

export default Settings
