/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ (() => {

/*
 shim.js - minimal browser globals so the Helper modules can be
 imported under Node (they may touch document/localStorage at load time).
 Imported first by roundtrip.js, before any application module.
*/
const safe = fn => {
  try {
    fn();
  } catch (e) {
    //global already exists and is read-only: keep it
  }
};
safe(() => {
  if (typeof globalThis.window === "undefined") globalThis.window = globalThis;
});
safe(() => {
  if (typeof globalThis.document === "undefined") globalThis.document = {
    documentElement: {},
    head: {},
    body: {
      appendChild() {},
      removeChild() {}
    },
    createElement: () => ({
      style: {}
    }),
    getElementById: () => null,
    querySelector: () => null,
    addEventListener() {}
  };
});
safe(() => {
  if (typeof globalThis.localStorage === "undefined") globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
});
safe(() => {
  if (typeof globalThis.location === "undefined") globalThis.location = {
    protocol: "http:",
    hostname: "localhost",
    host: "localhost",
    port: "",
    pathname: "/",
    href: "http://localhost/"
  };
});

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formatItem: () => (/* binding */ formatItem),
/* harmony export */   formatPreferences: () => (/* binding */ formatPreferences),
/* harmony export */   importPreferencesSection: () => (/* binding */ importPreferencesSection)
/* harmony export */ });
/* harmony import */ var _components_Helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
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



/**
 * Formats an item data object.
 * Field editor metadata (type/label/options/depend) comes from the static
 * list-kinds table in Helpers/settings/listKinds.js.
 *
 * @param {Object} itemData - The item data object to format.
 * @param {number} [index=-1] - The index of the item.
 * @param {string} [origineId="extrapanels"] - The origin ID of the item.
 * @returns {Object} The formatted item object.
 */
function formatItem(itemData, index = -1, origineId = "extrapanels") {
  const itemFormated = {};
  itemFormated.id = itemData.id;
  //to track any change in order
  itemFormated.index = index;
  itemFormated.value = [];
  Object.keys(itemData).forEach(key => {
    if (key === "id") return;
    const newItem = {
      id: itemData.id + "-" + key,
      name: key,
      value: itemData[key],
      initial: itemData[key],
      ...(0,_components_Helpers__WEBPACK_IMPORTED_MODULE_0__.fieldMeta)(key, origineId)
    };
    if (index == -1) newItem.newItem = true;
    itemFormated.value.push(newItem);
  });
  // For extracontents items saved before openonstart was introduced, inject the default
  if (origineId === "extracontents" && !("openonstart" in itemData)) {
    itemFormated.value.push({
      id: itemData.id + "-openonstart",
      name: "openonstart",
      value: true,
      initial: true,
      type: "boolean",
      label: "S93"
    });
  }
  return itemFormated;
}

/**
 * True if the list item is already in "formatted" form, i.e. the single
 * internal representation: value is an array of { name, value, ... } sub-fields.
 * Flat form ({ id, type, value, ... }) only exists in preferences.json files
 * and in the raw default preferences — it is expanded once at load/import.
 */
function isFormattedItem(item) {
  if (!item || typeof item !== "object") return false;
  const val = item.value;
  if (!Array.isArray(val) || val.length === 0) return false;
  const first = val[0];
  return typeof first === "object" && first !== null && first.name !== undefined;
}

/**
 * Formats the items list.
 * Already formatted items are kept as-is (only their position index is
 * refreshed): re-expanding them would wipe runtime flags (hasmodified,
 * editionMode, newItem) and caused the "double-nesting / [object Object]"
 * bugs. Flat items (from preferences.json or defaults) are expanded here.
 *
 * @param {Array} itemsList - The list of items to be formatted.
 * @param {string} origineId - The origin ID.
 * @returns {Array} - The formatted items list.
 */
function formatItemsList(itemsList, origineId) {
  const formatedItems = [];
  itemsList.forEach((element, index) => {
    if (isFormattedItem(element)) {
      element.index = index;
      formatedItems.push(element);
      return;
    }
    let el = element;
    if (origineId === "verbosefilters" && (el.id == null || el.id === "")) {
      el = {
        ...el,
        id: (el.type != null ? String(el.type) : "filter") + "-" + index
      };
    }
    formatedItems.push(formatItem(el, index, origineId));
  });
  return formatedItems;
}

/**
 * Formats the preferences section to add inital value when missing
 *
 * @param {Object} section - The preferences section to format.
 * @returns {Object} - The formatted settings.
 */
function formatPreferences(section) {
  function formatSection(arr) {
    if (!Array.isArray(arr)) return;
    for (let index = 0; index < arr.length; index++) {
      const el = arr[index];
      if (el.type == "group") {
        if (Array.isArray(el.value)) {
          el.value.forEach(element => {
            element.initial = element.value;
          });
          // Also format list items inside the group
          el.value.forEach(element => {
            if (element.type == "list" && Array.isArray(element.value)) {
              element.nb = element.value.length;
              element.value = formatItemsList([...element.value], element.id);
            }
          });
        }
      } else if (el.type == "list") {
        el.nb = el.value.length;
        el.value = formatItemsList([...el.value], el.id);
      } else {
        el.initial = el.value;
      }
    }
  }
  for (let key in section) {
    if (Array.isArray(section[key])) {
      formatSection(section[key]);
    }
  }
  return section;
}

/**
 * Imports preferences into the current preferences data.
 * @param {Object} currentPreferencesData - The current preferences data section.
 * @param {Object} importedPreferences - The preferences to be imported section.
 * @returns {Array} An array containing a copy of preferences data section with imported data and a flag indicating if there were any errors during the import.
 */
function importPreferencesSection(currentPreferencesData, importedPreferences) {
  let hasErrors = false;
  const currentPreferences = (0,_components_Helpers__WEBPACK_IMPORTED_MODULE_0__.clone)(currentPreferencesData);
  function updateElement(id, value) {
    function traverse(obj) {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] && typeof obj[key] === 'object') {
            if (obj[key].id === id) {
              obj[key].value = value;
              return true;
            }
            if (traverse(obj[key])) {
              return true;
            }
          }
        }
      }
      return false;
    }
    return traverse(currentPreferences);
  }
  if (importedPreferences) {
    for (let key in importedPreferences) {
      if (!updateElement(key, importedPreferences[key])) {
        hasErrors = true;
        console.log("Error with ", key);
      }
    }
  }
  return [currentPreferences, hasErrors];
}


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clone: () => (/* reexport safe */ _src_components_Helpers_settings_model__WEBPACK_IMPORTED_MODULE_0__.clone),
/* harmony export */   fieldMeta: () => (/* reexport safe */ _src_components_Helpers_settings_listKinds__WEBPACK_IMPORTED_MODULE_1__.fieldMeta),
/* harmony export */   reindexList: () => (/* reexport safe */ _src_components_Helpers_settings_model__WEBPACK_IMPORTED_MODULE_0__.reindexList),
/* harmony export */   scanFlag: () => (/* reexport safe */ _src_components_Helpers_settings_model__WEBPACK_IMPORTED_MODULE_0__.scanFlag),
/* harmony export */   settingsStatus: () => (/* reexport safe */ _src_components_Helpers_settings_model__WEBPACK_IMPORTED_MODULE_0__.settingsStatus)
/* harmony export */ });
/* harmony import */ var _src_components_Helpers_settings_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _src_components_Helpers_settings_listKinds__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/*
 stub-helpers.js - test-only replacement for src/components/Helpers/index.js

 The real barrel pulls the whole UI dependency graph (contexts,
 translations, target aliases...). The preferences code under test only
 needs the pure settings helpers, re-exported here from their concrete
 modules so the real implementations are exercised.
*/



/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clone: () => (/* binding */ clone),
/* harmony export */   reindexList: () => (/* binding */ reindexList),
/* harmony export */   scanFlag: () => (/* binding */ scanFlag),
/* harmony export */   settingsStatus: () => (/* binding */ settingsStatus)
/* harmony export */ });
/*
 model.js - ESP3D WebUI settings helper file

 Copyright (c) 2026 Luc LEBOSSE. All rights reserved.

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

//deep clone of settings data (plain JSON only)
const clone = obj => JSON.parse(JSON.stringify(obj));

//reindex a list in place, including the embedded "index" sub-field
const reindexList = arr => {
  arr.forEach((item, i) => {
    item.index = i;
    const idxField = item.value && item.value.find(s => s && s.name === "index");
    if (idxField) idxField.value = i;
  });
};

//early-exit scan for a boolean flag anywhere in the tree,
//replaces JSON.stringify(settings).includes('"flag":true') per keystroke
const scanFlag = (obj, key) => {
  if (!obj || typeof obj !== "object") return false;
  if (obj[key] === true) return true;
  for (const k in obj) {
    if (scanFlag(obj[k], key)) return true;
  }
  return false;
};

//save button state: something modified and no error
const settingsStatus = settings => ({
  hasmodified: scanFlag(settings, "hasmodified"),
  haserrors: scanFlag(settings, "haserror")
});


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EXTRAPANEL_TYPE_OPTIONS: () => (/* binding */ EXTRAPANEL_TYPE_OPTIONS),
/* harmony export */   MACRO_TYPE_OPTIONS: () => (/* binding */ MACRO_TYPE_OPTIONS),
/* harmony export */   VERBOSE_TYPE_OPTIONS: () => (/* binding */ VERBOSE_TYPE_OPTIONS),
/* harmony export */   fieldMeta: () => (/* binding */ fieldMeta)
/* harmony export */ });
/*
 listKinds.js - ESP3D WebUI settings helper file

 Copyright (c) 2026 Luc LEBOSSE. All rights reserved.

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

//Static metadata describing the editable list kinds used by preferences
//(macros, pollingcmds, verbosefilters, extrapanels, keymap, panelsorder).
//The depend blocks below are DATA consumed by the frozen dependency engine
//(checkDependencies / connectionDepend): keep them verbatim.

const VERBOSE_TYPE_OPTIONS = [{
  label: "S229",
  value: "startswith"
}, {
  label: "S230",
  value: "endswith"
}, {
  label: "S231",
  value: "contain"
}, {
  label: "S232",
  value: "regex"
}];
const MACRO_TYPE_OPTIONS = [{
  label: "S137",
  value: "FS",
  depend: [{
    id: "flashfs",
    value: true
  }, {
    connection_id: "FlashFileSystem",
    value: "!='none'"
  }, {
    connection_id: "FWTargetID",
    value: "!='30'"
  }]
}, {
  label: "S138",
  value: "SD",
  depend: [{
    ids: [{
      id: "sd",
      value: true
    }, {
      id: "directsd",
      value: true
    }, {
      id: "ext",
      value: true
    }, {
      id: "directsdext",
      value: true
    }, {
      id: "tftsd",
      value: true
    }]
  }, {
    connection_id: "SDConnection",
    value: "!='none'"
  }]
}, {
  label: "S139",
  value: "URI"
}, {
  label: "S140",
  value: "CMD"
}];
const EXTRAPANEL_TYPE_OPTIONS = [{
  label: "S160",
  value: "image"
}, {
  label: "S161",
  value: "content"
}, {
  label: "S121",
  value: "extension"
}, {
  label: "S162",
  value: "camera"
}];
const TARGET_OPTIONS = [{
  label: "S158",
  value: "page"
}, {
  label: "S157",
  value: "panel"
}];

//select options for the "type" field, per list kind
const typeOptionsFor = kind => kind === "verbosefilters" ? VERBOSE_TYPE_OPTIONS : kind === "macros" ? MACRO_TYPE_OPTIONS : EXTRAPANEL_TYPE_OPTIONS;

//per-field editor metadata shared by all list kinds;
//"type" options and "value" label are resolved per kind in fieldMeta
const FIELD_META = {
  cmds: {
    type: "text",
    label: "S115",
    help: "S97"
  },
  key: {
    type: "text",
    label: "key",
    shortkey: true
  },
  name: {
    type: "text",
    label: "S129"
  },
  icon: {
    type: "icon",
    label: "S132"
  },
  refreshtime: {
    type: "number",
    min: 0,
    minsecondary: 100,
    step: 100,
    append: "S114",
    label: "S113"
  },
  type: {
    type: "select",
    label: "S135"
  },
  target: {
    type: "select",
    label: "S136",
    options: TARGET_OPTIONS
  },
  openonstart: {
    type: "boolean",
    label: "S93"
  },
  source: {
    type: "text",
    label: "S139",
    min: "2"
  },
  action: {
    type: "text",
    label: "S159",
    min: "1"
  },
  value: {
    type: "text"
  }
};

//editor metadata for one field of a list item
const fieldMeta = (key, kind) => {
  const meta = FIELD_META[key];
  if (!meta) return {
    type: "text",
    label: key
  };
  const out = {
    ...meta
  };
  if (key === "type") out.options = typeOptionsFor(kind);
  if (key === "value") out.label = kind === "verbosefilters" ? "S233" : key;
  return out;
};


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   exportPreferences: () => (/* binding */ exportPreferences),
/* harmony export */   exportPreferencesSection: () => (/* binding */ exportPreferencesSection),
/* harmony export */   isFullStructureSettings: () => (/* binding */ isFullStructureSettings),
/* harmony export */   omitDefaultSettings: () => (/* binding */ omitDefaultSettings)
/* harmony export */ });
/* harmony import */ var _targets__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7);
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


function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null || typeof a !== "object" || typeof b !== "object") return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Keys that must always be included when present (e.g. empty array required for loader). */
const ALWAYS_INCLUDE_KEYS = [];

/** True if settings is full structure (sections as arrays of { id, type, value, ... }) instead of flat { id: value }. */
function isFullStructureSettings(settings) {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) return false;
  const firstVal = Object.values(settings)[0];
  return Array.isArray(firstVal) && firstVal.length > 0 && typeof firstVal[0] === "object" && "id" in firstVal[0];
}

/** Return a copy of settings with only keys that differ from default (reduces file size). */
function omitDefaultSettings(settings, defaultSettings) {
  const out = {};
  for (const k of Object.keys(settings)) {
    const alwaysInclude = ALWAYS_INCLUDE_KEYS.includes(k);
    const differs = defaultSettings[k] === undefined || !deepEqual(settings[k], defaultSettings[k]);
    if (alwaysInclude || differs) {
      out[k] = settings[k];
    }
  }
  return out;
}

/** Export a single list's value (used for top-level lists and for lists inside groups). */
function exportListValue(listEl, asFile, listId) {
  const listValue = Array.isArray(listEl.value) ? listEl.value : [];
  const extensionMetadataKeys = ["owner", "version", "github", "description", "supportedVersion", "targetSystem"];
  const itemsList = [];
  listValue.forEach(element => {
    const item = {
      id: element.id
    };
    const itemValue = Array.isArray(element.value) ? element.value : [];
    if (itemValue.length > 0) {
      itemValue.forEach(setting => {
        item[setting.name] = asFile ? setting.initial ?? setting.value : setting.value;
      });
    } else {
      Object.keys(element).forEach(k => {
        if (k !== "id" && k !== "value" && k !== "index") item[k] = element[k];
      });
    }
    if (listId === "verbosefilters") {
      itemsList.push({
        type: item.type,
        value: item.value
      });
    } else if (listId === "panelsorder") {
      itemsList.push({
        id: item.id,
        name: item.name
      });
    } else if (listId === "extracontents") {
      extensionMetadataKeys.forEach(k => delete item[k]);
      itemsList.push(item);
    } else {
      itemsList.push(item);
    }
  });
  return itemsList;
}
function exportPreferencesSection(interfaceSettingsDataSection, asFile = true, initial_value = false) {
  const section = {};
  for (let key in interfaceSettingsDataSection) {
    for (let subkey in interfaceSettingsDataSection[key]) {
      if (interfaceSettingsDataSection[key][subkey].id) {
        if (interfaceSettingsDataSection[key][subkey].type == "group") {
          const groupValue = Array.isArray(interfaceSettingsDataSection[key][subkey].value) ? interfaceSettingsDataSection[key][subkey].value : [];
          groupValue.forEach(element => {
            if (element.type == "list") {
              section[element.id] = exportListValue(element, asFile, element.id);
            } else {
              const val = asFile ? element.initial ?? element.value : element.value;
              section[element.id] = val;
            }
          });
        } else if (interfaceSettingsDataSection[key][subkey].type == "list") {
          const listEl = interfaceSettingsDataSection[key][subkey];
          section[listEl.id] = exportListValue(listEl, asFile, listEl.id);
        } else if (interfaceSettingsDataSection[key][subkey].type == "button") {
          // button: not exportable, skip
        } else {
          const el = interfaceSettingsDataSection[key][subkey];
          section[el.id] = asFile || initial_value ? el.initial ?? el.value : el.value;
        }
      }
    }
  }
  return section;
}

/**
 * @param {Object} interfaceSettingsData - Current preferences (full structure).
 * @param {boolean} [asFile=true] - If true, trigger download or return object for upload.
 * @param {{ readable?: boolean }} [options] - readable: same id/value shape as optimized, but all settings + pretty-print (no depend, type, label, initial, etc.).
 */
function exportPreferences(interfaceSettingsData, asFile = true, options = {}) {
  const filename = "preferences.json";
  let preferences;
  let stringified;
  if (options.readable) {
    // Id/value only (like optimized), but include all settings and pretty-print.
    const fullSettings = exportPreferencesSection(interfaceSettingsData.settings, asFile);
    preferences = {
      settings: fullSettings
    };
    if (interfaceSettingsData.custom) preferences.custom = interfaceSettingsData.custom;
    if (interfaceSettingsData.extensions) preferences.extensions = interfaceSettingsData.extensions;
    stringified = JSON.stringify(preferences, null, 2);
  } else {
    const fullSettings = exportPreferencesSection(interfaceSettingsData.settings, asFile);
    const defaultSettings = exportPreferencesSection(_targets__WEBPACK_IMPORTED_MODULE_0__.defaultPreferences.settings, true);
    preferences = {
      settings: omitDefaultSettings(fullSettings, defaultSettings)
    };
    if (interfaceSettingsData.custom) preferences.custom = interfaceSettingsData.custom;
    if (interfaceSettingsData.extensions) preferences.extensions = interfaceSettingsData.extensions;
    stringified = JSON.stringify(preferences);
  }
  if (asFile) {
    const file = new Blob([stringified], {
      type: "application/json"
    });
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(file, filename);
    } else {
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
  return preferences;
}


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultPreferences: () => (/* binding */ defaultPreferences)
/* harmony export */ });
/* harmony import */ var _src_components_Helpers_arrays__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _src_components_Helpers_preferencesKeys__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10);
/* harmony import */ var _src_targets_preferences_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(11);
/* harmony import */ var _src_targets_CNC_preferences_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(12);
/* harmony import */ var _src_targets_CNC_grblHAL_preferences_json__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(13);
/*
 stub-targets.js - test-only replacement for src/targets/index.js

 The real module pulls the whole target UI (via TargetDir/SubTargetDir
 webpack aliases). The round-trip test only needs defaultPreferences,
 rebuilt here exactly like src/targets/index.js does (base + target +
 subtarget, short keys expanded), for the CNC/grblHAL target.
*/






//Note: in this test bundle the shrink-preferences-loader is NOT applied,
//so keys are already long and expandShortKeys is an identity pass.
const defaultPreferences = (0,_src_components_Helpers_arrays__WEBPACK_IMPORTED_MODULE_0__.mergeJSON)((0,_src_components_Helpers_arrays__WEBPACK_IMPORTED_MODULE_0__.mergeJSON)((0,_src_components_Helpers_preferencesKeys__WEBPACK_IMPORTED_MODULE_1__.expandShortKeys)(_src_targets_preferences_json__WEBPACK_IMPORTED_MODULE_2__), (0,_src_components_Helpers_preferencesKeys__WEBPACK_IMPORTED_MODULE_1__.expandShortKeys)(_src_targets_CNC_preferences_json__WEBPACK_IMPORTED_MODULE_3__)), (0,_src_components_Helpers_preferencesKeys__WEBPACK_IMPORTED_MODULE_1__.expandShortKeys)(_src_targets_CNC_grblHAL_preferences_json__WEBPACK_IMPORTED_MODULE_4__));


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BitsArray: () => (/* binding */ BitsArray),
/* harmony export */   addObjectItem: () => (/* binding */ addObjectItem),
/* harmony export */   limitArr: () => (/* binding */ limitArr),
/* harmony export */   mergeJSON: () => (/* binding */ mergeJSON),
/* harmony export */   removeEntriesByIDs: () => (/* binding */ removeEntriesByIDs),
/* harmony export */   removeObjectItem: () => (/* binding */ removeObjectItem),
/* harmony export */   splitArrayByLines: () => (/* binding */ splitArrayByLines)
/* harmony export */ });
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/*
 arrays.js - ESP3D WebUI helpers file

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

const removeEntriesByIDs = (src, uid) => src.filter(({
  id
}) => !uid.includes(id));
const limitArr = (arr, limit) => arr.slice(arr.length - (arr.length <= limit ? arr.length : limit), arr.length);
const splitArrayByLines = arrayBuffer => {
  const bytes = new Uint8Array(arrayBuffer);
  return bytes.reduce((acc, curr) => {
    if (curr == 10 || curr == 13) return [...acc, []];
    const i = Number(acc.length - 1);
    return [...acc.slice(0, i), [...acc[i], curr]];
  }, [[]]);
};

//Merge 2 JSON in generic way
//based on https://gist.github.com/sinemetu1/1732896#gistcomment-2571586
function mergeJSON(o1, o2) {
  let tempNewObj = o1;
  if (o1.length === undefined && typeof o1 !== "number") {
    for (let key in o2) {
      let value = o2[key];
      if (o1[key] === undefined) {
        tempNewObj[key] = value;
      } else {
        tempNewObj[key] = mergeJSON(o1[key], o2[key]);
      }
    }
  } else if (o1.length > 0 && typeof o1 !== "string") {
    for (let index in o2) {
      if (JSON.stringify(o1).indexOf(JSON.stringify(o2[index])) === -1) {
        //look for existing id in same section
        let i = tempNewObj.findIndex(element => element.id == o2[index].id);
        if (i == -1) tempNewObj.push(o2[index]);else {
          if (Array.isArray(tempNewObj[i].value)) {
            //need to check if id is already in array
            for (let v in o2[index].value) {
              let j = tempNewObj[i].value.findIndex(element => element.id == o2[index].value[v].id);
              if (j == -1) {
                tempNewObj[i].value.push(o2[index].value[v]);
              } else {
                tempNewObj[i].value[j] = o2[index].value[v];
              }
            }
          } else {
            tempNewObj[i].value = o2[index].value;
            if (typeof o2[index].hide != "undefined") tempNewObj[i].hide = o2[index].hide;
          }
        }
      }
    }
  } else {
    tempNewObj = o2;
  }
  return tempNewObj;
}
const addObjectItem = (src, entry, variable) => {
  let i = src.findIndex(element => element[entry] == variable[entry]);
  if (i == -1) {
    src.push(JSON.parse(JSON.stringify(variable)));
  } else {
    if (variable[entry]) src[i] = variable;else {
      console.log("error addObjectItem", variable, " has no entry: ", entry);
    }
  }
  return src;
};
const removeObjectItem = (src, entry, entryValue) => {
  let i = src.findIndex(element => element[entry] == entryValue);
  if (i != -1) {
    src.splice(i, 1);
  }
  return src;
};
const BitsArray = {
  bits: [],
  size: 0,
  fromInt: function (intVal, arraySize) {
    this.bits = (intVal >>> 0).toString(2).split("").reverse();
    this.size = arraySize;
    //Sanity check to have proper size
    while (this.size > this.bits.length) {
      this.bits.push("0");
    }
    let t = "";
    for (let i = 0; i < this.bits.length; i++) {
      if (i > 0) t += ",";
      t += this.bits[i];
    }
    return this;
  },
  fromArray: function (arrayVal) {
    this.bits = [];
    this.size = arrayVal.length;
    //sanity check to have proper content
    // so can handle false/true, 0/1, "0"/"1", empty
    for (let index = 0; index < this.size; index++) {
      if (arrayVal[index]) {
        if (arrayVal[index] == "0") {
          this.bits[index] = "0";
        } else {
          this.bits[index] = "1";
        }
      } else {
        this.bits[index] = "0";
      }
    }
    return this;
  },
  getBit: function (index) {
    return parseInt(this.bits[index]);
  },
  setBit: function (index, value) {
    this.bits[index] = value == 0 ? "0" : "1";
  },
  toInt: function () {
    const bitstmp = [];
    for (let index = 0; index < this.size; index++) {
      if (typeof this.bits[index] == "undefined") {
        bitstmp[index] = "0";
      } else {
        bitstmp[index] = this.bits[index];
      }
    }
    return parseInt(bitstmp.reverse().join(""), 2);
  }
};


/***/ }),
/* 9 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Component: () => (/* binding */ d),
/* harmony export */   Fragment: () => (/* binding */ p),
/* harmony export */   cloneElement: () => (/* binding */ q),
/* harmony export */   createContext: () => (/* binding */ B),
/* harmony export */   createElement: () => (/* binding */ h),
/* harmony export */   createRef: () => (/* binding */ y),
/* harmony export */   h: () => (/* binding */ h),
/* harmony export */   hydrate: () => (/* binding */ S),
/* harmony export */   isValidElement: () => (/* binding */ i),
/* harmony export */   options: () => (/* binding */ l),
/* harmony export */   render: () => (/* binding */ P),
/* harmony export */   toChildArray: () => (/* binding */ x)
/* harmony export */ });
var n,l,u,i,t,o,r,f={},e=[],c=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function s(n,l){for(var u in l)n[u]=l[u];return n}function a(n){var l=n.parentNode;l&&l.removeChild(n)}function h(l,u,i){var t,o,r,f={};for(r in u)"key"==r?t=u[r]:"ref"==r?o=u[r]:f[r]=u[r];if(arguments.length>2&&(f.children=arguments.length>3?n.call(arguments,2):i),"function"==typeof l&&null!=l.defaultProps)for(r in l.defaultProps)void 0===f[r]&&(f[r]=l.defaultProps[r]);return v(l,f,t,o,null)}function v(n,i,t,o,r){var f={type:n,props:i,key:t,ref:o,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==r?++u:r};return null==r&&null!=l.vnode&&l.vnode(f),f}function y(){return{current:null}}function p(n){return n.children}function d(n,l){this.props=n,this.context=l}function _(n,l){if(null==l)return n.__?_(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return"function"==typeof n.type?_(n):null}function k(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return k(n)}}function b(n){(!n.__d&&(n.__d=!0)&&t.push(n)&&!g.__r++||o!==l.debounceRendering)&&((o=l.debounceRendering)||setTimeout)(g)}function g(){for(var n;g.__r=t.length;)n=t.sort(function(n,l){return n.__v.__b-l.__v.__b}),t=[],n.some(function(n){var l,u,i,t,o,r;n.__d&&(o=(t=(l=n).__v).__e,(r=l.__P)&&(u=[],(i=s({},t)).__v=t.__v+1,j(r,t,i,l.__n,void 0!==r.ownerSVGElement,null!=t.__h?[o]:null,u,null==o?_(t):o,t.__h),z(u,t),t.__e!=o&&k(t)))})}function w(n,l,u,i,t,o,r,c,s,a){var h,y,d,k,b,g,w,x=i&&i.__k||e,C=x.length;for(u.__k=[],h=0;h<l.length;h++)if(null!=(k=u.__k[h]=null==(k=l[h])||"boolean"==typeof k?null:"string"==typeof k||"number"==typeof k||"bigint"==typeof k?v(null,k,null,null,k):Array.isArray(k)?v(p,{children:k},null,null,null):k.__b>0?v(k.type,k.props,k.key,null,k.__v):k)){if(k.__=u,k.__b=u.__b+1,null===(d=x[h])||d&&k.key==d.key&&k.type===d.type)x[h]=void 0;else for(y=0;y<C;y++){if((d=x[y])&&k.key==d.key&&k.type===d.type){x[y]=void 0;break}d=null}j(n,k,d=d||f,t,o,r,c,s,a),b=k.__e,(y=k.ref)&&d.ref!=y&&(w||(w=[]),d.ref&&w.push(d.ref,null,k),w.push(y,k.__c||b,k)),null!=b?(null==g&&(g=b),"function"==typeof k.type&&k.__k===d.__k?k.__d=s=m(k,s,n):s=A(n,k,d,x,b,s),"function"==typeof u.type&&(u.__d=s)):s&&d.__e==s&&s.parentNode!=n&&(s=_(d))}for(u.__e=g,h=C;h--;)null!=x[h]&&("function"==typeof u.type&&null!=x[h].__e&&x[h].__e==u.__d&&(u.__d=_(i,h+1)),N(x[h],x[h]));if(w)for(h=0;h<w.length;h++)M(w[h],w[++h],w[++h])}function m(n,l,u){for(var i,t=n.__k,o=0;t&&o<t.length;o++)(i=t[o])&&(i.__=n,l="function"==typeof i.type?m(i,l,u):A(u,i,i,t,i.__e,l));return l}function x(n,l){return l=l||[],null==n||"boolean"==typeof n||(Array.isArray(n)?n.some(function(n){x(n,l)}):l.push(n)),l}function A(n,l,u,i,t,o){var r,f,e;if(void 0!==l.__d)r=l.__d,l.__d=void 0;else if(null==u||t!=o||null==t.parentNode)n:if(null==o||o.parentNode!==n)n.appendChild(t),r=null;else{for(f=o,e=0;(f=f.nextSibling)&&e<i.length;e+=2)if(f==t)break n;n.insertBefore(t,o),r=o}return void 0!==r?r:t.nextSibling}function C(n,l,u,i,t){var o;for(o in u)"children"===o||"key"===o||o in l||H(n,o,null,u[o],i);for(o in l)t&&"function"!=typeof l[o]||"children"===o||"key"===o||"value"===o||"checked"===o||u[o]===l[o]||H(n,o,l[o],u[o],i)}function $(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]=null==u?"":"number"!=typeof u||c.test(l)?u:u+"px"}function H(n,l,u,i,t){var o;n:if("style"===l)if("string"==typeof u)n.style.cssText=u;else{if("string"==typeof i&&(n.style.cssText=i=""),i)for(l in i)u&&l in u||$(n.style,l,"");if(u)for(l in u)i&&u[l]===i[l]||$(n.style,l,u[l])}else if("o"===l[0]&&"n"===l[1])o=l!==(l=l.replace(/Capture$/,"")),l=l.toLowerCase()in n?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+o]=u,u?i||n.addEventListener(l,o?T:I,o):n.removeEventListener(l,o?T:I,o);else if("dangerouslySetInnerHTML"!==l){if(t)l=l.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if("href"!==l&&"list"!==l&&"form"!==l&&"tabIndex"!==l&&"download"!==l&&l in n)try{n[l]=null==u?"":u;break n}catch(n){}"function"==typeof u||(null!=u&&(!1!==u||"a"===l[0]&&"r"===l[1])?n.setAttribute(l,u):n.removeAttribute(l))}}function I(n){this.l[n.type+!1](l.event?l.event(n):n)}function T(n){this.l[n.type+!0](l.event?l.event(n):n)}function j(n,u,i,t,o,r,f,e,c){var a,h,v,y,_,k,b,g,m,x,A,C,$,H=u.type;if(void 0!==u.constructor)return null;null!=i.__h&&(c=i.__h,e=u.__e=i.__e,u.__h=null,r=[e]),(a=l.__b)&&a(u);try{n:if("function"==typeof H){if(g=u.props,m=(a=H.contextType)&&t[a.__c],x=a?m?m.props.value:a.__:t,i.__c?b=(h=u.__c=i.__c).__=h.__E:("prototype"in H&&H.prototype.render?u.__c=h=new H(g,x):(u.__c=h=new d(g,x),h.constructor=H,h.render=O),m&&m.sub(h),h.props=g,h.state||(h.state={}),h.context=x,h.__n=t,v=h.__d=!0,h.__h=[]),null==h.__s&&(h.__s=h.state),null!=H.getDerivedStateFromProps&&(h.__s==h.state&&(h.__s=s({},h.__s)),s(h.__s,H.getDerivedStateFromProps(g,h.__s))),y=h.props,_=h.state,v)null==H.getDerivedStateFromProps&&null!=h.componentWillMount&&h.componentWillMount(),null!=h.componentDidMount&&h.__h.push(h.componentDidMount);else{if(null==H.getDerivedStateFromProps&&g!==y&&null!=h.componentWillReceiveProps&&h.componentWillReceiveProps(g,x),!h.__e&&null!=h.shouldComponentUpdate&&!1===h.shouldComponentUpdate(g,h.__s,x)||u.__v===i.__v){h.props=g,h.state=h.__s,u.__v!==i.__v&&(h.__d=!1),h.__v=u,u.__e=i.__e,u.__k=i.__k,u.__k.forEach(function(n){n&&(n.__=u)}),h.__h.length&&f.push(h);break n}null!=h.componentWillUpdate&&h.componentWillUpdate(g,h.__s,x),null!=h.componentDidUpdate&&h.__h.push(function(){h.componentDidUpdate(y,_,k)})}if(h.context=x,h.props=g,h.__v=u,h.__P=n,A=l.__r,C=0,"prototype"in H&&H.prototype.render)h.state=h.__s,h.__d=!1,A&&A(u),a=h.render(h.props,h.state,h.context);else do{h.__d=!1,A&&A(u),a=h.render(h.props,h.state,h.context),h.state=h.__s}while(h.__d&&++C<25);h.state=h.__s,null!=h.getChildContext&&(t=s(s({},t),h.getChildContext())),v||null==h.getSnapshotBeforeUpdate||(k=h.getSnapshotBeforeUpdate(y,_)),$=null!=a&&a.type===p&&null==a.key?a.props.children:a,w(n,Array.isArray($)?$:[$],u,i,t,o,r,f,e,c),h.base=u.__e,u.__h=null,h.__h.length&&f.push(h),b&&(h.__E=h.__=null),h.__e=!1}else null==r&&u.__v===i.__v?(u.__k=i.__k,u.__e=i.__e):u.__e=L(i.__e,u,i,t,o,r,f,c);(a=l.diffed)&&a(u)}catch(n){u.__v=null,(c||null!=r)&&(u.__e=e,u.__h=!!c,r[r.indexOf(e)]=null),l.__e(n,u,i)}}function z(n,u){l.__c&&l.__c(u,n),n.some(function(u){try{n=u.__h,u.__h=[],n.some(function(n){n.call(u)})}catch(n){l.__e(n,u.__v)}})}function L(l,u,i,t,o,r,e,c){var s,h,v,y=i.props,p=u.props,d=u.type,k=0;if("svg"===d&&(o=!0),null!=r)for(;k<r.length;k++)if((s=r[k])&&"setAttribute"in s==!!d&&(d?s.localName===d:3===s.nodeType)){l=s,r[k]=null;break}if(null==l){if(null===d)return document.createTextNode(p);l=o?document.createElementNS("http://www.w3.org/2000/svg",d):document.createElement(d,p.is&&p),r=null,c=!1}if(null===d)y===p||c&&l.data===p||(l.data=p);else{if(r=r&&n.call(l.childNodes),h=(y=i.props||f).dangerouslySetInnerHTML,v=p.dangerouslySetInnerHTML,!c){if(null!=r)for(y={},k=0;k<l.attributes.length;k++)y[l.attributes[k].name]=l.attributes[k].value;(v||h)&&(v&&(h&&v.__html==h.__html||v.__html===l.innerHTML)||(l.innerHTML=v&&v.__html||""))}if(C(l,p,y,o,c),v)u.__k=[];else if(k=u.props.children,w(l,Array.isArray(k)?k:[k],u,i,t,o&&"foreignObject"!==d,r,e,r?r[0]:i.__k&&_(i,0),c),null!=r)for(k=r.length;k--;)null!=r[k]&&a(r[k]);c||("value"in p&&void 0!==(k=p.value)&&(k!==l.value||"progress"===d&&!k||"option"===d&&k!==y.value)&&H(l,"value",k,y.value,!1),"checked"in p&&void 0!==(k=p.checked)&&k!==l.checked&&H(l,"checked",k,y.checked,!1))}return l}function M(n,u,i){try{"function"==typeof n?n(u):n.current=u}catch(n){l.__e(n,i)}}function N(n,u,i){var t,o;if(l.unmount&&l.unmount(n),(t=n.ref)&&(t.current&&t.current!==n.__e||M(t,null,u)),null!=(t=n.__c)){if(t.componentWillUnmount)try{t.componentWillUnmount()}catch(n){l.__e(n,u)}t.base=t.__P=null}if(t=n.__k)for(o=0;o<t.length;o++)t[o]&&N(t[o],u,"function"!=typeof n.type);i||null==n.__e||a(n.__e),n.__e=n.__d=void 0}function O(n,l,u){return this.constructor(n,u)}function P(u,i,t){var o,r,e;l.__&&l.__(u,i),r=(o="function"==typeof t)?null:t&&t.__k||i.__k,e=[],j(i,u=(!o&&t||i).__k=h(p,null,[u]),r||f,f,void 0!==i.ownerSVGElement,!o&&t?[t]:r?null:i.firstChild?n.call(i.childNodes):null,e,!o&&t?t:r?r.__e:i.firstChild,o),z(e,u)}function S(n,l){P(n,l,S)}function q(l,u,i){var t,o,r,f=s({},l.props);for(r in u)"key"==r?t=u[r]:"ref"==r?o=u[r]:f[r]=u[r];return arguments.length>2&&(f.children=arguments.length>3?n.call(arguments,2):i),v(l.type,f,t||l.key,o||l.ref,null)}function B(n,l){var u={__c:l="__cC"+r++,__:n,Consumer:function(n,l){return n.children(l)},Provider:function(n){var u,i;return this.getChildContext||(u=[],(i={})[l]=this,this.getChildContext=function(){return i},this.shouldComponentUpdate=function(n){this.props.value!==n.value&&u.some(b)},this.sub=function(n){u.push(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){u.splice(u.indexOf(n),1),l&&l.call(n)}}),n.children}};return u.Provider.__=u.Consumer.contextType=u}n=e.slice,l={__e:function(n,l,u,i){for(var t,o,r;l=l.__;)if((t=l.__c)&&!t.__)try{if((o=t.constructor)&&null!=o.getDerivedStateFromError&&(t.setState(o.getDerivedStateFromError(n)),r=t.__d),null!=t.componentDidCatch&&(t.componentDidCatch(n,i||{}),r=t.__d),r)return t.__E=t}catch(l){n=l}throw n}},u=0,i=function(n){return null!=n&&void 0===n.constructor},d.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=s({},this.state),"function"==typeof n&&(n=n(s({},u),this.props)),n&&s(u,n),null!=n&&this.__v&&(l&&this.__h.push(l),b(this))},d.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),b(this))},d.prototype.render=p,t=[],g.__r=0,r=0;
//# sourceMappingURL=preact.module.js.map


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SHORT_KEYS: () => (/* binding */ SHORT_KEYS),
/* harmony export */   expandShortKeys: () => (/* binding */ expandShortKeys),
/* harmony export */   shortenKeys: () => (/* binding */ shortenKeys)
/* harmony export */ });
/*
 * Short-key mapping for static preferences in the bundle.
 * Build: webpack loader shortens keys in preferences.json.
 * Runtime: expandShortKeys() restores full keys once after merge.
 */

/** long key -> short key (used by build loader) */
const SHORT_KEYS = {
  id: "i",
  type: "t",
  label: "l",
  value: "v",
  depend: "d",
  help: "h",
  append: "a",
  min: "m",
  name: "n",
  fixed: "f",
  sorted: "s",
  settings: "g",
  connection_id: "c",
  nodelete: "o",
  editable: "e",
  key: "k",
  cmds: "x",
  refreshtime: "r"
};

/** short key -> long key (used at runtime) */
const LONG_KEYS = {};
for (const [long, short] of Object.entries(SHORT_KEYS)) {
  LONG_KEYS[short] = long;
}

/**
 * Recursively expand short keys to full keys (mutates in place).
 * @param {object|array} obj - Preferences tree (short keys)
 * @returns {object|array} - Same tree with full keys
 */
function expandShortKeys(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = expandShortKeys(obj[i]);
    }
    return obj;
  }
  const expanded = {};
  for (const k of Object.keys(obj)) {
    const long = LONG_KEYS[k];
    const key = long !== undefined ? long : k;
    expanded[key] = expandShortKeys(obj[k]);
  }
  return expanded;
}

/**
 * Recursively shorten keys (used by webpack loader only).
 * @param {object|array} obj - Preferences tree (full keys)
 * @returns {object|array} - New tree with short keys
 */
function shortenKeys(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(item => shortenKeys(item));
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const short = SHORT_KEYS[k];
    const key = short !== undefined ? short : k;
    out[key] = shortenKeys(v);
  }
  return out;
}

/***/ }),
/* 11 */
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"settings":{"general":[{"id":"language","type":"pickup","label":"S68","value":"default"},{"id":"theme","type":"pickup","label":"S181","value":"default"},{"id":"autoload","type":"boolean","label":"S64","value":true},{"id":"mobileview","type":"boolean","label":"S122","value":false},{"id":"audio","type":"boolean","label":"S170","value":false},{"id":"hapticfeedback","type":"boolean","label":"S176","value":false},{"id":"audiofeedback","type":"boolean","label":"S200","value":false,"depend":[{"id":"audio","value":true}]},{"id":"showinformationpage","type":"boolean","label":"S196","value":true},{"id":"showmachinesettings","type":"boolean","label":"S197","value":true},{"id":"panelheight","type":"number","label":"S257","min":"200","max":"1200","value":"550","append":"S258"},{"id":"panelminwidth","type":"number","label":"S259","min":"200","max":"600","value":"340","append":"S258"},{"id":"panelmaxwidth","type":"number","label":"S260","min":"0","max":"1200","value":"0","append":"S258"},{"id":"shortcuts","type":"group","label":"S216","value":[{"id":"enableautorepeat","type":"boolean","label":"S217","value":false},{"id":"enableshortcuts","type":"boolean","label":"S215","value":false},{"id":"autorepeatdelay","type":"number","label":"S218","min":"1","append":"S114","value":"500","depend":[{"id":"enableautorepeat","value":true}]}]}],"panels":[],"polling":[{"id":"enablepolling","type":"boolean","label":"S112","value":false},{"id":"pollingcmds","depend":[{"id":"enablepolling","value":true}],"type":"list","sorted":false,"label":"S115","value":[]}],"terminal":[{"id":"showterminalpanel","type":"boolean","label":"S63","value":true},{"id":"terminalsettings","type":"group","label":"","depend":[{"id":"showterminalpanel","value":true}],"value":[{"id":"openterminalonstart","type":"boolean","label":"S93","value":true},{"id":"autoscroll","type":"boolean","label":"S77","value":true},{"id":"verbose","type":"boolean","label":"S76","value":true},{"id":"verbosefilters","type":"list","sorted":false,"label":"S227","value":[],"depend":[{"id":"showterminalpanel","value":true}]}]}],"files":[{"id":"showfilespanel","type":"boolean","label":"S63","value":true},{"id":"openfilesonstart","type":"boolean","label":"S93","value":true,"depend":[{"id":"showfilespanel","value":true}]}],"jog":[{"id":"showjogpanel","type":"boolean","label":"S63","value":true},{"id":"openjogonstart","type":"boolean","label":"S93","value":true,"depend":[{"id":"showjogpanel","value":true}]}],"notification":[{"id":"shownotificationspanel","type":"boolean","label":"S63","value":true},{"id":"opennotificationsonstart","type":"boolean","label":"S93","value":false,"depend":[{"id":"shownotificationspanel","value":true}]},{"id":"notifautoscroll","type":"boolean","label":"S77","value":true,"depend":[{"id":"shownotificationspanel","value":true}]}],"macros":[{"id":"showmacrospanel","type":"boolean","label":"S63","value":false},{"id":"openmacrosonstart","type":"boolean","label":"S93","value":false,"depend":[{"id":"showmacrospanel","value":true}]},{"id":"macros","type":"list","sorted":true,"value":[],"depend":[{"id":"showmacrospanel","value":true}]}],"extracontents":[{"id":"showextracontents","type":"boolean","label":"S63","value":false},{"id":"scanextensions","type":"button","text":"S237","action":"scanExtensions","icon":"Search","depend":[{"id":"showextracontents","value":true}]},{"id":"extracontents","type":"list","sorted":true,"value":[],"depend":[{"id":"showextracontents","value":true}]}]}}');

/***/ }),
/* 12 */
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"settings":{"terminal":[{"id":"terminalsettings","type":"group","value":[{"id":"verbosefilters","type":"list","sorted":false,"label":"S227","value":[{"type":"contain","value":"<"},{"type":"contain","value":"ok"}],"depend":[{"id":"showterminalpanel","value":true}]}]}],"status":[{"id":"showstatuspanel","type":"boolean","label":"S63","value":true},{"id":"openstatusonstart","type":"boolean","label":"S93","value":true,"depend":[{"id":"showstatuspanel","value":true}]}],"probe":[{"id":"showprobepanel","type":"boolean","label":"S63","value":true},{"id":"openprobeonstart","type":"boolean","label":"S93","value":true,"depend":[{"id":"showprobepanel","value":true}]},{"id":"probefeedrate","type":"number","label":"CN9","append":"CN1","value":20,"min":1,"depend":[{"id":"showprobepanel","value":true}]},{"id":"maxprobe","type":"number","label":"CN93","value":15,"append":"CN96","min":0,"depend":[{"id":"showprobepanel","value":true}]},{"id":"probethickness","type":"number","label":"CN94","value":"1","step":"0.001","append":"CN96","min":0,"depend":[{"id":"showprobepanel","value":true}]},{"id":"proberetract","type":"number","label":"CN114","value":"2","step":"0.001","append":"CN96","min":0,"depend":[{"id":"showprobepanel","value":true}]},{"id":"probepostcommand","type":"text","label":"CN95","value":"G10 L20 P0 #selected_axis##probe_thickness#","help":"S97","depend":[{"id":"showprobepanel","value":true}]}],"laser":[{"id":"showlaserpanel","type":"boolean","label":"S63","value":true},{"id":"openlaseronstart","type":"boolean","label":"S93","value":true,"depend":[{"id":"showlaserpanel","value":true}]},{"id":"laser","type":"group","label":"CN90","depend":[{"id":"showlaserpanel","value":true}],"value":[{"id":"lasertest","type":"number","label":"CN85","value":10,"append":"S114","min":1},{"id":"lasertestprecent","type":"number","label":"CN89","value":20,"append":"%","min":0,"max":100}]},{"id":"lasermax","type":"number","label":"CN84","value":1000,"min":1,"depend":[{"id":"showlaserpanel","value":true}]}],"spindle":[{"id":"showspindlepanel","type":"boolean","label":"S63","value":true},{"id":"openspindleonstart","type":"boolean","label":"S93","value":true,"depend":[{"id":"showspindlepanel","value":true}]},{"id":"spindlespeed","type":"number","label":"CN59","value":1000,"min":0,"depend":[{"id":"showspindlepanel","value":true}]},{"id":"showM4ctrls","type":"boolean","label":"CN70","value":true,"depend":[{"id":"showspindlepanel","value":true}]},{"id":"showCoolantctrls","type":"boolean","label":"CN72","value":true,"depend":[{"id":"showspindlepanel","value":true}]},{"id":"showMistctrls","type":"boolean","label":"CN73","value":true,"depend":[{"id":"showCoolantctrls","value":true},{"id":"showspindlepanel","value":true}]},{"id":"showM7ctrls","type":"boolean","label":"CN71","value":false,"depend":[{"id":"showMistctrls","value":true},{"id":"showspindlepanel","value":true}]}],"overrides":[{"id":"showoverridespanel","type":"boolean","label":"S63","value":true},{"id":"openoverridesonstart","type":"boolean","label":"S93","value":true,"depend":[{"id":"showoverridespanel","value":true}]}],"jog":[{"id":"home","type":"group","label":"CN17","depend":[{"id":"showjogpanel","value":true}],"value":[{"id":"homesingleaxis","type":"boolean","label":"CN16","value":false},{"id":"homecmd","type":"text","label":"CN10","value":"$H#","help":"CN11"}]},{"id":"zerocmd","type":"text","label":"CN19","value":"G10 L20 P0 #","help":"CN11","depend":[{"id":"showjogpanel","value":true}]},{"id":"jogstopcmd","type":"text","label":"CN23","value":"#JOGCANCEL#","help":"S97","depend":[{"id":"showjogpanel","value":true}]}]}}');

/***/ }),
/* 13 */
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"settings":{"general":[{"id":"emergencystop","type":"text","label":"P15","value":"#SAFETYDOOR#","help":"S97"}],"panels":[{"id":"fixedpanels","type":"boolean","label":"S203","value":false},{"id":"panelsorder","fixed":true,"sorted":true,"depend":[{"id":"fixedpanels","value":true}],"type":"list","label":"S202","value":[{"id":"Files","name":"files"},{"id":"Terminal","name":"terminal"},{"id":"Jog","name":"jog","value":"jog"},{"id":"Laser","name":"laser"},{"id":"Spindle","name":"spindle"},{"id":"Probe","name":"probe"},{"id":"Tool change","name":"tool"},{"id":"Status","name":"status"},{"id":"Overrides","name":"overrides"},{"id":"Notifications","name":"notification"},{"id":"Macros","name":"macros"},{"id":"Extracontents","name":"extracontents"}]}],"polling":[{"id":"pollingcmds","depend":[{"id":"enablepolling","value":true}],"type":"list","sorted":false,"label":"S115","value":[{"id":"samplepolling","name":"3s","cmds":"?;[ESP701]json","refreshtime":"3000"}]}],"files":[{"id":"filesfilter","type":"text","label":"S96","value":"g;G;gco;GCO;gcode;GCODE;nc;txt;cnc;ngc","help":"S97","depend":[{"id":"showfilespanel","value":true}]},{"id":"flashfsgroup","type":"group","label":"S137","depend":[{"id":"showfilespanel","value":true},{"connection_id":"FlashFileSystem","value":"!=\'none\'"}],"value":[{"id":"flashfs","type":"boolean","label":"S63","value":true},{"id":"sort_flashfs_files","type":"boolean","label":"S224","value":true,"depend":[{"id":"flashfs","value":true}]}]},{"id":"sdfsgroup","type":"group","label":"S190","depend":[{"id":"showfilespanel","value":true},{"connection_id":"SDConnection","value":"!=\'none\'"}],"value":[{"id":"directsd","type":"boolean","label":"S63","value":true},{"id":"sort_directsd_files","type":"boolean","label":"S224","value":true,"depend":[{"id":"directsd","value":true}]}]},{"id":"playcmd","type":"text","label":"P119","value":"$F=#","help":"S97","depend":[{"orGroups":[[{"id":"directsd","value":true}],[{"id":"flashfs","value":true}]]}]},{"id":"default_filesystem","type":"select","label":"S223","value":"FLASH","depend":[{"id":"showfilespanel","value":true},{"orGroups":[[{"id":"sd","value":true}],[{"id":"flashfs","value":true}]]}],"options":[{"value":"FLASH","label":"S137","depend":[{"id":"flashfs","value":true}]},{"value":"DIRECTSD","label":"S190","depend":[{"id":"directsd","value":true},{"connection_id":"SDConnection","value":"!=\'none\'"}]}]}],"tool":[{"id":"showtoolpanel","type":"boolean","label":"S63","value":true},{"id":"opentoolonstart","type":"boolean","label":"S93","value":true,"depend":[{"id":"showtoolpanel","value":true}]}],"jog":[{"id":"axis","type":"group","label":"CN8","depend":[{"id":"showjogpanel","value":true}],"value":[{"id":"showx","type":"boolean","depend":[{"connection_id":"Axisletters","contains":"X"}],"label":"X","value":true},{"id":"showy","type":"boolean","depend":[{"connection_id":"Axisletters","contains":"Y"}],"label":"Y","value":true},{"id":"showz","type":"boolean","depend":[{"connection_id":"Axisletters","contains":"Z"}],"label":"Z","value":true},{"id":"showa","type":"boolean","depend":[{"connection_id":"Axisletters","contains":"A"}],"label":"A","value":true},{"id":"showb","type":"boolean","depend":[{"connection_id":"Axisletters","contains":"B"}],"label":"B","value":true},{"id":"showc","type":"boolean","depend":[{"connection_id":"Axisletters","contains":"C"}],"label":"C","value":true},{"id":"showu","type":"boolean","depend":[{"connection_id":"Axisletters","contains":"U"}],"label":"U","value":true},{"id":"showv","type":"boolean","depend":[{"connection_id":"Axisletters","contains":"V"}],"label":"V","value":true},{"id":"showw","type":"boolean","depend":[{"connection_id":"Axisletters","contains":"W"}],"label":"W","value":true}]},{"id":"feedrate","type":"group","label":"CN9","depend":[{"id":"showjogpanel","value":true}],"value":[{"id":"xyfeedrate","depend":[{"orGroups":[[{"id":"showx","value":true}],[{"id":"showy","value":true}]]},{"connection_id":"Axisletters","contains":"Y"}],"type":"number","label":"XY","min":"1","append":"CN1","value":"1000"},{"id":"zfeedrate","depend":[{"id":"showz","value":true},{"connection_id":"Axisletters","contains":"Z"}],"type":"number","label":"Z","append":"CN1","min":"1","value":"1000"},{"id":"afeedrate","depend":[{"id":"showa","value":true},{"connection_id":"Axisletters","contains":"A"}],"type":"number","label":"A","append":"CN1","min":"1","value":"1000"},{"id":"bfeedrate","depend":[{"id":"showb","value":true},{"connection_id":"Axisletters","contains":"B"}],"type":"number","label":"B","append":"CN1","min":"1","value":"1000"},{"id":"cfeedrate","depend":[{"id":"showc","value":true},{"connection_id":"Axisletters","contains":"C"}],"type":"number","label":"C","append":"CN1","min":"1","value":"1000"},{"id":"ufeedrate","depend":[{"id":"showu","value":true},{"connection_id":"Axisletters","contains":"U"}],"type":"number","label":"U","append":"CN1","min":"1","value":"1000"},{"id":"vfeedrate","depend":[{"id":"showv","value":true},{"connection_id":"Axisletters","contains":"V"}],"type":"number","label":"V","append":"CN1","min":"1","value":"1000"},{"id":"wfeedrate","depend":[{"id":"showw","value":true},{"connection_id":"Axisletters","contains":"W"}],"type":"number","label":"W","append":"CN1","min":"1","value":"1000"}]},{"id":"jogdistances","type":"text","label":"CN18","depend":[{"id":"showjogpanel","value":true}],"value":"mm;100;50;10;1;0.1;in;1;0.5;0.1;0.01;0.001"},{"id":"keymap","sorted":false,"fixed":true,"nodelete":true,"editable":true,"label":"S212","type":"list","depend":[{"id":"showjogpanel","value":true}],"value":[{"id":"btn+X","name":"btn+X","key":"ArrowRight"},{"id":"btn-X","name":"btn-X","key":"ArrowLeft"},{"id":"btnHX","name":"btnHX","key":"X"},{"id":"btnZX","name":"btnZX","key":"1"},{"id":"btn+Y","name":"btn+Y","key":"ArrowUp"},{"id":"btn-Y","name":"btn-Y","key":"ArrowDown"},{"id":"btnHY","name":"btnHY","key":"Y"},{"id":"btnZY","name":"btnZY","key":"2"},{"id":"btn+Z","name":"btn+Z","key":"PageUp"},{"id":"btn-Z","name":"btn-Z","key":"PageDown"},{"id":"btnHZ","name":"btnHZ","key":"Z"},{"id":"btnZZ","name":"btnZZ","key":"3"},{"id":"btn+axis","name":"btn+axis","key":"/"},{"id":"btn-axis","name":"btn-axis","key":"*"},{"id":"btnHaxis","name":"btnHaxis","key":"A"},{"id":"btnZaxis","name":"btnZaxis","key":"4"},{"id":"btnHAll","name":"btnHAll","key":"Home"},{"id":"btnZAll","name":"btnZAll","key":"0"},{"id":"btnaxisSel+","name":"btnaxisSel+","key":"Control+0"},{"id":"btnaxisSel-","name":"btnaxisSel-","key":"Control+0"},{"id":"btndistSel+","name":"btndistSel+","key":"+"},{"id":"btndistSel-","name":"btndistSel-","key":"-"},{"id":"btnStop","name":"btnStop","key":"Control+s"},{"id":"btnEStop","name":"btnEStop","key":"Delete"}]}]}}');

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _shim__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _shim__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_shim__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _src_tabs_interface_importHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _src_tabs_interface_exportHelper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
/* harmony import */ var _stub_targets__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7);
/*
 roundtrip.js - offline test of the preferences import/export round-trip

 Covers the single-representation refactor (palier C / R3):
 - load flow: flat defaults -> formatPreferences -> formatted lists
 - export -> import into already-formatted settings -> formatPreferences
   -> export again: must be identical (UI import flow)
 - export -> import into raw defaults -> formatPreferences -> export:
   must be identical (ESP load flow with a saved preferences.json)
 - re-running formatPreferences on formatted settings must NOT wipe
   runtime flags (hasmodified / editionMode) nor corrupt values
 - export shapes for verbosefilters / panelsorder / extracontents
 - formatItem: openonstart injection and newItem flags

 Run: npm run test:roundtrip
*/




const clone = o => JSON.parse(JSON.stringify(o));

//order-insensitive deep equality
const canon = o => {
  if (Array.isArray(o)) return o.map(canon);
  if (o && typeof o === "object") {
    const r = {};
    Object.keys(o).sort().forEach(k => {
      r[k] = canon(o[k]);
    });
    return r;
  }
  return o;
};
const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
let failures = 0;
const check = (name, cond, detail) => {
  if (cond) {
    console.log("ok   - " + name);
  } else {
    failures++;
    console.log("FAIL - " + name + (detail ? " :: " + detail : ""));
  }
};

//collect every { listEl, listId } in a settings section tree
const collectLists = settings => {
  const lists = [];
  for (const key in settings) {
    const arr = settings[key];
    if (!Array.isArray(arr)) continue;
    arr.forEach(el => {
      if (!el || !el.id) return;
      if (el.type === "list") lists.push({
        listEl: el,
        listId: el.id
      });
      if (el.type === "group" && Array.isArray(el.value)) {
        el.value.forEach(child => {
          if (child && child.type === "list") lists.push({
            listEl: child,
            listId: child.id
          });
        });
      }
    });
  }
  return lists;
};
const isFormattedItem = item => item && Array.isArray(item.value) && item.value.length > 0 && typeof item.value[0] === "object" && item.value[0] !== null && item.value[0].name !== undefined;

//------------------------------------------------------------------
// 1 - Load flow: formatPreferences expands flat defaults
//------------------------------------------------------------------
const settings = clone(_stub_targets__WEBPACK_IMPORTED_MODULE_3__.defaultPreferences.settings);
(0,_src_tabs_interface_importHelper__WEBPACK_IMPORTED_MODULE_1__.formatPreferences)(settings);
const lists = collectLists(settings);
check("found editable lists in defaults", lists.length >= 4, "nb=" + lists.length);
let allFormatted = true;
let badNb = false;
lists.forEach(({
  listEl
}) => {
  if (listEl.nb !== listEl.value.length) badNb = true;
  listEl.value.forEach(item => {
    if (!isFormattedItem(item)) allFormatted = false;
  });
});
check("all list items formatted after load", allFormatted);
check("list nb matches item count", !badNb);

//every sub-field carries editor metadata
let metaOk = true;
lists.forEach(({
  listEl
}) => {
  listEl.value.forEach(item => {
    item.value.forEach(sf => {
      if (typeof sf.name !== "string" || !sf.type || sf.label === undefined) metaOk = false;
    });
  });
});
check("every sub-field has name/type/label", metaOk);

//extracontents: openonstart injected even when absent from defaults
const extraList = lists.find(l => l.listId === "extracontents");
if (extraList) {
  const missing = extraList.listEl.value.filter(item => !item.value.some(sf => sf.name === "openonstart"));
  check("extracontents items all have openonstart", missing.length === 0);
} else {
  check("extracontents list exists", false);
}

//------------------------------------------------------------------
// 2 - Export A (reference)
//------------------------------------------------------------------
const exportA = (0,_src_tabs_interface_exportHelper__WEBPACK_IMPORTED_MODULE_2__.exportPreferencesSection)(settings, true);
check("export A has settings keys", Object.keys(exportA).length > 10);

//export shapes per list kind
if (Array.isArray(exportA.verbosefilters)) {
  const ok = exportA.verbosefilters.every(f => Object.keys(f).every(k => k === "type" || k === "value"));
  check("verbosefilters export is {type,value} only", ok);
}
if (Array.isArray(exportA.panelsorder)) {
  const ok = exportA.panelsorder.every(p => Object.keys(p).every(k => k === "id" || k === "name"));
  check("panelsorder export is {id,name} only", ok);
}
if (Array.isArray(exportA.extracontents)) {
  const metadata = ["owner", "version", "github", "description", "supportedVersion", "targetSystem"];
  const ok = exportA.extracontents.every(p => !metadata.some(k => k in p));
  check("extracontents export strips extension metadata", ok);
}

//------------------------------------------------------------------
// 3 - UI import flow: import exportA into the formatted settings
//------------------------------------------------------------------
const [afterImport, importErrors] = (0,_src_tabs_interface_importHelper__WEBPACK_IMPORTED_MODULE_1__.importPreferencesSection)(settings, exportA);
check("UI import reports no error", importErrors === false);
(0,_src_tabs_interface_importHelper__WEBPACK_IMPORTED_MODULE_1__.formatPreferences)(afterImport);
const exportB = (0,_src_tabs_interface_exportHelper__WEBPACK_IMPORTED_MODULE_2__.exportPreferencesSection)(afterImport, true);
check("round-trip UI import/export is stable", same(exportA, exportB));

//------------------------------------------------------------------
// 4 - Re-format must preserve runtime flags and not corrupt values
//------------------------------------------------------------------
const anyList = collectLists(afterImport).find(l => l.listEl.value.length > 0);
if (anyList) {
  const item = anyList.listEl.value[0];
  const field = item.value[0];
  field.hasmodified = true;
  item.editionMode = true;
  (0,_src_tabs_interface_importHelper__WEBPACK_IMPORTED_MODULE_1__.formatPreferences)(afterImport);
  check("re-format keeps hasmodified flag", anyList.listEl.value[0].value[0].hasmodified === true);
  check("re-format keeps editionMode flag", anyList.listEl.value[0].editionMode === true);
  check("re-format keeps formatted shape (no double-nesting)", isFormattedItem(anyList.listEl.value[0]) && typeof anyList.listEl.value[0].value[0].value !== "object");
} else {
  check("non-empty list available for flag test", false);
}

//------------------------------------------------------------------
// 5 - ESP load flow: import exportA into raw defaults
//------------------------------------------------------------------
const rawDefaults = clone(_stub_targets__WEBPACK_IMPORTED_MODULE_3__.defaultPreferences.settings);
const [merged, loadErrors] = (0,_src_tabs_interface_importHelper__WEBPACK_IMPORTED_MODULE_1__.importPreferencesSection)(rawDefaults, exportA);
check("ESP load import reports no error", loadErrors === false);
(0,_src_tabs_interface_importHelper__WEBPACK_IMPORTED_MODULE_1__.formatPreferences)(merged);
const exportC = (0,_src_tabs_interface_exportHelper__WEBPACK_IMPORTED_MODULE_2__.exportPreferencesSection)(merged, true);
check("round-trip ESP load/export is stable", same(exportA, exportC));

//------------------------------------------------------------------
// 6 - formatItem: new item flags and openonstart injection
//------------------------------------------------------------------
const newPanel = (0,_src_tabs_interface_importHelper__WEBPACK_IMPORTED_MODULE_1__.formatItem)({
  id: "x1",
  name: "Test panel",
  icon: "Star",
  target: "panel",
  source: "/test",
  type: "content",
  refreshtime: "0"
}, -1, "extracontents");
check("openonstart injected on legacy extracontents item", newPanel.value.some(sf => sf.name === "openonstart" && sf.value === true));
check("newItem flag set on every sub-field",
//use an item that already has openonstart: no injection, all fields flagged
(0,_src_tabs_interface_importHelper__WEBPACK_IMPORTED_MODULE_1__.formatItem)({
  id: "x3",
  name: "p",
  icon: "Star",
  target: "panel",
  source: "/t",
  type: "content",
  refreshtime: "0",
  openonstart: true
}, -1, "extracontents").value.every(sf => sf.newItem === true));
check("openonstart not duplicated when already present", (0,_src_tabs_interface_importHelper__WEBPACK_IMPORTED_MODULE_1__.formatItem)({
  id: "x2",
  name: "p",
  icon: "Star",
  target: "panel",
  source: "/t",
  type: "content",
  refreshtime: "0",
  openonstart: false
}, -1, "extracontents").value.filter(sf => sf.name === "openonstart").length === 1);
const newMacro = (0,_src_tabs_interface_importHelper__WEBPACK_IMPORTED_MODULE_1__.formatItem)({
  id: "m1",
  name: "Macro 1",
  icon: "Star",
  type: "CMD",
  cmds: "G28"
}, -1, "macros");
const macroType = newMacro.value.find(sf => sf.name === "type");
check("macro type has 4 options", macroType && Array.isArray(macroType.options) && macroType.options.length === 4);
check("macro FS option keeps its depend block", macroType && macroType.options.some(o => o.value === "FS" && Array.isArray(o.depend) && o.depend.length === 3));

//------------------------------------------------------------------
console.log(failures === 0 ? "\nAll round-trip tests passed" : "\n" + failures + " test(s) FAILED");
process.exit(failures === 0 ? 0 : 1);
})();

/******/ })()
;