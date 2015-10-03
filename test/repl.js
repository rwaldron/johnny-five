var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  Repl = require("../lib/repl"),
  Board = five.Board;

exports["Repl"] = {
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
      Repl.isBlocked = true;
      test.done();
    });

    io.emit("connect");
    io.emit("ready");
  },
};
