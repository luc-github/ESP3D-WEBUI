import merge from "webpack-merge"
import environment from "./environment"
import { productionPlugins, optimizationPlugins } from "./plugins"
var path = require("path")
var dist = "../dist/" +  process.env.TARGET_ENV + "/" + process.env.BUILD_ENV
module.exports = merge(environment, {
    optimization: optimizationPlugins,
    plugins: productionPlugins,
    output: {
        path: path.resolve(__dirname, dist),
    },
})
