var SerialPort = require("./mock-serial").SerialPort,
    MockFirmata = require("./mock-firmata"),
    pins = require("./mock-pins"),
    five = require("../lib/johnny-five.js"),
    events = require("events"),
    serial = new SerialPort("/path/to/fake/usb"),
    Board = five.Board,
    sinon = require("sinon"),
    Switch = five.Switch,
    board = new five.Board({
      repl: false,
      firmata: new MockFirmata()
    });

exports["Switch"] = {
  setUp: function( done ) {
    
    this.clock = sinon.useFakeTimers();
    this.switch = new Switch({ pin: 8, freq: 5, board: board });

    this.proto = [];

    this.instance = [
      { name: "isClosed" }
    ];

    done();
  },

  tearDown: function( done ) {
    this.clock.restore();
    done();
  },

  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.switch[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.switch[ property.name ], "undefined" );
    }, this);

    test.done();
  }
};
