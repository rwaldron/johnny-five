require("./common/bootstrap");

const Controllers = {
  DEFAULT: {
    requirements: {
      value: {
        options: {
          thing: {
            throws: false,
            message: "message",
            typeof: "number"
          }
        }
      }
    },
    initialize: {
      value(options, callback) {
        Promise.resolve().then(() => callback("DEFAULT"));
      }
    },
    toSqareRoot: {
      value(n) {
        return Math.sqrt(n);
      }
    }
  },
  EXPLICIT: {
    initialize: {
      value(options, callback) {
        Promise.resolve().then(() => callback("EXPLICIT"));
      }
    },
    toCube: {
      value(n) {
        return n ** 3;
      }
    }
  }
};

exports["Board.Controller"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.odp = this.sandbox.spy(Object, "defineProperties");
    this.warn = this.sandbox.stub(Board.prototype, "warn");
    this.board = newBoard();

    done();
  },

  tearDown(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    done();
  },

  DEFAULT(test) {
    test.expect(4);

    const board = newBoard();
    const context = {
      board
    };

    this.odp.reset();

    Board.Controller.call(context, Controllers, {
      controller: "DEFAULT"
    });

    test.equal(this.odp.callCount, 1);
    test.equal(typeof context.toSqareRoot, "function");
    test.equal(typeof context.initialize, "function");

    context.initialize({}, data => {
      test.equal(data, "DEFAULT");
      test.done();
    });
  },

  explicit(test) {
    test.expect(4);

    const board = newBoard();
    const context = {
      board
    };

    this.odp.reset();

    Board.Controller.call(context, Controllers, {
      controller: "EXPLICIT"
    });

    test.equal(this.odp.callCount, 1);
    test.equal(typeof context.toCube, "function");
    test.equal(typeof context.initialize, "function");

    context.initialize({}, data => {
      test.equal(data, "EXPLICIT");
      test.done();
    });
  },

  noRequirements(test) {
    test.expect(1);

    const board = newBoard();
    const context = {
      board
    };

    const options = {};

    this.odp.reset();

    Board.Controller.call(context, Controllers, options);

    test.equal(this.odp.callCount, 1);

    test.done();
  },

  requirementsPresent(test) {
    test.expect(2);

    const context = {
      board: this.board
    };
    const options = {
      thing: 1
    };

    this.odp.reset();

    Board.Controller.call(context, Controllers, options);

    test.equal(this.warn.callCount, 0);
    test.equal(this.odp.callCount, 1);

    test.done();
  },

  requirementsMissingWarning(test) {
    test.expect(4);

    const board = newBoard();
    const context = {
      board
    };
    const options = {};

    this.odp.reset();

    Board.Controller.call(context, Controllers, options);

    test.equal(this.warn.getCall(0).args[0], "Object");
    test.equal(this.warn.getCall(0).args[1], "message");
    test.equal(this.warn.callCount, 1);
    test.equal(this.odp.callCount, 1);

    test.done();
  },

  requirementsMissingThrows(test) {
    test.expect(3);

    const context = {
      board: this.board
    };
    const options = {};

    this.odp.reset();

    Controllers.DEFAULT.requirements.value.options.thing.throws = true;

    test.throws(() => {
      Board.Controller.call(context, Controllers, options);
    });


    test.equal(this.warn.callCount, 0);
    test.equal(this.odp.callCount, 0);

    test.done();
  },


};
