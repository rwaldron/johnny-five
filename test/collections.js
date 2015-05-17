var collections = require("../lib/mixins/collections.js");

function Component(num) {
  this.num = num;
}

function Components(numsOrObjects) {
  if (!(this instanceof Components)) {
    return new Components(numsOrObjects);
  }

  Object.defineProperty(this, "type", {
    value: Component
  });

  var k = 0;

  if (numsOrObjects) {
    while (numsOrObjects.length) {
      var numOrObject = numsOrObjects.shift();
      if (!(numOrObject instanceof Component)) {
        numOrObject = new Component(numOrObject);
      }
      this[k] = numOrObject;
      k++;
    }
  }

  this.length = k;
}

Object.assign(Components.prototype, collections);

exports["Collections"] = {
  setUp: function(done) {
    this.components = new Components([0, 1, 2]);
    done();
  },
  tearDown: function(done) {
    done();
  },
  push: function(test) {
    test.expect(3);

    test.equal(this.components.length, 3);

    this.components.push(null);
    test.equal(this.components.length, 3);

    this.components.push(new Component(5));
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
