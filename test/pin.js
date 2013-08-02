var SerialPort = require("./mock-serial").SerialPort,
    pins = require("./mock-pins"),
    five = require("../lib/johnny-five.js"),
    events = require("events"),
    serial = new SerialPort("/path/to/fake/usb"),
    Board = five.Board,
    Pin = five.Pin
    board = new five.Board({
      repl: false,
      debug: true,
      mock: serial
    });

board.firmata.versionReceived = true;
board.firmata.pins = pins.UNO
board.firmata.analogPins = [ 14, 15, 16, 17, 18, 19 ];
board.pins = new Board.Pins( board );


board.firmata.setMaxListeners(1000);

exports["Pin"] = {
  setUp: function( done ) {

    this.digital = new five.Pin({ pin: 11, board: board });
    this.analog = new five.Pin({ pin: "A1", board: board });

    this.proto = [
      { name: "query" },
      { name: "high" },
      { name: "low" },
      { name: "read" },
      { name: "write" },
      { name: "mode" }
    ];

    this.instance = [
      { name: "id" },
      { name: "pin" },
      { name: "type" },
      { name: "addr" },
      { name: "value" }
    ];

    done();
  },

  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.digital[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.digital[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  emitter: function( test ) {
    test.expect( 1 );

    test.ok( this.digital instanceof events.EventEmitter );

    test.done();
  },


  digital: function( test ) {
    test.expect(1);

    test.equal( this.digital.type, "digital" );

    test.done();
  },

  analog: function( test ) {
    test.expect(1);

    test.equal( this.analog.type, "analog" );

    test.done();
  },

  high: function( test ) {
    test.expect(2);

    this.digital.high();
    test.deepEqual( serial.lastWrite, [ 145, 72, 1 ] );

    this.analog.high();
    test.deepEqual( serial.lastWrite, [ 225, 1, 0 ] );

    test.done();
  },

  low: function( test ) {
    test.expect(2);

    this.digital.low();
    test.deepEqual( serial.lastWrite, [ 145, 64, 1 ] );

    this.analog.low();
    test.deepEqual( serial.lastWrite, [ 225, 0, 0 ] );

    test.done();
  },

  write: function( test ) {
    test.expect(4);

    this.digital.write(1);
    test.deepEqual( serial.lastWrite, [ 145, 72, 1 ] );

    this.digital.write(0);
    test.deepEqual( serial.lastWrite, [ 145, 64, 1 ] );


    this.analog.write(1023);
    test.deepEqual( serial.lastWrite, [ 225, 127, 7 ] );

    this.analog.write(0);
    test.deepEqual( serial.lastWrite, [ 225, 0, 0 ] );

    test.done();
  },

  // Read Digital/Analog are adapted from Firmata tests.
  //
  readDigital: function( test ) {
    test.expect(1);

    var counter = 0;
    var order = [ 1, 0, 1, 0 ];

    this.digital.read(function() {
      if ( this.value === 1 ) {
        counter++;
      }
      if ( this.value === 0 ) {
        counter++;
      }
      if ( order[0] === this.value ) {
        order.shift();
      }
      if ( counter === 4 ) {
        test.equal( order.length, 0 );
        test.done();
      }
    });

    // Single Byte
    serial.emit( "data", [ 145 ]);
    serial.emit( "data", [ 8 ]);
    serial.emit( "data", [ 0 ]);

    serial.emit( "data", [ 145 ]);
    serial.emit( "data", [ 0 ]);
    serial.emit( "data", [ 0 ]);

    // Multi Byte
    serial.emit( "data", [ 145, 8, 0 ]);
    serial.emit( "data", [ 145, 0, 0 ]);
  },

  readAnalog: function( test ) {
    test.expect(1);

    var counter = 0;
    var order = [ 1023, 0, 1023, 0 ];

    this.analog.read(function() {
      if ( this.value === 1023 ) {
        counter++;
      }
      if ( this.value === 0 ) {
        counter++;
      }
      if ( order[0] === this.value ) {
        order.shift();
      }
      if ( counter === 4 ) {
        test.equal( order.length, 0 );
        test.done();
      }
    });

    // Single Byte
    serial.emit( "data", [ 0xE0 | (1 & 0xF) ]);
    serial.emit( "data", [ 1023%128 ]);
    serial.emit( "data", [ 1023>>7 ]);

    serial.emit( "data", [ 0xE0 | (1 & 0xF) ]);
    serial.emit( "data", [ 0%128 ]);
    serial.emit( "data", [ 0>>7 ]);

    // Multi Byte
    serial.emit( "data", [ 0xE0 | (1 & 0xF), 1023%128, 1023>>7 ]);
    serial.emit( "data", [ 0xE0 | (1 & 0xF), 0%128, 0>>7 ]);
  }
};


exports["Pin.isPrefixed"] = {
  is: function( test ) {
    test.expect(2);

    test.ok( Pin.isPrefixed("A0", [ "A", "I" ]) );
    test.ok( Pin.isPrefixed("I0", [ "A", "I" ]) );

    test.done();
  },
  not: function( test ) {
    test.expect(2);

    test.ok( !Pin.isPrefixed(9, [ "A", "I" ]) );
    test.ok( !Pin.isPrefixed("O0", [ "A", "I" ]) );

    test.done();
  }
};

exports["Pin.isAnalog"] = {
  is: function( test ) {
    test.expect(6);

    test.ok( Pin.isAnalog("A0") );
    test.ok( Pin.isAnalog("I0") );

    test.ok( Pin.isAnalog({ pin: "A0" }) );
    test.ok( Pin.isAnalog({ pin: "I0" }) );

    test.ok( Pin.isAnalog({ addr: "A0" }) );
    test.ok( Pin.isAnalog({ addr: "I0" }) );


    test.done();
  },
  not: function( test ) {
    test.expect(2);

    test.ok( !Pin.isAnalog(9) );
    test.ok( !Pin.isAnalog("O0") );

    test.done();
  }
};


// * Pin.INPUT   = 0x00
// * Pin.OUTPUT  = 0x01
// * Pin.ANALOG  = 0x02
// * Pin.PWM     = 0x03
// * Pin.SERVO   = 0x04
