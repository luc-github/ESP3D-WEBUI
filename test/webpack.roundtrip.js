/*
 webpack.roundtrip.js - builds the offline preferences round-trip test

 Bundles only the preferences code paths: the two barrel imports used by
 importHelper/exportHelper ("../../components/Helpers" and "../../targets")
 are redirected to lightweight stubs, so no UI code is pulled in.
 Run with:
   npx webpack --config test/webpack.roundtrip.js && node test/out/roundtrip.bundle.js
 (or npm run test:roundtrip)
*/
const path = require("path")
const webpack = require("webpack")

module.exports = {
    mode: "none",
    target: "node",
    devtool: false,
    entry: path.resolve(__dirname, "roundtrip.js"),
    output: {
        filename: "roundtrip.bundle.js",
        path: path.resolve(__dirname, "out"),
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["preact"],
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        //importHelper imports "../../components/Helpers"
        new webpack.NormalModuleReplacementPlugin(
            /[\\/]Helpers([\\/]index\.js)?$/,
            (resource) => {
                resource.request = path.resolve(__dirname, "stub-helpers.js")
            }
        ),
        //exportHelper imports "../../targets"
        new webpack.NormalModuleReplacementPlugin(
            /[\\/]targets([\\/]index\.js)?$/,
            (resource) => {
                resource.request = path.resolve(__dirname, "stub-targets.js")
            }
        ),
    ],
}
