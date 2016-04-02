var IS_TEST_MODE = !!process.env.IS_TEST_MODE;
var Emitter = require("events").EventEmitter;
var Board = require("../lib/board");
var Collection = require("../lib/mixins/collection");
var sinon = require("sinon");

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

Outputs.prototype = Object.create(Collection.prototype, {
  constructor: {
    value: Outputs
  }
});

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

  var cycle = 0;

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

Inputs.prototype = Object.create(Collection.Emitter.prototype, {
  constructor: {
    value: Inputs
  }
});


Collection.installMethodForwarding(
  Inputs.prototype, Input.prototype
);

// Object.keys(Input.prototype).forEach(function(method) {
//   // Create Inputs wrappers for each method listed.
//   // This will allow us control over all Input instances
//   // simultaneously.
//   Inputs.prototype[method] = function() {
//     var length = this.length;

//     for (var i = 0; i < length; i++) {
//       this[i][method].apply(this[i], arguments);
//     }
//     return this;
//   };
// });


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

  forEach: function(test) {
    test.expect(6);

    var context = {};

    this.outputs.forEach(function(output) {
      test.notEqual(output, this);
      test.equal(context, this);
    }, context);

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

  data: function(test) {
    test.expect(4);

    this.inputs.on("data", function() {
      test.equal(this.length, 3);
      test.equal(this[0].value, 2);
      test.equal(this[1].value, 1);
      test.equal(this[2].value, 1);
      test.done();
    });

    this.clock.tick(1);
    this.inputs[0].emit("data", 1023);
    this.inputs[1].emit("data", 1023);
    this.inputs[2].emit("data", 1023);
    this.clock.tick(2);
    this.inputs[0].emit("data", 1);
    this.inputs[1].emit("data", 1);
    this.inputs[2].emit("data", 1);
    this.clock.tick(2);
    this.inputs[0].emit("data", 2);
  },

  change: function(test) {
    test.expect(4);

    this.inputs[0].id = "x";
    this.inputs[1].id = "y";
    this.inputs[2].id = "z";

    var expecting = {x: false, y: false, z: false};

    this.inputs.on("change", function(input) {
      expecting[input.id] = true;

      test.ok(this.inputs.includes(input));

      var isDone = Object.keys(expecting).every(function(key) {
        return expecting[key];
      });

      if (isDone) {
        test.done();
      }
    }.bind(this));

    this.inputs[0].emit("change");

    this.inputs[1].emit("change");
    this.inputs[1].emit("change");

    this.inputs[2].emit("change");
    this.inputs[2].emit("change");

    this.inputs[0].emit("change");
    this.inputs[0].emit("change");

    this.inputs[2].emit("change");
    this.inputs[1].emit("change");
  },

  dataFromLateAddition: function(test) {
    test.expect(5);

    this.inputs.on("data", function() {
      test.equal(this.length, 4);
      test.equal(this[0].value, 1);
      test.equal(this[1].value, 1);
      test.equal(this[2].value, 1);
      test.equal(this[3].value, 2);
      test.done();
    });

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
  },
};
