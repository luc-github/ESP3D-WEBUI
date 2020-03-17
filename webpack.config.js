// Imports: Dependencies
const path = require("path")
require("@babel/register")

module.exports = (env, argv) => {
  return require(`./webpack/${argv.mode}.js`)
}
