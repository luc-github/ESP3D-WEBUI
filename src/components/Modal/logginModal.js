/*
 logginModal.js - ESP3D WebUI component file

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
import { Lock } from "preact-feather";
import { PasswordInput } from "../Controls";
import { useUiContext } from "../../contexts";
import { useHttpQueue } from "../../hooks";
import { T } from "../../components/Translations";
import { espHttpURL } from "../../components/Helpers";

/*
 * Local const
 *
 */
const showLogin = () => {
  const { modals, connection } = useUiContext();
  const { createNewTopRequest, processRequestsNow } = useHttpQueue();
  const id = "login";
  const clickLogin = () => {
    const login = document.getElementById("login").value.trim();
    const password = document.getElementById("password").value.trim();
    const formData = new FormData();
    formData.append("SUBMIT", "YES");
    formData.append("USER", login);
    formData.append("PASSWORD", password);
    createNewTopRequest(
      espHttpURL("login").toString(),
      { method: "POST", id: id, body: formData },
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
    modals.removeModal(modals.getModalIndex(id));
    processRequestsNow();
  };
  const clickCancel = () => {
    modals.removeModal(modals.getModalIndex(id));
  };
  if (modals.getModalIndex(id) == -1)
    modals.addModal({
      id: id,
      title: (
        <div
          class="text-primary feather-icon-container"
          style="line-height:24px!important"
        >
          <Lock />
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

export { showLogin };
