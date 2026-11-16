/*
 DashboardMenu.js - ESP3D WebUI dashboard panels menu

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
import { h, Fragment } from "preact"
import { useEffect, useState } from "preact/hooks"
import {
    List,
    CheckCircle,
    Circle,
    HelpCircle,
    RotateCcw,
    Tool,
    Activity,
    Info,
} from "preact-feather"
import { useUiContextFn, useSettingsContext } from "../../contexts"
import { AppLogo, WebUILogo, variablesList, Name, Target } from "../../targets"
import { T } from "../../components/Translations"

//One menu entry per panel: it owns its visibility state, so no hooks live
//in the parent's .map() loop
const PanelVisibilityItem = ({ panel, panels, uisettings, iconsList, isfixed }) => {
    const isvisible = panels.visibles.find((element) => element.id == panel.id)
    const [isVisible, setVisible] = useState(isvisible)
    useEffect(() => {
        setVisible(panels.visibles.find((element) => element.id == panel.id))
    }, [panels.visibles])
    if (!uisettings.getValue(panel.show)) return null
    const displayIcon = iconsList[panel.icon] ? iconsList[panel.icon] : ""
    return (
        <li class="menu-item">
            <div
                class="menu-entry"
                onclick={(e) => {
                    useUiContextFn.haptic()
                    if (isVisible) {
                        panels.hide(panel.id)
                    } else {
                        panels.show(panel.id, isfixed)
                    }
                    setVisible(!isVisible)
                }}
            >
                <div class="menu-panel-item">
                    <span class="menu-panel-item feather-icon-container">
                        {displayIcon}
                        <span class="text-menu-item">{T(panel.name)}</span>
                    </span>
                    {isVisible && (
                        <span class="btn btn-clear mt-2" aria-label="Close" />
                    )}
                </div>
            </div>
        </li>
    )
}

const MenuEntry = ({ label, checked, icon, onClick, className }) => (
    <li class={`menu-item${className ? ` ${className}` : ""}`}>
        <div class="menu-entry" onclick={onClick}>
            <div class="menu-panel-item">
                <span class="text-menu-item">{label}</span>
                <span class="feather-icon-container">
                    {icon ? (
                        icon
                    ) : checked ? (
                        <CheckCircle size="0.8rem" />
                    ) : (
                        <Circle size="0.8rem" />
                    )}
                </span>
            </div>
        </div>
    </li>
)

//The dashboard dropdown: shortcuts toggle / help, layout edition controls,
//hide-all, one visibility entry per panel, and - in canvas (fixed) mode
//only, where the dashboard covers the header - the main pages links
const DashboardMenu = ({
    panels,
    uisettings,
    iconsList,
    isfixed,
    isKeyboardEnabled,
    onToggleKeyboard,
    onShowKeyboardHelp,
    layoutEditMode,
    onToggleLayoutEdit,
    onResetLayout,
    canvasMode,
    effectiveCanvasMode,
    onToggleCanvasMode,
    borderlessMode,
    onToggleBorderless,
}) => {
    const { interfaceSettings, connectionSettings } = useSettingsContext()
    const aboutLabel = T("S12").replace(
        "%s",
        interfaceSettings.current &&
            interfaceSettings.current.custom &&
            interfaceSettings.current.custom.name
            ? interfaceSettings.current.custom.name
            : Name
    )
    //In canvas mode open panels are closed directly (edition X), so the
    //menu only lists the closed ones; in grid mode every panel is listed
    const menuPanels = effectiveCanvasMode
        ? panels.list.filter(
              (panel) =>
                  uisettings.getValue(panel.show) &&
                  !panels.visibles.find((element) => element.id == panel.id)
          )
        : panels.list
    return (
    <div class="dropdown">
        <span
            class="dropdown-toggle btn tooltip tooltip-right m-1"
            tabindex="0"
            style="z-index: 1000"
            data-tooltip={T("S187")}
            onclick={() => {
                useUiContextFn.haptic()
            }}
        >
            <List />
        </span>
        <ul class="menu">
            <MenuEntry
                label={T("S215")}
                checked={isKeyboardEnabled}
                onClick={onToggleKeyboard}
            />
            {isKeyboardEnabled && (
                <MenuEntry
                    label={T("S216")}
                    icon={<HelpCircle size="0.8rem" />}
                    onClick={onShowKeyboardHelp}
                />
            )}
            <MenuEntry
                className="hide-low"
                label={T("S263")}
                checked={layoutEditMode}
                onClick={onToggleLayoutEdit}
            />
            {layoutEditMode && (
                <MenuEntry
                    className="hide-low"
                    label={T("S264")}
                    icon={<RotateCcw size="0.8rem" />}
                    onClick={onResetLayout}
                />
            )}
            {layoutEditMode && (
                <MenuEntry
                    className="hide-low"
                    label={T("S268")}
                    checked={canvasMode}
                    onClick={onToggleCanvasMode}
                />
            )}
            {layoutEditMode && effectiveCanvasMode && (
                <MenuEntry
                    className="hide-low"
                    label={T("S266")}
                    checked={borderlessMode}
                    onClick={onToggleBorderless}
                />
            )}
            {menuPanels.length > 0 && <li class="divider"></li>}
            {menuPanels.map((panel) => (
                <PanelVisibilityItem
                    key={panel.id}
                    panel={panel}
                    panels={panels}
                    uisettings={uisettings}
                    iconsList={iconsList}
                    isfixed={isfixed}
                />
            ))}
            {effectiveCanvasMode && (
                <Fragment>
                    <li class="divider"></li>
                    {!variablesList.hideFeatures && (
                        <li class="menu-item">
                            <a
                                class="menu-entry feather-icon-container"
                                href="#/settings/features"
                                onclick={() => {
                                    useUiContextFn.haptic()
                                }}
                            >
                                <AppLogo height="0.8rem" />
                                <span class="text-menu-item">{T("S36")}</span>
                            </a>
                        </li>
                    )}
                    <li class="menu-item">
                        <a
                            class="menu-entry feather-icon-container"
                            href="#/settings/interface"
                            onclick={() => {
                                useUiContextFn.haptic()
                            }}
                        >
                            <WebUILogo height="0.8rem" />
                            <span class="text-menu-item">{T("S17")}</span>
                        </a>
                    </li>
                    {uisettings.getValue("showmachinesettings") &&
                        connectionSettings.current.FWTarget != 0 && (
                            <li class="menu-item">
                                <a
                                    class="menu-entry feather-icon-container"
                                    href="#/settings/machine"
                                    onclick={() => {
                                        useUiContextFn.haptic()
                                    }}
                                >
                                    <Tool size="0.8rem" />
                                    <span class="text-menu-item">
                                        {T(Target)}
                                    </span>
                                </a>
                            </li>
                        )}
                    {uisettings.getValue("showinformationpage") && (
                        <li class="menu-item">
                            <a
                                class="menu-entry feather-icon-container"
                                href="#/informations"
                                onclick={() => {
                                    useUiContextFn.haptic()
                                }}
                            >
                                <Activity size="0.8rem" />
                                <span class="text-menu-item">{T("S123")}</span>
                            </a>
                        </li>
                    )}
                    <li class="menu-item">
                        <a
                            class="menu-entry feather-icon-container"
                            href="#/about"
                            onclick={() => {
                                useUiContextFn.haptic()
                            }}
                        >
                            <Info size="0.8rem" />
                            <span class="text-menu-item">{aboutLabel}</span>
                        </a>
                    </li>
                </Fragment>
            )}
        </ul>
    </div>
    )
}

export { DashboardMenu }
