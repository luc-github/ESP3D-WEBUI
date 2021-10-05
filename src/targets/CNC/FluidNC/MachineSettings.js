/*
 MachineSettings.js - ESP3D WebUI Target file

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
import { T } from "../../../components/Translations";
import { processor } from "./processor";
import { useHttpFn } from "../../../hooks";
import { useUiContext, useUiContextFn } from "../../../contexts";
import { Target } from "./index";
import {
  espHttpURL,
  disableUI,
  formatFileSizeToString,
} from "../../../components/Helpers";
import {
  Field,
  Loading,
  ButtonImg,
  CenterLeft,
  Progress,
} from "../../../components/Controls";
import {
  HelpCircle,
  XCircle,
  Flag,
  Download,
  CheckCircle,
} from "preact-feather";
import { CMD } from "./CMD-source";

let currentConfig = "";
let activeConfig = "";
const MachineSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { createNewRequest, abortRequest } = useHttpFn;
  const { modals, toasts, uisettings } = useUiContext();
  const [activeConfigFilename, setActiveConfigFilename] =
    useState(activeConfig);
  const id = "Machine Tab";

  const configFilesList = uisettings
    .getValue("configfilenames")
    .trim()
    .split(";")
    .reduce((acc, curr) => {
      if (curr.trim().length > 0)
        acc.push({ label: curr.trim(), value: curr.trim() });
      return acc;
    }, []);

  const sendSerialCmd = (cmd, updateUI) => {
    createNewRequest(
      espHttpURL("command", { cmd }).toString(),
      { method: "GET", echo: cmd },
      {
        onSuccess: (result) => {
          //Result is handled on ws so just do nothing
          if (updateUI) updateUI(result);
        },
        onFail: (error) => {
          console.log("Error:", error);
          setIsLoading(false);
          toasts.addToast({ content: error, type: "error" });
          processor.stopCatchResponse();
        },
      }
    );
  };

  const processFeedback = (feedback) => {
    if (feedback.status) {
      if (feedback.command == "configFileName") {
        activeConfig = feedback.content[0].split("=")[1];

        setActiveConfigFilename(activeConfig);
      }
      if (feedback.status == "error") {
        console.log("got error");
        currentConfig;
        toasts.addToast({
          content: T("S4"),
          type: "error",
        });
      }
    }
    setIsLoading(false);
  };

  const getConfigFileName = (e) => {
    if (e) e.target, blur();
    const response = CMD.command("configFileName");
    //send query
    if (
      processor.startCatchResponse("CMD", "configFileName", processFeedback)
    ) {
      setIsLoading(true);
      sendSerialCmd(response.cmd);
    }
  };

  const onCancel = (e) => {
    toasts.addToast({
      content: T("S175"),
      type: "error",
    });
    processor.stopCatchResponse();
    setIsLoading(false);
  };

  const onLoad = (e) => {
    if (e) e.target.blur();
    createNewRequest(
      espHttpURL(currentConfig).toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          console.log(result);
          setIsLoading(false);
        },
        onFail: (error) => {
          console.log(error);
          setIsLoading(false);
          toasts.addToast({ content: error, type: "error" });
        },
      }
    );
  };

  const onSet = (e) => {
    if (e) e.target.blur();
    sendSerialCmd("$Config/Filename=" + currentConfig);
  };

  useEffect(() => {
    if (activeConfig == "") {
      getConfigFileName();
    }
  }, []);

  const button = (
    <Fragment>
      <ButtonImg
        style="margin-left:5px; margin-right:5px"
        icon={<Download />}
        label={T("FL4")}
        tooltip
        data-tooltip={T("FL3")}
        onclick={onLoad}
      />

      <ButtonImg
        id="buttonSetConfigFileName"
        className={currentConfig && currentConfig.length > 0 ? "" : "d-none"}
        icon={<CheckCircle />}
        label={T("FL9")}
        tooltip
        data-tooltip={T("FL8")}
        onclick={onSet}
      />
    </Fragment>
  );

  return (
    <div class="container">
      <h4 class="show-low title">{Target}</h4>
      <div class="m-2" />
      <center>
        {isLoading && (
          <Fragment>
            <Loading class="m-2" />
            <ButtonImg
              donotdisable
              icon={<XCircle />}
              label={T("S28")}
              tooltip
              data-tooltip={T("S28")}
              onclick={onCancel}
            />
          </Fragment>
        )}
        {!isLoading && (
          <center>
            <span class="m-1">{T("FL6")}:</span>
            <span class="m-1 form-input d-inline">{activeConfigFilename}</span>
            <ButtonImg
              icon={<HelpCircle />}
              label={T("FL7")}
              tooltip
              data-tooltip={T("FL5")}
              onclick={getConfigFileName}
            />
            <div class="d-flex" style="justify-content:center">
              <Field
                type="select"
                label={T("FL2")}
                options={configFilesList}
                inline
                setValue={(value) => {
                  currentConfig = value ? value : currentConfig;
                  if (value && value.length > 0)
                    if (document.getElementById("buttonSetConfigFileName"))
                      document
                        .getElementById("buttonSetConfigFileName")
                        .classList.remove("d-none");
                }}
                value={currentConfig}
                button={button}
              />
            </div>
          </center>
        )}
      </center>
    </div>
  );
};

export { MachineSettings };
