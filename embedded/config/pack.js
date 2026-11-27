/*
 * Build the embedded page for one or several targets (config/targets.js):
 *
 *   node config/pack.js              -> every target
 *   node config/pack.js all          -> every target
 *   node config/pack.js esp3d        -> one target (esp3d, esp3dlib, grblhal)
 *   node config/pack.js esp3d grblhal
 *
 * Each target is built into dist/<target>/ (index.html.gz and .br); the
 * plain index.html is removed after the build.
 */
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { targets } = require("./targets.js");

const root = path.join(__dirname, "..");
const args = process.argv.slice(2);
const ids =
    args.length === 0 || args.includes("all") ? Object.keys(targets) : args;

const unknown = ids.filter((id) => !targets[id]);
if (unknown.length) {
    console.error(
        `Unknown target(s): ${unknown.join(", ")} - expected: all, ${Object.keys(targets).join(", ")}`
    );
    process.exit(1);
}

const webpackBin = path.join(root, "node_modules", ".bin", "webpack");
for (const id of ids) {
    console.log(`\n=== ${targets[id].name} (${id}) -> dist/${id}/`);
    const r = spawnSync(
        `"${webpackBin}"`,
        ["--config", "config/webpack.prod.js"],
        {
            stdio: "inherit",
            shell: true,
            cwd: root,
            env: { ...process.env, EMBEDDED_TARGET: id },
        }
    );
    if (r.status !== 0) process.exit(r.status || 1);
    fs.rmSync(path.join(root, "dist", id, "index.html"), { force: true });
}
