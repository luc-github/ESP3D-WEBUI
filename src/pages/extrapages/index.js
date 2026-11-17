/*
 extrapage.js - ESP3D WebUI navigation page file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public
 License as published by the Free Software Foundation; either
 version 3 of the License, or (at your option) any later version.

 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.

 You should have received a copy of the GNU General Public
 License along with This code; if not, see <https://www.gnu.org/licenses/>.
*/
import { h } from "preact"
import {ExtraContent} from "../../components/ExtraContent"

const ExtraPage = ({ id, source, refreshtime, label, type }) => {
    return (
        <ExtraContent
            key={id}
            id={id}
            label={label}
            source={source}
            refreshtime={refreshtime}
            type={type}
            target="page"
        />
    )
}

export default ExtraPage
