/*
 Navbar.js - ESP3D WebUI navigation bar file
 Original code inspiration : 2021 Alexandre Aussourd
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

const defaultLinks = [
  {
    label: <ESP3DLogo bgcolor="#ffffff" color="#5755d9" />,
    href: "/about",
  },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Settings", href: "/settings" },
];

const Navbar = () => {
  //TODO
  //if target FW is not defined:
  //1 -  set default route to settings
  //2 - do not show dashboard link
  //if target FW is defined :
  //1 = default route should be dashboard
  //2 - show dashboard element as well as extra items

  return (
    <header class="navbar">
      <section class="navbar-section">
        {defaultLinks &&
          defaultLinks.map(({ label, href }) => (
            <Link
              className={
                href == "/about" ? "navbar-brand logo" : "btn btn-link"
              }
              activeClassName="active"
              href={href}
            >
              {label}
            </Link>
          ))}
      </section>
    </header>
  );
};

export { Navbar };
