/**
 * A plugin for webpack which removes files and folders before and after compilation.
 * Docs: https://github.com/Amaimersion/remove-files-webpack-plugin
 */

const RemoveFilesWebpackPlugin = require("remove-files-webpack-plugin")

const config = {
    before: {
        include: ["dist"],
    },
    after: {
        exclude: ["dist/index.html.gz"],
        test: [
            {
                folder: "./dist",
                method: filePath => {
                    return new RegExp(/\.*$/, "m").test(filePath)
                },
            },
        ],
        log: true,
    },
}

export default () => new RemoveFilesWebpackPlugin(config)
