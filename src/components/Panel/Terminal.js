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
import { useEffect, useRef, useState } from "preact/hooks";
import { T } from "../Translations";
import {
  ChevronDown,
  Terminal,
  Send,
  CheckCircle,
  Circle,
  PauseCircle,
} from "preact-feather";
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
  const { panels, uisettings } = useUiContext();
  const { terminal } = useDatasContext();
  const { processData } = useTargetContext();
  const { createNewRequest } = useHttpQueue();
  if (terminal.isVerbose.current == undefined)
    terminal.isVerbose.current = uisettings.getValue("verbose");
  if (terminal.isAutoScroll.current == undefined)
    terminal.isAutoScroll.current = uisettings.getValue("autoscroll");
  const [isVerbose, setIsVerbose] = useState(terminal.isVerbose.current);
  const [isAutoScroll, setIsAutoScroll] = useState(
    terminal.isAutoScroll.current
  );
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  let lastPos = 0;
  const inputRef = useRef();
  const messagesEndRef = useRef(null);
  const terminalOutput = useRef(null);
  const id = "terminalPanel";
  let inputHistoryIndex = terminal.inputHistory.length - 1;
  const scrollToBottom = () => {
    if (terminal.isAutoScroll.current && !terminal.isAutoScrollPaused.current) {
      terminalOutput.current.scrollTop = terminalOutput.current.scrollHeight;
    }
  };
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
  useEffect(() => {
    scrollToBottom();
  }, [terminal.content]);
  console.log("Terminal panel");
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
                    <div
                      class="menu-entry"
                      onclick={(e) => {
                        terminal.isVerbose.current = !isVerbose;
                        setIsVerbose(!isVerbose);
                      }}
                    >
                      <div class="menu-panel-item">
                        <span class="text-menu-item">{T("S76")}</span>
                        <span class="feather-icon-container">
                          {isVerbose ? (
                            <CheckCircle size="0.8rem" />
                          ) : (
                            <Circle size="0.8rem" />
                          )}
                        </span>
                      </div>
                    </div>
                  </li>
                  <li class="menu-item">
                    <div
                      class="menu-entry"
                      onclick={(e) => {
                        if (!isAutoScrollPaused) {
                          terminal.isAutoScroll.current = !isAutoScroll;
                          setIsAutoScroll(!isAutoScroll);
                        }
                        terminal.isAutoScrollPaused.current = false;
                        setIsAutoScrollPaused(false);
                        scrollToBottom();
                      }}
                    >
                      <div class="menu-panel-item">
                        <span class="text-menu-item">{T("S77")}</span>
                        <span class="feather-icon-container">
                          {isAutoScroll ? (
                            isAutoScrollPaused ? (
                              <PauseCircle size="0.8rem" />
                            ) : (
                              <CheckCircle size="0.8rem" />
                            )
                          ) : (
                            <Circle size="0.8rem" />
                          )}
                        </span>
                      </div>
                    </div>
                  </li>
                  <li class="divider" />
                  <li class="menu-item">
                    <div
                      class="menu-entry"
                      onclick={(e) => {
                        terminal.clear();
                      }}
                    >
                      <div class="menu-panel-item">
                        <span class="text-menu-item">{T("S79")}</span>
                        <span class="btn btn-clear" aria-label="Close" />
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
        <div class="input-group m-2">
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
        <div
          ref={terminalOutput}
          class="panel-body panel-body-dashboard terminal m-2"
          onScroll={(e) => {
            if (lastPos > e.target.scrollTop && terminal.isAutoScroll.current) {
              terminal.isAutoScrollPaused.current = true;
              setIsAutoScrollPaused(true);
            }
            if (
              terminal.isAutoScrollPaused.current &&
              Math.abs(
                e.target.scrollTop +
                  e.target.offsetHeight -
                  e.target.scrollHeight
              ) < 5
            ) {
              terminal.isAutoScrollPaused.current = false;
              setIsAutoScrollPaused(false);
            }
            lastPos = e.target.scrollTop;
          }}
        >
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
              if (isVerbose || isVerbose == line.isverboseOnly)
                return <pre class={className}>{line.content}</pre>;
            })}
          <div ref={messagesEndRef} />
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
