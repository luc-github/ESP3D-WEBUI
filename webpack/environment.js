import { environmentPlugins } from "./plugins"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
const devMode = process.env.NODE_ENV !== "production"

module.exports = {
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {
                        loader: devMode
                            ? "style-loader"
                            : MiniCssExtractPlugin.loader,
                        options: {},
                    },
                    { loader: "css-loader", options: { sourceMap: devMode } },
                    {
                        loader: "postcss-loader",
                        options: { sourceMap: devMode },
                    },
                    { loader: "sass-loader", options: { sourceMap: devMode } },
                ],
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    plugins: environmentPlugins,
}
