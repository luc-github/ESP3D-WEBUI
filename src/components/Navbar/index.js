/*
 Navbar.js - ESP3D WebUI navigation bar file


 Copyright (c) 2021 Luc Lebosse. All rights reserved.
 Original code inspiration : 2021 Alexandre Aussourd

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
import { useState } from "preact/hooks";
import { ESP3DLogo } from "../Images/logo";
import { Link } from "../Router";
import { T } from "../Translations";
import { useSettingsContext, useUiContext, useWsContext } from "../../contexts";
import { useHttpQueue } from "../../hooks";
import { espHttpURL } from "../Helpers";
import { confirmationModal } from "../Modal/confirmModal";
import { Server, Settings, LogOut } from "preact-feather";

const defaultLinks = [
  {
    label: <ESP3DLogo bgcolor="#ffffff" />,
    icon: null,
    href: "/about",
  },
  { label: "S13", icon: <Server />, href: "/dashboard" },
  { label: "S14", icon: <Settings />, href: "/settings" },
];

/*
 * Local const
 *
 */
const Navbar = () => {
  const { settings } = useSettingsContext();
  const { modals } = useUiContext();
  const { createNewRequest } = useHttpQueue();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { Disconnect } = useWsContext();
  const disconnectNow = () => {
    const formData = new FormData();
    formData.append("DISCONNECT", "YES");
    createNewRequest(
      espHttpURL("login").toString(),
      { method: "POST", id: "login", body: formData },
      {
        onSuccess: (result) => {
          Disconnect("sessiontimeout");
        },
        onFail: (error) => {
          Disconnect("sessiontimeout");
        },
      }
    );
  };
  if (showConfirmation) {
    const title = T("S26");
    const content = T("S152");
    const yes = T("S27");
    const cancel = T("S28");

    confirmationModal({
      modals,
      title,
      content,
      button1: { cb: disconnectNow, text: yes },
      button2: { text: cancel },
    });
    setShowConfirmation(false);
  }

  const onDisconnect = () => {
    setShowConfirmation(true);
  };

  if (settings.current.connection) {
    return (
      <header class="navbar">
        <section class="navbar-section">
          {defaultLinks &&
            defaultLinks.map(({ label, icon, href }) => (
              <Link
                className={
                  href == "/about"
                    ? "navbar-brand logo no-box "
                    : settings.current.connection.FWTarget == 0 &&
                      href == "/dashboard"
                    ? "d-none"
                    : "btn btn-link no-box feather-icon-container"
                }
                activeClassName="active"
                href={href}
              >
                {icon}
                <label class={href == "/about" ? "" : "hide-low"}>
                  {T(label)}
                </label>
              </Link>
            ))}
        </section>
        <section class="navbar-section">
          <span
            className={
              settings.current.connection.Authentication == "Disabled"
                ? "d-none"
                : "btn btn-link no-box mx-2 feather-icon-container"
            }
            onClick={onDisconnect}
          >
            <LogOut />
            <label class="hide-low">{T("S151")}</label>
          </span>
        </section>
      </header>
    );
  }
};

export { Navbar };
