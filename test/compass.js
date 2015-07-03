var five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  MockFirmata = require("./util/mock-firmata"),
  Board = five.Board,
  Compass = five.Compass;

function newBoard() {
  return new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });
}

var expecteds = {
  data: [25, 79],
  changes: [
    [ 25, 0 ],
    [ 45, 0 ]
  ],
  bearings: [
    { name: "North", abbr: "N", low: 0, mid: 0, high: 5.62, heading: 0 },
    { name: "North", abbr: "N", low: 0, mid: 0, high: 5.62, heading: 0 },
  ]
};

["HMC6352", "HMC5883L"].forEach(function(controller, index) {

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
      test.expect(2);

      var handler = this.i2cRead.getCall(0).args[3];
      var spy = sinon.spy();

      this.compass.on("data", spy);

      handler([1, 2, 3, 4, 5, 6]);
      this.clock.tick(11);

      test.equal(spy.callCount, 1);
      test.equal(Math.round(spy.args[0][0].heading), expecteds.data[index]);

      test.done();
    },

    change: function(test) {
      test.expect(4);

      var handler = this.board.io.i2cRead.getCall(0).args[3];
      var spy = sinon.spy();

      this.compass.on("change", spy);

      handler([0, 255, 0, 255, 0, 255]);
      this.clock.tick(100);

      handler([0, 0, 0, 0, 0, 0]);
      this.clock.tick(100);

      test.equal(spy.callCount, 2);

      test.equal(spy.args[0][0].heading, expecteds.changes[index][0]);
      test.equal(spy.args[1][0].heading, expecteds.changes[index][1]);
      test.deepEqual(this.compass.bearing, expecteds.bearings[index]);

      test.done();
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
