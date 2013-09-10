var SerialPort = require("./mock-serial").SerialPort,
    pins = require("./mock-pins"),
    five = require("../lib/johnny-five.js"),
    events = require("events"),
    serial = new SerialPort("/path/to/fake/usb"),
    Board = five.Board,
    Sonar = five.Sonar,
    board = new five.Board({
      repl: false,
      debug: true,
      mock: serial
    });

board.firmata.versionReceived = true;
board.firmata.pins = pins.UNO;
board.firmata.analogPins = [ 14, 15, 16, 17, 18, 19 ];
board.pins = Board.Pins( board );

exports["Sonar"] = {
  setUp: function( done ) {
    
    this.sonar = new Sonar({ pin: "A2", board: board });

    this.proto = [];

    this.instance = [
      { name: "inches" },
      { name: "cm" }
    ];

    done();
  },
  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.sonar[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.sonar[ property.name ], "undefined" );
    }, this);

    test.done();
  }
};
