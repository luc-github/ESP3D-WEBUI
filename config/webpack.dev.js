const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
let target = process.env.TARGET_ENV ? process.env.TARGET_ENV : "Printer3D";
let subtarget = process.env.SUBTARGET_ENV
  ? process.env.SUBTARGET_ENV
  : "Marlin";
console.log("Target:", target, " Subtarget:", subtarget);
module.exports = {
  resolve: {
    alias: {
      TargetPath: path.resolve(
        __dirname,
        "../src/components/Targets",
        target,
        subtarget
      ),
      TranslateTargetPath: path.resolve(
        __dirname,
        "../src/components/Translations",
        target,
      ),
      TranslateSubTargetPath: path.resolve(
        __dirname,
        "../src/components/Translations",
        target,
        subtarget,
        
      ),
    },
  },
  mode: "development", // this will trigger some webpack default stuffs for dev
  entry: path.resolve(__dirname, "../src/index.js"), // if not set, default path to './src/index.js'. Accepts an object with multiple key-value pairs, with key as your custom bundle filename(substituting the [name]), and value as the corresponding file path
  output: {
    filename: "[name].bundle.js", // [name] will take whatever the input filename is. defaults to 'main' if only a single entry value
    path: path.resolve(__dirname, "../dist"), // the folder containing you final dist/build files. Default to './dist'
  },
  devServer: {
    historyApiFallback: true, // to make our SPA works after a full reload, so that it serves 'index.html' when 404 response
    open: true,
    contentBase: path.resolve(__dirname, "./dist"),
    inline: true,
    port: 8088,
    proxy: {
      context: () => true,
      target: "http://localhost:8080",
    },
  },
  stats: "minimal", // default behaviour spit out way too much info. adjust to your need.
  devtool: "source-map", // a sourcemap type. map to original source with line number
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // all options are optional
      filename: "[name].css",
      chunkFilename: "[id].css",
      ignoreOrder: false, // Enable to remove warnings about conflicting order
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
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "preact"],
          },
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          { loader: "style-loader" },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
};
