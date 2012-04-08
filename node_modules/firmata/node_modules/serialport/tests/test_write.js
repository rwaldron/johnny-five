// Test with the epic VirtualSerialPortApp - http://code.google.com/p/macosxvirtualserialport/

var SerialPort = require("../serialport").SerialPort;

var serial_port = new SerialPort("/dev/master", {baudrate: 9600});

serial_port.write("It worked!\r");
serial_port.close();
