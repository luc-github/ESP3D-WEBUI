/*
 connection.js - ESP3D WebUI area file

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
import { h } from "preact";
import { useUiContext } from "../contexts/UiContext";
import { Loading } from "../components/Spectre";
import { ESP3DLogo } from "../components/Images/logo";
import { Minus, HardDrive, Frown, AlertTriangle, Slash } from "preact-feather";

//TODO add translations for previously connected page (1-2-3)

/*
 * Local const
 *
 */
const ConnectionContainer = () => {
  const { connection } = useUiContext();
  let contentTitle;
  let contentIcon;
  let contentSubtitle;
  let contentAction;

  if (!connection.connectionState.connected) {
    const onclick = (e) => {
      connection.setConnectionState({ connected: false, page: 0 });
      window.location.reload();
    };
    switch (connection.connectionState.page) {
      //No connection
      case 1:
        contentTitle = "Connection failed";
        contentIcon = <Frown size="50px" />;
        contentSubtitle = "Cannot communicate with ESP3D";
        contentAction = (
          <button class="btn" onClick={onclick}>
            Retry
          </button>
        );
        break;
      //Error connection lost
      case 2:
        contentTitle = "Connection lost";
        contentIcon = <AlertTriangle size="50px" />;
        contentSubtitle = "Communication with ESP3D lost";
        contentAction = (
          <button class="btn" onClick={onclick}>
            Connect again
          </button>
        );
        break;
      //Disconnected
      case 3:
        contentTitle = "Disconnected";
        contentIcon = <Slash size="50px" />;
        contentSubtitle =
          "You are connected from another location, this page is now disconnected";
        contentAction = (
          <button class="btn" onClick={onclick}>
            Connect again
          </button>
        );
        break;
      default:
        contentTitle = "Connecting";
        contentIcon = (
          <div class="d-inline-block" style="padding:0 20px">
            <Loading large />
          </div>
        );
        contentSubtitle = "Wait...";
        contentAction = "";
    }
    return (
      <div class="empty fullscreen">
        <div class="centered text-primary">
          <div class="empty-icon">
            <div class="d-flex p-centered" style="flex-wrap:nowrap!important">
              <ESP3DLogo />
              <Minus size="50px" />
              {contentIcon}
              <Minus size="50px" />
              <HardDrive size="50px" />
            </div>
          </div>
          <div class="empty-title h5">{contentTitle}</div>
          <div class="empty-subtitle">{contentSubtitle}</div>
          <div class="empty-action">{contentAction}</div>
        </div>
      </div>
    );
  }
};

export { ConnectionContainer };
