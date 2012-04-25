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
  },
  "Board.analog": function( test ) {
    test.expect(1);
    test.ok( five.Board.analog, "Board.analog" );
    test.done();
  },
  "Board.analog.pins": function( test ) {
    test.expect(1);
    test.ok( five.Board.analog.pins, "Board.analog.pins" );
    test.done();
  },
  "Board.analog.pins normalization": function( test ) {
    test.expect(6);

    test.equal( five.Board.analog.pins["A0"], 0 );
    test.equal( five.Board.analog.pins["A1"], 1 );
    test.equal( five.Board.analog.pins["A2"], 2 );
    test.equal( five.Board.analog.pins["A3"], 3 );
    test.equal( five.Board.analog.pins["A4"], 4 );
    test.equal( five.Board.analog.pins["A5"], 5 );

    // test.equal( five.Board.analog.pins["A0"], 14 );
    // test.equal( five.Board.analog.pins["A1"], 15 );
    // test.equal( five.Board.analog.pins["A2"], 16 );
    // test.equal( five.Board.analog.pins["A3"], 17 );
    // test.equal( five.Board.analog.pins["A4"], 18 );
    // test.equal( five.Board.analog.pins["A5"], 19 );

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
