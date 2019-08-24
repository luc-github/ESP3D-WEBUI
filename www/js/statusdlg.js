var statuspage = 0;
var statuscontent = "";
//status dialog
function statusdlg() {
    var modal = setactiveModal('statusdlg.html');
    if (modal == null) return;
    showModal();
    refreshstatus();
    update_btn_status(0);
}

function next_status() {
    var modal = getactiveModal();
    var text = modal.element.getElementsByClassName("modal-text")[0];
    if (statuspage == 0) {
        text.innerHTML = statuscontent;
    } else {
        text.innerHTML = "<table><tr><td width='auto' style='vertical-align:top;'><label translate>Browser:</label></td><td>&nbsp;</td><td width='100%'><span class='text-info'><strong>" + navigator.userAgent + "</strong></span></td></tr></table>";
    }
    update_btn_status();
}

function update_btn_status(forcevalue) {
    if (typeof forcevalue !== 'undefined') {
        statuspage = forcevalue;
    }
    if (statuspage == 0) {
        statuspage = 1;
        document.getElementById('next_status_btn').innerHTML = get_icon_svg("triangle-right", "1em", "1em")
    } else {
        statuspage = 0;
        document.getElementById('next_status_btn').innerHTML = get_icon_svg("triangle-left", "1em", "1em")
    }
}

function statussuccess(response) {
    document.getElementById('refreshstatusbtn').style.display = 'block';
    document.getElementById('status_loader').style.display = 'none';
    var modal = getactiveModal();
    if (modal == null) return;
    var text = modal.element.getElementsByClassName("modal-text")[0];
    var tresponse = response.split("\n");
    statuscontent = "";
    for (var i = 0; i < tresponse.length; i++) {
        var data = tresponse[i].split(":");
        if (data.length >= 2) {
            statuscontent += "<label>" + translate_text_item(data[0]) + ": </label>&nbsp;<span class='text-info'><strong>";
            var data2 = data[1].split(" (")
            statuscontent += translate_text_item(data2[0].trim());
            for (v = 1; v < data2.length; v++) {
                statuscontent += " (" + data2[v];
            }
            for (v = 2; v < data.length; v++) {
                statuscontent += ":" + data[v];
            }
            statuscontent += "</strong></span><br>";
        } //else statuscontent += tresponse[i] + "<br>";
    }
    statuscontent += "<label>" + translate_text_item("WebUI version") + ": </label>&nbsp;<span class='text-info'><strong>";
    statuscontent += web_ui_version
    statuscontent += "</strong></span><br>";
    text.innerHTML = statuscontent;
    update_btn_status(0);
    //console.log(response);
}

function statusfailed(errorcode, response) {
    document.getElementById('refreshstatusbtn').style.display = 'block';
    document.getElementById('status_loader').style.display = 'none';
    document.getElementById('status_msg').style.display = 'block';
    console.log("Error " + errorcode + " : " + response);
    document.getElementById('status_msg').innerHTML = "Error " + errorcode + " : " + response;
}

function refreshstatus() {
    document.getElementById('refreshstatusbtn').style.display = 'none';
    document.getElementById('status_loader').style.display = 'block';
    var modal = getactiveModal();
    if (modal == null) return;
    var text = modal.element.getElementsByClassName("modal-text")[0];
    text.innerHTML = "";
    document.getElementById('status_msg').style.display = 'none';
    //removeIf(production)
    var response = "Chip ID: 13874112\nCPU Frequency: 160Mhz\nFree memory: 24.23 KB\nSDK: 2.0.0(656edbf)\nFlash Size: 4.00 MB\nAvailable Size for update: 652.17 KB(Ok)\nAvailable Size for SPIFFS: 3.00 MB\nBaud rate: 115200\nSleep mode: None\nChannel: 1\nPhy Mode: 11g\nWeb port: 80\nData port: 8888\nHostname: lucesp\nActive Mode: Station (5C:CF:7F:D3:B3:C0)\nConnected to: NETGEAR_2GEXT_OFFICE2\nSignal: 98%\nIP Mode: DHCP\nIP: 192.168.1.51\nGateway: 192.168.1.1\nMask: 255.255.255.0\nDNS: 192.168.1.1\nDisabled Mode: Access Point (5E:CF:7F:D3:B3:C0)\nCaptive portal: Enabled\nSSDP: Enabled\nNetBios: Enabled\nmDNS: Enabled\nWeb Update: Enabled\nPin Recovery: Disabled\nAuthentication: Disabled\nTarget Firmware: Smoothieware\nSD Card Support: Enabled\nFW version: 0.9.93\n";
    statussuccess(response);
    //statusfailed(500, "Error")
    return;
    //endRemoveIf(production)
    var url = "/command?plain=" + encodeURIComponent("[ESP420]plain");;
    SendGetHttp(url, statussuccess, statusfailed)
}
