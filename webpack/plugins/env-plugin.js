var webpack = require("webpack")

export default () =>
    new webpack.DefinePlugin({
        "process.env": {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            TARGET_ENV: JSON.stringify(process.env.TARGET_ENV),
        },
    })
