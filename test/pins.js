var Pins = require("../lib/board.pins.js");

exports["static"] = {
  "Pins.normalize()": function( test ) {
    var tests = [
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
      test.deepEqual( Pins.normalize(set.opt, board), set.result );
    });

    test.done();
  }
};
