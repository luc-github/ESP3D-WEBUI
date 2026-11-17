/*
 index.js - ESP3D WebUI context file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public
 License as published by the Free Software Foundation; either
 version 3 of the License, or (at your option) any later version.

 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.

 You should have received a copy of the GNU General Public
 License along with This code; if not, see <https://www.gnu.org/licenses/>.
*/
import { h } from "preact"
import { RouterContextProvider, useRouterContext } from "./RouterContext"
import {
    HttpQueueContextProvider,
    useHttpQueueContext,
} from "./HttpQueueContext"
import { UiContextProvider, useUiContext, useUiContextFn } from "./UiContext"
import {
    SettingsContextProvider,
    useSettingsContext,
    useSettingsContextFn,
} from "./SettingsContext"
import { DatasContextProvider, useDatasContext } from "./DatasContext"
import { WsContextProvider, useWsContext } from "./WsContext"

export {
    RouterContextProvider,
    useRouterContext,
    HttpQueueContextProvider,
    useHttpQueueContext,
    UiContextProvider,
    useUiContext,
    useUiContextFn,
    SettingsContextProvider,
    useSettingsContext,
    DatasContextProvider,
    useDatasContext,
    WsContextProvider,
    useWsContext,
    useSettingsContextFn,
}
