var MockFirmata = require("./mock-firmata"),
    pins = require("./mock-pins"),
    five = require("../lib/johnny-five.js"),
    events = require("events"),
    Board = five.Board,
    Button = five.Button,
    board = new five.Board({
      repl: false,
      firmata: new MockFirmata()
    });

exports["Button"] = {
  setUp: function( done ) {

    this.button = new Button({ pin: 8, freq: 5, board: board });

    this.proto = [];

    this.instance = [
      { name: "isPullup" },
      { name: "invert" },
      { name: "downValue" },
      { name: "upValue" },
      { name: "holdtime" },
      { name: "isDown" },
      { name: "downValue" },
      { name: "upValue" }
    ];

    done();
  },

  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.button[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.button[ property.name ], "undefined" );
    }, this);

    test.done();
  }
};
