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

import { clone, fieldMeta } from "../../components/Helpers"

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
    const itemFormated = {}
    itemFormated.id = itemData.id
    //to track any change in order
    itemFormated.index = index
    itemFormated.value = []
    Object.keys(itemData).forEach((key) => {
        if (key === "id") return
        const newItem = {
            id: itemData.id + "-" + key,
            name: key,
            value: itemData[key],
            initial: itemData[key],
            ...fieldMeta(key, origineId),
        }
        if (index == -1) newItem.newItem = true
        itemFormated.value.push(newItem)
    })
    // For extracontents items saved before openonstart was introduced, inject the default
    if (origineId === "extracontents" && !("openonstart" in itemData)) {
        itemFormated.value.push({
            id: itemData.id + "-openonstart",
            name: "openonstart",
            value: true,
            initial: true,
            type: "boolean",
            label: "S93",
        })
    }
    return itemFormated
}

/**
 * True if the list item is already in "formatted" form, i.e. the single
 * internal representation: value is an array of { name, value, ... } sub-fields.
 * Flat form ({ id, type, value, ... }) only exists in preferences.json files
 * and in the raw default preferences — it is expanded once at load/import.
 */
function isFormattedItem(item) {
    if (!item || typeof item !== "object") return false
    const val = item.value
    if (!Array.isArray(val) || val.length === 0) return false
    const first = val[0]
    return typeof first === "object" && first !== null && first.name !== undefined
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
    const formatedItems = []
    itemsList.forEach((element, index) => {
        if (isFormattedItem(element)) {
            element.index = index
            formatedItems.push(element)
            return
        }
        let el = element
        if (origineId === "verbosefilters" && (el.id == null || el.id === "")) {
            el = { ...el, id: (el.type != null ? String(el.type) : "filter") + "-" + index }
        }
        formatedItems.push(formatItem(el, index, origineId))
    })
    return formatedItems
}


/**
 * Formats the preferences section to add inital value when missing
 *
 * @param {Object} section - The preferences section to format.
 * @returns {Object} - The formatted settings.
 */
function formatPreferences(section) {
    function formatSection(arr) {
        if (!Array.isArray(arr)) return
        for (let index = 0; index < arr.length; index++) {
            const el = arr[index]
            if (el.type == "group") {
                if (Array.isArray(el.value)) {
                    el.value.forEach((element) => {
                        element.initial = element.value
                    })
                    // Also format list items inside the group
                    el.value.forEach((element) => {
                        if (element.type == "list" && Array.isArray(element.value)) {
                            element.nb = element.value.length
                            element.value = formatItemsList(
                                [...element.value],
                                element.id
                            )
                        }
                    })
                }
            } else if (el.type == "list") {
                el.nb = el.value.length
                el.value = formatItemsList([...el.value], el.id)
            } else {
                el.initial = el.value
            }
        }
    }
    for (let key in section) {
        if (Array.isArray(section[key])) {
            formatSection(section[key])
        }
    }
    return section
}

/**
 * Imports preferences into the current preferences data.
 * @param {Object} currentPreferencesData - The current preferences data section.
 * @param {Object} importedPreferences - The preferences to be imported section.
 * @returns {Array} An array containing a copy of preferences data section with imported data and a flag indicating if there were any errors during the import.
 */
function importPreferencesSection(currentPreferencesData, importedPreferences) {
    let hasErrors = false;
    const currentPreferences = clone(currentPreferencesData);
  
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

export {
    importPreferencesSection,
    formatPreferences,
    formatItem,
}
