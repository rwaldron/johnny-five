var SerialPort = require("./mock-serial").SerialPort,
    five = require("../lib/johnny-five.js"),

    serial = new SerialPort("/path/to/fake/usb"),
    board = new five.Board({
      debug: true,
      mock: serial
    });


// use:
// serial.emit( "data", [---] ) to  trigger testable events

console.log( board );


exports["board"] = {
  "board": function( test ) {

    // TODO: Figure out a way to run tests without a board connect

    test.expect(1);
    test.ok(board, "Board instance");
    test.done();
  }
};
