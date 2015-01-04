var MockFirmata = require("./mock-firmata"),
  pins = require("./mock-pins"),
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  Stepper = five.Stepper;

exports["Stepper Firmware Requirement"] = {
  setUp: function(done) {
    done();
  },
  tearDown: function(done) {
    done();
  },

  valid: function(test) {
    test.expect(1);

    this.board = new Board({
      io: new MockFirmata({
        pins: [
          {
            supportedModes: [8],
          },
        ]
      }),
      debug: false,
      repl: false
    });

    test.doesNotThrow(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.DRIVER,
        stepsPerRev: 200,
        pins: [2, 3]
      });
    }.bind(this));

    test.done();
  },

  invalid: function(test) {
    test.expect(1);

    this.board = new Board({
      io: new MockFirmata(),
      debug: false,
      repl: false
    });

    test.throws(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.DRIVER,
        stepsPerRev: 200,
        pins: [2, 3]
      });
    }.bind(this));

    test.done();
  },
};

exports["Stepper - rpm / speed"] = {
  setUp: function(done) {

    this.board = new Board({
      io: new MockFirmata({
        pins: [
          {
            supportedModes: [8],
          },
        ]
      }),
      debug: false,
      repl: false
    });

    this.pinMode = sinon.spy(this.board.io, "pinMode");
    this.stepper = new Stepper({
      board: this.board,
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
  },
};
