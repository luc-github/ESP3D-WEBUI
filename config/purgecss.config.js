/**
 * Shared PurgeCSS config for webpack.dev and webpack.prod.
 * Keeps test and production CSS identical so layout/class bugs show up in dev.
 */
const path = require("path")
const glob = require("glob")

const srcPath = path.join(__dirname, "../src")
const purgeContent = [
    ...glob.sync(`${srcPath}/**/*.js`, { nodir: true }),
    ...glob.sync(`${srcPath}/**/*.jsx`, { nodir: true }),
    path.join(srcPath, "index.html"),
]

const purgeSafelist = {
    standard: [
        /^tooltip/,
        /^modal/,
        /^dropdown/,
        /^toast/,
        /^open$/,
        /^active$/,
        /^disabled$/,
        /^loading$/,
        /^show$/,
        /^panel-drop-indicator-/,
    ],
}

module.exports = { purgeContent, purgeSafelist }
