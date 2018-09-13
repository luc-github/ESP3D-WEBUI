var interval_status=-1;

function init_grbl_panel(){

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
    SendPrinterCommand(command, false, process_status,null, 114, 1);
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
        //TODO
        console.log(tab2);
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
        
        console.log("SD print " + sdname + " " + progress + "%");
    } else { //no SD printing
        //TODO
    }
    
}

function process_status(response){
     process_grbl_position(response);
     process_grbl_status(response);
     process_grbl_SD(response);
}
