var interval_temperature = -1;
var graph_started = false;

var smoothieextuder = new SmoothieChart({
    millisPerPixel: 200,
    maxValueScale: 1.1,
    minValueScale: 1.1,
    enableDpiScaling: false,
    interpolation: 'linear',
    grid: {
        fillStyle: '#ffffff',
        strokeStyle: 'rgba(128,128,128,0.5)',
        verticalSections: 5.,
        millisPerLine: 0,
        borderVisible: false
    },
    labels: {
        fillStyle: '#000000',
        precision: 1
    }
});
var smoothiebed = new SmoothieChart({
    millisPerPixel: 200,
    interpolation: 'linear',
    maxValueScale: 1.1,
    minValueScale: 1.1,
    enableDpiScaling: false,
    grid: {
        fillStyle: '#ffffff',
        strokeStyle: 'rgba(128,128,128,0.5)',
        verticalSections: 5.,
        millisPerLine: 0,
        borderVisible: false
    },
    labels: {
        fillStyle: '#000000',
        precision: 1
    }
});
var extruder_0_line = new TimeSeries();
var extruder_1_line = new TimeSeries();
var bed_line = new TimeSeries();

function init_temperature_panel() {
    smoothiebed.addTimeSeries(bed_line, {
        lineWidth: 1,
        strokeStyle: '#808080',
        fillStyle: 'rgba(128,128,128,0.3)'
    });
    smoothieextuder.addTimeSeries(extruder_0_line, {
        lineWidth: 1,
        strokeStyle: '#ff8080',
        fillStyle: 'rgba(255,128,128,0.3)'
    });
    smoothieextuder.streamTo(document.getElementById("extruderTempgraph"), 3000 /*delay*/ );
    smoothiebed.streamTo(document.getElementById("bedTempgraph"), 3000 /*delay*/ );
}

function temperature_second_extruder(enabled) {
    if (enabled) {
        smoothieextuder.addTimeSeries(extruder_1_line, {
            lineWidth: 1,
            strokeStyle: '#000080'
        });
    } else {
        smoothieextuder.removeTimeSeries(extruder_1_line);
    }
}

function start_graph_output() {
    document.getElementById('temperatures_output').style.display = 'block';
    smoothieextuder.start();
    smoothiebed.start();
    graph_started = true;
}

function stop_graph_output() {
    smoothieextuder.stop();
    smoothiebed.stop();
    graph_started = false;
}

function on_autocheck_temperature(use_value) {
    if (typeof(use_value) !== 'undefined') document.getElementById('autocheck_temperature').checked = use_value;
    if (document.getElementById('autocheck_temperature').checked) {
        var interval = parseInt(document.getElementById('tempInterval_check').value);
        if (!isNaN(interval) && interval > 0 && interval < 100) {
            if (interval_temperature != -1) clearInterval(interval_temperature);
            interval_temperature = setInterval(function() {
                get_Temperatures()
            }, interval * 1000);
            start_graph_output();
        } else {
            document.getElementById('autocheck_temperature').checked = false;
            document.getElementById('tempInterval_check').value = 0;
            if (interval_temperature != -1) clearInterval(interval_temperature);
            interval_temperature = -1;
            stop_graph_output();
        }
    } else {
        if (interval_temperature != -1) clearInterval(interval_temperature);
        interval_temperature = -1;
        stop_graph_output();
    }
}

function onTempIntervalChange() {
    var interval = parseInt(document.getElementById('tempInterval_check').value);
    if (!isNaN(interval) && interval > 0 && interval < 100) {
        on_autocheck_temperature();
    } else {
        document.getElementById('autocheck_temperature').checked = false;
        document.getElementById('tempInterval_check').value = 0;
        if (interval != 0) alertdlg(translate_text_item("Out of range"), translate_text_item("Value of auto-check must be between 0s and 99s !!"));
        on_autocheck_temperature();
    }
}

function get_Temperatures() {
    var command = "M105";
    //removeIf(production)
    var response = "";
    if (document.getElementById('autocheck_temperature').checked) response = "ok T:26.4 /0.0 T1:26.4 /0.0 @0 B:24.9 /0.0 @0 \n";
    else response = "ok T:26.4 /0.0 @0 B:24.9 /0.0 @0\n ";
    process_Temperatures(response);
    return;
    //endRemoveIf(production)
    if (target_firmware == "marlin-embedded") SendPrinterCommand(command, false, null, null, 105, 1);
    else SendPrinterCommand(command, false, process_Temperatures, null, 105, 1);
}

function process_Temperatures(response) {
    if (target_firmware != "marlin-embedded") Monitor_output_Update(response);
    var regex_temp = /(B|T(\d*)):\s*([+]?[0-9]*\.?[0-9]+)? (\/)([+]?[0-9]*\.?[0-9]+)?/gi;
    var result;
    var timedata = new Date().getTime();
    while ((result = regex_temp.exec(response)) !== null) {
        var tool = result[1];
        var value = "<span>" + parseFloat(result[3]).toFixed(2).toString() + "°C";
        var value2;
        if (isNaN(parseFloat(result[5]))) value2 = "0.00";
        else value2 = parseFloat(result[5]).toFixed(2).toString();
        value += "</span>&nbsp;<span>|</span>&nbsp;" + value2 + "°C</span>";
        if (tool == "T") {
            //to push to graph
            extruder_0_line.append(timedata, parseFloat(result[3]));
            //test for second extruder
            //extruder_1_line.append(timedata, parseFloat(result[3])+Math.random());
            document.getElementById('heaterT0DisplayTemp').innerHTML = value;
            //to see if heating or not
            if (Number(value2) > 0) document.getElementById('heaterT0TargetTemp_anime').style.visibility = "visible";
            else document.getElementById('heaterT0TargetTemp_anime').style.visibility = "hidden";
        } else if (tool == "T1") {
            extruder_1_line.append(timedata, parseFloat(result[3]));
            document.getElementById('heaterT1DisplayTemp').innerHTML = value;
            if (Number(value2) > 0) document.getElementById('heaterT1TargetTemp_anime').style.visibility = "visible";
            else document.getElementById('heaterT1TargetTemp_anime').style.visibility = "hidden";
        }
        if (tool == "B") {
            bed_line.append(timedata, parseFloat(result[3]));
            document.getElementById('bedDisplayTemp').innerHTML = value;
            if (Number(value2) > 0) document.getElementById('bedTargetTemp_anime').style.visibility = "visible";
            else document.getElementById('bedTargetTemp_anime').style.visibility = "hidden";
        }
    }
}

function temperature_heatOff(target) {
    switch (target) {
        case 'T0':
            document.getElementById('heaterT0SelectedTemp').value = 0;
            document.getElementById('heaterT0TargetTemp_anime').style.visibility = "hidden";
            break;
        case 'T1':
            document.getElementById('heaterT1SelectedTemp').value = 0;
            document.getElementById('heaterT1TargetTemp_anime').style.visibility = "hidden";
            break;
        case 'bed':
            document.getElementById('bedSelectedTemp').value = 0;
            document.getElementById('bedTargetTemp_anime').style.visibility = "hidden";
            break;
    }
    var type = (target == 'bed') ? 140 : 104;
    var command = "M" + type + " S0";
    if (target != 'bed') {
        command += " " + target;
    }
    SendPrinterCommand(command, true, get_Temperatures);
}

function temperature_handleKeyUp(event, target) {
    if (event.keyCode == 13) {
        temperature_heatSet(target);
    }
    return true;
}

function temperature_heatSet(target) {
    var selectedTemp = 0;
    switch (target) {
        case 'T0':
            selectedTemp = parseInt(document.getElementById('heaterT0SelectedTemp').value);
            if (selectedTemp < 0 || selectedTemp > 999 || isNaN(selectedTemp) || (selectedTemp === null)) {
                alertdlg(translate_text_item("Out of range"), translate_text_item("Value must be between 0 degres and 999 degres !"));
                return;
            }
            break;
        case 'T1':
            selectedTemp = parseInt(document.getElementById('heaterT1SelectedTemp').value);
            if (selectedTemp < 0 || selectedTemp > 999 || isNaN(selectedTemp) || (selectedTemp === null)) {
                alertdlg(translate_text_item("Out of range"), translate_text_item("Value must be between 0 degres and 999 degres !"));
                return;
            }
            break;
        case 'bed':
            selectedTemp = parseInt(document.getElementById('bedSelectedTemp').value);
            if (selectedTemp < 0 || selectedTemp > 999 || isNaN(selectedTemp) || (selectedTemp === null)) {
                alertdlg(translate_text_item("Out of range"), translate_text_item("Value must be between 0 degres and 999 degres !"));
                return;
            }
            break;
    }

    var type = (target == 'bed') ? 140 : 104;
    var command = "M" + type + " S" + selectedTemp;
    if (target != 'bed') {
        command += " " + target;
    }
    SendPrinterCommand(command, true, get_Temperatures);
}
