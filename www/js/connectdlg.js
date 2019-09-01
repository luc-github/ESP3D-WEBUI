//Connect dialog
function connectdlg(getFw) {
    var modal = setactiveModal('connectdlg.html');
    var get_FW = true;
    if (modal == null) return;
    showModal();
    //removeIf(production)
    connectsuccess("FW version:0.9.9X # FW target:Smoothieware # FW HW:Direct SD # primary : /sd/ # secondary : /ext/ # authentication: no");
    return;
    //endRemoveIf(production)
    if (typeof getFw != 'undefined') get_FW = getFw;
    if (get_FW) retryconnect();
}

function getFWdata(response) {
    var tlist = response.split("#");
    //FW version:0.9.200 # FW target:smoothieware # FW HW:Direct SD # primary sd:/ext/ # secondary sd:/sd/ # authentication: yes
    if (tlist.length < 3) {
        return false;
    }
    //FW version
    var sublist = tlist[0].split(":");
    if (sublist.length != 2) {
        return false;
    }
    fw_version = sublist[1].toLowerCase().trim();
    //FW target
    sublist = tlist[1].split(":");
    if (sublist.length != 2) {
        return false;
    }
    target_firmware = sublist[1].toLowerCase().trim();
    //FW HW
    sublist = tlist[2].split(":");
    if (sublist.length != 2) {
        return false;
    }
    var sddirect = sublist[1].toLowerCase().trim();
    if (sddirect == "direct sd") direct_sd = true;
    else direct_sd = false;
    //primary sd
    sublist = tlist[3].split(":");
    if (sublist.length != 2) {
        return false;
    }
    if (!direct_sd && (target_firmware == "smoothieware")) {
        primary_sd = "sd/";
    } else {
        primary_sd = sublist[1].toLowerCase().trim();
    }
    //secondary sd
    sublist = tlist[4].split(":");
    if (sublist.length != 2) {
        return false;
    }
    if (!direct_sd && (target_firmware == "smoothieware")) {
        secondary_sd = "ext/";
    } else {
        secondary_sd = sublist[1].toLowerCase().trim();
    }
    //authentication
    sublist = tlist[5].split(":");
    if (sublist.length != 2) {
        return false;
    }
    if ((sublist[0].trim() == "authentication") && (sublist[1].trim() == "yes")) ESP3D_authentication = true;
    else ESP3D_authentication = false;
    //async communications
    if (tlist.length > 6) {
        sublist = tlist[6].split(":");
        if ((sublist[0].trim() == "webcommunication") && (sublist[1].trim() == "Async")) async_webcommunication = true;
        else {
            async_webcommunication = false;
            websocket_port = sublist[2].trim();
            if (sublist.length>3) {
                websocket_ip = sublist[3].trim();
            } else {
                console.log("No IP for websocket, use default");
                 websocket_ip =  document.location.hostname;
            }
        }
    }
    if (tlist.length > 7) {
        sublist = tlist[7].split(":");
        if (sublist[0].trim() == "hostname") esp_hostname = sublist[1].trim();
    }
    
    if ((target_firmware == "grbl-embedded") && (tlist.length > 8)) {
         sublist = tlist[8].split(":");
         if (sublist[0].trim() == "axis") {
             grblaxis = parseInt(sublist[1].trim());
            }
    }
    
    if (async_webcommunication) {
        if (!!window.EventSource) {
            event_source = new EventSource('/events');
            event_source.addEventListener('InitID', Init_events, false);
            event_source.addEventListener('ActiveID', ActiveID_events, false);
            event_source.addEventListener('DHT', DHT_events, false);
        }
    }
    startSocket();

    return true;
}

function connectsuccess(response) {
    if (getFWdata(response)) {
        console.log("Fw identification:" + response);
        if (ESP3D_authentication) {
            closeModal("Connection successful");
            document.getElementById('menu_authentication').style.display = 'inline';
            logindlg(initUI, true);
        } else {
            document.getElementById('menu_authentication').style.display = 'none';
            initUI();
        }
    } else {
        console.log(response);
        connectfailed(406, "Wrong data");
    }
}

function connectfailed(errorcode, response) {
    document.getElementById('connectbtn').style.display = 'block';
    document.getElementById('failed_connect_msg').style.display = 'block';
    document.getElementById('connecting_msg').style.display = 'none';
    console.log("Fw identification error " + errorcode + " : " + response);
}

function retryconnect() {
    document.getElementById('connectbtn').style.display = 'none';
    document.getElementById('failed_connect_msg').style.display = 'none';
    document.getElementById('connecting_msg').style.display = 'block';
    var url = "/command?plain=" + encodeURIComponent("[ESP800]");;
    SendGetHttp(url, connectsuccess, connectfailed)
}
