/*
ScanLanguagesList.js - ESP3D WebUI component file

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
import { useState, useEffect } from "preact/hooks";
import { Loading, ButtonImg } from "./../Spectre";
import { useHttpQueue } from "../../hooks";
import { espHttpURL } from "../../components/Helpers";
import { useUiContext } from "../../contexts";
import { T, getLanguageName } from "./../Translations";
import { CheckCircle } from "preact-feather";

const ScanLanguagesList = ({ id, setValue, refreshfn }) => {
  const { modals, toasts } = useUiContext();
  const [isLoading, setIsLoading] = useState(true);

  const [languageList, setLanguageList] = useState([]);
  const { createNewRequest } = useHttpQueue();
  const ScanLanguages = () => {
    setIsLoading(true);
    createNewRequest(
      espHttpURL("files", { path: "/" }).toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          setIsLoading(false);
          const listFiles = JSON.parse(result);
          setLanguageList(listFiles.files);
        },
        onFail: (error) => {
          setIsLoading(false);
          toasts.addToast({ content: error, type: "error" });
          setLanguageList([]);
        },
      }
    );
  };
  useEffect(() => {
    ScanLanguages();
    refreshfn(ScanLanguages);
  }, []);
  return (
    <Fragment>
      {isLoading && <Loading />}

      {!isLoading && (
        <table class="table">
          <thead class="hide-low">
            <tr>
              <th>{T("S67")}</th>
              <th>{T("S178")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{T("lang", true)}</td>

              <td>
                <ButtonImg
                  m2
                  ltooltip
                  data-tooltip={T("S179")}
                  icon={<CheckCircle />}
                  onClick={() => {
                    setValue("default");
                    modals.removeModal(modals.getModalIndex(id));
                  }}
                />
              </td>
            </tr>
            {languageList.map((e) => {
              if (e.name.match(/^lang-\w*.json(.gz)*/g))
                return (
                  <tr>
                    <td>{getLanguageName(e.name.replace(".gz", ""))}</td>

                    <td>
                      <ButtonImg
                        m2
                        ltooltip
                        data-tooltip={T("S179")}
                        icon={<CheckCircle />}
                        onClick={() => {
                          setValue(e.name.replace(".gz", ""));
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
export { ScanLanguagesList };
