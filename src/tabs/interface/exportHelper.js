/*
exportHelper.js - ESP3D WebUI helper file

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

function exportPreferences(preferencesSettings) {
  const preferences = {};
  const filename = "preferences.json";
  console.log(preferencesSettings);
  preferences.settings = {};
  if (preferencesSettings.custom)
    preferences.custom = preferencesSettings.custom;
  for (let key in preferencesSettings.settings) {
    for (let subkey in preferencesSettings.settings[key]) {
      if (preferencesSettings.settings[key][subkey].id) {
        preferences.settings[preferencesSettings.settings[key][subkey].id] =
          preferencesSettings.settings[key][subkey].initial;
      }
    }
  }

  const file = new Blob([JSON.stringify(preferences, null, " ")], {
    type: "application/json",
  });
  if (window.navigator.msSaveOrOpenBlob)
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else {
    // Others
    const a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

export { exportPreferences };
