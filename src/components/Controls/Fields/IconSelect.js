/*
 IconSelect.js - ESP3D WebUI component file

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

import { h } from "preact";
import { useEffect } from "preact/hooks";
import { useUiContext } from "../../../contexts";
import { ButtonImg } from "../../Spectre";
import { iconsList } from "../../Images";
import { showModal } from "../../Modal";
import { Search } from "preact-feather";

import { T } from "./../../Translations";

/*
 * Local const
 *
 */
const IconSelect = ({
  id,
  label,
  validation,
  value,
  type,
  setValue,
  inline,
  ...rest
}) => {
  const onChange = (e) => {
    //if (setValue) setValue(e.target.checked);
  };
  const { modals } = useUiContext();
  const title = T("S134");
  const closeTxt = T("S24");
  const showList = (e) => {
    const content = (
      <div>
        {Object.keys(iconsList).map((element) => {
          const displayIcon = iconsList[element] ? iconsList[element] : "";
          const onSelect = (e) => {
            setValue(element);
            modals.removeModal(modals.getModalIndex(modalId));
          };
          if (value == element)
            return (
              <ButtonImg
                primary
                icon={displayIcon}
                onclick={onSelect}
                style="max-width:2rem;"
              />
            );
          else
            return (
              <ButtonImg
                icon={displayIcon}
                onclick={onSelect}
                style="max-width:2rem;"
              />
            );
        })}
      </div>
    );
    const modalId = "iconSelection";
    //TODO generate icon list and current selected
    //modals.removeModal(modals.getModalIndex(modalId));
    showModal({
      modals,
      title,
      button2: { text: closeTxt },
      icon: <Search />,
      id: modalId,
      content,
    });
  };
  const controlIcon = iconsList[value] ? iconsList[value] : "";
  useEffect(() => {
    //to update state
    if (setValue) setValue(null, true);
  }, [value]);
  return (
    <div class={`input-group ${inline ? "column" : ""} `}>
      <ButtonImg
        m1
        icon={controlIcon}
        onClick={showList}
        style="max-width:2rem;"
      />
    </div>
  );
};

export default IconSelect;
