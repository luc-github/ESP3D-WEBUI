/*
importHelper.js - ESP3D WebUI helper file

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

function formatItem(itemData, index = -1, origineId = "extrapanels") {
  const itemFormated = {};
  itemFormated.id = itemData.id;
  //to track any change in order
  itemFormated.index = index;
  itemFormated.value = [];
  Object.keys(itemData).forEach((key) => {
    if (key != "id") {
      const newItem = {};
      newItem.id = itemData.id + "-" + key;

      newItem.value = itemData[key];
      newItem.initial = itemData[key];
      switch (key) {
        case "name":
          newItem.type = "text";
          newItem.label = "S129";
          break;
        case "icon":
          newItem.type = "icon";
          newItem.label = "S132";
          break;
        case "refreshtime":
          newItem.type = "number";
          newItem.min = 0;
          newItem.append = "S114";
          newItem.label = "S113";
          break;
        case "type":
          newItem.type = "select";
          newItem.label = "S135";
          if (origineId == "macros") {
            newItem.options = [
              { label: "S137", value: "FS" },
              { label: "S138", value: "SD" },
              { label: "S139", value: "URI" },
              { label: "S140", value: "CMD" },
            ];
          } else {
            newItem.options = [
              { label: "S160", value: "image" },
              { label: "S161", value: "content" },
              { label: "S162", value: "camera" },
            ];
          }

          break;
        case "target":
          newItem.type = "select";
          newItem.label = "S136";
          newItem.options = [
            { label: "S158", value: "page" },
            { label: "S157", value: "panel" },
          ];
          break;
        case "source":
          newItem.type = "text";
          newItem.label = "S139";
          break;
        case "action":
          newItem.type = "text";
          newItem.label = "S159";
          break;
        default:
          newItem.type = "text";
          newItem.label = key;
      }
      itemFormated.value.push(newItem);
    }
  });
  return itemFormated;
}

function formatItemsList(itemsList, origineId) {
  const formatedItems = [];
  itemsList.forEach((element, index) => {
    formatedItems.push(formatItem(element, index, origineId));
  });
  return formatedItems;
}

function formatPreferences(settings) {
  for (let key in settings) {
    if (Array.isArray(settings[key])) {
      for (let index = 0; index < settings[key].length; index++) {
        if (settings[key][index].type == "list") {
          settings[key][index].value = formatItemsList(
            [...settings[key][index].value],
            settings[key][index].id
          );
        } else settings[key][index].initial = settings[key][index].value;
      }
    }
  }
  return settings;
}

function importPreferences(currentPreferencesData, importedPreferences) {
  let haserrors = false;
  const currentPreferences = JSON.parse(JSON.stringify(currentPreferencesData));
  function updateElement(id, value) {
    for (let key in currentPreferences.settings) {
      if (Array.isArray(currentPreferences.settings[key])) {
        for (
          let index = 0;
          index < currentPreferences.settings[key].length;
          index++
        ) {
          if (currentPreferences.settings[key][index].id == id) {
            currentPreferences.settings[key][index].value = value;
            return true;
          }
        }
      }
    }
    return false;
  }
  if (importedPreferences.custom) {
    currentPreferences.custom = importedPreferences.custom;
  }
  if (importedPreferences.settings) {
    for (let key in importedPreferences.settings) {
      if (!updateElement(key, importedPreferences.settings[key])) {
        haserrors = true;
        console.log("Error with ", key);
      }
    }
  }
  //console.log(currentPreferences.settings.extrapanels);
  return [currentPreferences, haserrors];
}

export { importPreferences, formatPreferences, formatItem };
