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

["HMC6352", "HMC5883L"].forEach(function(controller) {



  exports[controller] = {
    setUp: function(done) {

      this.clock = sinon.useFakeTimers();
      this.board = newBoard();
      this.i2cRead = sinon.spy(this.board.io, "i2cRead");

      this.compass = new Compass({
        board: this.board,
        controller: controller,
      });

      this.clock.tick(500);

      this.properties = [{
        name: "bearing"
      }, {
        name: "heading"
      }];

      done();
    },

    shape: function(test) {
      test.expect(this.properties.length);

      this.properties.forEach(function(property) {
        test.notEqual(typeof this.compass[property.name], "undefined");
      }, this);
      test.done();
    },

    data: function(test) {
      test.expect(1);

      var handler = this.i2cRead.getCall(0).args[3];

      this.compass.on("data", function() {
        test.ok(true);
      });

      handler([1, 2, 3, 4, 5, 6]);
      this.clock.tick(11);

      test.done();
    },

    change: function(test) {
      test.expect(1);

      var compass = new Compass({
        board: this.board,
        controller: controller,
      });

      var handler = this.board.io.i2cRead.getCall(1).args[3];

      compass.once("change", function() {
        test.ok(true);
        test.done();
      });

      handler([0, 255, 0, 255, 0, 255]);
      this.clock.tick(20);
    },

    tearDown: function(done) {
      this.clock.restore();
      this.i2cRead.restore();
      done();
    }
  };
});


exports["Invalid or missing controller"] = {
  missing: function(test) {
    test.expect(1);
    test.throws(function() {
      new Compass({
        board: newBoard()
      });
    });

    test.done();
  },
  invalid: function(test) {
    test.expect(1);
    test.throws(function() {
      new Compass({
        board: newBoard(),
        controller: 1
      });
    });

    test.done();
  },
};

