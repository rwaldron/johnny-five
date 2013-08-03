var SerialPort = require("./mock-serial").SerialPort,
    pins = require("./mock-pins"),
    five = require("../lib/johnny-five.js"),
    events = require("events"),
    serial = new SerialPort("/path/to/fake/usb"),
    Board = five.Board,
    Sensor = five.Sensor,
    board = new five.Board({
      repl: false,
      debug: true,
      mock: serial
    });

board.firmata.versionReceived = true;
board.firmata.pins = pins.UNO;
board.firmata.analogPins = [ 14, 15, 16, 17, 18, 19 ];
board.pins = Board.Pins( board );



exports["Sensor"] = {
  setUp: function( done ) {




    this.sensor = new Sensor({ pin: "A1", freq: 5, board: board });

    this.proto = [
      { name: "scale" },
      { name: "scaleTo" },
      { name: "booleanAt" },
      { name: "within" }
    ];

    this.instance = [
      { name: "id" },
      { name: "pin" },
      { name: "mode" },
      { name: "freq" },
      { name: "range" },
      { name: "threshold" },
      { name: "isScaled" },
      { name: "raw" },
      { name: "constrained" },
      { name: "boolean" },
      { name: "scaled" },
      { name: "value" },
    ];

    done();
  },

  tearDown: function( done ) {
    board.firmata._events["analog-read-1"] = [];

    done();
  },


  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.sensor[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.sensor[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  emitter: function( test ) {
    test.expect( 1 );

    test.ok( this.sensor instanceof events.EventEmitter );

    test.done();
  },

  data: function( test ) {
    test.expect(1);

    var counter = 0;
    var interval;

    this.sensor.on("data", function() {
      if ( this.value === 1023 ) {
        counter++;
      }
      if ( counter === 10 ) {
        clearInterval( interval );
        test.ok( true );
        test.done();
      }
    });

    interval = setInterval(function() {
      // 1023 uninterrupted
      serial.emit( "data", [ 0xE0 | (1 & 0xF), 1023%128, 1023>>7 ]);
    });
  },

  change: function( test ) {
    test.expect(1);

    var counter = 0;
    var interval;

    this.sensor.on("data", function() {
      if ( this.value === 1023 ) {
        counter++;
      }
    });

    this.sensor.on("change", function() {
      // We'll ignore the first change,
      // which is null -> 1023
      //
      if ( this.value === 512 ) {
        clearInterval( interval );
        test.ok( true );
        test.done();
      }
    });

    interval = setInterval(function() {
      // 1023 then changes to 512
      serial.emit( "data", [ 0xE0 | (1 & 0xF), 1023%128, 1023>>7 ]);

      if ( counter > 50 ) {
        serial.emit( "data", [ 0xE0 | (1 & 0xF), 512%128, 512>>7 ]);
      }
    });
  },

  scale: function( test ) {
    test.expect(1);

    var counter = 0;
    var interval;

    // Scale the expected 0-1023 to a value between 50-100 (~75)
    this.sensor.scale(50, 100);

    this.sensor.on("data", function() {
      if ( this.value|0 === 100 ) {
        counter++;
      }
    });

    this.sensor.on("change", function() {
      if ( this.value|0 === 75 ) {
        clearInterval( interval );
        test.ok( true );
        test.done();
      }
    });

    interval = setInterval(function() {
      // 1023 then changes to 512
      serial.emit( "data", [ 0xE0 | (1 & 0xF), 1023%128, 1023>>7 ]);

      if ( counter > 50 ) {
        serial.emit( "data", [ 0xE0 | (1 & 0xF), 512%128, 512>>7 ]);
      }
    });
  },

  within: function( test ) {
    test.expect(1);

    var counter = 0;
    var isComplete = false;
    var interval;

    this.sensor.on("data", function() {
      if ( this.value === 1023 ) {
        counter++;
      }
    });

    // While the sensor value is between the given values,
    // invoke the registered handler.
    this.sensor.within([ 400, 600 ], function() {
      if ( !isComplete && this.value === 512 ) {
        isComplete = true;
        clearInterval( interval );
        test.ok( true );
        test.done();
      }
    });

    interval = setInterval(function() {
      // 1023 then changes to 512
      serial.emit( "data", [ 0xE0 | (1 & 0xF), 1023%128, 1023>>7 ]);

      if ( counter > 50 ) {
        serial.emit( "data", [ 0xE0 | (1 & 0xF), 512%128, 512>>7 ]);
      }
    });
  },

  booleanAt: function( test ) {
    test.expect(1);

    var counter = 0;
    var isComplete = false;
    var interval;

    this.sensor.booleanAt(512);

    this.sensor.on("data", function() {
      if ( this.boolean === true ) {
        counter++;
      }
    });

    // While the sensor value is between the given values,
    // invoke the registered handler.
    this.sensor.on("change", function() {
      if ( !isComplete && this.boolean === false ) {
        isComplete = true;
        clearInterval( interval );
        test.ok( true );
        test.done();
      }
    });

    interval = setInterval(function() {
      // 1023 then changes to 512
      serial.emit( "data", [ 0xE0 | (1 & 0xF), 1023%128, 1023>>7 ]);

      if ( counter > 50 ) {
        serial.emit( "data", [ 0xE0 | (1 & 0xF), 0%128, 0>>7 ]);
      }
    });
  },


  constrained: function( test ) {
    test.expect(1);

    var counter = 0;
    var isComplete = false;
    var interval;

    this.sensor.on("data", function() {
      if ( !isComplete && this.constrained === 255 ) {
        isComplete = true;
        clearInterval( interval );
        test.ok( true );
        test.done();
      }
    });

    interval = setInterval(function() {
      // 1023
      serial.emit( "data", [ 0xE0 | (1 & 0xF), 1023%128, 1023>>7 ]);
    });
  }
};
