var SerialPort = require("./mock-serial").SerialPort,
    pins = require("./mock-pins"),
    five = require("../lib/johnny-five.js"),
    events = require("events"),
    serial = new SerialPort("/path/to/fake/usb"),
    Board = five.Board,
    Pir = five.Pir,
    board = new five.Board({
      repl: false,
      debug: true,
      mock: serial
    });

board.firmata.versionReceived = true;
board.firmata.pins = pins.UNO;
board.firmata.analogPins = [ 14, 15, 16, 17, 18, 19 ];
board.pins = Board.Pins( board );



exports["Pir"] = {
  setUp: function( done ) {

    this.pir = new Pir({ pin: 11, freq: 50, board: board });

    this.instance = [
      { name: "id" },
      { name: "pin" },
      { name: "mode" },
      { name: "freq" },
      { name: "value" },
      { name: "isCalibrated" }
    ];

    done();
  },

  tearDown: function( done ) {
    this.pir.removeAllListeners();

    // board.firmata._events['digital-read-11'] = [];

    done();
  },

  shape: function( test ) {
    test.expect( this.instance.length );

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.pir[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  emitter: function( test ) {
    test.expect( 1 );

    test.ok( this.pir instanceof events.EventEmitter );

    test.done();
  },

  data: function( test ) {
    test.expect(1);

    var counter = 0;
    var interval;

    this.pir.on("data", function() {
      if ( this.value === 1 ) {
        counter++;
      }
      if ( counter === 10 ) {
        clearInterval( interval );
        test.ok( true );
        test.done();
      }
    });

    interval = setInterval(function() {
      // 1 uninterrupted
      serial.emit( "data", [ 145, 8, 0 ]);
    });
  },

  motionstart: function( test ) {
    test.expect(1);

    var counter = 0;
    var interval;

    this.pir.on("data", function() {
      counter++;
    });

    this.pir.on("motionstart", function() {
      clearInterval( interval );
      test.ok( true );
      test.done();
    });

    interval = setInterval(function() {
      // 0 then changes to 1
      serial.emit( "data", [ 145, 0, 0 ]);

      if ( counter > 10 ) {
        serial.emit( "data", [ 145, 8, 0 ]);
      }
    });
  },

  motionend: function( test ) {
    test.expect(1);

    var counter = 0;
    var interval;

    this.pir.on("data", function() {
      counter++;
    });

    this.pir.on("motionend", function() {
      clearInterval( interval );
      test.ok( true );
      test.done();
    });

    interval = setInterval(function() {
      // 1 then changes to 0
      serial.emit( "data", [ 145, 8, 0 ]);

      if ( counter > 10 ) {
        serial.emit( "data", [ 145, 0, 0 ]);
      }
    });
  }
};
