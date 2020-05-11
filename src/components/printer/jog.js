/*
 jog.js - ESP3D WebUI job file

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
import { T } from "../translations"
import {
    ZapOff,
    AlertCircle,
    Activity,
    Send,
    Home,
    Crosshair,
} from "preact-feather"
import { defaultMachineValues } from "./preferences"

/*
 * Local variables
 *
 */

let lastSpeed = 100
let currentSpeed = 100

const JogPanel = ({ preferences }) => {
    const sendHomeCommand = e => {
        console.log("send" + e.target.parentElement.id)
        e.target.classList.add("std")
        e.target.classList.remove("pressedbutton")
    }

    const onMouseDown = e => {
        e.target.classList.add("pressedbutton")
        e.target.classList.remove("std")
    }

    const onOut = e => {
        e.target.classList.add("std")
        e.target.classList.remove("pressedbutton")
    }

    const sendJogCommand = e => {
        console.log("send" + e.target.parentElement.id)
        e.target.classList.add("std")
        e.target.classList.remove("pressedbutton")
    }

    const sendMoveCommand = e => {
        console.log("send center" + e.target.parentElement.id)
        e.target.classList.add("std")
        e.target.classList.remove("pressedbutton")
    }

    const onHoverJog = e => {
        switch (e.target.parentElement.id) {
            case "X+100":
            case "Y+100":
            case "X-100":
            case "Y-100":
                document.getElementById("xy100").style.opacity = "1"
                break
            case "X+10":
            case "Y+10":
            case "X-10":
            case "Y-10":
                document.getElementById("xy10").style.opacity = "1"
                break
            case "X+1":
            case "Y+1":
            case "X-1":
            case "Y-1":
                document.getElementById("xy1").style.opacity = "1"
                break
            case "X+0_1":
            case "Y+0_1":
            case "X-0_1":
            case "Y-0_1":
                document.getElementById("xy0_1").style.opacity = "1"
                break
            case "Z+0_1":
            case "Z-0_1":
                document.getElementById("z0_1").style.opacity = "1"
                break
            case "Z+1":
            case "Z-1":
                document.getElementById("z1").style.opacity = "1"
                break
            case "Z+10":
            case "Z-10":
                document.getElementById("z10").style.opacity = "1"
                break
        }
    }

    const onOutJog = e => {
        onOut(e)
        switch (e.target.parentElement.id) {
            case "X+100":
            case "Y+100":
            case "X-100":
            case "Y-100":
                document.getElementById("xy100").style.opacity = "0.2"
                break
            case "X+10":
            case "Y+10":
            case "X-10":
            case "Y-10":
                document.getElementById("xy10").style.opacity = "0.2"
                break
            case "X+1":
            case "Y+1":
            case "X-1":
            case "Y-1":
                document.getElementById("xy1").style.opacity = "0.2"
                break
            case "X+0_1":
            case "Y+0_1":
            case "X-0_1":
            case "Y-0_1":
                document.getElementById("xy0_1").style.opacity = "0.2"
                break
            case "Z+0_1":
            case "Z-0_1":
                document.getElementById("z0_1").style.opacity = "0.2"
                break
            case "Z+1":
            case "Z-1":
                document.getElementById("z1").style.opacity = "0.2"
                break
            case "Z+10":
            case "Z-10":
                document.getElementById("z10").style.opacity = "0.2"
                break
        }
    }

    const onMouseDownJog = e => {
        onMouseDown(e)
    }

    const onInputSpeedSlider = e => {
        console.log(e.target.value)
        document.getElementById("speedinput").value = e.target.value
        currentSpeed = e.target.value
        if (currentSpeed == lastSpeed) {
            document.getElementById("speedinputbtn").classList.add("invisible")
        } else {
            document
                .getElementById("speedinputbtn")
                .classList.remove("invisible")
        }
    }

    const onInputSpeedInput = e => {
        console.log(e.target.value)
        document.getElementById("speedslider").value = e.target.value
        currentSpeed = e.target.value
        if (currentSpeed == lastSpeed) {
            document.getElementById("speedinputbtn").classList.add("invisible")
        } else {
            document
                .getElementById("speedinputbtn")
                .classList.remove("invisible")
        }
    }

    const onSet = e => {
        console.log("send :" + document.getElementById("speedslider").value)
    }
    if (typeof preferences.zfeedrate == "undefined")
        preferences.zfeedrate = defaultMachineValues("zfeedrate")
    if (typeof preferences.xyfeedrate == "undefined")
        preferences.zfeedrate = defaultMachineValues("xyfeedrate")
    if (typeof preferences.xpos == "undefined")
        preferences.zfeedrate = defaultMachineValues("xpos")
    if (typeof preferences.ypos == "undefined")
        preferences.zfeedrate = defaultMachineValues("ypos")
    return (
        <div>
            <div class="show-low">
                <div class="d-flex flex-row justify-content-center">
                    <div class="d-flex flex-column justify-content-center border">
                        <div class="p-2">
                            <button class="btn btn-default">X+</button>
                        </div>
                        <div class="p-2">
                            <button class="btn btn-default">
                                <Home />
                            </button>
                        </div>
                        <div class="p-2">
                            <button class="btn btn-default">X-</button>
                        </div>
                    </div>
                    <div class="p-1" />
                    <div class="d-flex flex-column justify-content-center border">
                        <div class="p-2">
                            <button class="btn btn-default">Y+</button>
                        </div>
                        <div class="p-2">
                            <button class="btn btn-default">
                                <Home />
                            </button>
                        </div>
                        <div class="p-2">
                            <button class="btn btn-default">Y-</button>
                        </div>
                    </div>
                    <div class="p-1" />
                    <div class="d-flex flex-column justify-content-center border">
                        <div class="p-2">
                            <button class="btn btn-default">Z+</button>
                        </div>
                        <div class="p-2">
                            <button class="btn btn-default">
                                <Home />
                            </button>
                        </div>
                        <div class="p-2">
                            <button class="btn btn-default">Z-</button>
                        </div>
                    </div>
                    <div class="p-1" />
                    <div class="d-flex flex-column justify-content-left border p-1">
                        <span class="badge badge-secondary">mm</span>
                        <div class="p-1">
                            <div class="form-check">
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    name="exampleRadios"
                                    id="exampleRadios100"
                                    value="option1"
                                    checked="yes"
                                />
                                <label
                                    class="form-check-label"
                                    for="exampleRadios100"
                                    style="width:2rem"
                                >
                                    100
                                </label>
                            </div>
                        </div>
                        <div class="p-1">
                            <div class="form-check">
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    name="exampleRadios"
                                    id="exampleRadios10"
                                    value="option1"
                                    checked="yes"
                                />
                                <label
                                    class="form-check-label"
                                    for="exampleRadios10"
                                    style="width:2rem"
                                >
                                    10
                                </label>
                            </div>
                        </div>
                        <div class="p-1">
                            <div class="form-check justify-content-left">
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    name="exampleRadios"
                                    id="exampleRadios1"
                                    value="option1"
                                    checked="yes"
                                />
                                <label
                                    class="form-check-label"
                                    for="exampleRadios1"
                                    style="width:2rem"
                                >
                                    1
                                </label>
                            </div>
                        </div>
                        <div class="p-1">
                            <div class="form-check ">
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    name="exampleRadios"
                                    id="exampleRadios0_1"
                                    value="option1"
                                    checked="yes"
                                />
                                <label
                                    class="form-check-label"
                                    for="exampleRadios0_1"
                                    style="width:2rem"
                                >
                                    0.1
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex flex-row justify-content-center">
                    <div class="p-2">
                        <button class="btn btn-default" style="width:12rem">
                            <Home /> XYZ
                        </button>
                    </div>
                    <div class="p-2">
                        <button class="btn btn-default ">
                            <Crosshair />
                            <span class="text-button">XY </span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="hide-low">
                <svg
                    width="310"
                    viewBox="0 -5 310 255"
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                >
                    <defs>
                        <filter
                            id="f1"
                            x="-1"
                            y="-1"
                            width="300%"
                            height="300%"
                        >
                            <feOffset
                                result="offOut"
                                in="SourceAlpha"
                                dx="3"
                                dy="3"
                            ></feOffset>
                            <feGaussianBlur
                                result="blurOut"
                                in="offOut"
                                stdDeviation="4"
                            ></feGaussianBlur>
                            <feBlend
                                in="SourceGraphic"
                                in2="blurOut"
                                mode="normal"
                            ></feBlend>
                        </filter>
                        <symbol
                            id="HomeIcon"
                            viewBox="0 0 20 18"
                            pointer-events="none"
                        >
                            <desc>HomeIcon - house</desc>
                            <path
                                class="home"
                                d="M3,18 v-8 l7,-6 l7,6 v8 h-5 v-6 h-4 v6 z"
                                fill="black"
                            ></path>
                            <path
                                class="home"
                                d="M0,10 l10-8.5 l10,8.5"
                                stroke-width="1.5"
                                fill="none"
                            ></path>
                            <path
                                class="home"
                                d="M15,3 v2.8 l1,.8 v-3.6 z"
                            ></path>
                        </symbol>
                    </defs>
                    <g
                        id="HomeAll"
                        onmouseup={sendHomeCommand}
                        onmousedown={onMouseDown}
                        onmouseout={onOut}
                    >
                        <title>{T("P6")}</title>
                        <path
                            class="std"
                            d="M10 182.5 h-10 v57.5 h57.5 v-10 a 125,125 0 0,1 -47.5 -47.5 Z"
                            fill="#f0f0f0"
                        ></path>
                        <use
                            x="3"
                            y="217"
                            width="20"
                            height="18"
                            xlinkHref="#HomeIcon"
                        ></use>
                    </g>
                    <g
                        id="HomeX"
                        onmouseup={sendHomeCommand}
                        onmousedown={onMouseDown}
                        onmouseout={onOut}
                    >
                        <title>{T("P7")}</title>
                        <path
                            class="std"
                            d="M10 57.50 h-10 v-57.5 h57.5 v10 a 125,125 0 0,0 -47.5 47.5 Z"
                            fill="Khaki"
                        ></path>
                        <use
                            x="3"
                            y="5"
                            width="20"
                            height="18"
                            xlinkHref="#HomeIcon"
                        ></use>
                        <text x="25" y="20" class="home">
                            X
                        </text>
                    </g>
                    <g
                        id="HomeY"
                        onmouseup={sendHomeCommand}
                        onmousedown={onMouseDown}
                        onmouseout={onOut}
                    >
                        <title>{T("P8")}</title>
                        <path
                            class="std"
                            d="M230 57.50 h10 v-57.5 h-57.5 v10 a 125,125 0 0,1 47.5 47.5 z"
                            fill="SteelBlue"
                        ></path>
                        <use
                            x="217"
                            y="5"
                            width="20"
                            height="18"
                            xlinkHref="#HomeIcon"
                        ></use>
                        <text x="202" y="20" class="home">
                            Y
                        </text>
                    </g>
                    <g
                        id="HomeZ"
                        onmouseup={sendHomeCommand}
                        onmousedown={onMouseDown}
                        onmouseout={onOut}
                    >
                        <title>{T("P9")}</title>
                        <path
                            class="std"
                            d="M230 182.5 h10 v57.5 h-57.5 v-10 a 125,125 0 0,0 47.5 -47.5 z"
                            fill="DarkSeaGreen"
                        ></path>
                        <use
                            x="217"
                            y="217"
                            width="20"
                            height="18"
                            xlinkHref="#HomeIcon"
                        ></use>
                        <text x="202" y="232" class="home" id="homeZlabel">
                            Z
                        </text>
                    </g>
                    <g id="Jog100" fill="#c0c0c0" class="std">
                        <g
                            id="Y+100"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M-60 -67.07 L-75.93,-83 A112.5,112.5 0 0,1 75,-83 L60,-67.07 A90,90 0 0,0 -60.00,-67.07 z"
                            ></path>
                        </g>
                        <g
                            id="X+100"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M67.07,-60 L83,-75.93 A112.5,112.5 0 0,1 83,75.93 L67.07,60 A90,90 0 0,0 67.07,-60"
                            ></path>
                        </g>
                        <g
                            id="Y-100"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M-60,67.07 L-75.93,83 A112.5,112.5 0 0,0 75,83 L60,67.07 A90,90 0 0,1 -60.00,67.07 z"
                            ></path>
                        </g>
                        <g
                            id="X-100"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M-67.07,-60 L-83,-75.93 A112.5,112.5 0 0,0 -83,75.93 L-67.07,60 A90,90 0 0,1 -67.07,-60 z"
                            ></path>
                        </g>
                    </g>
                    <g id="Jog10" fill="#d0d0d0">
                        <g
                            id="Y+10"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M-44.06 -51.13 L-60,-67.07 A90,90 0 0,1 60,-67 L44.06,-51.13 A67.5,67.5 0 0,0 -44.06,-51.13 z"
                            ></path>
                        </g>
                        <g
                            id="X+10"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M51.13 44.06 L67.07,60 A90,90 0 0,0 67.07,-60 L51.13,-44.06 A67.5,67.5 0 0,1 51.13,44.06 z"
                            ></path>
                        </g>
                        <g
                            id="Y-10"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M-44.06 51.13 L-60,67.07 A90,90 0 0,0 60,67 L44.06,51.13 A67.5,67.5 0 0,1 -44.06,51.13 z"
                            ></path>
                        </g>
                        <g
                            id="X-10"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M-51.13 44.06 L-67.07,60 A90,90 0 0,1 -67.07,-60 L-51.13,-44.06 A67.5,67.5 0 0,0 -51.13,44.06 z"
                            ></path>
                        </g>
                    </g>
                    <g id="Jog1" fill="#e0e0e0">
                        <g
                            id="Y+1"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M-28.09 -35.16 L-44.06,-51.13 A67.5,67.5 0 0,1 44.06,-51.13 L28.09,-35.16 A45,45 0 0,0 -28.09,-35.16 z"
                            ></path>
                        </g>
                        <g
                            id="X+1"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M35.16 -28.09 L51.13,-44.06 A67.5,67.05 0 0,1 51.13,44.06 L35.16,28.09 A45,45 0 0,0 35.16,-28.09 z"
                            ></path>
                        </g>
                        <g
                            id="Y-1"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M-28.09 35.16 L-44.06,51.13 A67.5,67.5 0 0,0 44.06,51.13 L28.09,35.16 A45,45 0 0,1 -28.09,35.16 z"
                            ></path>
                        </g>
                        <g
                            id="X-1"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M-35.16 -28.09 L-51.13,-44.06 A67.5,67.05 0 0,0 -51.13,44.06 L-35.16,28.09 A45,45 0 0,1 -35.16,-28.09 z"
                            ></path>
                        </g>
                    </g>
                    <g id="Jog0_1" fill="#f0f0f0">
                        <g
                            id="Y+0_1"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M-28.09 -35.16 A45,45 0 0,1 29.09,-35.16 L0,-7.07 z"
                            ></path>
                        </g>
                        <g
                            id="X+0_1"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M35.16 -28.09 A45,45 0 0,1 35.16,28.09 L7.07,0 z"
                            ></path>
                        </g>
                        <g
                            id="Y-0_1"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M-28.09 35.16 A45,45 0 0,0 29.09,35.16 L0,7.07 z"
                            ></path>
                        </g>
                        <g
                            id="X-0_1"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                            transform="translate(120 120)"
                        >
                            <path
                                class="std"
                                d="M-35.16 -28.09 A45,45 0 0,0 -35.16,28.09 L-7.07,0 z"
                            ></path>
                        </g>
                    </g>
                    <g id="xy0_1" style="opacity:0.2">
                        <circle class="scl" cx="144" cy="96" r="9.5"></circle>
                        <text class="scl" x="137" y="99" font-size="10">
                            0.1
                        </text>
                    </g>
                    <g id="xy1" style="opacity:0.2">
                        <circle
                            class="scl"
                            cx="159.5"
                            cy="80.5"
                            r="10.5"
                        ></circle>
                        <text class="scl" x="155" y="85" font-size="14">
                            1
                        </text>
                    </g>
                    <g id="xy10" style="opacity:0.2">
                        <circle class="scl" cx="175" cy="65" r="12"></circle>
                        <text class="scl" x="166" y="70" font-size="15">
                            10
                        </text>
                    </g>
                    <g id="xy100" style="opacity:0.2">
                        <circle class="scl" cx="195" cy="45" r="15"></circle>
                        <text class="scl" x="182" y="50" font-size="15">
                            100
                        </text>
                    </g>
                    <g id="Decoration" pointer-events="none" fill-opacity=".6">
                        <path
                            class="std"
                            d="M120,20 l17,17 h-10 v11 h-14 v-11 h-10 z"
                            fill="SteelBlue"
                        ></path>
                        <path
                            class="std"
                            d="M120,220 l17,-17 h-10 v-11 h-14 v11 h-10 z"
                            fill="SteelBlue"
                        ></path>
                        <path
                            class="std"
                            d="M20,120 l17,17 v-10 h11 v-14 h-11 v-10 z"
                            fill="Khaki"
                        ></path>
                        <path
                            class="std"
                            d="M220,120 l-17,-17 v10 h-11 v14 h11 v10 z"
                            fill="Khaki"
                        ></path>
                        <text class="jog" x="110" y="36">
                            +Y
                        </text>
                        <text class="jog" x="113" y="212">
                            -Y
                        </text>
                        <text class="jog" x="27" y="124">
                            -X
                        </text>
                        <text class="jog" x="196" y="124">
                            +X
                        </text>
                    </g>
                    <g
                        id="posxy"
                        onmouseup={sendMoveCommand}
                        onmouseover={onHoverJog}
                        onmousedown={onMouseDownJog}
                        onmouseout={onOutJog}
                    >
                        <title>
                            {T("P20") +
                                preferences.xpos +
                                "," +
                                preferences.ypos}
                        </title>
                        <circle
                            class="std"
                            cx="120.2"
                            cy="120.3"
                            r="15"
                        ></circle>
                        <circle
                            class="cross"
                            cx="116"
                            cy="120.3"
                            r="4"
                        ></circle>
                        <line
                            x1="116"
                            y1="125.3"
                            x2="116"
                            y2="129"
                            style="stroke:black;stroke-width:1"
                        />
                        <line
                            x1="116"
                            y1="115.3"
                            x2="116"
                            y2="111.6"
                            style="stroke:black;stroke-width:1"
                        />
                        <line
                            x1="121"
                            y1="120.3"
                            x2="124.7"
                            y2="120.3"
                            style="stroke:black;stroke-width:1"
                        />
                        <line
                            x1="111"
                            y1="120.3"
                            x2="107.3"
                            y2="120.3"
                            style="stroke:black;stroke-width:1"
                        />
                        <text class="posscl" x="125" y="118">
                            X
                        </text>
                        <text class="posscl" x="125" y="130">
                            Y
                        </text>
                    </g>
                    <g id="JogBar" transform="translate(250,0)">
                        <g id="+Z" fill="#b0b0b0" style="pointer-events:none;">
                            <path
                                class="std"
                                d=" M5,0 h30 a5,5 0 0,1 5,5 v27 h-40 v-27 a5,5 0 0,1 5,-5 z"
                            ></path>
                            <path
                                class="std"
                                d="M20,2 l17,17 h-10 v11 h-14 v-11 h-10 z"
                                fill="DarkSeaGreen"
                            ></path>
                            <text class="jog" x="11" y="18" id="axisup">
                                +Z
                            </text>
                        </g>
                        <g
                            id="Z+10"
                            fill="#d0d0d0"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                        >
                            <rect
                                class="std"
                                x="0"
                                y="32"
                                width="40"
                                height="30"
                            ></rect>
                            <g id="z10" style="opacity:0.2">
                                <circle
                                    class="scl"
                                    cx="20"
                                    cy="47"
                                    r="13"
                                ></circle>
                                <text class="scl" x="9" y="53" font-size="18">
                                    10
                                </text>
                            </g>
                        </g>
                        <g
                            id="Z+1"
                            fill="#e0e0e0"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                        >
                            <rect
                                class="std"
                                x="0"
                                y="62"
                                width="40"
                                height="26"
                            ></rect>
                            <g id="z1" style="opacity:0.2">
                                <circle
                                    class="scl"
                                    cx="20"
                                    cy="75"
                                    r="11"
                                ></circle>
                                <text
                                    class="scl"
                                    x="15"
                                    y="81.5"
                                    font-size="18"
                                >
                                    1
                                </text>
                            </g>
                        </g>
                        <g
                            id="ZSpace"
                            fill="#000000"
                            style="pointer-events:none;"
                        >
                            <rect
                                class="std"
                                x="0"
                                y="112"
                                width="40"
                                height="16"
                            ></rect>
                        </g>
                        <g
                            id="Z+0_1"
                            fill="#f0f0f0"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                        >
                            <rect
                                class="std"
                                x="0"
                                y="88"
                                width="40"
                                height="24"
                            ></rect>
                            <g id="z0_1" style="opacity:0.2">
                                <circle
                                    class="scl"
                                    cx="20"
                                    cy="100"
                                    r="9.5"
                                ></circle>
                                <text
                                    class="scl"
                                    x="13"
                                    y="103.5"
                                    font-size="10"
                                >
                                    0.1
                                </text>
                            </g>
                        </g>
                        <g
                            id="Z-0_1"
                            fill="#f0f0f0"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                        >
                            <rect
                                class="std"
                                x="0"
                                y="128"
                                width="40"
                                height="24"
                            ></rect>
                        </g>
                        <g
                            id="Z-1"
                            fill="#e0e0e0"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                        >
                            <rect
                                class="std"
                                x="0"
                                y="152"
                                width="40"
                                height="26"
                            ></rect>
                        </g>
                        <g
                            id="Z-10"
                            fill="#d0d0d0"
                            onmouseup={sendJogCommand}
                            onmouseover={onHoverJog}
                            onmousedown={onMouseDownJog}
                            onmouseout={onOutJog}
                        >
                            <rect
                                class="std r10"
                                x="0"
                                y="178"
                                width="40"
                                height="30"
                            ></rect>
                        </g>

                        <g id="-Z" fill="#b0b0b0" style="pointer-events:none;">
                            <path
                                class="std"
                                d=" M0,208 h40 v27 a5,5 0 0,1 -5,5 h-30 a5,5 0 0,1 -5,-5 z"
                            ></path>
                            <path
                                class="std"
                                d="M20,238 l-17,-17 h10 v-11 h14 v11 h10 z"
                                fill="DarkSeaGreen"
                            ></path>
                            <text class="jog" x="13" y="230" id="axisdown">
                                -Z
                            </text>
                        </g>
                    </g>
                </svg>
            </div>
            <div class="d-flex flex-wrap justify-content-center">
                <div class="p-2">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text">{T("P10")}</span>
                        </div>
                        <input
                            type="number"
                            style="max-width:10em"
                            class="form-control"
                            placeholder={T("S41")}
                            value={preferences.xyfeedrate}
                        />
                        <div class="input-group-append">
                            <span class="input-group-text hide-low">
                                {T("P14")}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="p-2">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text">{T("P11")}</span>
                        </div>
                        <input
                            type="number"
                            style="max-width:10em"
                            class="form-control"
                            placeholder={T("S41")}
                            value={preferences.zfeedrate}
                        />
                        <div class="input-group-append">
                            <span class="input-group-text hide-low">
                                {T("P14")}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="p-2">
                    <button type="button" class="btn btn-primary">
                        <ZapOff />
                        <span class="hide-low text-button">{T("P13")}</span>
                    </button>
                </div>
                <div class="p-2">
                    <button type="button" class="btn btn-danger">
                        <AlertCircle />
                        <span class="hide-low text-button">{T("P15")}</span>
                    </button>
                </div>
            </div>
            <div class="input-group justify-content-center">
                <div class="input-group-prepend">
                    <span class="input-group-text">
                        <Activity />
                        <span class="hide-low text-button">{T("P12")}</span>
                    </span>
                </div>
                <div class="slider-control hide-low">
                    <div class="slidecontainer">
                        <input
                            onInput={onInputSpeedSlider}
                            type="range"
                            min="1"
                            max="300"
                            value={currentSpeed}
                            class="slider"
                            id="speedslider"
                        />
                    </div>
                </div>
                <div style="width:6rem;">
                    <input
                        onInput={onInputSpeedInput}
                        type="number"
                        min="1"
                        max="300"
                        value={currentSpeed}
                        class="form-control"
                        id="speedinput"
                    />
                </div>
                <div class="input-group-append">
                    <span class="input-group-text hide-low">%</span>
                    <button
                        id="speedinputbtn"
                        class="btn btn-warning invisible"
                        type="button"
                        onClick={onSet}
                        title={T("S43")}
                    >
                        <Send size="1.2em" />
                        <span class="hide-low text-button-setting">
                            {T("S43")}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export { JogPanel }
