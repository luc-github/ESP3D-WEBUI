function initMenus() {
    document.getElementById("FWLink").addEventListener("click", function () {
        window.open("https://github.com/luc-github/ESP3D-X", "_blank");
    });

    document.getElementById("UiLink").addEventListener("click", function () {
        window.open(
            "https://github.com/luc-github/ESP3D-WEBUI/tree/3.0",
            "_blank"
        );
    });

    document.getElementById("hlpLink").addEventListener("click", function () {
        window.open("https://github.com/luc-github/ESP3D-X/wiki", "_blank");
    });
}

export { initMenus };
