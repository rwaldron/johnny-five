var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  Stepper = five.Stepper;


function newBoard() {
  var io = new MockFirmata();
  var board = new Board({
    io: io,
    debug: false,
    repl: false
  });

  io.emit("connect");
  io.emit("ready");

  return board;
}

function restore(target) {
  for (var prop in target) {

    if (Array.isArray(target[prop])) {
      continue;
    }

    if (target[prop] != null && typeof target[prop].restore === "function") {
      target[prop].restore();
    }

    if (typeof target[prop] === "object") {
      restore(target[prop]);
    }
  }
}

exports["Stepper Firmware Requirement"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.board.pins[0].supportedModes = [8];
    done();
  },
  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },
  valid: function(test) {
    test.expect(1);

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

    this.board.pins[0].supportedModes = [];

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

    this.board = newBoard();
    this.board.pins[0].supportedModes = [8];

    done();
  },
  tearDown: function(done) {
    Board.purge();
    restore(this);
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
    } catch ( error ) {
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

  typeDevice: function(test) {
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
      stepper.pins,
      {step: pins[0], dir: pins[1]}
    );

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
      stepper.pins,
      {motor1: pins[0], motor2: pins[1]}
    );

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
      stepper.pins,
      {motor1: pins[0], motor2: pins[1], motor3: pins[2], motor4: pins[3]}
    );

    test.done();
  }
};

exports["Stepper - max steppers"] = {
  setUp: function(done) {

    this.maxSteppers = 6;

    this.board1 = new Board({
      io: new MockFirmata({
        pins: [
          {
            supportedModes: [8]
          }
        ]
      }),
      debug: false,
      repl: false
    });

    this.board2 = new Board({
      io: new MockFirmata({
        pins: [
          {
            supportedModes: [8]
          }
        ]
      }),
      debug: false,
      repl: false
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
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
    this.board = new Board({
      io: new MockFirmata({
        pins: [
          {
            supportedModes: [8]
          }
        ]
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

    this.step = sinon.spy(MockFirmata.prototype, "stepperStep");

    done();
  },

  tearDown: function(done) {
    this.step.restore();
    done();
  },

  step: function(test) {
    var spy = sinon.spy();

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

    this.board = new Board({
      io: new MockFirmata({
        pins: [
          {
            supportedModes: [8]
          }
        ]
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

    this.stepperStep = sinon.spy(MockFirmata.prototype, "stepperStep");

    done();
  },

  tearDown: function(done) {
    this.stepperStep.restore();
    done();
  },

  directionSet: function(test) {
    var spy = sinon.spy();

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

    this.board = new Board({
      io: new MockFirmata({
        pins: [
          {
            supportedModes: [8]
          }
        ]
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

    this.pinMode = sinon.spy(MockFirmata.prototype, "pinMode");
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
