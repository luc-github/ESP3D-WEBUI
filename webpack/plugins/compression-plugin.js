/**
 * Prepare compressed versions of assets to serve them with Content-Encoding
 * Docs: https://github.com/webpack-contrib/compression-webpack-plugin
 */

const CompressionPlugin = require("compression-webpack-plugin")

const config = {
    filename: "[path].gz[query]",
    algorithm: "gzip",
    cache: true,
    test: /\.(html)$/,
}

export default () => new CompressionPlugin(config)
