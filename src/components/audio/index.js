/*
audio.js - ESP3D audio management file

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
import { preferences } from "../app"

/*
 * Local variables
 *
 */
var beepListList = []
var beepongoing = false
let audioCtx
let gainNode
let oscillator
let audioinitdone = false

/*
 * Some constants
 */

/*
 * init Audion context
 *
 */
function initAudio() {
    if (!audioinitdone) {
        if (typeof window.AudioContext !== "undefined") {
            audioCtx = new window.AudioContext()
        } else if (typeof window.webkitAudioContext() !== "undefined") {
            audioCtx = new window.webkitAudioContext()
        } else if (typeof window.audioContext !== "undefined") {
            audioCtx = new window.audioContext()
        }
        //need this one but I do not understand why???
        //if not, the first call to beep is ignored or not audible
        beep(200, 0)
        audioinitdone = true
    }
}

/*
 * Play sound from list function
 *
 */
function playSound() {
    if (preferences.settings.sound == false) return
    beepongoing = true
    if (typeof audioCtx == "undefined") initAudio()
    if (beepListList.length > 0) {
        let b = beepListList.shift()
        if (typeof oscillator != "undefined") oscillator.stop()
        oscillator = audioCtx.createOscillator()
        gainNode = audioCtx.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioCtx.destination)
        gainNode.gain.value = 1
        oscillator.frequency.value = b.f
        oscillator.type = "square"
        oscillator.start()
        setTimeout(playSound, b.d)
    } else {
        oscillator.stop()
        beepongoing = false
    }
}

/*
 * Beep function
 *
 */
function beep(duration, frequency) {
    if (preferences.settings.sound == false) return
    beepListList.push({ d: duration, f: frequency })
    if (beepongoing) {
        return
    }
    playSound()
}

/*
 * Beep error
 *
 */
function beepError() {
    beep(100, 200)
    beep(100, 660)
}

export { beep, beepError, initAudio }
