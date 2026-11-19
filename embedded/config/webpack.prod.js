const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");
const HTMLInlineCSSWebpackPlugin =
    require("html-inline-css-webpack-plugin").default;
const Compression = require("compression-webpack-plugin");

module.exports = {
    mode: "production", // this trigger webpack out-of-box prod optimizations
    entry: path.resolve(__dirname, "../src/index.js"),
    output: {
        filename: `[name].[hash].js`, // [hash] is useful for cache busting!
        path: path.resolve(__dirname, "../dist"),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                [
                                    "@babel/preset-env",
                                    {
                                        useBuiltIns: "usage",
                                        debug: false,
                                        corejs: 3,
                                        targets: { chrome: "88" },
                                    },
                                ],
                            ],
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
            filename: "[path][base].gz",
            algorithm: "gzip",
            exclude: /.map$/,
            deleteOriginalAssets: false,
        }),
        new Compression({
            test: /\.(html)$/,
            filename: "[path][base].br",
            algorithm: "brotliCompress",
            compressionOptions: {
                level: 11, // max compression
            },
            exclude: /.map$/,
            // Both instances must keep deleteOriginalAssets: false - webpack's
            // deleteAsset cascades to "related" assets, so letting one plugin
            // delete index.html would remove the other's compressed output.
            // The plain index.html is removed by the pack script instead.
            deleteOriginalAssets: false,
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
                    const htmlMinifier = require("html-minifier-terser");
                    const [[filename, input]] = Object.entries(data);

                    return htmlMinifier.minify(input, minimizerOptions);
                },
            }),
        ],
    },
    // No source maps in production firmware to minimize HTML size.
    devtool: false,
};
