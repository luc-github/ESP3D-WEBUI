/*
 helpers.js - ESP3D WebUI Target file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

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
import { h } from "preact"

const BitsArray = {
    bits: [],
    size: 0,
    fromInt: (intVal, arraySize) => {
        this.bits = intVal.toString(2).split("").reverse()
        this.size = arraySize
        //Sanity check to have proper size
        while (this.size < arraySize) {
            bits.push("0")
        }
    },
    fromArray: (arrayVal) => {
        this.bits = []
        this.size = arrayVal.length
        for (let index = 0; index < this.size; index++) {
            if (arrayVal[index]) {
                if (arrayVal[index] == "0") {
                    this.bits[index] = "0"
                } else {
                    this.bits[index] = "1"
                }
            } else {
                this.bits[index] = "0"
            }
        }
    },
    getBit: (index) => {
        return parseInt(this.bits[index])
    },
    setBit: (index, value) => {
        this.bits[index] = value == 0 ? "0" : "1"
    },
    toInt: () => {
        for (let index = 0; index < this.size; index++) {
            if (typeof this.bits[index] == "undefined") {
                this.bits[index] = "0"
            }
        }
        return parseInt(this.bits.reverse().join(""), 2)
    },
}

export { BitsArray }
