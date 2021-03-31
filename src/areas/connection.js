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
import { useUiContext } from "../contexts";
import { Loading } from "../components/Spectre";
import { ESP3DLogo } from "../components/Images/logo";
import { Minus, HardDrive, Frown, AlertTriangle, Slash } from "preact-feather";
import { T } from "../components/Translations";
import { espHttpURL } from "../components/Helpers";

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
      connection.setConnectionState({ connected: false, page: "connecting" });
      window.location.href = espHttpURL().toString();
    };
    if (connection.connectionState.page != "connecting") {
      document.title =
        document.title.replace("(" + T("S9") + ")", "") + "(" + T("S9") + ")";
    }
    switch (connection.connectionState.page) {
      //No connection
      case "error":
        contentTitle = T("S1"); //"Connection error"
        contentIcon = <Frown size="50px" />;
        contentSubtitle = T("S5"); //"Cannot connect with board"
        contentAction = (
          <button class="btn" onClick={onclick}>
            {T("S8")}
          </button>
        );
        break;
      //Error connection lost
      case "connection lost":
        contentTitle = T("S1"); //"Connection error"
        contentIcon = <AlertTriangle size="50px" />;
        contentSubtitle = T("S10"); //"Connection with board is lost"
        contentAction = (
          <button class="btn" onClick={onclick}>
            {T("S11")}
          </button>
        );
        break;
      //Disconnected
      case "already connected":
        contentTitle = T("S9");
        contentIcon = <Slash size="50px" />;
        contentSubtitle = T("S3");
        contentAction = (
          <button class="btn" onClick={onclick}>
            {T("S11")}
          </button>
        );
        break;
      default:
        contentTitle = T("S2"); //"Connecting";
        contentIcon = (
          <div class="d-inline-block" style="padding:0 20px">
            <Loading large />
          </div>
        );
        contentSubtitle = T("S60"); //"Please wait..."
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
