// Test with the epic VirtualSerialPortApp - http://code.google.com/p/macosxvirtualserialport/

var SerialPort = require("../serialport").SerialPort;
var util = require("util"), repl = require("repl");

var serial_port = new SerialPort("/dev/master", {baudrate: 9600});

serial_port.on("data", function (data) {
  util.puts("here: "+data);
})
serial_port.on("error", function (msg) {
  util.puts("error: "+msg);
})
repl.start("=>")

//serial_port.close();
