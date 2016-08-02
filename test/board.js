require("./common/bootstrap");

exports["Board"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.replInit = this.sandbox.stub(Repl.prototype, "initialize", function(callback) {
      callback();
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    done();
  },

  instanceof: function(test) {
    test.expect(1);

    var sp = new MockSerialPort("/dev/foo", {
      baudrate: 57600,
      buffersize: 128
    });

    var board = Board({
      port: sp,
      debug: false,
      repl: false
    });

    test.equal(board instanceof Board, true);
    test.done();
  },

  noOpts: function(test) {
    test.expect(1);

    this.sandbox.stub(Serial, "detect", function() {
      test.ok(true);
      test.done();
    });

    new Board();
  },

  explicitTransport: function(test) {
    test.expect(1);

    var sp = new MockSerialPort("/dev/foo", {
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

    setImmediate(function() {
      test.done();
    });
  },

  timeoutTransport: function(test) {

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

      var sp = new MockSerialPort("/dev/foo", {
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

  ioIsReady: function(test) {
    test.expect(2);

    var io = new MockFirmata();

    // Emit connection and ready BEFORE
    // using the instance to initialize
    // a new Board.
    io.emit("connect");
    io.emit("ready");

    var board = new Board({
      io: io,
      debug: false,
      repl: false
    });

    board.on("connect", function() {
      test.ok(true);
    });

    board.on("ready", function() {
      test.ok(true);
      test.done();
    });
  },

  ioPostponedOutOfOrder: function(test) {
    test.expect(2);

    var io = new MockFirmata();

    var board = new Board({
      io: io,
      debug: false,
      repl: false
    });

    board.on("connect", function() {
      test.ok(true);
    });

    board.on("ready", function() {
      test.ok(true);
      test.done();
    });

    // Send IO events out of order
    io.emit("ready");
    io.emit("connect");
  },

  finalizeAndBroadcastPreemptiveError: function(test) {
    test.expect(2);

    this.sandbox.stub(Serial, "connect");

    var log = this.sandbox.spy(Board.prototype, "error");
    var spy = this.sandbox.spy();
    var board = new Board({
      port: "/dev/acm",
      debug: false,
      repl: false
    });

    var finalizeAndBroadcast = Serial.connect.lastCall.args[1];
    var error = new Error("Busted");

    board.on("error", spy);

    finalizeAndBroadcast.call(board, error, "error");

    test.equal(log.callCount, 1);
    test.equal(spy.callCount, 1);

    test.done();
  },

  finalizeAndBroadcastResolvesDebugFlagWithIOPlugin: function(test) {
    test.expect(1);

    this.sandbox.stub(Board.prototype, "log");

    var io = new MockFirmata();
    var board = new Board({
      io: io,
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

  readyClearsTimer: function(test) {
    test.expect(2);

    this.clock = this.sandbox.useFakeTimers();
    this.clearTimeout = this.sandbox.spy(global, "clearTimeout");


    var io = new MockFirmata();
    var board = new Board({
      timeout: 1,
      io: io,
      debug: false,
      repl: false
    });

    board.timer = setTimeout(function() {}, 1);
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

  readyWithNoRepl: function(test) {
    test.expect(1);

    var io = new MockFirmata();

    var board = new Board({
      io: io,
      debug: false,
      repl: false
    });

    board.on("ready", function() {
      test.equal(this.replInit.called, false);
      test.done();
    }.bind(this));

    io.emit("connect");
    io.emit("ready");
  },

  readyWithRepl: function(test) {
    test.expect(1);

    var io = new MockFirmata();

    var board = new Board({
      io: io,
      debug: false,
      repl: true
    });

    board.on("ready", function() {
      test.equal(this.replInit.called, true);
      test.done();
    }.bind(this));

    io.emit("connect");
    io.emit("ready");
  },

  emitExitNoRepl: function(test) {
    test.expect(2);

    var io = new MockFirmata();

    io.name = "Foo";

    var board = new Board({
      io: io,
      debug: false,
      repl: false,
      sigint: true,
    });

    var reallyExit = this.sandbox.stub(process, "reallyExit", function() {
      reallyExit.restore();
      test.ok(true);
      test.done();
    });

    board.on("ready", function() {
      this.on("exit", function() {
        test.ok(true);
      });
      process.emit("SIGINT");
    });

    io.emit("connect");
    io.emit("ready");
  },

  emitsLogsAsEvents: function(test) {
    test.expect(19);

    var spy = this.sandbox.spy(Board.prototype, "log");
    var io = new MockFirmata();
    var board = new Board({
      io: io,
      debug: false,
      repl: false
    });

    board.on("ready", function() {

      spy.reset();

      this.on("info", function(event) {
        test.equal(event.class, "Board");
        test.equal(event.message, "message 1");
        test.deepEqual(event.data, {
          foo: 2
        });
      });

      this.on("fail", function(event) {
        test.equal(event.class, "Board");
        test.equal(event.message, "message");
        test.deepEqual(event.data, null);
      });

      this.on("warn", function(event) {
        test.equal(event.class, "Board");
        test.equal(event.message, "message");
        test.deepEqual(event.data, [1, 2, 3]);
      });

      this.on("log", function(event) {
        test.equal(event.class, "Board");
        test.equal(event.message, "message");
      });

      this.on("error", function(event) {
        test.equal(event.class, "Board");
        test.equal(event.message, "message");
      });

      this.on("message", function() {
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

  millisFromReady: function(test) {
    test.expect(1);

    Board.purge();
    Serial.purge();

    var io = new MockFirmata();
    var board = new Board({
      io: io,
      debug: false,
      repl: false
    });

    board.on("ready", function() {
      var a = board.millis();
      var b = board.millis();
      test.notEqual(a, b);
      test.done();
    });

    io.emit("connect");
    io.emit("ready");
  },

  wait: function(test) {
    test.expect(1);

    Board.purge();
    Serial.purge();

    var io = new MockFirmata();
    var board = new Board({
      io: io,
      debug: false,
      repl: false
    });

    board.on("ready", function() {
      board.wait(1, function() {
        test.ok(true);
        test.done();
      });
    }.bind(this));

    io.emit("connect");
    io.emit("ready");
  },

  snapshot: function(test) {
    test.expect(68);

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

    var snapshot = this.board.snapshot();

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
    var overwrittens = this.board.snapshot(function() {
      return 0xFF;
    });

    overwrittens.forEach(function(overwritten) {
      Object.keys(overwritten).forEach(function(key) {
        test.equal(overwritten[key], 0xFF);
      });
    });

    var filtered = this.board.snapshot(function(property) {
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


  serialize: function(test) {
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


    var serialized = this.board.serialize();

    test.equal(typeof serialized, "string");

    test.doesNotThrow(function() {
      JSON.parse(serialized);
    });

    serialized = this.board.serialize(function(property, value) {
      if (property !== "id") {
        return value;
      }
    });

    test.equal(typeof serialized, "string");
    test.deepEqual(JSON.parse(serialized), [
      {
        feet: 0,
        custom: {},
        controller: "BME280",
        m: 0,
        ft: 0,
        meters: 0
      }, {
        custom: {},
        controller: "BME280",
        pressure: 0
      }, {
        relativeHumidity: 0,
        custom: {},
        controller: "BME280",
        RH: 0
      }, {
        K: 273.15,
        C: 0,
        fahrenheit: 32,
        custom: {},
        controller: "BME280",
        F: 32,
        celsius: 0,
        kelvin: 273.15,
        aref: 5
      }, {
        freq: 25,
        constrained: 0,
        custom: {},
        value: null,
        scaled: 0,
        range: [0, 1023],
        analog: 0,
        limit: null,
        threshold: 1,
        boolean: false,
        raw: null,
        isScaled: false,
        mode: 2,
        pin: 0
      }, {
        isRunning: false,
        custom: {},
        value: null,
        isOn: false,
        mode: 3,
        pin: 10
      }, {
        deadband: [90, 90],
        startAt: 90,
        value: null,
        position: -1,
        type: "standard",
        history: [],
        specs: {
          speed: 0.17
        },
        offset: 0,
        invert: false,
        custom: {},
        interval: null,
        range: [0, 180],
        fps: 100,
        mode: 4,
        pin: 11
      }
    ]);

    test.done();
  },

  snapshotBlackList: function(test) {
    test.expect(1);
    test.deepEqual(Board.prototype.snapshot.blacklist, [
      "board", "io", "_events", "_eventsCount", "state",
    ]);
    test.done();
  },

  snapshotSpecial: function(test) {
    test.expect(1);

    var io = new MockFirmata();
    var board = new Board({
      io: io,
      debug: false,
      repl: false
    });

    test.equal(board.snapshot.special.mode(null), "unknown");
    test.done();
  },

};

exports["Virtual"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.Board = this.sandbox.stub(five, "Board", function() {});
    this.Expander = this.sandbox.stub(five, "Expander", function() {
      this.name = "MCP23017";
    });
    done();
  },

  tearDown: function(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    done();
  },

  ioExpanderAsArg: function(test) {
    test.expect(5);

    var expander = new this.Expander();

    new Virtual(expander);

    test.equal(this.Board.called, true);
    test.equal(this.Board.lastCall.args[0].repl, false);
    test.equal(this.Board.lastCall.args[0].debug, false);
    test.equal(this.Board.lastCall.args[0].sigint, false);
    test.equal(this.Board.lastCall.args[0].io, expander);

    test.done();
  },

  ioExpanderAsPropertyOfArg: function(test) {
    test.expect(5);

    var expander = new this.Expander();

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
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.setSamplingInterval = this.sandbox.spy(MockFirmata.prototype, "setSamplingInterval");
    done();
  },

  tearDown: function(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    done();
  },

  samplingInterval: function(test) {
    test.expect(1);

    this.board.samplingInterval(100);
    test.ok(this.setSamplingInterval.calledOnce);

    test.done();
  },

  samplingIntervalNotImplementedThrows: function(test) {
    test.expect(1);

    this.board.io.setSamplingInterval = null;

    test.throws(function() {
      this.board.samplingInterval(100);
    }.bind(this));

    test.done();
  }
};
exports["shiftOut"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    done();
  },

  tearDown: function(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    done();
  },

  default: function(test) {
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

  bigEndian: function(test) {
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

  littleEndian: function(test) {
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

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.board = newBoard();
    done();
  },

  tearDown: function(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    done();
  },

  exists: function(test) {
    test.expect(2);
    test.equal(typeof Board.prototype.loop, "function");
    test.equal(typeof this.board.loop, "function");
    test.done();
  },

  stoppable: function(test) {
    test.expect(4);
    var iterations = 0;

    this.board.loop(10, function(stop) {
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
    var serial = {},
      boardEvent = new Board.Event({
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

exports["Boards"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.replInit = this.sandbox.stub(Repl.prototype, "initialize", function(callback) {
      callback();
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    done();
  },

  exists: function(test) {
    test.expect(1);
    test.equal(Boards, Board.Collection);
    test.done();
  },

  instanceof: function(test) {
    test.expect(1);
    test.equal(Boards([newBoard(), newBoard()]) instanceof Boards, true);
    test.done();
  },

  invalidArgsThrows: function(test) {
    test.expect(1);
    test.throws(function() {
      new Boards();
    });
    test.done();
  },

  noDebug: function(test) {
    test.expect(1);

    var ioA = new MockFirmata();
    var ioB = new MockFirmata();

    var boards = new Boards([{
      id: "A",
      repl: true,
      debug: false,
      io: ioA
    }, {
      id: "B",
      repl: false,
      debug: false,
      io: ioB
    }]);

    test.equal(boards.debug, false);
    test.done();
  },

  portString: function(test) {
    test.expect(3);

    this.sandbox.stub(Serial, "connect");
    this.sandbox.stub(Serial, "detect");
    new Boards(["/dev/ttyacm0"]);

    test.equal(Serial.detect.callCount, 0);
    test.equal(Serial.connect.callCount, 1);
    test.equal(Serial.connect.lastCall.args[0], "/dev/ttyacm0");
    test.done();
  },

  idString: function(test) {
    test.expect(2);

    this.sandbox.stub(Serial, "connect");
    this.sandbox.stub(Serial, "detect", function(callback) {
      callback("/foo/bar");
    });
    var boards = new Boards(["a"]);
    test.equal(boards[0].id, "a");
    test.equal(boards.byId("a"), boards[0]);
    test.done();
  },

  methods: function(test) {
    test.expect(8);

    test.ok(Boards.prototype.log);
    test.ok(Boards.prototype.info);
    test.ok(Boards.prototype.warn);
    test.ok(Boards.prototype.error);
    test.ok(Boards.prototype.fail);
    test.ok(Boards.prototype.each);
    test.ok(Boards.prototype.add);
    test.ok(Boards.prototype.byId);

    test.done();
  },

  connectReadyAfter: function(test) {
    test.expect(2);

    var ioA = new MockFirmata();
    var ioB = new MockFirmata();

    var boards = new Boards([{
      id: "A",
      repl: false,
      debug: false,
      io: ioA
    }, {
      id: "B",
      repl: false,
      debug: false,
      io: ioB
    }]);

    test.equals(2, boards.length);

    boards.on("ready", function() {
      test.ok(true);
      test.done();
    });

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  connectReadyBefore: function(test) {
    test.expect(2);

    var ioA = new MockFirmata();
    var ioB = new MockFirmata();

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");

    var boards = new Boards([{
      id: "A",
      repl: false,
      debug: false,
      io: ioA
    }, {
      id: "B",
      repl: false,
      debug: false,
      io: ioB
    }]);

    test.equals(2, boards.length);

    boards.on("ready", function() {
      test.ok(true);
      test.done();
    });
  },

  readyInitReplArray: function(test) {
    test.expect(1);

    var ioA = new MockFirmata();
    var ioB = new MockFirmata();

    var boards = new Boards([{
      id: "A",
      debug: false,
      io: ioA
    }, {
      id: "B",
      debug: false,
      io: ioB
    }]);

    boards.on("ready", function() {
      test.equal(this.replInit.callCount, 1);
      test.done();
    }.bind(this));

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  readyInitReplObject: function(test) {
    test.expect(1);


    var ioA = new MockFirmata();
    var ioB = new MockFirmata();

    var boards = new Boards({
      repl: true,
      debug: false,
      ports: [{
        id: "A",
        debug: false,
        io: ioA
      }, {
        id: "B",
        debug: false,
        io: ioB
      }]
    });

    boards.on("ready", function() {
      test.equal(this.replInit.called, true);
      test.done();
    }.bind(this));

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  readyNoReplArray1: function(test) {
    test.expect(1);

    var ioA = new MockFirmata();
    var ioB = new MockFirmata();

    var boards = new Boards([{
      id: "A",
      repl: false,
      debug: false,
      io: ioA
    }, {
      id: "B",
      debug: false,
      io: ioB
    }]);

    boards.on("ready", function() {
      // Repl.prototype.initialize IS NOT CALLED
      test.equal(this.replInit.called, false);
      test.done();
    }.bind(this));

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  readyNoReplArray2: function(test) {
    test.expect(1);

    var ioA = new MockFirmata();
    var ioB = new MockFirmata();

    var boards = new Boards([{
      id: "A",
      debug: false,
      io: ioA
    }, {
      id: "B",
      repl: false,
      debug: false,
      io: ioB
    }]);

    boards.on("ready", function() {
      // Repl.prototype.initialize IS NOT CALLED
      test.equal(this.replInit.called, false);
      test.done();
    }.bind(this));

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  readyNoReplObject: function(test) {
    test.expect(1);

    var ioA = new MockFirmata();
    var ioB = new MockFirmata();

    var boards = new Boards({
      repl: false,
      ports: [{
        id: "A",
        debug: false,
        io: ioA
      }, {
        id: "B",
        debug: false,
        io: ioB
      }]
    });

    boards.on("ready", function() {
      // Repl.prototype.initialize IS NOT CALLED
      test.equal(this.replInit.called, false);
      test.done();
    }.bind(this));

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  readyNoReplNoDebugObject: function(test) {
    test.expect(2);

    var ioA = new MockFirmata();
    var ioB = new MockFirmata();

    var boards = new Boards({
      repl: false,
      debug: false,
      ports: [{
        id: "A",
        debug: false,
        io: ioA
      }, {
        id: "B",
        debug: false,
        io: ioB
      }]
    });

    var clog = this.sandbox.spy(console, "log");

    boards.on("ready", function() {
      // Repl.prototype.initialize IS NOT CALLED
      test.equal(this.replInit.called, false);
      test.equal(clog.called, false);
      clog.restore();
      test.done();
    }.bind(this));

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  errorBubbling: function(test) {
    test.expect(1);

    var ioA = new MockFirmata();
    var ioB = new MockFirmata();

    var boards = new Boards({
      repl: false,
      debug: false,
      ports: [{
        id: "A",
        debug: false,
        io: ioA
      }, {
        id: "B",
        debug: false,
        io: ioB
      }]
    });

    var spy = this.sandbox.spy();

    boards.on("error", spy);

    boards.on("ready", function() {
      this[0].emit("error");
      this[1].emit("error");

      test.equal(spy.callCount, 2);

      test.done();
    });

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  byId: function(test) {
    test.expect(3);

    var ioA = new MockFirmata();
    var ioB = new MockFirmata();

    var boards = new Boards([{
      id: "A",
      repl: false,
      debug: false,
      io: ioA
    }, {
      id: "B",
      repl: false,
      debug: false,
      io: ioB
    }]);

    boards.on("ready", function() {
      test.equal(this.byId("A"), boards[0]);
      test.equal(this.byId("B"), boards[1]);
      test.equal(this.byId("C"), null);
      test.done();
    });

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },
};


exports["instance"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    done();
  },

  tearDown: function(done) {
    Board.purge();
    Serial.purge();
    done();
  },

  cache: function(test) {
    test.expect(1);
    test.ok(Board.cache.includes(this.board));
    test.done();
  },

  instance: function(test) {
    test.expect(1);
    test.ok(this.board);
    test.done();
  },

  io: function(test) {
    test.expect(1);
    test.ok(this.board.io instanceof MockFirmata);
    test.done();
  },

  id: function(test) {
    test.expect(1);
    test.ok(this.board.id);
    test.done();
  },

  pins: function(test) {
    test.expect(1);
    test.ok(this.board.pins);
    test.done();
  },
};

exports["Board.prototye[passthrough]"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    done();
  },

  tearDown: function(done) {
    Board.purge();
    Serial.purge();
    done();
  },

  all: function(test) {
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

  instance: function(test) {
    test.expect(1);
    test.ok(this.board);
    test.done();
  },

  io: function(test) {
    test.expect(1);
    test.ok(this.board.io instanceof MockFirmata);
    test.done();
  },

  id: function(test) {
    test.expect(1);
    test.ok(this.board.id);
    test.done();
  },

  pins: function(test) {
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
].forEach(function(method) {
  Board.prototype[method] = function() {
    this.io[method].apply(this.io, arguments);
    return this;
  };
});



exports["Board.mount"] = {
  setUp: function(done) {

    this.board = newBoard();

    done();
  },
  tearDown: function(done) {
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
  setUp: function(done) {
    done();
  },
  tearDown: function(done) {
    Board.purge();
    Serial.purge();
    done();
  },
  string: function(test) {
    test.expect(1);

    var io = new MockFirmata();
    var board = new Board({
      io: io,
      debug: false,
      repl: false
    });

    board.on("ready", function() {
      board.on("string", function(data) {
        test.equal(data, 1);
        test.done();
      });
      io.emit("string", 1);
    });

    board.emit("ready");
  },
  closeBySelf: function(test) {
    test.expect(1);

    var io = new MockFirmata();
    var board = new Board({
      io: io,
      debug: false,
      repl: false
    });

    board.on("ready", function() {
      io.emit("close");
    });

    board.on("close", function() {
      test.ok(true);
      test.done();
    });

    board.emit("ready");
  },

  closeByIO: function(test) {
    test.expect(1);

    var io = new MockFirmata();
    io.isReady = false;

    var board = new Board({
      io: io,
      debug: false,
      repl: false
    });

    board.on("ready", function() {
      io.emit("close");
    });

    board.on("close", function() {
      test.ok(true);
      test.done();
    });

    process.nextTick(function() {
      io.isReady = true;
      io.emit("connect");
      io.emit("ready");
    });
  },

  disconnectBySelf: function(test) {
    test.expect(1);

    var io = new MockFirmata();
    var board = new Board({
      io: io,
      debug: false,
      repl: false
    });

    board.on("ready", function() {
      io.emit("disconnect");
    });

    board.on("disconnect", function() {
      test.ok(true);
      test.done();
    });

    board.emit("ready");
  },

  disconnectByIO: function(test) {
    test.expect(1);

    var io = new MockFirmata();
    io.isReady = false;

    var board = new Board({
      io: io,
      debug: false,
      repl: false
    });

    board.on("ready", function() {
      io.emit("disconnect");
    });

    board.on("disconnect", function() {
      test.ok(true);
      test.done();
    });

    process.nextTick(function() {
      io.isReady = true;
      io.emit("connect");
      io.emit("ready");
    });
  },
};

exports["Repl controlled by IO Plugin layer"] = {
  setUp: function(done) {
    done();
  },
  tearDown: function(done) {
    Board.purge();
    Serial.purge();
    done();
  },
  ioForcesReplFalse: function(test) {
    test.expect(1);

    var io = new MockFirmata();
    var board = new Board({
      io: io,
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
  cache: function(test) {
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

// TODO: need tests for board.shiftOut

// TODO: need mock io object
// exports["modules"] = {
//   "optional-new": function( test ) {
//     var modules = Object.keys(five);

//     // test.expect(modules * 2);

//     modules.forEach(function( module ) {

//       var instance = new five[ module ]({});

//       console.log( instance );
//     });
//   }
// };
