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
import { useEffect } from "preact/hooks";
import { ButtonImg } from "../../Spectre";
import { T } from "../../Translations";
import { iconsList } from "../../Images";
import { Plus } from "preact-feather";

/*
 * Local const
 *
 */
const ItemControl = ({ itemData, index, completeList, idList }) => {
  const { icon, id, name, color, textcolor, ...rest } = itemData;
  const controlIcon = iconsList[icon];
  return (
    <div>
      <div class="btn feather-icon-container m-1">
        <div style="display:inline-block">{controlIcon}</div>
        <label>{name}</label>
      </div>
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
  const addItem = () => {
    console.log("add clicked");
  };
  const idList = id;
  return (
    <Fragment>
      <ButtonImg
        m2
        label={id == "macros" ? T("S128") : T("S156")}
        tooltip
        data-tooltip={id == "macros" ? T("S128") : T("S156")}
        icon={<Plus />}
        onClick={addItem}
      />
      {value &&
        value.map((element, index, completeList) => {
          return (
            <ItemControl
              itemData={element}
              index={index}
              completeList={completeList}
              idList={idList}
            />
          );
        })}
    </Fragment>
  );
};

export default ItemsList;
