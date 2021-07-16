/*
 ItemsList.js - ESP3D WebUI component file

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
import { ButtonImg } from "../../Spectre";
import { T } from "../../Translations";
import { iconsList } from "../../Images";
import { generateUID } from "../../Helpers";
import { formatItem } from "../../../tabs/interface/importHelper";
import { Plus, ArrowUp, ArrowDown, Trash2, Minimize2 } from "preact-feather";
import defaultPanel from "./def_panel.json";
import defaultMacro from "./def_macro.json";

/*
 * Local const
 *
 */
const ItemControl = ({ itemData, index, completeList, idList, setValue }) => {
  const { id, value, editionMode, ...rest } = itemData;
  const icon =
    value[value.findIndex((element) => element.id == id + "-icon")].initial;
  const name =
    value[value.findIndex((element) => element.id == id + "-name")].initial;
  const controlIcon = iconsList[icon] ? iconsList[icon] : "";
  const onClick = () => {
    completeList[index].editionMode = !completeList[index].editionMode;
    setValue(completeList);
  };
  const downItem = (e) => {
    e.target.blur();
    const item = completeList[index];
    completeList.splice(index, 1);
    completeList.splice(index + 1, 0, item);
    setValue(completeList);
  };
  const upItem = (e) => {
    e.target.blur();
    const item = completeList[index];
    completeList.splice(index, 1);
    completeList.splice(index - 1, 0, item);
    setValue(completeList);
  };
  const removeItem = (e) => {
    e.target.blur();
    completeList.splice(index, 1);
    setValue(completeList);
  };
  useEffect(() => {
    //to update state when import- but why ?
    if (setValue) setValue(null, true);
  }, [completeList]);
  return (
    <Fragment>
      {!editionMode && (
        <Fragment>
          <div style="place-self: center;">
            {index > 0 && completeList.length > 1 && (
              <ButtonImg
                m1
                tooltip
                data-tooltip={T("S38")}
                icon={<ArrowUp />}
                onClick={upItem}
              />
            )}
            {completeList.length != 1 && index < completeList.length - 1 && (
              <ButtonImg
                m1
                tooltip
                data-tooltip={T("S39")}
                icon={<ArrowDown />}
                onClick={downItem}
              />
            )}
          </div>
          <ButtonImg
            m2
            tooltip
            data-tooltip={T("S94")}
            label={name}
            icon={controlIcon}
            width="100px"
            onClick={onClick}
          />
          <div style="place-self: center">
            <ButtonImg
              m2
              tooltip
              data-tooltip={T("S37")}
              icon={<Trash2 />}
              onClick={removeItem}
            />
          </div>
        </Fragment>
      )}
      {editionMode && (
        <div
          class="m-1"
          style="grid-column-start: 1;grid-column-end:4; border: 0.05rem solid #dadee4;"
        >
          <ButtonImg
            sm
            tooltip
            data-tooltip={T("S95")}
            icon={<Minimize2 />}
            onClick={onClick}
            class="float-right"
          />
          <div style="place-self: center;">
            {index > 0 && completeList.length > 1 && (
              <ButtonImg
                m1
                tooltip
                data-tooltip={T("S38")}
                icon={<ArrowUp />}
                onClick={upItem}
              />
            )}
            {completeList.length != 1 && index < completeList.length - 1 && (
              <ButtonImg
                m1
                tooltip
                data-tooltip={T("S39")}
                icon={<ArrowDown />}
                onClick={downItem}
              />
            )}

            <ButtonImg
              m2
              tooltip
              data-tooltip={T("S37")}
              icon={<Trash2 />}
              onClick={removeItem}
            />
          </div>
          <ButtonImg m2 label="Edition Mode" icon={controlIcon} width="100px" />
        </div>
      )}
    </Fragment>
  );
};

const ItemsList = ({
  id,
  label,
  validation,
  value,
  type,
  setValue,
  inline,
  ...rest
}) => {
  const addItem = (e) => {
    e.target.blur();
    const newItem = JSON.parse(
      JSON.stringify(id == "macros" ? defaultMacro : defaultPanel)
    );
    newItem.id = generateUID();
    newItem.name += " " + newItem.id;
    const formatedNewItem = formatItem(newItem);
    formatedNewItem.editionMode = true;
    formatedNewItem.newItem = true;
    value.unshift(formatedNewItem);
    setValue(value);
  };
  useEffect(() => {
    //to update state when import- but why ?
    if (setValue) setValue(null, true);
  }, [value]);
  return (
    <div>
      <ButtonImg
        m2
        label={id == "macros" ? T("S128") : T("S156")}
        tooltip
        data-tooltip={id == "macros" ? T("S128") : T("S156")}
        icon={<Plus />}
        onClick={addItem}
      />
      <div style="display: grid;grid-template-columns: 30% auto 15%; grid-template-rows: auto;">
        {value &&
          value.map((element, index, completeList) => {
            return (
              <ItemControl
                itemData={element}
                index={index}
                completeList={completeList}
                idList={id}
                setValue={setValue}
              />
            );
          })}
      </div>
    </div>
  );
};

export default ItemsList;
