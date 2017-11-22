function init_extruder_panel(){
    var value = parseInt(get_localdata('e_length'));
    if (!(isNaN(value))) document.getElementById('filament_length').value =  value;
    value = get_localdata('enable_second_extruder');
    if (value == 'true'){
        document.getElementById('enable_second_extruder').checked =true;
        update_second_extruder();
    }
}

function update_second_extruder(){
   temperature_second_extruder(document.getElementById('enable_second_extruder').checked);
  if (document.getElementById('enable_second_extruder').checked) {
       document.getElementById('second_extruder_UI').style.display='block';
       document.getElementById('temperature_secondExtruder').style.display='table-row';
    }
  else {
        document.getElementById('second_extruder_UI').style.display='none';
        document.getElementById('temperature_secondExtruder').style.display='none';
    }
    store_localdata('enable_second_extruder', document.getElementById('enable_second_extruder').checked);
}

function on_extruder_length_Change(){
    var value = parseInt(document.getElementById('filament_length').value);
     if (value < 0.001 || value > 9999 || isNaN(value) || (value === null)) {
    }
    else {
        store_localdata('e_length', value);
    }
}

function on_extruder_velocity_Change(){
    var value = parseInt(document.getElementById('extruder_velocity').value);
     if (value < 0.001 || value > 9999 || isNaN(value) || (value === null)) {
    }
    else {
        store_localdata('e_velocity', value);
    }
}

function Extrude_cmd(extruder, direction){
    var filament_length = parseInt(document.getElementById('filament_length').value);
    var velocity = parseInt(document.getElementById('extruder_velocity').value);
    if (velocity < 1 || velocity > 9999 || isNaN(velocity) || (velocity === null)) {
        document.getElementById('extruder_velocity').value = parseInt(get_localdata('e_velocity'));
        alertdlg (translate_text_item("Out of range"), translate_text_item( "Value of extruder velocity must be between1 mm/min and 9999 mm/min !"));
        return;
        }
    if (filament_length < 0.001 || filament_length > 9999 || isNaN(filament_length) || (filament_length === null)) {
        document.getElementById('filament_length').value = parseInt(get_localdata('e_length'));
        alertdlg (translate_text_item("Out of range"), translate_text_item( "Value of filament length must be between 0.001 mm and 9999 mm !"));
        return;
        }
        //Todo send command by command TBD
        var command = extruder +"\n"+"G91\nG1 E" + (filament_length * direction) + " F" + velocity + "\nG90"
        SendPrinterCommand(command, true);
}

function flowInit_cmd(){
    document.getElementById('flowSelectedValue').value = 100;
    flowSet_cmd();
}

function flowSet_cmd(){
     var command = "M221 S";
     var value  = parseInt(document.getElementById('flowSelectedValue').value);
     if (value < 50 || value > 300 || isNaN(value)) {
         document.getElementById('flowSelectedValue').value =  100;
         alertdlg (translate_text_item("Out of range"), translate_text_item( "Value must be between 50% and 300% !"));
     }  
    else { 
        SendPrinterCommand(command + value, true);
    }
}

function feedInit_cmd(){
    document.getElementById('feedSelectedValue').value = 100;
    feedSet_cmd();
}

function feedSet_cmd(){
    var command = "M220 S";
    var value  = parseInt(document.getElementById('feedSelectedValue').value);
     if (value < 25 || value > 150 || isNaN(value)) {
         document.getElementById('feedSelectedValue').value =  100;
         alertdlg (translate_text_item("Out of range"), translate_text_item( "Value must be between 25% and 150% !"));
     }  
    else { 
        SendPrinterCommand(command + value, true);
    }
}

function fanOff_cmd(){
    document.getElementById('fanSelectedValue').value = 0;
    fanSet_cmd();
}

function fanSet_cmd(){
    var command = "M106 S";
    var fvalue = parseInt(document.getElementById('fanSelectedValue').value);
    var value = Math.round((fvalue* 255)/100);
    if (fvalue< 0 || fvalue>100 || isNaN(fvalue) || fvalue === null) {
    document.getElementById('fanSelectedValue').value = 0;
    alertdlg (translate_text_item("Out of range"), translate_text_item( "Value must be between 0% and 100% !"));
    }
    else { 
        SendPrinterCommand(command + value, true);
    }
}

function extruder_handleKeyUp(event, target){
      if (event.keyCode == 13) {
        if (target == 'Feed')feedSet_cmd();
        else if (target == 'Flow')flowSet_cmd();
        else if (target == 'Fan')fanSet_cmd();
    }
    return true;
}
