import merge from "webpack-merge"
import environment from "./environment"
var path = require('path');

module.exports = merge(environment, {
    devtool: "inline-source-map",
    devServer: {
        contentBase: path.join(__dirname, '../src/server/public/'),
        port: 3000,
        open: true,
        proxy: {
            "/command": "http://localhost:8080",
        },
    },
})
