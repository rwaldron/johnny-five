require("es6-shim");


var MockFirmata = require("./util/mock-firmata"),
  SerialPort = require("./util/mock-serial").SerialPort,
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  __ = require("../lib/fn.js"),
  _ = require("lodash"),
  Board = five.Board,
  Boards = five.Boards,
  Virtual = Board.Virtual,
  Repl = five.Repl;

function newBoard() {
  var io = new MockFirmata();
  var board = new Board({
    io: io,
    debug: false,
    repl: false
  });

  io.emit("connect");
  io.emit("ready");

  return board;
}

function restore(target) {
  for (var prop in target) {

    if (Array.isArray(target[prop])) {
      continue;
    }

    if (target[prop] != null && typeof target[prop].restore === "function") {
      target[prop].restore();
    }

    if (typeof target[prop] === "object") {
      restore(target[prop]);
    }
  }
}

exports["Board"] = {
  setUp: function(done) {

    this.board = newBoard();

    this.replInit = sinon.stub(Repl.prototype, "initialize", function(callback) {
      callback();
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  explicit: function(test) {
    test.expect(1);

    var sp = new SerialPort("/dev/foo", {
      baudrate: 57600,
      buffersize: 128
    });

    var board = new Board({
      port: sp,
      debug: false,
      repl: false
    });

    test.equal(board.io.sp, sp);

    board.abort = true;

    setImmediate(function() {
      test.done();
    });
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

  // Disabling until @Resseguie can take a look at this
  // ioHasError: function(test) {
  //   test.expect(1);

  //   var sp = new SerialPort("/dev/foo", {
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

  emitsLogsAsEvents: function(test) {
    test.expect(19);

    var spy = sinon.spy(Board.prototype, "log");
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
        test.deepEqual(event.data, { foo: 2 });
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

      this.info("Board", "message", 1, { foo: 2 });
      this.fail("Board", "message");
      this.warn("Board", "message", [1, 2, 3]);
      this.log("Board", "message");
      this.error("Board", "message");

      test.equal(spy.callCount, 5);
      test.done();
    });

    io.emit("connect");
    io.emit("ready");
  }
};

exports["Virtual"] = {
  setUp: function(done) {
    // board = newBoard();
    this.Board = sinon.stub(five, "Board", function() {});
    this.Expander = sinon.stub(five, "Expander", function() {
      this.name = "MCP23017";
    });
    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
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
    this.board = newBoard();
    this.setSamplingInterval = sinon.spy(MockFirmata.prototype, "setSamplingInterval");
    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  samplingInterval: function(test) {
    test.expect(1);

    this.board.samplingInterval(100);
    test.ok(this.setSamplingInterval.calledOnce);

    test.done();
  }
};


exports["static"] = {
  "Board.cache": function(test) {
    test.expect(2);
    test.equal(typeof five.Board.cache, "object", "Board.cache");
    test.ok(Array.isArray(five.Board.cache), "Board.cache");
    test.done();
  },

  "Board.Options": function(test) {
    test.expect(1);
    test.ok(five.Board.Options);
    test.done();
  },
  "Board.Pins": function(test) {
    test.expect(1);
    test.ok(five.Board.Pins, "Board.Pins");
    test.done();
  },

  "Board.Event": function(test) {
    test.expect(2);
    var serial = {},
      boardEvent = new five.Board.Event({
        type: "read",
        target: serial
      });

    test.ok(boardEvent.type === "read");
    test.ok(boardEvent.target === serial);

    test.done();
  },
};

exports["Boards"] = {

  setUp: function(done) {
    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  exists: function(test) {
    test.expect(1);
    test.equal(five.Boards, five.Board.Array);
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

    this.replInit = sinon.stub(Repl.prototype, "initialize", function(callback) {
      callback();
    });

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

    this.replInit = sinon.stub(Repl.prototype, "initialize", function(callback) {
      callback();
    });

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

    this.replInit = sinon.stub(Repl.prototype, "initialize", function(callback) {
      callback();
    });

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

    this.replInit = sinon.stub(Repl.prototype, "initialize", function(callback) {
      callback();
    });

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

    this.replInit = sinon.stub(Repl.prototype, "initialize", function(callback) {
      callback();
    });

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

    this.replInit = sinon.stub(Repl.prototype, "initialize", function(callback) {
      callback();
    });

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

    var clog = sinon.spy(console, "log");

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

    var spy = sinon.spy();

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
    this.board = newBoard();
    done();
  },

  tearDown: function(done) {
    Board.purge();
    done();
  },

  cache: function(test) {
    test.expect(1);
    test.ok(_.contains(five.Board.cache, this.board));
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


exports["Board.mount"] = {
  setUp: function(done) {

    this.board = newBoard();

    done();
  },
  tearDown: function(done) {
    Board.purge();
    done();
  },
  "Board.mount()": function(test) {
    test.expect(1);
    test.equal(typeof five.Board.mount, "function", "Board.mount");
    test.done();
  },

  "Board.mount(obj)": function(test) {
    test.expect(2);
    test.ok(five.Board.mount({
      board: this.board
    }), "five.Board.mount({ board: board })");
    test.deepEqual(five.Board.mount({
      board: this.board
    }), this.board, "five.Board.mount({ board: board }) deep equals board");
    test.done();
  },

  "Board.mount(index)": function(test) {
    test.expect(2);
    test.ok(five.Board.mount(0), "five.Board.mount(0)");
    test.deepEqual(five.Board.mount(0), this.board, "five.Board.mount(0)");
    test.done();
  },

  "Board.mount(/*none*/)": function(test) {
    test.expect(2);
    test.ok(five.Board.mount(), "five.Board.mount()");
    test.deepEqual(five.Board.mount(), this.board, "five.Board.mount() matches board instance");
    test.done();
  },
};

exports["bubbled events from io"] = {
  setUp: function(done) {
    done();
  },
  tearDown: function(done) {
    Board.purge();
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
  }
};


exports["fn"] = {
  cache: function(test) {
    test.expect(6);

    test.equal(__.scale(10, 0, 20, 0, 100), 50, "scale up");
    test.equal(__.scale(10, 0, 20, 100, 0), 50, "scale up reversed");

    test.equal(__.scale(10, 0, 10, 0, 180), 180, "max is 180");
    test.equal(__.scale(10, 0, 10, 180, 0), 0, "max is 0");

    test.equal(__.scale(0, 0, 10, 180, 0), 180, "min is 180");
    test.equal(__.scale(0, 0, 10, 0, 180), 0, "min is 0");

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
