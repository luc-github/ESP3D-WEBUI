/*
 Boolean.js - ESP3D WebUI component file

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

import { Fragment, h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { ButtonImg } from "../../Spectre";
import { T } from "../../Translations";
import { iconsList } from "../../Images";
import { generateUID } from "../../Helpers";
import { Plus, ArrowUp, ArrowDown, Trash2 } from "preact-feather";
import defaultPanel from "./def_panel.json";
import defaultMacro from "./def_macro.json";

/*
 * Local const
 *
 */
const ItemControl = ({ itemData, index, completeList, idList }) => {
  const { icon, id, name, color, textcolor, ...rest } = itemData;
  const controlIcon = iconsList[icon] ? iconsList[icon] : "";
  const onClick = () => {
    console.log(id);
  };
  return (
    <div style="align-self: center">
      <ButtonImg
        m2
        label={name}
        icon={controlIcon}
        onClick={onClick}
        width="100px"
      />
    </div>
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
    value.unshift(newItem);
    setValue(value);
  };
  const removeItem = (e, index) => {
    e.target.blur();
    value.splice(index, 1);
    setValue(value);
  };
  const upItem = (e, index) => {
    e.target.blur();
    const item = value[index];
    value.splice(index, 1);
    value.splice(index - 1, 0, item);
    setValue(value);
  };
  const downItem = (e, index) => {
    e.target.blur();
    const item = value[index];
    value.splice(index, 1);
    value.splice(index + 1, 0, item);
    setValue(value);
  };

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
              <Fragment>
                <div style="place-self: center;">
                  {index > 0 && completeList.length > 1 && (
                    <ButtonImg
                      m1
                      tooltip
                      data-tooltip={T("Move up")}
                      icon={<ArrowUp />}
                      onClick={(e) => {
                        upItem(e, index);
                      }}
                    />
                  )}
                  {completeList.length != 1 && index < completeList.length - 1 && (
                    <ButtonImg
                      m1
                      tooltip
                      data-tooltip={T("Move down")}
                      icon={<ArrowDown />}
                      onClick={(e) => {
                        downItem(e, index);
                      }}
                    />
                  )}
                </div>
                <ItemControl
                  itemData={element}
                  index={index}
                  completeList={completeList}
                  idList={id}
                />
                <div style="place-self: center">
                  <ButtonImg
                    m2
                    tooltip
                    data-tooltip={T("Trash")}
                    icon={<Trash2 />}
                    onClick={(e) => {
                      removeItem(e, index);
                    }}
                  />
                </div>
              </Fragment>
            );
          })}
      </div>
    </div>
  );
};

export default ItemsList;
