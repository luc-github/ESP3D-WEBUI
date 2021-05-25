/*
 PickUp.js - ESP3D WebUI component file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 Modified by Luc LEBOSSE 2021

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
import { useEffect, useState } from "preact/hooks";
import { Search } from "preact-feather";
import { showModal } from "../../Modal";
import { ScanLanguagesList } from "../ScanLanguagesList";
import { useUiContext } from "../../../contexts";
import { T, getLanguageName } from "../../Translations";

const PickUp = ({ label = "", id = "", inline, setValue, value, ...rest }) => {
  const props = {
    id,
    name: id,
  };
  const [language, setLanguage] = useState(T("lang"));
  const { modals, toasts } = useUiContext();
  const defaultlang = T("lang", true);
  const onChange = (value) => {
    if (setValue) setValue(value);
    setLanguage(value == "default" ? defaultlang : getLanguageName(value));
  };
  const title = T("S177");
  const closeTxt = T("S24");
  const refreshTxt = T("S50");
  let ScanLanguages = null;
  const refreshList = () => {
    if (ScanLanguages) ScanLanguages();
  };
  useEffect(() => {
    //to update state
    if (setValue) setValue(null, true);
    setLanguage(value == "default" ? defaultlang : getLanguageName(value));
  }, [value]);

  return (
    <div class={`input-group ${inline ? "column" : ""} `}>
      <span
        class="form-input"
        style="cursor: pointer;"
        readonly
        value={T("lang")}
        onClick={(e) => {
          e.target.blur();
          const modalId = "langagePickup";
          showModal({
            modals,
            title,
            button2: { text: closeTxt },
            button1: { cb: refreshList, text: refreshTxt, noclose: true },
            icon: <Search />,
            id: modalId,
            content: (
              <ScanLanguagesList
                id={modalId}
                setValue={onChange}
                refreshfn={(scanlanguages) => (ScanLanguages = scanlanguages)}
              />
            ),
          });
        }}
      >
        {language}
      </span>
    </div>
  );
};
export default PickUp;
