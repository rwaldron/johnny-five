var SerialPort = require("./mock-serial").SerialPort,
    pins = require("./mock-pins"),
    five = require("../lib/johnny-five.js"),
    events = require("events"),
    serial = new SerialPort("/path/to/fake/usb"),
    Board = five.Board,
    Ping = five.Ping,
    board = new five.Board({
      repl: false,
      debug: true,
      mock: serial
    });

board.firmata.versionRecieved = true;
board.firmata.pins = pins.UNO;
board.firmata.analogPins = [ 14, 15, 16, 17, 18, 19 ];
board.pins = Board.Pins( board );

exports["Ping"] = {

  setUp: function( done ) {

    this.ping = new Ping({ pin: 7, freq: 5, board: board });

    this.proto = [];
    this.instance = [
      { name: "id" },
      { name: "freq" },
      { name: "pulse" },
      { name: "inches" },
      { name: "cm" }
    ];

    done();
  },
  tearDown: function( done ) {
    //board.firmata._events["analog-read-1"] = [];

    done();
  },

  shape: function( test ) {

    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.ping[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.ping[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  data: function( test ) {
    test.expect(1);

    var counter = 0;
    var interval;

    this.ping.on("data", function() {
      counter++;
      //console.log( this.value );
      if ( counter === 5 ) {
        clearInterval( interval );
        test.ok( true );
        test.done();
      }
    });

    interval = setInterval(function() {
      serial.emit( "data", [ 255 ]);
    });
  },

  change: function( test ) {
    test.expect(1);

    var counter = 0;
    var interval;

    this.ping.on("change", function() {

      counter++;
      if (counter === 10) {
        clearInterval( interval );
        test.ok( true );
        test.done();
      }
    });

    interval = setInterval(function() {
      serial.emit( "data", [ 200 , 255 , 225 ]);
    });
  }
};
