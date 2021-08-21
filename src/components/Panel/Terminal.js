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
import { useEffect, useRef } from "preact/hooks";
import { T } from "../Translations";
import { ChevronDown, Terminal, Send } from "preact-feather";
import { useUiContext, useDatasContext } from "../../contexts";
import { useTargetContext } from "../../targets";
import { useHttpQueue } from "../../hooks";
import { espHttpURL } from "../Helpers";
import { ButtonImg } from "../Controls";

/*
 * Local const
 *
 */
const TerminalPanel = () => {
  const { panels } = useUiContext();
  const { terminal } = useDatasContext();
  const { processData } = useTargetContext();
  const { createNewRequest } = useHttpQueue();
  const inputRef = useRef();
  const id = "terminalPanel";
  let inputHistoryIndex = terminal.inputHistory.length - 1;
  const onKeyUp = (e) => {
    switch (e.keyCode) {
      case 13:
        onSend(e);
        break;
      case 38: //prev
        if (terminal.inputHistory.length > 0 && inputHistoryIndex >= 0) {
          inputRef.current.value = terminal.inputHistory[inputHistoryIndex];
          terminal.input.current = inputRef.current.value;
          inputHistoryIndex--;
        }
        break;
      case 40: //next
        if (
          terminal.inputHistory.length > 0 &&
          inputHistoryIndex < terminal.inputHistory.length - 1
        ) {
          inputHistoryIndex++;
          inputRef.current.value = terminal.inputHistory[inputHistoryIndex];
          terminal.input.current = inputRef.current.value;
        } else {
          inputRef.current.value = "";
          terminal.input.current = inputRef.current.value;
        }
        break;
      default:
      //ignore
    }
  };
  const onSend = (e) => {
    inputRef.current.focus();
    if (terminal.input.current && terminal.input.current.trim().length > 0) {
      const cmd = terminal.input.current.trim();
      if (terminal.inputHistory[terminal.inputHistory.length - 1] != cmd) {
        terminal.addInputHistory(cmd);
      }

      inputHistoryIndex = terminal.inputHistory.length - 1;
      processData("echo", cmd);
      createNewRequest(
        espHttpURL("command", { cmd }).toString(),
        { method: "GET" },
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
    }
    terminal.input.current = "";
    inputRef.current.value = "";
  };
  const onInput = (e) => {
    terminal.input.current = e.target.value;
  };
  useEffect(() => {}, []);
  return (
    <div className="column col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-3 mb-2">
      <div class="panel mb-2 panel-dashboard">
        <div class="navbar">
          <span class="navbar-section feather-icon-container">
            <Terminal />
            <strong class="text-ellipsis">{T("Terminal")}</strong>
          </span>
          <span class="navbar-section">
            <span style="height: 100%;">
              <div class="dropdown dropdown-right">
                <span
                  class="dropdown-toggle btn btn-xs btn-header m-1"
                  tabindex="0"
                >
                  <ChevronDown size="0.8rem" />
                </span>

                <ul class="menu">
                  <li class="menu-item">
                    <div class="menu-entry">AutoScoll</div>
                  </li>
                  <li class="menu-item">
                    <div class="menu-entry">Verbose</div>
                  </li>
                  <li class="menu-item">
                    <div class="menu-entry">Clear</div>
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
        <div class="panel-body panel-body-dashboard">
          <div class="input-group mt-2">
            <input
              type="text"
              class="form-input"
              onInput={onInput}
              onkeyup={onKeyUp}
              ref={inputRef}
              value={terminal.input.current}
              placeholder={T("S80")}
            />
            <ButtonImg
              group
              ltooltip
              data-tooltip={T("S82")}
              label={T("S81")}
              icon={<Send />}
              onClick={onSend}
            />
          </div>
          <div class="terminal mt-2">
            {terminal.content &&
              terminal.content.map((line) => {
                let className = "";
                switch (line.type) {
                  case "echo":
                    className = "echo";
                    break;
                  case "error":
                    className = "error";
                    break;
                  default:
                  //do nothing
                }
                return <pre class={className}>{line.content}</pre>;
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

const TerminalPanelElement = {
  id: "terminalPanel",
  content: <TerminalPanel />,
  name: "S75",
  icon: "Terminal",
  show: "showterminalpanel",
  onstart: "openterminalonstart",
};

export { TerminalPanel, TerminalPanelElement };
