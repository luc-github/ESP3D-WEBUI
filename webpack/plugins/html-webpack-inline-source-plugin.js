/**
 * Embed javascript and css source inline when using the webpack dev server or middleware
 * Docs: https://github.com/DustinJackson/html-webpack-inline-source-plugin
 */

const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin")

export default () => new HtmlWebpackInlineSourcePlugin()
