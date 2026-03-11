/*
 logo.js - Marlin logo file

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
        interfaceSettings.current.custom &&
        interfaceSettings.current.custom.logo
    )
        return (
            <span
                dangerouslySetInnerHTML={{
                    __html: interfaceSettings.current.custom.logo
                        .replace("{height}", height)
                        .replaceAll("{color}", color)
                        .replaceAll("{bgcolor}", bgcolor),
                }}
            ></span>
        )
    else
        return (
            <svg height={height} version="1.1" viewBox="0 0 115.98 86.857">
                <g stroke="#FFF" stroke-linecap="round">
                    <g>
                        <path d="m92.594 33.575c-0.0462-9.5622 0.0927-19.134-0.0701-28.69-0.9069-4.7762-8.0524-2.6695-6.8267 1.8433 0.0957 9.6619-0.1978 19.344 0.159 28.992 0.8745 6.6908 7.0237 12.086 13.634 11.943 0.9419-1.2408 2.9689-2.4817 3.2519-3.7225-1.542-1.1737-2.494-3.599-4.6418-3.465-3.1371-0.6074-5.5614-3.637-5.5068-6.9012z" />
                        <path d="m34.068 33.575c0.1523 3.9709-0.3223 8.0233 0.271 11.938 1.7744 4.2887 7.8511 1.3447 6.6258-2.7878 0.2092-3.9574-0.5027-8.048 0.5419-11.892 1.396-3.8279 5.6029-4.6333 9.1291-4.3024 2.3486 0.6214 2.8207-0.6739 2.4466-2.8336-0.4125-1.3602 1.0111-4.5956-1.1097-4.2108-4.9073-0.2359-10.326 0.1541-13.865 4.1265-2.5705 2.6029-4.0596 6.2638-4.04 9.9623z" />
                        <path d="m68.552 19.486h-5.2209v7.0444c3.9142 0.074 8.8492-0.7911 11.127 3.406 4.2355 6.3224-4.7951 14.282-10.298 9.0703-3.7119-3.2287-2.1789-8.4617-2.505-12.799v-20.613c-1.2148-0.96222-2.4297-3.0324-3.6445-3.3218-0.9731 1.3432-2.927 2.2713-3.2522 3.8885 0.0922 9.8378-0.1913 19.694 0.1545 29.519 0.9946 8.884 11.316 14.685 19.196 10.789 8.1926-3.3227 10.938-15.138 5.0795-21.866-2.5702-3.2107-6.5747-5.1407-10.636-5.1173z" />
                        <path d="m16.923 40.62c-7.4707 0.4386-9.5028-11.536-2.3112-13.681 5.0871-2.0594 10.157 3.1556 9.2079 8.3371-0.0842 5.7086 0.1744 11.439-0.1401 17.133-0.5398 5.4689-6.5745 4.7393-9.6146 7.1782-2.7079 5.3983 4.8742 6.7562 8.227 4.3836 5.8825-2.3719 9.0798-9 8.4245-15.248-0.1517-6.0893 0.3484-12.228-0.3441-18.277-1.6352-8.7796-12.338-13.786-19.914-9.3151-7.933 3.9256-9.8252 15.915-3.5006 22.187 3.3698 3.9221 8.6082 4.6057 13.414 4.3472 0.942-1.2408 2.9688-2.4817 3.2522-3.7225-1.315-0.9939-2.2238-2.9897-3.8071-3.3218h-2.8935z" />
                    </g>
                    <path
                        d="m102.94 44.142c-1.15 1.1741-2.299 2.3482-3.4489 3.5222"
                        fill="none"
                    />
                </g>
                <text
                    x="62.070477"
                    y="95.270958"
                    font-family="sans-serif"
                    font-size="10.583px"
                    font-style="italic"
                    stroke-width=".26458"
                    style="line-height:1.25"
                >
                    <tspan x="62.070477" y="95.270958" stroke-width=".26458" />
                </text>
                <text
                    x="25.261236"
                    y="85.527336"
                    fill="#f90000"
                    font-family="sans-serif"
                    font-size="50.8px"
                    font-style="italic"
                    font-weight="bold"
                    stroke-width=".26458"
                    style="line-height:1.25"
                >
                    <tspan
                        x="25.261236"
                        y="85.527336"
                        fill="#f90000"
                        font-size="50.8px"
                        stroke-width=".26458"
                    >
                        HAL
                    </tspan>
                </text>
            </svg>
        )
}

export { AppLogo }
