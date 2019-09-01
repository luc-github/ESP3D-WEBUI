//SPIFFS dialog
var SPIFFS_currentpath = "/";
var SPIFFS_currentfile = "";
var SPIFFS_upload_ongoing = false;

function SPIFFSdlg(root) {
    var modal = setactiveModal('SPIFFSdlg.html');
    if (modal == null) return;
    if (typeof root !== 'undefined') SPIFFS_currentpath = root;
    document.getElementById("SPIFFS-select").value = "";
    document.getElementById("SPIFFS_file_name").innerHTML = translate_text_item("No file chosen");
    document.getElementById("SPIFFS_uploadbtn").style.display = 'none';
    document.getElementById("SPIFFS_prg").style.display = 'none';
    document.getElementById("uploadSPIFFSmsg").style.display = 'none';
    document.getElementById("SPIFFS_select_files").style.display = 'none';
    showModal();
    refreshSPIFFS();
}

function closeSPIFFSDialog(msg) {
    if (SPIFFS_upload_ongoing) {
        alertdlg(translate_text_item("Busy..."), translate_text_item("Upload is ongoing, please wait and retry."));
        return;
    }
    closeModal(msg);
}

function SPIFFSnavbar() {
    var content = "<table><tr>";
    var tlist = SPIFFS_currentpath.split("/");
    var path = "/";
    var nb = 1;
    content += "<td><button class='btn btn-primary'  onclick=\"SPIFFS_currentpath='/'; SPIFFSSendCommand('list','all');\">/</button></td>";
    while (nb < (tlist.length - 1)) {
        path += tlist[nb] + "/";
        content += "<td><button class='btn btn-link' onclick=\"SPIFFS_currentpath='" + path + "'; SPIFFSSendCommand('list','all');\">" + tlist[nb] + "</button></td><td>/</td>";
        nb++;
    }
    content += "</tr></table>";
    return content;
}

function SPIFFSselect_dir(directoryname) {
    SPIFFS_currentpath += directoryname + "/";
    SPIFFSSendCommand('list', 'all');
}

function SPIFFS_Createdir() {
    inputdlg(translate_text_item("Please enter directory name"), translate_text_item("Name:"), processSPIFFS_Createdir);
}

function processSPIFFS_Createdir(answer) {
    if (answer.length > 0) SPIFFSSendCommand("createdir", answer.trim());
}

function SPIFFSDelete(filename) {
    SPIFFS_currentfile = filename;
    confirmdlg(translate_text_item("Please Confirm"), translate_text_item("Confirm deletion of file: ") + filename, processSPIFFSDelete);
}

function processSPIFFSDelete(answer) {
    if (answer == "yes") SPIFFSSendCommand("delete", SPIFFS_currentfile);
    SPIFFS_currentfile = "";
}

function SPIFFSDeletedir(filename) {
    SPIFFS_currentfile = filename;
    confirmdlg(translate_text_item("Please Confirm"), translate_text_item("Confirm deletion of directory: ") + filename, processSPIFFSDeleteDir);
}

function processSPIFFSDeleteDir(answer) {
    if (answer == "yes") SPIFFSSendCommand("deletedir", SPIFFS_currentfile);
    SPIFFS_currentfile = "";
}

function SPIFFSSendCommand(action, filename) {
    //removeIf(production)
    var response = "{\"files\":[{\"name\":\"config.html.gz\",\"size\":\"4.76 KB\"},{\"name\":\"index.html.gz\",\"size\":\"21.44 KB\"},{\"name\":\"favicon.ico\",\"size\":\"1.12 KB\"},{\"name\":\"config.htm\",\"size\":\"19.65 KB\"},{\"name\":\"config2.htm\",\"size\":\"19.98 KB\"},{\"name\":\"Testname\",\"size\":\"-1\"},{\"name\":\"index2.html.gz\",\"size\":\"28.89 KB\"}],\"path\":\"/\",\"status\":\"Ok\",\"total\":\"2.81 MB\",\"used\":\"118.88 KB\",\"occupation\":\"4\"}";
    SPIFFSsuccess(response);
    return;
    //endRemoveIf(production)
    var url = "/files?action=" + action;
    url += "&filename=" + encodeURI(filename);
    url += "&path=" + encodeURI(SPIFFS_currentpath);
    document.getElementById('SPIFFS_loader').style.visibility = "visible";
    console.log(url);
    SendGetHttp(url, SPIFFSsuccess, SPIFFSfailed);

}

function SPIFFSsuccess(response) {
    //console.log(response);
    var jsonresponse = JSON.parse(response);
    document.getElementById('SPIFFS_loader').style.visibility = "hidden";
    document.getElementById('refreshSPIFFSbtn').style.display = 'block';
    document.getElementById("SPIFFS_select_files").style.display = 'block';
    SPIFFSdispatchfilestatus(jsonresponse);
}

function SPIFFSfailed(errorcode, response) {
    document.getElementById('SPIFFS_loader').style.visibility = "hidden";
    document.getElementById('refreshSPIFFSbtn').style.display = 'block';
    document.getElementById('refreshSPIFFSbtn').style.display = 'block';
    alertdlg(translate_text_item("Error"), "Error " + errorcode + " : " + response);
    console.log("Error " + errorcode + " : " + response);
}

function SPIFFSdispatchfilestatus(jsonresponse) {
    var content = "";
    content = translate_text_item("Total:") + " " + jsonresponse.total;
    content += "&nbsp;&nbsp;|&nbsp;&nbsp;" + translate_text_item("Used:") + " " + jsonresponse.used;
    content += "&nbsp;";
    content += "<meter min='0' max='100' high='90' value='" + jsonresponse.occupation + "'></meter>&nbsp;" + jsonresponse.occupation + "%";
    if (jsonresponse.status != "Ok") content += "<br>" + translate_text_item(jsonresponse.status);
    document.getElementById('SPIFFS_status').innerHTML = content;
    content = "";
    if (SPIFFS_currentpath != "/") {
        var pos = SPIFFS_currentpath.lastIndexOf("/", SPIFFS_currentpath.length - 2)
        var previouspath = SPIFFS_currentpath.slice(0, pos + 1);
        content += "<tr style='cursor:pointer;' onclick=\"SPIFFS_currentpath='" + previouspath + "'; SPIFFSSendCommand('list','all');\"><td >" + get_icon_svg("level-up") + "</td><td colspan='4'> Up..</td></tr>";
    }
    jsonresponse.files.sort(function(a, b) {
        return compareStrings(a.name, b.name);
    });

    for (var i = 0; i < jsonresponse.files.length; i++) {
        //first display files
        if (String(jsonresponse.files[i].size) != "-1") {
            content += "<tr>";
            content += "<td  style='vertical-align:middle; color:#5BC0DE'>" + get_icon_svg("file") + "</td>";
            content += "<td  width='100%'  style='vertical-align:middle'><a href=\"" + jsonresponse.path + jsonresponse.files[i].name + "\" target=_blank><button  class=\"btn btn-link no_overflow\">";
            content += jsonresponse.files[i].name;
            content += "</button></a></td><td nowrap  style='vertical-align:middle'>";
            content += jsonresponse.files[i].size;
            content += "</td><td width='0%'  style='vertical-align:middle'><button class=\"btn btn-danger btn-xs\" style='padding: 5px 5px 0px 5px;' onclick=\"SPIFFSDelete('" + jsonresponse.files[i].name + "')\">";
            content += get_icon_svg("trash");
            content += "</button></td></tr>";
        }
    }

    //then display directories
    for (var i = 0; i < jsonresponse.files.length; i++) {
        if (String(jsonresponse.files[i].size) == "-1") {
            content += "<tr>";
            content += "<td style='vertical-align:middle ; color:#5BC0DE'>" + get_icon_svg("folder-close") + "</td>";
            content += "<td width='100%'  style='vertical-align:middle'><button class=\"btn btn-link\" onclick=\"SPIFFSselect_dir('" + jsonresponse.files[i].name + "');\">";
            content += jsonresponse.files[i].name;
            content += "</button></td><td>";
            content += "</td><td width='0%' style='vertical-align:middle'><button class=\"btn btn-danger btn-xs\" style='padding: 5px 4px 0px 4px;' onclick=\"SPIFFSDeletedir('" + jsonresponse.files[i].name + "')\">";
            content += get_icon_svg("trash");
            content += "</button></td></tr>";
        }

    }

    document.getElementById('SPIFFS_file_list').innerHTML = content;
    document.getElementById('SPIFFS_path').innerHTML = SPIFFSnavbar();
}

function refreshSPIFFS() {
    document.getElementById('SPIFFS-select').value = "";
    document.getElementById('uploadSPIFFSmsg').innerHTML = "";
    document.getElementById("SPIFFS_file_name").innerHTML = translate_text_item("No file chosen");
    document.getElementById('SPIFFS_uploadbtn').style.display = 'none';
    document.getElementById('refreshSPIFFSbtn').style.display = 'none';
    document.getElementById("SPIFFS_select_files").style.display = 'none';
    //removeIf(production)
    var response = "{\"files\":[{\"name\":\"config.html.gz\",\"size\":\"4.76 KB\"},{\"name\":\"index.html.gz\",\"size\":\"21.44 KB\"},{\"name\":\"favicon.ico\",\"size\":\"1.12 KB\"},{\"name\":\"config.htm\",\"size\":\"19.65 KB\"},{\"name\":\"config2.htm\",\"size\":\"19.98 KB\"},{\"name\":\"Testname\",\"size\":\"-1\"},{\"name\":\"index2.html.gz\",\"size\":\"28.89 KB\"}],\"path\":\"/\",\"status\":\"Ok\",\"total\":\"2.81 MB\",\"used\":\"118.88 KB\",\"occupation\":\"4\"}";
    SPIFFSsuccess(response);
    return;
    //endRemoveIf(production)
    SPIFFSSendCommand('list', 'all');
}

function checkSPIFFSfiles() {
    var files = document.getElementById('SPIFFS-select').files;
    document.getElementById('uploadSPIFFSmsg').style.display = 'none';
    if (files.length == 0) document.getElementById('SPIFFS_uploadbtn').style.display = 'none';
    else document.getElementById('SPIFFS_uploadbtn').style.display = 'block';
    if (files.length > 0) {
        if (files.length == 1) {
            document.getElementById("SPIFFS_file_name").innerHTML = files[0].name;
        } else {
            var tmp = translate_text_item("$n files");
            document.getElementById("SPIFFS_file_name").innerHTML = tmp.replace("$n", files.length);
        }
    } else {
        document.getElementById("SPIFFS_file_name").innerHTML = translate_text_item("No file chosen");
    }
}

function SPIFFSUploadProgressDisplay(oEvent) {
    if (oEvent.lengthComputable) {
        var percentComplete = (oEvent.loaded / oEvent.total) * 100;
        document.getElementById('SPIFFS_prg').value = percentComplete;
        document.getElementById('uploadSPIFFSmsg').innerHTML = translate_text_item("Uploading ") + SPIFFS_currentfile + " " + percentComplete.toFixed(0) + "%";
    } else {
        // Impossible because size is unknown
    }
}

function SPIFFS_UploadFile() {
    if (http_communication_locked) {
        alertdlg(translate_text_item("Busy..."), translate_text_item("Communications are currently locked, please wait and retry."));
        return;
    }
    var files = document.getElementById('SPIFFS-select').files
    var formData = new FormData();
    var url = "/files";
    formData.append('path', SPIFFS_currentpath);
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var arg = SPIFFS_currentpath + file.name + "S";
        //append file size first to check updload is complete
        formData.append(arg, file.size);
        formData.append('myfile[]', file, SPIFFS_currentpath + file.name);
    }
    document.getElementById('SPIFFS-select_form').style.display = 'none';
    document.getElementById('SPIFFS_uploadbtn').style.display = 'none';
    SPIFFS_upload_ongoing = true;
    document.getElementById('uploadSPIFFSmsg').style.display = 'block';
    document.getElementById('SPIFFS_prg').style.display = 'block';
    if (files.length == 1) SPIFFS_currentfile = files[0].name;
    else SPIFFS_currentfile = "";
    document.getElementById('uploadSPIFFSmsg').innerHTML = translate_text_item("Uploading ") + SPIFFS_currentfile;
    SendFileHttp(url, formData, SPIFFSUploadProgressDisplay, SPIFFSUploadsuccess, SPIFFSUploadfailed)
}

function SPIFFSUploadsuccess(response) {
    document.getElementById('SPIFFS-select').value = "";
    document.getElementById("SPIFFS_file_name").innerHTML = translate_text_item("No file chosen");
    document.getElementById('SPIFFS-select_form').style.display = 'block';
    document.getElementById('SPIFFS_prg').style.display = 'none';
    document.getElementById('SPIFFS_uploadbtn').style.display = 'none';
    document.getElementById('uploadSPIFFSmsg').innerHTML = "";
    document.getElementById('refreshSPIFFSbtn').style.display = 'block';
    SPIFFS_upload_ongoing = false;
    response = response.replace("\"status\":\"Ok\"", "\"status\":\"Upload done\"");
    var jsonresponse = JSON.parse(response);
    SPIFFSdispatchfilestatus(jsonresponse);
}

function SPIFFSUploadfailed(errorcode, response) {
    document.getElementById('SPIFFS-select_form').style.display = 'block';
    document.getElementById('SPIFFS_prg').style.display = 'none';
    document.getElementById('SPIFFS_uploadbtn').style.display = 'block';
    document.getElementById('uploadSPIFFSmsg').innerHTML = "";
    document.getElementById("uploadSPIFFSmsg").style.display = 'none';
    document.getElementById('refreshSPIFFSbtn').style.display = 'block';
    console.log("Error " + errorcode + " : " + response);
    if (esp_error_code !=0){
         alertdlg (translate_text_item("Error") + " (" + esp_error_code + ")", esp_error_message);
         document.getElementById('SPIFFS_status').innerHTML = translate_text_item("Error : ") + esp_error_message;
         esp_error_code = 0;
    } else {
        alertdlg (translate_text_item("Error"), "Error " + errorcode + " : " + response);
        document.getElementById('SPIFFS_status').innerHTML = translate_text_item("Upload failed : ") + errorcode;
    }
    SPIFFS_upload_ongoing = false;
    refreshSPIFFS();
}
