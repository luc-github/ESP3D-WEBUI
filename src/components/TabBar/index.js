/*
TabNar.js - ESP3D WebUI Tabs bar file

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
import { Link } from "../Router";
import { T } from "../Translations";
import { Target } from "TargetPath";

const defaultLinks = [
  {
    label: "S36",
    href: "/settings/features",
  },
  { label: "S17", href: "/settings/interface" },
  { label: Target, href: "/settings/machine" },
];
const TabBar = () => {
  //Todo : Hide Fw tab is no target FW defined
  return (
    <ul class="tab tab-block">
      {defaultLinks &&
        defaultLinks.map(({ label, href }) => (
          <li class="tab-item">
            <Link
              className="btn btn-link no-box"
              activeClassName="active"
              href={href}
            >
              {T(label)}
            </Link>
          </li>
        ))}
    </ul>
  );
};

export { TabBar };
