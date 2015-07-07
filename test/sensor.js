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
  }),
  // TODO: query: does node.js / es6 have an object clone / deepcopy method?
  deepCopy = function(obj) {
    var rslt, p;
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      rslt = [];
      obj.forEach(function(mem) {
        rslt.push(deepCopy(mem));
      });
      return rslt;
    }

    rslt = {};
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        rslt[p] = deepCopy(obj[p]);
      }
    }
    return rslt;
  },
  getShape = function(sensor) {
    return {
      id: sensor.id,
      mode: sensor.mode,
      freq: sensor.freq,
      range: sensor.range,
      limit: sensor.limit,
      threshold: sensor.threshold,
      isScaled: sensor.isScaled,
      pin: sensor.pin
    };
  };


exports["Sensor - Analog"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.sensor = new Sensor({
      pin: "A1",
      board: board
    });

    this.defShape = {
      id: this.sensor.id, // dynamically / randomly created
      mode: this.sensor.io.MODES.ANALOG,
      freq: 25,
      range: [0, 1023],
      limit: null,
      threshold: 1,
      isScaled: false,
      pin: 1
    };

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
  },// ./setUp: function(done)

  tearDown: function(done) {
    this.clock.restore();
    this.analogRead.restore();
    done();
  },// ./tearDown: function(done)

  shape: function(test) {
    var propsActual, propsExpected, methodsActual;
    propsActual = Object.getOwnPropertyNames(this.sensor);
    propsExpected = Object.getOwnPropertyNames(this.members);
    methodsActual = Object.getOwnPropertyNames(Object.getPrototypeOf(this.sensor));

    test.expect(3 + 3 * (this.methods.length + propsExpected.length));

    // Verify that all of the expected prototype functions and properties exist for the instance
    this.methods.forEach(function(proto) {
      test.ok(methodsActual.includes(proto), "missing '" + proto + "' sensor prototype method");
    }, this);
    propsExpected.forEach(function(property) {
      test.ok(propsActual.includes(property), "missing '" + property + "' sensor instance property");
    }, this);

    // Make sure that all of the existing instance properties and prototype methods are actually expected, and the correct datatype
    propsActual.forEach(function(property) {
      test.ok(propsExpected.includes(property), "found unexpected '" + property + "' sensor instance member");
      test.ok(propsExpected.includes(property) && typeof this.sensor[property] === this.members[property].type,
        "Unexpected datatype '" + typeof this.sensor[property]+ "' found for '" + property + "' property");
    }, this);
    methodsActual.forEach(function(proto) {
      test.ok(this.methods.includes(proto), "found unexpected '" + proto + "' sensor prototype method");
      test.strictEqual(typeof this.sensor[proto], "function", "Unexected datatype found for '" + proto + "' method");
    }, this);

    test.strictEqual(this.sensor.board, board, "Expected to be the mock board");
    test.strictEqual(this.sensor.io, board.io, "Expected to be the same io as the mock board");
    test.deepEqual(this.defShape, getShape(this.sensor), "sensor instance properties should match default shape values");

    test.done();
  },// ./shape: function(test)

  emitter: function(test) {
    test.expect(1);

    test.ok(this.sensor instanceof events.EventEmitter);

    test.done();
  },// ./emitter: function(test)

  data: function(test) {
    var tickAccum, tickDelta, spy = sinon.spy();
    test.expect(5);

    this.sensor.on("data", spy);
    tickAccum = 0;
    test.ok(!spy.called, "tick " + tickAccum + ": data event handler should not be called until tick " + this.defShape.freq);
    tickDelta = this.defShape.freq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.ok(!spy.called, "tick " + tickAccum + ": data event handler should not be called until tick " + this.defShape.freq);
    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.ok(spy.calledOnce, "tick " + tickAccum + ": data event handler should have been called first time at tick " + this.defShape.freq);
    tickDelta = this.defShape.freq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.ok(spy.calledOnce, "tick" + tickAccum + ": data event handler should not be called again until tick " + (this.defShape.freq * 2));
    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.ok(spy.calledTwice, "tick " + tickAccum + ": data event handler should be called second time at tick " + (this.defShape.freq * 2));

    test.done();
  },// ./data: function(test)

  change: function(test) {
    var callback = this.analogRead.args[0][1],
      spy = sinon.spy(),
      tickAccum, tickDelta, chgValue;
    test.expect(9);

    this.sensor.on("change", spy);
    tickAccum = 0;
    test.ok(!spy.called, "tick " + tickAccum + ": change event handler should not be called until tick " + this.defShape.freq);
    tickDelta = this.defShape.freq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    chgValue = 1023;
    callback(chgValue);
    test.ok(!spy.called, "tick " + tickAccum + ": change event handler should not be called until tick " + this.defShape.freq);
    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.ok(spy.calledOnce, "tick " + tickAccum + ": change event handler should have been called first time at tick " + this.defShape.freq);
    test.strictEqual(spy.getCall(0).args[1], chgValue, "first change event value expected to be " + chgValue);
    tickDelta = this.defShape.freq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    chgValue = 1023; // duplicate value, so new change should not be emitted
    callback(chgValue);
    test.ok(spy.calledOnce, "tick " + tickAccum + ": change event handler should not be called again until at least tick " + this.defShape.freq * 2);
    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.ok(spy.calledOnce, "tick " + tickAccum + ": change event handler should not be called without a new data value");
    tickDelta = this.defShape.freq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    chgValue = 512; // New value to trigger another change event
    callback(chgValue);
    test.ok(spy.calledOnce, "tick" + tickAccum + ": change event handler should not be called again until tick " + (this.defShape.freq * 3));
    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.ok(spy.calledTwice, "tick " + tickAccum + ": change event handler should be called second time at tick " + (this.defShape.freq * 3));
    test.strictEqual(spy.getCall(1).args[1], chgValue, "second change event value expected to be " + chgValue);

    test.done();
  },// ./change: function(test)

  filtered: function(test) {
    var callback = this.analogRead.args[0][1],
      dataSpy = sinon.spy(),
      chgSpy = sinon.spy(),
      tickDelta, tickAccum, spyCall, raw, filtered;
    test.expect(42); // plus 1 for bug to be fixed

    this.sensor.on("data", dataSpy);
    this.sensor.on("change", chgSpy);
    tickAccum = 0;
    raw = 100;
    callback(raw);
    test.strictEqual(this.sensor.raw, raw, "tick " + tickAccum + ": sensor raw property expected to be the last value (" + raw + ") injected");
    test.strictEqual(this.sensor.value, raw, "tick " + tickAccum + ": sensor value property expected to be the last value (" + raw + ") injected");
    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 102;
    callback(raw);
    test.strictEqual(this.sensor.raw, raw, "tick " + tickAccum + ": sensor raw property expected to be the last value (" + raw + ") injected");
    test.strictEqual(this.sensor.value, raw, "tick " + tickAccum + ": sensor value property expected to be the last value (" + raw + ") injected");
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 101;
    callback(raw);
    test.strictEqual(this.sensor.raw, raw, "tick " + tickAccum + ": sensor raw property expected to be the last value (" + raw + ") injected");
    test.strictEqual(this.sensor.value, raw, "tick " + tickAccum + ": sensor value property expected to be the last value (" + raw + ") injected");
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 103;
    callback(raw);
    test.strictEqual(this.sensor.raw, raw, "tick " + tickAccum + ": sensor raw property expected to be the last value (" + raw + ") injected");
    test.strictEqual(this.sensor.value, raw, "tick " + tickAccum + ": sensor value property expected to be the last value (" + raw + ") injected");
    tickDelta = this.defShape.freq - tickAccum - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 104;
    callback(raw);
    test.strictEqual(this.sensor.raw, raw, "tick " + tickAccum + ": sensor raw property expected to be the last value (" + raw + ") injected");
    test.strictEqual(this.sensor.value, raw, "tick " + tickAccum + ": sensor value property expected to be the last value (" + raw + ") injected");

    test.ok(!dataSpy.called, "tick " + tickAccum + ": data event handler should not be called until tick " + this.defShape.freq);
    test.ok(!chgSpy.called, "tick " + tickAccum + ": change event handler should not be called until tick " + this.defShape.freq);
    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;

    filtered = 102; // Median of values sent through callback since previous data event
    test.ok(dataSpy.calledOnce, "tick " + tickAccum + ": data event handler should be called at tick " + this.defShape.freq);
    test.ok(chgSpy.calledOnce, "tick " + tickAccum + ": change event handler should be called at tick " + this.defShape.freq);
    test.strictEqual(this.sensor.raw, raw, "tick " + tickAccum + ": sensor raw property expected to be the last value (" + raw + ") injected");
    test.strictEqual(this.sensor.value, raw, "tick " + tickAccum + ": sensor value property expected to be the last value (" + raw + ") injected");
    spyCall = dataSpy.getCall(0);
    test.strictEqual(spyCall.args[0], null, "data event err argument expected to be null");
    test.strictEqual(spyCall.args[1], filtered, "data event value expected to be the median (" + filtered + ") value");
    test.ok(spyCall.calledOn(this.sensor), "data event 'this' parameter expected to be source sensor object");
    spyCall = chgSpy.getCall(0);
    test.strictEqual(spyCall.args[0], null, "change event err argument expected to be null");
    test.strictEqual(spyCall.args[1], filtered, "change event value expected to be the median (" + filtered + ") value");
    test.ok(spyCall.calledOn(this.sensor), "change event 'this' parameter expected to be source sensor object");

    test.strictEqual(this.sensor.raw, raw, "sensor raw property expected to be the last value (" + raw + ") read (injected)");
    test.strictEqual(this.sensor.value, raw, "sensor value property expected to be the last value (" + raw + ") read (injected)");

    // Check for non-integer median value (when even number of data points and odd delta between middle two)
    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    callback(202);
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    callback(206);
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    callback(201);
    tickDelta = this.defShape.freq * 2 - tickAccum - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 203;
    callback(raw);
    test.ok(dataSpy.calledOnce, "tick " + tickAccum + ": data event handler should not be called again until tick " + this.defShape.freq * 2);
    test.ok(chgSpy.calledOnce, "tick " + tickAccum + ": change event handler should not be called again until tick " + this.defShape.freq * 2);
    filtered = 202.5; // Median of values sent through callback (last === 102) (avg(102,103))

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.ok(dataSpy.calledTwice, "tick " + tickAccum + ": data event handler should be called again at tick " + this.defShape.freq * 2);
    test.ok(chgSpy.calledTwice, "tick " + tickAccum + ": change event handler should be called again at tick " + this.defShape.freq * 2);
    test.strictEqual(this.sensor.raw, raw, "sensor raw property expected to be the last value (" + raw + ") read (injected)");
    test.strictEqual(this.sensor.value, raw, "sensor value property expected to be the last value (" + raw + ") read (injected)");

    spyCall = dataSpy.getCall(1);
    test.strictEqual(spyCall.args[0], null, "data event err argument expected to be null");
    test.strictEqual(spyCall.args[1], filtered, "data event value expected to be the median (" + filtered + ") value");
    test.ok(spyCall.calledOn(this.sensor), "data event 'this' parameter expected to be source sensor object");

    spyCall = chgSpy.getCall(1);
    test.strictEqual(spyCall.args[0], null, "change event err argument expected to be null");
    test.strictEqual(spyCall.args[1], filtered, "change event value expected to be the median (" + filtered + ") value");
    test.ok(spyCall.calledOn(this.sensor), "change event 'this' parameter expected to be source sensor object");

    tickDelta = this.defShape.freq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.ok(dataSpy.calledTwice, "tick " + tickAccum + ": data event handler should not be called again until tick " + this.defShape.freq * 3);
    test.ok(chgSpy.calledTwice, "tick " + tickAccum + ": change event handler should not be called again until at least tick " + this.defShape.freq * 3);

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.ok(dataSpy.calledThrice, "tick " + tickAccum + ": data event handler should be called again at tick " + this.defShape.freq * 3);
    test.ok(chgSpy.calledTwice, "tick " + tickAccum + ": change event handler should not be called at " + this.defShape.freq * 3 + " without new value");
    test.strictEqual(this.sensor.raw, raw, "sensor raw property expected to be the last value (" + raw + ") read (injected)");
    test.strictEqual(this.sensor.value, raw, "sensor value property expected to be the last value (" + raw + ") read (injected)");

    // TODO: fix the bug
    spyCall = dataSpy.getCall(2);
    // test.strictEqual(spyCall.args[1], filtered, "data event value expected to be still the median (" + filtered + ") value");

    test.done();
  },// ./filtered: function(test)

  threshold: function(test) {
    var callback = this.analogRead.args[0][1],
      spy = sinon.spy(),
      tickDelta, tickAccum, spyCall, raw, filtered, newShape;
    test.expect(39);

    this.sensor.on("change", spy);
    test.deepEqual(this.defShape, getShape(this.sensor), "sensor instance properties should match default shape values");

    tickAccum = 0;
    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 512;
    filtered = raw;
    callback(raw);

    tickDelta = this.defShape.freq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(this.sensor.raw, raw, "tick " + tickAccum + ": sensor raw property expected to be the last value (" + raw + ") injected");
    test.strictEqual(this.sensor.value, raw, "tick " + tickAccum + ": sensor value property expected to be the last value (" + raw + ") injected");
    test.ok(spy.calledOnce, "tick " + tickAccum + ": change event handler should be called first time at tick " + this.defShape.freq);

    spyCall = spy.getCall(0);
    test.strictEqual(spyCall.args[0], null, "change event err argument expected to be null");
    test.strictEqual(spyCall.args[1], filtered, "change event value expected to be the median (" + filtered + ") value");
    test.ok(spyCall.calledOn(this.sensor), "change event 'this' parameter expected to be source sensor object");

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 513;
    filtered = raw;
    callback(raw);

    tickDelta = this.defShape.freq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(this.sensor.raw, raw, "tick " + tickAccum + ": sensor raw property expected to be the last value (" + raw + ") injected");
    test.strictEqual(this.sensor.value, raw, "tick " + tickAccum + ": sensor value property expected to be the last value (" + raw + ") injected");
    test.ok(spy.calledOnce, "tick " + tickAccum + ": change event handler should not be called at tick " + this.defShape.freq * 2 + "; new median within threshold");

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 500;
    callback(raw);

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 522;
    filtered = 511;
    callback(raw);

    tickDelta = this.defShape.freq - 2;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(this.sensor.raw, raw, "tick " + tickAccum + ": sensor raw property expected to be the last value (" + raw + ") injected");
    test.strictEqual(this.sensor.value, raw, "tick " + tickAccum + ": sensor value property expected to be the last value (" + raw + ") injected");
    test.ok(spy.calledOnce, "tick " + tickAccum + ": change event handler should not be called at tick " + this.defShape.freq * 3 + "; new median within threshold");

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 500;
    callback(raw);

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 527;
    filtered = 513.5;
    callback(raw);

    tickDelta = this.defShape.freq - 2;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(this.sensor.raw, raw, "tick " + tickAccum + ": sensor raw property expected to be the last value (" + raw + ") injected");
    test.strictEqual(this.sensor.value, raw, "tick " + tickAccum + ": sensor value property expected to be the last value (" + raw + ") injected");
    test.ok(spy.calledTwice, "tick " + tickAccum + ": change event handler should not be called at tick " + this.defShape.freq * 4);

    spyCall = spy.getCall(1);
    test.strictEqual(spyCall.args[0], null, "change event err argument expected to be null");
    test.strictEqual(spyCall.args[1], filtered, "change event value expected to be the median (" + filtered + ") value");
    test.ok(spyCall.calledOn(this.sensor), "change event 'this' parameter expected to be source sensor object");

    newShape = deepCopy(this.defShape);
    newShape.threshold = 0.4; //Any change should trigger a change event
    this.sensor.threshold = newShape.threshold;
    test.deepEqual(newShape, getShape(this.sensor), "sensor instance properties should match new shape values");

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 510;
    callback(raw);

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 517;
    filtered = 513.5;
    callback(raw);

    tickDelta = this.defShape.freq - 2;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(this.sensor.raw, raw, "tick " + tickAccum + ": sensor raw property expected to be the last value (" + raw + ") injected");
    test.strictEqual(this.sensor.value, raw, "tick " + tickAccum + ": sensor value property expected to be the last value (" + raw + ") injected");
    test.ok(spy.calledTwice, "tick " + tickAccum + ": change event handler should not be called at tick " + this.defShape.freq * 5 + " since no value change");

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 510;
    callback(raw);

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 516;
    filtered = 513;
    callback(raw);

    tickDelta = this.defShape.freq - 2;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(this.sensor.raw, raw, "tick " + tickAccum + ": sensor raw property expected to be the last value (" + raw + ") injected");
    test.strictEqual(this.sensor.value, raw, "tick " + tickAccum + ": sensor value property expected to be the last value (" + raw + ") injected");
    test.ok(spy.calledThrice, "tick " + tickAccum + ": change event handler should be called at tick " + this.defShape.freq * 6);

    spyCall = spy.getCall(2);
    test.strictEqual(spyCall.args[0], null, "change event err argument expected to be null");
    test.strictEqual(spyCall.args[1], filtered, "change event value expected to be the median (" + filtered + ") value");
    test.ok(spyCall.calledOn(this.sensor), "change event 'this' parameter expected to be source sensor object");

    newShape.threshold = 10; //Only changes greater than 10 should trigger a change event
    this.sensor.threshold = newShape.threshold;
    test.deepEqual(newShape, getShape(this.sensor), "sensor instance properties should match new shape values");

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 520;
    callback(raw);

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 526;
    filtered = 523;
    callback(raw);

    tickDelta = this.defShape.freq - 2;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(this.sensor.raw, raw, "tick " + tickAccum + ": sensor raw property expected to be the last value (" + raw + ") injected");
    test.strictEqual(this.sensor.value, raw, "tick " + tickAccum + ": sensor value property expected to be the last value (" + raw + ") injected");
    test.ok(spy.calledThrice, "tick " + tickAccum + ": change event handler should not be called at tick " + this.defShape.freq * 7 + " since change does not exceed threshold");

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 499;
    callback(raw);

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 507;
    filtered = 503;
    callback(raw);

    tickDelta = this.defShape.freq - 2;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(this.sensor.raw, raw, "tick " + tickAccum + ": sensor raw property expected to be the last value (" + raw + ") injected");
    test.strictEqual(this.sensor.value, raw, "tick " + tickAccum + ": sensor value property expected to be the last value (" + raw + ") injected");
    test.ok(spy.calledThrice, "tick " + tickAccum + ": change event handler should not be called at tick " + this.defShape.freq * 8 + " since change does not exceed threshold");

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 520;
    callback(raw);

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 527;
    filtered = 523.5;
    callback(raw);

    tickDelta = this.defShape.freq - 2;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(this.sensor.raw, raw, "tick " + tickAccum + ": sensor raw property expected to be the last value (" + raw + ") injected");
    test.strictEqual(this.sensor.value, raw, "tick " + tickAccum + ": sensor value property expected to be the last value (" + raw + ") injected");
    test.strictEqual(spy.callCount, 4, "tick " + tickAccum + ": change event handler should be called at tick " + this.defShape.freq * 9 + " since change threshold exceeded");

    test.done();
  },// ./threshold: function(test)

  id: function(test) {
    var newShape, newId;
    test.expect(3);

    newShape = deepCopy(this.defShape);
    newId = "test sensor id";
    newShape.id = newId;
    this.sensor.id = newId;
    test.deepEqual(newShape, getShape(this.sensor), "sensor instance properties should match shape with new id");

    newId = "1234";
    this.sensor.id = newId;
    test.strictEqual(this.sensor.id, newId, "id specified as string \"1234\"");

    newId = 1234;
    this.sensor.id = newId;
    test.strictEqual(this.sensor.id, newId, "id specified as numeric 1234");

    test.done();
  },// ./id: function(test)

  limit: function(test) {
    var callback = this.analogRead.args[0][1],
      dataSpy = sinon.spy(),
      limitSpy = sinon.spy(),
      lowerSpy = sinon.spy(),
      upperSpy = sinon.spy(),
      newLimit, newShape, raw, tickDelta, tickAccum;
    test.expect(17);
    this.sensor.on("data", dataSpy);
    this.sensor.on("limit", limitSpy);
    this.sensor.on("limit:lower", lowerSpy);
    this.sensor.on("limit:upper", upperSpy);
    test.deepEqual(this.defShape, getShape(this.sensor), "sensor instance properties should match default shape values");
    test.strictEqual(this.sensor.limit, null, "sensor limit property should default to null value");

    tickAccum = 0;
    tickDelta = this.defShape.freq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 520;
    callback(raw);
    test.strictEqual(dataSpy.callCount + limitSpy.callCount + lowerSpy.callCount + upperSpy.callCount, 0,
      "tick " + tickAccum + ": no event handlers should not be called until at least tick " + this.defShape.freq);

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(dataSpy.callCount, 1, "tick " + tickAccum + ": data event handler should be called first time at tick " + this.defShape.freq);
    test.strictEqual(limitSpy.callCount + lowerSpy.callCount + upperSpy.callCount, 0,
      "tick " + tickAccum + ": no limit event handlers should not be called while limit is null");

    newShape = deepCopy(this.defShape);
    // test.deepEqual(this.defShape, newShape);//DBG verify that deep copy is working
    // test.deepStrictEqual(this.defShape, newShape);//DBG verify that deep copy is working
    // newLimit = "junk";
    // newLimit = {test: "junk"};
    // newLimit = {0: "junk"};
    // newLimit = 123;
    newLimit = [450, 550];
    newShape.limit = newLimit;
    this.sensor.limit = newLimit;
    test.deepEqual(newShape, getShape(this.sensor), "sensor instance properties should match shape with new limit");

    tickDelta = this.defShape.freq - 2;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 449;
    callback(raw);

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 450;
    callback(raw);
    // filtered = 449.5
    test.strictEqual(limitSpy.callCount + lowerSpy.callCount + upperSpy.callCount, 0,
      "tick " + tickAccum + ": no limit event handlers should not be called while limit is null");

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(dataSpy.callCount, 2, "tick " + tickAccum + ": data event handler should be called every multiple of " + this.defShape.freq + " ticks");
    test.strictEqual(limitSpy.callCount, 1, "tick " + tickAccum + ": should call limit event handler at tick " + this.defShape.freq * 2 + "; below lower limit");
    test.strictEqual(lowerSpy.callCount, 1, "tick " + tickAccum + ": should call limit:lower event handler at tick " + this.defShape.freq * 2 + "; below lower limit");
    test.strictEqual(upperSpy.callCount, 0, "tick " + tickAccum + ": should not call limit:upper event handler at tick " + this.defShape.freq * 2 + "; below lower limit");

    tickDelta = this.defShape.freq - 2;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 551;
    callback(raw);

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 550;
    callback(raw);
    // filtered = 551.5
    test.strictEqual(dataSpy.callCount + limitSpy.callCount + lowerSpy.callCount + upperSpy.callCount, 4,
      "tick " + tickAccum + ": no event handlers should be called again until tick " + this.defShape.freq * 3);

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(dataSpy.callCount, 3, "tick " + tickAccum + ": data event handler should be called every multiple of " + this.defShape.freq + " ticks");
    test.strictEqual(limitSpy.callCount, 2, "tick " + tickAccum + ": should call limit event handler at tick " + this.defShape.freq * 3 + "; above upper limit");
    test.strictEqual(lowerSpy.callCount, 1, "tick " + tickAccum + ": should not call limit:lower event handler at tick " + this.defShape.freq * 3 + "; above upper limit");
    test.strictEqual(upperSpy.callCount, 1, "tick " + tickAccum + ": should call limit:upper event handler at tick " + this.defShape.freq * 3 + "; above upper limit");

    tickDelta = this.defShape.freq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    raw = 450;
    callback(raw);

    test.strictEqual(dataSpy.callCount + limitSpy.callCount + lowerSpy.callCount + upperSpy.callCount, 7,
      "tick " + tickAccum + ": no event handlers should be called again until tick " + this.defShape.freq * 4);

    // tickDelta = 1;
    // this.clock.tick(tickDelta);
    // tickAccum += tickDelta;
    // test.strictEqual(dataSpy.callCount, 4, "tick " + tickAccum + ": data event handler should be called every multiple of " + this.defShape.freq + " ticks");
    // test.strictEqual(limitSpy.callCount, 2, "tick " + tickAccum + ": should not call limit event handler at tick " + this.defShape.freq * 4 + "; on lower limit");
    // test.strictEqual(lowerSpy.callCount, 1, "tick " + tickAccum + ": should not call limit:lower event handler at tick " + this.defShape.freq * 4 + "; on lower limit");
    // test.strictEqual(upperSpy.callCount, 1, "tick " + tickAccum + ": should not call limit:upper event handler at tick " + this.defShape.freq * 4 + "; on lower limit");
    //
    // tickDelta = this.defShape.freq - 1;
    // this.clock.tick(tickDelta);
    // tickAccum += tickDelta;
    // raw = 550;
    // callback(raw);
    //
    // test.strictEqual(dataSpy.callCount + limitSpy.callCount + lowerSpy.callCount + upperSpy.callCount, 8,
    //   "tick " + tickAccum + ": no event handlers should be called again until tick " + this.defShape.freq * 5);
    //
    // tickDelta = 1;
    // this.clock.tick(tickDelta);
    // tickAccum += tickDelta;
    // test.strictEqual(dataSpy.callCount, 5, "tick " + tickAccum + ": data event handler should be called every multiple of " + this.defShape.freq + " ticks");
    // test.strictEqual(limitSpy.callCount, 2, "tick " + tickAccum + ": should not call limit event handler at tick " + this.defShape.freq * 5 + "; on upper limit");
    // test.strictEqual(lowerSpy.callCount, 1, "tick " + tickAccum + ": should not call limit:lower event handler at tick " + this.defShape.freq * 5 + "; on upper limit");
    // test.strictEqual(upperSpy.callCount, 1, "tick " + tickAccum + ": should not call limit:upper event handler at tick " + this.defShape.freq * 5 + "; on upper limit");

    test.done();
  },// ./limit: function(test)

  freq: function(test) {
    var spy = sinon.spy(),
      newShape, newFreq, tickDelta, tickAccum;
    test.expect(10);

    this.sensor.on("data", spy);
    test.deepEqual(this.defShape, getShape(this.sensor), "sensor instance properties should match default shape values");

    tickAccum = 0;
    tickDelta = this.defShape.freq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(spy.callCount, 0, "tick " + tickAccum + ": data event handler should not be called first time until tick " + this.defShape.freq);

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(spy.callCount, 1, "tick " + tickAccum + ": data event handler should be called first time at tick " + this.defShape.freq);

    newShape = deepCopy(this.defShape);
    newFreq = 35;
    newShape.freq = newFreq;
    this.sensor.freq = newFreq;
    test.deepEqual(newShape, getShape(this.sensor), "sensor instance properties should match shape with new freq");

    tickDelta = this.defShape.freq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(spy.callCount, 1, "tick " + tickAccum + ": data event handler should not be called second time until tick " + (this.defShape.freq + newFreq));

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(spy.callCount, 1, "tick " + tickAccum + ": data event handler should not be called second time until tick " + (this.defShape.freq + newFreq));

    tickDelta = newFreq - this.defShape.freq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(spy.callCount, 1, "tick " + tickAccum + ": data event handler should not be called second time until tick " + (this.defShape.freq + newFreq));

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(spy.callCount, 2, "tick " + tickAccum + ": data event handler should be called second at tick " + (this.defShape.freq + newFreq));

    tickDelta = newFreq - 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(spy.callCount, 2, "tick " + tickAccum + ": data event handler should not be called third time until tick " + (this.defShape.freq + 2 * newFreq));

    tickDelta = 1;
    this.clock.tick(tickDelta);
    tickAccum += tickDelta;
    test.strictEqual(spy.callCount, 3, "tick " + tickAccum + ": data event handler should be called third time at tick " + (this.defShape.freq + 2 * newFreq));

    test.done();
  },// ./freq: function(test)

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
  },// ./scale: function(test)

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
  },// ./within: function(test)

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
  },// ./booleanAt: function(test)

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
  }// ./analog: function(test)
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
