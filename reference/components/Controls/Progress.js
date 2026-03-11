/*
 Progress.js - ESP3D WebUI component file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.

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
import { useEffect, useRef } from "preact/hooks"

/*
 * Local const
 *
 */

const Progress = ({ progressBar, max = 100, precision = -1 }) => {
    const progressValue = useRef(0)
    const progressValueDisplay = useRef()
    let calculationDone = false
    let prec = precision != -1 ? precision : 0
    const updateProgress = (value) => {
        if (precision == -1) {
            if (value == 0) prec = 0
            else {
                if (!calculationDone) {
                    //if step is very small let's increase precision to show the changes
                    if ((value / max) * 100 < 0.001) prec = 2
                    else if ((value / max) * 100 < 0.01) prec = 1
                    calculationDone = true
                }
            }
        }
        const val = ((value / max) * 100).toFixed(prec)
        if (progressValue.current) {
            if (val == Infinity) {
                progressValue.current.value = 100
                progressValueDisplay.current.innerHTML = "100%"
            } else {
                progressValue.current.value = val
                progressValueDisplay.current.innerHTML = val + "%"
            }
        }
    }
    useEffect(() => {
        progressBar.update = updateProgress
        calculationDone = false
        updateProgress(0)
    }, [])
    return (
        <center>
            <progress ref={progressValue} value="0" max="100" />
            <label class="progress-value-label" ref={progressValueDisplay}></label>
        </center>
    )
}

export default Progress
