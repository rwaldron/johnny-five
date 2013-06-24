var SerialPort = require("./mock-serial").SerialPort,
    five = require("../lib/johnny-five.js"),
    __ = require("../lib/fn.js"),

    serial = new SerialPort("/path/to/fake/usb"),
    board = new five.Board({
      debug: true,
      mock: serial
    }),
    boardEvent = new five.Board.Event({
      type: "read",
      target: serial
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
  "Board.constrain()": function( test ) {
    test.expect(5);

    test.equal( five.Board.constrain( 100, 0, 255 ), 100 );
    test.equal( five.Board.constrain( -1, 0, 255 ), 0 );
    test.equal( five.Board.constrain( 0, 0, 255 ), 0 );
    test.equal( five.Board.constrain( 256, 0, 255 ), 255 );
    test.equal( five.Board.constrain( 255, 0, 255 ), 255 );

    test.done();
  },
  "Board.map()": function( test ) {
    test.expect(3);

    test.equal( five.Board.map( 1009, 300, 1009, 0, 255 ), 255 );
    test.equal( five.Board.map( 300, 300, 1009, 0, 255 ), 0 );
    test.equal( five.Board.map( 500, 0, 1000, 0, 255 ), 127.5 );

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
  "Board.Options 1": function( test ) {
    test.expect( 1 );
    test.ok( five.Board.Options );
    test.done();
  },

  // Transform string, number and array args into
  // options objects with pin or pins property.
  "Board.Options 2": function( test ) {
    var Board = five.Board,
      tests = [
        { opt: 0,    result: { pin: 0 } },
        { opt: 9,    result: { pin: 9 } },
        { opt: "A0", result: { pin: "A0" } },
        { opt: [ "A0", "A1" ], result: { pins: [ "A0", "A1" ] } },
        { opt: [ 5, 6 ],       result: { pins: [ 5, 6 ] } },
        { opt: { pin: 0 },    result: { pin: 0 } },
        { opt: { pin: 9 },    result: { pin: 9 } },
        { opt: { pin: "A0" }, result: { pin: "A0" } },
        { opt: { pins: [ "A0", "A1" ] }, result: { pins: [ "A0", "A1" ] } },
        { opt: { pins: [ 5, 6 ] },       result: { pins: [ 5, 6 ] } }
      ],
      board = {
        pins: { length: 20, type: "UNO" },
        firmata: {
          analogPins: { length: 6 }
        }
      };

    test.expect( tests.length );

    tests.forEach(function( set ) {
      test.deepEqual( Board.Options(set.opt), set.result );
    });

    test.done();
  },

  "Board.Pins.normalize()": function( test ) {
    var Board = five.Board,
      tests = [
        // Supports short arguments form, string|number
        // new five.Module(pin);
        { opt: 0,    result: { pin: 0 } },
        { opt: 9,    result: { pin: 9 } },
        { opt: "A0", result: { pin: 0 } },

        // Supports short arguments form, array
        // new five.Module([ pin1, pin2, ... ]);
        // ** Analog pins are automatically normalized
        { opt: [ "A0", "A1" ], result: { pins: [ 0, 1 ] } },
        { opt: [ 5, 6 ],       result: { pins: [ 5, 6 ] } },

        // Supports long arguments form, object
        // new five.Module([ pin1, pin2, ... ]);
        // ** Analog pins are automatically normalized
        { opt: { pin: 0 },    result: { pin: 0 } },
        { opt: { pin: 9 },    result: { pin: 9 } },
        { opt: { pin: "A0" }, result: { pin: 0 } },
        { opt: { pins: [ "A0", "A1" ] }, result: { pins: [ 0, 1 ] } },
        { opt: { pins: [ 5, 6 ] },       result: { pins: [ 5, 6 ] } }
      ],
      board = {
        pins: { length: 20, type: "UNO" },
        firmata: {
          analogPins: { length: 6 }
        }
      };

    test.expect( tests.length );

    tests.forEach(function( set ) {
      test.deepEqual( Board.Pins.normalize(set.opt, board), set.result );
    });

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
  // "Board.Pins.*": function( test ) {
  //   test.expect(3);
  //   test.ok( five.Board.Pins.analog, "Board.Pins.analog" );
  //   test.ok( five.Board.Pins.digital, "Board.Pins.digital" );
  //   test.ok( five.Board.Pins.pwm, "Board.Pins.pwm" );
  //   test.done();
  // },
  // "Board.Pins.analog": function( test ) {
  //   test.expect(6);

  //   [ "A0", "A1", "A2", "A3", "A4", "A5" ].forEach(function( pin, mapsTo ) {
  //     test.equal( five.Board.Pins.analog[pin], mapsTo );
  //   });
  //   test.done();
  // },
  // "Board.Pins.pwm": function( test ) {
  //   test.expect(6);
  //   [ 3, 5, 6, 9, 10, 11 ].forEach(function( pin ) {
  //     test.ok( five.Board.Pins.pwm[pin] );
  //   });
  //   test.done();
  // },
  // "Board.Pins.serial": function( test ) {
  //   test.expect(2);
  //   [ 0, 1 ].forEach(function( pin ) {
  //     test.ok( five.Board.Pins.serial[pin] );
  //   });
  //   test.done();
  // },
  // "Board.Pins.spi": function( test ) {
  //   test.expect(4);
  //   [ 10, 11, 12, 13 ].forEach(function( pin ) {
  //     test.ok( five.Board.Pins.spi[pin] );
  //   });
  //   test.done();
  // },
  // "Board.Pins.led": function( test ) {
  //   test.expect(1);

  //   test.ok( five.Board.Pins.led[13] );

  //   test.done();
  // },
  "Board.Event": function( test ) {
    test.expect(2);

    test.ok( boardEvent.type === "read" );
    test.ok( boardEvent.target === serial );

    test.done();
  },
  // "Board.Pin.is___()": function( test ) {
  //   var fixture = {
  //     0: "Serial",
  //     3: "PWM",
  //     7: "Digital",
  //     "A3": "Analog",
  //     "A5": "Analog"
  //   };

  //   test.expect( Object.keys(fixture).length * 2 );

  //   Object.keys( fixture ).forEach(function( pin ) {
  //     test.ok( five.Board.Pin[ "is" + this[ pin ] ]( pin ) );
  //   }, fixture );

  //   // Now test for false
  //   fixture = {
  //     0: "Analog",
  //     3: "Analog",
  //     7: "Serial",
  //     "A3": "Digital",
  //     "A5": "Digital"
  //   };

  //   Object.keys( fixture ).forEach(function( pin ) {
  //     test.ok( !five.Board.Pin[ "is" + this[ pin ] ]( pin ) );
  //   }, fixture );

  //   test.done();
  // }

};


exports["instance"] = {
  "cache": function( test ) {
    test.expect(1);
    test.equal( five.Board.cache.length, 1 );
    test.done();
  },
  "instance": function( test ) {
    test.expect(1);
    test.ok( board );
    test.done();
  },
  "firmata": function( test ) {
    test.expect(1);
    test.ok( board.firmata );
    test.done();
  },
  "id": function( test ) {
    test.expect(1);
    test.ok( board.id );
    test.done();
  },
  "repl": function( test ) {
    test.expect(2);
    test.ok( board.repl );
    test.ok( board.repl.context );
    test.done();
  },
  "pins": function( test ) {
    test.expect(1);
    test.ok( typeof board.pins !== "undefined" );
    test.done();
  },
};


exports["fn"] = {
  "cache": function( test ) {
    test.expect(6);

    test.equal( __.scale( 10, 0, 20, 0, 100), 50, "scale up" );
    test.equal( __.scale( 10, 0, 20, 100, 0), 50, "scale up reversed" );

    test.equal( __.scale( 10, 0, 10, 0, 180), 180, "max is 180" );
    test.equal( __.scale( 10, 0, 10, 180, 0), 0, "max is 0" );

    test.equal( __.scale( 0, 0, 10, 180, 0), 180, "min is 180" );
    test.equal( __.scale( 0, 0, 10, 0, 180), 0, "min is 0" );

    test.done();
  }
};

// TODO: need mock firmata object
// exports["modules"] = {
//   "optional-new": function( test ) {
//     var modules = Object.keys(five);

//     // test.expect(modules * 2);

//     modules.forEach(function( module ) {

//       var instance = new five[ module ]({});

//       console.log( instance );
//     });
//   }
// };
