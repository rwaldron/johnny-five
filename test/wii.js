var five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  MockFirmata = require("./mock-firmata"),
  Relay = five.Relay,
  Board = five.Board;

function newBoard() {
  return new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });
}

exports["Wii"] = {

  setUp: function(done) {
    done();
  },

  default: function(test) {
    test.expect(1);
    test.ok(true,"Default test");
    test.done();
  },

  tearDown: function(done) {
    done();
  }
};
