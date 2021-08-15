/*
 index.js - ESP3D WebUI areas file

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
import { h, Fragment } from "preact";
import { Menu } from "./menu";
import { Informations } from "./informations";
import { ConnectionContainer } from "./connection";
import { MainContainer } from "./main";
import { useUiContext } from "../contexts/UiContext";
import { useSettings, useHttpQueue } from "../hooks";
import { useEffect } from "preact/hooks";
import { showLogin, showKeepConnected } from "../components/Modal";
import { espHttpURL } from "../components/Helpers";
/*
 * Local const
 *
 */

const ViewContainer = () => {
  const { connection, dialogs } = useUiContext();
  if (dialogs.needLogin == true) {
    dialogs.setNeedLogin(false);
    showLogin();
  }
  if (dialogs.showKeepConnected == true) {
    dialogs.setShowKeepConnected(false);
    showKeepConnected();
  }
  if (
    connection.connectionState.connected &&
    connection.connectionState.authenticate &&
    !connection.connectionState.updating
  )
    return (
      <Fragment>
        <Menu />
        <Informations type="panel" />
        <MainContainer />
      </Fragment>
    );
  else {
    return <ConnectionContainer />;
  }
};

const ContentContainer = () => {
  const { getConnectionSettings, getInterfaceSettings } = useSettings();
  const { createNewRequest } = useHttpQueue();

  const processMessage = (eventMsg) => {
    if (eventMsg.data.type && eventMsg.data.content) {
      switch (eventMsg.data.type) {
        case "response":
          //TBD: if need real both way communication
          break;
        case "cmd":
          createNewRequest(
            espHttpURL("command", { cmd: eventMsg.data.content }).toString(),
            { method: "GET" },
            {
              onSuccess: (result) => {
                const iframeList = document.querySelectorAll(
                  "iframe.extensionContainer"
                );
                iframeList.forEach((element) => {
                  element.contentWindow.postMessage(
                    { type: "response", content: result },
                    "*"
                  );
                });
              },
              onFail: (error) => {
                console.log(error);
              },
            }
          );
          break;
        default:
          return;
      }
    }
  };

  useEffect(() => {
    //To init settings
    //to get language first
    getInterfaceSettings(null, getConnectionSettings);
    window.addEventListener("message", processMessage, false);
  }, []);
  return <ViewContainer />;
};

export { ContentContainer };
