var five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  MockFirmata = require("./mock-firmata"),
  Board = five.Board,
  Compass = five.Compass;

function newBoard() {
  return new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });
}

["HMC6352", "HMC5883L"].forEach(function(model) {

  exports[model] = {
    setUp: function(done) {

      this.clock = sinon.useFakeTimers();

      this.board = newBoard();
      this.sendI2CReadRequest = sinon.spy(this.board.io, "sendI2CReadRequest");

      this.compass = new Compass({
        board: this.board,
        device: model,
        freq: 50,
        gauss: 1.3
      });

      this.clock.tick(500);

      this.instance = [{
        name: "scale"
      }, {
        name: "register"
      }, {
        name: "freq"
      }];

      done();
    },

    shape: function(test) {
      test.expect(this.instance.length);

      this.instance.forEach(function(property) {
        test.notEqual(typeof this.compass[property.name], "undefined");
      }, this);
      test.done();
    },

    data: function(test) {
      test.expect(1);

      this.compass.on("data", function() {
        test.ok(true);
      });
      this.clock.tick(66);
      test.done();
    },

    headingchange: function(test) {
      test.expect(1);

      var callback = this.sendI2CReadRequest.args[0][2];

      this.compass.on("headingchange", function() {
        test.ok(true);
        test.done();
      });

      callback([0, 100, 0, 100, 0, 100]);
      this.clock.tick(500);

      callback([0, 32, 0, 32, 0, 32]);
      this.clock.tick(500);
    },

    tearDown: function(done) {
      this.clock.restore();
      this.sendI2CReadRequest.restore();
      done();
    }
  };
});

