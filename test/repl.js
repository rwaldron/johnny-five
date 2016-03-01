var mocks = require("mock-firmata"),
  MockFirmata = mocks.Firmata,
  five = require("../lib/johnny-five.js"),
  Repl = require("../lib/repl"),
  sinon = require("sinon"),
  Board = five.Board;

exports["Repl"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    done();
  },
  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },
  repl: function(test) {
    var io = new MockFirmata();
    var board = new Board({
      io: io,
      debug: false
    });

    test.expect(3);

    board.on("ready", function() {
      test.ok(this.repl === board.repl);
      test.ok(this.repl instanceof Repl);
      test.ok(this.repl.context);
      test.done();
    });

    io.emit("connect");
    io.emit("ready");
  },
  fwdExitEvent: function(test) {
    test.expect(1);

    var io = new MockFirmata();
    var board = new Board({
      io: io,
      debug: false
    });

    var reallyExit = this.sandbox.stub(process, "reallyExit", function() {
      reallyExit.restore();
      test.done();
    });

    board.on("ready", function() {
      this.on("exit", function() {
        test.ok(true);
      });
      this.repl.close();
    });

    io.emit("connect");
    io.emit("ready");
  },

};
