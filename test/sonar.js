var SerialPort = require("./mock-serial").SerialPort,
    MockFirmata = require("./mock-firmata"),
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
    }),
    sinon = require("sinon");


board.firmata.versionReceived = true;
board.firmata.pins = pins.UNO;
board.firmata.analogPins = [ 14, 15, 16, 17, 18, 19 ];
board.pins = Board.Pins( board );

function newBoard() {
  return new five.Board({
    firmata: new MockFirmata(),
    repl: false
  });
}

exports["Sonar"] = {

  setUp: function( done ) {
    
    this.board = newBoard();
    this.sonar = new Sonar({ pin: 9, board: this.board });

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
  },

  data: function( test ) {
    test.expect(1);

    var board = this.board;
    var counter = 0;
    var interval;

    this.sonar.on("data", function() {
      counter++;
      if ( counter === 5 ) {
        clearInterval( interval );
        test.ok( true );
        test.done();
      }
    });

    interval = setInterval(function() {
      board.firmata.analogWrite( 9 , 255 );
    });
  }

};
