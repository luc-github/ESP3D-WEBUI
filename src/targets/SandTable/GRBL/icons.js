/*
 icon.js - ESP3D WebUI images file

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

/*
 *fan icon
 * default height is 1.2m
 */
const Fan = ({ height = "1.2em" }) => (
    <svg height={height} viewBox="-4 1 38 30">
        <g>
            <path
                fill="currentColor"
                d="M 25,1.73 C 24.9,1.7 24.6,1.54 24.2,1.42 22,0.56 19.6,0.98 18,2.51 c -0.4,0.45 -1.5,2.06 -1.6,2.83 -0.6,1.67 -0.8,3.5 -0.6,5.16 0.1,0.4 0.1,0.5 0,0.5 -0.6,0 -1.5,0.3 -2.2,0.6 -0.2,0 -0.2,0 -0.6,-0.2 C 12.3,10.7 11.8,9.87 11.4,8.58 11.3,8.24 11.1,7.3 11,6.49 10.8,5.53 10.6,4.96 10.5,4.64 9.97,3.43 8.48,2.57 7.13,2.6 5.48,2.66 3.47,4.15 2.24,6.19 1.86,6.84 1.38,7.97 1.23,8.54 0.96,9.67 1.01,11.1 1.36,12.1 c 0.22,0.6 0.76,1.5 1.21,2 0.46,0.4 2.18,1.4 2.88,1.6 1.74,0.6 3.49,0.8 5.05,0.6 0.3,-0.1 0.5,-0.1 0.5,-0.1 0,0.7 0.2,1.6 0.5,2.1 0.1,0.2 0.1,0.3 0,0.5 -0.2,0.3 -0.7,0.8 -1,1.1 -0.93,0.6 -1.82,0.9 -3.95,1.2 -0.96,0.2 -1.52,0.4 -1.81,0.5 -0.83,0.4 -1.53,1.2 -1.85,2 -0.43,1.4 -0.22,2.4 0.71,3.8 1.3,1.9 3.78,3.4 5.97,3.6 1.63,0.2 3.13,-0.3 4.33,-1.4 0.4,-0.3 0.5,-0.5 1,-1.4 0.5,-0.7 0.6,-1.1 0.8,-1.5 0.6,-1.7 0.8,-3.5 0.5,-5.1 0,-0.3 0,-0.5 0,-0.5 0,0 0.3,-0.1 0.6,-0.1 0.6,-0.1 1.1,-0.2 1.5,-0.5 0.3,-0.1 0.4,0 0.9,0.4 1,0.9 1.4,2 1.9,4.7 0.2,0.9 0.3,1.5 0.5,1.8 0.5,1.2 2,2.1 3.3,2 1.7,0 3.8,-1.5 5,-3.5 1.1,-2 1.5,-4.1 0.8,-5.9 -0.2,-0.5 -0.7,-1.5 -1.1,-1.9 -0.5,-0.4 -1.9,-1.3 -2.6,-1.6 -1.7,-0.7 -3.8,-0.9 -5.5,-0.7 -0.2,0.1 -0.4,0.1 -0.4,0.1 -0.1,-0.6 -0.3,-1.6 -0.5,-2.1 -0.2,-0.3 -0.2,-0.4 0.3,-1 0.9,-0.9 2,-1.3 4.6,-1.8 1,-0.2 1.6,-0.4 1.8,-0.5 C 28.6,9.87 29.5,8.41 29.4,7.04 29.3,5.37 27.8,3.34 25.8,2.12 25.4,1.95 25.1,1.78 25,1.73 c 0,0 0,0 0,0 M 18.9,13.2 c 0.5,0.6 0.8,1.1 1,1.9 0.2,0.7 0.2,1.4 0,2.1 -0.7,2.5 -3.7,3.7 -6,2.4 -1.8,-1.2 -2.5,-3.7 -1.4,-5.6 0.6,-1 1.4,-1.6 2.6,-1.8 1.4,-0.4 2.8,0 3.8,1 0,0 0,0 0,0"
            />
            <path
                fill="currentColor"
                d="M 17.2,13.2 C 16.6,13 15.6,13 15,13.1 c -2.2,0.5 -2.9,4 -1.2,5.4 1.5,1.3 4.4,0.7 5.1,-1.1 0.4,-1.7 0.1,-2.9 -0.8,-3.7 -0.2,-0.2 -0.4,-0.3 -0.5,-0.3 0,0 -0.2,-0.2 -0.4,-0.2 0,0 0,0 0,0"
            />
        </g>
    </svg>
)

/*
 *feedrate icon
 * default height is 1.2m
 */
const FeedRate = ({ height = "1.2em" }) => (
    <svg height={height} viewBox="-10 4 112 90">
        <path
            style="stroke:currentColor;stroke-width:12;fill:none"
            d="M84.78 48.08C84.88 62.28 74.58 75.08 61.48 79.78C46.08 85.78 26.88 81.68 16.38 68.48C7.98 58.58 6.58 43.48 13.18 32.28C20.38 18.98 36.08 11.58 50.98 13.24"
        />
        <path
            style="stroke:currentColor;stroke-width:12;fill:none"
            d="M59.18 14.76C64.38 16.38 69.28 18.88 73.48 22.38"
        />
        <path
            style="stroke:currentColor;stroke-width:12;fill:none"
            d="M79.18 27.48C82.08 31.38 84.08 35.98 84.88 40.78"
        />
        <path
            style="stroke:currentColor;fill:currentColor"
            d="M37.58 45.28C45.28 41.38 52.98 37.58 60.68 33.68C57.68 41.48 54.68 49.38 51.68 57.18C46.98 53.18 42.28 49.28 37.58 45.28C37.58 45.28 37.58 45.28 37.58 45.28"
        />
    </svg>
)

/*
 *flowrate icon
 * default height is 1.2m
 */
const FlowRate = ({ height = "1.0em" }) => (
    <svg height={height} viewBox="1 21 90 59">
        <path
            d="m 47.2,42.3 0.2,-25 m 8.8,35.1 a 9.12,9.13 0 0 1 -9.1,9.1 9.12,9.13 0 0 1 -9.1,-9.1 9.12,9.13 0 0 1 9.1,-9.1 9.12,9.13 0 0 1 9.1,9.1 z m 13.7,0.7 A 22.8,22.8 0 0 1 47.1,75.9 22.8,22.8 0 0 1 24.3,53.1 22.8,22.8 0 0 1 47.1,30.3 22.8,22.8 0 0 1 69.9,53.1 Z M 47.2,29.9 A 22.8,22.8 0 0 0 25.8,44.5 H 4.66 c -0.74,0 -1.35,0.6 -1.35,1.3 v 13 c 0,0.8 0.61,1.6 1.35,1.6 H 25.5 A 22.8,22.8 0 0 0 47.2,75.5 22.8,22.8 0 0 0 68.6,60.4 h 19.1 c 0.8,0 1.3,-0.8 1.3,-1.6 v -13 c 0,-0.7 -0.5,-1.3 -1.3,-1.3 H 68.4 A 22.8,22.8 0 0 0 47.2,29.9 Z"
            style="fill:none;stroke:currentColor;stroke-width:7.5;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
        />
    </svg>
)

const iconsTarget = {
    Fan: <Fan />,
    FeedRate: <FeedRate />,
    FlowRate: <FlowRate />,
}

export { Fan, FeedRate, FlowRate, iconsTarget }
