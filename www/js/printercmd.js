function SendPrinterCommand(cmd, echo_on, processfn, errorfn){
    var url = "/command?commandText=";
    var push_cmd = true;
    if (typeof echo_on !== 'undefined') {
        push_cmd = echo_on;
        }
    if (cmd.trim().length == 0) return;
    if (push_cmd)Monitor_output_Update(cmd + "\n");
    //removeIf(production)
    console.log(cmd);
    if (typeof processfn !== 'undefined')processfn("Test response");
    else SendPrinterCommandSuccess("Test response");
    return;
    //endRemoveIf(production)
    if (typeof processfn === 'undefined' || processfn == null) processfn = SendPrinterCommandSuccess;
    if (typeof errorfn === 'undefined' || errorfn ==null) errorfn = SendPrinterCommandFailed;
    SendGetHttp(url + encodeURI(cmd), processfn, errorfn);
    //console.log(cmd);
}

function SendPrinterSilentCommand(cmd, processfn, errorfn){
    var url = "/command_silent?commandText=";
    if (cmd.trim().length == 0) return;
    //removeIf(production)
    console.log(cmd);
    if (typeof processfn !== 'undefined')processfn("Test response");
    else SendPrinterCommandSuccess("Test response");
    return;
    //endRemoveIf(production)
    if (typeof processfn === 'undefined' || processfn == null) processfn = SendPrinterSilentCommandSuccess;
    if (typeof errorfn === 'undefined' || errorfn == null) errorfn = SendPrinterCommandFailed;
    SendGetHttp(url + encodeURI(cmd), processfn, errorfn);
    //console.log(cmd);
}

function SendPrinterSilentCommandSuccess(response){
    //console.log(response);
}


function SendPrinterCommandSuccess(response){
    if (response[response.length-1] != '\n')Monitor_output_Update(response + "\n");
    else Monitor_output_Update(response);
}

function SendPrinterCommandFailed(error_code,response){
     Monitor_output_Update("Error " + error_code + " :" + response+ "\n");
     console.log("Error " + error_code + " :" + response);
}
