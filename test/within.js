
function Component(options) {
  Emitter.call(this);

  var value = null;

  this.board = options.board;
  this.io = options.board.io;
  this.pin = options.pin;

  this.io.analogRead(this.pin, function(data) {
    value = data;

    this.emit("data", value);
  }.bind(this));


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

Component.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: Component
  }
});

Object.assign(Component.prototype, within);

exports["Within"] = {
  setUp: function(done) {
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
  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  invalidRange: function(test) {
    test.expect(4);

    test.throws(function() {
      this.component.within(null);
    }.bind(this), Error);

    test.throws(function() {
      this.component.within(undefined);
    }.bind(this), Error);

    test.throws(function() {
      this.component.within("a string");
    }.bind(this), Error);

    test.throws(function() {
      this.component.within(true);
    }.bind(this), Error);

    test.done();
  },

  noMatchingUnitOrValue: function(test) {
    test.expect(1);

    var spy = this.sandbox.spy();
    var analogRead = this.analogRead.lastCall.args[1];

    this.component.within([0, 10], "smoots", spy);

    // If there was actually a "smoots" unit,
    // this would result in 11 calls to the spy
    for (var i = 0; i < 11; i++) {
      analogRead(i);
    }

    test.equal(spy.callCount, 0);

    test.done();
  },

  withinIntegerRangeDefaultsToValue: function(test) {
    test.expect(203);

    var spy = this.sandbox.spy();
    var analogRead = this.analogRead.lastCall.args[1];

    this.component.within([0, 10], spy);

    for (var i = 0; i < 100; i++) {
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

  withinIntegerRangeExplicitUnit: function(test) {
    test.expect(203);

    var spy = this.sandbox.spy();
    var analogRead = this.analogRead.lastCall.args[1];

    this.component.within([0, 10], "unit", spy);

    for (var i = 0; i < 100; i++) {
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

  withinFloatRange: function(test) {
    test.expect(202);

    var spy = this.sandbox.spy();
    var analogRead = this.analogRead.lastCall.args[1];

    this.component.within([0, 1], "unit", spy);

    for (var i = 0; i < 100; i++) {
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

  rangeUpper: function(test) {
    test.expect(1);

    var spy = this.sandbox.spy();
    var analogRead = this.analogRead.lastCall.args[1];

    this.component.within(1023, "unit", spy);

    analogRead(512);

    test.equal(spy.callCount, 1);
    test.done();
  },

  rangeUpper: function(test) {
    test.expect(1);

    var spy = this.sandbox.spy();
    var analogRead = this.analogRead.lastCall.args[1];

    this.component.within(1023, "unit", spy);

    analogRead(512);

    test.equal(spy.callCount, 1);
    test.done();
  },
};
