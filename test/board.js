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
  "Board.range()": function( test ) {
    test.expect(7);

    // Positive Range
    test.deepEqual( five.Board.range(3), [ 0, 1, 2, 3 ] );
    test.deepEqual( five.Board.range(0, 3), [ 0, 1, 2, 3 ] );
    test.deepEqual( five.Board.range(0, 10, 2), [ 0, 2, 4, 6, 8, 10 ] );
    test.deepEqual( five.Board.range(0, 9, 3), [ 0, 3, 6, 9 ] );

    // Negative Range
    test.deepEqual( five.Board.range(0, -9, -1), [ 0, -1, -2, -3, -4, -5, -6, -7, -8, -9 ] );
    test.deepEqual( five.Board.range(0, -9, -3), [ 0, -3, -6, -9 ] );
    test.deepEqual( five.Board.range(0, -10, -2), [ 0, -2, -4, -6, -8, -10 ] );

    test.done();
  },
  "Board.range.prefixed()": function( test ) {
    test.expect(4);

    // Positive Range
    test.deepEqual( five.Board.range.prefixed("A", 3), [ "A0", "A1", "A2", "A3" ] );
    test.deepEqual( five.Board.range.prefixed("A", 0, 3), [ "A0", "A1", "A2", "A3" ] );
    test.deepEqual( five.Board.range.prefixed("A", 0, 10, 2), [ "A0", "A2", "A4", "A6", "A8", "A10" ] );
    test.deepEqual( five.Board.range.prefixed("A", 0, 9, 3), [ "A0", "A3", "A6", "A9" ] );

    test.done();
  },
  "Board.uid()": function( test ) {
    test.expect(1);
    test.equal( typeof five.Board.uid, "function", "Board.uid" );
    test.done();
  },
  "Board.mount()": function( test ) {
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
  "Board.Pins": function( test ) {
    test.expect(1);
    test.ok( five.Board.Pins, "Board.Pins" );
    test.done();
  },
  "Board.Pins.*": function( test ) {
    test.expect(3);
    test.ok( five.Board.Pins.analog, "Board.Pins.analog" );
    test.ok( five.Board.Pins.digital, "Board.Pins.digital" );
    test.ok( five.Board.Pins.pwm, "Board.Pins.pwm" );
    test.done();
  },
  "Board.Pins.analog": function( test ) {
    test.expect(6);

    [ "A0", "A1", "A2", "A3", "A4", "A5" ].forEach(function( pin, mapsTo ) {
      test.equal( five.Board.Pins.analog[pin], mapsTo );
    });
    test.done();
  },
  "Board.Pins.pwm": function( test ) {
    test.expect(6);
    [ 3, 5, 6, 9, 10, 11 ].forEach(function( pin ) {
      test.ok( five.Board.Pins.pwm[pin] );
    });
    test.done();
  },
  "Board.Pins.serial": function( test ) {
    test.expect(2);
    [ 0, 1 ].forEach(function( pin ) {
      test.ok( five.Board.Pins.serial[pin] );
    });
    test.done();
  },
  "Board.Pins.spi": function( test ) {
    test.expect(4);
    [ 10, 11, 12, 13 ].forEach(function( pin ) {
      test.ok( five.Board.Pins.spi[pin] );
    });
    test.done();
  },
  "Board.Pins.led": function( test ) {
    test.expect(1);

    test.ok( five.Board.Pins.led[13] );

    test.done();
  },
"Board.Pin.is___()": function( test ) {
    var fixture = {
      0: "Serial",
      3: "PWM",
      7: "Digital",
      "A3": "Analog",
      "A5": "Analog"
    };

    test.expect( Object.keys(fixture).length * 2 );

    Object.keys( fixture ).forEach(function( pin ) {
      test.ok( five.Board.Pin[ "is" + this[ pin ] ]( pin ) );
    }, fixture );

    // Now test for false
    fixture = {
      0: "Analog",
      3: "Analog",
      7: "Serial",
      "A3": "Digital",
      "A5": "Digital"
    };

    Object.keys( fixture ).forEach(function( pin ) {
      test.ok( !five.Board.Pin[ "is" + this[ pin ] ]( pin ) );
    }, fixture );

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
