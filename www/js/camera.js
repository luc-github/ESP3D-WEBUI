function cameraformataddress() {
    var saddress = document.getElementById('camera_webaddress').value;
    var saddressl = saddress.trim().toLowerCase();
    saddress = saddress.trim();
    if (saddress.length > 0) {
        if (!(saddressl.indexOf("https://") != -1 || saddressl.indexOf("http://") != -1 || saddressl.indexOf("rtp://") != -1 || saddressl.indexOf("rtps://") != -1 || saddressl.indexOf("rtp://") != -1)) {
            saddress = "http://" + saddress;
        }
    }
    document.getElementById('camera_webaddress').value = saddress;
}

function camera_loadframe() {
    var saddress = document.getElementById('camera_webaddress').value;
    saddress = saddress.trim();
    if (saddress.length == 0) {
        document.getElementById('camera_frame').src = "";
        document.getElementById('camera_frame_display').style.display = "none";
        document.getElementById('camera_detach_button').style.display = "none";
    } else {
        cameraformataddress();
        document.getElementById('camera_frame').src = document.getElementById('camera_webaddress').value;
        document.getElementById('camera_frame_display').style.display = "block";
        document.getElementById('camera_detach_button').style.display = "table-row";
    }
}

function camera_OnKeyUp(event) {
    if (event.keyCode == 13) {
        camera_loadframe();
    }
    return true;
}


function camera_saveaddress() {
    cameraformataddress();
    preferenceslist[0].camera_address = HTMLEncode(document.getElementById('camera_webaddress').value);
    SavePreferences(true);
}

function camera_detachcam() {
    var webaddress = document.getElementById('camera_frame').src;
    document.getElementById('camera_frame').src = "";
    document.getElementById('camera_frame_display').style.display = "none";
    document.getElementById('camera_detach_button').style.display = "none";
    window.open(webaddress);
}

function camera_GetAddress() {
    if (typeof(preferenceslist[0].camera_address) !== 'undefined') {
        document.getElementById('camera_webaddress').value = decode_entitie(preferenceslist[0].camera_address);
    } else document.getElementById('camera_webaddress').value = "";
}