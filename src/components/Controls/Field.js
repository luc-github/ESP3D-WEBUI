/*
Field.js - ESP3D WebUI component file

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

import { Fragment, h } from "preact"
import {
    FormGroup,
    Input,
    Select,
    Boolean,
    PickUp,
    ItemsList,
    IconSelect,
    LabelCtrl,
    Slider,
    Mask,
} from "./Fields"

const Field = (props) => {
    const { type, id, help } = props
    switch (type) {
        case "mask":
        case "xmask":
            return (
                <div>
                    <Mask {...props} />
                    <FormGroup {...props}></FormGroup>
                </div>
            )
        case "label":
            return (
                <FormGroup {...props}>
                    <LabelCtrl {...props} />
                </FormGroup>
            )
        case "list":
            return (
                <Fragment>
                    <ItemsList {...props} />
                    <FormGroup {...props} />
                </Fragment>
            )
        case "pickup":
            return (
                <FormGroup {...props}>
                    <PickUp {...props} />
                </FormGroup>
            )
        case "icon":
            return (
                <FormGroup {...props}>
                    <IconSelect {...props} />
                </FormGroup>
            )
        case "select":
            return (
                <FormGroup {...props}>
                    <Select {...props} />
                </FormGroup>
            )
        case "slider":
            return (
                <FormGroup {...props}>
                    <Slider {...props} />
                </FormGroup>
            )
        case "boolean":
            return (
                <FormGroup {...props}>
                    <Boolean {...props} />
                </FormGroup>
            )
        default:
            //input
            return (
                <FormGroup {...props}>
                    <Input {...props} />
                </FormGroup>
            )
    }
}
export { Field }
