/*
 logo.js - FluidNC logo file
 from https://raw.githubusercontent.com/wiki/bdring/FluidNC/images/logos/FluidNC.svg

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
import { useSettingsContext } from "../../../contexts/SettingsContext"

/*
 *ESP3D Logo
 * default height is 50px
 */
const AppLogo = ({
    height = "50px",
    color = "currentColor",
    bgcolor = "white",
}) => {
    const { interfaceSettings } = useSettingsContext()
    if (
        interfaceSettings.current &&
        interfaceSettings.custom &&
        interfaceSettings.custom.logo
    )
        return (
            <span
                dangerouslySetInnerHTML={{
                    __html: interfaceSettings.custom.logo
                        .replace("{height}", height)
                        .replaceAll("{color}", color)
                        .replaceAll("{bgcolor}", bgcolor),
                }}
            ></span>
        )
    else
        return (
            <svg
                height={height}
                viewBox="0 0 3018 1122"
                fill={bgcolor}
                stroke={color}
                class="esp3dlogo"
            >
                <g id="Layer_x0020_1">
                    <metadata id="CorelCorpID_0Corel-Layer" />
                    <polygon
                        fill={color}
                        stroke={bgcolor}
                        points="0,803 78,331 400,331 384,424 176,424 161,520 348,521 332,613 145,613 114,803 "
                    />
                    <polygon
                        id="1"
                        fill={color}
                        stroke={bgcolor}
                        points="555,331 477,803 364,803 442,331 "
                    />
                    <path
                        id="2"
                        fill={color}
                        stroke={bgcolor}
                        d="M787 650l33 -201 113 0 -59 354 -108 0 11 -66 -3 0c-11,21 -27,39 -49,51 -21,13 -45,19 -71,19 -24,0 -44,-5 -61,-16 -16,-11 -28,-27 -35,-47 -7,-20 -8,-43 -4,-70l38 -225 113 0 -34 203c-3,19 0,34 8,45 8,12 20,17 38,17 11,0 21,-2 31,-7 10,-5 18,-13 25,-22 7,-10 12,-21 14,-35z"
                    />
                    <path
                        id="3"
                        fill={color}
                        stroke={bgcolor}
                        d="M931 803l59 -354 112 0 -59 354 -112 0zm123 -396c-16,0 -29,-5 -39,-16 -10,-10 -14,-23 -12,-37 2,-15 10,-28 23,-38 12,-11 27,-16 43,-16 16,0 29,5 38,16 10,10 14,23 12,38 -2,14 -9,27 -22,38 -13,10 -27,15 -43,15z"
                    />
                    <path
                        id="4"
                        fill={color}
                        stroke={bgcolor}
                        d="M1229 808c-27,0 -49,-7 -68,-21 -19,-13 -33,-33 -41,-60 -9,-27 -10,-61 -3,-101 7,-42 19,-76 37,-103 18,-27 38,-46 62,-59 23,-13 47,-20 72,-20 18,0 34,3 46,10 12,6 22,14 29,24 7,10 11,21 14,31l3 0 29 -178 113 0 -78 472 -112 0 10 -58 -4 0c-6,11 -15,21 -25,31 -11,9 -23,17 -37,23 -14,6 -30,9 -47,9zm53 -88c13,0 26,-4 37,-12 11,-7 20,-18 28,-33 7,-14 13,-30 16,-49 3,-20 3,-36 0,-50 -3,-14 -8,-25 -17,-32 -8,-8 -20,-12 -33,-12 -14,0 -27,4 -38,12 -10,7 -19,18 -27,32 -7,14 -12,31 -15,50 -3,19 -4,35 -1,49 2,15 8,26 16,33 9,8 20,12 34,12z"
                    />
                    <polygon
                        fill={color}
                        stroke={bgcolor}
                        points="2561,326 2482,798 2386,798 2244,525 2241,525 2195,798 2081,798 2159,326 2258,326 2398,598 2402,598 2447,326 "
                    />
                    <path
                        id="1"
                        fill={color}
                        stroke={bgcolor}
                        d="M3017 497l-114 0c1,-12 -1,-23 -4,-32 -2,-10 -7,-18 -13,-25 -7,-6 -14,-12 -24,-15 -9,-4 -20,-6 -33,-6 -23,0 -45,6 -64,18 -20,12 -36,29 -49,51 -13,23 -22,49 -27,80 -5,31 -5,56 0,76 5,20 14,35 28,45 14,10 31,15 52,15 14,0 26,-2 38,-5 12,-3 23,-8 32,-14 10,-7 18,-14 25,-23 7,-9 12,-19 16,-30l115 0c-6,21 -15,41 -28,62 -13,20 -30,39 -49,55 -20,17 -43,30 -68,40 -26,10 -55,15 -87,15 -43,0 -81,-10 -112,-29 -32,-20 -54,-48 -68,-85 -14,-37 -17,-82 -8,-135 8,-51 25,-94 50,-129 25,-35 55,-62 91,-79 36,-18 74,-27 115,-27 29,0 56,4 79,11 24,8 44,20 60,35 17,15 29,34 37,56 8,22 11,47 10,75z"
                    />
                    <path
                        fill="#005B96"
                        stroke="#005B96"
                        d="M1748 122c-6,201 20,269 125,419 54,71 83,158 83,247 0,94 -32,185 -90,258 7,-215 -32,-257 -121,-405 -89,-121 -173,-371 3,-519z"
                    />
                    <path
                        fill="#6497B1"
                        stroke="#6497B1"
                        d="M1706 1122c15,-129 -80,-211 -125,-309 -10,-23 -15,-47 -15,-72 0,-53 24,-103 65,-136 14,122 104,217 144,331 21,59 15,121 -69,186z"
                    />
                    <path
                        fill="#6497B1"
                        stroke="#6497B1"
                        d="M1953 520c21,-128 -69,-217 -109,-315 -8,-20 -12,-42 -12,-63 0,-56 27,-109 72,-142 7,122 92,224 125,339 18,58 11,119 -76,181z"
                    />
                </g>
            </svg>
        )
}

export { AppLogo }
