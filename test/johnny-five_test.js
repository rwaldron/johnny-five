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

exports["five.Board (static)"] = {
  "Board.cache": function( test ) {
    test.expect(2);
    test.equal( typeof five.Board.cache, "object", "Board.cache" );
    test.ok( Array.isArray(five.Board.cache), "Board.cache" );
    test.done();
  },
  "Board.uid": function( test ) {
    test.expect(1);
    test.equal( typeof five.Board.uid, "function", "Board.uid" );
    test.done();
  }
};


exports["five.Board (instance)"] = {
  "cache": function( test ) {
    test.expect(1);
    test.equal( five.Board.cache.length, 1, "Board cached" );
    test.done();
  },
  "instance": function( test ) {
    test.expect(1);
    test.ok( board, "Board instance" );
    test.done();
  },
  "firmata": function( test ) {
    test.expect(1);
    test.ok( board.firmata, "Board firmata" );
    test.done();
  },
  "id": function( test ) {
    test.expect(1);
    test.ok( board.id, "Board id" );
    test.done();
  }
};
