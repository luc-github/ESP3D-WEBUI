/*
Extruders.js - ESP3D WebUI component file

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
import { T } from "../Translations";
import { useUiContext } from "../../contexts";
import { ButtonImg } from "../Controls";
import { useHttpFn } from "../../hooks";
import { espHttpURL } from "../Helpers";
import { iconsTarget, useTargetContextFn } from "../../targets";

/*
 * Local const
 *
 */
const ExtrudersPanel = () => {
  const { panels, uisettings } = useUiContext();
  const { processData } = useTargetContextFn;
  const { createNewRequest } = useHttpFn;
  const id = "extrudersPanel";
  console.log(id);
  const sendCommand = (cmd) => {
    createNewRequest(
      espHttpURL("command", { cmd }).toString(),
      { method: "GET", echo: cmd },
      {
        onSuccess: (result) => {
          processData("response", result);
        },
        onFail: (error) => {
          console.log(error);
          processData("error", error);
        },
      }
    );
  };

  //const macroList = uisettings.getValue("macros");

  return (
    <div class="panel panel-dashboard">
      <div class="navbar">
        <span class="navbar-section feather-icon-container">
          {iconsTarget["Extruder"]}
          <strong class="text-ellipsis">{T("P36")}</strong>
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
      <div class="panel-body panel-body-dashboard"></div>
    </div>
  );
};

const ExtrudersPanelElement = {
  id: "extrudersPanel",
  content: <ExtrudersPanel />,
  name: "P36",
  icon: "Extruder",
  show: "showextruderspanel",
  onstart: "openextrudersonstart",
};

export { ExtrudersPanel, ExtrudersPanelElement };
