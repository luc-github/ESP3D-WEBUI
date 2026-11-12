/*
JogSvg.js - ESP3D WebUI component file

 Copyright (c) 2021 Luc LEBOSSE. All rights reserved.

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
import { T } from "../Translations"

//Jog rings: each direction is the reference path rotated by 90 degrees steps
const rings = [
    {
        key: "100",
        distance: "100",
        fill: "#c0c0c0",
        cls: "std",
        d: "M-60 -67.07 L-75.93,-83 A112.5,112.5 0 0,1 75,-83 L60,-67.07 A90,90 0 0,0 -60.00,-67.07 z",
    },
    {
        key: "10",
        distance: "10",
        fill: "#d0d0d0",
        d: "M-44.06 -51.13 L-60,-67.07 A90,90 0 0,1 60,-67 L44.06,-51.13 A67.5,67.5 0 0,0 -44.06,-51.13 z",
    },
    {
        key: "1",
        distance: "1",
        fill: "#e0e0e0",
        d: "M-28.09 -35.16 L-44.06,-51.13 A67.5,67.5 0 0,1 44.06,-51.13 L28.09,-35.16 A45,45 0 0,0 -28.09,-35.16 z",
    },
    {
        key: "0_1",
        distance: "0.1",
        fill: "#f0f0f0",
        d: "M-28.09 -35.16 A45,45 0 0,1 29.09,-35.16 L0,-7.07 z",
    },
]

const ringDirs = [
    { suffix: "V_top", rot: 0, axis: "V" },
    { suffix: "H_right", rot: 90, axis: "H" },
    { suffix: "V_bottom", rot: 180, axis: "V" },
    { suffix: "H_left", rot: 270, axis: "H" },
]

const labelCircles = [
    { id: "label_circle_0_1", c: [144, 96, 9.5], t: [137, 99, 10, "0.1"] },
    { id: "label_circle_1", c: [159.5, 80.5, 10.5], t: [155, 85, 14, "1"] },
    { id: "label_circle_10", c: [175, 65, 12], t: [166, 70, 15, "10"] },
    { id: "label_circle_100", c: [195, 45, 15], t: [182, 50, 15, "100"] },
]

const homeCorners = [
    {
        id: "HomeAll",
        axis: "",
        title: "P6",
        fill: "#f0f0f0",
        d: "M10 182.5 h-10 v57.5 h57.5 v-10 a 125,125 0 0,1 -47.5 -47.5 Z",
        use: [3, 217],
    },
    {
        id: "HomeX",
        axis: "X",
        title: "P7",
        fill: "Khaki",
        d: "M10 57.50 h-10 v-57.5 h57.5 v10 a 125,125 0 0,0 -47.5 47.5 Z",
        use: [3, 5],
        text: { x: 25, y: 20, label: "X" },
    },
    {
        id: "HomeY",
        axis: "Y",
        title: "P8",
        fill: "SteelBlue",
        d: "M230 57.50 h10 v-57.5 h-57.5 v10 a 125,125 0 0,1 47.5 47.5 z",
        use: [217, 5],
        text: { x: 202, y: 20, label: "Y" },
    },
    {
        id: "HomeZ",
        axis: "Z",
        title: "P9",
        fill: "DarkSeaGreen",
        d: "M230 182.5 h10 v57.5 h-57.5 v-10 a 125,125 0 0,0 47.5 -47.5 z",
        use: [217, 217],
        text: { x: 202, y: 232, label: "Z", id: "homeZlabel" },
    },
]

//Z jog bar, in DOM order (ZSpace sits before Z_top_0_1)
//labels are only rendered on the top segments
const zBars = [
    {
        id: "Z_top_100",
        fill: "#d0d0d0",
        path: " M5,0 h30 a5,5 0 0,1 5,5 v27 h-40 v-27 a5,5 0 0,1 5,-5 z",
        dir: "top",
        dist: "100",
        label: "z100",
    },
    {
        id: "Z_top_10",
        fill: "#d0d0d0",
        rect: [0, 32, 40, 30],
        dir: "top",
        dist: "10",
        label: "z10",
    },
    {
        id: "Z_top_1",
        fill: "#e0e0e0",
        rect: [0, 62, 40, 26],
        dir: "top",
        dist: "1",
        label: "z1",
    },
    { id: "ZSpace", fill: "#000000", rect: [0, 112, 40, 16], deco: true },
    {
        id: "Z_top_0_1",
        fill: "#f0f0f0",
        rect: [0, 88, 40, 24],
        dir: "top",
        dist: "0.1",
        label: "z0_1",
    },
    {
        id: "Z_bottom_0_1",
        fill: "#f0f0f0",
        rect: [0, 128, 40, 24],
        dir: "bottom",
        dist: "0.1",
    },
    {
        id: "Z_bottom_1",
        fill: "#e0e0e0",
        rect: [0, 152, 40, 26],
        dir: "bottom",
        dist: "1",
    },
    {
        id: "Z_bottom_10",
        fill: "#d0d0d0",
        rect: [0, 178, 40, 30],
        cls: "std r10",
        dir: "bottom",
        dist: "10",
    },
    {
        id: "Z_bottom_100",
        fill: "#d0d0d0",
        path: " M0,208 h40 v27 a5,5 0 0,1 -5,5 h-30 a5,5 0 0,1 -5,-5 z",
        dir: "bottom",
        dist: "100",
    },
]

const zLabels = {
    z100: { c: [20, 16, 14], t: [8, 22, 14, "100"] },
    z10: { c: [20, 47, 12], t: [11, 53, 15, "10"] },
    z1: { c: [20, 75, 10.5], t: [16, 80, 14, "1"] },
    z0_1: { c: [20, 100, 9.5], t: [13.5, 103.5, 10, "0.1"] },
}

const JogSvg = ({
    axes,
    dirs,
    labels,
    labelPos,
    moveToTitleXY,
    moveToTitleZ,
    sendJogCommand,
    sendHomeCommand,
    sendMoveCommand,
    onMouseDown,
    onOut,
    onHoverJog,
    onOutJog,
}) => {
    const axisFor = (a) => (a == "V" ? axes.V : axes.H)
    return (
        <svg
            viewBox="0 -5 325 255"
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
        >
            <defs>
                <filter id="f1" x="-1" y="-1" width="300%" height="300%">
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
                <symbol id="HomeIcon" viewBox="0 0 20 18" pointer-events="none">
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
                    <path class="home" d="M15,3 v2.8 l1,.8 v-3.6 z"></path>
                </symbol>
            </defs>
            {homeCorners.map((corner) => (
                <g
                    key={corner.id}
                    id={corner.id}
                    onmouseup={(e) => sendHomeCommand(corner.axis, corner.id)}
                    onmousedown={(e) => onMouseDown(corner.id)}
                    onmouseout={(e) => onOut(corner.id)}
                >
                    <title>{T(corner.title)}</title>
                    <path class="std" d={corner.d} fill={corner.fill}></path>
                    <use
                        x={corner.use[0]}
                        y={corner.use[1]}
                        width="20"
                        height="18"
                        xlinkHref="#HomeIcon"
                    ></use>
                    {corner.text && (
                        <text
                            x={corner.text.x}
                            y={corner.text.y}
                            class="home"
                            id={corner.text.id}
                        >
                            {corner.text.label}
                        </text>
                    )}
                </g>
            ))}
            {rings.map((ring) => (
                <g
                    key={ring.key}
                    id={"Jog" + ring.key}
                    fill={ring.fill}
                    class={ring.cls}
                >
                    {ringDirs.map((dir) => {
                        const bid = dir.suffix + "_" + ring.key
                        const labelId = "label_circle_" + ring.key
                        return (
                            <g
                                key={bid}
                                id={bid}
                                transform={
                                    "translate(120 120) rotate(" + dir.rot + ")"
                                }
                                onmouseup={(e) =>
                                    sendJogCommand(
                                        axisFor(dir.axis),
                                        bid,
                                        dirs[dir.suffix] + ring.distance
                                    )
                                }
                                onmouseover={(e) => onHoverJog(labelId)}
                                onmousedown={(e) => onMouseDown(bid)}
                                onmouseout={(e) => onOutJog(labelId, bid)}
                            >
                                <path class="std" d={ring.d}></path>
                            </g>
                        )
                    })}
                </g>
            ))}
            {labelCircles.map((label) => (
                <g key={label.id} id={label.id} style="opacity:0.2">
                    <circle
                        class="scl"
                        cx={label.c[0]}
                        cy={label.c[1]}
                        r={label.c[2]}
                    ></circle>
                    <text
                        class="scl"
                        x={label.t[0]}
                        y={label.t[1]}
                        font-size={label.t[2]}
                    >
                        {label.t[3]}
                    </text>
                </g>
            ))}
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
                <text class="jog" x={labelPos.vTop} y="36">
                    {labels.vTop}
                </text>
                <text class="jog" x={labelPos.vBottom} y="212">
                    {labels.vBottom}
                </text>
                <text class="jog" x="27" y="124">
                    {labels.hLeft}
                </text>
                <text class="jog" x="196" y="124">
                    {labels.hRight}
                </text>
            </g>
            <g
                id="posxy"
                onmouseup={(e) => {
                    sendMoveCommand("posxy", "posxy")
                }}
                onmouseover={(e) => {
                    onHoverJog("posxy")
                }}
                onmousedown={(e) => onMouseDown("posxy")}
                onmouseout={(e) => {
                    onOut("posxy")
                }}
            >
                <title>{moveToTitleXY}</title>
                <circle class="std" cx="120.2" cy="120.3" r="15"></circle>
                <circle class="cross" cx="116" cy="120.3" r="4"></circle>
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
                {zBars.map((bar) => (
                    <g
                        key={bar.id}
                        id={bar.id}
                        fill={bar.fill}
                        style={bar.deco ? "pointer-events:none;" : undefined}
                        onmouseup={
                            bar.deco
                                ? undefined
                                : (e) =>
                                      sendJogCommand(
                                          axes.Z,
                                          bar.id,
                                          dirs["Z_" + bar.dir] + bar.dist
                                      )
                        }
                        onmouseover={
                            bar.deco
                                ? undefined
                                : (e) => onHoverJog(bar.label || "")
                        }
                        onmousedown={
                            bar.deco ? undefined : (e) => onMouseDown(bar.id)
                        }
                        onmouseout={
                            bar.deco
                                ? undefined
                                : (e) => onOutJog(bar.label || "", bar.id)
                        }
                    >
                        {bar.path ? (
                            <path class={bar.cls || "std"} d={bar.path}></path>
                        ) : (
                            <rect
                                class={bar.cls || "std"}
                                x={bar.rect[0]}
                                y={bar.rect[1]}
                                width={bar.rect[2]}
                                height={bar.rect[3]}
                            ></rect>
                        )}
                        {bar.label && (
                            <g id={bar.label} style="opacity:0.2">
                                <circle
                                    class="scl"
                                    cx={zLabels[bar.label].c[0]}
                                    cy={zLabels[bar.label].c[1]}
                                    r={zLabels[bar.label].c[2]}
                                ></circle>
                                <text
                                    class="scl"
                                    x={zLabels[bar.label].t[0]}
                                    y={zLabels[bar.label].t[1]}
                                    font-size={zLabels[bar.label].t[2]}
                                >
                                    {zLabels[bar.label].t[3]}
                                </text>
                            </g>
                        )}
                    </g>
                ))}
                <g id="+Z" fill-opacity=".6" pointer-events="none">
                    <path
                        class="std"
                        d="M50,20 l17,17 h-10 v11 h-14 v-11 h-10 z"
                        fill="DarkSeaGreen"
                    ></path>
                    <text class="jog" x={labelPos.zTop} y="36" id="axisup">
                        {labels.zTop}
                    </text>
                </g>
                <g id="-Z" fill-opacity=".6" pointer-events="none">
                    <path
                        class="std"
                        d="M50,220 l-17,-17 h10 v-11 h14 v11 h10 z"
                        fill="DarkSeaGreen"
                    ></path>
                    <text
                        class="jog"
                        x={labelPos.zBottom}
                        y="210"
                        id="axisdown"
                    >
                        {labels.zBottom}
                    </text>
                </g>
                <g
                    id="posz"
                    onmouseup={(e) => {
                        sendMoveCommand("posz", "posz")
                    }}
                    onmouseover={(e) => {
                        onHoverJog("posz")
                    }}
                    onmousedown={(e) => onMouseDown("posz")}
                    onmouseout={(e) => {
                        onOut("posz")
                    }}
                >
                    <title>{moveToTitleZ}</title>
                    <rect
                        class="movez"
                        x="-1"
                        y="110"
                        width="42"
                        height="20"
                        rx="5"
                    />
                    <circle class="cross" cx="13" cy="120.3" r="4"></circle>
                    <line
                        x1="13"
                        y1="125.3"
                        x2="13"
                        y2="128.8"
                        style="stroke:black;stroke-width:1"
                    />
                    <line
                        x1="13"
                        y1="115.3"
                        x2="13"
                        y2="111.6"
                        style="stroke:black;stroke-width:1"
                    />
                    <line
                        x1="4"
                        y1="120.3"
                        x2="8.7"
                        y2="120.3"
                        style="stroke:black;stroke-width:1"
                    />
                    <line
                        x1="18"
                        y1="120.3"
                        x2="21.7"
                        y2="120.3"
                        style="stroke:black;stroke-width:1"
                    />
                    <text class="posscl" x="25" y="122">
                        Z
                    </text>
                </g>
            </g>
        </svg>
    )
}

export { JogSvg }
