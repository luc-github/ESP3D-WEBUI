/*
 Terminal.js - ESP3D WebUI component file

 Copyright (c) 2021 Luc LEBOSSE. All rights reserved.

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
import { ChevronDown, Terminal } from "preact-feather";
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
              <div class="dropdown dropdown-right">
                <button
                  class="dropdown-toggle btn btn-xs btn-header m-1"
                  onclick={(e) => {}}
                >
                  <ChevronDown size="0.8rem" />
                </button>

                <ul class="menu">
                  <li class="menu-item">
                    <div class="menu-entry">Verbose</div>
                  </li>
                  <li class="menu-item">
                    <div class="menu-entry">Clear</div>
                  </li>
                </ul>
              </div>

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
        <div class="panel-body panel-body-dashboard">Terminal</div>
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
