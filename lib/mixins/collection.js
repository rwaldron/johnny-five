var Emitter = require("events").EventEmitter;
var priv = new Map();

/**
 * Collection
 *
 * Make Collections for output classes
 *
 * @param {[type]} numsOrObjects
 */
function Collection(numsOrObjects) {
  var Type = this.type;
  var initObjects = [];

  this.length = 0;

  if (Array.isArray(numsOrObjects)) {
    initObjects = numsOrObjects;
  } else {
    // Initialize with a Shared Properties object
    if (Array.isArray(numsOrObjects.pins)) {
      var keys = Object.keys(numsOrObjects).filter(function(key) {
        return key !== "pins";
      });
      initObjects = numsOrObjects.pins.map(function(pin) {
        var obj = {
          pin: pin
        };

        return keys.reduce(function(accum, key) {
          accum[key] = numsOrObjects[key];
          return accum;
        }, obj);
      });
    }
  }

  if (initObjects) {
    while (initObjects.length) {
      var numOrObject = initObjects.shift();
      if (!(numOrObject instanceof Type || numOrObject instanceof this.constructor)) {
        numOrObject = new Type(numOrObject);
      }
      this.add(numOrObject);
    }
  }
}

Collection.prototype.add = function() {
  var length = this.length;
  var aLen = arguments.length;

  for (var i = 0; i < aLen; i++) {
    if (arguments[i] instanceof this.type || arguments[i] instanceof this.constructor) {
      this[length++] = arguments[i];
    }
  }

  return (this.length = length);
};

Collection.prototype.each = function(callbackFn) {
  var length = this.length;

  for (var i = 0; i < length; i++) {
    callbackFn.call(this[i], this[i], i);
  }

  return this;
};

Collection.prototype.forEach = function() {
  [].forEach.apply(this, arguments);
};

Collection.prototype.indexOf = function() {
  return [].indexOf.apply(this, arguments);
};

Collection.prototype.includes = function() {
  return [].includes.apply(this, arguments);
};


/**
 * Collection.installMethodForwarding
 *
 * Copy single method to collection class
 *
 * @param  {Object} target Target prototype
 * @param  {Object} source Source prototype
 * @return {Object} target Modified Target prototype
 */
Collection.installMethodForwarding = function(target, source) {
  return Object.keys(source).reduce(function(accum, method) {
    // Create Inputs wrappers for each method listed.
    // This will allow us control over all Input instances
    // simultaneously.
    accum[method] = function() {
      var length = this.length;

      for (var i = 0; i < length; i++) {
        this[i][method].apply(this[i], arguments);
      }
      return this;
    };

    return accum;
  }, target);
};



/**
 * Collection.Emitter
 *
 * Make Collections for input classes
 *
 * @param {[type]} numsOrObjects
 *
 */
Collection.Emitter = function(numsOrObjects) {

  // Create private state ahead of super call
  priv.set(this, {
    inputs: [],
  });

  Collection.call(this, numsOrObjects);

  // If the Collection.Emitter was created
  // with a Shared Properties object, then
  // we should abide by the freq or period
  // properties...
  var period = 5;

  if (!Array.isArray(numsOrObjects) &&
      (typeof numsOrObjects === "object" && numsOrObjects !== null))  {

    period = numsOrObjects.freq || numsOrObjects.period || period;

    // _However_, looking to the future, we
    // need to start thinking about replacing
    // the garbage named _freq_ (the value is
    // actually a period), with real _frequency_
    // in Hz.

    // If provided, convert frequency to period
    if (numsOrObjects.frequency) {
      period = (1 / frequency) * 1000;
    }
  }

  Object.defineProperties(this, {
    period: {
      get: function() {
        return period;
      }
    },
  });

  Collection.Emitter.setup(this);
};

Collection.Emitter.prototype = Object.create(Collection.prototype, {
  constructor: {
    value: Collection.Emitter
  }
});

Object.assign(Collection.Emitter.prototype, Emitter.prototype);

Collection.Emitter.prototype.add = function() {
  if (arguments.length) {
    Collection.prototype.add.apply(this, arguments);
    Collection.Emitter.setup(this);
  }
  return this.length;
};

Collection.Emitter.setup = function(target) {
  var state = priv.get(target);
  var start = Date.now();
  var timing = {
    last: {
      data: start,
      change: start,
    },
  };

  if (!state) {
    throw new Error('Collection.Emitter.setup can only be called with a valid Collection.Emitter');
  }

  target.forEach(function(input) {
    // If the input is not a known input...
    if (!state.inputs.includes(input)) {
      // Make a record of it...
      state.inputs.push(input);

      // And forward its "data" events...
      input.on("data", function() {
        var now = Date.now();

        if (now - timing.last.data >= target.period) {
          timing.last.data = now;

          target.emit("data");
        }
      });

      // And its "change" events
      input.on("change", function() {
        target.emit("change", input);
      });
    }
  });

  return target;
};

if (IS_TEST_MODE) {
  Collection.purge = function() {
    priv.clear();
  };
}

module.exports = Collection;
