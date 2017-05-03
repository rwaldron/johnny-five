require("./common/bootstrap");

var util = require("util");

function Output(opts) {
  if (typeof opts === "number") {
    opts = {
      pin: opts
    };
  }

  Object.assign(this, opts);
}

Output.prototype.a = function() {};
Output.prototype.b = function() {};

function Outputs(numsOrObjects) {
  if (!(this instanceof Outputs)) {
    return new Outputs(numsOrObjects);
  }

  Object.defineProperty(this, "type", {
    value: Output
  });

  Collection.call(this, numsOrObjects);
}

util.inherits(Outputs, Collection);

Collection.installMethodForwarding(
  Outputs.prototype, Output.prototype
);


function random10bv() {
  return Math.round(Math.random() * 1023);
}

function Input(opts) {
  Emitter.call(this);

  if (typeof opts === "number") {
    opts = {
      pin: opts
    };
  }

  Object.assign(this, opts);

  this.period = opts.period || 10;
  this.value = random10bv();

  this.on("data", function(value) {
    this.value = value;
  }.bind(this));

}

Input.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: Input
  }
});

Input.prototype.a = function() {};
Input.prototype.b = function() {};

function Inputs(numsOrObjects) {
  if (!(this instanceof Inputs)) {
    return new Inputs(numsOrObjects);
  }

  Object.defineProperty(this, "type", {
    value: Input
  });

  Collection.Emitter.call(this, numsOrObjects);
}

util.inherits(Inputs, Collection.Emitter);

Collection.installMethodForwarding(
  Inputs.prototype, Input.prototype
);


function Other(opts) {
  Emitter.call(this);

  if (typeof opts === "number") {
    opts = {
      pin: opts
    };
  }

  Object.assign(this, opts);

  this.period = opts.period || 10;
  this.value = random10bv();

  this.on("data", function(value) {
    this.value = value;
  }.bind(this));

}

Other.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: Other
  }
});

Other.prototype.c = function() {};
Other.prototype.d = function() {};


exports["Collection"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.outputs = new Outputs([0, 1, 2]);

    this.a = this.sandbox.spy(Output.prototype, "a");
    this.b = this.sandbox.spy(Output.prototype, "b");

    done();
  },
  tearDown: function(done) {
    this.sandbox.restore();
    Collection.purge();
    done();
  },

  "Symbol.iterator": function(test) {
    if (typeof Symbol !== "undefined" && Symbol.iterator) {
      test.expect(1);
      test.equal(Collection.prototype[Symbol.iterator], Array.prototype[Symbol.iterator]);
    }
    test.done();
  },

  nested: function(test) {
    test.expect(9);

    this.a.reset();
    this.b.reset();

    var x = new Output(1);
    var y = new Output(2);
    var z = new Output(3);

    var outputs = new Outputs([x, y]);
    var nested = new Outputs([outputs, z]);

    nested.a(90);

    test.equal(this.a.callCount, 3);
    test.equal(this.a.getCall(0).args[0], 90);
    test.equal(this.a.getCall(1).args[0], 90);
    test.equal(this.a.getCall(2).args[0], 90);

    test.equal(nested.length, 2);
    test.equal(nested[0][0], x);
    test.equal(nested[0][1], y);
    test.equal(nested[1], z);

    nested.b();

    test.equal(this.b.callCount, 3);

    test.done();
  },

  sharedProperties: function(test) {
    test.expect(12);

    var reference = {};

    var outputs = new Outputs({
      pins: [1, 2, 3],
      shared: true,
      reference: reference
    });

    test.ok(outputs[0] instanceof Output);
    test.ok(outputs[1] instanceof Output);
    test.ok(outputs[2] instanceof Output);

    test.equal(outputs[0].pin, 1);
    test.equal(outputs[1].pin, 2);
    test.equal(outputs[2].pin, 3);

    test.equal(outputs[0].shared, true);
    test.equal(outputs[1].shared, true);
    test.equal(outputs[2].shared, true);

    test.equal(outputs[0].reference, reference);
    test.equal(outputs[1].reference, reference);
    test.equal(outputs[2].reference, reference);

    test.done();
  },

  pinsIsArray: function(test) {
    test.expect(2);

    var outputs = new Outputs({
      pins: [ [ 1, 2, 3 ], [ 4, 5, 6 ] ],
    });
    test.deepEqual(outputs[0].pins, [1, 2, 3]);
    test.deepEqual(outputs[1].pins, [4, 5, 6]);

    test.done();
  },

  add: function(test) {
    test.expect(3);

    test.equal(this.outputs.length, 3);

    this.outputs.add(null);
    test.equal(this.outputs.length, 3);

    this.outputs.add(new Output(5));
    test.equal(this.outputs.length, 4);

    test.done();
  },

  addNested: function(test) {
    test.expect(2);

    var outputs = new Outputs([new Output(10), new Output(11)]);

    test.equal(this.outputs.length, 3);

    this.outputs.add(outputs);

    test.equal(this.outputs.length, 4);

    test.done();
  },

  each: function(test) {
    test.expect(3);

    this.outputs.each(function(output) {
      test.equal(output, this);
    });

    test.done();
  },

  byId: function(test) {
    test.expect(1);

    this.outputs[0].id = "test";
    test.equal(this.outputs.byId("test"), this.outputs[0]);
    test.done();
  },

  forEach: function(test) {
    test.expect(6);

    var context = {};

    this.outputs.forEach(function(output) {
      test.notEqual(output, this);
      test.equal(context, this);
    }, context);

    test.done();
  },

  indexOf: function(test) {
    test.expect(2);

    test.equal(this.outputs.indexOf(this.outputs[0]), 0);
    test.equal(this.outputs.indexOf("foo"), -1);

    test.done();
  },

  includes: function(test) {
    test.expect(1);

    test.equal(this.outputs.includes(this.outputs[0]), true);

    test.done();
  },

  slice: function(test) {
    test.expect(5);

    test.equal(this.outputs.slice(0).length, this.outputs.length);
    test.equal(this.outputs.slice(0).includes(this.outputs[0]), true);
    test.equal(this.outputs.slice(0).includes(this.outputs[1]), true);
    test.equal(this.outputs.slice(0).includes(this.outputs[2]), true);
    test.equal(this.outputs.slice(0) instanceof Outputs, true);
    test.done();
  },

  map: function(test) {
    test.expect(1);

    var mapped = this.outputs.map(function(output, index) {
      return index;
    });

    test.deepEqual(mapped, [0, 1, 2]);
    test.done();
  },

};

exports["Collection.Emitter"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.inputs = new Inputs([0, 1, 2]);
    this.a = this.sandbox.spy(Input.prototype, "a");
    this.b = this.sandbox.spy(Input.prototype, "b");

    done();
  },
  tearDown: function(done) {
    this.inputs.removeAllListeners();
    this.sandbox.restore();
    Collection.purge();
    done();
  },

  "Symbol.iterator": function(test) {
    if (typeof Symbol !== "undefined" && Symbol.iterator) {
      test.expect(1);
      test.equal(Collection.prototype[Symbol.iterator], Array.prototype[Symbol.iterator]);
    }
    test.done();
  },

  nested: function(test) {
    test.expect(9);

    this.a.reset();
    this.b.reset();

    var x = new Input(1);
    var y = new Input(2);
    var z = new Input(3);

    var inputs = new Inputs([x, y]);
    var nested = new Inputs([inputs, z]);

    nested.a(90);

    test.equal(this.a.callCount, 3);
    test.equal(this.a.getCall(0).args[0], 90);
    test.equal(this.a.getCall(1).args[0], 90);
    test.equal(this.a.getCall(2).args[0], 90);

    test.equal(nested.length, 2);
    test.equal(nested[0][0], x);
    test.equal(nested[0][1], y);
    test.equal(nested[1], z);

    nested.b();

    test.equal(this.b.callCount, 3);

    test.done();
  },

  sharedProperties: function(test) {
    test.expect(12);

    var reference = {};

    var inputs = new Inputs({
      pins: [1, 2, 3],
      shared: true,
      reference: reference
    });

    test.ok(inputs[0] instanceof Input);
    test.ok(inputs[1] instanceof Input);
    test.ok(inputs[2] instanceof Input);

    test.equal(inputs[0].pin, 1);
    test.equal(inputs[1].pin, 2);
    test.equal(inputs[2].pin, 3);

    test.equal(inputs[0].shared, true);
    test.equal(inputs[1].shared, true);
    test.equal(inputs[2].shared, true);

    test.equal(inputs[0].reference, reference);
    test.equal(inputs[1].reference, reference);
    test.equal(inputs[2].reference, reference);

    test.done();
  },

  period: function(test) {
    test.expect(3);

    test.equal(this.inputs.period, 5);
    this.inputs.period = 10;
    test.equal(this.inputs.period, 10);
    this.inputs.period = 5;
    test.equal(this.inputs.period, 5);

    test.done();
  },

  frequency: function(test) {
    test.expect(1);

    var inputs = new Inputs({
      pins: [1, 2, 3],
      frequency: 50,
    });

    test.equal(inputs.period, 20);

    test.done();
  },

  add: function(test) {
    test.expect(3);

    test.equal(this.inputs.length, 3);

    this.inputs.add(null);
    test.equal(this.inputs.length, 3);

    this.inputs.add(new Input(5));
    test.equal(this.inputs.length, 4);

    test.done();
  },

  addNested: function(test) {
    test.expect(2);

    var inputs = new Inputs([new Input(10), new Input(11)]);

    test.equal(this.inputs.length, 3);

    this.inputs.add(inputs);

    test.equal(this.inputs.length, 4);

    test.done();
  },

  each: function(test) {
    test.expect(3);

    this.inputs.each(function(input) {
      test.equal(input, this);
    });

    test.done();
  },

  forEach: function(test) {
    test.expect(6);

    var context = {};

    this.inputs.forEach(function(input) {
      test.notEqual(input, this);
      test.equal(context, this);
    }, context);

    test.done();
  },

  map: function(test) {
    test.expect(1);

    var mapped = this.inputs.map(function(output, index) {
      return index;
    });

    test.deepEqual(mapped, [0, 1, 2]);
    test.done();
  },

  data: function(test) {
    test.expect(6);

    var spy = this.sandbox.spy();

    this.inputs.on("data", spy);

    this.clock.tick(1);
    this.inputs[0].emit("data", 1023);
    this.inputs[1].emit("data", 1023);
    this.inputs[2].emit("data", 1023);
    this.clock.tick(2);
    this.inputs[0].emit("data", 1);
    this.inputs[1].emit("data", 1);
    this.inputs[2].emit("data", 1);
    this.clock.tick(5);
    this.inputs[0].emit("data", 2);

    test.equal(spy.callCount, 1);
    test.equal(spy.lastCall.args[0], this.inputs);

    test.equal(this.inputs.length, 3);
    test.equal(this.inputs[0].value, 2);
    test.equal(this.inputs[1].value, 1);
    test.equal(this.inputs[2].value, 1);

    test.done();
  },

  change: function(test) {
    test.expect(4);

    this.inputs = new Inputs({
      pins: ["A0", "A1", "A2"],
      board: this.board,
    });

    var spy = this.sandbox.spy();

    this.inputs.on("change", spy);

    this.inputs[0].emit("data", 0);
    this.inputs[1].emit("data", 0);
    this.inputs[2].emit("data", 0);
    this.inputs[0].emit("data", 1023);
    this.inputs[1].emit("data", 1023);
    this.inputs[2].emit("data", 1023);
    this.inputs[0].emit("data", 1);
    this.inputs[1].emit("data", 1);
    this.inputs[2].emit("data", 1);
    this.inputs[0].emit("data", 2);

    this.inputs[0].emit("change");
    this.inputs[1].emit("change");
    this.inputs[2].emit("change");


    test.equal(this.inputs.length, 3);
    test.equal(this.inputs[0].value, 2);
    test.equal(this.inputs[1].value, 1);
    test.equal(this.inputs[2].value, 1);

    test.done();

  },

  dataFromLateAddition: function(test) {
    test.expect(5);

    var spy = this.sandbox.spy();

    this.inputs.on("data", spy);

    this.clock.tick(1);

    this.inputs[0].emit("data", 1023);
    this.inputs[1].emit("data", 1023);
    this.inputs[2].emit("data", 1023);
    this.clock.tick(1);

    this.inputs.add(new Input(10));

    this.clock.tick(2);

    this.inputs[3].emit("data", 1);
    this.inputs[0].emit("data", 1);
    this.inputs[1].emit("data", 1);
    this.inputs[2].emit("data", 1);
    this.clock.tick(3);
    this.inputs[3].emit("data", 2);

    test.equal(this.inputs.length, 4);
    test.equal(this.inputs[0].value, 1);
    test.equal(this.inputs[1].value, 1);
    test.equal(this.inputs[2].value, 1);
    test.equal(this.inputs[3].value, 2);
    test.done();

  },

  respondToUnknownEvents: function(test) {
    test.expect(2);

    var spy = this.sandbox.spy();

    this.inputs.on("unknown-1", spy);

    this.inputs[0].emit("unknown-1");
    this.inputs[1].emit("unknown-1");
    this.inputs[2].emit("unknown-1");

    test.equal(spy.callCount, 3);

    this.inputs.on("unknown-2", spy);

    this.inputs[0].emit("unknown-2");
    this.inputs[1].emit("unknown-2");
    this.inputs[2].emit("unknown-2");

    test.equal(spy.callCount, 6);
    test.done();
  },
};

exports["Collection.Emitter -- Mixed Emitters"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();

    this.input = new Input(1);
    this.other = new Other(5);
    this.emitters = new Collection.Emitter([
      this.input,
      this.other,
    ]);

    done();
  },

  tearDown: function(done) {
    this.sandbox.restore();
    Collection.purge();
    done();
  },

  data: function(test) {
    // test.expect(6);

    var spy = this.sandbox.spy();

    this.emitters.on("data", spy);

    this.clock.tick(1);
    this.input.emit("data", 1023);
    this.other.emit("data", 1023);
    this.clock.tick(2);

    this.input.emit("data", 1);
    this.other.emit("data", 1);
    this.clock.tick(5);

    this.input.emit("data", 2);

    test.equal(spy.callCount, 1);
    test.equal(spy.lastCall.args[0], this.emitters);

    // console.log(this.emitters);
    test.equal(this.emitters.length, 2);
    test.equal(this.emitters[0].value, 2);
    test.equal(this.emitters[1].value, 1);


    test.done();
  },

  // change: function(test) {
  //   test.expect(4);

  //   this.inputs = new Inputs({
  //     pins: ["A0", "A1", "A2"],
  //     board: this.board,
  //   });

  //   var spy = this.sandbox.spy();

  //   this.inputs.on("change", spy);

  //   this.inputs[0].emit("data", 0);
  //   this.inputs[1].emit("data", 0);
  //   this.inputs[2].emit("data", 0);
  //   this.inputs[0].emit("data", 1023);
  //   this.inputs[1].emit("data", 1023);
  //   this.inputs[2].emit("data", 1023);
  //   this.inputs[0].emit("data", 1);
  //   this.inputs[1].emit("data", 1);
  //   this.inputs[2].emit("data", 1);
  //   this.inputs[0].emit("data", 2);

  //   this.inputs[0].emit("change");
  //   this.inputs[1].emit("change");
  //   this.inputs[2].emit("change");


  //   test.equal(this.inputs.length, 3);
  //   test.equal(this.inputs[0].value, 2);
  //   test.equal(this.inputs[1].value, 1);
  //   test.equal(this.inputs[2].value, 1);

  //   test.done();

  // },

  // dataFromLateAddition: function(test) {
  //   test.expect(5);

  //   var spy = this.sandbox.spy();

  //   this.inputs.on("data", spy);

  //   this.clock.tick(1);

  //   this.inputs[0].emit("data", 1023);
  //   this.inputs[1].emit("data", 1023);
  //   this.inputs[2].emit("data", 1023);
  //   this.clock.tick(1);

  //   this.inputs.add(new Input(10));

  //   this.clock.tick(2);

  //   this.inputs[3].emit("data", 1);
  //   this.inputs[0].emit("data", 1);
  //   this.inputs[1].emit("data", 1);
  //   this.inputs[2].emit("data", 1);
  //   this.clock.tick(3);
  //   this.inputs[3].emit("data", 2);

  //   test.equal(this.inputs.length, 4);
  //   test.equal(this.inputs[0].value, 1);
  //   test.equal(this.inputs[1].value, 1);
  //   test.equal(this.inputs[2].value, 1);
  //   test.equal(this.inputs[3].value, 2);
  //   test.done();

  // },

  // respondToUnknownEvents: function(test) {
  //   test.expect(2);

  //   var spy = this.sandbox.spy();

  //   this.inputs.on("unknown-1", spy);

  //   this.inputs[0].emit("unknown-1");
  //   this.inputs[1].emit("unknown-1");
  //   this.inputs[2].emit("unknown-1");

  //   test.equal(spy.callCount, 3);

  //   this.inputs.on("unknown-2", spy);

  //   this.inputs[0].emit("unknown-2");
  //   this.inputs[1].emit("unknown-2");
  //   this.inputs[2].emit("unknown-2");

  //   test.equal(spy.callCount, 6);
  //   test.done();
  // },

};
