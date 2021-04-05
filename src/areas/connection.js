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
import { useEffect, useState, useRef } from "preact/hooks";
import { useUiContext, useSettingsContext } from "../contexts";
import { Loading } from "../components/Spectre";
import { ESP3DLogo } from "../components/Images/logo";
import {
  Minus,
  HardDrive,
  Frown,
  AlertTriangle,
  Slash,
  Lock,
} from "preact-feather";
import { T } from "../components/Translations";
import { espHttpURL } from "../components/Helpers";

/*
 * Local const
 *
 */
const ConnectionContainer = () => {
  const { connection } = useUiContext();
  const { settings } = useSettingsContext();
  const timer = useRef(0);
  const timerCtrl = useRef(0);
  let contentIcon;
  let contentSubtitle;
  let contentTitle;
  let contentAction;
  let intervalTimer = 0;
  const sec = T("S114");

  if (
    !connection.connectionState.connected ||
    !connection.connectionState.authenticate
  ) {
    const onclick = (e) => {
      connection.setConnectionState({
        connected: false,
        authenticate: connection.connectionState.authenticate,
        page: "connecting",
      });
      window.location.href = espHttpURL().toString();
    };

    switch (connection.connectionState.page) {
      case "notauthenticated":
        contentTitle = T("S1"); //"Connection error"
        contentIcon = <Lock size="50px" />;
        contentSubtitle = T("S145"); //"Authentication required"
        document.title =
          (settings.current.connection
            ? settings.current.connection.Hostname
            : "ESP3D") +
          "(" +
          T("S22") +
          ")";
        contentAction = (
          <button class="btn" onClick={onclick}>
            {T("S11")}
          </button>
        );
        break;
      //No connection
      case "error":
        contentTitle = T("S1"); //"Connection error"
        contentIcon = <Frown size="50px" />;
        contentSubtitle = T("S5"); //"Cannot connect with board"
        document.title =
          (settings.current.connection
            ? settings.current.connection.Hostname
            : "ESP3D") +
          "(" +
          T("S22") +
          ")";
        contentAction = (
          <button class="btn" onClick={onclick}>
            {T("S8")}
          </button>
        );
        break;
      //Error connection lost
      case "connectionlost":
        contentTitle = T("S1"); //"Connection error"
        contentIcon = <AlertTriangle size="50px" />;
        contentSubtitle = T("S10"); //"Connection with board is lost"
        document.title =
          (settings.current.connection
            ? settings.current.connection.Hostname
            : "ESP3D") +
          "(" +
          T("S9") +
          ")";
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
        document.title =
          (settings.current.connection
            ? settings.current.connection.Hostname
            : "ESP3D") +
          "(" +
          T("S9") +
          ")";
        contentAction = (
          <button class="btn" onClick={onclick}>
            {T("S11")}
          </button>
        );
        break;
      default:
        document.title =
          (settings.current.connection
            ? settings.current.connection.Hostname
            : "ESP3D") +
          "(" +
          T("S2") +
          ")";
        contentTitle = T("S2"); //"Connecting";
        contentIcon = (
          <div class="d-inline-block" style="padding:0 20px">
            <Loading large />
          </div>
        );
        contentSubtitle = T("S60"); //"Please wait..."
        contentAction = "";
    }
    useEffect(() => {
      clearInterval(intervalTimer);
      if (connection.connectionState.timer) {
        timer.current = connection.connectionState.timer;
        timerCtrl.current.innerHTML = timer.current + sec;
        intervalTimer = setInterval(() => {
          if (timer.current > 0) {
            timer.current--;
            timerCtrl.current.innerHTML = timer.current + sec;
          } else {
            clearInterval(intervalTimer);
            timerCtrl.current.innerHTML = "";
          }
        }, 1000);
      }
    }, []);
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
          <div class="empty-subtitle">
            {contentSubtitle}
            <span ref={timerCtrl}></span>
          </div>
          <div class="empty-action">{contentAction}</div>
        </div>
      </div>
    );
  }
};

export { ConnectionContainer };
