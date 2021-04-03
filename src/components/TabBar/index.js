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
import { Target } from "../Targets";
import { useSettingsContext } from "../../contexts";
import { Eye, Tool } from "preact-feather";
import { ESP3DLogo } from "../../components/Images/logo";

/*
 * Local const
 *
 */
const defaultLinks = [
  {
    label: "S36",
    icon: <ESP3DLogo height="24px" />,
    href: "/settings/features",
  },
  { label: "S17", icon: <Eye />, href: "/settings/interface" },
  { label: Target, icon: <Tool />, href: "/settings/machine" },
];
const TabBar = () => {
  const { settings } = useSettingsContext();
  return (
    <ul class="tab tab-block">
      {defaultLinks &&
        defaultLinks.map(({ label, icon, href }) => (
          <li class="tab-item">
            <Link
              className={
                settings.current.connection.FWTarget == 0 &&
                href == "/settings/machine"
                  ? "d-none"
                  : "btn btn-link no-box feather-icon-container"
              }
              activeClassName="active"
              href={href}
            >
              {icon}
              <label class="hide-low">{T(label)}</label>
            </Link>
          </li>
        ))}
    </ul>
  );
};

export { TabBar };
