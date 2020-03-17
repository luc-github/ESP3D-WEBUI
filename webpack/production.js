import merge from "webpack-merge"
import environment from "./environment"
import { productionPlugins, optimizationPlugins } from "./plugins"

module.exports = merge(environment, {
    optimization: optimizationPlugins,
    plugins: productionPlugins,
})
