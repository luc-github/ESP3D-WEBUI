import compressionPlugin from "./compression-plugin"
import htmlWebpackInlineSourcePlugin from "./html-webpack-inline-source-plugin"
import optimizeCSSAssetsPlugin from "./optimize-css-assets-webpack-plugin"
import htmlWebpackPlugin from "./html-webpack-plugin"
import htmlMinifierWebpackPlugin from "./html-minifier-webpack-plugin"
import miniCssExtractPlugin from "./mini-css-extract-plugin"
import removeFilesWebpackPlugin from "./remove-files-webpack-plugin"
import terserPlugin from "./terser-plugin"

export const environmentPlugins = [htmlWebpackPlugin(), miniCssExtractPlugin()]

export const optimizationPlugins = {
    minimizer: [terserPlugin(), optimizeCSSAssetsPlugin()],
}

export const productionPlugins = [
    htmlWebpackInlineSourcePlugin(),
    htmlMinifierWebpackPlugin(),
    compressionPlugin(),
    removeFilesWebpackPlugin(),
]
