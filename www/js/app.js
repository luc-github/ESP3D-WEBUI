var ESP3D_authentication = false;

window.onload = function() {
    //to check if javascript is disabled like in anroid preview
    document.getElementById('warningmsg').style.display = 'none';
    connectdlg();
};

window.addEventListener("resize", OnresizeWindow);

function OnresizeWindow(){
}

function build_language_menu(){
var content ="";
for (var lang_i =0 ; lang_i < language_list.length; lang_i++){
    content+="<a href='#' onclick=\"translate_text('";
    content+= language_list[lang_i][0];
    content+= "'); update_ui_text();\"><span >";
    content+= language_list[lang_i][1];
    content+= "</span><span class=\"clearfix\"></span></a>";
    if ( language_list[lang_i][0] == language){
        document.getElementById("translate_menu").innerHTML=language_list[lang_i][1];
        }
}
document.getElementById("lang_menu").innerHTML=content;
}

function update_ui_text(){   
    build_HTML_setting_list(current_setting_filter);
}

function update_UI_firmware_target() {
    var fwName;
    if (target_firmware == "repetier" ) {
        fwName = "Repetier";
        document.getElementById('configtablink').style.display = 'block';
        }
    else if (target_firmware == "repetier4davinci" ) {
        fwName = "Repetier for Davinci";
        document.getElementById('configtablink').style.display = 'block';
        }
    else if (target_firmware == "smoothieware" ) {
        fwName = "Smoothieware";
        document.getElementById('configtablink').style.display = 'block';
        }
    else if (target_firmware == "marlin" ) {
        fwName = "Marlin";
        document.getElementById('configtablink').style.display = 'none';
        }
    else if (target_firmware == "marlinkimbra" ) {
        fwName = "Marlin Kimbra";
        document.getElementById('configtablink').style.display = 'none';
        }
    else {
            fwName = "Unknown";
            document.getElementById('configtablink').style.display = 'none';
            }
    if (typeof document.getElementById('fwName') != "undefined")document.getElementById('fwName').innerHTML=fwName;
    //SD image or not
    if (direct_sd && typeof document.getElementById('showSDused')!= "undefined")document.getElementById('showSDused').innerHTML="<svg width='1.3em' height='1.2em' viewBox='0 0 1300 1200'><g transform='translate(50,1200) scale(1, -1)'><path  fill='#777777' d='M200 1100h700q124 0 212 -88t88 -212v-500q0 -124 -88 -212t-212 -88h-700q-124 0 -212 88t-88 212v500q0 124 88 212t212 88zM100 900v-700h900v700h-900zM500 700h-200v-100h200v-300h-300v100h200v100h-200v300h300v-100zM900 700v-300l-100 -100h-200v500h200z M700 700v-300h100v300h-100z' /></g></svg>";
    else document.getElementById('showSDused').innerHTML="";
    return fwName;
}

function initUI() {
    document.getElementById("main_page_loader").style.display = 'block';
    //initial check
    if ((typeof target_firmware == "undefined") || (typeof web_ui_version == "undefined") || (typeof direct_sd == "undefined") ) alert('Missing init data!');
    //check FW
    update_UI_firmware_target();
    //update UI version
    if (typeof document.getElementById('UI_VERSION') != "undefined")document.getElementById('UI_VERSION').innerHTML=web_ui_version;
    //update FW version
    if (typeof document.getElementById('FW_VERSION') != "undefined")document.getElementById('FW_VERSION').innerHTML=fw_version;
    // Get the element with id="defaultOpen" and click on it
    document.getElementById("maintablink").click();
    //var value = get_localdata('language');
    //translate_text(value);
    //removeIf(production)
    console.log(JSON.stringify(translated_list));
    //endRemoveIf(production)
    //get all settings from ESP3D
    refreshSettings();
    //init panels    
    init_temperature_panel();
    init_extruder_panel();
    init_command_panel();
    init_controls_panel();
    init_files_panel(false);
    //check if we need setup
    if ( target_firmware == "???"){
        setupdlg();
    } else {
            setup_is_done = true;
            build_HTML_setting_list(current_setting_filter);
            document.getElementById('main_ui').style.display='block';
        }
    document.getElementById("main_page_loader").style.display = 'none';
}

function compareStrings(a, b) {
  // case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return (a < b) ? -1 : (a > b) ? 1 : 0;
}

function compareInts(a, b) {
  return (a < b) ? -1 : (a > b) ? 1 : 0;
}

function HTMLEncode(str){
  var i = str.length,
      aRet = [];

  while (i--) {
    var iC = str[i].charCodeAt();
    if (iC < 65 || iC > 127 || (iC>90 && iC<97)) {
        if(iC==65533) iC=176;
        aRet[i] = '&#'+iC+';';
    } else {
      aRet[i] = str[i];
    }
   }
  return aRet.join('');    
}
