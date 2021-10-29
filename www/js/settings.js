var setting_configList = [];
var setting_error_msg = "";
var setting_lastindex = -1;
var setting_lastsubindex = -1;
var current_setting_filter = "network";
var setup_is_done = false;
var do_not_build_settings = false;

function refreshSettings(hide_setting_list) {
  if (http_communication_locked) {
    document.getElementById("config_status").innerHTML = translate_text_item(
      "Communication locked by another process, retry later."
    );
    return;
  }
  if (typeof hide_setting_list != "undefined")
    do_not_build_settings = hide_setting_list;
  else do_not_build_settings = false;
  document.getElementById("settings_loader").style.display = "block";
  document.getElementById("settings_list_content").style.display = "none";
  document.getElementById("settings_status").style.display = "none";
  document.getElementById("settings_refresh_btn").style.display = "none";

  setting_configList = [];
  //removeIf(production)
  var response_text =
    '{"EEPROM":[{"F":"network","P":"0","T":"B","V":"2","H":"Wifi mode","O":[{"AP":"1"},{"STA":"2"}]},{"F":"network","P":"1","T":"S","V":"totolink_luc","S":"32","H":"Station SSID","M":"1"},{"F":"network","P":"34","T":"S","V":"********","S":"64","H":"Station Password","M":"0"},{"F":"network","P":"99","T":"B","V":"1","H":"Station IP Mode","O":[{"DHCP":"1"},{"Static":"2"}]},{"F":"network","P":"100","T":"A","V":"192.168.0.1","H":"Station Static IP"},{"F":"network","P":"104","T":"A","V":"255.255.255.0","H":"Station Static Mask"},{"F":"network","P":"108","T":"A","V":"192.168.0.12","H":"Station Static Gateway"},{"F":"network","P":"130","T":"S","V":"lucesp","H":"Hostname" ,"S":"32", "M":"1"},{"F":"network","P":"112","T":"I","V":"115200","H":"Baud Rate","O":[{"9600":"9600"},{"19200":"19200"},{"38400":"38400"},{"57600":"57600"},{"115200":"115200"},{"230400":"230400"},{"250000":"250000"}]},{"F":"network","P":"116","T":"B","V":"2","H":"Station Network Mode","O":[{"11b":"1"},{"11g":"2"},{"11n":"3"}]},{"F":"network","P":"117","T":"B","V":"0","H":"Sleep Mode","O":[{"None":"0"},{"Light":"1"},{"Modem":"2"}]},{"F":"network","P":"118","T":"B","V":"9","H":"AP Channel","O":[{"1":"1"},{"2":"2"},{"3":"3"},{"4":"4"},{"5":"5"},{"6":"6"},{"7":"7"},{"8":"8"},{"9":"9"},{"10":"10"},{"11":"11"}]},{"F":"network","P":"119","T":"B","V":"2","H":"Authentication","O":[{"Open":"0"},{"WPA":"2"},{"WPA2":"3"},{"WPA/WPA2":"4"}]},{"F":"network","P":"120","T":"B","V":"1","H":"SSID Visible","O":[{"No":"0"},{"Yes":"1"}]},{"F":"network","P":"121","T":"I","V":"80","H":"Web Port","S":"65001","M":"1"},{"F":"network","P":"125","T":"I","V":"8881","H":"Data Port","S":"65001","M":"1"},{"F":"network","P":"176","T":"S","V":"********","S":"16","H":"Admin Password","M":"1"},{"F":"network","P":"197","T":"S","V":"********","S":"16","H":"User Password","M":"1"},{"F":"network","P":"218","T":"S","V":"MYESP","S":"32","H":"AP SSID","M":"1"},{"F":"network","P":"251","T":"S","V":"********","S":"64","H":"AP Password","M":"0"},{"F":"network","P":"329","T":"B","V":"2","H":"AP IP Mode","O":[{"DHCP":"1"},{"Static":"2"}]},{"F":"network","P":"316","T":"A","V":"192.168.0.1","H":"AP Static IP"},{"F":"network","P":"320","T":"A","V":"255.255.255.0","H":"AP Static Mask"},{"F":"network","P":"324","T":"A","V":"192.168.0.1","H":"AP Static Gateway"},{"F":"network","P":"330","T":"B","V":"1","H":"AP Network Mode","O":[{"11b":"1"},{"11g":"2"}]},{"F":"printer","P":"461","T":"B","V":"4","H":"TargetFW","O":[{"Repetier":"5"},{"Repetier for Davinci":"1"},{"Marlin":"2"},{"MarlinKimbra":"3"},{"Smoothieware":"4"},{"Unknown":"0"}]},{"F":"printer","P":"129","T":"B","V":"3","H":"Temperature Refresh Time","S":"99","M":"0"},{"F":"printer","P":"164","T":"I","V":"1500","H":"XY feedrate","S":"9999","M":"1"},{"F":"printer","P":"168","T":"I","V":"110","H":"Z feedrate","S":"9999","M":"1"},{"F":"printer","P":"172","T":"I","V":"400","H":"E feedrate","S":"9999","M":"1"},{"F":"printer","P":"331","T":"S","V":"NO","S":"128","H":"Camera address","M":"0"},{"F":"printer","P":"460","T":"B","V":"3","H":"Position Refresh Time","S":"99","M":"0"}]}';
  getESPsettingsSuccess(response_text);
  return;
  //endRemoveIf(production)
  var url = "/command?plain=" + encodeURIComponent("[ESP400]");
  SendGetHttp(url, getESPsettingsSuccess, getESPsettingsfailed);
}

function build_select_flag_for_setting_list(index, subindex) {
  var html = "";
  var flag = (html +=
    "<select class='form-control' id='setting_" +
    index +
    "_" +
    subindex +
    "' onchange='setting_checkchange(" +
    index +
    "," +
    subindex +
    ")' >");
  html += "<option value='1'";
  var tmp = setting_configList[index].defaultvalue;
  tmp |= settings_get_flag_value(index, subindex);
  if (tmp == setting_configList[index].defaultvalue) html += " selected ";
  html += ">";
  html += translate_text_item("Disable", true);
  html += "</option>\n";
  html += "<option value='0'";
  var tmp = setting_configList[index].defaultvalue;
  tmp &= ~settings_get_flag_value(index, subindex);
  if (tmp == setting_configList[index].defaultvalue) html += " selected ";
  html += ">";
  html += translate_text_item("Enable", true);
  html += "</option>\n";
  html += "</select>\n";
  //console.log("default:" + setting_configList[index].defaultvalue);
  //console.log(html);
  return html;
}

function build_select_for_setting_list(index, subindex) {
  var html =
    "<select class='form-control input-min wauto' id='setting_" +
    index +
    "_" +
    subindex +
    "' onchange='setting_checkchange(" +
    index +
    "," +
    subindex +
    ")' >";
  for (var i = 0; i < setting_configList[index].Options.length; i++) {
    html += "<option value='" + setting_configList[index].Options[i].id + "'";
    if (
      setting_configList[index].Options[i].id ==
      setting_configList[index].defaultvalue
    )
      html += " selected ";
    html += ">";
    html += translate_text_item(
      setting_configList[index].Options[i].display,
      true
    );
    //Ugly workaround for OSX Chrome and Safari
    if (browser_is("MacOSX"))
      html += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    html += "</option>\n";
  }
  html += "</select>\n";
  //console.log("default:" + setting_configList[index].defaultvalue);
  //console.log(html);
  return html;
}

function getFWshortnamefromid(value) {
  var response = 0;
  if (value == 1) response = "repetier4davinci";
  else if (value == 5) response = "repetier";
  else if (value == 2) response = "marlin";
  else if (value == 3) response = "marlinkimbra";
  else if (value == 4) response = "smoothieware";
  else if (value == 6) response = "grbl";
  else response = "???";
  return response;
}

function update_UI_setting() {
  for (var i = 0; i < setting_configList.length; i++) {
    switch (setting_configList[i].pos) {
      //EP_TARGET_FW		461
      case "461":
        target_firmware = getFWshortnamefromid(
          setting_configList[i].defaultvalue
        );
        update_UI_firmware_target();
        init_files_panel(false);
        break;
      // EP_IS_DIRECT_SD   850
      case "850":
        direct_sd = setting_configList[i].defaultvalue == 1 ? true : false;
        update_UI_firmware_target();
        init_files_panel(false);
        break;
      case "130":
        //set title using hostname
        Set_page_title(setting_configList[i].defaultvalue);
        break;
    }
  }
}
//to generate setting editor in setting or setup
function build_control_from_index(index, extra_set_function) {
  var i = index;
  var content = "<table>";
  if (i < setting_configList.length) {
    var nbsub = 1;
    if (setting_configList[i].type == "F") {
      nbsub = setting_configList[i].Options.length;
    }
    for (var sub_element = 0; sub_element < nbsub; sub_element++) {
      if (sub_element > 0) {
        content += "<tr><td style='height:10px;'></td></tr>";
      }
      content += "<tr><td style='vertical-align: middle;'>";
      if (setting_configList[i].type == "F") {
        content += translate_text_item(
          setting_configList[i].Options[sub_element].display,
          true
        );
        content += "</td><td>&nbsp;</td><td>";
      }

      content +=
        "<div id='status_setting_" +
        i +
        "_" +
        sub_element +
        "' class='form-group has-feedback' style='margin: auto;'>";
      content += "<div class='item-flex-row'>";
      content += "<table><tr><td>";
      content += "<div class='input-group'>";
      content += "<div class='input-group-btn'>";
      content +=
        "<button class='btn btn-default btn-svg' onclick='setting_revert_to_default(" +
        i +
        "," +
        sub_element +
        ")' >";
      content += get_icon_svg("repeat");
      content += "</button>";
      content += "</div>";
      content += "<input class='hide_it'></input>";
      content += "</div>";
      content += "</td><td>";
      content += "<div class='input-group'>";
      content += "<span class='input-group-addon hide_it' ></span>";
      //flag
      if (setting_configList[i].type == "F") {
        //console.log(setting_configList[i].label + " " + setting_configList[i].type);
        //console.log(setting_configList[i].Options.length);
        content += build_select_flag_for_setting_list(i, sub_element);
      }
      //drop list
      else if (setting_configList[i].Options.length > 0) {
        content += build_select_for_setting_list(i, sub_element);
      }
      //text
      else {
        content +=
          "<input id='setting_" +
          i +
          "_" +
          sub_element +
          "' type='text' class='form-control input-min'  value='" +
          setting_configList[i].defaultvalue +
          "' onkeyup='setting_checkchange(" +
          i +
          "," +
          sub_element +
          ")' >";
      }
      content +=
        "<span id='icon_setting_" +
        i +
        "_" +
        sub_element +
        "'class='form-control-feedback ico_feedback'></span>";
      content += "<span class='input-group-addon hide_it' ></span>";
      content += "</div>";
      content += "</td></tr></table>";
      content += "<div class='input-group'>";
      content += "<input class='hide_it'></input>";
      content += "<div class='input-group-btn'>";
      content +=
        "<button  id='btn_setting_" +
        i +
        "_" +
        sub_element +
        "' class='btn btn-default' onclick='settingsetvalue(" +
        i +
        "," +
        sub_element +
        ");";
      if (typeof extra_set_function != "undefined") {
        content += extra_set_function + "(" + i + ");";
      }
      content +=
        "' translate english_content='Set' >" +
        translate_text_item("Set") +
        "</button>";
      if (setting_configList[i].pos == EP_STA_SSID) {
        content +=
          "<button class='btn btn-default btn-svg' onclick='scanwifidlg(\"" +
          i +
          '","' +
          sub_element +
          "\")'>";
        content += get_icon_svg("search");
        content += "</button>";
      }
      content += "</div>";
      content += "</div>";
      content += "</div>";
      content += "</div>";
      content += "</td></tr>";
    }
  }
  content += "</table>";
  return content;
}

//get setting UI for specific component instead of parse all
function get_index_from_eeprom_pos(pos) {
  for (var i = 0; i < setting_configList.length; i++) {
    if (pos == setting_configList[i].pos) {
      return i;
    }
  }
  console.log("Cannot find:", pos);
  return -1;
}

function build_HTML_setting_list(filter) {
  //this to prevent concurent process to update after we clean content
  if (do_not_build_settings) return;
  var content = "";
  current_setting_filter = filter;
  document.getElementById(
    current_setting_filter + "_setting_filter"
  ).checked = true;
  for (var i = 0; i < setting_configList.length; i++) {
    if (
      setting_configList[i].F.trim().toLowerCase() == filter ||
      filter == "all"
    ) {
      content += "<tr>";
      content += "<td style='vertical-align:middle'>";
      content += translate_text_item(setting_configList[i].label, true);
      content += "</td>";
      content += "<td style='vertical-align:middle'>";
      content +=
        "<table><tr><td>" + build_control_from_index(i) + "</td></tr></table>";
      content += "</td>";
      content += "</tr>\n";
    }
  }
  if (content.length > 0)
    document.getElementById("settings_list_data").innerHTML = content;
}

function setting_check_value(value, index, subindex) {
  var valid = true;
  var entry = setting_configList[index];
  //console.log("checking value");
  if (entry.type == "F") return valid;
  //does it part of a list?
  if (entry.Options.length > 0) {
    var in_list = false;
    for (var i = 0; i < entry.Options.length; i++) {
      //console.log("checking *" + entry.Options[i].id + "* and *"+ value + "*" );
      if (entry.Options[i].id == value) in_list = true;
    }
    valid = in_list;
    if (!valid) setting_error_msg = " in provided list";
  }
  //check byte / integer
  if (entry.type == "B" || entry.type == "I") {
    //cannot be empty
    value.trim();
    if (value.length == 0) valid = false;
    //check minimum?
    if (parseInt(entry.min_val) > parseInt(value)) valid = false;
    //check maximum?
    if (parseInt(entry.max_val) < parseInt(value)) valid = false;
    if (!valid)
      setting_error_msg = " between " + entry.min_val + " and " + entry.max_val;
    if (isNaN(value)) valid = false;
  } else if (entry.type == "S") {
    //check minimum?
    if (entry.min_val > value.length) valid = false;
    //check maximum?
    if (entry.max_val < value.length) valid = false;
    if (value == "********") valid = false;
    if (!valid)
      setting_error_msg =
        " between " +
        entry.min_val +
        " char(s) and " +
        entry.max_val +
        " char(s) long, and not '********'";
  } else if (entry.type == "A") {
    //check ip address
    var ipformat =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!value.match(ipformat)) {
      valid = false;
      setting_error_msg = " a valid IP format (xxx.xxx.xxx.xxx)";
    }
  }
  return valid;
}

function process_settings_answer(response_text) {
  var result = true;
  try {
    var response = JSON.parse(response_text);
    if (typeof response.EEPROM == "undefined") {
      result = false;
      console.log("No EEPROM");
    } else {
      //console.log("EEPROM has " + response.EEPROM.length + " entries");
      if (response.EEPROM.length > 0) {
        var vindex = 0;
        for (var i = 0; i < response.EEPROM.length; i++) {
          vindex = create_setting_entry(response.EEPROM[i], vindex);
        }
        if (vindex > 0) {
          if (setup_is_done) build_HTML_setting_list(current_setting_filter);
          update_UI_setting();
        } else result = false;
      } else result = false;
    }
  } catch (e) {
    console.error("Parsing error:", e);
    result = false;
  }
  return result;
}

function create_setting_entry(sentry, vindex) {
  if (!is_setting_entry(sentry)) return vindex;
  var slabel = sentry.H;
  var svalue = sentry.V;
  var scmd = "[ESP401]P=" + sentry.P + " T=" + sentry.T + " V=";
  var options = [];
  var min;
  var max;
  if (typeof sentry.M !== "undefined") {
    min = sentry.M;
  } else {
    //add limit according the type
    if (sentry.T == "B") min = -127;
    else if (sentry.T == "S") min = 0;
    else if (sentry.T == "A") min = 7;
    else if (sentry.T == "I") min = 0;
  }
  if (typeof sentry.S !== "undefined") {
    max = sentry.S;
  } else {
    //add limit according the type
    if (sentry.T == "B") max = 255;
    else if (sentry.T == "S") max = 255;
    else if (sentry.T == "A") max = 15;
    else if (sentry.T == "I") max = 2147483647;
  }
  //list possible options if defined
  if (typeof sentry.O !== "undefined") {
    for (var i in sentry.O) {
      var key = i;
      var val = sentry.O[i];
      for (var j in val) {
        var sub_key = j;
        var sub_val = val[j];
        sub_val = sub_val.trim();
        sub_key = sub_key.trim();
        var option = {
          id: sub_val,
          display: sub_key,
        };
        options.push(option);
        //console.log("*" + sub_key + "* and *" + sub_val + "*");
      }
    }
  }
  svalue = svalue.trim();
  //create entry in list
  var config_entry = {
    index: vindex,
    F: sentry.F,
    label: slabel,
    defaultvalue: svalue,
    cmd: scmd,
    Options: options,
    min_val: min,
    max_val: max,
    type: sentry.T,
    pos: sentry.P,
  };
  setting_configList.push(config_entry);
  vindex++;
  return vindex;
}
//check it is valid entry
function is_setting_entry(sline) {
  if (
    typeof sline.T === "undefined" ||
    typeof sline.V === "undefined" ||
    typeof sline.P === "undefined" ||
    typeof sline.H === "undefined"
  ) {
    return false;
  }
  return true;
}

function settings_get_flag_value(index, subindex) {
  var flag = 0;
  if (setting_configList[index].type != "F") return -1;
  if (setting_configList[index].Options.length <= subindex) return -1;
  flag = parseInt(setting_configList[index].Options[subindex].id);
  return flag;
}

function settings_get_flag_description(index, subindex) {
  if (setting_configList[index].type != "F") return -1;
  if (setting_configList[index].Options.length <= subindex) return -1;
  return setting_configList[index].Options[subindex].display;
}

function setting_revert_to_default(index, subindex) {
  var sub = 0;
  if (typeof subindex != "undefined") sub = subindex;
  if (setting_configList[index].type == "F") {
    var flag = settings_get_flag_value(index, subindex);
    var enabled = 0;
    var tmp = parseInt(setting_configList[index].defaultvalue);
    tmp |= flag;
    if (tmp == parseInt(setting_configList[index].defaultvalue))
      document.getElementById("setting_" + index + "_" + sub).value = "1";
    else document.getElementById("setting_" + index + "_" + sub).value = "0";
  } else
    document.getElementById("setting_" + index + "_" + sub).value =
      setting_configList[index].defaultvalue;
  document.getElementById("btn_setting_" + index + "_" + sub).className =
    "btn btn-default";
  document.getElementById("status_setting_" + index + "_" + sub).className =
    "form-group has-feedback";
  document.getElementById("icon_setting_" + index + "_" + sub).innerHTML = "";
}

function settingsetvalue(index, subindex) {
  var sub = 0;
  if (typeof subindex != "undefined") sub = subindex;
  //remove possible spaces
  value = document.getElementById("setting_" + index + "_" + sub).value.trim();
  //Apply flag here
  if (setting_configList[index].type == "F") {
    var tmp = setting_configList[index].defaultvalue;
    if (value == "1") {
      tmp |= settings_get_flag_value(index, subindex);
    } else {
      tmp &= ~settings_get_flag_value(index, subindex);
    }
    value = tmp;
  }
  if (value == setting_configList[index].defaultvalue) return;
  //check validity of value
  var isvalid = setting_check_value(value, index, subindex);
  //if not valid show error
  if (!isvalid) {
    setsettingerror(index);
    alertdlg(
      translate_text_item("Out of range"),
      translate_text_item("Value must be ") + setting_error_msg + " !"
    );
  } else {
    //value is ok save it
    var cmd = setting_configList[index].cmd + value;
    setting_lastindex = index;
    setting_lastsubindex = subindex;
    setting_configList[index].defaultvalue = value;
    document.getElementById("btn_setting_" + index + "_" + sub).className =
      "btn btn-success";
    document.getElementById("icon_setting_" + index + "_" + sub).className =
      "form-control-feedback has-success ico_feedback";
    document.getElementById("icon_setting_" + index + "_" + sub).innerHTML =
      get_icon_svg("ok");
    document.getElementById("status_setting_" + index + "_" + sub).className =
      "form-group has-feedback has-success";
    var url = "/command?plain=" + encodeURIComponent(cmd);
    SendGetHttp(url, setESPsettingsSuccess, setESPsettingsfailed);
  }
}

function setting_checkchange(index, subindex) {
  //console.log("list value changed");
  var val = document
    .getElementById("setting_" + index + "_" + subindex)
    .value.trim();
  if (setting_configList[index].type == "F") {
    //console.log("it is flag value");
    var tmp = setting_configList[index].defaultvalue;
    if (val == "1") {
      tmp |= settings_get_flag_value(index, subindex);
    } else {
      tmp &= ~settings_get_flag_value(index, subindex);
    }
    val = tmp;
  }
  //console.log("value: " + val);
  //console.log("default value: " + setting_configList[index].defaultvalue);
  if (setting_configList[index].defaultvalue == val) {
    console.log("values are identical");
    document.getElementById("btn_setting_" + index + "_" + subindex).className =
      "btn btn-default";
    document.getElementById(
      "icon_setting_" + index + "_" + subindex
    ).className = "form-control-feedback";
    document.getElementById(
      "icon_setting_" + index + "_" + subindex
    ).innerHTML = "";
    document.getElementById(
      "status_setting_" + index + "_" + subindex
    ).className = "form-group has-feedback";
  } else if (setting_check_value(val, index, subindex)) {
    //console.log("Check passed");
    setsettingchanged(index, subindex);
  } else {
    console.log("change bad");
    setsettingerror(index, subindex);
  }
}

function setsettingchanged(index, subindex) {
  document.getElementById(
    "status_setting_" + index + "_" + subindex
  ).className = "form-group has-feedback has-warning";
  document.getElementById("btn_setting_" + index + "_" + subindex).className =
    "btn btn-warning";
  document.getElementById("icon_setting_" + index + "_" + subindex).className =
    "form-control-feedback has-warning ico_feedback";
  document.getElementById("icon_setting_" + index + "_" + subindex).innerHTML =
    get_icon_svg("warning-sign");
}

function setsettingerror(index, subindex) {
  document.getElementById("btn_setting_" + index + "_" + subindex).className =
    "btn btn-danger";
  document.getElementById("icon_setting_" + index + "_" + subindex).className =
    "form-control-feedback has-error ico_feedback";
  document.getElementById("icon_setting_" + index + "_" + subindex).innerHTML =
    get_icon_svg("remove");
  document.getElementById(
    "status_setting_" + index + "_" + subindex
  ).className = "form-group has-feedback has-error";
}

function setESPsettingsSuccess(response) {
  //console.log(response);
  update_UI_setting();
}

function setESPsettingsfailed(error_code, response) {
  alertdlg(
    translate_text_item("Set failed"),
    "Error " + error_code + " :" + response
  );
  console.log("Error " + error_code + " :" + response);
  document.getElementById(
    "btn_setting_" + setting_lastindex + "_" + setting_lastsubindex
  ).className = "btn btn-danger";
  document.getElementById(
    "icon_setting_" + setting_lastindex + "_" + setting_lastsubindex
  ).className = "form-control-feedback has-error ico_feedback";
  document.getElementById(
    "icon_setting_" + setting_lastindex + "_" + setting_lastsubindex
  ).innerHTML = get_icon_svg("remove");
  document.getElementById(
    "status_setting_" + setting_lastindex + "_" + setting_lastsubindex
  ).className = "form-group has-feedback has-error";
}

function getESPsettingsSuccess(response) {
  console.log(response);
  if (!process_settings_answer(response)) {
    getESPsettingsfailed(406, translate_text_item("Wrong data"));
    console.log(response);
    return;
  }
  document.getElementById("settings_loader").style.display = "none";
  document.getElementById("settings_list_content").style.display = "block";
  document.getElementById("settings_status").style.display = "none";
  document.getElementById("settings_refresh_btn").style.display = "block";
}

function getESPsettingsfailed(error_code, response) {
  console.log("Error " + error_code + " :" + response);
  document.getElementById("settings_loader").style.display = "none";
  document.getElementById("settings_status").style.display = "block";
  document.getElementById("settings_status").innerHTML =
    translate_text_item("Failed:") + error_code + " " + response;
  document.getElementById("settings_refresh_btn").style.display = "block";
}

function restart_esp() {
  confirmdlg(
    translate_text_item("Please Confirm"),
    translate_text_item("Restart ESP3D"),
    process_restart_esp
  );
}

function process_restart_esp(answer) {
  if (answer == "yes") {
    restartdlg();
  }
}
