var mocks = require("mock-firmata"),
  MockFirmata = mocks.Firmata,
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  Stepper = five.Stepper;


function newBoard(pins) {

  if (pins) {
    pins.forEach(function(pin) {
      Object.assign(pin, {
        mode: 1,
        value: 0,
        report: 1,
        analogChannel: 127
      });
    });
  }

  var io = new MockFirmata({
    pins: pins
  });
  var board = new Board({
    io: io,
    debug: false,
    repl: false
  });

  io.emit("connect");
  io.emit("ready");

  return board;
}


exports["Stepper Firmware Requirement"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    done();
  },
  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },
  valid: function(test) {
    test.expect(1);

    this.board = newBoard([{
      supportedModes: [],
    }, {
      supportedModes: [],
    }, {
      supportedModes: [0, 1, 4, 8],
    }, {
      supportedModes: [0, 1, 3, 4, 8],
    }]);

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

    this.board = newBoard([{
      supportedModes: [],
    }, {
      supportedModes: [],
    }, {
      supportedModes: [0, 1, 4],
    }, {
      supportedModes: [0, 1, 3, 4],
    }]);

    try {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.DRIVER,
        stepsPerRev: 200,
        pins: [2, 3]
      });
    } catch (error) {
      test.equals(error.message, "Stepper is not supported");
    }

    test.done();
  },
};

exports["Stepper - constructor"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.board = newBoard();
    this.board.pins[0].supportedModes = [8];

    done();
  },
  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },
  inferTypeAmbiguous: function(test) {
    test.expect(1);

    try {
      new Stepper({
        board: this.board,
        stepsPerRev: 200,
        pins: [2, 3]
      });
    } catch (error) {
      test.equals(error.message, "Stepper requires a `type` number value (DRIVER, TWO_WIRE)");
    }

    test.done();
  },

  inferTypeDriver: function(test) {
    test.expect(2);
    var pins = {
      step: 2,
      dir: 3
    };
    var stepper = new Stepper({
      board: this.board,
      stepsPerRev: 200,
      pins: pins
    });
    test.equal(stepper.type, Stepper.TYPE.DRIVER);
    test.deepEqual(stepper.pins, pins);

    test.done();
  },

  inferType2Wire: function(test) {
    test.expect(2);
    var pins = {
      motor1: 3,
      motor2: 4
    };
    var stepper = new Stepper({
      board: this.board,
      stepsPerRev: 200,
      pins: pins
    });
    test.equal(stepper.type, Stepper.TYPE.TWO_WIRE);
    test.deepEqual(stepper.pins, pins);

    test.done();
  },

  inferType4Wire: function(test) {
    test.expect(2);
    var pins = {
      motor1: 2,
      motor2: 3,
      motor3: 4,
      motor4: 5
    };
    var stepper = new Stepper({
      board: this.board,
      stepsPerRev: 200,
      pins: pins
    });
    test.equal(stepper.type, Stepper.TYPE.FOUR_WIRE);
    test.deepEqual(stepper.pins, pins);

    test.done();
  },

  typeDriver: function(test) {
    test.expect(4);
    var pins = {
      step: 2,
      dir: 3
    };
    var stepper = new Stepper({
      board: this.board,
      type: five.Stepper.TYPE.DRIVER,
      stepsPerRev: 200,
      pins: pins
    });

    test.equal(stepper.type, Stepper.TYPE.DRIVER);
    test.deepEqual(stepper.pins, pins);

    pins = [3, 4];
    stepper = new Stepper({
      board: this.board,
      type: five.Stepper.TYPE.DRIVER,
      stepsPerRev: 200,
      pins: pins
    });

    test.equal(stepper.type, Stepper.TYPE.DRIVER);
    test.deepEqual(
      stepper.pins, {
        step: pins[0],
        dir: pins[1]
      }
    );

    test.done();
  },

  invalidDriverEmpty: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.DRIVER,
        stepsPerRev: 200,
        pins: {}
      });
    });
    test.done();
  },

  invalidDriverStep: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.DRIVER,
        stepsPerRev: 200,
        pins: {
          dir: 4,
        }
      });
    });
    test.done();
  },

  invalidDriverDir: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.DRIVER,
        stepsPerRev: 200,
        pins: {
          step: 1,
        }
      });
    });
    test.done();
  },

  validDriver: function(test) {
    test.expect(1);
    test.doesNotThrow(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.DRIVER,
        stepsPerRev: 200,
        pins: {
          step: 0,
          dir: 1,
        }
      });
    });
    test.done();
  },

  type2Wire: function(test) {
    test.expect(4);
    var pins = {
      motor1: 2,
      motor2: 3
    };
    var stepper = new Stepper({
      board: this.board,
      type: five.Stepper.TYPE.TWO_WIRE,
      stepsPerRev: 200,
      pins: pins
    });

    test.equal(stepper.type, Stepper.TYPE.TWO_WIRE);
    test.deepEqual(stepper.pins, pins);

    pins = [3, 4];
    stepper = new Stepper({
      board: this.board,
      type: five.Stepper.TYPE.TWO_WIRE,
      stepsPerRev: 200,
      pins: pins
    });

    test.equal(stepper.type, Stepper.TYPE.TWO_WIRE);
    test.deepEqual(
      stepper.pins, {
        motor1: pins[0],
        motor2: pins[1]
      }
    );

    test.done();
  },

  invalid2wireEmpty: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.TWO_WIRE,
        stepsPerRev: 200,
        pins: {}
      });
    });
    test.done();
  },

  invalid2wire1: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.TWO_WIRE,
        stepsPerRev: 200,
        pins: {
          motor2: 4,
        }
      });
    });
    test.done();
  },

  invalid2wire2: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.TWO_WIRE,
        stepsPerRev: 200,
        pins: {
          motor1: 1,
        }
      });
    });
    test.done();
  },

  valid2wire: function(test) {
    test.expect(1);
    test.doesNotThrow(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.TWO_WIRE,
        stepsPerRev: 200,
        pins: {
          motor1: 0,
          motor2: 1,
        }
      });
    });
    test.done();
  },

  type4Wire: function(test) {
    test.expect(4);
    var pins = {
      motor1: 2,
      motor2: 3,
      motor3: 4,
      motor4: 5
    };
    var stepper = new Stepper({
      board: this.board,
      type: five.Stepper.TYPE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: pins
    });

    test.equal(stepper.type, Stepper.TYPE.FOUR_WIRE);
    test.deepEqual(stepper.pins, pins);

    pins = [3, 4, 5, 6];
    stepper = new Stepper({
      board: this.board,
      type: five.Stepper.TYPE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: pins
    });

    test.equal(stepper.type, Stepper.TYPE.FOUR_WIRE);
    test.deepEqual(
      stepper.pins, {
        motor1: pins[0],
        motor2: pins[1],
        motor3: pins[2],
        motor4: pins[3]
      }
    );

    test.done();
  },

  invalid4wireEmpty: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.FOUR_WIRE,
        stepsPerRev: 200,
        pins: {}
      });
    });
    test.done();
  },

  invalid4wire1: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.FOUR_WIRE,
        stepsPerRev: 200,
        pins: {
          motor2: 3,
          motor3: 4,
          motor4: 5
        }
      });
    });
    test.done();
  },

  invalid4wire2: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.FOUR_WIRE,
        stepsPerRev: 200,
        pins: {
          motor1: 1,
          motor3: 4,
          motor4: 5
        }
      });
    });
    test.done();
  },

  invalid4wire3: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.FOUR_WIRE,
        stepsPerRev: 200,
        pins: {
          motor1: 3,
          motor2: 4,
          motor4: 5
        }
      });
    });
    test.done();
  },

  invalid4wire4: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.FOUR_WIRE,
        stepsPerRev: 200,
        pins: {
          motor1: 3,
          motor2: 4,
          motor3: 5
        }
      });
    });
    test.done();
  },

  valid4wire: function(test) {
    test.expect(1);
    test.doesNotThrow(function() {
      new Stepper({
        board: this.board,
        type: five.Stepper.TYPE.FOUR_WIRE,
        stepsPerRev: 200,
        pins: {
          motor1: 0,
          motor2: 1,
          motor3: 4,
          motor4: 5
        }
      });
    });
    test.done();
  }
};

exports["Stepper - max steppers"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.maxSteppers = 6;

    this.board1 = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.board2 = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  singleBoard: function(test) {
    test.expect(2);

    test.doesNotThrow(function() {
      for (var i = 0; i < this.maxSteppers; i++) {
        new Stepper({
          board: this.board1,
          stepsPerRev: 200,
          pins: [3, 4, 5, 6]
        });
      }
    }.bind(this));

    test.throws(function() {
      new Stepper({
        board: this.board1,
        stepsPerRev: 200,
        pins: [3, 4, 5, 6]
      });
    }.bind(this));

    test.done();
  },

  multipleBoards: function(test) {
    test.expect(3);

    // should be able to add max on two boards
    test.doesNotThrow(function() {
      for (var i = 0; i < this.maxSteppers; i++) {
        new Stepper({
          board: this.board1,
          stepsPerRev: 200,
          pins: [2, 3, 4, 5]
        });
        new Stepper({
          board: this.board2,
          stepsPerRev: 200,
          pins: [2, 3, 4, 5]
        });
      }
    }.bind(this));

    // but can't add any more to either board
    test.throws(function() {
      new Stepper({
        board: this.board1,
        stepsPerRev: 200,
        pins: [2, 3, 4, 5]
      });
    }.bind(this));

    test.throws(function() {
      new Stepper({
        board: this.board2,
        stepsPerRev: 200,
        pins: [2, 3, 4, 5]
      });
    }.bind(this));

    test.done();
  }
};

exports["Stepper - step callback"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.stepper = new Stepper({
      board: this.board,
      type: five.Stepper.TYPE.DRIVER,
      stepsPerRev: 200,
      pins: [2, 3]
    });

    this.step = this.sandbox.spy(MockFirmata.prototype, "stepperStep");

    done();
  },

  tearDown: function(done) {
    this.step.restore();
    done();
  },

  step: function(test) {
    var spy = this.sandbox.spy();

    test.expect(1);

    this.stepper.cw().step(1, spy);
    // simulate successful callback from board.io
    this.step.getCall(0).args[6]();

    // test that callback called up the chain to .step()
    test.equal(spy.getCall(0).args[0], null);
    test.done();
  }
};

exports["Stepper - set direction required before step"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.stepper = new Stepper({
      board: this.board,
      type: five.Stepper.TYPE.DRIVER,
      stepsPerRev: 200,
      pins: [2, 3]
    });

    this.stepperStep = this.sandbox.spy(MockFirmata.prototype, "stepperStep");

    done();
  },

  tearDown: function(done) {
    this.stepperStep.restore();
    done();
  },

  directionSet: function(test) {
    var spy = this.sandbox.spy();

    test.expect(2);

    // Call .step() before and after setting direction
    this.stepper.step(1, spy);
    this.stepper.cw();
    this.stepper.step(1, spy);

    // simulate callback on success for second call
    // Note, stepper should error out before this.stepperStep()
    // is called before direction is set, thus getCall(0) here.
    this.stepperStep.getCall(0).args[6]();

    test.ok(!!spy.getCall(0).args[0]);
    test.ok(!spy.getCall(1).args[0]);

    test.done();
  }
};

exports["Stepper - chainable direction"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.stepper = new Stepper({
      board: this.board,
      type: five.Stepper.TYPE.DRIVER,
      stepsPerRev: 200,
      pins: [2, 3]
    });

    done();
  },

  tearDown: function(done) {
    done();
  },

  chainable: function(test) {
    test.expect(2);

    // .cw() and .ccw() return `this`
    test.equal(this.stepper.cw(), this.stepper);
    test.equal(this.stepper.ccw(), this.stepper);

    test.done();
  }
};

exports["Stepper - rpm / speed"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8],
        }, ]
      }),
      debug: false,
      repl: false
    });

    this.pinMode = this.sandbox.spy(MockFirmata.prototype, "pinMode");
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
  }
};
