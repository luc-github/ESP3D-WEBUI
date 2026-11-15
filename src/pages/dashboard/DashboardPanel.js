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
import { PanelLayoutControls } from "../../components/Panels/PanelLayoutControls"

//One visible dashboard panel: a wrapper carrying the panel content and,
//in layout edition mode, the layout controls (pointer drag to reorder
//and width span in grid mode, move / resize / borderless in canvas
//mode - see PanelLayoutControls.js). Only fixed panels can be
//reordered, hence the distinct wrapper class
const DashboardPanel = ({
    panel,
    isfixed,
    effectiveCanvasMode,
    layoutEditMode,
    onReorder,
}) => {
    const controls = layoutEditMode && (
        <PanelLayoutControls
            panelId={panel.id}
            mode={effectiveCanvasMode ? "canvas" : "grid"}
            onReorder={onReorder}
        />
    )
    if (!isfixed) {
        return (
            <div class="panel-layout-wrapper">
                {panel.content}
                {controls}
            </div>
        )
    }
    return (
        <div class="panel-drag-wrapper">
            {panel.content}
            {controls}
        </div>
    )
}

export { DashboardPanel }
