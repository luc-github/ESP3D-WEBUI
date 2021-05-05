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

function formatPreferences(settings) {
  for (let key in settings) {
    if (Array.isArray(settings[key])) {
      for (let index = 0; index < settings[key].length; index++) {
        if (settings[key][index].id)
          settings[key][index].initial = settings[key][index].value;
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
  return [currentPreferences, haserrors];
}

export { importPreferences, formatPreferences };
