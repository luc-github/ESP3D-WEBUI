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
        if (key != "id") {
            const newItem = {}
            newItem.id = itemData.id + "-" + key
            newItem.name = key
            newItem.value = itemData[key]
            newItem.initial = itemData[key]
            if (index == -1) newItem.newItem = true
            switch (key) {
                case "cmds":
                    newItem.type = "text"
                    newItem.label = "S115"
                    newItem.help = "S97"
                    break
                case "key":
                    newItem.type = "text"
                    newItem.label = "key"
                    newItem.shortkey = true
                    break
                case "name":
                    newItem.type = "text"
                    newItem.label = "S129"
                    break
                case "icon":
                    newItem.type = "icon"
                    newItem.label = "S132"
                    break
                case "refreshtime":
                    newItem.type = "number"
                    newItem.min = 0
                    newItem.minsecondary = 100
                    newItem.step = 100
                    newItem.append = "S114"
                    newItem.label = "S113"
                    break
                case "type":
                    newItem.type = "select"
                    newItem.label = "S135"
                    if (origineId == "macros") {
                        newItem.options = [
                            {
                                label: "S137",
                                value: "FS",
                                depend: [
                                    {
                                        id: "flashfs",
                                        value: true,
                                    },

                                    {
                                        connection_id: "FlashFileSystem",
                                        value: "!='none'",
                                    },
                                    {
                                        connection_id: "FWTargetID",
                                        value: "!='30'",
                                    },
                                ],
                            },
                            {
                                label: "S138",
                                value: "SD",
                                depend: [
                                    {
                                        ids: [
                                            {
                                                id: "sd",
                                                value: true,
                                            },
                                            {
                                                id: "directsd",
                                                value: true,
                                            },
                                            {
                                                id: "ext",
                                                value: true,
                                            },
                                            {
                                                id: "directsdext",
                                                value: true,
                                            },
                                            {
                                                id: "tftsd",
                                                value: true,
                                            },
                                        ],
                                    },
                                    {
                                        connection_id: "SDConnection",
                                        value: "!='none'",
                                    },
                                ],
                            },
                            { label: "S139", value: "URI" },
                            { label: "S140", value: "CMD" },
                        ]
                    } else {
                        newItem.options = [
                            { label: "S160", value: "image" },
                            { label: "S161", value: "content" },
                            { label: "S121", value: "extension" },
                            { label: "S162", value: "camera" },
                        ]
                    }
                    break
                case "target":
                    newItem.type = "select"
                    newItem.label = "S136"
                    newItem.options = [
                        { label: "S158", value: "page" },
                        { label: "S157", value: "panel" },
                    ]
                    break
                case "source":
                    newItem.type = "text"
                    newItem.label = "S139"
                    newItem.min = "2"
                    break
                case "action":
                    newItem.type = "text"
                    newItem.label = "S159"
                    newItem.min = "1"
                    break
                default:
                    newItem.type = "text"
                    newItem.label = key
            }
            itemFormated.value.push(newItem)
        }
    })
    return itemFormated
}

/**
 * Formats the items list.
 *
 * @param {Array} itemsList - The list of items to be formatted.
 * @param {string} origineId - The origin ID.
 * @returns {Array} - The formatted items list.
 */
function formatItemsList(itemsList, origineId) {
    const formatedItems = []
    itemsList.forEach((element, index) => {
        formatedItems.push(formatItem(element, index, origineId))
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
    for (let key in section) {
        if (Array.isArray(section[key])) {
            for (let index = 0; index < section[key].length; index++) {
                if (section[key][index].type == "group") {
                    section[key][index].value.forEach((element, index) => {
                        element.initial = element.value
                    })
                } else if (section[key][index].type == "list") {
                    section[key][index].nb = section[key][index].value.length
                    section[key][index].value = formatItemsList(
                        [...section[key][index].value],
                        section[key][index].id
                    )
                } else section[key][index].initial = section[key][index].value
            }
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
    const currentPreferences = JSON.parse(JSON.stringify(currentPreferencesData));
  
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

export { importPreferencesSection, formatPreferences, formatItem }
