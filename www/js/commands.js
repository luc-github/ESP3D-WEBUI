var CustomCommand_history = [];
var CustomCommand_history_index = -1;
var Monitor_output = []; 

function init_command_panel(){
     var value = get_localdata('monitor_autoscroll');
    if (value == 'true'){
        document.getElementById('monitor_enable_autoscroll').checked =true;
        Monitor_check_autoscroll();
    }
    value = get_localdata('monitor_filter_temperatures');
    if (value == 'true'){
        document.getElementById('monitor_enable_filter_temperatures').checked =true;
        Monitor_check_filter_temperatures();
    }
}

function Monitor_output_autoscrollcmd(){
    document.getElementById('cmd_content').scrollTop = document.getElementById('cmd_content').scrollHeight;
    }

function Monitor_check_autoscroll(){
     if (document.getElementById('monitor_enable_autoscroll').checked == true) Monitor_output_autoscrollcmd();
      store_localdata('monitor_autoscroll', document.getElementById('monitor_enable_autoscroll').checked);
}

function Monitor_check_filter_temperatures(){
     Monitor_output_Update();
     store_localdata('monitor_filter_temperatures', document.getElementById('monitor_enable_filter_temperatures').checked);
}
    
function Monitor_output_Clear(){
    Monitor_output = [];
    Monitor_output_Update();
}

function Monitor_output_Update(message){
     if (message) {
        if (typeof message === 'string' || message instanceof String) {
            Monitor_output = Monitor_output.concat(message);
        }
        else 
            {
                try {
                    var msg = JSON.stringify(message, null, " ");
                    Monitor_output= Monitor_output.concat(msg + "\n");
                    }
                catch(err) {
                    Monitor_output = Monitor_output.concat(message.toString() + "\n");
                    }
            }
        Monitor_output = Monitor_output.slice(-300);
    }
    var regex = /ok T:/g;

    if (target_firmware == "repetier" || target_firmware == "repetier4davinci"){
        regex = /T:/g;
    }
    var output = "";
    var Monitor_outputLength = Monitor_output.length;
    var istempfilter =  document.getElementById("monitor_enable_filter_temperatures").checked;
    for (var i = 0; i < Monitor_outputLength; i++) {
        if (istempfilter && Monitor_output[i].match(regex)) continue;
        if ((Monitor_output[i].trim()==="\n") || (Monitor_output[i].trim()==="\r") || (Monitor_output[i].trim()==="\r\n") || (Monitor_output[i].trim()==="") )continue;
        else {
            m = Monitor_output[i].replace("&", "&amp;");
            m = m.replace("<", "&lt;");
            m = m.replace(">", "&gt;");
            output += m  ;
        }
    }
    document.getElementById("cmd_content").innerHTML = output;
    Monitor_check_autoscroll();
}

function SendCustomCommand(){
    var cmd = document.getElementById("custom_cmd_txt").value ;
    var url = "/command?commandText=";
    cmd = cmd.trim();
    if (cmd.trim().length == 0) return;
    CustomCommand_history.push(cmd);
    CustomCommand_history.slice(-40);
    CustomCommand_history_index = CustomCommand_history.length;
    document.getElementById("custom_cmd_txt").value = "";
    Monitor_output_Update(cmd + "\n");
    SendGetHttp(url + encodeURI(cmd), SendCustomCommandSuccess, SendCustomCommandFailed);
    //console.log(cmd);
}

function CustomCommand_OnKeyUp(event){
    if (event.keyCode == 13) {
                SendCustomCommand();
            }
    if (event.keyCode == 38 || event.keyCode == 40) {
        if (event.keyCode == 38 && CustomCommand_history.length > 0 && CustomCommand_history_index > 0) {
                    CustomCommand_history_index--;
        } else if (event.keyCode == 40 &&CustomCommand_history_index < CustomCommand_history.length - 1) {
            CustomCommand_history_index++;
        }

        if (CustomCommand_history_index >= 0 &&CustomCommand_history_index < CustomCommand_history.length) {
            document.getElementById("custom_cmd_txt").value = CustomCommand_history[CustomCommand_history_index];
        }
        return false;
    }
    return true;
}

function SendCustomCommandSuccess(response){
    if (response[response.length-1] != '\n')Monitor_output_Update(response + "\n");
    else Monitor_output_Update(response);
}

function SendCustomCommandFailed(error_code,response){
     Monitor_output_Update("Error " + error_code + " :" + response+ "\n");
     console.log("Error " + error_code + " :" + response);
}
