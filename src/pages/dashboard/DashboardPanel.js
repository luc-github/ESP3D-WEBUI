/*
 DashboardPanel.js - ESP3D WebUI dashboard panel wrapper

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
import { Anchor } from "preact-feather"
import { T } from "../../components/Translations"
import { PanelLayoutControls } from "../../components/Panels/PanelLayoutControls"

//One visible dashboard panel: plain wrapper, or draggable wrapper with a
//drag handle and a drop position indicator when panels are fixed
const DashboardPanel = ({
    panel,
    index,
    isfixed,
    effectiveCanvasMode,
    layoutEditMode,
    dropIndicator,
    dragHandlers,
}) => {
    if (!isfixed) {
        return (
            <div class="panel-layout-wrapper">
                {panel.content}
                {layoutEditMode && (
                    <PanelLayoutControls
                        panelId={panel.id}
                        mode={effectiveCanvasMode ? "canvas" : "grid"}
                    />
                )}
            </div>
        )
    }
    const isExtraPanel =
        panel.settingid && panel.settingid.startsWith("extracontents_")
    const {
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleDragEnd,
    } = dragHandlers
    return (
        <div
            class={`panel-drag-wrapper${panel.hasMenu ? " panel-has-menu" : ""}${
                isExtraPanel ? " panel-extra-content" : ""
            }${
                dropIndicator.index === index
                    ? ` panel-drop-indicator-${dropIndicator.side}`
                    : ""
            }`}
            draggable={!effectiveCanvasMode}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            data-panel-index={index}
        >
            <span
                class="panel-drag-handle tooltip tooltip-left"
                data-tooltip={T("S256")}
                draggable={!effectiveCanvasMode}
                onDragStart={handleDragStart}
                aria-label={T("S256")}
            >
                <Anchor size="0.8rem" />
            </span>
            {panel.content}
            {layoutEditMode && (
                <PanelLayoutControls
                    panelId={panel.id}
                    mode={effectiveCanvasMode ? "canvas" : "grid"}
                />
            )}
        </div>
    )
}

export { DashboardPanel }
