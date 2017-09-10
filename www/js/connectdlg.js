//Connect dialog
function connectdlg () {
    var value = get_localdata('language');
    if (String(value).length == 0 || String(value)=="null") value="en";
    build_language_menu();
    translate_text(value);
    var modal = setactiveModal('connectdlg.html');
    if ( modal == null) return;
    showModal() ;
    //removeIf(production)
    connectsuccess("FW version:0.9.9X # FW target:Smoothieware # FW HW:Direct SD # primary : /sd/ # secondary : /ext/ # authentication: no");
    return;
    //endRemoveIf(production)
    retryconnect ();
}

function getFWdata(response){
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
    if (sddirect == "direct sd") direct_sd=true;
    else direct_sd = false;
    //primary sd
    sublist = tlist[3].split(":");
    if (sublist.length != 2) {
        return false;
        }
    primary_sd = sublist[1].toLowerCase().trim();
    //secondary sd
    sublist = tlist[4].split(":");
    if (sublist.length != 2) {
        return false;
        }
    secondary_sd = sublist[1].toLowerCase().trim();
    //authentication
    var sublist = tlist[5].split(":");
    if (sublist.length != 2) {
        return false;
        }
    if ((sublist[0].trim() == "authentication" ) && (sublist[1].trim() == "yes")) ESP3D_authentication = true;
    else ESP3D_authentication = false;
    return true;
}

function connectsuccess(response){
        if (getFWdata( response))
            {
            //document.getElementById('main_ui').style.display='block';
            closeModal("Connection successful");
            if (ESP3D_authentication) {
                document.getElementById('menu_autthentication').style.display='inline';
                logindlg(initUI, true);
            }
            else {
                document.getElementById('menu_autthentication').style.display='none';
                initUI();
                }
            }
        else {
            console.log(response);
            connectfailed(406, "Wrong data");
        }
}

function connectfailed(errorcode, response){
    document.getElementById('connectbtn').style.display='block';
    document.getElementById('failed_connect_msg').style.display='block';
    document.getElementById('connecting_msg').style.display='none';
    console.log("Error " + errorcode + " : " + response);
}

function retryconnect () {
    document.getElementById('connectbtn').style.display='none';
    document.getElementById('failed_connect_msg').style.display='none';
    document.getElementById('connecting_msg').style.display='block';
    var url = "/command?plain="+encodeURIComponent("[ESP800]");;
    SendGetHttp(url, connectsuccess, connectfailed)
}
