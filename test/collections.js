var Collection = require("../lib/mixins/collection");
var sinon = require("sinon");

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

function Component(num) {
  this.num = num;
}

Component.prototype.a = function() {};
Component.prototype.b = function() {};

function Components(numsOrObjects) {
  if (!(this instanceof Components)) {
    return new Components(numsOrObjects);
  }

  Object.defineProperty(this, "type", {
    value: Component
  });

  Collection.call(this, numsOrObjects);
}

Components.prototype = Object.create(Collection.prototype, {
  constructor: {
    value: Components
  }
});


Object.keys(Component.prototype).forEach(function(method) {
  // Create Components wrappers for each method listed.
  // This will allow us control over all Component instances
  // simultaneously.
  Components.prototype[method] = function() {
    var length = this.length;

    for (var i = 0; i < length; i++) {
      this[i][method].apply(this[i], arguments);
    }
    return this;
  };
});

exports["Collections"] = {
  setUp: function(done) {
    this.components = new Components([0, 1, 2]);

    this.a = sinon.spy(Component.prototype, "a");
    this.b = sinon.spy(Component.prototype, "b");

    done();
  },
  tearDown: function(done) {
    restore(this);
    done();
  },
  nested: function(test) {
    test.expect(9);

    this.a.reset();
    this.b.reset();

    var x = new Component(1);
    var y = new Component(2);
    var z = new Component(3);

    var components = new Components([x, y]);
    var nested = new Components([components, z]);

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

  add: function(test) {
    test.expect(3);

    test.equal(this.components.length, 3);

    this.components.add(null);
    test.equal(this.components.length, 3);

    this.components.add(new Component(5));
    test.equal(this.components.length, 4);

    test.done();
  },

  addNested: function(test) {
    test.expect(2);

    var components = new Components([new Component(10), new Component(11)]);

    test.equal(this.components.length, 3);

    this.components.add(components);

    test.equal(this.components.length, 4);

    test.done();
  },

  each: function(test) {
    test.expect(3);

    this.components.each(function(component) {
      test.equal(component, this);
    });

    test.done();
  }
};
