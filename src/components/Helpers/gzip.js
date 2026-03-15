/*
 * gzip.js - Decompress gzip bytes to string (for .gz extension files).
 * Uses DecompressionStream when available (Chrome 80+, Firefox 113+, Safari 16.4+).
 */

/**
 * Decompress gzip-encoded Blob or ArrayBuffer to UTF-8 string.
 * @param {Blob|ArrayBuffer} blobOrArrayBuffer - Raw gzip bytes
 * @returns {Promise<string>} Decompressed text
 */
function decompressGzipToText(blobOrArrayBuffer) {
    const blob =
        blobOrArrayBuffer instanceof Blob
            ? blobOrArrayBuffer
            : new Blob([blobOrArrayBuffer])
    if (typeof DecompressionStream === "undefined") {
        return Promise.reject(
            new Error("Gzip decompression not supported in this browser")
        )
    }
    const stream = blob.stream().pipeThrough(new DecompressionStream("gzip"))
    return new Response(stream).text()
}

export { decompressGzipToText }
