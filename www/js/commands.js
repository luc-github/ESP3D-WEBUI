var CustomCommand_history = [];
var CustomCommand_history_index = -1;
var Monitor_output = [];

function init_command_panel() {

}

function Monitor_output_autoscrollcmd() {
    document.getElementById('cmd_content').scrollTop = document.getElementById('cmd_content').scrollHeight;
}

function Monitor_check_autoscroll() {
    if (document.getElementById('monitor_enable_autoscroll').checked == true) Monitor_output_autoscrollcmd();
}

function Monitor_check_verbose_mode() {
    Monitor_output_Update();
}

function Monitor_output_Clear() {
    Monitor_output = [];
    Monitor_output_Update();
}

function Monitor_output_Update(message) {
    if (message) {
        if (typeof message === 'string' || message instanceof String) {
            Monitor_output = Monitor_output.concat(message);
        } else {
            try {
                var msg = JSON.stringify(message, null, " ");
                Monitor_output = Monitor_output.concat(msg + "\n");
            } catch (err) {
                Monitor_output = Monitor_output.concat(message.toString() + "\n");
            }
        }
        Monitor_output = Monitor_output.slice(-300);
    }
    var regex = /ok T:/g;

    if (target_firmware == "repetier" || target_firmware == "repetier4davinci") {
        regex = /T:/g;
    }
    var output = "";
    var Monitor_outputLength = Monitor_output.length;
    var isverbosefilter = document.getElementById("monitor_enable_verbose_mode").checked;
    for (var i = 0; i < Monitor_outputLength; i++) {
        //Filter the output  
        if ((Monitor_output[i].trim().toLowerCase().startsWith("ok")) && !isverbosefilter) continue;
        if ((Monitor_output[i].trim().toLowerCase() == "wait") && !isverbosefilter) continue;
        if ((target_firmware == "grbl") || (target_firmware == "grbl-embedded")) {
            //no status
            if ((Monitor_output[i].startsWith("<") || Monitor_output[i].startsWith("[echo:")) && !isverbosefilter) continue;
        } else {
            //no temperatures
            if (!isverbosefilter && Monitor_output[i].match(regex)) continue;
        }
        if ((Monitor_output[i].trim() === "\n") || (Monitor_output[i].trim() === "\r") || (Monitor_output[i].trim() === "\r\n") || (Monitor_output[i].trim() === "")) continue;
        m = Monitor_output[i];
        if (Monitor_output[i].startsWith("[#]")) {
            if (!isverbosefilter) continue;
            else m = m.replace("[#]", "");
        }
        //position
        if (!isverbosefilter && Monitor_output[i].startsWith("X:")) continue;
         if (!isverbosefilter && Monitor_output[i].startsWith("FR:")) continue;
        m = m.replace("&", "&amp;");
        m = m.replace("<", "&lt;");
        m = m.replace(">", "&gt;");
        if (m.startsWith("ALARM:") || m.startsWith("Hold:") || m.startsWith("Door:")) {
            m = "<font color='orange'><b>" + m + translate_text_item(m.trim()) + "</b></font>\n";
        }
        if (m.startsWith("error:")) {
            m = "<font color='red'><b>" + m.toUpperCase() + translate_text_item(m.trim()) + "</b></font>\n";
        }
        if ((m.startsWith("echo:") || m.startsWith("Config:")) && !isverbosefilter) continue;
        if (m.startsWith("echo:Unknown command: \"echo\"") || (m.startsWith("echo:enqueueing \"*\""))) continue;
        output += m;
    }
    document.getElementById("cmd_content").innerHTML = output;
    Monitor_check_autoscroll();
}

function SendCustomCommand() {
    var cmd = document.getElementById("custom_cmd_txt").value;
    var url = "/command?commandText=";
    cmd = cmd.trim();
    if (cmd.trim().length == 0) return;
    CustomCommand_history.push(cmd);
    CustomCommand_history.slice(-40);
    CustomCommand_history_index = CustomCommand_history.length;
    document.getElementById("custom_cmd_txt").value = "";
    Monitor_output_Update(cmd + "\n");
    cmd = encodeURI(cmd);
    //because # is not encoded
    cmd = cmd.replace("#", "%23");
    SendGetHttp(url + cmd, SendCustomCommandSuccess, SendCustomCommandFailed);
}

function CustomCommand_OnKeyUp(event) {
    if (event.keyCode == 13) {
        SendCustomCommand();
    }
    if (event.keyCode == 38 || event.keyCode == 40) {
        if (event.keyCode == 38 && CustomCommand_history.length > 0 && CustomCommand_history_index > 0) {
            CustomCommand_history_index--;
        } else if (event.keyCode == 40 && CustomCommand_history_index < CustomCommand_history.length - 1) {
            CustomCommand_history_index++;
        }

        if (CustomCommand_history_index >= 0 && CustomCommand_history_index < CustomCommand_history.length) {
            document.getElementById("custom_cmd_txt").value = CustomCommand_history[CustomCommand_history_index];
        }
        return false;
    }
    return true;
}

function SendCustomCommandSuccess(response) {
    if (response[response.length - 1] != '\n') Monitor_output_Update(response + "\n");
    else {
        Monitor_output_Update(response);
    }
    var tcmdres = response.split("\n");
    for (var il = 0; il < tcmdres.length; il++){
        process_socket_response(tcmdres[il]);
    }
}

function SendCustomCommandFailed(error_code, response) {
    if (error_code == 0) {
        Monitor_output_Update(translate_text_item("Connection error") + "\n");
    } else {
         Monitor_output_Update(translate_text_item("Error : ") + error_code + " :" + decode_entitie(response) + "\n");
    }
    console.log("cmd Error " + error_code + " :" + decode_entitie(response));
}
