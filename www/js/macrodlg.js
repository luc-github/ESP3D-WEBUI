//Macro dialog
var macrodlg_macrolist = [];

function showmacrodlg(closefn) {
    var modal = setactiveModal('macrodlg.html', closefn);
    if (modal == null) return;
    build_dlg_macrolist_ui();
    document.getElementById('macrodlg_upload_msg').style.display = 'none';
    showModal();
}

function build_color_selection(index) {
    var content = "";
    var entry = macrodlg_macrolist[index];
    var menu_pos = "down";
    if (index > 3) menu_pos = "up";
    content += "<div class='dropdownselect'  id='macro_color_line" + index + "'>";
    content += "<button class='btn " + entry.class + "' onclick='showhide_drop_menu(event)'>&nbsp;";
    content += "<svg width='0.8em' height='0.8em' viewBox='0 0 1300 1200' style='pointer-events:none'>";
    content += "<g transform='translate(50,1200) scale(1, -1)'>";
    content += "<path  fill='currentColor' d='M100 900h1000q41 0 49.5 -21t-20.5 -50l-494 -494q-14 -14 -35 -14t-35 14l-494 494q-29 29 -20.5 50t49.5 21z'></path>";
    content += "</g>";
    content += "</svg>";
    content += "</button>";
    content += "<div class='dropmenu-content dropmenu-content-" + menu_pos + "' style='min-width:auto; padding-left: 4px;padding-right: 4px;'>";
    content += "<button class='btn btn-default' onclick='macro_select_color(event, \"default\" ," + index + ")'>&nbsp;</button>";
    content += "<button class='btn btn-primary' onclick='macro_select_color(event, \"primary\" ," + index + ")'>&nbsp;</button>";
    content += "<button class='btn btn-info' onclick='macro_select_color(event, \"info\" ," + index + ")'>&nbsp;</button>";
    content += "<button class='btn btn-warning' onclick='macro_select_color(event, \"warning\" ," + index + ")'>&nbsp;</button>";
    content += "<button class='btn btn-danger'  onclick='macro_select_color(event, \"danger\" ," + index + ")'>&nbsp;</button>";
    content += "</div>";
    content += "</div>";
    return content;
}

function build_target_selection(index) {
    var content = "";
    var entry = macrodlg_macrolist[index];
    var menu_pos = "down";
    if (index > 3) menu_pos = "up";
    content += "<div class='dropdownselect'  id='macro_target_line" + index + "'>";
    content += "<button class='btn btn-default' style='min-width:5em;' onclick='showhide_drop_menu(event)'><span>" + entry.target + "</span>";
    content += "<svg width='0.8em' height='0.8em' viewBox='0 0 1300 1200' style='pointer-events:none'>";
    content += "<g transform='translate(50,1200) scale(1, -1)'>";
    content += "<path  fill='currentColor' d='M100 900h1000q41 0 49.5 -21t-20.5 -50l-494 -494q-14 -14 -35 -14t-35 14l-494 494q-29 29 -20.5 50t49.5 21z'></path>";
    content += "</g>";
    content += "</svg>";
    content += "</button>";
    content += "<div class='dropmenu-content dropmenu-content-" + menu_pos + "' style='min-width:auto'>";
    content += "<a href=# onclick='macro_select_target(event, \"ESP\" ," + index + ")'>ESP</a>";
    content += "<a href=# onclick='macro_select_target(event, \"SD\" ," + index + ")'>SD</a>";
    content += "<a href=# onclick='macro_select_target(event, \"URI\" ," + index + ")'>URI</a>"
    content += "</div>";
    content += "</div>";
    return content;
}

function build_glyph_selection(index) {
    var content = "";
    var entry = macrodlg_macrolist[index];
    var menu_pos = "down";
    if (index > 3) menu_pos = "up";
    content += "<div class='dropdownselect'  id='macro_glyph_line" + index + "'>";
    content += "<button class='btn " + entry.class + "' onclick='showhide_drop_menu(event)'><span>" + get_icon_svg(entry.glyph) + "</span>&nbsp;";
    content += "<svg width='0.8em' height='0.8em' viewBox='0 0 1300 1200' style='pointer-events:none'>";
    content += "<g transform='translate(50,1200) scale(1, -1)'>";
    content += "<path  fill='currentColor' d='M100 900h1000q41 0 49.5 -21t-20.5 -50l-494 -494q-14 -14 -35 -14t-35 14l-494 494q-29 29 -20.5 50t49.5 21z'></path>";
    content += "</g>";
    content += "</svg>";
    content += "</button>";
    content += "<div class='dropmenu-content  dropmenu-content-" + menu_pos + "' style='min-width:30em'>";
    for (var key in list_icon) {
        if (key != "plus") {
            content += "<button class='btn btn-default btn-xs' onclick='macro_select_glyph(event, \"" + key + "\" ," + index + ")'><span>" + get_icon_svg(key) + "</span>";
            content += "</button>";
        }
    }
    content += "</div>";
    content += "</div>";
    return content;
}

function build_filename_selection(index) {
    var content = "";
    var entry = macrodlg_macrolist[index];
    content += "<span id='macro_filename_input_line_" + index + "' class='form-group "
    if (entry.filename.length == 0) content += "has-error has-feedback"
    content += "'>";
    content += "<input type='text' id='macro_filename_line_" + index + "' style='width:9em' class='form-control' onkeyup='macro_filename_OnKeyUp(this," + index + ")'  onchange='on_macro_filename(this," + index + ")' value='" + entry.filename + "'  aria-describedby='inputStatus_line" + index + "'>";
    content += "<span id='icon_macro_status_line_" + index + "' style='color:#a94442; position:absolute;bottom:4px;left:7.5em;";
    if (entry.filename.length > 0) content += "display:none";
    content += "'>" + get_icon_svg("remove") + "</span>";
    content += "</input></span>";
    return content;
}

function build_dlg_macrolist_line(index) {
    var content = "";
    var entry = macrodlg_macrolist[index];
    content += "<td style='vertical-align:middle'>";
    content += "<button onclick='macro_reset_button(" + index + ")'  class='btn btn-xs ";
    if (entry.class == '') {
        content += "btn-default'  style='padding-top: 3px;padding-left: 4px;padding-right: 2px;padding-bottom: 0px;' >" + get_icon_svg("plus") + " </button></td><td colspan='5'>";
    } else {
        content += "btn-danger' style='padding-top: 3px;padding-left: 2px;padding-right: 3px;padding-bottom: 0px;' >" + get_icon_svg("trash") + "</button></td>";
        content += "<td style='vertical-align:middle'><input type='text' id='macro_name_line_" + index + "' style='width:4em' class='form-control' onchange='on_macro_name(this," + index + ")' value='";
        if (entry.name != "&nbsp;") {
            content += entry.name;
        }
        content += "'/></td>";
        content += "<td style='vertical-align:middle'>" + build_glyph_selection(index) + "</td>";
        content += "<td style='vertical-align:middle'>" + build_color_selection(index) + "</td>";
        content += "<td style='vertical-align:middle'>" + build_target_selection(index) + "</td>";
        content += "<td style='vertical-align:middle'>" + build_filename_selection(index) + "</td>";
    }
    content += "</td>";
    document.getElementById('macro_line_' + index).innerHTML = content;
}

function macro_filename_OnKeyUp(event, index) {
    var item = document.getElementById("macro_filename_line_" + index);
    var group = document.getElementById("macro_filename_input_line_" + index);
    var value = item.value.trim();
    if (value.length > 0) {
        if (group.classList.contains('has-feedback')) group.classList.remove('has-feedback');
        if (group.classList.contains('has-error')) group.classList.remove('has-error');
        document.getElementById("icon_macro_status_line_" + index).style.display = 'none';
    } else {
        document.getElementById("icon_macro_status_line_" + index).style.display = 'block';
        if (!group.classList.contains('has-error')) group.classList.add('has-error');
        if (!group.classList.contains('has-feedback')) group.classList.add('has-feedback');
    }
    return true;
}

function on_macro_filename(item, index) {
    var entry = macrodlg_macrolist[index];
    var filename = item.value.trim();
    entry.filename = item.value;
    if (filename.length == 0) {
        alertdlg(translate_text_item("Out of range"), translate_text_item("File name cannot be empty!"));
    }
    build_dlg_macrolist_line(index);
}

function on_macro_name(item, index) {
    var entry = macrodlg_macrolist[index];
    var macroname = item.value.trim();
    if (macroname.length > 0) {
        entry.name = item.value;
    } else {
        entry.name = "&nbsp;";
    }
}

function build_dlg_macrolist_ui() {
    var content = "";
    macrodlg_macrolist = [];
    for (var i = 0; i < 9; i++) {
        var entry = {
            name: control_macrolist[i].name,
            glyph: control_macrolist[i].glyph,
            filename: control_macrolist[i].filename,
            target: control_macrolist[i].target,
            class: control_macrolist[i].class,
            index: control_macrolist[i].index
        };
        macrodlg_macrolist.push(entry);
        content += "<tr style='vertical-align:middle' id='macro_line_" + i + "'>";
        content += "</tr>";
    }

    document.getElementById('dlg_macro_list').innerHTML = content;
    for (var i = 0; i < 9; i++) build_dlg_macrolist_line(i);
}

function macro_reset_button(index) {
    var entry = macrodlg_macrolist[index];
    if (entry.class == "") {
        entry.name = "M" + (1 + entry.index);
        entry.glyph = "star";
        entry.filename = "/macro" + (1 + entry.index) + ".g";
        entry.target = "ESP";
        entry.class = "btn-default";
    } else {
        entry.name = "";
        entry.glyph = "";
        entry.filename = "";
        entry.target = "";
        entry.class = "";
    }
    build_dlg_macrolist_line(index);
}

function macro_select_color(event, color, index) {
    var entry = macrodlg_macrolist[index];
    hide_drop_menu(event);
    entry.class = "btn btn-" + color;
    build_dlg_macrolist_line(index);
}

function macro_select_target(event, target, index) {
    var entry = macrodlg_macrolist[index];
    hide_drop_menu(event);
    entry.target = target;
    build_dlg_macrolist_line(index)
}

function macro_select_glyph(event, glyph, index) {
    var entry = macrodlg_macrolist[index];
    hide_drop_menu(event);
    entry.glyph = glyph;
    build_dlg_macrolist_line(index)
}

function closeMacroDialog() {
    var modified = false;
    for (var i = 0; i < 9; i++) {
        if ((macrodlg_macrolist[i].filename !== control_macrolist[i].filename) || (macrodlg_macrolist[i].name !== control_macrolist[i].name) || (macrodlg_macrolist[i].glyph !== control_macrolist[i].glyph) || (macrodlg_macrolist[i].class !== control_macrolist[i].class) || (macrodlg_macrolist[i].target !== control_macrolist[i].target)) {
            modified = true;
        }
    }
    if (modified) {
        confirmdlg(translate_text_item("Data modified"), translate_text_item("Do you want to save?"), process_macroCloseDialog)
    } else closeModal('cancel');
}

function process_macroCloseDialog(answer) {
    if (answer == 'no') {
        //console.log("Answer is no so exit");
        closeModal('cancel');
    } else {
        // console.log("Answer is yes so let's save");
        SaveNewMacroList();
    }
}

function SaveNewMacroList() {
    if (http_communication_locked) {
        alertdlg(translate_text_item("Busy..."), translate_text_item("Communications are currently locked, please wait and retry."));
        return;
    }
    for (var i = 0; i < 9; i++) {
        if (macrodlg_macrolist[i].filename.length == 0 && macrodlg_macrolist[i].class != "") {
            alertdlg(translate_text_item("Out of range"), translate_text_item("File name cannot be empty!"));
            return;
        }
    }

    var blob = new Blob([JSON.stringify(macrodlg_macrolist, null, " ")], {
        type: 'application/json'
    });
    var file;
    if (browser_is("IE") || browser_is("Edge")) {
        file = blob;
        file.name = '/macrocfg.json';
        file.lastModifiedDate = new Date();
    } else file = new File([blob], '/macrocfg.json');
    var formData = new FormData();
    var url = "/files";
    formData.append('path', '/');
    formData.append('myfile[]', file, '/macrocfg.json');
    SendFileHttp(url, formData, macrodlgUploadProgressDisplay, macroUploadsuccess, macroUploadfailed)
}

function macrodlgUploadProgressDisplay(oEvent) {
    if (oEvent.lengthComputable) {
        var percentComplete = (oEvent.loaded / oEvent.total) * 100;
        document.getElementById('macrodlg_prg').value = percentComplete;
        document.getElementById('macrodlg_upload_percent').innerHTML = percentComplete.toFixed(0);
        document.getElementById('macrodlg_upload_msg').style.display = 'block';
    } else {
        // Impossible because size is unknown
    }
}

function macroUploadsuccess(response) {
    control_macrolist = [];
    for (var i = 0; i < 9; i++) {
        var entry;
        if ((macrodlg_macrolist.length != 0)) {
            entry = {
                name: macrodlg_macrolist[i].name,
                glyph: macrodlg_macrolist[i].glyph,
                filename: macrodlg_macrolist[i].filename,
                target: macrodlg_macrolist[i].target,
                class: macrodlg_macrolist[i].class,
                index: macrodlg_macrolist[i].index
            };
        } else {
            entry = {
                name: '',
                glyph: '',
                filename: '',
                target: '',
                class: '',
                index: i
            };
        }
        control_macrolist.push(entry);
    }
    document.getElementById('macrodlg_upload_msg').style.display = 'none';
    closeModal('ok');
}

function macroUploadfailed(errorcode, response) {
    alertdlg(translate_text_item("Error"), translate_text_item("Save macro list failed!"));
    document.getElementById('macrodlg_upload_msg').style.display = 'none';
}
