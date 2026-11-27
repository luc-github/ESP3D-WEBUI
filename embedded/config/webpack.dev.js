const path = require("path");
const webpack = require("webpack");
//embedded page target (EMBEDDED_TARGET): links of the page and dist subfolder
const target = require("./targets.js").currentTarget();
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development", // this will trigger some webpack default stuffs for dev
    entry: path.resolve(__dirname, "../src/index.js"), // if not set, default path to './src/index.js'. Accepts an object with multiple key-value pairs, with key as your custom bundle filename(substituting the [name]), and value as the corresponding file path
    output: {
        filename: "[name].bundle.js", // [name] will take whatever the input filename is. defaults to 'main' if only a single entry value
        path: path.resolve(__dirname, "../dist"), // the folder containing you final dist/build files. Default to './dist'
    },
    devServer: {
        historyApiFallback: true, // to make our SPA works after a full reload, so that it serves 'index.html' when 404 response
        // secure mode (npm run dev secure): page served by Caddy over https
        open: process.env.SECURE ? "https://localhost:8443/" : true,
        // HMR websocket must go through the Caddy front in secure mode:
        // the default URL is derived from the page (https) but keeps this
        // server's plain-http port, which fails with ERR_SSL_PROTOCOL_ERROR
        // and retries forever. Caddy proxies the ws upgrade to 8088.
        client: process.env.SECURE
            ? { webSocketURL: "wss://localhost:8443/ws" }
            : undefined,
        static: {
            directory: path.resolve(__dirname, "./dist"),
        },
        port: 8088,
        proxy: {
            context: () => true,
            target: "http://localhost:8080",
        },
    },
    stats: "minimal", // default behaviour spit out way too much info. adjust to your need.
    devtool: "source-map", // a sourcemap type. map to original source with line number
    plugins: [
        new webpack.DefinePlugin({
            __EMBEDDED_LINKS__: JSON.stringify(target.links),
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "../src/index.html"),
            inlineSource: ".(js|css)$",
            inject: true,
        }),
    ], // automatically creates a 'index.html' for us with our <link>, <style>, <script> tags inserted! Visit https://github.com/jantimon/html-webpack-plugin for more options
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            },
            {
                test: /\.css$/, // run the loaders below only on .css files
                // this are the loaders. they interpret files, in this case css. they run from right to left sequence.
                // css-loader: "interprets @import and url() like import/require() and will resolve them."
                // style-loader: "Adds CSS to the DOM by injecting a <style> tag". this is fine for development.
                use: ["style-loader", "css-loader"],
            },
        ],
    },
};
