var interval_status=-1;

function init_grbl_panel(){

}

function onprobemaxtravelChange () {
    var travel =  parseFloat(document.getElementById('probemaxtravel').value);
    if (travel > 9999 || isNaN(travel) || (travel === null)) {
        //we could display error but we do not
        }
}

function onprobefeedrateChange () {
    var feedratevalue =  parseInt(document.getElementById('probefeedrate').value);
    if (feedratevalue < 1 || feedratevalue > 9999 || isNaN(feedratevalue) || (feedratevalue === null)) {
        //we could display error but we do not
        }
}

function onprobetouchplatethicknessChange () {
    var thickness =  parseFloat(document.getElementById('probetouchplatethickness').value);
    if (thickness <= 0 || thickness > 999 || isNaN(thickness) || (thickness === null)) {
        //we could display error but we do not
        }
}

function on_autocheck_status(use_value){
    if (typeof (use_value) !== 'undefined' )  document.getElementById('autocheck_status').checked =use_value;
    if (document.getElementById('autocheck_status').checked) {
       var interval = parseInt(document.getElementById('statusInterval_check').value);
       if (!isNaN(interval) && interval > 0 && interval < 100) {
           if (interval_status != -1 )clearInterval(interval_status);
           interval_status = setInterval(function(){ get_status() }, interval * 1000);
            }
        else {
            document.getElementById('autocheck_status').checked = false;
            document.getElementById('statusInterval_check').value = 0;
            if (interval_status != -1 )clearInterval(interval_status);
            interval_status = -1;
        }
    }
  else {
        if (interval_status != -1 )clearInterval(interval_status);
        interval_status = -1;
    }
}

function onstatusIntervalChange(){
var interval = parseInt(document.getElementById('statusInterval_check').value);
 if (!isNaN(interval) && interval > 0 && interval < 100 ) {
       on_autocheck_status();   
    }
else {
    document.getElementById('autocheck_status').checked = false;
    document.getElementById('statusInterval_check').value = 0;
    if (interval != 0)alertdlg (translate_text_item("Out of range"), translate_text_item( "Value of auto-check must be between 0s and 99s !!"));
    on_autocheck_status();
    }
}

//TODO handle authentication issues
//errorfn cannot be NULL
function get_status(){
    var command = "?";
    if ((target_firmware == "grbl") || (target_firmware == "grbl-embedded"))  command = "?";
    //ID 114 is same as M114 as '?' cannot be an ID
    SendPrinterCommand(command, false, null,null, 114, 1);
}

function process_grbl_position(response){
    var tab1 = response.split("WPos:");
    if (tab1.length >1) {
        var tab2 = tab1[1].split("|");
        var tab3 = tab2[0].split(",");
        document.getElementById('control_x_position').innerHTML = tab3[0];
        if (tab3.length > 1) document.getElementById('control_y_position').innerHTML = tab3[1];
        if (tab3.length > 2) document.getElementById('control_z_position').innerHTML = tab3[2];
    } 
}

function process_grbl_status(response){
    
    var tab1 = response.split("|");
    if (tab1.length >1) {
        var tab2 = tab1[0].replace("<","");
        document.getElementById("grbl_status").innerHTML = tab2; 
        if (tab2.toLowerCase().startsWith("run")){
            document.getElementById('sd_pause_btn').style.display="table-row";
            document.getElementById('sd_resume_btn').style.display="none";
            document.getElementById('sd_stop_btn').style.display="table-row";
        } else if (tab2.toLowerCase().startsWith("hold")){
            document.getElementById('sd_pause_btn').style.display="none";
            document.getElementById('sd_resume_btn').style.display="table-row";
            document.getElementById('sd_stop_btn').style.display="table-row";
        } else  if (tab2.toLowerCase().startsWith("alarm")) {
            //check we are printing or not 
            if (response.indexOf("|SD:")!=-1) {
                //guess print is stopped because of alarm so no need to pause
                document.getElementById('sd_pause_btn').style.display="none";
                document.getElementById('sd_resume_btn').style.display="table-row";
                document.getElementById('sd_stop_btn').style.display="table-row";
                }
        } else { //TBC for others status
            document.getElementById('sd_pause_btn').style.display="none";
            document.getElementById('sd_resume_btn').style.display="none";
            document.getElementById('sd_stop_btn').style.display="none";
        } 
            
        if (tab2.toLowerCase().startsWith("alarm"))document.getElementById('clear_status_btn').style.display="table-row";
        else document.getElementById('clear_status_btn').style.display="none";
    }
}

function process_grbl_SD(response){
    var tab1 = response.split("|SD:");
    if (tab1.length >1) {
        var tab2 = tab1[1].split("|");
        var tab3 = tab2[0].split(",");
        //TODO
        var progress = tab3[0];
        var sdname = "???";
        if (tab3.length >1) {
            sdname = tab3[1].replace(">","");
        } else {
        progress = progress.replace(">","");
        }
        document.getElementById('grbl_SD_status').innerHTML = sdname + "&nbsp;<progress id='print_prg' value=" + progress + " max='100'></progress>"  + progress + "%";
    } else { //no SD printing
        //TODO     
        document.getElementById('grbl_SD_status').innerHTML = "";
    }
}

function SendRealtimeCmd(cmd){
    SendPrinterCommand(cmd, false, null,null, cmd.charCodeAt(0), 1);
}

function process_status(response){
     process_grbl_position(response);
     process_grbl_status(response);
     process_grbl_SD(response);
}
