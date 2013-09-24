var MockFirmata = require("./mock-firmata"),
    sinon = require("sinon"),
    pins = require("./mock-pins"),
    five = require("../lib/johnny-five.js"),
    Board = five.Board,
    Ping = five.Ping,
    board = new five.Board({
      repl: false,
      firmata: new MockFirmata()
    });

exports["Ping"] = {

  setUp: function( done ) {
    this.clock = sinon.useFakeTimers();
    this.ping = new Ping({ pin: 7, board: board });

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
    this.clock.restore();
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
    var spy = sinon.spy();
    test.expect(1);
    this.ping.on("data", spy);
    this.clock.tick(100); // default freq
    test.ok(spy.calledOnce);
    test.done();
  },

  change: function( test ) {
    var spy = sinon.spy();
    test.expect(1);
    this.ping.on("change", spy);
    // board.firmata.pulseValue = 1;
    // this.clock.tick(500);
    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();

  }
};
