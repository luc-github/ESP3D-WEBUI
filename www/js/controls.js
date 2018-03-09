var interval_position=-1;
var control_macrolist = [];

function init_controls_panel(){
    var value = get_localdata('autocheck_position');
    if (value == 'true'){
        document.getElementById('autocheck_position').checked =true;
        on_autocheck_position();
    }
    loadmacrolist();
}

function loadmacrolist() {
    control_macrolist = [];
    var url = "/macrocfg.json";
    //removeIf(production)
    var response= "[{\"name\":\"\",\"glyph\":\"\",\"filename\":\"\",\"target\":\"\",\"class\":\"\",\"index\":0},{\"name\":\"\",\"glyph\":\"\",\"filename\":\"\",\"target\":\"\",\"class\":\"\",\"index\":1},{\"name\":\"\",\"glyph\":\"\",\"filename\":\"\",\"target\":\"\",\"class\":\"\",\"index\":2},{\"name\":\"\",\"glyph\":\"\",\"filename\":\"\",\"target\":\"\",\"class\":\"\",\"index\":3},{\"name\":\"\",\"glyph\":\"\",\"filename\":\"\",\"target\":\"\",\"class\":\"\",\"index\":4},{\"name\":\"\",\"glyph\":\"\",\"filename\":\"\",\"target\":\"\",\"class\":\"\",\"index\":5},{\"name\":\"\",\"glyph\":\"\",\"filename\":\"\",\"target\":\"\",\"class\":\"\",\"index\":6},{\"name\":\"\",\"glyph\":\"\",\"filename\":\"\",\"target\":\"\",\"class\":\"\",\"index\":7},{\"name\":\"\",\"glyph\":\"\",\"filename\":\"\",\"target\":\"\",\"class\":\"\",\"index\":8}]";
    processMacroGetSuccess(response);
    return;
    //endRemoveIf(production)
    SendGetHttp(url, processMacroGetSuccess, processMacroGetFailed);
}

function Macro_build_list(response_text){
    var response = [];
    try {
     var response = JSON.parse(response_text);
    }
    catch (e) {
        console.error("Parsing error:", e); 
    }
    for (var i = 0; i < 9 ; i++) {
        var entry; 
        if ((response.length != 0) && (typeof(response[i].name ) !== 'undefined' && typeof(response[i].glyph ) !== 'undefined'  && typeof(response[i].filename ) !== 'undefined'  && typeof(response[i].target ) !== 'undefined'  && typeof(response[i].class ) !== 'undefined'  && typeof(response[i].index ) !== 'undefined' )) {
            entry = {name : response[i].name, glyph: response[i].glyph,  filename : response[i].filename, target : response[i].target, class : response[i].class, index: response[i].index};
        }
        else {
            entry = {name :'', glyph: '', filename : '', target : '', class : '', index: i};
         }
        control_macrolist.push(entry);
    }
    control_build_macro_ui();
}

function processMacroGetSuccess(response){
     Macro_build_list(response);
}

function processMacroGetFailed(errorcode, response){
     console.log("Error " + errorcode + " : " + response);
     Macro_build_list(response);
}

function on_autocheck_position(){
    if (document.getElementById('autocheck_position').checked) {
       store_localdata('autocheck_position', true);
       var interval = parseInt(document.getElementById('posInterval_check').value);
       if (!isNaN(interval) && interval > 0 && interval < 100) {
           if (interval_position != -1 )clearInterval(interval_position);
           interval_position = setInterval(function(){ get_Position() }, interval * 1000);
            }
        else {
            document.getElementById('autocheck_position').checked = false;
            store_localdata('autocheck_position', false);
            document.getElementById('posInterval_check').value = 0;
            if (interval_position != -1 )clearInterval(interval_position);
            interval_position = -1;
        }
    }
  else {
        store_localdata('autocheck_position', false);
        if (interval_position != -1 )clearInterval(interval_position);
        interval_position = -1;
    }
}

function onPosIntervalChange(){
var interval = parseInt(document.getElementById('posInterval_check').value);
 if (!isNaN(interval) && interval > 0 && interval < 100 ) {
       on_autocheck_position();   
    }
else {
    document.getElementById('autocheck_position').checked = false;
    document.getElementById('posInterval_check').value = 0;
    if (interval != 0)alertdlg (translate_text_item("Out of range"), translate_text_item( "Value of auto-check must be between 0s and 99s !!"));
    on_autocheck_position();
    }
}

function get_Position(){
    var command = "M114";
    //removeIf(production)
    var response = "ok C: X:0.0000 Y:0.0000 Z:0.0000 E:0.0000 ";
    process_Position(response);
    return;
    //endRemoveIf(production)
    SendPrinterCommand(command, false, process_Position);
}

 function Control_get_position_value(label, result_data) {
    var result = "";
    var pos1  = result_data.indexOf(label, 0);
    if (pos1 > -1){
        pos1 += label.length;
        var pos2 = result_data.indexOf(" ", pos1);
        if (pos2 > -1){
            result = result_data.substring(pos1,pos2);
        } else  result = result_data.substring(pos1);
    }
    return result.trim();
}

function process_Position(response){
    document.getElementById('control_x_position').innerHTML = Control_get_position_value("X:", response);
    document.getElementById('control_y_position').innerHTML = Control_get_position_value("Y:", response);
    document.getElementById('control_z_position').innerHTML = Control_get_position_value("Z:", response);
}

function control_motorsOff(){
    var command = "M84";
    SendPrinterCommand(command, true);
}

function SendHomecommand (cmd){
     SendPrinterCommand(cmd, true, get_Position);
}

 function SendJogcommand(cmd, feedrate){
     var feedratevalue = "";
     var command ="";
    if (feedrate == "XYfeedrate") {
        feedratevalue = parseInt(document.getElementById('control_xy_velocity').value);
        if (feedratevalue < 1 || feedratevalue > 9999 || isNaN(feedratevalue) || (feedratevalue === null)) {
            alertdlg (translate_text_item("Out of range"), translate_text_item( "XY feedrate value must be between 1 mm/min and 9999 mm/min !"));
            document.getElementById('control_xy_velocity').value = get_localdata('xy_velocity');
            return;
        }
    } else {
        feedratevalue = parseInt(document.getElementById('control_z_velocity').value);
         if (feedratevalue < 1 || feedratevalue > 999 || isNaN(feedratevalue) || (feedratevalue === null)) {
            alertdlg (translate_text_item("Out of range"), translate_text_item( "Z feedrate value must be between 1 mm/min and 999 mm/min !"));
            document.getElementById('control_z_velocity').value = get_localdata('z_velocity');
            return;
        }
    }
    command = "G91\nG1 " + cmd + " F" + feedratevalue + "\nG90"; 
    SendPrinterCommand(command, true, get_Position);
 }
  
 function onXYvelocityChange () {
    var feedratevalue =  parseInt(document.getElementById('control_xy_velocity').value);
    if (feedratevalue < 1 || feedratevalue > 9999 || isNaN(feedratevalue) || (feedratevalue === null)) {
        }
    else store_localdata('xy_velocity', feedratevalue);
}
        
function onZvelocityChange () {
    var feedratevalue =  parseInt(document.getElementById('control_z_velocity').value);
    if (feedratevalue < 1 || feedratevalue > 999 || isNaN(feedratevalue) || (feedratevalue === null)) {
        }
    else store_localdata('z_velocity', feedratevalue);
}


function processMacroSave(answer){
    if (answer == "ok"){
        //console.log("now rebuild list");
        control_build_macro_ui();
    }
}

function control_build_macro_button(index){
    var content = "";
    var entry  = control_macrolist[index];
    content+="<button class='btn "+control_macrolist[index].class+"' type='text' ";
    if (entry.glyph.length == 0){
        content+="style='visibility:hidden'";
     }
    content+= "onclick='macro_command (\"" + entry.target + "\",\"" + entry.filename + "\")'";
    content+="><span style='position:relative; top:3px;'>";
    if (entry.glyph.length == 0){
        content+=get_icon_svg("star");
     } else content+=get_icon_svg(entry.glyph);
    content+="</span>";
    if (entry.name.length > 0){
        content+="&nbsp;";
     }
    content+=entry.name;
    content+="</button>";
            
    return content;
}

function control_build_macro_ui(){
    var content = "";
     for (var i = 0; i < 4 ; i++) {
        content+="<tr><td>" + control_build_macro_button(i) + "</td><tr>";
     }
     document.getElementById('Macro_col1').innerHTML=content;
     content = "";
     for (var i = 4; i <9 ; i++) {
         content+="<tr><td>" + control_build_macro_button(i) + "</td><tr>";
     }
    document.getElementById('Macro_col2').innerHTML=content;
}

function macro_command (target, filename) {
    var cmd = ""
    if (target == "ESP") {
        cmd = "[ESP700]"+filename;
        } else if (target == "SD") {
        cmd = "play " + filename;
        if (target_firmware != "smoothieware"){
            cmd =  "M23 " + filename + "\nM24"; 
            }
        } else return;
    //console.log(cmd);
    SendPrinterCommand(cmd);
}

