// To test with a z-wave device, I recommend: http://www.aeon-labs.com/site/products/view/2/

var SerialPort = require("../serialport").SerialPort;
var sys = require("sys");

var serial_port = new SerialPort("/dev/ttyUSB0");
serial_port.write(new Buffer([0x01, 0x03, 0x00, 0x20,220]));
sys.puts("write");
serial_port.read();
/*
serial_port.on("data", function(d){ 
    sys.puts("here"); 
    sys.puts(d); 
    serial_port.close(); 
});





*/