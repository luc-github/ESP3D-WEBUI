/**
 * This plugin is used to minify your JavaScript.
 * Docs: https://github.com/webpack-contrib/terser-webpack-plugin
 */

import TerserPlugin from "terser-webpack-plugin"

const config = {
    parallel: true,
    cache: false,
    sourceMap: false,
    terserOptions: {
        parse: {
            // Let terser parse ecma 8 code but always output
            // ES5 compliant code for older browsers
            ecma: 8,
        },
        compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
        },
        mangle: {
            safari10: true,
        },
        output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
        },
    },
}

export default () => new TerserPlugin(config)
