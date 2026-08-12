/*
 printerCapabilities.js - ESP3D WebUI Target file

 Copyright (c) 2026 ESP3D WebUI contributors. All rights reserved.

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.
*/
import { addObjectItem } from "../../../components/Helpers"

// Keep this outside TargetContext: SD-source is reached through processor,
// which TargetContext imports, so importing TargetContext here would cycle.
const printerCapabilities = []

const addPrinterCapabilities = (capabilities) => {
    capabilities.forEach((capability) => {
        addObjectItem(printerCapabilities, "name", capability)
    })
}

const getPrinterCapability = (name) =>
    printerCapabilities.find((capability) => capability.name == name)?.value

export { addPrinterCapabilities, getPrinterCapability }
