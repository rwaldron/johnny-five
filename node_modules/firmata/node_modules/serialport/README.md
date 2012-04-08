<pre>
  eeeee eeeee eeeee eeee       e  eeeee 
  8   8 8  88 8   8 8          8  8   " 
  8e  8 8   8 8e  8 8eee       8e 8eeee 
  88  8 8   8 88  8 88      e  88    88 
  88  8 8eee8 88ee8 88ee 88 8ee88 8ee88

  eeeee eeee eeeee  e  eeeee e     eeeee eeeee eeeee eeeee 
  8   " 8    8   8  8  8   8 8     8   8 8  88 8   8   8   
  8eeee 8eee 8eee8e 8e 8eee8 8e    8eee8 8   8 8eee8e  8e  
     88 88   88   8 88 88  8 88    88    8   8 88   8  88  
  8ee88 88ee 88   8 88 88  8 88eee 88    8eee8 88   8  88
</pre>

Version: 0.3.0 - Released July 28, 2011

*****

Imagine a world where you can write JavaScript to control blenders, lights, security systems, or even robots. Yes, I said robots. That world is here and now with node-serialport. It provides a very simple interface to the low level serial port code necessary to program [Arduino](http://www.arduino.cc/) chipsets, [X10](http://www.smarthome.com/manuals/protocol.txt) wireless communications, or even the rising [Z-Wave](http://www.z-wave.com/modules/ZwaveStart/) and [Zigbee](http://www.zigbee.org/) standards. The physical world is your oyster with this goodie, don't believe us - watch [this presentation from JSConf EU 2010](http://jsconf.eu/2010/speaker/livingroombindmotion_function.html) by [Nikolai Onken](http://twitter.com/nonken) and [Jörn Zaefferer](http://bassistance.de/).

*****

How To Use
==========

Using node-serialport is pretty easy because it is pretty basic. It provides you with the building block to make great things, it is not a complete solution - just a cog in the (world domination) machine.

To Install
----------

<pre>
  npm install serialport
</pre>

To Use
------

Opening a serial port:

<pre>
  var SerialPort = require("serialport").SerialPort
  var serialPort = new SerialPort("/dev/tty-usbserial1");
</pre>
  
When opening a serial port, you can specify (in this order).

1. Path to Serial Port - required.
1. Options - optional and described below.

The options object allows you to pass named options to the serial port during initialization. The valid attributes for the options object are the following

* baudrate: Baud Rate, defaults to 9600. Must be one of: 115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200, 150, 134, 110, 75, or 50.
* databits: Data Bits, defaults to 8. Must be one of: 8, 7, 6, or 5.
* stopbits: Stop Bits, defaults to 1. Must be one of: 1 or 2.
* parity: Parity, defaults to 0. Must be one of: 0, 1, or 2.
* buffersize: Size of read buffer, defaults to 255. Must be an integer value.
* parser: The parser engine to use with read data, defaults to rawPacket strategy which just emits the raw buffer as a "data" event. Can be any function that accepts EventEmitter as first parameter and the raw buffer as the second parameter.

Parsers
-------

Out of the box, node-serialport provides two parsers one that simply emits the raw buffer as a data event and the other which provides familiar "readline" style parsing. To use the readline parser, you must provide a delimiter as such:

<pre>
  var serialport = require("serialport");
  var SerialPort = serialport.SerialPort; // localize object constructor
  
  var sp = new SerialPort("/dev/tty-usbserial1", { 
    parser: serialport.parsers.readline("\n") 
  });
</pre>

To use the raw parser, you just provide the function definition (or leave undefined):

<pre>
  var serialport = require("serialport");
  var SerialPort = serialport.SerialPort; // localize object constructor
  
  var sp = new SerialPort("/dev/tty-usbserial1", { 
    parser: serialport.parsers.raw
  });
</pre>


You can get updates of new data from the Serial Port as follows:

<pre>
  serialPort.on("data", function (data) {
    sys.puts("here: "+data);
  });
</pre>

You can write to the serial port by sending a string or buffer to the write method as follows:

<pre>
serialPort.write("OMG IT WORKS\r");
</pre>

Enjoy and do cool things with this code.

