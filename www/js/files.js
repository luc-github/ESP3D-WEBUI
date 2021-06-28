var files_currentPath = "/";
var files_filter_sd_list = false;
var files_file_list = [];
var files_file_list_cache = [];
var files_status_list = [];
var files_current_file_index = -1;
var files_error_status = "";
var tfiles_filters;
var tft_sd = "SD:"
var tft_usb = "U:"
var printer_sd = "SDCARD:"
var current_source = "/"
var last_source = "/"

function build_file_filter_list(filters_list) {
    build_accept(filters_list);
    update_files_list();
}

function update_files_list() {
    //console.log("Updating list");
    if (files_file_list.length == 0) return;
    for (var i = 0; i < files_file_list.length; i++) {
        var isdirectory = files_file_list[i].isdir;
        var file_name = files_file_list[i].name;
        files_file_list[i].isprintable = files_showprintbutton(file_name, isdirectory);
    }
    files_build_display_filelist();
}

function build_accept(file_filters_list) {
    var accept_txt = "";
    if (typeof file_filters_list != 'undefined') {
        tfiles_filters = file_filters_list.trim().split(";");
        for (var i = 0; i < tfiles_filters.length; i++) {
            var v = tfiles_filters[i].trim();
            if (v.length > 0) {
                if (accept_txt.length > 0) accept_txt += ", ";
                accept_txt += "." + v;
            }
        }
    }
    if (accept_txt.length == 0) {
        accept_txt = "*, *.*";
        tfiles_filters = "";
    }
    document.getElementById('files_input_file').accept = accept_txt;
    console.log(accept_txt);
}

function init_files_panel(dorefresh) {
    if (target_firmware == "smoothieware") {
        files_currentPath = primary_sd;
        document.getElementById('files_refresh_primary_sd_btn').innerHTML = primary_sd.substring(0, primary_sd.length - 1);
        document.getElementById('files_refresh_secondary_sd_btn').innerHTML = secondary_sd.substring(0, secondary_sd.length - 1);
        if (primary_sd.toLowerCase() != "none") document.getElementById('files_refresh_primary_sd_btn').style.display = "inline";
        if (secondary_sd.toLowerCase() != "none") document.getElementById('files_refresh_secondary_sd_btn').style.display = "inline";
        document.getElementById('files_createdir_btn').style.display = "none";
        document.getElementById('files_refresh_btn').style.display = "none";
    } else {
        if (target_firmware == "???") document.getElementById('files_refresh_btn').style.display = "none";
        else document.getElementById('files_refresh_btn').style.display = "inline";
        document.getElementById('files_refresh_primary_sd_btn').style.display = "none";
        document.getElementById('files_refresh_secondary_sd_btn').style.display = "none";
        if(target_firmware == "grbl") {
            document.getElementById('files_refresh_printer_sd_btn').style.display = 'none';
            document.getElementById('files_refresh_btn').style.display = 'none';
            document.getElementById('print_upload_btn').style.display = 'none';
            document.getElementById('files_createdir_btn').style.display = "none";
        }
    }
    if (!((target_firmware == "marlin") || (target_firmware == "???") ||(target_firmware == "grbl"))) document.getElementById('files_createdir_btn').style.display = "inline";
    else document.getElementById('files_createdir_btn').style.display = "none";
    files_set_button_as_filter(files_filter_sd_list);
    var refreshlist = true;
    if (typeof dorefresh !== 'undefined') refreshlist = dorefresh;
    if (direct_sd && refreshlist) files_refreshFiles(files_currentPath);
}

function files_set_button_as_filter(isfilter) {
    if (!isfilter) {
        document.getElementById('files_filter_glyph').innerHTML = get_icon_svg("filter", "1em", "1em");
    } else {
        document.getElementById('files_filter_glyph').innerHTML = get_icon_svg("list-alt", "1em", "1em");
    }
}

function files_filter_button(item) {
    files_filter_sd_list = !files_filter_sd_list;
    files_set_button_as_filter(files_filter_sd_list);
    files_build_display_filelist();
}

function files_build_file_line(index) {
    var content = "";
    var entry = files_file_list[index];
    var is_clickable = files_is_clickable(index);
    if ((files_filter_sd_list && entry.isprintable) || (!files_filter_sd_list)) {
        content += "<li class='list-group-item list-group-hover' >";
        content += "<div class='row'>";
        content += "<div class='col-md-5 col-sm-5 no_overflow' ";
        if (is_clickable) {
            content += "style='cursor:pointer;' onclick='files_click_file(" + index + ")'";
        }
        content += "><table><tr><td><span  style='color:DeepSkyBlue;'>";
        if (entry.isdir == true) content += get_icon_svg("folder-open");
        else content += get_icon_svg("file");
        content += "</span ></td><td>";
        if (direct_sd && (target_firmware == "marlin") && (typeof entry.sdname !== 'undefined')) {
            content += entry.sdname;
        } else {
            content += entry.name;
        }
        content += "</td></tr></table></div>";
        var sizecol = "col-md-2 col-sm-2";
        var timecol = "col-md-3 col-sm-3";
        var iconcol = "col-md-2 col-sm-2";
        if (!entry.isdir && entry.datetime == "") {
            sizecol = "col-md-4 col-sm-4";
            timecol = "hide_it";
            iconcol = "col-md-3 col-sm-3";
        }
        content += "<div class='" + sizecol + "'";
        if (is_clickable) {
            content += "style='cursor:pointer;' onclick='files_click_file(" + index + ")' ";
        }
        var size= entry.size;
        if (entry.isdir)size="";
        content += ">" +  size + "</div>";
        content += "<div class='" + timecol + "'";
        if (is_clickable) {
            content += "style='cursor:pointer;' onclick='files_click_file(" + index + ")' ";
        }
        content += ">" + entry.datetime + "</div>";
        content += "<div class='" + iconcol + "'>";
        content += "<div class='pull-right'>";
        if (entry.isprintable) {
            content += "<button class='btn btn-xs btn-default'  onclick='files_print(" + index + ")' style='padding-top: 4px;'>";
            if ((target_firmware == "grbl-embedded") || (target_firmware == "grbl")) content += get_icon_svg("play", "1em", "1em");
            else content += get_icon_svg("print", "1em", "1em");
            content += "</button>";
        }
        content += "&nbsp;";
        if (files_showdeletebutton(index)) {
            content += "<button class='btn btn-xs btn-danger' onclick='files_delete(" + index + ")'  style='padding-top: 4px;'>" + get_icon_svg("trash", "1em", "1em") + "</button>";
        }
        content += "</div>";
        content += "</div>";
        content += "</div>";
        content += "</li>";
    }
    return content;
}

function files_print(index) {
    files_print_filename(files_currentPath + files_file_list[index].name);
}

function files_print_filename(filename) {
    var cmd = "";
    if (target_firmware == "smoothieware") {
        cmd = "play " + filename;
    } else if (target_firmware == "grbl-embedded") {
        SendPrinterCommand("?", false, null, null, 114, 1);
        on_autocheck_status(true);
        cmd = "[ESP220]" + filename;
    } else {
        var newfilename = filename;
        if ((current_source == tft_sd) || (current_source == tft_usb))newfilename = current_source+filename;
        cmd = "M23 " + newfilename + "\nM24";
    }
    if (target_firmware == "grbl-embedded") SendPrinterCommand(cmd);
    else SendPrinterSilentCommand(cmd);
}

function files_Createdir() {
    inputdlg(translate_text_item("Please enter directory name"), translate_text_item("Name:"), process_files_Createdir);
}

function process_files_Createdir(answer) {
    if (answer.length > 0) files_create_dir(answer.trim());
}

function files_create_dir(name) {
    if (direct_sd && !((target_firmware == "smoothieware") && files_currentPath.startsWith(secondary_sd))) {
        var cmdpath = files_currentPath;
        if (target_firmware == "smoothieware") cmdpath = files_currentPath.substring(primary_sd.length);
        var url = "/upload?path=" + encodeURIComponent(cmdpath) + "&action=createdir&filename=" + encodeURIComponent(name);
        document.getElementById('files_nav_loader').style.display = "block";
        SendGetHttp(url, files_directSD_list_success, files_directSD_list_failed);
    } else {
        var command = "";
        if (target_firmware == "smoothieware") {
            command = "mkdir " + files_currentPath + name;
        } else {
            command = "M32 " + files_currentPath + name;
        }
        SendPrinterCommand(command, true, files_proccess_and_update);
    }
}

function files_delete(index) {
    files_current_file_index = index;
    var msg = translate_text_item("Confirm deletion of directory: ");
    if (!files_file_list[index].isdir) msg = translate_text_item("Confirm deletion of file: ");
    confirmdlg(translate_text_item("Please Confirm"), msg + files_file_list[index].name, process_files_Delete);
}

function process_files_Delete(answer) {
    if (answer == "yes" && files_current_file_index != -1) files_delete_file(files_current_file_index);
    files_current_file_index = -1;
}

function files_delete_file(index) {
    files_error_status = "Delete " + files_file_list[index].name;
    if (direct_sd && !((target_firmware == "smoothieware") && files_currentPath.startsWith(secondary_sd))) {
        var cmdpath = files_currentPath;
        if (target_firmware == "smoothieware") cmdpath = files_currentPath.substring(primary_sd.length);
        var url = "/upload?path=" + encodeURIComponent(cmdpath) + "&action=";
        if (files_file_list[index].isdir) {
            url += "deletedir&filename=";
        } else {
            url += "delete&filename=";
        }
        url += encodeURIComponent(files_file_list[index].sdname);
        document.getElementById('files_nav_loader').style.display = "block";
        SendGetHttp(url, files_directSD_list_success, files_directSD_list_failed);
    } else {
        var command = "";
        if (target_firmware == "smoothieware") {
            command = "rm " + files_currentPath + files_file_list[index].name;
        } else {
            command = "M30 ";
            if ((current_source == tft_usb)|| (current_source == tft_sd))command +=current_source;
            command += files_currentPath + files_file_list[index].name;
        }
        SendPrinterCommand(command, true, files_proccess_and_update);
    }
}

function files_proccess_and_update(answer) {
    document.getElementById('files_navigation_buttons').style.display = "block";
    if (answer.startsWith("{") && answer.endsWith("}")) {
        try {
            response = JSON.parse(answer);
            if (typeof response.status != 'undefined') {
                Monitor_output_Update(response.status + "\n");
                files_error_status = response.status;
                //console.log(files_error_status);
            }
        } catch (e) {
            console.error("Parsing error:", e);
            response = "Error";
        }

    } else {
        if (answer[answer.length - 1] != '\n') Monitor_output_Update(answer + "\n");
        else Monitor_output_Update(answer);
        answer = answer.replace("\nok", "");
        answer = answer.replace(/\n/gi, "");
        answer = answer.replace(/\r/gi, "");
        answer = answer.trim();
        console.log(answer)
        if (answer.length > 0) files_error_status = answer;
        else if (files_error_status.length == 0) files_error_status = "Done";
    }
    //console.log("error status:" + files_error_status);
    files_refreshFiles(files_currentPath);
}

function files_is_clickable(index) {
    var entry = files_file_list[index];
    if (entry.isdir) return true;
    if (direct_sd && !(target_firmware == "smoothieware" && files_currentPath.startsWith(secondary_sd))) return true;
    //not yet implemented but possible with cat command ?
    //if ( (target_firmware == "smoothieware") && entry.isprintable) return true;
    return false;
}

function files_click_file(index) {
    var entry = files_file_list[index];
    if (entry.isdir) {
        var path = files_currentPath + entry.name + "/";
        files_refreshFiles(path, true);
        return;
    }
    if (direct_sd && (!(target_firmware == "smoothieware" && files_currentPath.startsWith(secondary_sd)) || (target_firmware != "smoothieware"))) {
        //console.log("file on direct SD");
        var url = "";
        if (target_firmware == "smoothieware") url = files_currentPath.replace(primary_sd, "/SD/") + entry.sdname;
        else url = "/SD/" + files_currentPath + entry.sdname;
        window.open(url.replace("//", "/"));
        return;
    }
    if (target_firmware == "smoothieware" && entry.isprintable) {
        //console.log("file on smoothie SD");
        //todo use a cat command ?
        return;
    }
}

function files_showprintbutton(filename, isdir) {
    if (isdir == true) return false;
    if (target_firmware == "grbl") {
        var path = files_currentPath + filename.trim();
        if ((path.indexOf(" ") != -1) || (path.indexOf("?") != -1) || (path.indexOf("!") != -1) || (path.indexOf("~") != -1)) {
            return false;
        }
    }
    if (tfiles_filters.length == 0) {
        return true;
    }
    for (var i = 0; i < tfiles_filters.length; i++) {
        var v = "." + tfiles_filters[i].trim();
        if (filename.endsWith(v)) return true;
    }
    return false;
}

function files_showdeletebutton(index) {
    //can always deleted dile or dir ?
    //if /ext/ is serial it should failed as fw does not support it
    //var entry = files_file_list[index];    
    //if (direct_sd && !( target_firmware == "smoothieware"  && files_currentPath.startsWith(secondary_sd))) return true;
    //if (!entry.isdir) return true;
    //if ( target_firmware == "smoothieware"  && files_currentPath.startsWith("/sd/")) return true
    return true;
}

function cleanpath(path){
    var p = path;
    p.trim();
    if (p[0]!='/')p="/"+p;
    if (p!="/"){
        if (p.endsWith("/")){
            p = p .substr(0, p.length - 1);
        }
    }
    return p;
}

function files_refreshFiles(path, usecache) {
    //console.log("refresh requested " + path);
    var cmdpath = path;
    files_currentPath = path;
    if (current_source != last_source){
        files_currentPath = "/";
        path="/";
        last_source = current_source;
    }
    if ((current_source==tft_sd) || (current_source==tft_usb)){
     document.getElementById('print_upload_btn').style.display="none";
    } else {
     document.getElementById('print_upload_btn').style.display="block";
    }
    if (typeof usecache === 'undefined') usecache = false;
    document.getElementById('files_currentPath').innerHTML = files_currentPath;
    files_file_list = [];
    files_status_list = [];
    files_build_display_filelist(false);
    document.getElementById('files_list_loader').style.display = "block";
    document.getElementById('files_nav_loader').style.display = "block";
    //this is pure direct SD
    if (direct_sd && !(target_firmware == "smoothieware" && files_currentPath.startsWith(secondary_sd))) {
        if (target_firmware == "smoothieware") cmdpath = path.substring(4);
        var url = "/upload?path=" + encodeURI(cmdpath);
        //removeIf(production)
        var response = "{\"files\":[{\"name\":\"test2.gco\",\"shortname\":\"test2.gco\",\"size\":\"992 B\",\"datetime\":\"2000-01-01 01:00:00\"},{\"name\":\"simpl3d.gcode\",\"shortname\":\"SIMPL3~1.GCO\",\"size\":\"0 B\",\"datetime\":\"2000-01-01 01:00:00\"},{\"name\":\"patt2.g\",\"shortname\":\"patt2.g\",\"size\":\"9.73 MB\",\"datetime\":\"2000-01-01 01:00:00\"},{\"name\":\"myfolder\",\"shortname\":\"myfolder\",\"size\":\"-1\",\"datetime\":\"2016-08-01 18:15:00\"},{\"name\":\"wconfig.ok\",\"shortname\":\"wconfig.ok\",\"size\":\"1.10 KB\",\"datetime\":\"2017-01-06 14:35:54\"},{\"name\":\"gpl.txt\",\"shortname\":\"gpl.txt\",\"size\":\"34.98 KB\",\"datetime\":\"2017-04-17 20:22:32\"},{\"name\":\"m1.g\",\"shortname\":\"m1.g\",\"size\":\"17 B\",\"datetime\":\"2000-01-01 01:00:00\"},{\"name\":\"m2.g\",\"shortname\":\"m2.g\",\"size\":\"17 B\",\"datetime\":\"2000-01-01 01:00:00\"},{\"name\":\"Test4.g\",\"shortname\":\"TEST4.G\",\"size\":\"20.47 KB\",\"datetime\":\"2000-01-01 01:00:00\"},{\"name\":\"README.md\",\"shortname\":\"README.md\",\"size\":\"11.83 KB\",\"datetime\":\"2017-04-17 20:25:08\"},{\"name\":\"test file.gcode\",\"shortname\":\"TESTFI~1.GCO\",\"size\":\"11 B\",\"datetime\":\"2000-01-01 01:00:00\"},{\"name\":\"M3.g\",\"shortname\":\"M3.g\",\"size\":\"32 B\",\"datetime\":\"2000-01-01 01:00:00\"}],\"path\":\"/\",\"total\":\"14 GB\",\"used\":\"28 MB\",\"occupation\":\"1\",\"mode\":\"direct\",\"status\":\"Ok\"}";
        files_directSD_list_success(response);
        return;
        //endRemoveIf(production)
        SendGetHttp(url, files_directSD_list_success, files_directSD_list_failed);
    } else {
        //use ls or M20
        if (target_firmware == "smoothieware") {
            //workaround as ls do not like dirname ending with /
            var command = "ls -s " + cleanpath(files_currentPath);
            SendPrinterCommand(command, false, files_serial_ls_list_success, files_serial_ls_list_failed);
            //
        } else {
            var command = "M20";
            if (current_source == "SD:") {
                document.getElementById('fileSource').innerHTML="TFT SD";
                if (path.endsWith("/")){
                    var newpath = path.substring(0, path.length - 1);
                    path= newpath;
                }
                command="M20 SD:"+ path;
                
                usecache = false;
            } else if (current_source == "U:") {
                document.getElementById('fileSource').innerHTML="TFT USB";
                if (path.endsWith("/")){
                    var newpath = path.substring(0, path.length - 1);
                    path= newpath;
                }
                command="M20 U:"+ path;
                usecache = false;
            } else {
                //Standard M20
                current_source = "/";
                document.getElementById('fileSource').innerHTML=translate_text_item("SD Files");
            }
            //to avoid to query when we already have the list
            if (usecache) {
                files_serial_M20_list_display();
            } else {
                SendPrinterCommand(command, false, files_serial_M20_list_success, files_serial_M20_list_failed);
            }
        }
    }
}

function files_format_size(size) {
    var lsize = parseInt(size);
    var value = 0.0;
    var tsize = "";
    if (lsize < 1024) {
        tsize = lsize + " B";
    } else if (lsize < (1024 * 1024)) {
        value = (lsize / 1024.0);
        tsize = value.toFixed(2) + " KB";
    } else if (lsize < (1024 * 1024 * 1024)) {
        value = ((lsize / 1024.0) / 1024.0);
        tsize = value.toFixed(2) + " MB";
    } else {
        value = (((lsize / 1024.0) / 1024.0) / 1024.0);
        tsize = value.toFixed(2) + " GB";
    }
    return tsize;
}

function files_serial_M20_list_display() {
    var path = "";
    if (files_currentPath.length > 1) path = files_currentPath.substring(1);
    var folderlist = "";
    for (var i = 0; i < files_file_list_cache.length; i++) {
        //console.log("processing " + files_file_list_cache[i].name)
        var file_name = files_file_list_cache[i].name;
        if (file_name.startsWith(path) || (current_source == tft_usb)|| (current_source == tft_sd)) {
            //console.log("need display " + file_name)
            if (!((current_source == tft_usb)|| (current_source == tft_sd)))file_name = file_name.substring(path.length);
            //console.log ("file name is :" + file_name)
            if (file_name.length > 0) {
                var endpos = file_name.indexOf("/");
                if (endpos > -1) file_name = file_name.substring(0, endpos + 1);
                var isdirectory = files_file_list_cache[i].isdir;
                var isprint = files_file_list_cache[i].isprintable;
                //to workaround the directory is not listed on its own like in marlin
                if (file_name.endsWith("/")) {
                    isdirectory = true;
                    isprint = false;
                    file_name = file_name.substring(0, file_name.length - 1);
                }
                var file_entry = {
                    name: file_name,
                    size: files_file_list_cache[i].size,
                    isdir: isdirectory,
                    datetime: files_file_list_cache[i].datetime,
                    isprintable: isprint
                };
                var tag = "*" + file_name + "*";
                if ((isdirectory && folderlist.indexOf(tag) == -1) || !isdirectory) {
                    //console.log("add to list " + file_name)
                    files_file_list.push(file_entry);
                    if (isdirectory) {
                        folderlist += tag;
                    }
                }
            }
        }
    }
    files_build_display_filelist();
}

function files_serial_M20_list_success(response_text) {
    var path = "";
    var tlist = response_text.split("\n");
    if (files_currentPath.length > 1) path = files_currentPath.substring(1);
    var folderlist = "";
    files_file_list_cache = [];
    for (var i = 0; i < tlist.length; i++) {
        var line = tlist[i].trim();
        var isdirectory = false;
        var file_name = "";
        var fsize = "";
        var d = "";
        line = line.replace("\r", "");
        if (!((line.length == 0) || (line.indexOf("egin file list") > 0) || (line.indexOf("nd file list") > 0) || (line.startsWith("ok ") > 0)|| (line.indexOf(":") > 0) || (line == "ok")  || (line == "wait"))) {
            //for marlin
            if (line.startsWith("/")) {
                line = line.substring(1);
            }
            //if directory it is ending with /
            if (line.endsWith("/")) {
                isdirectory = true;
                file_name = line;
                //console.log(file_name + " is a dir");
            } else {
                //console.log(line + " is a file");
                if ((target_firmware == "repetier") || (target_firmware == "repetier4davinci") || (target_firmware == "marlin")) {
                    var pos = line.lastIndexOf(" ");
                    if (pos != -1) {
                        file_name = line.substr(0, pos);
                        fsize = files_format_size(parseInt(line.substr(pos + 1)));
                    } else {
                        file_name = line;
                        fsize = "";
                    }
                } else file_name = line;
            }
            //console.log("pushing " + file_name );
            var isprint = files_showprintbutton(file_name, isdirectory);
            //var tag = "*" + file_name + "*";
            var file_entry = {
                name: file_name,
                size: fsize,
                isdir: isdirectory,
                datetime: d,
                isprintable: isprint
            };
            files_file_list_cache.push(file_entry);
        }
    }
    files_serial_M20_list_display();
}

function files_is_filename(file_name) {
    var answer = true;
    var s_name = String(file_name);
    var rg1 = /^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
    var rg2 = /^\./; // cannot start with dot (.)
    var rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
    //a 
    answer = rg1.test(file_name) && !rg2.test(file_name) && !rg3.test(file_name)
    if ((s_name.length == 0) || (s_name.indexOf(":") != -1) || (s_name.indexOf("..") != -1)) answer = false;

    return answer;
}

function files_serial_ls_list_success(response_text) {
    var tlist = response_text.split("\n");
    for (var i = 0; i < tlist.length; i++) {
        var line = tlist[i].trim();
        var isdirectory = false;
        var file_name = "";
        var fsize = "";
        var d = ""
        var command = "ls -s " +  cleanpath(files_currentPath);
        if (line == command) continue;
        if (line.length != 0) {
            if (line.endsWith("/")) {
                isdirectory = true;
                file_name = line.substring(0, line.length - 1);
            } else {
                var pos = line.lastIndexOf(" ");
                file_name = line.substr(0, pos);
                fsize = files_format_size(parseInt(line.substr(pos + 1)));
            }
            var isprint = files_showprintbutton(file_name, isdirectory);
            if (files_is_filename(file_name)) {
                var file_entry = {
                    name: file_name,
                    size: fsize,
                    isdir: isdirectory,
                    datetime: d,
                    isprintable: isprint
                };
                files_file_list.push(file_entry);
            }
        }
    }
    files_build_display_filelist();
}

function files_directSD_list_success(response_text) {
    var error = false;
    var response;
    document.getElementById('files_navigation_buttons').style.display = "block";
    try {
        response = JSON.parse(response_text);
    } catch (e) {
        console.error("Parsing error:", e);
        error = true;
    }
    if (error || typeof response.status == 'undefined') {
        files_directSD_list_failed(406, translate_text_item("Wrong data", true));
        return;
    }
    files_file_list = [];
    files_status_list = [];
    if (typeof response.files != 'undefined') {
        for (var i = 0; i < response.files.length; i++) {
            var file_name = "";
            var isdirectory = false;
            var fsize = "";
            if (response.files[i].size == "-1") isdirectory = true;
            else fsize = response.files[i].size;
            if (target_firmware == "marlin") {
                file_name = response.files[i].shortname;
            } else {
                file_name = response.files[i].name;
            }
            var isprint = files_showprintbutton(file_name, isdirectory);
            var file_entry = {
                name: file_name,
                sdname: response.files[i].name,
                size: fsize,
                isdir: isdirectory,
                datetime: response.files[i].datetime,
                isprintable: isprint
            };
            files_file_list.push(file_entry);
        }
    }
    var vtotal = "-1";
    var vused = "-1";
    var voccupation = "-1";
    if (typeof response.total != 'undefined') vtotal = response.total;
    if (typeof response.used != 'undefined') vused = response.used;
    if (typeof response.occupation != 'undefined') voccupation = response.occupation;
    files_status_list.push({
        status: translate_text_item(response.status),
        path: response.path,
        used: vused,
        total: vtotal,
        occupation: voccupation
    });
    files_build_display_filelist();
}

function files_serial_M20_list_failed(error_code, response) {
    document.getElementById('files_navigation_buttons').style.display = "block";
    if (esp_error_code !=0){
         alertdlg (translate_text_item("Error") + " (" + esp_error_code + ")", esp_error_message);
         esp_error_code = 0;
    } else {
        alertdlg (translate_text_item("Error"), translate_text_item("No connection"));
    }
    files_build_display_filelist(false);
}

function files_serial_ls_list_failed(error_code, response) {
    files_serial_M20_list_failed(error_code, response);
}

function files_directSD_list_failed(error_code, response) {
    files_serial_M20_list_failed(error_code, response);
}

function need_up_level() {
    if (target_firmware == "smoothieware" && (files_currentPath == primary_sd || files_currentPath == secondary_sd)) return false;
    if (files_currentPath == "/") return false;
    return true;
}

function files_go_levelup() {
    var tlist = files_currentPath.split("/");
    var path = "/";
    var nb = 1;
    while (nb < (tlist.length - 2)) {
        path += tlist[nb] + "/";
        nb++;
    }
    files_refreshFiles(path, true);
}

function files_build_display_filelist(displaylist) {
    var content = "";
    document.getElementById('files_uploading_msg').style.display = "none";
    if (typeof displaylist == 'undefined') displaylist = true;
    document.getElementById('files_list_loader').style.display = "none";
    document.getElementById('files_nav_loader').style.display = "none";
    if (!displaylist) {
        document.getElementById('files_status_sd_status').style.display = "none";
        document.getElementById('files_space_sd_status').style.display = "none";
        document.getElementById('files_fileList').innerHTML = "";
        document.getElementById('files_fileList').style.display = "none";
        return;
    }
    if (need_up_level()) {
        content += "<li class='list-group-item list-group-hover' style='cursor:pointer' onclick='files_go_levelup()''>";
        content += "<span >" + get_icon_svg("level-up") + "</span>&nbsp;&nbsp;<span translate>Up...</span>";
        content += "</li>";
    }
    files_file_list.sort(function(a, b) {
        return compareStrings(a.name, b.name);
    });
    for (var index = 0; index < files_file_list.length; index++) {
        if (files_file_list[index].isdir == false) content += files_build_file_line(index);
    }
    for (index = 0; index < files_file_list.length; index++) {
        if (files_file_list[index].isdir) content += files_build_file_line(index);
    }
    document.getElementById('files_fileList').style.display = "block";
    document.getElementById('files_fileList').innerHTML = content;
    if ((files_status_list.length == 0) && (files_error_status != "")) {
        files_status_list.push({
            status: files_error_status,
            path: files_currentPath,
            used: "-1",
            total: "-1",
            occupation: "-1"
        });
    }
    if (files_status_list.length > 0) {
        if (files_status_list[0].total != "-1") {
            document.getElementById('files_sd_status_total').innerHTML = files_status_list[0].total;
            document.getElementById('files_sd_status_used').innerHTML = files_status_list[0].used;
            document.getElementById('files_sd_status_occupation').value = files_status_list[0].occupation;
            document.getElementById('files_sd_status_percent').innerHTML = files_status_list[0].occupation;
            document.getElementById('files_space_sd_status').style.display = "table-row";
        } else {
            document.getElementById('files_space_sd_status').style.display = "none";
        }
        if ((files_error_status != "") && ((files_status_list[0].status.toLowerCase() == "ok") || (files_status_list[0].status.length == 0))) {
            files_status_list[0].status = files_error_status;
        }
        files_error_status = "";
        if (files_status_list[0].status.toLowerCase() != "ok") {
            document.getElementById('files_sd_status_msg').innerHTML = translate_text_item(files_status_list[0].status, true);
            document.getElementById('files_status_sd_status').style.display = "table-row";
        } else {
            document.getElementById('files_status_sd_status').style.display = "none";
        }
    } else document.getElementById('files_space_sd_status').style.display = "none";
}

function files_progress() {
    var command = "progress";
    if (target_firmware != "smoothieware") command = "M27";
    SendPrinterCommand(command);
}

function files_abort() {
    var command = "abort";
    if (target_firmware != "smoothieware") {
        if ((target_firmware == "marlin") || (target_firmware == "marlinkimbra")) {
            command = "M108\nM108\nM108\nM524\nM27";
        } if (target_firmware == "marlin-embedded") {
            command = "M108\nM108\nM108\nM524\nM27";
        } else command = "M112";
    }
    SendPrinterCommand(command);
}

function files_select_upload() {
    document.getElementById('files_input_file').click();
}

function files_check_if_upload() {
    var canupload = true;
    var files = document.getElementById("files_input_file").files;
    if (target_firmware == "marlin" && !direct_sd) {
        for (var i = 0; i < files.length; i++) {
            var filename = files[i].name;
            //check base name can only by 8
            var sizename = filename.indexOf(".");
            if (sizename == -1) sizename = filename.length;
            if (sizename > 8) canupload = false;
            //check extension cano be more than 4 ".xxx"
            if ((filename.length - sizename) > 4) canupload = false;
            //check only one dot
            if (filename.indexOf(".") != filename.lastIndexOf(".")) canupload = false;
        }
        if (canupload == false) {
            alertdlg(translate_text_item("Error"), translate_text_item("Please use 8.3 filename only."));
            return;
        }
    }
    if (direct_sd && !(target_firmware == "smoothieware" && files_currentPath.startsWith(secondary_sd))) {
        SendPrinterCommand("[ESP200]", false, process_check_sd_presence);
    } else {
        //try ls
        if (target_firmware == "smoothieware") {
            var cmd = "ls " + cleanpath(files_currentPath);
            SendPrinterCommand(cmd, false, process_check_sd_presence);
        } else { //no reliable way to know SD is present or not so let's upload
            files_start_upload();
        }
    }
}

function process_check_sd_presence(answer) {
    //console.log(answer);
    //for direct SD there is a SD check
    if (direct_sd && !(target_firmware == "smoothieware" && files_currentPath.startsWith(secondary_sd))) {
        if (answer.indexOf("o SD card") > -1) {
            alertdlg(translate_text_item("Upload failed"), translate_text_item("No SD card detected"));
            files_error_status = "No SD card"
            files_build_display_filelist(false);
            document.getElementById('files_sd_status_msg').innerHTML = translate_text_item(files_error_status, true);
            document.getElementById('files_status_sd_status').style.display = "table-row";
        } else files_start_upload();
    } else { //for smoothiware ls say no directory
        if (target_firmware == "smoothieware") {
            if (answer.indexOf("ould not open directory") > -1) {
                alertdlg(translate_text_item("Upload failed"), translate_text_item("No SD card detected"));
                files_error_status = "No SD card"
                files_build_display_filelist(false);
                document.getElementById('files_sd_status_msg').innerHTML = translate_text_item(files_error_status, true);
                document.getElementById('files_status_sd_status').style.display = "table-row";
            } else files_start_upload();
        } else files_start_upload();
    }
    //no check for marlin / repetier as no reliable test IFAIK
}

function files_start_upload() {
    if (http_communication_locked) {
        alertdlg(translate_text_item("Busy..."), translate_text_item("Communications are currently locked, please wait and retry."));
        console.log("communication locked");
        return;
    }
    var url = "/upload";
    var path = files_currentPath;
    if (direct_sd && (target_firmware == "smoothieware") && (files_currentPath.startsWith(primary_sd))) {
        path = files_currentPath.substring(primary_sd.length);
    }
    if (!direct_sd || (target_firmware == "smoothieware" && files_currentPath.startsWith(secondary_sd))) {
        url = "/upload_serial";
        if (target_firmware == "smoothieware") {
            if (files_currentPath.startsWith(secondary_sd)) path = files_currentPath.substring(secondary_sd.length);
            else path = files_currentPath.substring(primary_sd.length);
        }
    }
    //console.log("upload from " + path );
    var files = document.getElementById("files_input_file").files;

    if (files.value == "" || typeof files[0].name === 'undefined') {
        console.log("nothing to upload");
        return;
    }
    var formData = new FormData();

    formData.append('path', path);
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var arg = path + file.name + "S";
        //append file size first to check updload is complete
        formData.append(arg, file.size);
        formData.append('myfile[]', file, path + file.name);
        //console.log( path +file.name);
    }
    files_error_status = "Upload " + file.name;
    document.getElementById('files_currentUpload_msg').innerHTML = file.name;
    document.getElementById('files_uploading_msg').style.display = "block";
    document.getElementById('files_navigation_buttons').style.display = "none";
    if (direct_sd && !(target_firmware == "smoothieware" && files_currentPath.startsWith(secondary_sd))) {
        SendFileHttp(url, formData, FilesUploadProgressDisplay, files_directSD_list_success, files_directSD_list_failed);
        //console.log("send file");
    } else {
        SendFileHttp(url, formData, FilesUploadProgressDisplay, files_proccess_and_update, files_serial_M20_list_failed);
    }
    document.getElementById("files_input_file").value = "";
}


function FilesUploadProgressDisplay(oEvent) {
    if (oEvent.lengthComputable) {
        var percentComplete = (oEvent.loaded / oEvent.total) * 100;
        document.getElementById('files_prg').value = percentComplete;
        document.getElementById('files_percent_upload').innerHTML = percentComplete.toFixed(0);
    } else {
        // Impossible because size is unknown
    }
}
