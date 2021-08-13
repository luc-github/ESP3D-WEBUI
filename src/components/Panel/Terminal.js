/*
 Terminal.js - ESP3D WebUI component file

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

import { h } from "preact";
import { useEffect } from "preact/hooks";
import { T } from "../Translations";
import { MoreVertical, Terminal, X } from "preact-feather";
import { useUiContext } from "../../contexts";

/*
 * Local const
 *
 */
const TerminalPanel = () => {
  const { panels } = useUiContext();
  const id = "terminalPanel";
  useEffect(() => {}, []);
  return (
    <div className="column col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-3 mb-2">
      <div class="panel mb-2 panel-dashboard">
        <div class="navbar">
          <span class="navbar-section label label-secondary feather-icon-container">
            <Terminal />
            <strong class="text-ellipsis">{T("Terminal")}</strong>
          </span>
          <span class="navbar-section">
            <span style="height: 100%;">
              <button
                class="btn btn-clear btn-close m-1"
                aria-label="Close"
                onclick={(e) => {
                  panels.hide(id);
                }}
              />
            </span>
          </span>
        </div>
        <div class="panel-body panel-body-features">Terminal</div>
      </div>
    </div>
  );
};

const TerminalPanelElement = {
  id: "terminalPanel",
  content: <TerminalPanel />,
  name: "S75",
  icon: "Terminal",
};

export { TerminalPanel, TerminalPanelElement };
