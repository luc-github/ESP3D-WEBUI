/*
 httpAdapter.js - ESP3D WebUI adapter file

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

/**
 * Execute XMLHttpRequest
 * @param {string} url
 * @param {Object} params
 * @returns {Object}
 * @return {{a: number, b: string, c}} myObj
 * @return {Object} return
 * @returns {Promise} return.response
 * @returns {Function} return.abort
 * @returns {XHR} return.xhr
 */
const httpAdapter = (url, params = {}, setUploadProgress = () => {}) => {
    const { method = "GET", headers = {}, body = null, id = null } = params
    const sanitizedMethod = method.trim().toUpperCase()
    const xhr = new XMLHttpRequest()
    if (id && id.startsWith("download")) {
        xhr.responseType = "blob"
        xhr.addEventListener("progress", (e) => {
            const done = e.position || e.loaded
            const total = e.totalSize || e.total
            const perc = Math.floor((done / total) * 1000) / 10
            setUploadProgress(perc)
        })
    } else {
        xhr.upload.addEventListener("progress", (e) => {
            const done = e.position || e.loaded
            const total = e.totalSize || e.total
            const perc = Math.floor((done / total) * 1000) / 10
            setUploadProgress(perc)
        })
    }

    const cacheBustedUrl = (url) => {
        const parsedUrl = new URL(url)
        let params = parsedUrl.searchParams
        params.get("t") == null && params.append("t", Date.now())
        return parsedUrl.toString()
    }

    xhr.open(sanitizedMethod, cacheBustedUrl(url), true) //Bypassing the cache

    /** handle URL params ? */

    /** header part */
    if (headers instanceof Headers)
        headers.forEach((value, header) => xhr.setRequestHeader(header, value))
    //handle Headers()
    else
        Object.entries(headers).forEach((header, value) =>
            xhr.setRequestHeader(header, value)
        ) //handle Object headers

    const response = new Promise((resolve, reject) => {
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response)
            else {
                const e = new Error(
                    `${xhr.status ? xhr.status : ""}${
                        xhr.statusText ? ` - ${xhr.statusText}` : ""
                    }`
                )
                e.code = xhr.status
                reject(e)
            }
        }
        xhr.onerror = () => {
            const e = new Error(
                `${xhr.status ? xhr.status : "Connection time out"}${
                    xhr.status && xhr.statusText ? ` - ${xhr.statusText}` : ""
                }`
            )
            e.code = xhr.status
            reject(e)
        }

        xhr.onabort = () => {
            const e = new Error("Request aborted")
            e.code = 499
            reject(e)
        }
    })

    const sendBody = ["POST", "PUT", "CONNECT", "PATCH"].toLocaleString(method)
        ? body
        : null

    xhr.send(sendBody)

    return {
        abort: (cb) => {
            xhr.abort()
            if (typeof callback == "function") return cb()
        },
        xhr,
        response,
    }
}

export { httpAdapter }
