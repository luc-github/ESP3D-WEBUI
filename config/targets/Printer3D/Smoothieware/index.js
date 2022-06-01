/*
 index.js - ESP3D WebUI Target file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.

 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public
 License along with This code; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

const chalk = require("chalk")
const wscolor = chalk.cyan
const expresscolor = chalk.green
const commandcolor = chalk.white
const enableAuthentication = false
let lastconnection = Date.now()
let logindone = false
const sessiontTime = 60000
const roomTemperature = 20
const temperatures = {
    T: [
        {
            value: roomTemperature,
            target: 0,
            lastTime: -1,
            heatspeed: 0.6,
            coolspeed: 0.8,
            variation: 0.5,
        },
        {
            value: 20,
            target: 0,
            lastTime: -1,
            heatspeed: 0.6,
            coolspeed: 0.8,
            variation: 0.5,
        },
    ],
    B: [
        {
            value: roomTemperature,
            target: 0,
            lastTime: -1,
            heatspeed: 0.2,
            coolspeed: 0.8,
            variation: 0.5,
        },
    ],
    C: [
        {
            value: roomTemperature,
            target: 0,
            lastTime: -1,
            heatspeed: 0.6,
            coolspeed: 0.8,
            variation: 0.5,
        },
    ],
    P: [{ value: roomTemperature, sameas: "T", lastTime: -1, variation: 0.5 }], //let say probe is 50% of extruder temperature
    R: [{ value: roomTemperature, sameas: "T", lastTime: -1, variation: 1 }], //the redondant is same as extruder 0
    M: [{ value: roomTemperature, lastTime: -1, variation: 1 }], //the motherboard is same as room temperature +5/10 degres
}

const updateTemperature = (entry, time) => {
    if (entry.lastTime == -1) {
        entry.lastTime = time
    }

    const v = Math.random() * 5
    //heater
    if (typeof entry.target != "undefined") {
        const target = entry.target == 0 ? roomTemperature : entry.target
        if (entry.value + 5 < target) {
            entry.value =
                entry.value + (entry.heatspeed * (time - entry.lastTime)) / 1000
        } else if (entry.value - 5 > target) {
            entry.value =
                entry.value - (entry.coolspeed * (time - entry.lastTime)) / 1000
        } else if (target - 2 < entry.value && entry.value < target + 2) {
            entry.value = target + entry.variation * (Math.random() - 0.5)
        } else if (entry.value < target) {
            entry.value =
                entry.value +
                ((entry.heatspeed / 3) * (time - entry.lastTime)) / 1000
        } else {
            entry.value =
                entry.value -
                ((entry.coolspeed / 3) * (time - entry.lastTime)) / 1000
        }
    }
    //sensor
    else if (typeof entry.sameas != "undefined") {
        if (
            entry.sameas == "T" &&
            entry.variation == 0.5 &&
            entry.value < 2 * roomTemperature
        ) {
            //probe is same as room temperature if under 40 degres
            entry.value =
                v > 2.5 ? roomTemperature + v / 2 : roomTemperature - v / 2
        } else {
            entry.value =
                v > 2.5
                    ? temperatures[entry.sameas][0].value * entry.variation +
                      v / 4
                    : temperatures[entry.sameas][0].value * entry.variation -
                      v / 4
        }
    } else {
        entry.value =
            v > 2.5 ? roomTemperature + v / 2 : roomTemperature - v / 2
    }
    entry.lastTime = time
}

function getLastconnection() {
    return lastconnection
}

function hasEnabledAuthentication() {
    return enableAuthentication
}

function Temperatures() {
    Object.keys(temperatures).map((tool) => {
        temperatures[tool].map((entry) => {
            updateTemperature(entry, new Date())
        })
    })
    const result =
        "ok T:" +
        Number(temperatures["T"][0].value).toFixed(2) +
        " /" +
        Number(temperatures["T"][0].target).toFixed(2) +
        " @0 B:" +
        Number(temperatures["B"][0].value).toFixed(2) +
        " /" +
        Number(temperatures["B"][0].target).toFixed(2) +
        "@0 T1:" +
        Number(temperatures["T"][1].value).toFixed(2) +
        " /" +
        Number(temperatures["T"][1].target).toFixed(2) +
        " @0\n"
    console.log(result)
    return result
}

const commandsQuery = (req, res, SendWS) => {
    let url = req.query.cmd ? req.query.cmd : req.originalUrl
    if (req.query.cmd)
        console.log(commandcolor(`[server]/command params: ${req.query.cmd}`))
    else console.log(commandcolor(`[server]/command : ${url}`))
    if (url.indexOf("PING") != -1) {
        lastconnection = Date.now()
        res.status(200)
        res.send("ok\n")
        console.log(commandcolor(`[server]/command :PING`))
        return
    }

    if (!logindone && enableAuthentication) {
        res.status(401)
        return
    }
    lastconnection = Date.now()

    if (url.indexOf("M114") != -1) {
        let X = Number(Math.random() * 200.12).toFixed(2)
        let Y = Number(Math.random() * 200.12).toFixed(2)
        let Z = Number(Math.random() * 200.12).toFixed(2)
        SendWS(`ok C: X:${X} Y:${Y} Z:${Z} E:0.0000\n`)
        res.send("")
        return
    }
    if (url.indexOf("SIM:") != -1) {
        const response = url.substring(url.indexOf("SIM:") + 4)
        SendWS(response + "\n" + "ok\n")
        res.send("")
        return
    }
    if (url.indexOf("ls -s /sd") != -1) {
        if (url.indexOf("echo BeginFiles") != -1) SendWS("echo: BeginFiles\n")
        SendWS(
            "found.000/\n" +
                "t2.g 112023\n" +
                "calibration/\n" +
                "firmware.cur 391256\n" +
                "config-override 1010\n" +
                "pattern-holder.gcode 9754891\n" +
                "system volume information/\n" +
                "pattern-holder2.gcode 9754891\n" +
                "config.txt 23136\n" +
                "webif/\n" +
                "acerlogo.jpeg 6257\n" +
                "a.dat 6257\n" +
                "firmware.cur.printer 389776\n"
        )
        if (url.indexOf("echo EndFiles") != -1) SendWS("echo: EndFiles\n")
        res.send("")
        return
    }

    if (url.indexOf("ls -s /ext") != -1) {
        if (url.indexOf("echo BeginFiles") != -1) SendWS("echo: BeginFiles\n")
        SendWS(
            "system volume information/\n" +
                "pattern-holder2.gcode 9754891\n" +
                "config.txt 23136\n" +
                "webif/\n" +
                "acerlogo.jpeg 6257\n" +
                "a.dat 6257\n" +
                "firmware.cur.printer 389776\n"
        )
        if (url.indexOf("echo EndFiles") != -1) SendWS("echo: EndFiles\n")
        res.send("")
        return
    }

    if (url.indexOf("M20") != -1) {
        SendWS(
            "Begin file list\n" +
                "found.000/\n" +
                "t2.g\n" +
                "calibration/\n" +
                "firmware.cur\n" +
                "config-override\n" +
                "pattern-holder.gcode\n" +
                "system volume information/\n" +
                "pattern-holder2.gcode\n" +
                "config.txt\n" +
                "webif/\n" +
                "acerlogo.jpeg\n" +
                "a.dat\n" +
                "firmware.cur.printer\n" +
                "End file list\n" +
                "ok\n"
        )
        res.send("")
        return
    }

    if (url.startsWith("echo ")) {
        console.log("yes")
        const response = url.replace("echo ", "echo: ")
        console.log("Resp:", response)
        SendWS(response + "\n")
        res.send("")
        return
    }
    if (url.indexOf("M30") != -1) {
        const name = url.split(" ")
        SendWS(
            //"Deletion failed, File:" + name[1].substring(1) + ".\n" + "ok\n"
            "File deleted:" + name[1].substring(1) + "\n" + "ok\n"
        )

        res.send("")
        return
    }

    if (url.indexOf("M140") != -1) {
        const reg_ex_temp = /S([0-9]*\.?[0-9]*)/
        const result_target = reg_ex_temp.exec(url)
        temperatures["B"][0].target = parseFloat(result_target[1])
        res.send("")
        return
    }

    if (url.indexOf("M104") != -1) {
        const reg_ex_temp = /S([0-9]*\.?[0-9]*)/
        const reg_ex_index = /T([0-9])/
        const result_target = reg_ex_temp.exec(url)
        const result_index = reg_ex_index.exec(url)
        console.log(result_target[1], result_index[1])
        temperatures["T"][result_index[1]].target = parseFloat(result_target[1])
        res.send("")
        return
    }
    if (url.indexOf("M115") != -1) {
        SendWS(
            "FIRMWARE_NAME:Smoothieware, FIRMWARE_URL:http%3A//smoothieware.org, X-SOURCE_CODE_URL:https://github.com/Smoothieware/Smoothieware, FIRMWARE_VERSION:edge-0565b13, PROTOCOL_VERSION:1.0, X-FIRMWARE_BUILD_DATE:Jun 19 2021 16:12:18, X-SYSTEM_CLOCK:100MHz, X-AXES:5, X-GRBL_MODE:0, X-ARCS:1, X-CNC:0, X-MSD:1, X-WARNING:deprecated_MCU\nok\n"
        )
        res.send("")
        return
    }
    if (url.indexOf("cat /sd/config") != -1) {
        SendWS(
            "# Robot module configurations : general handling of movement G-codes and slicing into moves\n" +
                "default_feed_rate                            1000             # Default rate ( mm/minute ) for G1/G2/G3 moves\n" +
                "default_seek_rate                            1000             # Default rate ( mm/minute ) for G0 moves\n" +
                "mm_per_arc_segment                           0.5              # Arcs are cut into segments ( lines ), this is the length for these segments.  Smaller values mean more resolution, higher values mean faster computation\n" +
                "#mm_per_line_segment                          5                # Lines can be cut into segments ( not usefull with cartesian coordinates robots ).\n" +
                "\n" +
                "# Arm solution configuration : Cartesian robot. Translates mm positions into stepper positions\n" +
                "alpha_steps_per_mm                           80               # Steps per mm for alpha stepper\n" +
                "beta_steps_per_mm                            80               # Steps per mm for beta stepper\n" +
                "gamma_steps_per_mm                           1637.7953        # Steps per mm for gamma stepper\n" +
                "\n" +
                "# Planner module configuration : Look-ahead and acceleration configuration\n" +
                "planner_queue_size                           32               # DO NOT CHANGE THIS UNLESS YOU KNOW EXACTLY WHAT YOUR ARE DOING\n" +
                "acceleration                                 1000             # Acceleration in mm/second/second.\n" +
                "#z_acceleration                              60              # Acceleration for Z only moves in mm/s^2, 0 disables it, disabled by default. DO NOT SET ON A DELTA\n" +
                "acceleration_ticks_per_second                1000             # Number of times per second the speed is updated\n" +
                'junction_deviation                           0.05             # Similar to the old "max_jerk", in millimeters, see : https://github.com/grbl/grbl/blob/master/planner.c#L409\n' +
                "                                                              # and https://github.com/grbl/grbl/wiki/Configuring-Grbl-v0.8 . Lower values mean being more careful, higher values means being faster and have more jerk\n" +
                "\n" +
                "# Stepper module configuration\n" +
                "microseconds_per_step_pulse                  1                # Duration of step pulses to stepper drivers, in microseconds\n" +
                "base_stepping_frequency                      100000           # Base frequency for stepping\n" +
                "\n" +
                '# Stepper module pins ( ports, and pin numbers, appending "!" to the number will invert a pin )\n' +
                "alpha_step_pin                               2.1              # Pin for alpha stepper step signal\n" +
                "alpha_dir_pin                                0.11             # Pin for alpha stepper direction\n" +
                "alpha_en_pin                                 0.10            # Pin for alpha enable pin 0.10\n" +
                "alpha_current                                1.0              # X stepper motor current\n" +
                "x_axis_max_speed                             1000            # mm/min\n" +
                "alpha_max_rate                               1000.0          # mm/min actuator max speed\n" +
                "\n" +
                "beta_step_pin                                2.2              # Pin for beta stepper step signal\n" +
                "beta_dir_pin                                 0.20             # Pin for beta stepper direction\n" +
                "beta_en_pin                                  0.19             # Pin for beta enable\n" +
                "beta_current                                 1.0              # Y stepper motor current\n" +
                "y_axis_max_speed                             1000            # mm/min\n" +
                "beta_max_rate                                1000.0          # mm/min actuator max speed\n" +
                "\n" +
                "gamma_step_pin                               2.3              # Pin for gamma stepper step signal\n" +
                "gamma_dir_pin                                0.22             # Pin for gamma stepper direction\n" +
                "gamma_en_pin                                 0.21             # Pin for gamma enable\n" +
                "gamma_current                                1.0              # Z stepper motor current\n" +
                "z_axis_max_speed                             60              # mm/min\n" +
                "gamma_max_rate                               60.0            # mm/min actuator max speed\n" +
                "\n" +
                "# Serial communications configuration ( baud rate default to 9600 if undefined )\n" +
                "uart0.baud_rate                              115200           # Baud rate for the default hardware serial port\n" +
                "second_usb_serial_enable                     false            # This enables a second usb serial port (to have both pronterface and a terminal connected)\n" +
                "msd_disable                                 true            # disable the MSD (USB SDCARD) when set to true\n" +
                "\n" +
                "\n" +
                "# Extruder module configuration\n" +
                "extruder.hotend.enable                          true             # Whether to activate the extruder module at all. All configuration is ignored if false\n" +
                "#extruder.hotend.steps_per_mm                    140              # Steps per mm for extruder stepper\n" +
                "#extruder.hotend.default_feed_rate               600              # Default rate ( mm/minute ) for moves where only the extruder moves\n" +
                "#extruder.hotend.acceleration                    500              # Acceleration for the stepper motor mm/sec2\n" +
                "#extruder.hotend.max_speed                       50               # mm/s\n" +
                "\n" +
                "#extruder.hotend.step_pin                        2.0              # Pin for extruder step signal\n" +
                "#extruder.hotend.dir_pin                         0.5             # Pin for extruder dir signal\n" +
                "#extruder.hotend.en_pin                          0.4             # Pin for extruder enable signal\n" +
                "\n" +
                "# extruder offset\n" +
                "#extruder.hotend.x_offset                        0                # x offset from origin in mm\n" +
                "#extruder.hotend.y_offset                        0                # y offset from origin in mm\n" +
                "#extruder.hotend.z_offset                        0                # z offset from origin in mm\n" +
                "\n" +
                "# firmware retract settings when using G10/G11, these are the defaults if not defined, must be defined for each extruder if not using the defaults\n" +
                "#extruder.hotend.retract_length                  3               # retract length in mm\n" +
                "#extruder.hotend.retract_feedrate                45              # retract feedrate in mm/sec\n" +
                "#extruder.hotend.retract_recover_length          0               # additional length for recover\n" +
                "#extruder.hotend.retract_recover_feedrate        8               # recover feedrate in mm/sec (should be less than retract feedrate)\n" +
                "#extruder.hotend.retract_zlift_length            0               # zlift on retract in mm, 0 disables\n" +
                "#extruder.hotend.retract_zlift_feedrate          6000            # zlift feedrate in mm/min (Note mm/min NOT mm/sec)\n" +
                "delta_current                                1.0              # Extruder stepper motor current\n" +
                "\n" +
                "# Second extruder module configuration\n" +
                "extruder.hotend2.enable                          true             # Whether to activate the extruder module at all. All configuration is ignored if false\n" +
                "extruder.hotend2.steps_per_mm                    140              # Steps per mm for extruder stepper\n" +
                "extruder.hotend2.default_feed_rate               600              # Default rate ( mm/minute ) for moves where only the extruder moves\n" +
                "extruder.hotend2.acceleration                    500              # Acceleration for the stepper motor, as of 0.6, arbitrary ratio\n" +
                "extruder.hotend2.max_speed                       50               # mm/s\n" +
                "\n" +
                "extruder.hotend2.step_pin                        2.8              # Pin for extruder step signal\n" +
                "extruder.hotend2.dir_pin                         2.13             # Pin for extruder dir signal\n" +
                "extruder.hotend2.en_pin                          4.29             # Pin for extruder enable signal\n" +
                "\n" +
                "extruder.hotend2.x_offset                        0                # x offset from origin in mm\n" +
                "extruder.hotend2.y_offset                        25.0             # y offset from origin in mm\n" +
                "extruder.hotend2.z_offset                        0                # z offset from origin in mm\n" +
                "epsilon_current                              1.5              # Second extruder stepper motor current\n" +
                "\n" +
                "\n" +
                "\n" +
                "# Laser module configuration\n" +
                "laser_module_enable                          false            # Whether to activate the laser module at all. All configuration is ignored if false.\n" +
                "laser_module_pin                             2.7              # this pin will be PWMed to control the laser\n" +
                "laser_module_max_power                       0.8              # this is the maximum duty cycle that will be applied to the laser\n" +
                "laser_module_tickle_power                    0.0              # this duty cycle will be used for travel moves to keep the laser active without actually burning\n" +
                "\n" +
                "# Hotend temperature control configuration\n" +
                'temperature_control.hotend.enable            true             # Whether to activate this ( "hotend" ) module at all. All configuration is ignored if false.\n' +
                "#temperature_control.hotend.thermistor_pin    0.23             # Pin for the thermistor to read\n" +
                "#temperature_control.hotend.heater_pin        2.5              # Pin that controls the heater\n" +
                "#temperature_control.hotend.thermistor        EPCOS100K        # see http://smoothieware.org/temperaturecontrol#toc5\n" +
                "#temperature_control.hotend.beta             4066             # or set the beta value\n" +
                "\n" +
                "#temperature_control.hotend.set_m_code        104              #\n" +
                "#temperature_control.hotend.set_and_wait_m_code 109            #\n" +
                "#temperature_control.hotend.designator        T                #\n" +
                "\n" +
                "#temperature_control.hotend.p_factor          13.7             #\n" +
                "#temperature_control.hotend.i_factor          0.097            #\n" +
                "#temperature_control.hotend.d_factor          24               #\n" +
                "\n" +
                "#temperature_control.hotend.max_pwm          64               # max pwm, 64 is a good value if driving a 12v resistor with 24v.\n" +
                "\n" +
                "# Hotend2 temperature control configuration\n" +
                'temperature_control.hotend2.enable            false             # Whether to activate this ( "hotend" ) module at all. All configuration is ignored if false.\n' +
                "\n" +
                "#temperature_control.hotend2.thermistor_pin    0.25             # Pin for the thermistor to read\n" +
                "#temperature_control.hotend2.heater_pin        2.4             # Pin that controls the heater\n" +
                "#temperature_control.hotend2.thermistor        EPCOS100K        # see http://smoothieware.org/temperaturecontrol#toc5\n" +
                "##temperature_control.hotend2.beta             4066             # or set the beta value\n" +
                "#temperature_control.hotend2.set_m_code        104             #\n" +
                "#temperature_control.hotend2.set_and_wait_m_code 109            #\n" +
                "#temperature_control.hotend2.designator        T1               #\n" +
                "\n" +
                "#temperature_control.hotend2.p_factor          13.7           # permanently set the PID values after an auto pid\n" +
                "#temperature_control.hotend2.i_factor          0.097          #\n" +
                "#temperature_control.hotend2.d_factor          24             #\n" +
                "\n" +
                "#temperature_control.hotend2.max_pwm          64               # max pwm, 64 is a good value if driving a 12v resistor with 24v.\n" +
                "\n" +
                "temperature_control.bed.enable               false            #\n" +
                "#temperature_control.bed.thermistor_pin       0.24             #\n" +
                "#temperature_control.bed.heater_pin           2.7              #\n" +
                "#temperature_control.bed.thermistor           EPCOS100K    # see http://smoothieware.org/temperaturecontrol#toc5\n" +
                "#temperature_control.bed.beta                4066             # or set the beta value\n" +
                "\n" +
                "#temperature_control.bed.set_m_code           140              #\n" +
                "#temperature_control.bed.set_and_wait_m_code  190              #\n" +
                "#temperature_control.bed.designator           B                #\n" +
                "\n" +
                "#temperature_control.bed.max_pwm             64               # max pwm, 64 is a good value if driving a 12v resistor with 24v.\n" +
                "\n" +
                "# Switch module for led control\n" +
                "switch.led.enable                            true             #\n" +
                "switch.led.input_on_command                  M800            #\n" +
                "switch.led.input_off_command                 M801             #\n" +
                "switch.led.output_pin                        2.5              #\n" +
                "switch.led.output_type                       digital              #\n" +
                "switch.led.startup_value                       1              #\n" +
                "switch.led.startup_state                       true             #\n" +
                "\n" +
                "switch.misc.enable                           false            #\n" +
                "switch.misc.input_on_command                 M42              #\n" +
                "switch.misc.input_off_command                M43              #\n" +
                "switch.misc.output_pin                       2.4              #\n" +
                "\n" +
                "# automatically toggle a switch at a specified temperature. Different ones of these may be defined to monitor different temperatures and switch different swithxes\n" +
                "# useful to turn on a fan or water pump to cool the hotend\n" +
                "#temperatureswitch.hotend.enable                true             #\n" +
                "#temperatureswitch.hotend.designator          T                # first character of the temperature control designator to use as the temperature sensor to monitor\n" +
                "#temperatureswitch.hotend.switch              misc             # select which switch to use, matches the name of the defined switch\n" +
                "#temperatureswitch.hotend.threshold_temp      60.0             # temperature to turn on (if rising) or off the switch\n" +
                "#temperatureswitch.hotend.heatup_poll         15               # poll heatup at 15 sec intervals\n" +
                "#temperatureswitch.hotend.cooldown_poll       60               # poll cooldown at 60 sec intervals\n" +
                "\n" +
                "# filament out detector\n" +
                "#filament_detector.enable                     true             #\n" +
                "#filament_detector.encoder_pin                0.26             # must be interrupt enabled pin (0.26, 0.27, 0.28)\n" +
                "#filament_detector.seconds_per_check          2                # may need to be longer\n" +
                "#filament_detector.pulses_per_mm              1 .0             # will need to be tuned\n" +
                "#filament_detector.bulge_pin                  0.27             # optional bulge detector switch and/or manual suspend\n" +
                "\n" +
                "# Switch module for spindle control\n" +
                "#switch.spindle.enable                        false            #\n" +
                "\n" +
                "# Endstops\n" +
                "endstops_enable                              true             # the endstop module is enabled by default and can be disabled here\n" +
                "#corexy_homing                               false            # set to true if homing on a hbit or corexy\n" +
                "alpha_min_endstop                            1.24^            # add a ! to invert if endstop is NO connected to ground\n" +
                "#alpha_max_endstop                           1.24^            #\n" +
                "alpha_homing_direction                       home_to_min      # or set to home_to_max and set alpha_max\n" +
                "alpha_min                                    0                # this gets loaded after homing when home_to_min is set\n" +
                "alpha_max                                    380              # this gets loaded after homing when home_to_max is set\n" +
                "beta_min_endstop                             1.26^            #\n" +
                "#beta_max_endstop                            1.26^            #\n" +
                "beta_homing_direction                        home_to_min      #\n" +
                "beta_min                                     0                #\n" +
                "beta_max                                     440              #\n" +
                "gamma_min_endstop                            1.29^            #\n" +
                "#gamma_max_endstop                           1.29^            #\n" +
                "gamma_homing_direction                       home_to_min      #\n" +
                "gamma_min                                    0                #\n" +
                "gamma_max                                    180              #\n" +
                "\n" +
                "# optional enable limit switches, actions will stop if any enabled limit switch is triggered\n" +
                "#alpha_limit_enable                          false            # set to true to enable X min and max limit switches\n" +
                "#beta_limit_enable                           false            # set to true to enable Y min and max limit switches\n" +
                "#gamma_limit_enable                          false            # set to true to enable Z min and max limit switches\n" +
                "\n" +
                "#probe endstop\n" +
                "#probe_pin                                   1.29             # optional pin for probe\n" +
                "\n" +
                "alpha_fast_homing_rate_mm_s                  50               # feedrates in mm/second\n" +
                'beta_fast_homing_rate_mm_s                   50               # "\n' +
                'gamma_fast_homing_rate_mm_s                  4                # "\n' +
                'alpha_slow_homing_rate_mm_s                  25               # "\n' +
                'beta_slow_homing_rate_mm_s                   25               # "\n' +
                'gamma_slow_homing_rate_mm_s                  2                # "\n' +
                "\n" +
                "alpha_homing_retract_mm                      5                # distance in mm\n" +
                'beta_homing_retract_mm                       5                # "\n' +
                'gamma_homing_retract_mm                      5                # "\n' +
                "\n" +
                "#endstop_debounce_count                       100              # uncomment if you get noise on your endstops, default is 100\n" +
                "\n" +
                "# optional Z probe\n" +
                "zprobe.enable                                false           # set to true to enable a zprobe\n" +
                "#zprobe.probe_pin                             1.29!^          # pin probe is attached to if NC remove the !\n" +
                "#zprobe.slow_feedrate                         5               # mm/sec probe feed rate\n" +
                "#zprobe.debounce_count                       100             # set if noisy\n" +
                "#zprobe.fast_feedrate                         100             # move feedrate mm/sec\n" +
                "#zprobe.probe_height                          5               # how much above bed to start probe\n" +
                "\n" +
                "# associated with zprobe the leveling strategy to use\n" +
                "#leveling-strategy.three-point-leveling.enable         true        # a leveling strategy that probes three points to define a plane and keeps the Z parallel to that plane\n" +
                "#leveling-strategy.three-point-leveling.point1         100.0,0.0   # the first probe point (x,y) optional may be defined with M557\n" +
                "#leveling-strategy.three-point-leveling.point2         200.0,200.0 # the second probe point (x,y)\n" +
                "#leveling-strategy.three-point-leveling.point3         0.0,200.0   # the third probe point (x,y)\n" +
                "#leveling-strategy.three-point-leveling.home_first     true        # home the XY axis before probing\n" +
                "#leveling-strategy.three-point-leveling.tolerance      0.03        # the probe tolerance in mm, anything less that this will be ignored, default is 0.03mm\n" +
                "#leveling-strategy.three-point-leveling.probe_offsets  0,0,0       # the probe offsets from nozzle, must be x,y,z, default is no offset\n" +
                "#leveling-strategy.three-point-leveling.save_plane     false       # set to true to allow the bed plane to be saved with M500 default is false\n" +
                "\n" +
                "\n" +
                "# Pause button\n" +
                "pause_button_enable                          true             #\n" +
                "\n" +
                "# Panel See http://smoothieware.org/panel\n" +
                "panel.enable                                 true            # set to true to enable the panel code\n" +
                "\n" +
                "# Example viki2 config for an azteeg miniV2 with IDC cable\n" +
                "panel.lcd                                    viki2             # set type of panel\n" +
                "panel.spi_channel                            0                 # set spi channel to use P0_18,P0_15 MOSI,SCLK\n" +
                "panel.spi_cs_pin                             0.16              # set spi chip select\n" +
                "panel.encoder_a_pin                          3.25!^            # encoder pin\n" +
                "panel.encoder_b_pin                          3.26!^            # encoder pin\n" +
                "panel.click_button_pin                       2.11!^            # click button\n" +
                "panel.a0_pin                                 2.6               # st7565 needs an a0\n" +
                "panel.contrast                              8                 # override contrast setting (default is 9)\n" +
                "panel.encoder_resolution                    4                 # override number of clicks to move 1 item (default is 4)\n" +
                "#panel.button_pause_pin                      1.22^             # kill/pause set one of these for the auxilliary button on viki2\n" +
                "#panel.back_button_pin                       1.22!^            # back button recommended to use this on EXP1\n" +
                "panel.buzz_pin                               1.30              # pin for buzzer on EXP2\n" +
                "panel.red_led_pin                            0.26               # pin for red led on viki2 on EXP1\n" +
                "panel.blue_led_pin                           1.21              # pin for blue led on viki2 on EXP1\n" +
                "panel.external_sd                            true              # set to true if there is an extrernal sdcard on the panel\n" +
                "panel.external_sd.spi_channel                0                 # set spi channel the sdcard is on\n" +
                "panel.external_sd.spi_cs_pin                 1.23              # set spi chip select for the sdcard\n" +
                "panel.external_sd.sdcd_pin                   1.31!^            # sd detect signal (set to nc if no sdcard detect)\n" +
                "panel.menu_offset                            1                 # some panels will need 1 here\n" +
                "\n" +
                "\n" +
                "# Example miniviki2 config\n" +
                "#panel.lcd                                    mini_viki2        # set type of panel\n" +
                "#panel.spi_channel                            0                 # set spi channel to use P0_18,P0_15 MOSI,SCLK\n" +
                "#panel.spi_cs_pin                             0.16              # set spi chip select\n" +
                "#panel.encoder_a_pin                          3.25!^            # encoder pin\n" +
                "#panel.encoder_b_pin                          3.26!^            # encoder pin\n" +
                "#panel.click_button_pin                       2.11!^            # click button\n" +
                "#panel.a0_pin                                 2.6               # st7565 needs an a0\n" +
                "##panel.contrast                               18                # override contrast setting (default is 18)\n" +
                "##panel.encoder_resolution                     2                 # override number of clicks to move 1 item (default is 2)\n" +
                "#panel.menu_offset                            1                 # here controls how sensitive the menu is. some panels will need 1\n" +
                "\n" +
                "panel.alpha_jog_feedrate                     1000              # x jogging feedrate in mm/min\n" +
                "panel.beta_jog_feedrate                      1000              # y jogging feedrate in mm/min\n" +
                "panel.gamma_jog_feedrate                     4               # z jogging feedrate in mm/min\n" +
                "\n" +
                "#panel.hotend_temperature                     185               # temp to set hotend when preheat is selected\n" +
                "#panel.T1_temperature                     185               # temp to set hotend when preheat is selected\n" +
                "#panel.bed_temperature                        60                # temp to set bed when preheat is selected\n" +
                "\n" +
                "# Example of a custom menu entry, which will show up in the Custom entry.\n" +
                "# NOTE _ gets converted to space in the menu and commands, | is used to separate multiple commands\n" +
                "custom_menu.power_on.enable                true              #\n" +
                "custom_menu.power_on.name                  Light_on          #\n" +
                "custom_menu.power_on.command               M800               #\n" +
                "\n" +
                "custom_menu.power_off.enable               true              #\n" +
                "custom_menu.power_off.name                 Light_off         #\n" +
                "custom_menu.power_off.command M801 #\n" +
                "\n" +
                "# RE-ARM specific settings do not change\n" +
                "currentcontrol_module_enable                 false            #\n" +
                "digipot_max_current                          2.4             # max current\n" +
                "digipot_factor                               106.0           # factor for converting current to digipot value\n" +
                "leds_disable                                 true             # disable using leds after config loaded\n" +
                "\n" +
                "# network settings\n" +
                "network.enable                               false            # enable the ethernet network services\n" +
                "#network.webserver.enable                     true             # enable the webserver\n" +
                "#network.telnet.enable                        true             # enable the telnet server\n" +
                "#network.plan9.enable                         true             # enable the plan9 network filesystem\n" +
                "#network.ip_address                           auto             # the IP address\n" +
                "#network.ip_mask                             255.255.255.0    # the ip mask\n" +
                "#network.ip_gateway                          192.168.3.1      # the gateway address\n" +
                "\n" +
                "return_error_on_unhandled_gcode              false            #\n" +
                "ok\n" +
                "echo: configDone\n"
        )

        res.send("")
        return
    }
    if (url.startsWith("version")) {
        SendWS(
            "Build version: edge-3332442, Build date: Apr 22 2016 15:52:55, MCU: LPC1768, System Clock: 100MHz\nok\n"
        )
        res.send("")
        return
    }
    if (url.indexOf("M503") != -1) {
        SendWS(
            "; config override present: /sd/config-override\n" +
                ";Steps per unit:\n" +
                "M92 X80.00000 Y80.00000 Z1637.79529 \n" +
                ";Acceleration mm/sec^2:\n" +
                "M204 S1000.00000 \n" +
                ";X- Junction Deviation, Z- Z junction deviation, S - Minimum Planner speed mm/sec:\n" +
                "M205 X0.05000 Z-1.00000 S0.00000\n" +
                ";Max cartesian feedrates in mm/sec:\n" +
                "M203 X16.66667 Y16.66667 Z1.00000 S-1.00000\n" +
                ";Max actuator feedrates in mm/sec:\n" +
                "M203.1 X16.66667 Y16.66667 Z1.00000 \n" +
                ";E Steps per mm:\n" +
                "M92 E1.0000 P57988\n" +
                ";E Filament diameter:\n" +
                "M200 D0.0000 P57988\n" +
                ";E retract length, feedrate:\n" +
                "M207 S3.0000 F2700.0000 Z0.0000 Q6000.0000 P57988\n" +
                ";E retract recover length, feedrate:\n" +
                "M208 S0.0000 F480.0000 P57988\n" +
                ";E acceleration mm/sec²:\n" +
                "M204 E1000.0000 P57988\n" +
                ";E max feed rate mm/sec:\n" +
                "M203 E1000.0000 P57988\n" +
                ";E Steps per mm:\n" +
                "M92 E140.0000 P39350\n" +
                ";E Filament diameter:\n" +
                "M200 D0.0000 P39350\n" +
                ";E retract length, feedrate:\n" +
                "M207 S3.0000 F2700.0000 Z0.0000 Q6000.0000 P39350\n" +
                ";E retract recover length, feedrate:\n" +
                "M208 S0.0000 F480.0000 P39350\n" +
                ";E acceleration mm/sec²:\n" +
                "M204 E500.0000 P39350\n" +
                ";E max feed rate mm/sec:\n" +
                "M203 E50.0000 P39350\n" +
                ";Home offset (mm):\n" +
                "M206 X0.00 Y0.00 Z0.00 \n" +
                "ok\n" +
                "echo: overrideDone\n"
        )
        res.send("")
        return
    }

    if (url.indexOf("M105") != -1) {
        SendWS(Temperatures())
        res.send("")
        return
    }

    if (url.indexOf("ESP800") != -1) {
        res.json({
            cmd: "800",
            status: "ok",
            data: {
                FWVersion: "3.0.0.a111",
                FWTarget: "smoothieware",
                FWTargetID: "40",
                Setup: "Enabled",
                SDConnection: "shared",
                SerialProtocol: "Socket",
                Authentication: enableAuthentication ? "Enabled" : "Disabled",
                WebCommunication: "Synchronous",
                WebSocketIP: "localhost",
                WebSocketPort: "81",
                Hostname: "smoothesp3d",
                WiFiMode: "STA",
                WebUpdate: "Enabled",
                FileSystem: "LittleFS",
                Time: "none",
                CameraID: "4",
                CameraName: "ESP32 Cam",
            },
        })
        return
    }
    if (url.indexOf("ESP111") != -1) {
        res.send("192.168.1.111")
        return
    }
    if (url.indexOf("ESP420") != -1) {
        res.json({
            cmd: "420",
            status: "ok",
            data: [
                { id: "chip id", value: "18569" },
                { id: "CPU Freq", value: "240Mhz" },
                { id: "CPU Temp", value: "54.4C" },
                { id: "free mem", value: "201.86 KB" },
                { id: "SDK", value: "v4.4-beta1-308-gf3e0c8bc41" },
                { id: "flash size", value: "4.00 MB" },
                { id: "size for update", value: "1.25 MB" },
                { id: "FS type", value: "LittleFS" },
                { id: "FS usage", value: "64.00 KB/1.44 MB" },
                { id: "sleep mode", value: "none" },
                { id: "wifi", value: "ON" },
                { id: "hostname", value: "esp3d" },
                { id: "HTTP port", value: "80" },
                { id: "Telnet port", value: "23" },
                { id: "sta", value: "ON" },
                { id: "mac", value: "24:6F:28:4C:89:48" },
                { id: "SSID", value: "luc-ext1" },
                { id: "signal", value: "60%" },
                { id: "phy mode", value: "11n" },
                { id: "channel", value: "3" },
                { id: "ip mode", value: "dhcp" },
                { id: "ip", value: "192.168.2.215" },
                { id: "gw", value: "192.168.2.1" },
                { id: "msk", value: "255.255.255.0" },
                { id: "DNS", value: "192.168.2.1" },
                { id: "ap", value: "OFF" },
                { id: "mac", value: "24:6F:28:4C:89:49" },
                { id: "notification", value: "ON(line)" },
                { id: "sd", value: "shared(SDFat - 2.1.2)" },
                { id: "targetfw", value: "smoothieware" },
                { id: "FW ver", value: "3.0.0.a111" },
                { id: "FW arch", value: "ESP32" },
            ],
        })
        return
    }

    if (url.indexOf("ESP410") != -1) {
        res.json({
            cmd: "410",
            status: "ok",
            data: [{ SSID: "luc-ext1", SIGNAL: "52", IS_PROTECTED: "1" }],
        })
        return
    }

    if (url.indexOf("ESP600") != -1) {
        const text = url.substring(8)
        SendWS(text, false)
        return
    }

    if (url.indexOf("ESP400") != -1) {
        res.json({
            cmd: "400",
            status: "ok",
            data: [
                {
                    F: "network/network",
                    P: "130",
                    T: "S",
                    V: "esp3d",
                    H: "hostname",
                    S: "32",
                    M: "1",
                },
                {
                    F: "network/network",
                    P: "0",
                    T: "B",
                    V: "1",
                    H: "radio mode",
                    O: [{ none: "0" }, { sta: "1" }, { ap: "2" }],
                    R: "1",
                },
                {
                    F: "network/sta",
                    P: "1",
                    T: "S",
                    V: "WIFI_OFFICE_B2G",
                    S: "32",
                    H: "SSID",
                    M: "1",
                    R: "1",
                },
                {
                    F: "network/sta",
                    P: "34",
                    T: "S",
                    N: "1",
                    V: "********",
                    S: "64",
                    H: "pwd",
                    M: "0",
                    MS: "8",
                    R: "1",
                },
                {
                    F: "network/sta",
                    P: "99",
                    T: "B",
                    V: "1",
                    H: "ip mode",
                    O: [{ dhcp: "1" }, { static: "0" }],
                    R: "1",
                },
                {
                    F: "network/sta",
                    P: "100",
                    T: "A",
                    V: "192.168.0.1",
                    H: "ip",
                    R: "1",
                },
                {
                    F: "network/sta",
                    P: "108",
                    T: "A",
                    V: "192.168.0.1",
                    H: "gw",
                    R: "1",
                },
                {
                    F: "network/sta",
                    P: "104",
                    T: "A",
                    V: "255.255.255.0",
                    H: "msk",
                    R: "1",
                },
                {
                    F: "network/ap",
                    P: "218",
                    T: "S",
                    V: "ESP3D",
                    S: "32",
                    H: "SSID",
                    M: "1",
                    R: "1",
                },
                {
                    F: "network/ap",
                    P: "251",
                    T: "S",
                    N: "1",
                    V: "********",
                    S: "64",
                    H: "pwd",
                    M: "0",
                    MS: "8",
                    R: "1",
                },
                {
                    F: "network/ap",
                    P: "316",
                    T: "A",
                    V: "192.168.0.1",
                    H: "ip",
                    R: "1",
                },
                {
                    F: "network/ap",
                    P: "118",
                    T: "B",
                    V: "11",
                    H: "channel",
                    O: [
                        { 1: "1" },
                        { 2: "2" },
                        { 3: "3" },
                        { 4: "4" },
                        { 5: "5" },
                        { 6: "6" },
                        { 7: "7" },
                        { 8: "8" },
                        { 9: "9" },
                        { 10: "10" },
                        { 11: "11" },
                        { 12: "12" },
                        { 13: "13" },
                        { 14: "14" },
                    ],
                    R: "1",
                },
                {
                    F: "service/http",
                    P: "328",
                    T: "B",
                    V: "1",
                    H: "enable",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service/http",
                    P: "121",
                    T: "I",
                    V: "80",
                    H: "port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service/telnetp",
                    P: "329",
                    T: "B",
                    V: "1",
                    H: "enable",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service/telnetp",
                    P: "125",
                    T: "I",
                    V: "23",
                    H: "port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service/ftp",
                    P: "1021",
                    T: "B",
                    V: "1",
                    H: "enable",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service/ftp",
                    P: "1009",
                    T: "I",
                    V: "21",
                    H: "control port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service/ftp",
                    P: "1013",
                    T: "I",
                    V: "20",
                    H: "active port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service/ftp",
                    P: "1017",
                    T: "I",
                    V: "55600",
                    H: "passive port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service/notification",
                    P: "1004",
                    T: "B",
                    V: "1",
                    H: "auto notif",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service/notification",
                    P: "116",
                    T: "B",
                    V: "0",
                    H: "notification",
                    O: [
                        { none: "0" },
                        { pushover: "1" },
                        { email: "2" },
                        { line: "3" },
                    ],
                },
                {
                    F: "service/notification",
                    P: "332",
                    T: "S",
                    V: "********",
                    S: "63",
                    H: "t1",
                    M: "0",
                },
                {
                    F: "service/notification",
                    P: "396",
                    T: "S",
                    V: "********",
                    S: "63",
                    H: "t2",
                    M: "0",
                },
                {
                    F: "service/notification",
                    P: "855",
                    T: "S",
                    V: " ",
                    S: "127",
                    H: "ts",
                    M: "0",
                },
                {
                    F: "system/system",
                    P: "461",
                    T: "B",
                    V: "40",
                    H: "targetfw",
                    O: [
                        { repetier: "50" },
                        { marlin: "20" },
                        { smoothieware: "40" },
                        { grbl: "10" },
                        { unknown: "0" },
                    ],
                },
                {
                    F: "system/system",
                    P: "112",
                    T: "I",
                    V: "115200",
                    H: "baud",
                    O: [
                        { 9600: "9600" },
                        { 19200: "19200" },
                        { 38400: "38400" },
                        { 57600: "57600" },
                        { 74880: "74880" },
                        { 115200: "115200" },
                        { 230400: "230400" },
                        { 250000: "250000" },
                        { 500000: "500000" },
                        { 921600: "921600" },
                    ],
                },
                {
                    F: "system/system",
                    P: "320",
                    T: "I",
                    V: "10000",
                    H: "bootdelay",
                    S: "40000",
                    M: "0",
                },
            ],
        })
        return
    }
    SendWS("ok\n")
    res.send("")
}

const loginURI = (req, res) => {
    if (req.body.DISCONNECT == "Yes") {
        res.status(401)
        logindone = false
    } else if (req.body.USER == "admin" && req.body.PASSWORD == "admin") {
        logindone = true
        lastconnection = Date.now()
    } else {
        res.status(401)
        logindone = false
    }
    res.send("")
}

const configURI = (req, res) => {
    if (!logindone && enableAuthentication) {
        res.status(401)
        return
    }
    lastconnection = Date.now()
    res.send(
        "chip id: 56398\nCPU Freq: 240 Mhz<br/>" +
            "CPU Temp: 58.3 C<br/>" +
            "free mem: 212.36 KB<br/>" +
            "SDK: v3.2.3-14-gd3e562907<br/>" +
            "flash size: 4.00 MB<br/>" +
            "size for update: 1.87 MB<br/>" +
            "FS type: LittleFS<br/>" +
            "FS usage: 104.00 KB/192.00 KB<br/>" +
            "baud: 115200<br/>" +
            "sleep mode: none<br/>" +
            "wifi: ON<br/>" +
            "hostname: esp3d<br/>" +
            "HTTP port: 80<br/>" +
            "Telnet port: 23<br/>" +
            "WebDav port: 8383<br/>" +
            "sta: ON<br/>" +
            "mac: 80:7D:3A:C4:4E:DC<br/>" +
            "SSID: WIFI_OFFICE_A2G<br/>" +
            "signal: 100 %<br/>" +
            "phy mode: 11n<br/>" +
            "channel: 11<br/>" +
            "ip mode: dhcp<br/>" +
            "ip: 192.168.1.61<br/>" +
            "gw: 192.168.1.1<br/>" +
            "msk: 255.255.255.0<br/>" +
            "DNS: 192.168.1.1<br/>" +
            "ap: OFF<br/>" +
            "mac: 80:7D:3A:C4:4E:DD<br/>" +
            "serial: ON<br/>" +
            "notification: OFF<br/>" +
            "Target Fw: smoothieware<br/>" +
            "FW ver: 3.0.0.a91<br/>" +
            "FW arch: ESP32 "
    )
}

module.exports = {
    commandsQuery,
    configURI,
    loginURI,
    getLastconnection,
    hasEnabledAuthentication,
}
