var ESP3D_authentication = false;
var page_id = "";
var convertDHT2Fahrenheit = false;
var ws_source;
var event_source;
var log_off = false;
var async_webcommunication = false;
var websocket_port =0;
var esp_hostname = "ESP3D WebUI";

function Init_events(e){
  page_id = e.data;
  console.log("connection id = " + page_id); 
}

function ActiveID_events(e){
    if(page_id != e.data) {
        Disable_interface();
        console.log("I am disabled");
        event_source.close();
    }
}

function DHT_events(e){
  Handle_DHT(e.data);
}

window.onload = function() {
    //to check if javascript is disabled like in anroid preview
    document.getElementById('loadingmsg').style.display = 'none';
    console.log("Connect to board");
    connectdlg();
};

function startSocket(){
	  if(async_webcommunication){
		ws_source = new WebSocket('ws://'+document.location.host+'/ws',['arduino']);
		}
	  else {
		  console.log("Socket port is :" + websocket_port);
		  ws_source = new WebSocket('ws://'+document.location.host+':' + websocket_port,['arduino']);
	  }
      ws_source.binaryType = "arraybuffer";
      ws_source.onopen = function(e){
        console.log("Connected");
      };
      ws_source.onclose = function(e){
        console.log("Disconnected");
        //seems sometimes it disconnect so wait 3s and reconnect
        //if it is not a log off
        if(!log_off) setTimeout(startSocket, 3000);
      };
      ws_source.onerror = function(e){
        console.log("ws error", e);
      };
      ws_source.onmessage = function(e){
        var msg = "";
        //bin
        if(e.data instanceof ArrayBuffer){
          var bytes = new Uint8Array(e.data);
          for (var i = 0; i < bytes.length; i++) {
            msg += String.fromCharCode(bytes[i]);
          }
          Monitor_output_Update(msg);
        } else {
          msg += e.data;
          var tval = msg.split(":");
          if (tval.length == 2) {
		  if (tval[0] == 'CURRENT_ID') {
			  page_id = tval[1];
			  console.log("connection id = " + page_id); 
		  }
		  if (tval[0] == 'ACTIVE_ID') {
			  if(page_id != tval[1]) {
				Disable_interface();
				}
			}
		  if (tval[0] == 'DHT') {
			  Handle_DHT(tval[1]);
			}
		  }
          
        }
        //console.log(msg);
        
      };
    }

function disable_items(item, state) {
    var liste = item.getElementsByTagName("*");
     for(i = 0; i < liste.length; i++) liste[i].disabled=state;
}

function ontoggleLock(forcevalue){
    if (typeof forcevalue != 'undefined') document.getElementById('lock_UI').checked = forcevalue;
    if (document.getElementById('lock_UI').checked ) {
         document.getElementById('lock_UI_btn_txt').innerHTML = translate_text_item("Unlock interface");
         disable_items(document.getElementById('maintab'), true);
         disable_items(document.getElementById('configtab'), true);
         document.getElementById('progress_btn').disabled=false;
         document.getElementById('clear_monitor_btn').disabled=false;
         document.getElementById('monitor_enable_filter_temperatures').disabled=false;
         document.getElementById('monitor_enable_autoscroll').disabled=false;
         document.getElementById('settings_update_fw_btn').disabled=true;
         document.getElementById('settings_restart_btn').disabled=true;
         disable_items(document.getElementById('JogUI'), false);
         document.getElementById('JogUI').style.pointerEvents='none';
     }
    else {
        document.getElementById('lock_UI_btn_txt').innerHTML = translate_text_item("Lock interface");
        disable_items(document.getElementById('maintab'), false);
        disable_items(document.getElementById('configtab'), false);
        document.getElementById('settings_update_fw_btn').disabled=false;
        document.getElementById('settings_restart_btn').disabled=false;
        document.getElementById('JogUI').style.pointerEvents='auto';
    }
}

    
function Handle_DHT(data){
    var tdata = data.split(" ");
    if (tdata.length != 2) {
    console.log("DHT data invalid: " + data );
    return;
    }
    var temp = (convertDHT2Fahrenheit)? (parseFloat(tdata[0]) * 1.8) + 32 : parseFloat(tdata[0]);
    document.getElementById('DHT_humidity').innerHTML=parseFloat(tdata[1]).toFixed(2).toString()+"%";
    var temps = temp.toFixed(2).toString() + "&deg;" ;
    if(convertDHT2Fahrenheit) temps+="F";
    else temps+="C";
    document.getElementById('DHT_temperature').innerHTML=temps;
}
//window.addEventListener("resize", OnresizeWindow);

//function OnresizeWindow(){
//}
var total_boot_steps = 5;
var current_boot_steps = 0;

function display_boot_progress(step){
	var val = 1;
	if (typeof step != 'undefined')val = step;
	current_boot_steps+=val;
	//console.log(current_boot_steps);
	//console.log(Math.round((current_boot_steps*100)/total_boot_steps));
	document.getElementById('load_prg').value=Math.round((current_boot_steps*100)/total_boot_steps);
}


function Disable_interface() {
    //block all communication
    http_communication_locked = true;
    log_off  = true;
    //clear all waiting commands
    clear_cmd_list();
    //no camera 
    document.getElementById('camera_frame').src = "";
    //No auto check
    on_autocheck_position(false);
    on_autocheck_temperature(false); 
    if(async_webcommunication) {
		event_source.removeEventListener('ActiveID', ActiveID_events, false);
		event_source.removeEventListener('InitID', Init_events, false);
		event_source.removeEventListener('DHT', DHT_events, false);
		}
    ws_source.close();
    UIdisableddlg();
}

function update_UI_firmware_target() {
    var fwName;
    document.getElementById('config_smoothie_nav').style.display = 'none';
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
        document.getElementById('config_smoothie_nav').style.display = 'block';
        }
    else if (target_firmware == "marlin" ) {
        fwName = "Marlin";
        document.getElementById('configtablink').style.display = 'block';
        }
    else if (target_firmware == "marlinkimbra" ) {
        fwName = "Marlin Kimbra";
        document.getElementById('configtablink').style.display = 'block';
        }
    else if (target_firmware == "grbl" ) {
        fwName = "Grbl";
        document.getElementById('configtablink').style.display = 'block';
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

function Set_page_title(page_title){
	if (typeof page_title !='undefined') esp_hostname = page_title;
	document.title= esp_hostname;
	}

function initUI() {
	console.log("Init UI");
	if (ESP3D_authentication)connectdlg (false);
    AddCmd(display_boot_progress);
    //initial check
    if ((typeof target_firmware == "undefined") || (typeof web_ui_version == "undefined") || (typeof direct_sd == "undefined") ) alert('Missing init data!');
    //check FW
    update_UI_firmware_target();
    //set title using hostname
    Set_page_title();
    //update UI version
    if (typeof document.getElementById('UI_VERSION') != "undefined")document.getElementById('UI_VERSION').innerHTML=web_ui_version;
    //update FW version
    if (typeof document.getElementById('FW_VERSION') != "undefined")document.getElementById('FW_VERSION').innerHTML=fw_version;
    // Get the element with id="defaultOpen" and click on it
    document.getElementById("maintablink").click();
    //removeIf(production)
    console.log(JSON.stringify(translated_list));
    //endRemoveIf(production)
    initUI_2();
}

function initUI_2() {
	AddCmd(display_boot_progress);
    //get all settings from ESP3D
    console.log("Get settings");
    refreshSettings();
    initUI_3();
}
function initUI_3() {
	AddCmd(display_boot_progress);
    //init panels 
    console.log("Get macros");
    init_controls_panel(); 
    console.log("Get preferences");
    getpreferenceslist();
	initUI_4();
}
function initUI_4() {
	AddCmd(display_boot_progress);  
    init_temperature_panel();
    init_extruder_panel();
    init_command_panel();
    init_files_panel(false);
    //check if we need setup
    if ( target_firmware == "???"){
		console.log("Launch Setup");
		AddCmd(display_boot_progress);
		closeModal("Connection successful");
        setupdlg();
    } else {
            setup_is_done = true;
            AddCmd(display_boot_progress);
            build_HTML_setting_list(current_setting_filter);
            AddCmd(closeModal);
            AddCmd(show_main_UI);
        }
}

function show_main_UI(){
	document.getElementById('main_ui').style.display='block';
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

function decode_entitie(str_text) {
var tmpelement = document.createElement('div');
tmpelement.innerHTML = str_text;
str_text = tmpelement.textContent;
tmpelement.textContent = '';
return str_text;
}
