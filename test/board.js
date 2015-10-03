require("es6-shim");


var SerialPort = require("./util/mock-serial").SerialPort,
  MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  __ = require("../lib/fn.js"),
  _ = require("lodash"),
  Board = five.Board,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });


exports["Initialization"] = {
  // setUp: function(done) {
  //   done();
  // },

  // tearDown: function(done) {
  //   done();
  // },

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

    test.done();
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

  ioHasError: function(test) {
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

    board.on("error", function(msg) {
      test.equals("ioHasError", msg);
      test.done();
    });

    sp.emit("error", "ioHasError");
  }
};

exports["samplingInterval"] = {
  samplingInterval: function(test) {
    test.expect(1);

    board.io.setSamplingInterval = sinon.spy();
    board.samplingInterval(100);
    test.ok(board.io.setSamplingInterval.calledOnce);

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

  "Boards": function(test) {
    test.expect(1);
    test.equal(five.Boards, five.Board.Array);
    test.done();
  },

  "Boards - connect, ready after": function(test) {
    test.expect(2);

    var io = new MockFirmata();

    var boards = new five.Boards([{
      id: "A",
      repl: false,
      debug: false,
      io: io
    }, {
      id: "B",
      repl: false,
      debug: false,
      io: io
    }]);

    test.equals(2, boards.length);

    boards.on("ready", function() {
      test.ok(true);
      test.done();
    });

    io.emit("connect");
    io.emit("ready");

  },

  "Boards - connect, ready before": function(test) {
    test.expect(2);

    var io = new MockFirmata();

    io.emit("connect");
    io.emit("ready");

    var boards = new five.Boards([{
      id: "A",
      repl: false,
      debug: false,
      io: io
    }, {
      id: "B",
      repl: false,
      debug: false,
      io: io
    }]);

    test.equals(2, boards.length);

    boards.on("ready", function() {
      test.ok(true);
      test.done();
    });
  }
};


exports["instance"] = {

  cache: function(test) {
    test.expect(1);
    test.ok(_.contains(five.Board.cache, board));
    test.done();
  },

  instance: function(test) {
    test.expect(1);
    test.ok(board);
    test.done();
  },

  io: function(test) {
    test.expect(1);
    test.ok(board.io instanceof MockFirmata);
    test.done();
  },

  id: function(test) {
    test.expect(1);
    test.ok(board.id);
    test.done();
  },

  pins: function(test) {
    test.expect(1);
    test.ok(board.pins);
    test.done();
  },
};


exports["Board.mount"] = {
  setUp: function(done) {

    this.board = new Board({
      io: new MockFirmata(),
      debug: false,
      repl: false
    });

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
