var interval_temperature = -1;
var graph_started = false;

var smoothieextuder = new SmoothieChart({
  millisPerPixel: 200,
  maxValueScale: 1.1,
  minValueScale: 1.1,
  enableDpiScaling: false,
  interpolation: "linear",
  grid: {
    fillStyle: "#ffffff",
    strokeStyle: "rgba(128,128,128,0.5)",
    verticalSections: 5,
    millisPerLine: 0,
    borderVisible: false,
  },
  labels: {
    fillStyle: "#000000",
    precision: 1,
  },
});
var smoothiebed = new SmoothieChart({
  millisPerPixel: 200,
  interpolation: "linear",
  maxValueScale: 1.1,
  minValueScale: 1.1,
  enableDpiScaling: false,
  grid: {
    fillStyle: "#ffffff",
    strokeStyle: "rgba(128,128,128,0.5)",
    verticalSections: 5,
    millisPerLine: 0,
    borderVisible: false,
  },
  labels: {
    fillStyle: "#000000",
    precision: 1,
  },
});
var extruder_0_line = new TimeSeries();
var extruder_1_line = new TimeSeries();
var extruder_redundant_line = new TimeSeries();
var probe_line = new TimeSeries();
var bed_line = new TimeSeries();
var chamber_line = new TimeSeries();

function init_temperature_panel() {
  smoothiebed.addTimeSeries(bed_line, {
    lineWidth: 1,
    strokeStyle: "#808080",
    fillStyle: "rgba(128,128,128,0.3)",
  });
  smoothieextuder.addTimeSeries(extruder_0_line, {
    lineWidth: 1,
    strokeStyle: "#ff8080",
    fillStyle: "rgba(255,128,128,0.3)",
  });
  smoothieextuder.streamTo(
    document.getElementById("extruderTempgraph"),
    3000 /*delay*/
  );
  smoothiebed.streamTo(document.getElementById("bedTempgraph"), 3000 /*delay*/);
}

function temperature_second_extruder(enabled) {
  if (enabled) {
    smoothieextuder.addTimeSeries(extruder_1_line, {
      lineWidth: 1,
      strokeStyle: "#000080",
    });
  } else {
    smoothieextuder.removeTimeSeries(extruder_1_line);
  }
}

function temperature_extruder_redundant(enabled) {
  if (enabled) {
    smoothieextuder.addTimeSeries(extruder_redundant_line, {
      lineWidth: 1,
      strokeStyle: "#808080",
    });
  } else {
    smoothieextuder.removeTimeSeries(extruder_redundant_line);
  }
}

function temperature_probe(enabled) {
  if (enabled) {
    smoothiebed.addTimeSeries(probe_line, {
      lineWidth: 1,
      strokeStyle: "#202080",
    });
  } else {
    smoothiebed.removeTimeSeries(probe_line);
  }
}

function temperature_chamber(enabled) {
  if (enabled) {
    smoothiebed.addTimeSeries(chamber_line, {
      lineWidth: 1,
      strokeStyle: "#202020",
    });
  } else {
    smoothiebed.removeTimeSeries(chamber_line);
  }
}

function start_graph_output() {
  document.getElementById("temperatures_output").style.display = "block";
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
  if (typeof use_value !== "undefined")
    document.getElementById("autocheck_temperature").checked = use_value;
  if (document.getElementById("autocheck_temperature").checked) {
    var interval = parseInt(
      document.getElementById("tempInterval_check").value
    );
    if (!isNaN(interval) && interval > 0 && interval < 100) {
      if (interval_temperature != -1) clearInterval(interval_temperature);
      interval_temperature = setInterval(function () {
        get_Temperatures();
      }, interval * 1000);
      start_graph_output();
    } else {
      document.getElementById("autocheck_temperature").checked = false;
      document.getElementById("tempInterval_check").value = 0;
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
  var interval = parseInt(document.getElementById("tempInterval_check").value);
  if (!isNaN(interval) && interval > 0 && interval < 100) {
    on_autocheck_temperature();
  } else {
    document.getElementById("autocheck_temperature").checked = false;
    document.getElementById("tempInterval_check").value = 0;
    if (interval != 0)
      alertdlg(
        translate_text_item("Out of range"),
        translate_text_item("Value of auto-check must be between 0s and 99s !!")
      );
    on_autocheck_temperature();
  }
}

function get_Temperatures() {
  var command = "M105";
  command =
    preferenceslist[0].enable_redundant === "true" &&
    supportsRedundantTemperatures()
      ? command + " R"
      : command;
  //removeIf(production)
  var response = "";
  if (document.getElementById("autocheck_temperature").checked)
    response = "ok T:26.4 /0.0 T1:26.4 /0.0 @0 B:24.9 /0.0 @0 \n";
  else response = "ok T:26.4 /0.0 @0 B:24.9 /0.0 @0\n ";
  process_Temperatures(response);
  return;
  //endRemoveIf(production)
  if (target_firmware == "marlin-embedded")
    SendPrinterCommand(command, false, null, null, 105, 1);
  else SendPrinterCommand(command, false, process_Temperatures, null, 105, 1);
}

function submit_target_temperature(target, selectedTemp) {
  var type = 104;
  if (target == "bed") {
    type = 140;
  } else if (target == "chamber") {
    type = 141;
  }
  var command = "M" + type + " S" + selectedTemp;
  if (target != "bed" && target != "chamber") {
    command += " " + target;
  }
  SendPrinterCommand(command, true, get_Temperatures);
}

function process_Temperatures(response) {
  var regex_temp = /(B|C|P|R|T(\d*)):\s*([+]?[0-9]*\.?[0-9]+)? (\/)([+]?[0-9]*\.?[0-9]+)?/gi;
  var result;
  var timedata = new Date().getTime();
  while ((result = regex_temp.exec(response)) !== null) {
    var tool = result[1];
    var value = "<span>" + parseFloat(result[3]).toFixed(2).toString() + "°C";
    var value2;
    if (isNaN(parseFloat(result[5]))) value2 = "0.00";
    else value2 = parseFloat(result[5]).toFixed(2).toString();
    value += "</span>&nbsp;<span>|</span>&nbsp;" + value2 + "°C</span>";
    //console.log(tool, ":", result[3]);
    if (tool == "T" || tool == "T0") {
      //to push to graph
      extruder_0_line.append(timedata, parseFloat(result[3]));
      document.getElementById("heaterT0DisplayTemp").innerHTML = value;
      //to see if heating or not
      if (Number(value2) > 0)
        document.getElementById("heaterT0TargetTemp_anime").style.visibility =
          "visible";
      else
        document.getElementById("heaterT0TargetTemp_anime").style.visibility =
          "hidden";
    } else if (tool == "R") {
      extruder_redundant_line.append(timedata, parseFloat(result[3]));
      document.getElementById("heaterRDisplayTemp").innerHTML = value;
      if (Number(value2) > 0)
        document.getElementById("heaterRTargetTemp_anime").style.visibility =
          "visible";
      else
        document.getElementById("heaterRTargetTemp_anime").style.visibility =
          "hidden";
    } else if (tool == "T1") {
      extruder_1_line.append(timedata, parseFloat(result[3]));
      document.getElementById("heaterT1DisplayTemp").innerHTML = value;
      if (Number(value2) > 0)
        document.getElementById("heaterT1TargetTemp_anime").style.visibility =
          "visible";
      else
        document.getElementById("heaterT1TargetTemp_anime").style.visibility =
          "hidden";
    } else if (tool == "P") {
      probe_line.append(timedata, parseFloat(result[3]));
      document.getElementById("probeDisplayTemp").innerHTML = value;
      if (Number(value2) > 0)
        document.getElementById("probeTargetTemp_anime").style.visibility =
          "visible";
      else
        document.getElementById("probeTargetTemp_anime").style.visibility =
          "hidden";
    } else if (tool == "B") {
      bed_line.append(timedata, parseFloat(result[3]));
      document.getElementById("bedDisplayTemp").innerHTML = value;
      if (Number(value2) > 0)
        document.getElementById("bedTargetTemp_anime").style.visibility =
          "visible";
      else
        document.getElementById("bedTargetTemp_anime").style.visibility =
          "hidden";
    } else if (tool == "C") {
      chamber_line.append(timedata, parseFloat(result[3]));
      document.getElementById("chamberDisplayTemp").innerHTML = value;
      if (Number(value2) > 0)
        document.getElementById("chamberTargetTemp_anime").style.visibility =
          "visible";
      else
        document.getElementById("chamberTargetTemp_anime").style.visibility =
          "hidden";
    }
  }
}

function temperature_heatOff(target) {
  switch (target) {
    case "T0":
      document.getElementById("heaterT0SelectedTemp").value = 0;
      document.getElementById("heaterT0TargetTemp_anime").style.visibility =
        "hidden";
      document.getElementById("heaterRDisplayTemp").value = 0;
      document.getElementById("heaterRTargetTemp_anime").style.visibility =
        "hidden";
      break;
    case "T1":
      document.getElementById("heaterT1SelectedTemp").value = 0;
      document.getElementById("heaterT1TargetTemp_anime").style.visibility =
        "hidden";
      break;
    case "bed":
      document.getElementById("bedSelectedTemp").value = 0;
      document.getElementById("bedTargetTemp_anime").style.visibility =
        "hidden";
      break;
    case "chamber":
      document.getElementById("chamberSelectedTemp").value = 0;
      document.getElementById("chamberTargetTemp_anime").style.visibility =
        "hidden";
      break;
  }

  submit_target_temperature(target, 0);
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
    case "T0":
      selectedTemp = parseInt(
        document.getElementById("heaterT0SelectedTemp").value
      );
      if (
        selectedTemp < 0 ||
        selectedTemp > 999 ||
        isNaN(selectedTemp) ||
        selectedTemp === null
      ) {
        alertdlg(
          translate_text_item("Out of range"),
          translate_text_item(
            "Value must be between 0 degrees and 999 degrees !"
          )
        );
        return;
      }
      break;
    case "T1":
      selectedTemp = parseInt(
        document.getElementById("heaterT1SelectedTemp").value
      );
      if (
        selectedTemp < 0 ||
        selectedTemp > 999 ||
        isNaN(selectedTemp) ||
        selectedTemp === null
      ) {
        alertdlg(
          translate_text_item("Out of range"),
          translate_text_item(
            "Value must be between 0 degrees and 999 degrees !"
          )
        );
        return;
      }
      break;
    case "bed":
      selectedTemp = parseInt(document.getElementById("bedSelectedTemp").value);
      if (
        selectedTemp < 0 ||
        selectedTemp > 999 ||
        isNaN(selectedTemp) ||
        selectedTemp === null
      ) {
        alertdlg(
          translate_text_item("Out of range"),
          translate_text_item(
            "Value must be between 0 degrees and 999 degrees !"
          )
        );
        return;
      }
      break;
    case "chamber":
      selectedTemp = parseInt(
        document.getElementById("chamberSelectedTemp").value
      );
      if (
        selectedTemp < 0 ||
        selectedTemp > 999 ||
        isNaN(selectedTemp) ||
        selectedTemp === null
      ) {
        alertdlg(
          translate_text_item("Out of range"),
          translate_text_item(
            "Value must be between 0 degrees and 999 degrees !"
          )
        );
        return;
      }
      break;
  }

  submit_target_temperature(target, selectedTemp);
}

function supportsRedundantTemperatures() {
  return (
    target_firmware == "marlin-embedded" ||
    target_firmware == "marlin" ||
    target_firmware == "smoothieware"
  );
}

function supportsProbeTemperatures() {
  return (
    target_firmware == "marlin-embedded" ||
    target_firmware == "marlin" ||
    target_firmware == "smoothieware"
  );
}

function supportsChamberTemperatures() {
  return (
    target_firmware == "marlin-embedded" ||
    target_firmware == "marlin" ||
    target_firmware == "marlinkimbra" ||
    target_firmware == "smoothieware"
  );
}
