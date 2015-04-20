var SerialPort = require("./util/mock-serial").SerialPort,
  MockFirmata = require("./util/mock-firmata"),
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

    test.expect(2);

    board.on("ready", function() {
      console.log("message");
      test.ok(board.repl instanceof Repl);
      test.ok(board.repl.context);
      Repl.isBlocked = true;
      test.done();
    });

    io.emit("connect");
    io.emit("ready");
  },
};
