var SerialPort = require("./mock-serial").SerialPort,
    pins = require("./mock-pins"),
    five = require("../lib/johnny-five.js"),
    serial = new SerialPort("/path/to/fake/usb"),
    Board = five.Board,
    ShiftRegister = five.ShiftRegister,
    board = new five.Board({
      repl: false,
      debug: true,
      mock: serial
    });

board.firmata.pins = pins.UNO;
board.firmata.analogPins = [ 14, 15, 16, 17, 18, 19 ];
board.pins = Board.Pins( board );


// END

exports["ShiftRegister"] = {
  
  setUp: function( done ) {

    this.shiftRegister = new five.ShiftRegister({
      pins: {
        data: 2,
        clock: 3,
        latch: 4
      },
      board: board
    });

    this.proto = [
      { name: "send" }
    ];

    this.instance = [
      { name: "pins" }
    ];

    done();
  },
  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.shiftRegister[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.shiftRegister[ property.name ], "undefined" );
    }, this);

    test.done();
  },
  send: function( test ){
    test.expect(1);

    test.ok(0x11);

    console.log( serial.lastWrite );

    test.done();
  }

};