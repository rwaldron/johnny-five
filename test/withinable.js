require("./common/bootstrap");


class Component extends Withinable {
  constructor(options) {
    super();

    var value = null;

    this.board = options.board;
    this.io = options.board.io;
    this.pin = options.pin;

    this.io.analogRead(this.pin, (data) => {
      value = data;
      this.emit("data", value);
    });


    this.tracking = {
      value: {
        get: 0,
        set: 0,
      },
      unit: {
        get: 0,
      },
    };

    Object.defineProperties(this, {
      value: {
        get: function() {
          this.tracking.value.get++;
          return value;
        },
        set: function(input) {
          this.tracking.value.set++;
          value = input;
        },
      },
      unit: {
        get: function() {
          this.tracking.unit.get++;
          return value;
        },
      },
    });
  }
}

exports["Withinable"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.within = this.sandbox.spy(Component.prototype, "within");

    this.component = new Component({
      board: this.board,
      pin: "A0",
    });

    done();
  },
  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  invalidRange(test) {
    test.expect(4);

    test.throws(() => {
      this.component.within(null);
    }, Error);

    test.throws(() => {
      this.component.within(undefined);
    }, Error);

    test.throws(() => {
      this.component.within("a string");
    }, Error);

    test.throws(() => {
      this.component.within(true);
    }, Error);

    test.done();
  },

  noMatchingUnitOrValue(test) {
    test.expect(1);

    const spy = this.sandbox.spy();
    const analogRead = this.analogRead.lastCall.args[1];

    this.component.within([0, 10], "smoots", spy);

    // If there was actually a "smoots" unit,
    // this would result in 11 calls to the spy
    for (let i = 0; i < 11; i++) {
      analogRead(i);
    }

    test.equal(spy.callCount, 0);

    test.done();
  },

  withinIntegerRangeDefaultsToValue(test) {
    test.expect(203);

    const spy = this.sandbox.spy();
    const analogRead = this.analogRead.lastCall.args[1];

    this.component.within([0, 10], spy);

    for (let i = 0; i < 100; i++) {
      analogRead(i);

      test.equal(spy.lastCall.args[0], null);

      if (i < 11) {
        test.equal(spy.lastCall.args[1], i);
      } else {
        test.notEqual(spy.lastCall.args[1], i);
      }
    }

    // range is inclusive
    test.equal(spy.callCount, 11);
    test.equal(this.component.tracking.value.get, 101);
    test.equal(this.component.tracking.unit.get, 0);

    test.done();
  },

  withinIntegerRangeExplicitUnit(test) {
    test.expect(203);

    const spy = this.sandbox.spy();
    const analogRead = this.analogRead.lastCall.args[1];

    this.component.within([0, 10], "unit", spy);

    for (let i = 0; i < 100; i++) {
      analogRead(i);

      test.equal(spy.lastCall.args[0], null);

      if (i < 11) {
        test.equal(spy.lastCall.args[1], i);
      } else {
        test.notEqual(spy.lastCall.args[1], i);
      }
    }

    // range is inclusive
    test.equal(spy.callCount, 11);
    test.equal(this.component.tracking.value.get, 0);
    test.equal(this.component.tracking.unit.get, 101);

    test.done();
  },

  withinFloatRange(test) {
    test.expect(202);

    const spy = this.sandbox.spy();
    const analogRead = this.analogRead.lastCall.args[1];

    this.component.within([0, 1], "unit", spy);

    for (let i = 0; i < 100; i++) {
      analogRead(i / 10);

      test.equal(spy.lastCall.args[0], null);

      if (i > 1) {
        test.notEqual(spy.lastCall.args[1], i);
      }
    }

    test.deepEqual(spy.args, [
      [ null, 0 ],
      [ null, 0.1 ],
      [ null, 0.2 ],
      [ null, 0.3 ],
      [ null, 0.4 ],
      [ null, 0.5 ],
      [ null, 0.6 ],
      [ null, 0.7 ],
      [ null, 0.8 ],
      [ null, 0.9 ],
      [ null, 1 ],
    ]);

    // range is inclusive
    test.equal(spy.callCount, 11);
    test.equal(this.component.tracking.value.get, 0);
    test.equal(this.component.tracking.unit.get, 101);

    test.done();
  },

  rangeUpper(test) {
    test.expect(1);

    const spy = this.sandbox.spy();
    const analogRead = this.analogRead.lastCall.args[1];

    this.component.within(1023, "unit", spy);

    analogRead(512);

    test.equal(spy.callCount, 1);
    test.done();
  },
};
