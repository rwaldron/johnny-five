var IS_TEST_MODE = !!process.env.IS_TEST_MODE;
var Board = require("../lib/board.js");
var Descriptor = require("descriptor");
var __ = require("../lib/fn.js");
var Emitter = require("events").EventEmitter;
var util = require("util");

var priv = new Map();
var modes = {
  INPUT: 0x00,
  OUTPUT: 0x01,
  ANALOG: 0x02,
  PWM: 0x03,
  SERVO: 0x04
};

/**
 * Pin
 * @constructor
 *
 * @description Direct Pin access objects
 *
 * @param {Object} opts Options: pin, freq, range
 */

function Pin(opts) {
  if (!(this instanceof Pin)) {
    return new Pin(opts);
  }

  var pinValue = typeof opts === "object" ? (opts.addr || opts.pin || 0) : opts;
  var isAnalogInput = Pin.isAnalog(opts);
  var isDTOA = false;

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  opts.addr = opts.addr || opts.pin;

  if (this.io.analogPins.includes(pinValue)) {
    isAnalogInput = false;
    isDTOA = true;
  }

  var isPin = typeof opts !== "object";
  var addr = isDTOA ? pinValue : (isPin ? opts : opts.addr);
  var type = opts.type || (isAnalogInput ? "analog" : "digital");
  var value = 0;

  // Create a private side table
  var state = {
    mode: null,
    last: null,
    value: 0
  };

  priv.set(this, state);

  // Create read-only "addr(address)" property
  Object.defineProperties(this, {
    type: new Descriptor(type),
    addr: new Descriptor(addr, "!writable"),
    value: {
      get: function() {
        return state.value;
      }
    },
    mode: {
      set: function(mode) {
        var state = priv.get(this);
        // set mode
        // TODO: if setting to PWM, check if this pin is capable of PWM
        // log error if not capable
        if (state.mode !== mode) {
          state.mode = mode;
          this.io.pinMode(this.addr, mode);
        }
      },
      get: function() {
        return priv.get(this).mode;
      }
    }
  });

  this.mode = this.as || opts.mode || (isAnalogInput ? 0x00 : 0x01);

  var highLow = function(state) {
    return function(data) {
      var privs, isNot, emit;

      privs = priv.get(this);

      // Update the value closure
      privs.value = data;

      isNot = state ? "low" : "high";
      emit = state ? "high" : "low";

      if (privs.mode === modes.INPUT) {
        if (privs.last === null) {
          privs.last = isNot;
        }
        if (data === state && privs.last === isNot) {
          privs.last = emit;
          this.emit(emit);
        }
      }

      // Emit a firehose "data" event
      this.emit("data");

    }.bind(this);
  }.bind(this);

  // Debounced for noise reduction: more accurately
  // detect HIGH state.
  this.io[type + "Read"](
    this.addr, __.debounce(highLow(1), 50)
  );

  // No debounce to read the constant stream
  // (very noisy, only care about 0)
  this.io[type + "Read"](
    this.addr, highLow(0)
  );
}

util.inherits(Pin, Emitter);

/**
 * Pin.@@MODE
 *
 * Read-only constants
 * Pin.INPUT   = 0x00
 * Pin.OUTPUT  = 0x01
 * Pin.ANALOG  = 0x02
 * Pin.PWM     = 0x03
 * Pin.SERVO   = 0x04
 *
 */
Object.keys(modes).forEach(function(mode) {
  Object.defineProperty(Pin, mode, {
    value: modes[mode]
  });
});


Pin.isAnalog = function(opts) {
  if (typeof opts === "string" && Pin.isPrefixed(opts, ["I", "A"])) {
    return true;
  }

  if (typeof opts === "object") {
    return Pin.isAnalog(
      typeof opts.addr !== "undefined" ? opts.addr : opts.pin
    );
  }
};

Pin.isPrefixed = function(value, prefixes) {
  value = value[0];

  return prefixes.reduce(function(resolution, prefix) {
    if (!resolution) {
      return prefix === value;
    }
    return resolution;
  }, false);
};

Pin.write = function(pin, val) {
  var state = priv.get(pin);

  state.value = val;

  // Set the correct mode (OUTPUT)
  // This will only set if it needs to be set, otherwise a no-op
  pin.mode = modes.OUTPUT;

  // Create the correct type of write command
  pin.io[pin.type + "Write"](pin.addr, val);

  pin.emit("write", null, val);
};

Pin.read = function(pin, callback) {
  // Set the correct mode (INPUT)
  // This will only set if it needs to be set, otherwise a no-op
  pin.mode = modes.INPUT;

  pin.io[pin.type + "Read"](pin.addr, function() {
    callback.apply(pin, arguments);
  });
};


// Pin.prototype.isDigital = function() {
//   return this.addr > 1;
// };

// Pin.prototype.isAnalog = function() {
//   return this.board > 1;
// };

// Pin.prototype.isPWM = function() {
// };

// Pin.prototype.isServo = function() {
// };

// Pin.prototype.isI2C = function() {
// };

// Pin.prototype.isSerial = function() {
// };

// Pin.prototype.isInterrupt = function() {
// };

// Pin.prototype.isVersion = function() {
// };


Pin.prototype.query = function(callback) {
  var index = this.addr;

  if (this.type === "analog") {
    index = this.io.analogPins[this.addr];
  }

  function handler() {
    callback(this.io.pins[index]);
  }

  this.io.queryPinState(index, handler.bind(this));

  return this;
};

/**
 * high  Write high/1 to the pin
 * @return {Pin}
 */

Pin.prototype.high = function() {
  var value = this.type === "analog" ? 255 : 1;
  Pin.write(this, value);
  this.emit("high");
  return this;
};

/**
 * low  Write low/0 to the pin
 * @return {Pin}
 */

Pin.prototype.low = function() {
  Pin.write(this, 0);
  this.emit("low");
  return this;
};

/**
 * read  Read from the pin, value is passed to callback continuation
 * @return {Pin}
 */

/**
 * write  Write to a pin
 * @return {Pin}
 */
["read", "write"].forEach(function(state) {
  Pin.prototype[state] = function(valOrCallback) {
    Pin[state](this, valOrCallback);
    return this;
  };
});


/**
 * Pin.Array
 * @constructor
 *
 * Create an Array-like object instance of Pins
 *
 * @param {Array} Pins An array of pin objects or pin numbers.
 */

Pin.Array = function(numsOrObjects) {
  if (!(this instanceof Pin.Array)) {
    return new Pin.Array(numsOrObjects);
  }

  var items = [];

  if (numsOrObjects) {
    while (numsOrObjects.length) {
      var numOrObject = numsOrObjects.shift();
      if (typeof numOrObject === "number") {
        numOrObject = new Pin(numOrObject);
      }
      items.push(numOrObject);
    }
  } else {
    items = items.concat(Array.from(priv.keys()));
  }

  this.length = items.length;

  items.forEach(function(item, index) {
    this[index] = item;
  }, this);
};

/**
 * each Execute callbackFn for each active led instance in an Pin.Array
 * @param  {Function} callbackFn
 * @return {Pin.Array}
 */
Pin.Array.prototype.each = function(callbackFn) {
  var length = this.length;

  for (var i = 0; i < length; i++) {
    callbackFn.call(this[i], this[i], i);
  }

  return this;
};

[

  "high", "low", "write"

].forEach(function(method) {
  Pin.Array.prototype[method] = function() {
    var length = this.length;

    for (var i = 0; i < length; i++) {
      this[i][method].apply(this[i], arguments);
    }
    return this;
  };
});

if (IS_TEST_MODE) {
  Pin.purge = function() {
    priv.clear();
  };
}


module.exports = Pin;
