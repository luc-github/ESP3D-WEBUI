import merge from "webpack-merge"
import environment from "./environment"

module.exports = merge(environment, {
    devtool: "inline-source-map",
    devServer: {
    port: 3000,
    open: true,
    proxy: {
      '/command': 'http://localhost:8080',
    }
  },
})
