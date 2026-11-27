//Links of the menu buttons: injected at build time from config/targets.js
//(EMBEDDED_TARGET: esp3d, esp3dlib, grblhal...)
/* global __EMBEDDED_LINKS__ */
const links = __EMBEDDED_LINKS__;

function initMenus() {
    document.getElementById("FWLink").addEventListener("click", function () {
        window.open(links.firmware, "_blank");
    });

    document.getElementById("UiLink").addEventListener("click", function () {
        window.open(links.interface, "_blank");
    });

    document.getElementById("hlpLink").addEventListener("click", function () {
        window.open(links.help, "_blank");
    });
}

export { initMenus };
