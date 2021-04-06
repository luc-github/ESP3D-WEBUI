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
import { T } from "../components/Translations";
import { PasswordInput } from "../components/Controls";
import { espHttpURL } from "../components/Helpers";
import { HelpCircle, AlertCircle } from "preact-feather";

/*
 * Local const
 *
 */
const showLogin = () => {
  const { modals, connection } = useUiContext();
  const { createNewTopRequest, processRequestsNow } = useHttpQueue();
  const clickLogin = () => {
    const login = document.getElementById("login").value.trim();
    const password = document.getElementById("password").value.trim();
    const formData = new FormData();
    formData.append("SUBMIT", "YES");
    formData.append("USER", login);
    formData.append("PASSWORD", password);
    createNewTopRequest(
      espHttpURL("login").toString(),
      { method: "POST", id: "login", body: formData },
      {
        onSuccess: (result) => {
          window.location.reload();
        },
        onFail: (error) => {
          //TODO:Need to do something ? TBD
        },
      }
    );
    connection.setConnectionState({
      connected: connection.connectionState.connected,
      authenticate: false,
      page: "connecting",
    });
    modals.removeModal(modals.getModalIndex("login"));
    processRequestsNow();
  };
  const clickCancel = () => {
    modals.removeModal(modals.getModalIndex("login"));
  };
  modals.addModal({
    id: "login",
    title: (
      <div
        class="text-primary feather-icon-container"
        style="line-height:24px!important"
      >
        <AlertCircle />
        <label>{T("S145")}</label>
      </div>
    ),
    content: (
      <div class="form-horizontal">
        <div class="form-group">
          <label class="form-label text-primary p-2" for="login">
            {T("S146")}:
          </label>
          <input
            class="form-input"
            style="width:15rem"
            type="text"
            id="login"
            placeholder="admin/user"
          />
        </div>
        <div class="form-group">
          <label class="form-label text-primary p-2" for="password">
            {T("S147")}:
          </label>
          <PasswordInput id="password" />
        </div>
      </div>
    ),
    footer: (
      <div>
        <button class="btn mx-2" onClick={clickLogin}>
          {T("S148")}
        </button>
        <button class="btn mx-2" onClick={clickCancel}>
          {T("S28")}
        </button>
      </div>
    ),
    //overlay: true,
    hideclose: true,
  });
};

const showKeepConnected = () => {
  const { modals } = useUiContext();
  const { createNewRequest } = useHttpQueue();
  const clickKeepConnected = () => {
    createNewRequest(
      espHttpURL("command", { PING: "Yes" }).toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          //TODO:Need to do something ? TBD
        },
        onFail: (error) => {
          //TODO:Need to do something ? TBD
        },
      }
    );
    modals.removeModal(modals.getModalIndex("keepconnected"));
  };
  const clickCancel = () => {
    modals.removeModal(modals.getModalIndex("keepconnected"));
  };
  if (modals.getModalIndex("keepconnected") == -1)
    modals.addModal({
      id: "keepconnected",
      title: (
        <div
          class="text-primary feather-icon-container"
          style="line-height:24px!important"
        >
          <HelpCircle />
          <label>{T("S145")}</label>
        </div>
      ),
      content: T("S153"),
      footer: (
        <div>
          <button class="btn mx-2" onClick={clickKeepConnected}>
            {T("S27")}
          </button>
          <button class="btn mx-2" onClick={clickCancel}>
            {T("S28")}
          </button>
        </div>
      ),
      //overlay: true,
      hideclose: false,
    });
};

const ViewContainer = () => {
  const { connection, login, dialogs } = useUiContext();
  if (login.needLogin == true) {
    login.setNeedLogin(false);
    showLogin();
  }
  if (dialogs.showKeepConnected == true) {
    dialogs.setShowKeepConnected(false);
    showKeepConnected();
  }
  if (
    connection.connectionState.connected &&
    connection.connectionState.authenticate
  )
    return (
      <Fragment>
        <Menu />
        <Informations />
        <MainContainer />
      </Fragment>
    );
  else {
    return <ConnectionContainer />;
  }
};

const ContentContainer = () => {
  const { getConnectionSettings, getInterfaceSettings } = useSettings();

  useEffect(() => {
    //To init settings
    //to get language first
    getInterfaceSettings();
    //to get communication connection
    getConnectionSettings();
  }, []);
  return <ViewContainer />;
};

export { ContentContainer };
