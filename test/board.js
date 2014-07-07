var SerialPort = require("./mock-serial").SerialPort,
  MockFirmata = require("./mock-firmata"),
  five = require("../lib/johnny-five.js"),
  Repl = require("../lib/repl"),
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
  }
};

exports["static"] = {
  "Board.cache": function(test) {
    test.expect(2);
    test.equal(typeof five.Board.cache, "object", "Board.cache");
    test.ok(Array.isArray(five.Board.cache), "Board.cache");
    test.done();
  },

  "Board.constrain()": function(test) {
    test.expect(5);

    test.equal(five.Board.constrain(100, 0, 255), 100);
    test.equal(five.Board.constrain(-1, 0, 255), 0);
    test.equal(five.Board.constrain(0, 0, 255), 0);
    test.equal(five.Board.constrain(256, 0, 255), 255);
    test.equal(five.Board.constrain(255, 0, 255), 255);

    test.done();
  },

  "Board.map()": function(test) {
    test.expect(3);

    test.equal(five.Board.map(1009, 300, 1009, 0, 255), 255);
    test.equal(five.Board.map(300, 300, 1009, 0, 255), 0);
    test.equal(five.Board.map(500, 0, 1000, 0, 255), 127.5);

    test.done();
  },

  "Board.range()": function(test) {
    test.expect(7);

    // Positive Range
    test.deepEqual(five.Board.range(3), [0, 1, 2, 3]);
    test.deepEqual(five.Board.range(0, 3), [0, 1, 2, 3]);
    test.deepEqual(five.Board.range(0, 10, 2), [0, 2, 4, 6, 8, 10]);
    test.deepEqual(five.Board.range(0, 9, 3), [0, 3, 6, 9]);

    // Negative Range
    test.deepEqual(five.Board.range(0, -9, -1), [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]);
    test.deepEqual(five.Board.range(0, -9, -3), [0, -3, -6, -9]);
    test.deepEqual(five.Board.range(0, -10, -2), [0, -2, -4, -6, -8, -10]);

    test.done();
  },

  "Board.range.prefixed()": function(test) {
    test.expect(4);

    // Positive Range
    test.deepEqual(five.Board.range.prefixed("A", 3), ["A0", "A1", "A2", "A3"]);
    test.deepEqual(five.Board.range.prefixed("A", 0, 3), ["A0", "A1", "A2", "A3"]);
    test.deepEqual(five.Board.range.prefixed("A", 0, 10, 2), ["A0", "A2", "A4", "A6", "A8", "A10"]);
    test.deepEqual(five.Board.range.prefixed("A", 0, 9, 3), ["A0", "A3", "A6", "A9"]);

    test.done();
  },

  "Board.uid()": function(test) {
    test.expect(1);
    test.equal(typeof five.Board.uid, "function", "Board.uid");
    test.done();
  },

  "Board.Options": function(test) {
    test.expect(1);
    test.ok(five.Board.Options);
    test.done();
  },

  "Board.mount()": function(test) {
    test.expect(1);
    test.equal(typeof five.Board.mount, "function", "Board.mount");
    test.done();
  },

  "Board.mount(obj)": function(test) {
    test.expect(2);
    test.ok(five.Board.mount({
      board: board
    }), "five.Board.mount({ board: board })");
    test.deepEqual(five.Board.mount({
      board: board
    }), board, "five.Board.mount({ board: board }) deep equals board");
    test.done();
  },

  "Board.mount(index)": function(test) {
    test.expect(2);
    test.ok(five.Board.mount(0), "five.Board.mount(0)");
    test.deepEqual(five.Board.mount(), board, "five.Board.mount(0)");
    test.done();
  },

  "Board.mount(/*none*/)": function(test) {
    test.expect(2);
    test.ok(five.Board.mount(), "five.Board.mount()");
    test.deepEqual(five.Board.mount(), board, "five.Board.mount() matches board instance");
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

  "Board.Array": function(test) {
    test.expect(1);

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
    test.done();
  }
};


exports["instance"] = {

  "cache": function(test) {
    test.expect(1);
    test.ok(_.contains(five.Board.cache, board));
    test.done();
  },

  "instance": function(test) {
    test.expect(1);
    test.ok(board);
    test.done();
  },

  "io": function(test) {
    test.expect(1);
    test.ok(board.io instanceof MockFirmata);
    test.done();
  },

  "id": function(test) {
    test.expect(1);
    test.ok(board.id);
    test.done();
  },

  "repl": function(test) {
    var board = new five.Board({
      io: new MockFirmata(),
      debug: false
    });
    test.expect(2);
    test.ok(board.repl instanceof Repl);
    test.ok(board.repl.context);

    process.stdin.pause();
    test.done();
  },

  "pins": function(test) {
    test.expect(1);
    test.ok(board.pins);
    test.done();
  },
};


exports["fn"] = {
  "cache": function(test) {
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
