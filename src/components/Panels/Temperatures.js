/*
Temperatures.js - ESP3D WebUI component file

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

import { Fragment, h } from "preact";
import { T } from "../Translations";
import { useUiContext, useUiContextFn } from "../../contexts";
import { useEffect, useState, useRef } from "preact/hooks";
import { ButtonImg, Loading, Field } from "../Controls";
import { useHttpFn } from "../../hooks";
import { espHttpURL } from "../Helpers";
import { Thermometer, Flag } from "preact-feather";
import {
  iconsTarget,
  useTargetContextFn,
  useTargetContext,
} from "../../targets";

let temp_value = 0;

/*
 * Local const
 *
 */
//each one has
//{current: 0, modified: 0}
const target_temperatures = {
  T: [], //0->8 T0->T8 Extruders
  B: [], //0->1 B Bed
  C: [], //0->1  Chamber
};

const isEditable = (tool) => {
  if (tool == "T" || tool == "B" || tool == "C") return true;
  return false;
};

const isVisible = (tool) => {
  const setting = {
    T: "showextruderctrls",
    B: "showbedctrls",
    C: "showchamberctrls",
    P: "showprobectrls",
    R: "showredondantctrls",
    M: "showboardctrls",
  };
  return setting[tool] != undefined
    ? useUiContextFn.getValue(setting[tool])
    : false;
};

const sensorName = (tool, index, size) => {
  const name = { T: "P41", B: "P37", C: "P43", P: "P42", R: "P44", M: "P90" };
  return name[tool] != undefined
    ? T(name[tool]).replace("$", size == 1 ? "" : index + 1)
    : "";
};

//A separate control to avoid the full panel to be updated when the temperatures are updated
const TemperaturesControls = () => {
  const { temperatures } = useTargetContext();
  return (
    <div class="temperatures-ctrls">
      {Object.keys(temperatures).map((tool) => {
        if (temperatures[tool].length == 0 || !isVisible(tool)) return;
        return (
          <Fragment>
            {temperatures[tool].map((temp, index) => {
              return (
                <div
                  class="temperatures-ctrl mt-1 tooltip tooltip-bottom"
                  data-tooltip={sensorName(
                    tool,
                    index,
                    temperatures[tool].length
                  )}
                >
                  <div class="temperatures-header">
                    {tool == "T" ? "E" : tool}
                    {temperatures[tool].length > 1 ? index : ""}
                  </div>
                  <div class="temperatures-value">{temp.current}</div>
                  {temp.target > 0 && (
                    <div class=" temperatures-target">{temp.target}</div>
                  )}
                </div>
              );
            })}
          </Fragment>
        );
      })}
    </div>
  );
};

const TemperatureInputControl = ({ tool, index, size }) => {
  const { temperatures } = useTargetContext();
  const [validation, setvalidation] = useState();
  const generateValidation = (fieldData) => {
    let validation = {
      message: <Flag size="1rem" />,
      valid: true,
      modified: true,
    };
    return validation;
  };
  return <div>{sensorName(tool, index, size)}</div>;
  /*

   */
  /*<Field
                value={temp_value}
                id="temp_tool"
                setValue={(val, update) => {
                  if (!update) temp_value = val;
                  setvalidation(generateValidation("fieldData"));
                }}
                validation={validation}
              />*/
};

const TemperaturesPanel = () => {
  const { panels, uisettings } = useUiContext();
  const { temperatures } = useTargetContext();
  const { createNewRequest } = useHttpFn;
  const id = "temperaturesPanel";
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

  let hasTemp = false;
  Object.keys(temperatures).forEach((tool) => {
    if (temperatures[tool].length != 0) hasTemp = true;
  });
  return (
    <div className="column col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-3 mb-2">
      <div class="panel mb-2 panel-dashboard">
        <div class="navbar">
          <span class="navbar-section feather-icon-container">
            <Thermometer />
            <strong class="text-ellipsis">{T("P29")}</strong>
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
          {hasTemp && (
            <Fragment>
              <TemperaturesControls />
              {Object.keys(temperatures).map((tool) => {
                if (
                  temperatures[tool].length == 0 ||
                  !isVisible(tool) ||
                  !isEditable(tool)
                )
                  return;
                return (
                  <Fragment>
                    {temperatures[tool].map((temp, index) => {
                      return (
                        <TemperatureInputControl
                          tool={tool}
                          index={index}
                          size={temperatures[tool].length}
                        />
                      );
                    })}
                  </Fragment>
                );
              })}
            </Fragment>
          )}
          {!hasTemp && (
            <div class="loading-panel">
              <div class="m-2">
                <div class="m-1">{T("P89")}</div>
                <Loading />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TemperaturesPanelElement = {
  id: "temperaturesPanel",
  content: <TemperaturesPanel />,
  name: "P29",
  icon: "Thermometer",
  show: "showtemperaturespanel",
  onstart: "opentemperaturesonstart",
};

export { TemperaturesPanel, TemperaturesPanelElement, TemperaturesControls };
