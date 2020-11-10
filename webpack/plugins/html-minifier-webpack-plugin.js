/**
 * A Webpack plugin to minify HTML files.
 * Docs: https://github.com/Maxwellewxam/html-minifier-webpack-plugin
 */

import HtmlMinifierWebpackPlugin from "html-minifier-webpack-plugin"

const devMode = process.env.NODE_ENV !== "production"

const config = {
    collapseWhitespace: devMode ? true : false,
}

export default () => new HtmlMinifierWebpackPlugin(config)
