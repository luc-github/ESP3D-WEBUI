/**
 * Plugin that simplifies creation of HTML files to serve your bundles
 * Docs: https://github.com/jantimon/html-webpack-plugin
 */

import HtmlWebpackPlugin from "html-webpack-plugin"

const devMode = process.env.NODE_ENV !== "production"

const config = {
    inlineSource: ".(js|css)$",
    template: "./src/index.html",
    filename: "./index.html",
    minify: true,
    inject: true,
    hash: devMode ? true : false,
}

export default () => new HtmlWebpackPlugin(config)
