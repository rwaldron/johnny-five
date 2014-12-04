require("es6-shim");

global.IS_TEST_MODE = true;

var SerialPort = require("./mock-serial").SerialPort,
  MockFirmata = require("./mock-firmata"),
  five = require("../lib/johnny-five.js"),
  Repl = require("../lib/repl");

exports["Repl"] = {
  repl: function(test) {
    var board = new five.Board({
      io: new MockFirmata(),
      debug: false
    });
    test.expect(2);

    board.on("ready", function() {
      test.ok(board.repl instanceof Repl);
      test.ok(board.repl.context);
      Repl.isBlocked = true;
      test.done();
    });
  },
};
