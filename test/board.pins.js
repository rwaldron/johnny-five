require("./common/bootstrap");

const Pins = require("../lib/board.pins");
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

exports["Pin.prototype[isType]"] = {
  setUp(done) {
    this.pins = new Pins({
      io: {
        pins: mocks.Pins.UNO
      }
    });

    done();
  },
  tearDown(done) {
    Board.purge();
    // Reset the cached conversion mechanism.
    Pins.normalize.convert = null;
    done();
  },

  isPwm(test) {
    test.expect(5);

    test.equal(this.pins.isPwm("foo"), false);
    test.equal(this.pins.isPwm("bar"), true);
    test.equal(this.pins.isPwm(0), false);
    test.equal(this.pins.isPwm(3), true);
    test.equal(this.pins.isPwm("P9_22"), true);

    test.done();
  },
};

exports["Pin.prototype[isType] overrides"] = {
  setUp(done) {
    this.pins = new Pins({
      io: {
        pins: mocks.Pins.UNO,
        isPwm() {
          return true;
        }
      }
    });

    done();
  },
  tearDown(done) {
    Board.purge();
    // Reset the cached conversion mechanism.
    Pins.normalize.convert = null;
    done();
  },

  isPwmOverride(test) {
    test.expect(5);

    test.equal(this.pins.isPwm("foo"), true);
    test.equal(this.pins.isPwm("bar"), true);
    test.equal(this.pins.isPwm(0), true);
    test.equal(this.pins.isPwm(3), true);
    test.equal(this.pins.isPwm("P9_22"), true);

    test.done();
  },

  // TODO add tests for other isFoo methods

};

exports["static"] = {
  tearDown(done) {
    Board.purge();
    // Reset the cached conversion mechanism.
    Pins.normalize.convert = null;

    done();
  },

  "Pins.isFirmata(board)": function(test) {
    test.expect(3);

    test.equal(Pins.isFirmata({
      io: {
        name: "Firmata"
      }
    }), true);
    test.equal(Pins.isFirmata({
      io: {
        name: "Mock"
      }
    }), true);
    test.equal(Pins.isFirmata({
      io: {
        name: "Other"
      }
    }), false);

    test.done();
  },

  "Pins.fromAnalog(pin)"(test) {
    test.expect(4);
    test.equal(Pins.fromAnalog("A0"), 0);
    test.equal(Pins.fromAnalog(14), 14);
    test.equal(Pins.fromAnalog(0), 0);
    test.equal(Pins.fromAnalog(9), 9);
    test.done();
  },

  "Pins.normalize() for Firmata"(test) {
    const tests = [
      // Supports short arguments form, string|number
      // new five.Device(pin);
      {
        arg: 0,
        result: {
          pin: 0
        }
      }, {
        arg: 9,
        result: {
          pin: 9
        }
      }, {
        arg: "A0",
        result: {
          pin: 0
        }
      },

      // Supports short arguments form, array
      // new five.Device([ pin1, pin2, ... ]);
      // ** Analog pins are automatically normalized
      {
        arg: ["A0", "A1"],
        result: {
          pins: [0, 1]
        }
      }, {
        arg: [5, 6],
        result: {
          pins: [5, 6]
        }
      },

      // Supports long arguments form, object
      // new five.Device([ pin1, pin2, ... ]);
      // ** Analog pins are automatically normalized
      {
        arg: {
          pin: 0
        },
        result: {
          pin: 0
        }
      }, {
        arg: {
          pin: 9
        },
        result: {
          pin: 9
        }
      }, {
        arg: {
          pin: "A0"
        },
        result: {
          pin: 0
        }
      }, {
        arg: {
          pins: ["A0", "A1"]
        },
        result: {
          pins: [0, 1]
        }
      }, {
        arg: {
          pins: [5, 6]
        },
        result: {
          pins: [5, 6]
        }
      }
    ];
    const board = {
      pins: {
        length: 20,
        type: "UNO"
      },
      io: {
        name: "Firmata",
        analogPins: {
          length: 6
        }
      }
    };

    test.expect(tests.length);

    tests.forEach(({arg, result}) => {
      test.deepEqual(Pins.normalize(arg, board), result);
    });

    test.done();
  },

  "Pins.normalize() for Non-Firmata": function(test) {
    const tests = [
      // Supports short arguments form, string|number
      // new five.Device(pin);
      {
        arg: 0,
        result: {
          pin: 0
        }
      }, {
        arg: 9,
        result: {
          pin: 9
        }
      }, {
        arg: "A0",
        result: {
          pin: "A0"
        }
      },

      // Supports short arguments form, array
      // new five.Device([ pin1, pin2, ... ]);
      // ** Analog pins are NOT automatically normalized
      {
        arg: ["A0", "A1"],
        result: {
          pins: ["A0", "A1"]
        }
      }, {
        arg: [5, 6],
        result: {
          pins: [5, 6]
        }
      },

      // Supports long arguments form, object
      // new five.Device({ pin: pin1 });
      // ** Analog pins are NOT automatically normalized
      {
        arg: {
          pin: 0
        },
        result: {
          pin: 0
        }
      }, {
        arg: {
          pin: 9
        },
        result: {
          pin: 9
        }
      }, {
        arg: {
          pin: "A0"
        },
        result: {
          pin: "A0"
        }
      },
      // Supports long arguments form, object with pin array
      // new five.Device({ pins: [pin1, pin2, pin3] });
      // ** Analog pins are NOT automatically normalized
      {
        arg: {
          pins: ["A0", "A1"]
        },
        result: {
          pins: ["A0", "A1"]
        }
      }, {
        arg: {
          pins: [5, 6]
        },
        result: {
          pins: [5, 6]
        }
      }
    ];
    const board = {
      pins: {
        length: 16,
        type: "Other"
      },
      io: {
        name: "Other",
        analogPins: {
          length: 8
        }
      }
    };

    test.expect(tests.length);

    tests.forEach(({arg, result}) => {
      test.deepEqual(Pins.normalize(arg, board), result);
    });

    test.done();
  },

  "Pins.normalize() for Non-Firmata w/ normalize method": function(test) {
    const tests = [
      // Supports short arguments form, string|number
      // new five.Device(pin);
      {
        arg: 0,
        result: {
          pin: 0
        }
      }, {
        arg: 9,
        result: {
          pin: 9
        }
      }, {
        arg: "A0",
        result: {
          pin: "A0"
        }
      },

      // Supports short arguments form, array
      // new five.Device([ pin1, pin2, ... ]);
      // ** Analog pins are NOT automatically normalized
      {
        arg: ["A0", "A1"],
        result: {
          pins: ["A0", "A1"]
        }
      }, {
        arg: [5, 6],
        result: {
          pins: [5, 6]
        }
      },

      // Supports long arguments form, object
      // new five.Device({ pin: pin1 });
      // ** Analog pins are NOT automatically normalized
      {
        arg: {
          pin: 0
        },
        result: {
          pin: 0
        }
      }, {
        arg: {
          pin: 9
        },
        result: {
          pin: 9
        }
      }, {
        arg: {
          pin: "A0"
        },
        result: {
          pin: "A0"
        }
      },
      // Supports long arguments form, object with pin array
      // new five.Device({ pins: [pin1, pin2, pin3] });
      // ** Analog pins are NOT automatically normalized
      {
        arg: {
          pins: ["A0", "A1"]
        },
        result: {
          pins: ["A0", "A1"]
        }
      }, {
        arg: {
          pins: [5, 6]
        },
        result: {
          pins: [5, 6]
        }
      }
    ];
    const board = {
      pins: {
        length: 16,
        type: "Other"
      },
      io: {
        normalize() {
          // normalize to a single testable value that's
          // unlikely to produce false positives.
          return MAX_SAFE_INTEGER;
        },
        name: "Other",
        analogPins: {
          length: 8
        }
      }
    };

    test.expect(tests.length);

    tests.forEach(({result, arg}) => {
      // Ignore the given result object values in favor of our
      // control normalization value
      const expect = typeof result.pin !== "undefined" ? {
        pin: MAX_SAFE_INTEGER
      } : {
        pins: result.pins.map(() => MAX_SAFE_INTEGER)
      };

      test.deepEqual(Pins.normalize(arg, board), expect);
    });

    test.done();
  },

  "Pin.identity(haystack, needle)": function(test) {
    test.expect(4);

    const haystack = [{
      id: "foo"
    }, {
      name: "bar"
    }, {
      port: "P9_22"
    }];

    test.equal(Pins.identity(haystack, "foo"), 0);
    test.equal(Pins.identity(haystack, "bar"), 1);
    test.equal(Pins.identity(haystack, "baz"), -1);
    test.equal(Pins.identity(haystack, "P9_22"), 2);


    test.done();
  }

};
