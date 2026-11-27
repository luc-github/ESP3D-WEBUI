//Embedded page targets: one page per firmware, built into dist/<id>/.
//The links are injected at build time (EMBEDDED_TARGET env var, default
//esp3d) and used by the menu buttons of the page (src/menu.js).
//Add a target here, then its npm script in package.json
//("<id>": "node config/pack.js <id>") and its entry in the MENU table of
//config/menu.js.
const targets = {
    esp3d: {
        name: "ESP3D",
        links: {
            firmware: "https://github.com/luc-github/ESP3D-X",
            interface: "https://github.com/luc-github/ESP3D-WEBUI/tree/3.0",
            help: "https://esp3d.io/esp3d/version-3x/",
        },
    },
    esp3dlib: {
        name: "ESP3D-Lib",
        links: {
            firmware: "https://github.com/MarlinFirmware/Marlin",
            interface:
                "https://github.com/luc-github/ESP3D-WEBUI/tree/3.0/dist/Printer3D/Marlin-embedded",
            help: "https://esp3d.io/esp3dlib/version_3x/",
        },
    },
    grblhal: {
        name: "grblHAL",
        links: {
            firmware: "https://github.com/grblHAL",
            interface:
                "https://github.com/luc-github/ESP3D-WEBUI/tree/3.0/dist/CNC/GRBLHal",
            help: "https://github.com/grblHAL/core/wiki",
        },
    },
};

const defaultTarget = "esp3d";

//target selected by EMBEDDED_TARGET; exits with the list on an unknown id
function currentTarget() {
    const id = process.env.EMBEDDED_TARGET || defaultTarget;
    if (!targets[id]) {
        console.error(
            `Unknown EMBEDDED_TARGET "${id}" - expected one of: ${Object.keys(targets).join(", ")}`
        );
        process.exit(1);
    }
    return { id, ...targets[id] };
}

module.exports = { targets, defaultTarget, currentTarget };
