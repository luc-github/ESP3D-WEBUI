/**
 * This plugin extracts CSS into separate files.
 * It creates a CSS file per JS file which contains CSS.
 * It supports On-Demand-Loading of CSS and SourceMaps.
 *
 * Docs: https://github.com/webpack-contrib/mini-css-extract-plugin
 */

import MiniCssExtractPlugin from "mini-css-extract-plugin"
const devMode = process.env.NODE_ENV !== "production"

export default () => new MiniCssExtractPlugin({})
