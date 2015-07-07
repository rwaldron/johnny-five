var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  Sensor = five.Sensor,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["Sensor - Analog"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.sensor = new Sensor({
      pin: "A1",
      board: board
    });

    this.defFreq = 25;

    this.methods = [
      "constructor",
      "within",
      "scale",
      "scaleTo",
      "booleanAt"
    ];

    this.members = {
      id: { type: "object" },
      pin: { type: "number" },
      mode: { type: "number" },
      freq: { type: "number" },
      range: { type: "object" },
      threshold: { type: "number" },
      isScaled: { type: "boolean" },
      raw: { type: "object" }, // defined property that returns var inited to null
      analog: { type: "object" }, // defined property
      constrained: { type: "object" }, // defined property
      boolean: { type: "boolean" }, // defined property always true or false
      scaled: { type: "object" }, // defined property
      value: { type: "object" }, // defined property

      board: { type: "object" },
      io: { type: "object" },
      limit: { type: "object" } // null initial value
    };

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.analogRead.restore();
    done();
  },

  shape: function(test) {
    var propsActual, propsExpected, methodsActual;
    propsActual = Object.getOwnPropertyNames(this.sensor);
    propsExpected = Object.getOwnPropertyNames(this.members);
    methodsActual = Object.getOwnPropertyNames(Object.getPrototypeOf(this.sensor));

    test.expect(9 + 3 * (this.methods.length + propsExpected.length));

    // Verify that all of the expected prototype functions and properties exist for the instance
    this.methods.forEach(function(proto) {
      test.ok(methodsActual.includes(proto), "missing '" + proto + "' sensor prototype method");
    }, this);
    propsExpected.forEach(function(property) {
      test.ok(propsActual.includes(property), "missing '" + property + "' sensor instance property");
    }, this);

    // Make sure that all of the existing instance properties and prototype methods are actually expected, and the correct datatype
    propsActual.forEach(function(property) {
      test.ok(propsActual.includes(property), "found unexpected " + property + " sensor instance member");
      test.strictEqual(typeof this.sensor[property], this.members[property].type, "Unexected datatype found for '" + property + "' property");
    }, this);
    methodsActual.forEach(function(proto) {
      test.ok(this.methods.includes(proto), "found unexpected '" + proto + "' sensor prototype method");
      test.strictEqual(typeof this.sensor[proto], "function", "Unexected datatype found for '" + proto + "' method");
    }, this);

    test.strictEqual(this.sensor.board, board, "Expected to be the mock board");
    test.strictEqual(this.sensor.io, board.io, "Expected to be the same io as the mock board");
    test.strictEqual(this.sensor.mode, this.sensor.io.MODES.ANALOG, "Expected to be analog mode");
    test.strictEqual(this.sensor.freq, this.defFreq, "defaulted freq value expected to be " + this.defFreq + ", found '" + this.sensor.freq + "'");
    test.ok(Array.isArray(this.sensor.range) && this.sensor.range.length === 2, "range property should be a 2 element array");
    test.ok(this.sensor.range[0] === 0 && this.sensor.range[1] === 1023, "defaulted range should be [0, 1023]");
    test.strictEqual(this.sensor.limit, null, "defaulted limit should be null");
    test.strictEqual(this.sensor.threshold, 1, "defaulted threshold should be 1");
    test.strictEqual(this.sensor.isScaled, false, "defaulted isScaled flag should be false");

    test.done();
  },

  emitter: function(test) {
    test.expect(1);

    test.ok(this.sensor instanceof events.EventEmitter);

    test.done();
  },

  data: function(test) {
    var tickAccum, tickDelta, spy = sinon.spy();
    test.expect(7);

    this.sensor.on("data", spy);
    tickAccum = 0;
    test.ok(!spy.called, "tick " + tickAccum + ": data event handler should not be called until tick " + this.defFreq);
    tickDelta = this.defFreq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.ok(!spy.called, "tick " + tickAccum + ": data event handler should not be called until tick " + this.defFreq);
    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.ok(spy.called, "tick " + tickAccum + ": data event handler should have been called at tick " + this.defFreq);
    test.ok(spy.calledOnce);
    tickDelta = this.defFreq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.ok(spy.calledOnce, "tick" + tickAccum + ": data event handler should not be called again until tick " + (this.defFreq * 2));
    test.ok(spy.calledOnce);
    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.ok(spy.calledTwice, "tick " + tickAccum + ": data event handler should be called again at tick " + (this.defFreq * 2));

    test.done();
  },

  filtered: function(test) {
    var callback = this.analogRead.args[0][1],
      dataSpy = sinon.spy(),
      chgSpy = sinon.spy(),
      tickDelta, tickAccum, spyCall;
    test.expect(20);

    this.sensor.on("data", dataSpy);
    this.sensor.on("change", chgSpy);
    tickAccum = 0;
    callback(100);
    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    callback(102);
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    callback(101);
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    callback(103);
    tickDelta = this.defFreq - tickAccum - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    callback(104);
    test.ok(!dataSpy.called, "tick " + tickAccum + ": data event handler should not be called until tick " + this.defFreq);
    test.ok(!chgSpy.called, "tick " + tickAccum + ": change event handler should not be called until tick " + this.defFreq);
    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;

    test.ok(dataSpy.calledOnce, "tick " + tickAccum + ": data event handler should be called at tick " + this.defFreq);
    test.ok(chgSpy.calledOnce, "tick " + tickAccum + ": change event handler should be called at tick " + this.defFreq);
    spyCall = dataSpy.getCall(0);
    test.strictEqual(spyCall.args[0], null, "data event err argument expected to be null");
    test.strictEqual(spyCall.args[1], 102, "data event value expected to be the median (102) value");
    test.ok(spyCall.calledOn(this.sensor), "data event 'this' parameter expected to be source sensor object");
    spyCall = chgSpy.getCall(0);
    test.strictEqual(spyCall.args[0], null, "change event err argument expected to be null");
    test.strictEqual(spyCall.args[1], 102, "change event value expected to be the median (102) value");
    test.ok(spyCall.calledOn(this.sensor), "change event 'this' parameter expected to be source sensor object");

    test.strictEqual(this.sensor.raw, 104, "sensor raw property expected to be the last value read (injected)");
    test.strictEqual(this.sensor.value, 104, "sensor value property expected to be the last value read (injected)");

    // Check for non-integer median value (when even number of data points)
    tickAccum = 0;
    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    callback(102);
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    callback(106);
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    callback(101);
    tickDelta = this.defFreq - tickAccum - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta + this.defFreq;
    callback(103);
    test.ok(dataSpy.calledOnce, "tick " + tickAccum + ": data event handler should not be called again until tick " + this.defFreq * 2);

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.ok(dataSpy.calledTwice, "tick " + tickAccum + ": data event handler should be called again at tick " + this.defFreq * 2);
    test.ok(chgSpy.calledOnce, "tick " + tickAccum + ": change event handler should not be called yet: data points do not exceed change threshold");

    spyCall = dataSpy.getCall(1);
    test.strictEqual(spyCall.args[0], null, "data event err argument expected to be null");
    test.strictEqual(spyCall.args[1], 102.5, "data event value expected to be the median (102.5) value");
    test.ok(spyCall.calledOn(this.sensor), "data event 'this' parameter expected to be source sensor object");

    test.strictEqual(this.sensor.raw, 103, "sensor raw property expected to be the last value read (injected)");
    test.strictEqual(this.sensor.value, 103, "sensor value property expected to be the last value read (injected)");

    test.done();
  },

  change: function(test) {
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

  scale: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(3);

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

    // Ensure sensors may return float values
    this.sensor.scale([0, 102.3]);
    this.sensor.once("change", function() {
      test.equal(this.value, 1.2);
    });
    callback(12);
    this.clock.tick(25);

    test.done();
  },

  within: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(1);

    // While the sensor value is between the given values,
    // invoke the registered handler.
    this.sensor.within([400, 600], function() {
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

  booleanAt: function(test) {
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

  constrained: function(test) {
    var callback = this.analogRead.args[0][1];
    test.expect(1);

    this.sensor.on("data", function() {
      test.equals(this.constrained, 255);
    });

    callback(1023);
    this.clock.tick(25);
    test.done();
  },

  analog: function(test) {
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

exports["Sensor - Digital"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.digitalRead = sinon.spy(board.io, "digitalRead");
    this.sensor = new Sensor({
      type: "digital",
      pin: 3,
      board: board
    });

    this.proto = [{
      name: "scale"
    }, {
      name: "scaleTo"
    }, {
      name: "booleanAt"
    }, {
      name: "within"
    }];

    this.instance = [{
      name: "id"
    }, {
      name: "pin"
    }, {
      name: "mode"
    }, {
      name: "freq"
    }, {
      name: "range"
    }, {
      name: "threshold"
    }, {
      name: "isScaled"
    }, {
      name: "raw"
    }, {
      name: "analog"
    }, {
      name: "constrained"
    }, {
      name: "boolean"
    }, {
      name: "scaled"
    }, {
      name: "value"
    }, ];

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.digitalRead.restore();
    done();
  },

  digital: function(test) {
    var callback = this.digitalRead.args[0][1],
      change = sinon.spy(),
      data = sinon.spy();

    test.expect(4);

    this.sensor.on("data", data);
    this.sensor.on("change", change);

    callback(1);
    this.clock.tick(25);
    callback(0);
    this.clock.tick(25);

    test.equal(data.getCall(0).args[1], 1);
    test.equal(data.getCall(1).args[1], 0);

    test.equal(change.getCall(0).args[1], 1);
    test.equal(change.getCall(1).args[1], 0);
    test.done();
  },

  data: function(test) {
    var data = this.digitalRead.args[0][1],
      spy = sinon.spy();

    test.expect(1);
    this.sensor.on("data", spy);
    data(1);
    this.clock.tick(25);
    test.ok(spy.calledOnce);
    test.done();
  },

  change: function(test) {
    var callback = this.digitalRead.args[0][1],
      spy = sinon.spy();

    test.expect(2);
    this.sensor.on("change", spy);
    callback(1);
    this.clock.tick(25);
    callback(0);
    this.clock.tick(25);

    test.equal(spy.getCall(0).args[1], 1);
    test.equal(spy.getCall(1).args[1], 0);
    test.done();
  },

  scale: function(test) {
    var callback = this.digitalRead.args[0][1];

    test.expect(2);

    // Scale the expected 0-1 to a value between 50-100 (~75)
    this.sensor.scale(50, 100);

    this.sensor.once("change", function() {
      test.equal(this.value, 100);
    });
    callback(1);
    this.clock.tick(25);

    this.sensor.once("change", function() {
      test.equal(this.value, 50);
    });
    callback(0);
    this.clock.tick(25);

    test.done();
  },

  booleanAt: function(test) {
    var callback = this.digitalRead.args[0][1],
      expected = false;
    test.expect(2);

    this.sensor.booleanAt(0);

    this.sensor.on("data", function() {
      test.equals(this.boolean, expected);
    });

    callback(0);
    this.clock.tick(25);
    expected = true;
    callback(1);
    this.clock.tick(25);

    test.done();
  },

  constrained: function(test) {
    var callback = this.digitalRead.args[0][1];
    test.expect(1);

    this.sensor.on("data", function() {
      test.equals(this.constrained, 1);
    });

    callback(1);
    this.clock.tick(25);
    test.done();
  },

  analog: function(test) {
    var callback = this.digitalRead.args[0][1];

    test.expect(3);

    callback(1);
    test.equals(this.sensor.analog, 1);

    callback(0);
    test.equals(this.sensor.analog, 0);

    callback(0);
    test.equals(this.sensor.analog, 0);

    test.done();
  }
};
