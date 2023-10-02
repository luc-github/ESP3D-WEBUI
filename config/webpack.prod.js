const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin")
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin")
const HTMLInlineCSSWebpackPlugin =
    require("html-inline-css-webpack-plugin").default
const Compression = require("compression-webpack-plugin")
let target = process.env.TARGET_ENV ? process.env.TARGET_ENV : "Printer3D"
let subtarget = process.env.SUBTARGET_ENV ? process.env.SUBTARGET_ENV : "Marlin"

module.exports = {
    resolve: {
        alias: {
            TargetDir: path.resolve(__dirname, "../src/targets", target),
            SubTargetDir: path.resolve(
                __dirname,
                "../src/targets",
                target,
                subtarget
            ),
        },
    },
    mode: "production", // this trigger webpack out-of-box prod optimizations
    entry: path.resolve(__dirname, "../src/index.js"),
    output: {
        filename: `[name].[hash].js`, // [hash] is useful for cache busting!
        path: path.resolve(__dirname, "../build"),
    },
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: false,
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: false,
                        },
                    },
                ],
            },
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
        // always deletes the dist folder first in each build run.
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css",
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "../src/index.html"),
            inlineSource: ".(js|css)$",
            inject: "body",
        }),

        new HtmlInlineScriptPlugin({
            scriptMatchPattern: [/.+[.]js$/],
            htmlMatchPattern: [/index.html$/],
        }),
        new HTMLInlineCSSWebpackPlugin(),
        new Compression({
            test: /\.(html)$/,
            filename:
                "[path]../dist/" + target + "/" + subtarget + "/[base].gz",
            algorithm: "gzip",
            exclude: /.map$/,
            deleteOriginalAssets: "keep-source-map",
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new HtmlMinimizerPlugin({
                minimizerOptions: {
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                },
                minify: (data, minimizerOptions) => {
                    const htmlMinifier = require("html-minifier-terser")
                    const [[filename, input]] = Object.entries(data)
                    return htmlMinifier.minify(input, minimizerOptions)
                },
            }),
        ],
    },
    devtool: "source-map", // supposedly the ideal type without bloating bundle size
}
