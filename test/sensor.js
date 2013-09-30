var MockFirmata = require("./mock-firmata"),
    five = require("../lib/johnny-five.js"),
    events = require("events"),
    sinon = require("sinon"),
    Board = five.Board,
    Sensor = five.Sensor,
    board = new five.Board({
      repl: false,
      firmata: new MockFirmata()
    });

exports["Sensor"] = {
  setUp: function( done ) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.firmata, "analogRead");
    this.sensor = new Sensor({ pin: "A1", board: board });

    this.proto = [
      { name: "scale" },
      { name: "scaleTo" },
      { name: "booleanAt" },
      { name: "within" }
    ];

    this.instance = [
      { name: "id" },
      { name: "pin" },
      { name: "mode" },
      { name: "freq" },
      { name: "range" },
      { name: "threshold" },
      { name: "isScaled" },
      { name: "raw" },
      { name: "analog" },
      { name: "constrained" },
      { name: "boolean" },
      { name: "scaled" },
      { name: "value" },
    ];

    done();
  },

  tearDown: function( done ) {
    this.clock.restore();
    this.analogRead.restore();
    done();
  },

  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.sensor[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.sensor[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  emitter: function( test ) {
    test.expect( 1 );

    test.ok( this.sensor instanceof events.EventEmitter );

    test.done();
  },

  data: function( test ) {
    var spy = sinon.spy();
    test.expect(1);
    this.sensor.on("data", spy);
    this.clock.tick(25);
    test.ok(spy.calledOnce);
    test.done();
  },

  change: function( test ) {
    var callback = this.analogRead.args[0][1],
        spy = sinon.spy();

    test.expect(2);
    this.sensor.on("change", spy);
    callback(1023);
    this.clock.tick(25);
    callback(512);
    this.clock.tick(25);

    test.equal(spy.getCall(0).args[1], 1023);
    test.equal(spy.getCall(1).args[1], 512);
    test.done();
  },

  scale: function( test ) {
    var callback = this.analogRead.args[0][1];

    test.expect(2);

    // Scale the expected 0-1023 to a value between 50-100 (~75)
    this.sensor.scale(50, 100);

    this.sensor.once("change", function() {
      test.equal(this.value, 100);
    });
    callback(1023);
    this.clock.tick(25);

    this.sensor.once("change", function() {
      test.equal(this.value, 50);
    });
    callback(0);
    this.clock.tick(25);

    test.done();
  },

  within: function( test ) {
    var callback = this.analogRead.args[0][1];

    test.expect(1);

    // While the sensor value is between the given values,
    // invoke the registered handler.
    this.sensor.within([ 400, 600 ], function() {
      test.equal(this.value, 500);
    });

    callback(1023);
    this.clock.tick(25);
    callback(500);
    this.clock.tick(25);
    callback(0);
    this.clock.tick(25);

    test.done();
  },

  booleanAt: function( test ) {
    var callback = this.analogRead.args[0][1],
        expected = false;
    test.expect(2);

    this.sensor.booleanAt(512);

    this.sensor.on("data", function() {
      test.equals(this.boolean, expected);
    });

    callback(500);
    this.clock.tick(25);
    expected = true;
    callback(600);
    this.clock.tick(25);

    test.done();
  },

  constrained: function( test ) {
    var callback = this.analogRead.args[0][1];
    test.expect(1);

    this.sensor.on("data", function() {
      test.equals(this.constrained, 255);
    });

    callback(1023);
    this.clock.tick(25);
    test.done();
  },

  analog: function( test ) {
    var callback = this.analogRead.args[0][1];

    test.expect(3);

    callback(1023);
    test.equals(this.sensor.analog, 255);

    callback(0);
    test.equals(this.sensor.analog, 0);

    callback(512);
    test.equals(this.sensor.analog, 127);

    test.done();
  }
};
