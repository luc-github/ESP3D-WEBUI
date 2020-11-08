module.exports = function (config, env, helpers) {
    if (env.isProd) {
        config.devtool = false; // disable sourcemaps
        config.optimization.splitChunks.minChunks = 1;
    }
}