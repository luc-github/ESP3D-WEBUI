/*
 index.js - ESP3D WebUI Target file

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
import { h } from "preact"
import {
    MachineSettings,
    machineSettings,
    defaultPanelsList,
    Target,
    files,
    processor,
    fwUrl,
    Name,
    iconsTarget,
    restartdelay,
    TargetContextProvider,
    useTargetContext,
    useTargetContextFn,
    webUIbuild,
    InformationsControls,
    variablesList,
    eventsList,
    AppLogo,
    WebUILogo,
    QuickButtonsBar,
    BackgroundContainer,
} from "SubTargetDir"

import defaultPreferencesSubTarget from "SubTargetDir/preferences.json"
import defaultPreferencesTarget from "TargetDir/preferences.json"
import defaultPreferencesBase from "./preferences.json"
import { mergeJSON } from "../components/Helpers"

/*
 * Local const
 *
 */
const defaultPreferences = mergeJSON(
    mergeJSON(defaultPreferencesBase, defaultPreferencesTarget),
    defaultPreferencesSubTarget
)

const webUiUrl = "https://github.com/luc-github/ESP3D-WEBUI/tree/3.0"

export {
    MachineSettings,
    machineSettings,
    Target,
    defaultPreferences,
    files,
    processor,
    defaultPanelsList,
    fwUrl,
    webUiUrl,
    Name,
    iconsTarget,
    restartdelay,
    TargetContextProvider,
    useTargetContext,
    useTargetContextFn,
    webUIbuild,
    InformationsControls,
    variablesList,
    eventsList,
    AppLogo,
    WebUILogo,
    QuickButtonsBar,
    BackgroundContainer,
}
