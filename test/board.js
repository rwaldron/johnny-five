require("./common/bootstrap");

exports["Board"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.replInit = this.sandbox.stub(Repl.prototype, "initialize", callback => {
      callback();
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    done();
  },

  instanceof(test) {
    test.expect(1);

    const sp = new MockSerialPort("/dev/foo", {
      baudrate: 57600,
      buffersize: 128
    });

    const board = new Board({
      port: sp,
      debug: false,
      repl: false
    });

    test.equal(board instanceof Board, true);
    test.done();
  },

  noOpts(test) {
    test.expect(1);

    this.sandbox.stub(Serial, "detect", () => {
      test.ok(true);
      test.done();
    });

    new Board();
  },

  defaultResolution(test) {
    test.expect(1);
    test.deepEqual(this.board.RESOLUTION, {PWM: 255, DAC: null, ADC: 1023});
    test.done();
  },

  explicitTransport(test) {
    test.expect(1);

    const sp = new MockSerialPort("/dev/foo", {
      baudrate: 57600,
      buffersize: 128
    });

    this.board = new Board({
      port: sp,
      debug: false,
      repl: false
    });

    test.equal(this.board.io.transport, sp);

    this.board.abort = true;

    setImmediate(() => {
      test.done();
    });
  },

  timeoutTransport(test) {

    if (process.env.NO_SERIALPORT_INSTALL) {
      test.done();
    } else {
      test.expect(1);

      this.tm = Board.testMode();
      this.clock = this.sandbox.useFakeTimers();
      this.setTimeout = this.sandbox.stub(global, "setTimeout");

      this.detect = this.sandbox.stub(Board.Serial, "detect");

      Board.testMode(false);
      Board.purge();
      Serial.purge();

      const sp = new MockSerialPort("/dev/foo", {
        baudrate: 57600,
        buffersize: 128
      });

      this.board = new Board({
        port: sp,
        timeout: Infinity,
        debug: false,
        repl: false
      });

      test.equal(this.setTimeout.lastCall.args[1], Infinity);

      Board.testMode(this.tm);

      test.done();

    }
  },

  ioIsReady(test) {
    test.expect(2);

    const io = new MockFirmata();

    // Emit connection and ready BEFORE
    // using the instance to initialize
    // a new Board.
    io.emit("connect");
    io.emit("ready");

    const board = new Board({
      io,
      debug: false,
      repl: false
    });

    board.on("connect", () => {
      test.ok(true);
    });

    board.on("ready", () => {
      test.ok(true);
      test.done();
    });
  },

  ioPostponedOutOfOrder(test) {
    test.expect(2);

    const io = new MockFirmata();

    const board = new Board({
      io,
      debug: false,
      repl: false
    });

    board.on("connect", () => {
      test.ok(true);
    });

    board.on("ready", () => {
      test.ok(true);
      test.done();
    });

    // Send IO events out of order
    io.emit("ready");
    io.emit("connect");
  },

  finalizeAndBroadcastPreemptiveError(test) {
    test.expect(2);

    this.sandbox.stub(Serial, "connect");

    const log = this.sandbox.spy(Board.prototype, "error");
    const spy = this.sandbox.spy();
    const board = new Board({
      port: "/dev/acm",
      debug: false,
      repl: false
    });

    const finalizeAndBroadcast = Serial.connect.lastCall.args[1];
    const error = new Error("Busted");

    board.on("error", spy);

    finalizeAndBroadcast.call(board, error, "error");

    test.equal(log.callCount, 1);
    test.equal(spy.callCount, 1);

    test.done();
  },

  finalizeAndBroadcastResolvesDebugFlagWithIOPlugin(test) {
    test.expect(1);

    this.sandbox.stub(Board.prototype, "log");

    const io = new MockFirmata();
    const board = new Board({
      io,
      debug: false, // This shuts up logging for the test
      repl: false
    });

    // ...override the default handling of `debug`
    board.debug = true;

    // ...which will THEN be overridden by the IO Plugin
    board.io.debug = false;
    board.io.emit("connect");
    board.io.emit("ready");

    // The IO Plugin wins!
    test.equal(board.debug, false);
    test.done();
  },

  readyClearsTimer(test) {
    test.expect(2);

    this.clock = this.sandbox.useFakeTimers();
    this.clearTimeout = this.sandbox.spy(global, "clearTimeout");


    const io = new MockFirmata();
    const board = new Board({
      timeout: 1,
      io,
      debug: false,
      repl: false
    });

    board.timer = setTimeout(() => {}, 1);
    io.emit("connect");
    io.emit("ready");

    test.equal(this.clearTimeout.callCount, 1);
    test.equal(this.clearTimeout.lastCall.args[0], board.timer);

    test.done();
  },

  // Disabling until @Resseguie can take a look at this
  // ioHasError: function(test) {
  //   test.expect(1);

  //   var sp = new MockSerialPort("/dev/foo", {
  //     baudrate: 57600,
  //     buffersize: 128
  //   });

  //   var board = new Board({
  //     port: sp,
  //     debug: false,
  //     repl: false
  //   });

  //   board.on("error", function(msg) {
  //     test.equals("ioHasError", msg);
  //     test.done();
  //   });

  //   sp.emit("error", "ioHasError");
  // },

  readyWithNoRepl(test) {
    test.expect(1);

    const io = new MockFirmata();

    const board = new Board({
      io,
      debug: false,
      repl: false
    });

    board.on("ready", () => {
      test.equal(this.replInit.called, false);
      test.done();
    });

    io.emit("connect");
    io.emit("ready");
  },

  readyWithRepl(test) {
    test.expect(1);

    const io = new MockFirmata();

    const board = new Board({
      io,
      debug: false,
      repl: true
    });

    board.on("ready", () => {
      test.equal(this.replInit.called, true);
      test.done();
    });

    io.emit("connect");
    io.emit("ready");
  },

  emitExitNoRepl(test) {
    test.expect(2);

    const clock = this.sandbox.useFakeTimers();
    const io = new MockFirmata();

    io.name = "Foo";
    io.pending = 0;

    const board = new Board({
      io,
      debug: false,
      repl: false,
      sigint: true,
    });

    const reallyExit = this.sandbox.stub(process, "reallyExit", () => {
      reallyExit.restore();
      test.ok(true);
      test.done();
    });

    board.on("ready", function() {
      this.on("exit", () => {
        test.ok(true);
      });
      process.emit("SIGINT");
      clock.tick(1);
    });

    io.emit("connect");
    io.emit("ready");
  },

  exitAwaitsPending(test) {
    test.expect(2);

    const clock = this.sandbox.useFakeTimers();
    const io = new MockFirmata();

    io.name = "Foo";
    io.pending = 5;

    const board = new Board({
      io,
      debug: false,
      repl: false,
      sigint: true,
    });

    const reallyExit = this.sandbox.stub(process, "reallyExit", () => {
      reallyExit.restore();
      test.ok(true);
      test.done();
    });

    board.on("ready", function() {
      this.on("exit", () => {
        test.ok(true);
      });
      process.emit("SIGINT");
      clock.tick(1);
      io.pending--;
      clock.tick(1);
      io.pending--;
      clock.tick(1);
      io.pending--;
      clock.tick(1);
      io.pending--;
      clock.tick(1);
      io.pending--;
    });

    io.emit("connect");
    io.emit("ready");
  },

  emitsLogsAsEvents(test) {
    test.expect(19);

    const spy = this.sandbox.spy(Board.prototype, "log");
    const io = new MockFirmata();
    const board = new Board({
      io,
      debug: false,
      repl: false
    });

    board.on("ready", function() {

      spy.reset();

      this.on("info", event => {
        test.equal(event.class, "Board");
        test.equal(event.message, "message 1");
        test.deepEqual(event.data, {
          foo: 2
        });
      });

      this.on("fail", event => {
        test.equal(event.class, "Board");
        test.equal(event.message, "message");
        test.deepEqual(event.data, null);
      });

      this.on("warn", event => {
        test.equal(event.class, "Board");
        test.equal(event.message, "message");
        test.deepEqual(event.data, [1, 2, 3]);
      });

      this.on("log", event => {
        test.equal(event.class, "Board");
        test.equal(event.message, "message");
      });

      this.on("error", event => {
        test.equal(event.class, "Board");
        test.equal(event.message, "message");
      });

      this.on("message", () => {
        test.ok(true);
      });

      this.info("Board", "message", 1, {
        foo: 2
      });
      this.fail("Board", "message");
      this.warn("Board", "message", [1, 2, 3]);
      this.log("Board", "message");
      this.error("Board", "message");

      test.equal(spy.callCount, 5);
      test.done();
    });

    io.emit("connect");
    io.emit("ready");
  },

  millisFromReady(test) {
    test.expect(1);

    Board.purge();
    Serial.purge();

    const io = new MockFirmata();
    const board = new Board({
      io,
      debug: false,
      repl: false
    });

    board.on("ready", () => {
      const a = board.millis();
      const b = board.millis();
      test.notEqual(a, b);
      test.done();
    });

    io.emit("connect");
    io.emit("ready");
  },

  wait(test) {
    test.expect(1);

    Board.purge();
    Serial.purge();

    const io = new MockFirmata();
    const board = new Board({
      io,
      debug: false,
      repl: false
    });

    board.on("ready", () => {
      board.wait(1, () => {
        test.ok(true);
        test.done();
      });
    });

    io.emit("connect");
    io.emit("ready");
  },

  snapshot(test) {
    test.expect(83);

    new Multi({
      controller: "BME280",
      board: this.board
    });

    new Sensor({
      pin: "A0",
      board: this.board
    });

    new Led({
      pin: 10,
      board: this.board
    });

    new Servo({
      pin: 11,
      board: this.board
    });

    const snapshot = this.board.snapshot();

    /*
      Length Explanation:

      (1 Multi (contains...))
        1 Altimeter
        1 Barometer
        1 Hygrometer
        1 Thermometer
      1 Analog Sensor
      1 Led
      1 Servo
      ----------------------
      7 Registered Components
     */
    test.equal(snapshot.length, 7);

    // Change the value of every property on every component to 0xFF
    const overwrittens = this.board.snapshot(() => 0xFF);

    overwrittens.forEach(overwritten => {
      Object.keys(overwritten).forEach(key => {
        test.equal(overwritten[key], 0xFF);
      });
    });

    const filtered = this.board.snapshot(property => {
      if (property === "id") {
        return "only the id";
      }
    });

    test.deepEqual(filtered, [
      { id: "only the id" },
      { id: "only the id" },
      { id: "only the id" },
      { id: "only the id" },
      { id: "only the id" },
      { id: "only the id" },
      { id: "only the id" },
    ]);

    test.done();
  },


  serialize(test) {
    test.expect(4);

    new Multi({
      controller: "BME280",
      board: this.board
    });

    new Sensor({
      pin: "A0",
      board: this.board
    });

    new Led({
      pin: 10,
      board: this.board
    });

    new Servo({
      pin: 11,
      board: this.board
    });


    let serialized = this.board.serialize();

    test.equal(typeof serialized, "string");

    test.doesNotThrow(() => {
      JSON.parse(serialized);
    });

    serialized = this.board.serialize((property, value) => {
      if (property !== "id") {
        return value;
      }
    });

    test.equal(typeof serialized, "string");

    test.deepEqual(JSON.parse(serialized), [
      {
        domain: null,
        custom: {},
        controller: "BME280",
        meters: 0,
        feet: 0,
        m: 0,
        ft: 0
      },
      {
        domain: null,
        custom: {},
        controller: "BME280",
        pressure: 0
      },
      {
        domain: null,
        custom: {},
        controller: "BME280",
        relativeHumidity: 0,
        RH: 0
      },
      {
        domain: null,
        custom: {},
        controller: "BME280",
        aref: 5,
        celsius: 0,
        fahrenheit: 32,
        kelvin: 273.15,
        freq: 25,
        C: 0,
        F: 32,
        K: 273.15
      },
      {
        domain: null,
        custom: {},
        pin: 0,
        mode: 2,
        range: [ 0, 1023 ],
        limit: null,
        threshold: 1,
        isScaled: false,
        raw: null,
        analog: 0,
        constrained: 0,
        boolean: false,
        scaled: 0,
        freq: 25,
        value: null,
        resolution: 1023
      },
      {
        custom: {},
        pin: 10,
        value: null,
        mode: 3,
        isOn: false,
        isRunning: false
      },
      {
        domain: null,
        custom: {},
        pin: 11,
        degreeRange: [ 0, 180 ],
        pwmRange: [ 600, 2400 ],
        range: [ 0, 180 ],
        deadband: [ 90, 90 ],
        fps: 100,
        offset: 0,
        mode: 4,
        interval: null,
        value: null,
        type: "standard",
        invert: false,
        history: [],
        position: -1,
        startAt: 90
      }
    ]);

    test.done();
  },

  snapshotBlackList(test) {
    test.expect(1);
    test.deepEqual(Board.prototype.snapshot.blacklist, [
      "board", "io", "_events", "_eventsCount", "state",
    ]);
    test.done();
  },

  snapshotSpecial(test) {
    test.expect(1);

    const io = new MockFirmata();
    const board = new Board({
      io,
      debug: false,
      repl: false
    });

    test.equal(board.snapshot.special.mode(null), "unknown");
    test.done();
  },

};

exports["Virtual"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.Board = this.sandbox.stub(five, "Board", () => {});
    this.Expander = this.sandbox.stub(five, "Expander", function() {
      this.name = "MCP23017";
    });
    done();
  },

  tearDown(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    done();
  },

  ioExpanderAsArg(test) {
    test.expect(5);

    const expander = new this.Expander();

    new Virtual(expander);

    test.equal(this.Board.called, true);
    test.equal(this.Board.lastCall.args[0].repl, false);
    test.equal(this.Board.lastCall.args[0].debug, false);
    test.equal(this.Board.lastCall.args[0].sigint, false);
    test.equal(this.Board.lastCall.args[0].io, expander);

    test.done();
  },

  ioExpanderAsPropertyOfArg(test) {
    test.expect(5);

    const expander = new this.Expander();

    new Virtual({
      io: expander
    });

    test.equal(this.Board.called, true);
    test.equal(this.Board.lastCall.args[0].repl, false);
    test.equal(this.Board.lastCall.args[0].debug, false);
    test.equal(this.Board.lastCall.args[0].sigint, false);
    test.equal(this.Board.lastCall.args[0].io, expander);

    test.done();
  }
};

exports["samplingInterval"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.setSamplingInterval = this.sandbox.spy(MockFirmata.prototype, "setSamplingInterval");
    done();
  },

  tearDown(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    done();
  },

  samplingInterval(test) {
    test.expect(1);

    this.board.samplingInterval(100);
    test.ok(this.setSamplingInterval.calledOnce);

    test.done();
  },

  samplingIntervalNotImplementedThrows(test) {
    test.expect(1);

    this.board.io.setSamplingInterval = null;

    test.throws(() => {
      this.board.samplingInterval(100);
    });

    test.done();
  }
};
exports["shiftOut"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    done();
  },

  tearDown(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    done();
  },

  default(test) {
    test.expect(2);

    this.board.shiftOut(1, 2, 0xFF);
    test.equal(this.digitalWrite.callCount, 24);
    test.deepEqual(this.digitalWrite.args, [
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ]
    ]);


    test.done();
  },

  bigEndian(test) {
    test.expect(2);

    this.board.shiftOut(1, 2, true, 0x7F);

    test.equal(this.digitalWrite.callCount, 24);
    test.deepEqual(this.digitalWrite.args, [
      [ 2, 0 ],
      [ 1, 0 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ]
    ]);

    test.done();
  },

  littleEndian(test) {
    test.expect(2);

    this.board.shiftOut(1, 2, false, 0x7F);

    test.equal(this.digitalWrite.callCount, 24);
    test.deepEqual(this.digitalWrite.args, [
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 1 ],
      [ 2, 1 ],
      [ 2, 0 ],
      [ 1, 0 ],
      [ 2, 1 ]
    ]);

    test.done();
  },
};

exports["loop"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.board = newBoard();
    done();
  },

  tearDown(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    done();
  },

  exists(test) {
    test.expect(2);
    test.equal(typeof Board.prototype.loop, "function");
    test.equal(typeof this.board.loop, "function");
    test.done();
  },

  stoppable(test) {
    test.expect(4);
    let iterations = 0;

    this.board.loop(10, stop => {
      iterations++;
      stop();
    });

    test.equal(iterations, 0);
    this.clock.tick(10);
    test.equal(iterations, 1);
    this.clock.tick(10);
    test.equal(iterations, 1);
    this.clock.tick(10);
    test.equal(iterations, 1);
    test.done();
  },

};

exports["static"] = {
  "Board.cache": function(test) {
    test.expect(2);
    test.equal(typeof Board.cache, "object", "Board.cache");
    test.ok(Array.isArray(Board.cache), "Board.cache");
    test.done();
  },

  "Board.Options": function(test) {
    test.expect(1);
    test.ok(Board.Options);
    test.done();
  },
  "Board.Pins": function(test) {
    test.expect(1);
    test.ok(Board.Pins, "Board.Pins");
    test.done();
  },

  "Board.Event": function(test) {
    test.expect(2);
    const serial = {};

    const boardEvent = new Board.Event({
      type: "read",
      target: serial
    });

    test.ok(boardEvent.type === "read");
    test.ok(boardEvent.target === serial);

    test.done();
  },
  "Board.Event Missing Event Object throws": function(test) {
    test.expect(1);
    test.throws(Board.Event);
    test.done();
  },
  "Board.Event Defaults to 'data' event": function(test) {
    test.expect(1);
    test.equal(new Board.Event({}).type, "data");
    test.done();
  },
  "Board.Event Defaults to null target": function(test) {
    test.expect(1);
    test.equal(new Board.Event({}).target, null);
    test.done();
  },
};


exports["instance"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    done();
  },

  tearDown(done) {
    Board.purge();
    Serial.purge();
    done();
  },

  cache(test) {
    test.expect(1);
    test.ok(Board.cache.includes(this.board));
    test.done();
  },

  instance(test) {
    test.expect(1);
    test.ok(this.board);
    test.done();
  },

  io(test) {
    test.expect(1);
    test.ok(this.board.io instanceof MockFirmata);
    test.done();
  },

  id(test) {
    test.expect(1);
    test.ok(this.board.id);
    test.done();
  },

  pins(test) {
    test.expect(1);
    test.ok(this.board.pins);
    test.done();
  },
};

exports["Board.prototye[passthrough]"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    done();
  },

  tearDown(done) {
    Board.purge();
    Serial.purge();
    done();
  },

  all(test) {
    test.expect(25);


    [
      "digitalWrite", "analogWrite",
      "analogRead", "digitalRead",
      "pinMode", "queryPinState",
      "stepperConfig", "stepperStep",
      "sendI2CConfig", "sendI2CWriteRequest", "sendI2CReadRequest",
      "i2cConfig", "i2cWrite", "i2cWriteReg", "i2cRead", "i2cReadOnce",
      "pwmWrite",
      "servoConfig", "servoWrite",
      "sysexCommand", "sysexResponse",
      "serialConfig", "serialWrite", "serialRead", "serialStop", "serialClose", "serialFlush", "serialListen",
    ].forEach(function(method) {
      if (this.board.io[method]) {
        this.sandbox.stub(this.board.io, method);
        this.board[method]();
        test.equal(this.board.io[method].callCount, 1);
      }
    }, this);

    test.done();
  },

  instance(test) {
    test.expect(1);
    test.ok(this.board);
    test.done();
  },

  io(test) {
    test.expect(1);
    test.ok(this.board.io instanceof MockFirmata);
    test.done();
  },

  id(test) {
    test.expect(1);
    test.ok(this.board.id);
    test.done();
  },

  pins(test) {
    test.expect(1);
    test.ok(this.board.pins);
    test.done();
  },
};
[
  "digitalWrite", "analogWrite",
  "analogRead", "digitalRead",
  "pinMode", "queryPinState",
  "stepperConfig", "stepperStep",
  "sendI2CConfig", "sendI2CWriteRequest", "sendI2CReadRequest",
  "i2cConfig", "i2cWrite", "i2cWriteReg", "i2cRead", "i2cReadOnce",
  "pwmWrite",
  "servoConfig", "servoWrite",
  "sysexCommand", "sysexResponse",
  "serialConfig", "serialWrite", "serialRead", "serialStop", "serialClose", "serialFlush", "serialListen",
].forEach(method => {
  Board.prototype[method] = function(...args) {
    this.io[method].apply(this.io, args);
    return this;
  };
});



exports["Board.mount"] = {
  setUp(done) {

    this.board = newBoard();

    done();
  },
  tearDown(done) {
    Board.purge();
    Serial.purge();
    done();
  },
  "Board.mount()": function(test) {
    test.expect(1);
    test.equal(typeof Board.mount, "function", "Board.mount");
    test.done();
  },

  "Board.mount(obj)": function(test) {
    test.expect(2);
    test.ok(Board.mount({
      board: this.board
    }), "Board.mount({ board: board })");
    test.deepEqual(Board.mount({
      board: this.board
    }), this.board, "Board.mount({ board: board }) deep equals board");
    test.done();
  },

  "Board.mount(index)": function(test) {
    test.expect(2);
    test.ok(Board.mount(0), "Board.mount(0)");
    test.deepEqual(Board.mount(0), this.board, "Board.mount(0)");
    test.done();
  },

  "Board.mount(index out of range)": function(test) {
    test.expect(1);
    test.deepEqual(Board.mount(-1), null, "Board.mount(-1)");
    test.done();
  },

  "Board.mount(/*none*/)": function(test) {
    test.expect(2);
    test.ok(Board.mount(), "Board.mount()");
    test.deepEqual(Board.mount(), this.board, "Board.mount() matches board instance");
    test.done();
  },

  "Board.mount(/*none*/) & no boards": function(test) {
    test.expect(1);
    Board.purge();
    test.deepEqual(Board.mount(), null);
    test.done();
  },
};

exports["Events Forwarded By IO Plugin layer"] = {
  setUp(done) {
    done();
  },
  tearDown(done) {
    Board.purge();
    Serial.purge();
    done();
  },
  string(test) {
    test.expect(1);

    const io = new MockFirmata();
    const board = new Board({
      io,
      debug: false,
      repl: false
    });

    board.on("ready", () => {
      board.on("string", data => {
        test.equal(data, 1);
        test.done();
      });
      io.emit("string", 1);
    });

    board.emit("ready");
  },
  closeBySelf(test) {
    test.expect(1);

    const io = new MockFirmata();
    const board = new Board({
      io,
      debug: false,
      repl: false
    });

    board.on("ready", () => {
      io.emit("close");
    });

    board.on("close", () => {
      test.ok(true);
      test.done();
    });

    board.emit("ready");
  },

  closeByIO(test) {
    test.expect(1);

    const io = new MockFirmata();
    io.isReady = false;

    const board = new Board({
      io,
      debug: false,
      repl: false
    });

    board.on("ready", () => {
      io.emit("close");
    });

    board.on("close", () => {
      test.ok(true);
      test.done();
    });

    process.nextTick(() => {
      io.isReady = true;
      io.emit("connect");
      io.emit("ready");
    });
  },

  disconnectBySelf(test) {
    test.expect(1);

    const io = new MockFirmata();
    const board = new Board({
      io,
      debug: false,
      repl: false
    });

    board.on("ready", () => {
      io.emit("disconnect");
    });

    board.on("disconnect", () => {
      test.ok(true);
      test.done();
    });

    board.emit("ready");
  },

  disconnectByIO(test) {
    test.expect(1);

    const io = new MockFirmata();
    io.isReady = false;

    const board = new Board({
      io,
      debug: false,
      repl: false
    });

    board.on("ready", () => {
      io.emit("disconnect");
    });

    board.on("disconnect", () => {
      test.ok(true);
      test.done();
    });

    process.nextTick(() => {
      io.isReady = true;
      io.emit("connect");
      io.emit("ready");
    });
  },
};

exports["Repl controlled by IO Plugin layer"] = {
  setUp(done) {
    done();
  },
  tearDown(done) {
    Board.purge();
    Serial.purge();
    done();
  },
  ioForcesReplFalse(test) {
    test.expect(1);

    const io = new MockFirmata();
    const board = new Board({
      io,
      debug: false,
    });

    board.on("ready", function() {
      test.equal(this.repl, false);
      test.done();
    });

    // At any point during its own initialization,
    // but always _before_ emitting "ready",
    // the IO plugin could set this false.
    io.repl = false;

    io.emit("connect");
    io.emit("ready");
  },
};

exports["fn"] = {
  cache(test) {
    test.expect(6);

    test.equal(Fn.scale(10, 0, 20, 0, 100), 50, "scale up");
    test.equal(Fn.scale(10, 0, 20, 100, 0), 50, "scale up reversed");

    test.equal(Fn.scale(10, 0, 10, 0, 180), 180, "max is 180");
    test.equal(Fn.scale(10, 0, 10, 180, 0), 0, "max is 0");

    test.equal(Fn.scale(0, 0, 10, 180, 0), 180, "min is 180");
    test.equal(Fn.scale(0, 0, 10, 0, 180), 0, "min is 0");

    test.done();
  }
};

