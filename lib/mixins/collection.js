var IS_TEST_MODE = !!process.env.IS_TEST_MODE;
var Emitter = require("events").EventEmitter;
var util = require("util");
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
    /* istanbul ignore else */
    if (Array.isArray(numsOrObjects.pins)) {
      var keys = Object.keys(numsOrObjects).filter(function(key) {
        return key !== "pins";
      });
      initObjects = numsOrObjects.pins.map(function(pin) {
        var obj = {};

        if (Array.isArray(pin)) {
          obj.pins = pin;
        } else {
          obj.pin = pin;
        }

        return keys.reduce(function(accum, key) {
          accum[key] = numsOrObjects[key];
          return accum;
        }, obj);
      });
    }
  }

  /* istanbul ignore else */
  if (initObjects.length) {
    while (initObjects.length) {
      var numOrObject = initObjects.shift();

      // When a Type exists, respect it!
      if (typeof Type === "function") {
        if (!(numOrObject instanceof Type || numOrObject instanceof this.constructor)) {
          numOrObject = new Type(numOrObject);
        }
      }

      this.add(numOrObject);
    }
  }
}

Collection.prototype.add = function() {
  var length = this.length;
  var aLen = arguments.length;

  for (var i = 0; i < aLen; i++) {
    // When a Type exists, respect it!
    if (this.type) {
      if (arguments[i] instanceof this.type ||
          arguments[i] instanceof this.constructor) {
        this[length++] = arguments[i];
      }
    } else {
      // Otherwise allow user to directly instantiate
      // Collection or Collection.Emitter to create
      // a mixed collection
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

Collection.prototype.includes = function() {
  return [].includes.apply(this, arguments);
};

Collection.prototype.indexOf = function() {
  return [].indexOf.apply(this, arguments);
};

Collection.prototype.map = function() {
  return [].map.apply(this, arguments);
};

Collection.prototype.slice = function() {
  return new this.constructor([].slice.apply(this, arguments));
};

Collection.prototype.byId = function(id) {
  return [].find.call(this, function(entry) {
    return entry.id !== undefined && entry.id === id;
  });
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
    timing: {
      last: Date.now()
    }
  });

  Collection.call(this, numsOrObjects);

  // If the Collection.Emitter was created
  // with a Shared Properties object, then
  // we should abide by the freq or period
  // properties...
  var interval = null;
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
    /* istanbul ignore else */
    if (numsOrObjects.frequency) {
      period = (1 / numsOrObjects.frequency) * 1000;
    }
  }

  Object.defineProperties(this, {
    period: {
      get: function() {
        return period;
      },
      set: function(value) {
        if (period !== value) {
          period = value;
        }

        if (interval) {
          clearInterval(interval);
        }

        interval = setInterval(function() {
          this.emit("data", this);
        }.bind(this), period);
      }
    },
  });

  this.period = period;

  this.on("newListener", function(event) {
    if (event === "change" || event === "data") {
      return;
    }

    this.forEach(function(input) {
      input.on(event, function(data) {
        this.emit(event, input, data);
      }.bind(this));
    }, this);
  });
};

util.inherits(Collection.Emitter, Collection);

Object.assign(Collection.Emitter.prototype, Emitter.prototype);

Collection.Emitter.prototype.add = function() {
  var inputs = Array.from(arguments);

  /* istanbul ignore else */
  if (inputs.length) {
    Collection.prototype.add.apply(this, inputs);

    inputs.forEach(function(input) {
      if (input) {
        input.on("change", function() {
          this.emit("change", input);
        }.bind(this));
      }
    }, this);
  }
  return this.length;
  // return (this.length = length);
};

/* istanbul ignore else */
if (IS_TEST_MODE) {
  Collection.purge = function() {
    priv.clear();
  };
}

module.exports = Collection;
