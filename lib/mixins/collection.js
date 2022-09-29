const EventEmitter = require("events");
const Emitter = require("./emitter");

/**
 * Collection
 *
 * Make Collections for output classes
 *
 * @param {[type]} numsOrObjects
 */
class Collection {
  constructor(numsOrObjects) {
    const Type = this.type;
    let initObjects = [];

    this.length = 0;

    if (Array.isArray(numsOrObjects)) {
      initObjects = numsOrObjects;
    } else {
      // Initialize with a Shared Properties object
      /* istanbul ignore else */
      if (Array.isArray(numsOrObjects.pins)) {
        const keys = Object.keys(numsOrObjects).filter(key => key !== "pins");
        initObjects = numsOrObjects.pins.map(pin => {
          const obj = {};

          if (Array.isArray(pin)) {
            obj.pins = pin;
          } else {
            obj.pin = pin;
          }

          return keys.reduce((accum, key) => {
            accum[key] = numsOrObjects[key];
            return accum;
          }, obj);
        });
      }
    }

    /* istanbul ignore else */
    if (initObjects.length) {
      while (initObjects.length) {
        let numOrObject = initObjects.shift();
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
  slice() {
    return new this.constructor([].slice.apply(this, arguments));
  }
}

Collection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

Collection.prototype.add = function(...args) {
  let length = this.length;

  if (args.length === 1 &&
      args[0] instanceof this.constructor) {
    args = args[0];
  }

  for (let i = 0; i < args.length; i++) {
    // When a Type exists, respect it!
    if (this.type) {
      if (args[i] instanceof this.type ||
          args[i] instanceof this.constructor) {
        this[length++] = args[i];
      }
    } else {
      // Otherwise allow user to directly instantiate
      // Collection or Collection.Emitter to create
      // a mixed collection
      this[length++] = args[i];
    }
  }

  return (this.length = length);
};

Collection.prototype.each = function(callback) {
  let length = this.length;

  for (let i = 0; i < length; i++) {
    callback.call(this[i], this[i], i);
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
 * @param  {Object} options Options for how to define dispatch
 * @return {Object} target Modified Target prototype
 */
Collection.installMethodForwarding = (target, source, options = {}) => {
  const {skip = []} = options;
  const nevercopy = "apply|arguments|bind|call|caller|constructor|domain|length|name|prototype|toString".split("|");

  return Object.getOwnPropertyNames(source).reduce((accum, method) => {
    if (skip.includes(method) || nevercopy.includes(method)) {
      return accum;
    }
    // Create Inputs wrappers for each method listed.
    // This will allow us control over all Input instances
    // simultaneously.
    accum[method] = function(...args) {
      const length = this.length;

      for (let i = 0; i < length; i++) {
        this[i][method](...args);
      }
      return this;
    };

    return accum;
  }, target);
};

const noop = () => {};

Collection.installCallbackReconciliation = (target, methods) => {
  // Methods with callbacks need to have the callback called
  // as a result of all entries reaching completion, not
  // calling the callback once for each entry completion.
  // Uses an array to match pattern in Led, and may be more
  // in future.
  methods.forEach(method => {
    target[method] = function(duration, callback) {
      const length = this.length;
      const signals = [];

      if (typeof duration === "function") {
        callback = duration;
        duration = 1000;
      }

      if (typeof callback !== "function") {
        callback = noop;
      }

      for (let i = 0; i < length; i++) {
        signals.push(
          /* jshint ignore:start */
          new Promise(resolve => this[i][method](duration, () => resolve()))
          /* jshint ignore:end */
        );
      }

      Promise.all(signals).then(callback);

      return this;
    };
  });
};



/**
 * Collection.Emitter
 *
 * Make Collections for input classes
 *
 * @param {[type]} numsOrObjects
 *
 */

Collection.Emitter = class extends Collection {
  constructor(numsOrObjects) {
    super(numsOrObjects);

    // If the Collection.Emitter was created
    // with a Shared Properties object, then
    // we should abide by the freq or period
    // properties...
    let interval = null;
    let period = 5;

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
        get() {
          return period;
        },
        set(value) {
          if (period !== value) {
            period = value;
          }

          if (interval) {
            clearInterval(interval);
          }

          interval = setInterval(() => {
            this.emit("data", this);
          }, period);
        }
      },
    });

    this.period = period;

    this.on("newListener", event => {
      if (event === "change" || event === "data") {
        return;
      }

      this.forEach(input => {
        input.on(event, data => this.emit(event, input, data));
      });
    });
  }

  add(...inputs) {
    /* istanbul ignore else */
    if (inputs.length) {
      super.add(...inputs);

      inputs.forEach(input => {
        if (input) {
          input.on("change", () => this.emit("change", input));
        }
      });
    }
    return this.length;
  }

};

Object.assign(
  Collection.Emitter.prototype,
  EventEmitter.prototype,
  Emitter.prototype
);

Collection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

module.exports = Collection;
