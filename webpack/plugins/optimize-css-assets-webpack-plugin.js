/**
 * A Webpack plugin to optimize \ minimize CSS assets.
 * Docs: https://github.com/NMFR/optimize-css-assets-webpack-plugin
 */

import OptimizeCSSAssetsPlugin from "optimize-css-assets-webpack-plugin"
const safePostCssParser = require("postcss-safe-parser")

export default () =>
    new OptimizeCSSAssetsPlugin({
        parser: safePostCssParser,
        map: {
            inline: false,
            annotation: true,
        },
    })
