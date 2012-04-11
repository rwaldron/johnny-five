var SerialPort = require("./mock-serial").SerialPort,
    five = require("../lib/johnny-five.js"),

    serial = new SerialPort("/path/to/fake/usb"),
    board = new five.Board({
      debug: true,
      mock: serial
    });


// use:
// serial.emit( "data", [---] ) to  trigger testable events

// console.log( board );

exports["static"] = {
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
  },
  "Board.mount": function( test ) {
    test.expect(1);
    test.equal( typeof five.Board.mount, "function", "Board.mount" );
    test.done();
  },
  "Board.mount(obj)": function( test ) {
    test.expect(2);
    test.ok( five.Board.mount({ board: board }), "five.Board.mount({ board: board })" );
    test.deepEqual( five.Board.mount({ board: board }), board, "five.Board.mount({ board: board }) deep equals board" );
    test.done();
  },
  "Board.mount(index)": function( test ) {
    test.expect(2);
    test.ok( five.Board.mount(0), "five.Board.mount(0)" );
    test.deepEqual( five.Board.mount(), board, "five.Board.mount(0)" );
    test.done();
  },
  "Board.mount(/*none*/)": function( test ) {
    test.expect(2);
    test.ok( five.Board.mount(), "five.Board.mount()" );
    test.deepEqual( five.Board.mount(), board, "five.Board.mount() matches board instance" );
    test.done();
  }
};


exports["instance"] = {
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
    test.ok( board.firmata, "Board instance firmata" );
    test.done();
  },
  "id": function( test ) {
    test.expect(1);
    test.ok( board.id, "Board instance id" );
    test.done();
  },
  "repl": function( test ) {
    test.expect(2);
    test.ok( board.repl, "Board instance repl session" );
    test.ok( board.repl.context, "Board instance repl context" );
    test.done();
  }
};
