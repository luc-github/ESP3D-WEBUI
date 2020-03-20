var config_configList = [];
var config_override_List = [];
var config_lastindex = -1
var config_error_msg = "";
var config_lastindex_is_override = false;
var commandtxt = "M205";
var is_override_config = false;
var config_file_name = "/sd/config";


function refreshconfig(is_override) {
    if (http_communication_locked) {
        document.getElementById('config_status').innerHTML = translate_text_item("Communication locked by another process, retry later.");
        return;
    }
    is_override_config = false;
    if ((typeof is_override != 'undefined') && is_override) is_override_config = is_override;
    config_display_override(is_override_config);
    document.getElementById('config_loader').style.display = "block";
    document.getElementById('config_list_content').style.display = "none";
    document.getElementById('config_status').style.display = "none";
    document.getElementById('config_refresh_btn').style.display = "none";
    if (!is_override) config_configList = [];
    config_override_List = [];
    //removeIf(production)
    var response_text = "";
    if (target_firmware == "smoothieware") response_text = "# Robot module configurations : general handling of movement G-codes and slicing into moves\ndefault_feed_rate                            4000             # Default rate ( mm/minute ) for G1/G2/G3 moves\ndefault_seek_rate                            4000             # Default rate ( mm/minute ) for G0 moves\nmm_per_arc_segment                           0.0              # Fixed length for line segments that divide arcs 0 to disable\nmm_max_arc_error                             0.01             # The maximum error for line segments that divide arcs 0 to disable\n                                                              # note it is invalid for both the above be 0\n                                                              # if both are used, will use largest segment length based on radius\n#mm_per_line_segment                          5                # Lines can be cut into segments ( not usefull with cartesian coordinates robots ).\n\n# Arm solution configuration : Cartesian robot. Translates mm positions into stepper positions\nalpha_steps_per_mm                           80               # Steps per mm for alpha stepper\nbeta_steps_per_mm                            80               # Steps per mm for beta stepper\ngamma_steps_per_mm                           1637.7953        # Steps per mm for gamma stepper\n\n# Planner module configuration : Look-ahead and acceleration configuration\nplanner_queue_size                           32               # DO NOT CHANGE THIS UNLESS YOU KNOW EXACTLY WHAT YOUR ARE DOING\nacceleration                                 3000             # Acceleration in mm/second/second.\n#z_acceleration                              500              # Acceleration for Z only moves in mm/s^2, 0 disables it, disabled by default. DO NOT SET ON A DELTA\njunction_deviation                           0.05             # Similar to the old max_jerk, in millimeters, see : https://github.com/grbl/grbl/blob/master/planner.c#L409\n                                                              # and https://github.com/grbl/grbl/wiki/Configuring-Grbl-v0.8 . Lower values mean being more careful, higher values means being faster and have more jerk\n\n# Stepper module configuration\nmicroseconds_per_step_pulse                  1                # Duration of step pulses to stepper drivers, in microseconds\nbase_stepping_frequency                      100000           # Base frequency for stepping\n\n# Stepper module pins ( ports, and pin numbers, appending ! to the number will invert a pin )\nalpha_step_pin                               2.1              # Pin for alpha stepper step signal\nalpha_dir_pin                                0.11             # Pin for alpha stepper direction\nalpha_en_pin                                 0.10!            # Pin for alpha enable pin\nalpha_current                                1.0              # X stepper motor current\nx_axis_max_speed                             30000            # mm/min\nalpha_max_rate                               30000.0          # mm/min actuator max speed;";
    if (target_firmware == "grbl") response_text = "$0=10\n$1=25\n$2=0\n$3=0\n$4=0\n$5=0\n$6=0\n$10=1\n$11=0.010\n$12=0.002\n$13=0\n$20=0\n$21=0\n$22=0\n$23=0\n$24=25.000\n$25=500.000\n$26=250\n$27=1.000\n$30=1000\n$31=0\n$32=0\n$100=250.000\n$101=250.000\n$102=250.000\n$110=500.000\n$111=500.000\n$112=500.000\n$120=10.000\n$121=20.000\n$122=10.000\n$130=200.000\n$131=200.000\n$132=200.000";
    else response_text = "EPR:0 1028 7 Language\nEPR:2 75 230400 Baudrate\nEPR:0 1125 1 Display Mode:\nEPR:0 1119 1 Light On:\nEPR:0 1127 1 Keep Light On:\nEPR:0 1126 0 Filament Sensor On:\nEPR:0 1176 0 Top Sensor On:\nEPR:0 1120 1 Sound On:\nEPR:0 1177 1 Wifi On:\nEPR:3 129 0.000 Filament printed [m]\nEPR:2 125 0 Printer active [s]\nEPR:2 79 0 Max. inactive time [ms,0=off]\nEPR:2 83 360000 Stop stepper after inactivity [ms,0=off]\nEPR:2 1121 0 Powersave after [ms,0=off]:\nEPR:3 1160 180.000 Temp Ext PLA:\nEPR:3 1164 230.000 Temp Ext ABS:\nEPR:3 1168 60.000 Temp Bed PLA:\nEPR:3 1172 90.000 Temp Bed ABS:\nEPR:3 1179 2.000 Load Feed Rate:\nEPR:3 1183 4.000 Unload Feed Rate:\nEPR:3 1187 60.000 Unload/Load Distance:\nEPR:3 3 80.0000 X-axis steps per mm\nEPR:3 7 80.0000 Y-axis steps per mm\nEPR:3 11 2560.0000 Z-axis steps per mm\nEPR:3 15 200.000 X-axis max. feedrate [mm/s]\nEPR:3 19 200.000 Y-axis max. feedrate [mm/s]\nEPR:3 23 5.000 Z-axis max. feedrate [mm/s]\nEPR:3 27 40.000 X-axis homing feedrate [mm/s]\nEPR:3 31 40.000 Y-axis homing feedrate [mm/s]\nEPR:3 35 4.000 Z-axis homing feedrate [mm/s]\nEPR:3 39 20.000 Max. jerk [mm/s]\nEPR:3 47 0.342 Max. Z-jerk [mm/s]\nEPR:3 133 0.000 X min pos [mm]\nEPR:3 137 0.000 Y min pos [mm]\nEPR:3 141 0.000 Z min pos [mm]\nEPR:3 145 199.000 X max length [mm]\nEPR:3 149 204.000 Y max length [mm]\nEPR:3 153 200.000 Z max length [mm]\nEPR:3 51 1000.000 X-axis acceleration [mm/s^2]\nEPR:3 55 1000.000 Y-axis acceleration [mm/s^2]\nEPR:3 59 100.000 Z-axis acceleration [mm/s^2]\nEPR:3 63 1000.000 X-axis travel acceleration [mm/s^2]\nEPR:3 67 1000.000 Y-axis travel acceleration [mm/s^2]\nEPR:3 71 150.000 Z-axis travel acceleration [mm/s^2]\nEPR:3 1024 0.000 Coating thickness [mm]\nEPR:3 1128 100.000 Manual-probe X1 [mm]\nEPR:3 1132 180.000 Manual-probe Y1 [mm]\nEPR:3 1136 100.000 Manual-probe X2 [mm]\nEPR:3 1140 10.000 Manual-probe Y2 [mm]\nEPR:3 1144 50.000 Manual-probe X3 [mm]\nEPR:3 1148 95.000 Manual-probe Y3 [mm]\nEPR:3 1152 150.000 Manual-probe X4 [mm]\nEPR:3 1156 95.000 Manual-probe Y4 [mm]\nEPR:3 808 0.280 Z-probe height [mm]\nEPR:3 929 5.000 Max. z-probe - bed dist. [mm]\nEPR:3 812 1.000 Z-probe speed [mm/s]\nEPR:3 840 30.000 Z-probe x-y-speed [mm/s]\nEPR:3 800 0.000 Z-probe offset x [mm]\nEPR:3 804 0.000 Z-probe offset y [mm]\nEPR:3 816 36.000 Z-probe X1 [mm]\nEPR:3 820 -7.000 Z-probe Y1 [mm]\nEPR:3 824 36.000 Z-probe X2 [mm]\nEPR:3 828 203.000 Z-probe Y2 [mm]\nEPR:3 832 171.000 Z-probe X3 [mm]\nEPR:3 836 203.000 Z-probe Y3 [mm]\nEPR:3 1036 0.000 Z-probe bending correction A [mm]\nEPR:3 1040 0.000 Z-probe bending correction B [mm]\nEPR:3 1044 0.000 Z-probe bending correction C [mm]\nEPR:0 880 0 Autolevel active (1/0)\nEPR:0 106 2 Bed Heat Manager [0-3]\nEPR:0 107 255 Bed PID drive max\nEPR:0 124 80 Bed PID drive min\nEPR:3 108 196.000 Bed PID P-gain\nEPR:3 112 33.000 Bed PID I-gain\nEPR:3 116 290.000 Bed PID D-gain\nEPR:0 120 255 Bed PID max value [0-255]\nEPR:0 1020 0 Enable retraction conversion [0/1]\nEPR:3 992 3.000 Retraction length [mm]\nEPR:3 996 13.000 Retraction length extruder switch [mm]\nEPR:3 1000 40.000 Retraction speed [mm/s]\nEPR:3 1004 0.000 Retraction z-lift [mm]\nEPR:3 1008 0.000 Extra extrusion on undo retract [mm]\nEPR:3 1012 0.000 Extra extrusion on undo switch retract [mm]\nEPR:3 1016 20.000 Retraction undo speed\nEPR:3 200 99.000 Extr.1 steps per mm\nEPR:3 204 50.000 Extr.1 max. feedrate [mm/s]\nEPR:3 208 20.000 Extr.1 start feedrate [mm/s]\nEPR:3 212 5000.000 Extr.1 acceleration [mm/s^2]\nEPR:0 216 3 Extr.1 heat manager [0-3]\nEPR:0 217 230 Extr.1 PID drive max\nEPR:0 245 40 Extr.1 PID drive min\nEPR:3 218 3.0000 Extr.1 PID P-gain/dead-time\nEPR:3 222 2.0000 Extr.1 PID I-gain\nEPR:3 226 40.0000 Extr.1 PID D-gain\nEPR:0 230 255 Extr.1 PID max value [0-255]\nEPR:2 231 0 Extr.1 X-offset [steps]\nEPR:2 235 0 Extr.1 Y-offset [steps]\nEPR:2 290 0 Extr.1 Z-offset [steps]\nEPR:1 239 1 Extr.1 temp. stabilize time [s]\nEPR:1 250 150 Extr.1 temp. for retraction when heating [C]\nEPR:1 252 0 Extr.1 distance to retract when heating [mm]\nEPR:0 254 255 Extr.1 extruder cooler speed [0-255]\nEPR:3 246 0.000 Extr.1 advance L [0=off]\nEPR:3 300 99.000 Extr.2 steps per mm\nEPR:3 304 50.000 Extr.2 max. feedrate [mm/s]\nEPR:3 308 20.000 Extr.2 start feedrate [mm/s]\nEPR:3 312 5000.000 Extr.2 acceleration [mm/s^2]\nEPR:0 316 3 Extr.2 heat manager [0-3]\nEPR:0 317 230 Extr.2 PID drive max\nEPR:0 345 40 Extr.2 PID drive min\nEPR:3 318 3.0000 Extr.2 PID P-gain/dead-time\nEPR:3 322 2.0000 Extr.2 PID I-gain\nEPR:3 326 40.0000 Extr.2 PID D-gain\nEPR:0 330 255 Extr.2 PID max value [0-255]\nEPR:2 331 -2852 Extr.2 X-offset [steps]\nEPR:2 335 12 Extr.2 Y-offset [steps]\nEPR:2 390 0 Extr.2 Z-offset [steps]\nEPR:1 339 1 Extr.2 temp. stabilize time [s]\nEPR:1 350 150 Extr.2 temp. for retraction when heating [C]\nEPR:1 352 0 Extr.2 distance to retract when heating [mm]\nEPR:0 354 255 Extr.2 extruder cooler speed [0-255]\nEPR:3 346 0.000 Extr.2 advance L [0=off]\n";
    getESPconfigSuccess(response_text);
    return;
    //endRemoveIf(production)
    if (target_firmware == "smoothieware") {
        if (!is_override_config) config_file_name = "/sd/config";
        commandtxt = "cat " + config_file_name;
    }
    if ((target_firmware == "grbl") || (target_firmware == "grbl-embedded")) commandtxt = "$$";
    if ((target_firmware == "marlin") || (target_firmware == "marlinkimbra") || (target_firmware == "marlin-embedded")) commandtxt = "M503";
    getprinterconfig(is_override_config);
}

function config_display_override(display_it) {
    if (display_it) {
        document.getElementById('config_override_list_content').style.display = "block";
        document.getElementById('config_main_content').style.display = "none";
        document.getElementById('config_override_file').checked = true;
    } else {
        document.getElementById('config_override_list_content').style.display = "none";
        document.getElementById('config_main_content').style.display = "block";
        document.getElementById('config_main_file').checked = true;
    }
}

function getprinterconfig(is_override) {
    var cmd = commandtxt;
    if ((typeof is_override != 'undefined') && is_override) {
        cmd = "M503";
        config_override_List = [];
        is_override_config = true;
    } else is_override_config = false;
    var url = "/command?plain=" + encodeURIComponent(cmd);
    if ((target_firmware == "grbl-embedded") || (target_firmware == "marlin-embedded")) SendGetHttp(url);
    else SendGetHttp(url, getESPconfigSuccess, getESPconfigfailed);
}

function Apply_config_override() {
    var url = "/command?plain=" + encodeURIComponent("M500");
    SendGetHttp(url, getESPUpdateconfigSuccess);
}

function Delete_config_override() {
    var url = "/command?plain=" + encodeURIComponent("M502");
    SendGetHttp(url, getESPUpdateconfigSuccess);
}

function getESPUpdateconfigSuccess(response) {
    refreshconfig(true);
}

function build_HTML_config_list() {
    var content = "";
    var array_len = config_configList.length;
    if (is_override_config) array_len = config_override_List.length;
    for (var i = 0; i < array_len; i++) {
        var item;
        var prefix = "";
        if (is_override_config) {
            item = config_override_List[i];
            prefix = "_override"
        } else item = config_configList[i];
        content += "<tr>";
        if (item.showcomment) {
            content += "<td colspan='3' class='info'>";
            content += item.comment;
        } else {
            content += "<td style='vertical-align:middle'>";
            content += item.label;
            content += "</td>";
            content += "<td style='vertical-align:middle;'>";
            content += "<table><tr><td>"
            content += "<div id='status_config_" + prefix + i + "' class='form-group has-feedback' style='margin: auto;'>";
            content += "<div class='item-flex-row'>";
            content += "<table><tr><td>";
            content += "<div class='input-group'>";
            content += "<span class='input-group-btn'>";
            content += "<button class='btn btn-default btn-svg' onclick='config_revert_to_default(" + i + "," + is_override_config + ")' >";
            content += get_icon_svg("repeat");
            content += "</button>";
            content += "</span>";
            content += "<input class='hide_it'></input>";
            content += "</div>";
            content += "</td><td>";
            content += "<div class='input-group'>";
            content += "<span class='input-group-addon hide_it' ></span>";
            content += "<input id='config_" + prefix + i + "' type='text' class='form-control' style='width:";
            if ((target_firmware == "marlin") || (target_firmware == "marlinkimbra") || (target_firmware == "marlin-embedded") || is_override_config) content += "25em";
            else content += "auto";
            content += "'  value='" + item.defaultvalue + "' onkeyup='config_checkchange(" + i + "," + is_override_config + ")' />";
            content += "<span id='icon_config_" + prefix + i + "'class='form-control-feedback ico_feedback' ></span>";
            content += "<span class='input-group-addon hide_it' ></span>";
            content += "</div>";
            content += "</td></tr></table>";
            content += "<div class='input-group'>";
            content += "<input class='hide_it'></input>";
            content += "<span class='input-group-btn'>";
            content += "<button  id='btn_config_" + prefix + i + "' class='btn btn-default' onclick='configGetvalue(" + i + "," + is_override_config + ")' translate english_content='Set' >" + translate_text_item("Set") + "</button>&nbsp;";
            content += "</span>";
            content += "</div>";
            content += "</div>";
            content += "</div>";
            content += "</td></tr></table>";
            content += "</td>";
            content += "<td style='vertical-align:middle'>";
            if ((target_firmware == "grbl") || (target_firmware == "grbl-embedded"))content += item.help;
            else content += HTMLEncode(item.help);
        }
        content += "</td>";
        content += "</tr>\n";
    }
    if (content.length > 0) {
        if (target_firmware == "smoothieware") {
            document.getElementById('config_main_file_name').innerHTML = config_file_name;
            if (!is_override_config) {
                document.getElementById('config_list_data').innerHTML = content;
                getprinterconfig(true);
            } else {
                document.getElementById('config_override_data').innerHTML = content;
                if (is_config_override_file()) {
                    document.getElementById('config_delete_override').style.display = 'none';
                    document.getElementById('config_override_file_name').innerHTML = "Smoothieware";
                } else {
                    document.getElementById('config_override_file_name').innerHTML = "/sd/config-override";
                    document.getElementById('config_delete_override').style.display = 'block';
                }
            }
        } else {
            document.getElementById('config_list_data').innerHTML = content;
        }
    }
    document.getElementById('config_loader').style.display = "none";
    document.getElementById('config_list_content').style.display = "block";
    document.getElementById('config_status').style.display = "none";
    document.getElementById('config_refresh_btn').style.display = "block";
}

function config_check_value(value, index, is_override) {
    var isvalid = true;
    if ((target_firmware == "smoothieware") && !is_override) {
        if ((value.trim()[0] == '-') || (value.length === 0) || (value.toLowerCase().indexOf("#") != -1)) {
            isvalid = false;
            config_error_msg = translate_text_item("cannot have '-', '#' char or be empty");
        }
    }
    if ((target_firmware == "grbl") || (target_firmware == "grbl-embedded")) {
        if ((value.trim()[0] == '-') || (value.length === 0) || (value.toLowerCase().indexOf("#") != -1)) {
            isvalid = false;
            config_error_msg = translate_text_item("cannot have '-', '#' char or be empty");
        }
    } else {
        if ((value.trim()[0] == '-') || (value.length === 0) || ((value.indexOf("e") != -1) && (value.toLowerCase().indexOf("true") == -1) && (value.toLowerCase().indexOf("false") == -1))) {
            isvalid = false;
            config_error_msg = translate_text_item("cannot have '-', 'e' char or be empty");
        }
    }
    return isvalid;
}

function process_config_answer(response_text) {
    var result = true;
    var tlines = response_text.split("\n");
    //console.log(tlines.length);
    if (tlines.length <= 3) {
        if ((target_firmware == "smoothieware") && (commandtxt != "cat /sd/config.txt")) {
            if (!is_override_config) {
                config_file_name = "/sd/config.txt";
                commandtxt = "cat " + config_file_name;
                config_configList = [];
            }
            getprinterconfig();
        } else {
            //console.log("No config file" );
            if ((target_firmware == "smoothieware")) document.getElementById('config_status').innerHTML = translate_text_item("File config / config.txt not found!");
            else document.getElementById('config_status').innerHTML = translate_text_item("Cannot get EEPROM content!");
            result = false;
        }
    } else {
        //console.log("Config has " + tlines.length + " entries");
        var vindex = 0;
        for (var i = 0; i < tlines.length; i++) {
            vindex = create_config_entry(tlines[i], vindex);
        }
        if (vindex > 0) build_HTML_config_list();
        else result = false;
    }

    return result;
}

function create_config_entry(sentry, vindex) {
    var iscomment;
    var ssentry = sentry;
    if (!is_config_entry(ssentry)) return vindex;
    if ((target_firmware == "marlin") || (target_firmware == "marlinkimbra")) {
        if (sentry.startsWith("Config:  ")) ssentry = sentry.replace("Config:", "");
        else ssentry = sentry.replace("Config:", "#");
    }
    if ((target_firmware == "marlin") || (target_firmware == "marlinkimbra") || (target_firmware == "marlin-embedded")) {
        if (sentry.startsWith("echo: ")) ssentry = sentry.replace("echo:", "");
        else ssentry = sentry.replace("echo:", "#");
    }
    while (ssentry.indexOf("\t") > -1) {
        ssentry = ssentry.replace("\t", " ");
    }
    while (ssentry.indexOf("  ") > -1) {
        ssentry = ssentry.replace("  ", " ");
    }
    while (ssentry.indexOf("##") > -1) {
        ssentry = ssentry.replace("##", "#");
    }

    iscomment = is_config_commented(ssentry);
    if (iscomment) {
        while (ssentry.indexOf("<") != -1) {
            var m = ssentry.replace("<", "&lt;");
            ssentry = m.replace(">", "&gt;");
        }
        var config_entry = {
            comment: ssentry,
            showcomment: true,
            index: vindex,
            label: "",
            help: "",
            defaultvalue: "",
            cmd: ""
        };
        if (is_override_config) config_override_List.push(config_entry);
        else config_configList.push(config_entry);
    } else {
        var slabel = get_config_label(ssentry);
        var svalue = get_config_value(ssentry);
        var shelp = get_config_help(ssentry);
        var scmd = get_config_command(ssentry)
        var config_entry = {
            comment: ssentry,
            showcomment: false,
            index: vindex,
            label: slabel,
            help: shelp,
            defaultvalue: svalue,
            cmd: scmd,
            is_override: is_override_config
        };
        if (is_override_config) config_override_List.push(config_entry);
        else config_configList.push(config_entry);
    }
    vindex++;
    return vindex;
}
//check it is valid entry
function is_config_entry(sline) {
    var line = sline.trim();
    if (line.length == 0) return false;
    if ((target_firmware == "marlin") || (target_firmware == "marlinkimbra") || (target_firmware == "marlin-embedded")) {
        if (sline.startsWith("Config:") || sline.startsWith("echo:") || sline.startsWith("\t") || sline.startsWith("  ")) return true
        else return false;
    }
    if (target_firmware == "smoothieware") {
        return true;
    }
    if ((target_firmware == "grbl") || (target_firmware == "grbl-embedded")) {
        if ((line.indexOf("$") == 0) && (line.indexOf("=") != -1)) return true;
        else return false
    }
    //Default repetier
    if (line.indexOf("EPR:") == 0) return true;
    else return false

}

function get_config_label(sline) {
    var tline = sline.trim().split(" ");
    var tsize = tline.length;
    if ((target_firmware == "smoothieware") || (target_firmware == "marlin") || (target_firmware == "marlinkimbra") || (target_firmware == "marlin-embedded")) {
        return tline[0];
    }
    if ((target_firmware == "grbl") || (target_firmware == "grbl-embedded")) {
        var tline2 = sline.trim().split("=");
        return tline2[0];
    }
    if (tsize > 3) {
        var result = "";
        var i = 0;
        for (i = 3; i < tsize; i++) {
            if (tline[i][0] == '[') break;
            result += tline[i] + " ";
        }
        return result;
    }
    return "???";
}

function get_config_value(sline) {
    var tline = sline.trim().split(" ");
    if ((target_firmware == "smoothieware") && !is_override_config) {
        if ((tline.length > 1) && tline[0][0] != '#') return tline[1];
        else return "???";
    }
    if ((target_firmware == "marlin") || (target_firmware == "marlinkimbra") || (target_firmware == "marlin-embedded") || is_override_config) {

        var tline1;
        if (sline.indexOf(";") != -1) tline1 = sline.trim().split(";");
        else tline1 = sline.trim().split("(");
        tline = tline1[0].split(" ");
        var line = "";
        for (var i = 1; i < tline.length; i++) {
            if (line.length > 0) line += " ";
            line += tline[i];
        }
        return line;
    }
    if ((target_firmware == "grbl") || (target_firmware == "grbl-embedded")) {
        var tline2 = sline.trim().split("=");
        if (tline2.length > 1) return tline2[1];
        else return "???";
    }
    if (tline.length > 3) {
        return tline[2];
    } else return "???";
}

function get_config_help(sline) {
    if (is_override_config) return "";
    if (target_firmware == "smoothieware") {
        var pos = sline.indexOf("#");
        if (pos > -1) return sline.slice(pos + 1, sline.length);
        else return "";
    }
    if ((target_firmware == "marlin") || (target_firmware == "marlinkimbra") || (target_firmware == "marlin-embedded")) {
        var tline;
        if (sline.indexOf(";") != -1) {
            tline = sline.trim().split(";");
            if (tline.length > 1) return tline[1];
            else return "";
        } else {
            tline = sline.trim().split("(");
            if (tline.length > 1) {
                var tline2 = tline[1].split(")");
                return tline2[0];
            } else return "";
        }
    }
    if ((target_firmware == "grbl") || (target_firmware == "grbl-embedded")) {
        return inline_help(get_config_label(sline))
    }
    var tline = sline.split("[");
    if (tline.length > 1) {
        var tline2 = tline[1].split("]");
        return tline2[0];
    }
    return "";
}

function get_config_command(sline) {
    var command;
    if ((target_firmware == "smoothieware") && !is_override_config) {
        command = "config-set sd " + get_config_label(sline) + " ";
        return command;
    }
    if ((target_firmware == "marlin") || (target_firmware == "marlinkimbra") || (target_firmware == "marlin-embedded") || is_override_config) {
        command = get_config_label(sline) + " ";
        return command;
    }
    if ((target_firmware == "grbl") || (target_firmware == "grbl-embedded")) {
        command = get_config_label(sline) + "=";
        return command;
    }
    var tline = sline.split(" ");
    if (tline.length > 3) {
        var stype = tline[0].split(":");
        command = "M206 T" + stype[1];
        command += " P" + tline[1];
        if (stype[1] == "3") command += " X";
        else command += " S";
        return command;
    }
    return "; ";
}

function is_config_commented(sline) {
    var line = sline.trim();
    if (line.length == 0) return false;
    if (is_override_config) return line.startsWith(";");
    if ((target_firmware == "marlin") || (target_firmware == "marlinkimbra") || (target_firmware == "marlin-embedded") || (target_firmware == "smoothieware")) {
        return line.startsWith("#");
    }
    return false;
}

function config_revert_to_default(index, is_override) {
    var prefix = "";
    var item = config_configList[index];
    if (is_override) {
        prefix = "_override";
        item = config_override_List[index];
    }
    console.log()
    document.getElementById('config_' + prefix + index).value = item.defaultvalue;
    document.getElementById('btn_config_' + prefix + index).className = "btn btn-default";
    document.getElementById('status_config_' + prefix + index).className = "form-group has-feedback";
    document.getElementById('icon_config_' + prefix + index).innerHTML = "";
}

function is_config_override_file() {
    if (config_override_List.length > 5) {
        for (i = 0; i < 5; i++) {
            if (config_override_List[i].comment.startsWith("; No config override")) return true;
        }
    }
    return false;
}

function configGetvalue(index, is_override) {
    var prefix = "";
    var item = config_configList[index];
    if (is_override) {
        prefix = "_override";
        item = config_override_List[index];
    }
    //remove possible spaces
    value = document.getElementById('config_' + prefix + index).value.trim();
    if (value == item.defaultvalue) return;
    //check validity of value
    var isvalid = config_check_value(value, index, is_override);
    //if not valid show error
    if (!isvalid) {
        document.getElementById('btn_config_' + prefix + index).className = "btn btn-danger";
        document.getElementById('icon_config_' + prefix + index).className = "form-control-feedback has-error ico_feedback";
        document.getElementById('icon_config_' + prefix + index).innerHTML = get_icon_svg("remove");
        document.getElementById('status_config_' + prefix + index).className = "form-group has-feedback has-error";
        alertdlg(translate_text_item("Out of range"), translate_text_item("Value ") + config_error_msg + " !");
    } else {
        //value is ok save it
        var cmd = item.cmd + value;
        config_lastindex = index;
        config_lastindex_is_override = is_override;
        item.defaultvalue = value;
        document.getElementById('btn_config_' + prefix + index).className = "btn btn-success";
        document.getElementById('icon_config_' + prefix + index).className = "form-control-feedback has-success ico_feedback";
        document.getElementById('icon_config_' + prefix + index).innerHTML = get_icon_svg("ok");
        document.getElementById('status_config_' + prefix + index).className = "form-group has-feedback has-success";
        var url = "/command?plain=" + encodeURIComponent(cmd);
        SendGetHttp(url, setESPconfigSuccess, setESPconfigfailed);
    }
}

function config_checkchange(index, is_override) {
    //console.log("check " + "config_"+index);
    var prefix = "";
    var item = config_configList[index];
    if (is_override) {
        prefix = "_override";
        item = config_override_List[index];
    }
    var val = document.getElementById('config_' + prefix + index).value.trim();
    //console.log("value: " + val);
    if (item.defaultvalue == val) {
        document.getElementById('btn_config_' + prefix + index).className = "btn btn-default";
        document.getElementById('icon_config_' + prefix + index).className = "form-control-feedback";
        document.getElementById('icon_config_' + prefix + index).innerHTML = "";
        document.getElementById('status_config_' + prefix + index).className = "form-group has-feedback";
    } else if (config_check_value(val, index, is_override)) {
        document.getElementById('status_config_' + prefix + index).className = "form-group has-feedback has-warning";
        document.getElementById('btn_config_' + prefix + index).className = "btn btn-warning";
        document.getElementById('icon_config_' + prefix + index).className = "form-control-feedback has-warning ico_feedback";
        document.getElementById('icon_config_' + prefix + index).innerHTML = get_icon_svg("warning-sign");
        //console.log("change ok");
    } else {
        //console.log("change bad");
        document.getElementById('btn_config_' + prefix + index).className = "btn btn-danger";
        document.getElementById('icon_config_' + prefix + index).className = "form-control-feedback has-error ico_feedback";
        document.getElementById('icon_config_' + prefix + index).innerHTML = get_icon_svg("remove");
        document.getElementById('status_config_' + prefix + index).className = "form-group has-feedback has-error";
    }

}

function setESPconfigSuccess(response) {
    //console.log(response);
}
var grbl_help = {
    "$0": "Step pulse, microseconds",
    "$1": "Step idle delay, milliseconds",
    "$2": "Step port invert, mask",
    "$3": "Direction port invert, mask",
    "$4": "Step enable invert, boolean",
    "$5": "Limit pins invert, boolean",
    "$6": "Probe pin invert, boolean",
    "$10": "Status report, mask",
    "$11": "Junction deviation, mm",
    "$12": "Arc tolerance, mm",
    "$13": "Report inches, boolean",
    "$20": "Soft limits, boolean",
    "$21": "Hard limits, boolean",
    "$22": "Homing cycle, boolean",
    "$23": "Homing dir invert, mask",
    "$24": "Homing feed, mm/min",
    "$25": "Homing seek, mm/min",
    "$26": "Homing debounce, milliseconds",
    "$27": "Homing pull-off, mm",
    "$30": "Max spindle speed, RPM",
    "$31": "Min spindle speed, RPM",
    "$32": "Laser mode, boolean",
    "$100": "X steps/mm",
    "$101": "Y steps/mm",
    "$102": "Z steps/mm",
    "$103": "A steps/mm",
    "$104": "B steps/mm",
    "$105": "C steps/mm",
    "$110": "X Max rate, mm/min",
    "$111": "Y Max rate, mm/min",
    "$112": "Z Max rate, mm/min",
    "$113": "A Max rate, mm/min",
    "$114": "B Max rate, mm/min",
    "$115": "C Max rate, mm/min",
    "$120": "X Acceleration, mm/sec^2",
    "$121": "Y Acceleration, mm/sec^2",
    "$122": "Z Acceleration, mm/sec^2",
    "$123": "A Acceleration, mm/sec^2",
    "$124": "B Acceleration, mm/sec^2",
    "$125": "C Acceleration, mm/sec^2",
    "$130": "X Max travel, mm",
    "$131": "Y Max travel, mm",
    "$132": "Z Max travel, mm",
    "$133": "A Max travel, mm",
    "$134": "B Max travel, mm",
    "$135": "C Max travel, mm"

};

function inline_help(label) {
    var shelp = "";
    shelp = grbl_help[label];
    if (typeof shelp === 'undefined') shelp = "";
    return translate_text_item(shelp);
}

function setESPconfigfailed(error_code, response) {
    alertdlg(translate_text_item("Set failed"), "Error " + error_code + " :" + response);
    console.log("Error " + error_code + " :" + response);
    var prefix = "";
    if (config_lastindex_is_override) prefix = "_override";
    document.getElementById('btn_config_' + prefix + config_lastindex).className = "btn btn-danger";
    document.getElementById('icon_config_' + prefix + config_lastindex).className = "form-control-feedback has-error ico_feedback";
    document.getElementById('icon_config_' + prefix + config_lastindex).innerHTML = get_icon_svg("remove");
    document.getElementById('status_config_' + prefix + config_lastindex).className = "form-group has-feedback has-error";
}

function getESPconfigSuccess(response) {
    //console.log(response);
    if (!process_config_answer(response)) {
        getESPconfigfailed(406, translate_text_item("Wrong data"));
        document.getElementById('config_loader').style.display = "none";
        document.getElementById('config_list_content').style.display = "block";
        document.getElementById('config_status').style.display = "none";
        document.getElementById('config_refresh_btn').style.display = "block";
        return;
    }
}

function getESPconfigfailed(error_code, response) {
    console.log("Error " + error_code + " :" + response);
    document.getElementById('config_loader').style.display = "none";
    document.getElementById('config_status').style.display = "block";
    document.getElementById('config_status').innerHTML = translate_text_item("Failed:") + error_code + " " + response;
    document.getElementById('config_refresh_btn').style.display = "block";
}
