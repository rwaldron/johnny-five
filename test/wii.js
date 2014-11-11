var five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  MockFirmata = require("./mock-firmata"),
  Wii = five.Wii,
  Board = five.Board,
  board;

function newBoard() {
  return new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });
}

exports["Nunchuk"] = {

  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    board = newBoard();

    this.wii = new Wii.Nunchuk({
      board: board,
      freq: 50
    });

    this.proto = [];
    this.instance = [{
      name: "threshold"
    }, {
      name: "freq"
    }, {
      name: "holdtime"
    }];

    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.wii[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.wii[property.name], "undefined");
    }, this);

    test.done();
  },

  data: function(test) {
    test.expect(1);

    this.wii.on("data", function() {
      test.ok(true);
    });
    this.clock.tick(50);
    test.done();
  },

  tearDown: function(done) {
    this.clock.restore();
    done();
  }
};
