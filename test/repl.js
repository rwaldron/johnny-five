var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  Repl = require("../lib/repl"),
  Board = five.Board;

exports["Repl"] = {
  setUp: function(done) {
    done();
  },
  tearDown: function(done) {
    Board.purge();
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
};
