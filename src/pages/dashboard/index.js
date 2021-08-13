/*
 dashboard.js - ESP3D WebUI navigation page file

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
import { Fragment, h } from "preact";
import { useEffect, useState, useRef } from "preact/hooks";
import { useUiContext } from "../../contexts";
import { ButtonImg } from "../../components/Spectre";
import { T } from "../../components/Translations";
import { List, X } from "preact-feather";
import { iconsList } from "../../components/Images";
import { TerminalPanelElement } from "../../components/Panel/Terminal";

const Dashboard = () => {
  console.log("Dashboard");
  const { panels } = useUiContext();
  const menuPanelsList = useRef();
  //TODO this need to be done in target not here
  useEffect(() => {
    panels.set([TerminalPanelElement]);
  }, []);
  return (
    <div id="dashboard">
      <div class="buttons-bar m-2">
        {panels.list.length > 0 && (
          <div class="dropdown">
            <ButtonImg
              class="dropdown-toggle"
              m1
              icon={<List />}
              rtooltip
              data-tooltip={T("S187")}
              onclick={(e) => {}}
            />
            <ul class="menu" ref={menuPanelsList}>
              <li class="menu-item">
                <div
                  class="menu-entry"
                  onclick={(e) => {
                    panels.setVisibles([]);
                  }}
                >
                  <div class="menu-panel-item">
                    <span class="text-menu-item">{T("S117")}</span>
                    <button class="btn btn-clear" aria-label="Close" />
                  </div>
                </div>
              </li>
              {panels.list.map((panel) => {
                const displayIcon = iconsList[panel.icon]
                  ? iconsList[panel.icon]
                  : "";
                const [isVisible, setVisible] = useState(
                  panels.visibles.find((element) => element.id == panel.id) !=
                    undefined
                );
                useEffect(() => {
                  setVisible(
                    panels.visibles.find((element) => element.id == panel.id) !=
                      undefined
                  );
                }, [panels.visibles]);
                return (
                  <li class="menu-item">
                    <div
                      class="menu-entry"
                      onclick={(e) => {
                        setVisible(!isVisible);
                        if (isVisible) {
                          panels.hide(panel.id);
                        } else {
                          console.log(panel.id);
                          panels.show(panel.id);
                        }
                      }}
                    >
                      <div class="menu-panel-item">
                        <span class="menu-panel-item">
                          {displayIcon}
                          <span class="text-menu-item ">{T(panel.name)}</span>
                        </span>
                        {isVisible && (
                          <button class="btn btn-clear" aria-label="Close" />
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <div class="panels-container">
        {panels.visibles.map((panel) => {
          return <Fragment>{panel.content}</Fragment>;
        })}
      </div>
    </div>
  );
};

export default Dashboard;
