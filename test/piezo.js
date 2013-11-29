var five = require("../lib/johnny-five.js"),
    sinon = require("sinon"),
    MockFirmata = require("./mock-firmata"),
    Board = five.Board,
    Piezo = five.Piezo;

exports["Piezo"] = {

  setUp: function( done ) {
    this.board = new Board({
      repl: false,
      firmata: new MockFirmata()
    });

    this.clock = sinon.useFakeTimers();
    this.spy = sinon.spy( this.board.firmata, "digitalWrite" );

    this.piezo = new Piezo({ pin: 3, board: this.board });

    this.proto = [
      { name: "tone" },
      { name: "noTone" },
      { name: "song" }
    ];

    this.instance = [
      { name: "playing" }
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
      test.equal( typeof this.piezo[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.piezo[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  tone: function( test ) {
    test.expect(1);

    this.piezo.tone( 1915, 1000 );
    test.ok(this.spy.called);

    test.done();
  },

  noTone: function( test ) {
    test.expect(1);

    this.piezo.noTone();
    test.ok(this.spy.calledWith(3, 0));

    test.done();
  },

  song: function( test ) {
    test.expect(1);

    this.piezo.song(" ", "1");
    test.ok(this.spy.calledWith(3, 0));

    test.done();
  },

};
