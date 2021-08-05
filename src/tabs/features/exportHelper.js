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

function exportFeatures(features) {
  const strippedFeature = {};
  const filename = "export.json";
  Object.keys(features).map((sectionId) => {
    const section = features[sectionId];
    strippedFeature[sectionId] = {};
    Object.keys(section).map((subsectionId) => {
      const subsection = section[subsectionId];
      strippedFeature[sectionId][subsectionId] = [];
      Object.keys(subsection).map((entryId) => {
        const entry = subsection[entryId];
        strippedFeature[sectionId][subsectionId].push({
          id: entry.id,
          label: entry.label,
          value: entry.initial,
        });
      });
    });
  });

  const file = new Blob([JSON.stringify(strippedFeature, null, " ")], {
    type: "application/json",
  });
  if (window.navigator.msSaveOrOpenBlob)
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else {
    // Others
    const a = document.createElement("a");
    const url = URL.createObjectURL(file);
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

export { exportFeatures };
