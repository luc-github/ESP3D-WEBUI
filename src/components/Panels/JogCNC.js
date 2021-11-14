/*
Jog.js - ESP3D WebUI component file

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
import {
  AlertCircle,
  Move,
  Crosshair,
  Home,
  ZapOff,
  ChevronDown,
  CheckCircle,
  Circle,
  HelpCircle,
  Edit3,
} from "preact-feather";
import { useHttpFn } from "../../hooks";
import { espHttpURL } from "../Helpers";
import { useUiContext, useUiContextFn } from "../../contexts";
import { T } from "../Translations";
import { Button, ButtonImg, CenterLeft } from "../Controls";
import { useEffect, useState } from "preact/hooks";
import { showModal } from "../Modal";
import { useTargetContext } from "../../targets";

let currentFeedRate = [];
let jogDistance = 100;
let currentButtonPressed;
let enable_keyboard_jog = false;
let keyboard_listener = false;
let jog_keyboard_listener = false;

/*
 * Local const
 *
 */
//A separate control to avoid the full panel to be updated when the positions are updated
const PositionsControls = () => {
  const { positions } = useTargetContext();
  return (
    <Fragment>
      <div class="jog-positions-ctrls m-1">
        {typeof positions.x != "undefined" && useUiContextFn.getValue("showx") && (
          <div class="jog-position-ctrl">
            <div class="jog-position-header">MPos X</div>
            <div class="m-1 jog-position-value">{positions.x}</div>
            {typeof positions.wx != "undefined" && (
              <Fragment>
                <div class="jog-position-sub-header">WPos X</div>
                <div class="m-1 jog-position-value">{positions.wx}</div>
              </Fragment>
            )}
          </div>
        )}
        {typeof positions.y != "undefined" && useUiContextFn.getValue("showy") && (
          <div class="jog-position-ctrl">
            <div class="jog-position-header">MPos Y</div>
            <div class="m-1 jog-position-value">{positions.y}</div>
            {typeof positions.wy != "undefined" && (
              <Fragment>
                <div class="jog-position-sub-header">WPos Y</div>
                <div class="m-1 jog-position-value">{positions.wy}</div>
              </Fragment>
            )}
          </div>
        )}
        {typeof positions.z != "undefined" && useUiContextFn.getValue("showz") && (
          <div class="jog-position-ctrl">
            <div class="jog-position-header">MPos Z</div>
            <div class="m-1 jog-position-value">{positions.z}</div>
            {typeof positions.wz != "undefined" && (
              <Fragment>
                <div class="jog-position-sub-header">WPos Z</div>
                <div class="m-1 jog-position-value">{positions.wz}</div>
              </Fragment>
            )}
          </div>
        )}
      </div>
      {typeof positions.a != "undefined" && useUiContextFn.getValue("showa") && (
        <div class="jog-positions-ctrls m-1">
          {typeof positions.a != "undefined" && (
            <div class="jog-position-ctrl">
              <div class="jog-position-header">MPos A</div>
              <div class="m-1 jog-position-value">{positions.a}</div>
              {typeof positions.wa != "undefined" && (
                <Fragment>
                  <div class="jog-position-sub-header">WPos A</div>
                  <div class="m-1 jog-position-value">{positions.wa}</div>
                </Fragment>
              )}
            </div>
          )}
          {typeof positions.b != "undefined" &&
            useUiContextFn.getValue("showb") && (
              <div class="jog-position-ctrl">
                <div class="jog-position-header">MPos B</div>
                <div class="m-1 jog-position-value">{positions.b}</div>
                {typeof positions.wb != "undefined" && (
                  <Fragment>
                    <div class="jog-position-sub-header">WPos B</div>
                    <div class="m-1 jog-position-value">{positions.wb}</div>
                  </Fragment>
                )}
              </div>
            )}
          {typeof positions.c != "undefined" &&
            useUiContextFn.getValue("showc") && (
              <div class="jog-position-ctrl">
                <div class="jog-position-header">MPos C</div>
                <div class="m-1 jog-position-value">{positions.C}</div>
                {typeof positions.wc != "undefined" && (
                  <Fragment>
                    <div class="jog-position-sub-header">WPos C</div>
                    <div class="m-1 jog-position-value">{positions.wc}</div>
                  </Fragment>
                )}
              </div>
            )}
        </div>
      )}
    </Fragment>
  );
};

const JogPanel = () => {
  const { modals, toasts, panels } = useUiContext();

  const { createNewRequest } = useHttpFn;
  const [isKeyboardEnabled, setIsKeyboardEnabled] =
    useState(enable_keyboard_jog);

  const id = "jogPanel";
  console.log(id);

  //Send a request to the ESP
  const SendCommand = (command) => {
    createNewRequest(
      espHttpURL("command", { cmd: command }).toString(),
      { method: "GET", echo: command },
      {
        onSuccess: (result) => {},
        onFail: (error) => {
          toasts.addToast({ content: error, type: "error" });
          console.log(error);
        },
      }
    );
  };

  //Click button defined by id
  const clickBtn = (id) => {
    if (document.getElementById(id)) {
      document.getElementById(id).click();
    }
  };

  //Send Home command
  const sendHomeCommand = (axis) => {
    const cmd = useUiContextFn.getValue("homecmd").replace("#", axis);
    SendCommand(cmd);
  };

  //Send Zero command
  const sendZeroCommand = (axis) => {
    const cmd = useUiContextFn.getValue("zerocmd").replace("#", axis);
    SendCommand(cmd);
  };

  //mouse down event
  const onMouseDown = (id) => {
    currentButtonPressed = id;
    if (document.getElementById(id)) {
      const list_item = document
        .getElementById(id)
        .querySelector(id == "posz" ? ".movez" : ".std");
      if (list_item) {
        list_item.classList.add("pressedbutton");
        list_item.classList.remove(id == "posz" ? "movez" : "std");
      }
    }
  };

  //keyboard listener handler
  const keyboardEventHandler = (e) => {
    if (!jog_keyboard_listener) return;
    if (e.key == "ArrowUp") {
      clickBtn("btn+X");
    } else if (e.key == "ArrowDown") {
      clickBtn("btn-X");
    } else if (e.key == "ArrowLeft") {
      clickBtn("btn-Y");
    } else if (e.key == "ArrowRight") {
      clickBtn("btn+Y");
    } else if (e.key == "PageUp") {
      clickBtn("btn+Z");
    } else if (e.key == "PageDown") {
      clickBtn("btn-Z");
    } else if (e.key == "x" || e.key == "X") {
      clickBtn("btnHX");
    } else if (e.key == "y" || e.key == "Y") {
      clickBtn("btnHY");
    } else if (e.key == "z" || e.key == "Z") {
      clickBtn("btnHZ");
    } else if (e.key == "End") {
      clickBtn("btnMoveZ");
    } else if (e.key == "m" || e.key == "M") {
      clickBtn("btnMotorOff");
    } else if (e.key == "P" || e.key == "p") {
      clickBtn("btnMoveXY");
    } else if (e.key == "Home") {
      clickBtn("btnHXYZ");
    } else if (e.key == "Delete") {
      clickBtn("btnEStop");
    } else if (e.key == "1") {
      clickBtn("move_100");
    } else if (e.key == "2") {
      clickBtn("move_10");
    } else if (e.key == "3") {
      clickBtn("move_1");
    } else if (e.key == "4") {
      clickBtn("move_0_1");
    } else console.log(e.key);
  };

  //Add keyboard listener
  //TODO: find a better way to remove listener as it is not working currently
  function AddKeyboardListener() {
    //hack to track keyboard is enabled or not
    jog_keyboard_listener = true;
    //hack to avoid multiple listeners as removeEventListener is not working
    if (keyboard_listener) return;
    keyboard_listener = true;
    document.addEventListener("keydown", keyboardEventHandler, true);
  }

  //Remove keyboard listener
  //TODO: find a better way to remove listener as it is not working currently
  function RemoveKeyboardListener() {
    //hack to track keyboard is enabled or not because removeEventListener is not working
    if (keyboard_listener) {
      jog_keyboard_listener = false;
      document.removeEventListener("keydown", keyboardEventHandler, true);
    }
  }

  //Send jog command
  const sendJogCommand = (axis, id, distance) => {
    let movement;
    let feedrate =
      axis.startsWith("X") || axis.startsWith("Y")
        ? currentFeedRate["XY"]
        : currentFeedRate[axis[0]];
    if (distance) movement = axis + distance;
    else movement = axis + jogDistance;
    let cmd = "G91\nG1 " + movement + " F" + feedrate + "\nG90";
    if (id && currentButtonPressed != id) return;
    SendCommand(cmd);
  };

  //click distance button
  const onCheck = (e, distance) => {
    e.target.blur();
    jogDistance = distance;
  };

  //Set the current feedrate for axis
  const setFeedrate = (axis) => {
    let value = currentFeedRate[axis];
    let t;
    switch (axis) {
      case "XY":
        t = T("CN2");
        break;
      case "Z":
        t = T("CN3");
        break;
      case "A":
        t = T("CN4");
        break;
      case "B":
        t = T("CN5");
        break;
      case "C":
        t = T("CN6");
        break;
    }
    showModal({
      modals,
      title: t,
      button2: { text: T("S28") },
      button1: {
        cb: () => {
          if (value.length > 0.1) currentFeedRate[axis] = value;
        },
        text: T("S43"),
        id: "applyFrBtn",
      },
      icon: <Edit3 />,
      id: "inputFeedrate",
      content: (
        <Fragment>
          <div>{t}</div>
          <input
            class="form-input"
            type="number"
            step="0.1"
            value={value}
            onInput={(e) => {
              value = e.target.value.trim();
              if (value < 0.1) {
                if (document.getElementById("applyFrBtn")) {
                  document.getElementById("applyFrBtn").disabled = true;
                }
              } else {
                if (document.getElementById("applyFrBtn")) {
                  document.getElementById("applyFrBtn").disabled = false;
                }
              }
            }}
          />
        </Fragment>
      ),
    });
  };

  //Show keyboard mapped keys
  const showKeyboarHelp = () => {
    const helpKeyboardJog = (
      <CenterLeft>
        {T("CN15")
          .split(",")
          .map((e) => {
            return <div>{e}</div>;
          })}
      </CenterLeft>
    );
    showModal({
      modals,
      title: T("P81"),
      button1: {
        text: T("S24"),
      },
      icon: <HelpCircle />,
      content: helpKeyboardJog,
    });
  };

  useEffect(() => {
    if (!currentFeedRate["XY"])
      currentFeedRate["XY"] = useUiContextFn.getValue("xyfeedrate");
    if (!currentFeedRate["Z"])
      currentFeedRate["Z"] = useUiContextFn.getValue("zfeedrate");
    if (!currentFeedRate["A"])
      currentFeedRate["A"] = useUiContextFn.getValue("afeedrate");
    if (!currentFeedRate["B"])
      currentFeedRate["B"] = useUiContextFn.getValue("bfeedrate");
    if (!currentFeedRate["C"])
      currentFeedRate["C"] = useUiContextFn.getValue("cfeedrate");
    if (enable_keyboard_jog) {
      AddKeyboardListener();
      jog_keyboard_listener = true;
    }
    return () => {
      RemoveKeyboardListener();
    };
  }, []);
  return (
    <div
      id={id}
      className="column col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-3 mb-2"
    >
      <div class="panel mb-2 panel-dashboard">
        <div class="navbar">
          <span class="navbar-section feather-icon-container">
            <Move />
            <strong class="text-ellipsis">{T("jog")}</strong>
          </span>
          <span class="navbar-section">
            <span class="H-100">
              <div class="dropdown dropdown-right">
                <span
                  class="dropdown-toggle btn btn-xs btn-header m-1"
                  tabindex="0"
                >
                  <ChevronDown size="0.8rem" />
                </span>

                <ul class="menu">
                  {(useUiContextFn.getValue("showx") ||
                    useUiContextFn.getValue("showy")) && (
                    <li class="menu-item">
                      <div
                        class="menu-entry"
                        onclick={(e) => {
                          setFeedrate("XY");
                        }}
                      >
                        <div class="menu-panel-item">
                          <span class="text-menu-item">{T("CN2")}</span>
                        </div>
                      </div>
                    </li>
                  )}
                  {useUiContextFn.getValue("showz") && (
                    <li class="menu-item">
                      <div
                        class="menu-entry"
                        onclick={(e) => {
                          setFeedrate("Z");
                        }}
                      >
                        <div class="menu-panel-item">
                          <span class="text-menu-item">{T("CN3")}</span>
                        </div>
                      </div>
                    </li>
                  )}

                  {useUiContextFn.getValue("showa") && (
                    <li class="menu-item">
                      <div
                        class="menu-entry"
                        onclick={(e) => {
                          setFeedrate("A");
                        }}
                      >
                        <div class="menu-panel-item">
                          <span class="text-menu-item">{T("CN4")}</span>
                        </div>
                      </div>
                    </li>
                  )}
                  {useUiContextFn.getValue("showz") && (
                    <li class="menu-item">
                      <div
                        class="menu-entry"
                        onclick={(e) => {
                          setFeedrate("B");
                        }}
                      >
                        <div class="menu-panel-item">
                          <span class="text-menu-item">{T("CN5")}</span>
                        </div>
                      </div>
                    </li>
                  )}
                  {useUiContextFn.getValue("showz") && (
                    <li class="menu-item">
                      <div
                        class="menu-entry"
                        onclick={(e) => {
                          setFeedrate("C");
                        }}
                      >
                        <div class="menu-panel-item">
                          <span class="text-menu-item">{T("CN6")}</span>
                        </div>
                      </div>
                    </li>
                  )}
                  <li class="divider" />
                  <li class="menu-item">
                    <div
                      class="menu-entry"
                      onclick={(e) => {
                        enable_keyboard_jog = !enable_keyboard_jog;
                        setIsKeyboardEnabled(enable_keyboard_jog);
                        if (enable_keyboard_jog) {
                          AddKeyboardListener();
                        } else {
                          RemoveKeyboardListener();
                        }
                      }}
                    >
                      <div class="menu-panel-item">
                        <span class="text-menu-item">{T("CN7")}</span>
                        <span class="feather-icon-container">
                          {isKeyboardEnabled ? (
                            <CheckCircle size="0.8rem" />
                          ) : (
                            <Circle size="0.8rem" />
                          )}
                        </span>
                      </div>
                    </div>
                  </li>
                  <li class="menu-item">
                    <div class="menu-entry" onclick={showKeyboarHelp}>
                      <div class="menu-panel-item">
                        <span class="text-menu-item">{T("CN14")}</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <span
                class="btn btn-clear btn-close m-1"
                aria-label="Close"
                onclick={(e) => {
                  panels.hide(id);
                }}
              />
            </span>
          </span>
        </div>
        <div class="m-1 jog-container">
          <PositionsControls />
          <div class="m-1">
            <div class="job-buttons-main-container">
              <div class="m-1 jog-buttons-container">
                <Button
                  m2
                  tooltip
                  data-tooltip={T("CN12")}
                  id="btn+X"
                  onclick={(e) => {
                    e.target.blur();
                    sendJogCommand("X+");
                  }}
                >
                  +X
                </Button>
                <Button
                  m2
                  tooltip
                  data-tooltip={T("CN10")}
                  id="btnHX"
                  onclick={(e) => {
                    e.target.blur();
                    sendHomeCommand("X");
                  }}
                >
                  <Home size="1rem" />
                  <span class="text-tiny">x</span>
                </Button>
                <Button
                  m2
                  tooltip
                  data-tooltip={T("CN19")}
                  onclick={(e) => {
                    e.target.blur();
                    sendZeroCommand("X");
                  }}
                >
                  &Oslash;
                  <span class="text-tiny">x</span>
                </Button>
                <Button
                  m2
                  tooltip
                  data-tooltip={T("CN13")}
                  id="btn-X"
                  onclick={(e) => {
                    e.target.blur();
                    sendJogCommand("X-");
                  }}
                >
                  -X
                </Button>
              </div>
              <div class="m-1 jog-buttons-container">
                <Button
                  m2
                  tooltip
                  data-tooltip={T("CN12")}
                  id="btn+Y"
                  onclick={(e) => {
                    e.target.blur();
                    sendJogCommand("Y+");
                  }}
                >
                  +Y
                </Button>
                <Button
                  m2
                  tooltip
                  data-tooltip={T("CN10")}
                  id="btnHY"
                  onclick={(e) => {
                    e.target.blur();
                    sendHomeCommand("Y");
                  }}
                >
                  <Home size="1rem" />
                  <span class="text-tiny">y</span>
                </Button>
                <Button
                  m2
                  tooltip
                  data-tooltip={T("CN19")}
                  onclick={(e) => {
                    e.target.blur();
                    sendZeroCommand("Y");
                  }}
                >
                  &Oslash;
                  <span class="text-tiny">y</span>
                </Button>
                <Button
                  m2
                  tooltip
                  data-tooltip={T("CN13")}
                  id="btn-Y"
                  onclick={(e) => {
                    e.target.blur();
                    sendJogCommand("Y-");
                  }}
                >
                  -Y
                </Button>
              </div>

              <div class="m-1 jog-buttons-container">
                <Button
                  m2
                  tooltip
                  data-tooltip={T("CN12")}
                  id="btn+Z"
                  onclick={(e) => {
                    e.target.blur();
                    sendJogCommand("Z+");
                  }}
                >
                  +Z
                </Button>
                <Button
                  m2
                  tooltip
                  data-tooltip={T("CN10")}
                  id="btnHZ"
                  onclick={(e) => {
                    e.target.blur();
                    sendHomeCommand("Z");
                  }}
                >
                  <Home size="1rem" />
                  <span class="text-tiny">z</span>
                </Button>
                <Button
                  m2
                  tooltip
                  data-tooltip={T("CN19")}
                  onclick={(e) => {
                    e.target.blur();
                    sendZeroCommand("Z");
                  }}
                >
                  &Oslash;
                  <span class="text-tiny">z</span>
                </Button>
                <Button
                  m2
                  tooltip
                  data-tooltip={T("CN13")}
                  id="btn-Z"
                  onclick={(e) => {
                    e.target.blur();
                    sendJogCommand("Z-");
                  }}
                >
                  -Z
                </Button>
              </div>
              <div class="m-1 p-2 jog-buttons-container">
                <div class="btn-group jog-distance-selector-container">
                  <center class="jog-distance-selector-header">mm</center>

                  <div
                    class="flatbtn tooltip tooltip-left"
                    data-tooltip={T("CN18")}
                  >
                    <input
                      type="radio"
                      id="move_100"
                      name="select_distance"
                      value="100"
                      checked={jogDistance == 100}
                      onclick={(e) => onCheck(e, 100)}
                    />
                    <label for="move_100">100</label>
                  </div>
                  <div
                    class="flatbtn tooltip tooltip-left"
                    data-tooltip={T("CN18")}
                  >
                    <input
                      type="radio"
                      id="move_50"
                      name="select_distance"
                      value="50"
                      checked={jogDistance == 50}
                      onclick={(e) => onCheck(e, 50)}
                    />
                    <label for="move_50">50</label>
                  </div>
                  <div
                    class="flatbtn tooltip tooltip-left"
                    data-tooltip={T("CN18")}
                  >
                    <input
                      type="radio"
                      id="move_10"
                      name="select_distance"
                      value="10"
                      checked={jogDistance == 10}
                      onclick={(e) => onCheck(e, 10)}
                    />
                    <label for="move_10">10</label>
                  </div>
                  <div
                    class="flatbtn tooltip tooltip-left"
                    data-tooltip={T("CN18")}
                  >
                    <input
                      type="radio"
                      id="move_1"
                      name="select_distance"
                      value="1"
                      checked={jogDistance == 1}
                      onclick={(e) => onCheck(e, 1)}
                    />
                    <label for="move_1">1</label>
                  </div>
                  <div
                    class="flatbtn tooltip tooltip-left"
                    data-tooltip={T("CN18")}
                  >
                    <input
                      type="radio"
                      id="move_0_1"
                      name="select_distance"
                      value="0.1"
                      checked={jogDistance == 0.1}
                      onclick={(e) => onCheck(e, 0.1)}
                    />
                    <label class="last-button" for="move_0_1">
                      0.1
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="jog-extra-buttons-container">
            <Button
              m1
              tooltip
              data-tooltip={T("CN20")}
              onclick={(e) => {
                e.target.blur();
                sendHomeCommand("");
              }}
            >
              <Home />
            </Button>
            <Button
              m1
              tooltip
              data-tooltip={T("CN20")}
              onclick={(e) => {
                e.target.blur();
                sendZeroCommand("");
              }}
            >
              &Oslash;
            </Button>
          </div>

          <div class="jog-extra-buttons-container" style="margin-right:8px">
            <ButtonImg
              m1
              tooltip
              label={T("P13")}
              data-tooltip={T("P13")}
              icon={<ZapOff />}
              id="btnMotorOff"
              onclick={(e) => {
                const cmd = useUiContextFn.getValue("homesingleaxis");
                console.log(cmd);
              }}
            />
            <Button
              m1
              error
              tooltip
              label={<Fragment>&oslash;</Fragment>}
              showlow
              data-tooltip={<Fragment>&oslash;</Fragment>}
              id="btnEStop"
              onclick={(e) => {
                e.target.blur();
                const cmd = useUiContextFn
                  .getValue("emergencystop")
                  .replace(";", "\n");
                SendCommand(cmd);
              }}
            >
              <Fragment>&Oslash; z</Fragment>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const JogPanelElement = {
  id: "jogPanel",
  content: <JogPanel />,
  name: "jog",
  icon: "Move",
  show: "showjogpanel",
  onstart: "openjogonstart",
};

export { JogPanel, JogPanelElement, PositionsControls };
