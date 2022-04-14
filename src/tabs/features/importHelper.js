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

function importFeatures(currentFeaturesData, importedFeatures) {
    const currentFeatures = JSON.parse(JSON.stringify(currentFeaturesData))
    let haserrors = false
    Object.keys(importedFeatures).map((sectionId) => {
        const section = importedFeatures[sectionId]
        Object.keys(section).map((subsectionId) => {
            const subsection = section[subsectionId]
            Object.keys(subsection).map((entryId) => {
                const entry = subsection[entryId]
                if (
                    currentFeatures &&
                    currentFeatures[sectionId] &&
                    Array.isArray(currentFeatures[sectionId][subsectionId])
                ) {
                    const featureId = currentFeatures[sectionId][
                        subsectionId
                    ].find((element) => element.id === entry.id)
                    if (featureId) {
                        featureId.value = entry.value
                    } else {
                        //TODO: TBD
                        haserrors = true
                        console.log(
                            "Cannot find entry:",
                            sectionId,
                            ".",
                            subsectionId,
                            ".",
                            entry.id
                        )
                    }
                } else {
                    //TODO: TBD
                    haserrors = true
                    console.log(
                        "Cannot find section:",
                        sectionId,
                        ".",
                        subsectionId
                    )
                }
            })
        })
    })
    return [currentFeatures, haserrors]
}

export { importFeatures }
