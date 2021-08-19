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
import { Fragment, h } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { ESP3DLogo, iconsList } from "../Images";
import { Link } from "../Router";
import { T } from "../Translations";
import {
  useSettingsContext,
  useUiContext,
  useWsContext,
  useRouterContext,
} from "../../contexts";
import { useHttpQueue } from "../../hooks";
import { espHttpURL } from "../Helpers";
import { showConfirmationModal } from "../Modal";
import {
  Server,
  Settings,
  Activity,
  LogOut,
  Trello,
  ChevronDown,
} from "preact-feather";

/*
 * Local const
 *
 */
const defaultLinks = [
  {
    label: <ESP3DLogo bgcolor="#ffffff" />,
    icon: null,
    href: "/about",
  },
  { label: "S123", icon: <Activity />, href: "/informations" },
  {
    label: "S13",
    icon: <Server />,
    href: "/dashboard",
    id: "dashboardLink",
  },
  {
    label: "S14",
    icon: <Settings />,
    href: "/settings",
    id: "settingsLink",
  },
];

const Navbar = () => {
  const { connectionSettings } = useSettingsContext();
  const { defaultRoute, activeRoute } = useRouterContext();
  const { modals, uisettings } = useUiContext();
  const { createNewRequest } = useHttpQueue();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { Disconnect } = useWsContext();
  const buttonExtraPage = useRef();
  const menuExtraPage = useRef();
  const buttontext = T("S155");
  const [textbutton, setTextButton] = useState(
    <Fragment>
      <Trello />
      <label class="hide-low">{buttontext}</label>
    </Fragment>
  );

  function onResize() {
    //if infopage is visible but we are not in mobile view
    if (
      document.getElementById("infopage") &&
      document.getElementById("infopage").clientWidth == 0
    ) {
      //we should not be there so move to another page
      document
        .getElementById(
          defaultRoute.current == "/dashboard"
            ? "dashboardLink"
            : "settingsLink"
        )
        .click();
    }
  }
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
  const menuLinks = [];
  if (uisettings.current) {
    if (uisettings.getValue("showextrapanels")) {
      const extraPanels = uisettings.getValue("extrapanels");

      const extraPages = extraPanels.reduce((acc, curr) => {
        const item = curr.value.reduce((accumulator, current) => {
          accumulator[current.name] = current.initial;
          return accumulator;
        }, {});

        if (item.target == "page") {
          const pageIcon = iconsList[item.icon] ? iconsList[item.icon] : "";
          acc.push({
            label: item.name,
            icon: pageIcon,
            href: "/#/extrapage/" + curr.id,
            id: curr.id,
          });
        }

        return acc;
      }, []);
      menuLinks.push(...extraPages);
    }
  }
  useEffect(() => {
    new ResizeObserver(onResize).observe(document.getElementById("app"));
  }, []);

  useEffect(() => {
    if (activeRoute.includes("extrapage")) {
      if (buttonExtraPage.current)
        buttonExtraPage.current.classList.add("active");
      menuLinks.map(({ label, icon, href, id }) => {
        if (href.includes(activeRoute))
          setTextButton(
            <Fragment>
              {icon}
              <label class="hide-low">{label}</label>
            </Fragment>
          );
      });
    }
  }, [activeRoute]);

  if (showConfirmation) {
    const title = T("S26");
    const content = T("S152");
    const yes = T("S27");
    const cancel = T("S28");

    showConfirmationModal({
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

  if (uisettings.current) {
    return (
      <header class="navbar">
        <section class="navbar-section">
          {defaultLinks &&
            defaultLinks.map(({ label, icon, href, id }) => {
              return (
                <Link
                  onclick={(e) => {
                    setTextButton(
                      <Fragment>
                        <Trello />
                        <label class="hide-low">{buttontext}</label>
                      </Fragment>
                    );
                    if (buttonExtraPage.current)
                      buttonExtraPage.current.classList.remove("active");
                  }}
                  id={id}
                  className={
                    href == "/about"
                      ? "navbar-brand logo no-box "
                      : connectionSettings.current.FWTarget == 0 &&
                        href == "/dashboard"
                      ? "d-none"
                      : href == "/informations"
                      ? "btn btn-link no-box feather-icon-container show-low"
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
              );
            })}
          {menuLinks && menuLinks.length > 0 && (
            <div class="dropdown">
              <a
                class="btn btn-link no-box dropdown-toggle feather-icon-container"
                ref={buttonExtraPage}
                onclick={(e) => {
                  if (menuExtraPage.current)
                    menuExtraPage.current.classList.remove("d-none");
                }}
                tabindex="0"
              >
                {textbutton}
                <ChevronDown />
              </a>
              <ul class="menu" ref={menuExtraPage}>
                {menuLinks &&
                  menuLinks.map(({ label, icon, href, id }) => {
                    return (
                      <li class="menu-item">
                        <a
                          id={id}
                          class="feather-icon-container"
                          href={href}
                          onclick={(e) => {
                            if (menuExtraPage.current)
                              menuExtraPage.current.classList.add("d-none");
                            if (buttonExtraPage.current)
                              buttonExtraPage.current.classList.add("active");
                            setTextButton(
                              <Fragment>
                                {icon}
                                <label class="hide-low">{label}</label>
                              </Fragment>
                            );
                          }}
                        >
                          {icon}
                          <label>{label}</label>
                        </a>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </section>
        <section class="navbar-section">
          <span
            className={
              connectionSettings.current.Authentication == "Disabled"
                ? "d-none"
                : "btn btn-link no-box mx-2 feather-icon-container"
            }
            onClick={onDisconnect}
          >
            <LogOut />
            <label style="cursor:pointer;" class="hide-low">
              {T("S151")}
            </label>
          </span>
        </section>
      </header>
    );
  }
};

export { Navbar };
