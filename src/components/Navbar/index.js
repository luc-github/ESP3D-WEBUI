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
import { ESP3DLogo } from "../Images/logo";
import { Link } from "../Router";
import { T } from "../Translations";
import { useSettingsContext } from "../../contexts";
import { useHttpQueue } from "../../hooks";
import { espHttpURL } from "../Helpers";

const defaultLinks = [
  {
    label: <ESP3DLogo bgcolor="#ffffff" />,
    href: "/about",
  },
  { label: "S13", href: "/dashboard" },
  { label: "S14", href: "/settings" },
];

/*
 * Local const
 *
 */
const Navbar = () => {
  const { settings } = useSettingsContext();
  const { createNewRequest } = useHttpQueue();
  if (settings.current.connection) {
    const onDisconnect = () => {
      const formData = new FormData();
      formData.append("DISCONNECT", "YES");
      createNewRequest(
        espHttpURL("login").toString(),
        { method: "POST", id: "login", body: formData },
        {
          onSuccess: (result) => {
            //TODO:Need to do something ? TBD
          },
          onFail: (error) => {
            //TODO:Need to do something ? TBD
          },
        }
      );
    };
    return (
      <header class="navbar">
        <section class="navbar-section">
          {defaultLinks &&
            defaultLinks.map(({ label, href }) => (
              <Link
                className={
                  href == "/about"
                    ? "navbar-brand logo no-box"
                    : settings.current.connection.FWTarget == 0 &&
                      href == "/dashboard"
                    ? "d-none"
                    : "btn btn-link no-box"
                }
                activeClassName="active"
                href={href}
              >
                {T(label)}
              </Link>
            ))}
        </section>
        <section class="navbar-section">
          <span
            className={
              settings.current.connection.Authentication == "Disabled"
                ? "d-none"
                : "btn btn-link no-box"
            }
            onClick={onDisconnect}
          >
            {T("S151")}
          </span>
        </section>
      </header>
    );
  }
};

export { Navbar };
