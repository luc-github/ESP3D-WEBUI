/*
Macros.js - ESP3D WebUI component file

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
import { Cast } from "preact-feather";
import { useUiContext } from "../../contexts";
import { ButtonImg } from "../Controls";
import { useHttpFn } from "../../hooks";
import { espHttpURL } from "../Helpers";
import { iconsFeather } from "../Images";
import { iconsTarget, useTargetContextFn, files } from "../../targets";

/*
 * Local const
 *
 */
const MacrosPanel = () => {
  const { panels, uisettings } = useUiContext();
  const { processData } = useTargetContextFn;
  const { createNewRequest } = useHttpFn;
  const iconsList = { ...iconsTarget, ...iconsFeather };
  const id = "macrosPanel";
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

  const macroList = uisettings.getValue("macros");
  const macroButtons = macroList.reduce((acc, curr) => {
    const item = curr.value.reduce((accumulator, current) => {
      accumulator[current.name] = current.initial;
      return accumulator;
    }, {});
    acc.push(item);
    return acc;
  }, []);
  const processMacro = (action, type) => {
    switch (type) {
      case "FS":
        //[ESP700] //ESP700 should send status to telnet / websocket
        sendCommand("[ESP700]" + action);
        break;
      case "SD":
        //get command accoring target FW
        const response = files.command("SD", "play", "", action);
        const cmds = response.cmd.split("\n");
        cmds.forEach((cmd) => {
          sendCommand(cmd);
        });

        break;
      //TODO:
      //TFT SD ? same as above
      //TFT USB ? same as above
      case "URI":
        //open new page or silent command
        const uri = action.trim().replace("[SILENT]", "");
        if (action.trim().startsWith("[SILENT]")) {
          const uri = action.trim().replace("[SILENT]", "");
          var myInit = { method: "GET", mode: "cors", cache: "default" };
          fetch(uri, myInit)
            .then(function (response) {
              if (response.ok) {
                console.log("Request succeeded");
              } else {
                console.log("Request failed");
              }
            })
            .catch(function (error) {
              console.log("Request failed: " + error.message);
            });
        } else {
          window.open(action);
        }
        break;
      case "CMD":
        //split by ; and show in terminal
        const commandsList = action.trim().split(";");
        commandsList.forEach((element) => {
          sendCommand(element);
        });
        break;
      default:
        console.log("type:", type, " action:", action);
        break;
    }
  };

  return (
    <div className="column col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-3 mb-2">
      <div class="panel mb-2 panel-dashboard">
        <div class="navbar">
          <span class="navbar-section feather-icon-container">
            <Cast />
            <strong class="text-ellipsis">{T("macros")}</strong>
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
        <div class="panel-body panel-body-dashboard">
          <div class="macro-buttons-panel">
            {macroButtons.map((element) => {
              const displayIcon = iconsList[element.icon]
                ? iconsList[element.icon]
                : "";
              return (
                <ButtonImg
                  m1
                  label={element.name}
                  icon={displayIcon}
                  onclick={(e) => {
                    e.target.blur();
                    processMacro(element.action, element.type);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const MacrosPanelElement = {
  id: "macrosPanel",
  content: <MacrosPanel />,
  name: "macros",
  icon: "Cast",
  show: "showmacrospanel",
  onstart: "openmacrosonstart",
};

export { MacrosPanel, MacrosPanelElement };
