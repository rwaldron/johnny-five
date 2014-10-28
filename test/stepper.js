var MockFirmata = require("./mock-firmata"),
  pins = require("./mock-pins"),
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  Stepper = five.Stepper,
  board = new Board({
    io: new MockFirmata({
      firmware: {
        name: "AdvancedFirmata"
      }
    }),
    debug: false,
    repl: false
  });

exports["Stepper - rpm / speed"] = {
  setUp: function(done) {

    this.pinMode = sinon.spy(board.io, "pinMode");
    this.stepper = new Stepper({
      board: board,
      type: five.Stepper.TYPE.DRIVER,
      stepsPerRev: 200,
      pins: [2, 3]
    });
    done();
  },
  tearDown: function(done) {
    this.pinMode.restore();
    done();
  },

  pinMode: function(test) {
    test.expect(1);
    test.equal(this.pinMode.callCount, 2);
    test.done();
  },

  "rpm to speed": function(test) {
    test.expect(1);
    this.stepper.rpm(180);
    test.equal(this.stepper.speed(), 1885);
    test.done();
  },

  "speed to rpm": function(test) {
    test.expect(1);
    this.stepper.speed(1885);
    test.equal(this.stepper.rpm(), 180);
    test.done();
  }
};
