/*
ScanAp.js - ESP3D WebUI component file

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

import { Fragment, h } from "preact";
import { useState, useEffect, useLayoutEffect } from "preact/hooks";
import { Loading, ButtonImg } from "./../Spectre";
import { useHttpQueue } from "../../hooks";
import { espHttpURL } from "../../components/Helpers";
import { useUiContext } from "../../contexts";
import { T } from "./../Translations";
import { Lock, CheckCircle } from "preact-feather";

const ScanApList = ({ id, setValue, refreshfn }) => {
  const { modals, toasts } = useUiContext();
  const [isLoading, setIsLoading] = useState(true);

  const [APList, setApList] = useState([]);
  const { createNewRequest } = useHttpQueue();
  const ScanNetworks = () => {
    setIsLoading(true);
    createNewRequest(
      espHttpURL("command", { cmd: "[ESP410]" }).toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          setIsLoading(false);
          const listAP = JSON.parse(result);
          setApList(listAP.AP_LIST);
        },
        onFail: (error) => {
          setIsLoading(false);
          toasts.addToast({ content: error, type: "error" });
          setApList([]);
        },
      }
    );
  };
  useEffect(() => {
    ScanNetworks();
    refreshfn(ScanNetworks);
  }, []);
  return (
    <Fragment>
      {isLoading && <Loading />}

      {!isLoading && (
        <table class="table">
          <thead class="hide-low">
            <tr>
              <th>{T("SSID")}</th>
              <th>{T("signal")}</th>
              <th>{T("S49")}</th>
              <th>{T("S48")}</th>
            </tr>
          </thead>
          <tbody>
            {APList.map((e) => {
              return (
                <tr>
                  <td>{e.SSID.replace("&#39;", "'").replace("&#34;", '"')}</td>
                  <td>{e.SIGNAL}%</td>
                  <td>{e.IS_PROTECTED ? <Lock /> : ""}</td>
                  <td>
                    <ButtonImg
                      m2
                      rtooltip
                      data-tooltip={T("S53")}
                      icon={<CheckCircle />}
                      onClick={() => {
                        setValue(
                          e.SSID.replace("&#39;", "'").replace("&#34;", '"')
                        );
                        modals.removeModal(modals.getModalIndex(id));
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Fragment>
  );
};
export { ScanApList };
