// Functions to handle custom messages sent via serial.
// In gcode file, M118 can be used to send messages on serial.
// This allows the microcontroller to communicate with hosts.
// Example:
//   M118 esp3d:<your message>
//      will send "esp3d:<your message>" over serial, which can be picked up by host
//      to trigger certain actions.

function process_Custom(response) {
    var freq = 440;  // beep frequency on end of print
    var dur = 100;  // beep duration on end of print
    if (response.startsWith("esp3d:eop")) {
        // Sound to play on end of print
        // Triggered by message on serial terminal
        // ESP3D:eop
        //
        // This message can be sent via M118.
        beep(dur, freq);
    }  
}