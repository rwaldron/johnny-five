
// For use with Arduino LDR
// Upload arduino-ldr-read.pde to Arduino apparatus via Arduino IDE

var sys = require("sys"),
		repl = require("repl"),
		serialPort = require("serialport").SerialPort,

		//	Required
		defaults = {
			baudrate: 9600
		},
		//	Create new serialport pointer
		serial = new serialPort("/dev/ttyACM0" , defaults);


//	Add data read event listener
serial.on( "data", function( data ) {

	var output;

	//	Coerce data into a number
	data = +data;

	//	If data is worth reading and processing
	if ( data && data > 1 ) {

		//	Create a new Array() whose length equals data
		//	then join to create output visualization
		output = ( new Array(data) ).join( ">" );

		//	Print the data value along with visualization of data
		sys.puts( data + " " + output );
	}

});


serial.on( "error", function( msg ) {
	sys.puts("error: " + msg );
});


repl.start( "=>" );

