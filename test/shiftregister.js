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

    this.shiftRegister = new ShiftRegister({
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

    this.pins = [
      { name: "data" },
      { name: "clock" },
      { name: "latch" }
    ];

    done();
  },
  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length + this.pins.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.shiftRegister[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.shiftRegister[ property.name ], "undefined" );
    }, this);
    
    this.pins.forEach(function( property ) {
      test.notEqual( typeof this.shiftRegister.pins[ property.name ], "undefined" );
    }, this);

    test.done();
  },
  send: function( test ){
    test.expect(2);

    this.shiftRegister.send(0x01);
    test.deepEqual( serial.lastWrite, [ 144, 28, 0 ] );

    this.shiftRegister.send(0x10);
    test.deepEqual( serial.lastWrite, [ 144, 24, 0 ] );

    test.done();
  }

};
