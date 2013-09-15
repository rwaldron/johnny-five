var MockFirmata = require("./mock-firmata"),
    five = require("../lib/johnny-five.js"),
    events = require("events"),
    sinon = require("sinon"),
    Board = five.Board,
    Pir = five.Pir,
    board = new five.Board({
      repl: false,
      firmata: new MockFirmata()
    });


exports["Pir"] = {
  setUp: function( done ) {
    this.clock = sinon.useFakeTimers();
    this.digitalRead = sinon.spy(board.firmata, 'digitalRead');
    this.pir = new Pir({ pin: 11, board: board });

    this.instance = [
      { name: "id" },
      { name: "pin" },
      { name: "mode" },
      { name: "freq" },
      { name: "value" },
      { name: "isCalibrated" }
    ];

    done();
  },

  tearDown: function( done ) {
    this.pir.removeAllListeners();
    this.clock.restore();
    this.digitalRead.restore();
    done();
  },

  shape: function( test ) {
    test.expect( this.instance.length );

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.pir[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  emitter: function( test ) {
    test.expect( 1 );

    test.ok( this.pir instanceof events.EventEmitter );

    test.done();
  },

  data: function( test ) {
    var spy = sinon.spy();
    test.expect(1);
    this.pir.on("data", spy);
    this.clock.tick(25);
    test.ok(spy.calledOnce);
    test.done();
  },

  motionstart: function( test ) {
    var callback = this.digitalRead.args[0][1],
        spy = sinon.spy();

    test.expect(1);
    this.pir.on("motionstart", spy);

    // 0 then changes to 1
    callback(0);
    callback(1);

    test.ok(spy.calledOnce);
    test.done();
  },

  motionend: function( test ) {
    var callback = this.digitalRead.args[0][1],
        spy = sinon.spy();

    test.expect(1);
    this.pir.on("motionend", spy);

    // 1 then changes to 0
    callback(1);
    callback(0);

    test.ok(spy.calledOnce);
    test.done();
  }
};
