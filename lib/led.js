var Board = require("../lib/board.js");
var Pins = Board.Pins;

var priv = new Map(),
  LEDS = [];

/**
 * Led
 * @constructor
 *
 * five.Led(pin);
 *
 * five.Led({
 *   pin: number
 *  });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Led(opts) {
  var pinValue;
  var defaultLed;
  var state;
  var isArduino = true;

  if (!(this instanceof Led)) {
    return new Led(opts);
  }

  pinValue = typeof opts === "object" ? opts.pin : opts;

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  isArduino = Pins.isFirmata(this);

  if (isArduino && typeof pinValue === "string" && pinValue[0] === "A") {
    pinValue = this.io.analogPins[+pinValue.slice(1)];
  }

  defaultLed = this.io.defaultLed || 13;
  pinValue = +pinValue;

  // LED instance properties
  this.value = 0;
  this.interval = null;

  // TODO: use pin capability checks for LED value writing.

  // Create a "state" entry for privately
  // storing the state of the led
  LEDS.push(this);

  state = {
    isOn: false,
    isRunning: false,
    value: null,
    direction: 1,
    mode: null
  };

  priv.set(this, state);

  Object.defineProperties(this, {
    value: {
      get: function() {
        return state.value;
      }
    },
    isOn: {
      get: function() {
        return !!state.value;
      }
    },
    isRunning: {
      get: function() {
        return state.isRunning;
      }
    },
    mode: {
      set: function(mode) {
        // set mode
        // TODO: if setting to PWM, check if this pin is capable of PWM
        // log error if not capable
        if (state.mode !== mode) {
          state.mode = mode;
          this.io.pinMode(this.pin, mode);
        }
      },
      get: function() {
        return state.mode;
      }
    }
  });


  if (this.io.analogPins.indexOf(pinValue) !== -1) {
    this.pin = isArduino ? pinValue : this.pin;
    this.mode = this.io.MODES.OUTPUT;
  } else {
    this.pin = typeof opts.pin === "undefined" ? defaultLed : opts.pin;
    this.mode = this.io.MODES[
      opts.type && opts.type.toUpperCase() ||
      (this.board.pins.isPwm(this.pin) ? "PWM" : "OUTPUT")
    ];
  }
}

/**
 * on Turn the led on
 * @return {Led}
 */
Led.prototype.on = function() {
  var state = priv.get(this);

  if (state.mode === this.io.MODES.OUTPUT) {
    this.io.digitalWrite(this.pin, this.io.HIGH);
    state.value = this.io.HIGH;
  }

  if (state.mode === this.io.MODES.PWM) {
    // If there is no active interval, and state.value is null
    // then assume we need to simply turn this all the way on.
    if (!this.interval && state.value === null) {
      state.value = 255;
    }

    if (state.value === 0) {
      state.value = 255;
    }

    this.io.analogWrite(this.pin, state.value);
  }

  return this;
};

/**
 * off  Turn the led off
 * @return {Led}
 */
Led.prototype.off = function() {
  var state = priv.get(this);
  var value = 0;

  if (state.mode === this.io.MODES.OUTPUT) {
    this.io.digitalWrite(this.pin, value);
  }

  if (state.mode === this.io.MODES.PWM) {
    this.io.analogWrite(this.pin, value);
  }

  state.value = value;

  return this;
};

/**
 * toggle Toggle the on/off state of an led
 * @return {Led}
 */
Led.prototype.toggle = function() {
  return this[this.isOn ? "off" : "on"]();
};

/**
 * brightness
 * @param  {Number} value analog brightness value 0-255
 * @return {Led}
 */
Led.prototype.brightness = function(value) {
  var state = priv.get(this);

  // If pin is not a PWM pin, emit an error
  if (!this.board.pins.isPwm(this.pin)) {
    Board.Pins.Error({
      pin: this.pin,
      type: "PWM",
      via: "Led",
    });
  }

  // Reset mode to PWM
  this.mode = this.io.MODES.PWM;

  this.io.analogWrite(this.pin, value);

  state.value = value;

  return this;
};

/**
 * animate Animate the brightness of an led
 * @param {Object} opts {
 *                        step: function to call on each step
 *                        delta: function to calculate each change
 *                        complete: function to call on completion,
 *                        duration: ms duration of animation
 *                        delay: ms interval delay
 *                      }
 * @return {Led}
 */

Led.prototype.animate = function(opts) {
  var state = priv.get(this);
  var start = Date.now();

  if (!this.board.pins.isPwm(this.pin)) {
    Board.Pins.Error({
      pin: this.pin,
      type: "PWM",
      via: "Led",
    });
  }

  // Reset mode to PWM
  this.mode = this.io.MODES.PWM;

  // Avoid traffic jams
  if (this.interval) {
    clearInterval(this.interval);
  }

  if (!opts.delta) {
    opts.delta = function(val) {
      return val;
    };
  }
  // TODO: Give opts.step a default

  state.isRunning = true;

  this.interval = setInterval(function() {
    var lapsed = Date.now() - start;
    var progress = lapsed / opts.duration;

    if (progress > 1) {
      progress = 1;
    }

    var delta = opts.delta(progress);

    opts.step(delta);

    if (progress === 1) {
      opts.complete();
    }
  }, opts.delay || 10);

  return this;
};

/**
 * pulse Fade the Led in and out in a loop with specified time
 * @param  {number} rate Time in ms that a fade in/out will elapse
 * @return {Led}
 */

Led.prototype.pulse = function(time, callback) {
  var state = priv.get(this);
  var max = 0xff;
  var target = state.value !== 0 ?
    (state.value === max ? 0 : max) : max;
  var direction = target === max ? 1 : -1;
  var update = state.value <= target ? target : (state.value - target);

  if (typeof time === "function") {
    callback = time;
    time = 1000;
  }

  var step = function(delta) {
    var value = (update * delta);

    if (direction === -1) {
      value = value ^ 0xff;
    }

    this.io.analogWrite(this.pin, value);

    state.value = value;
    state.direction = direction;
  }.bind(this);

  var complete = function() {
    this.pulse(time);
    if (typeof callback === "function") {
      callback();
    }
  }.bind(this);

  return this.animate({
    duration: time || 1000,
    complete: complete,
    step: step
  });
};

/**
 * fade Fade an led in and out
 * @param  {Number} val  Analog brightness value 0-255
 * @param  {Number} time Time in ms that a fade in/out will elapse
 * @return {Led}
 */

Led.prototype.fade = function(val, time, callback) {
  var state = priv.get(this);
  var direction = state.value <= val ? 1 : -1;
  var update = state.value <= val ? val : (state.value - val);

  if (typeof time === "function") {
    callback = time;
    time = 1000;
  }

  var step = function(delta) {
    var value = (update * delta);

    if (direction === -1) {
      value = value ^ 0xff;
    }

    this.io.analogWrite(this.pin, value);

    state.value = value;
    state.direction = direction;
  }.bind(this);

  var complete = function() {
    this.stop();
    if (typeof callback === "function") {
      callback();
    }
  }.bind(this);

  return this.animate({
    duration: time || 1000,
    complete: complete,
    step: step
  });
};

Led.prototype.fadeIn = function(time, callback) {
  return this.fade(255, time || 1000, callback);
};

Led.prototype.fadeOut = function(time, callback) {
  return this.fade(0, time || 1000, callback);
};

/**
 * strobe
 * @param  {Number} rate Time in ms to strobe/blink
 * @return {Led}
 */
Led.prototype.strobe = function(rate) {
  var isHigh = false;
  var state = priv.get(this);

  // Avoid traffic jams
  if (this.interval) {
    clearInterval(this.interval);
  }

  // Reset mode to OUTPUT
  this.mode = this.io.MODES.OUTPUT;

  state.isRunning = true;

  this.interval = setInterval(function() {
    // If state.isRunning is true, then change
    // the visible state of the LED
    if (state.isRunning) {
      if (this.isOn) {
        this.off();
      } else {
        this.on();
      }
    }
  }.bind(this), rate || 100);

  return this;
};

Led.prototype.blink = Led.prototype.strobe;

/**
 * stop Stop the led from strobing, pulsing or fading
 * @return {Led}
 */
Led.prototype.stop = function() {
  var state = priv.get(this);

  clearInterval(this.interval);

  state.isRunning = false;

  return this;
};



// TODO:
// Led.prototype.color = function() {
//   ...
//   return this;
// };


/**
 * Led.Array()
 * new Led.Array()
 *
 * Create an Array-like object instance of LEDS
 *
 * @return {Led.Array}
 */
Led.Array = function(pins) {
  if (!(this instanceof Led.Array)) {
    return new Led.Array(pins);
  }

  var leds = [];

  if (pins) {
    while (pins.length) {
      leds.push(
        new Led(pins.shift())
      );
    }
  } else {
    leds = LEDS.slice();
  }

  this.length = 0;

  leds.forEach(function(led, index) {
    this[index] = led;

    this.length++;
  }, this);
};



/**
 * each Execute callbackFn for each active led instance in an Led.Array
 * @param  {Function} callbackFn
 * @return {Led.Array}
 */
Led.Array.prototype.each = function(callbackFn) {
  var led, i, length;

  length = this.length;

  for (i = 0; i < length; i++) {
    led = this[i];
    callbackFn.call(led, led, i);
  }

  return this;
};

[

  "on", "off", "toggle", "brightness",
  "fade", "fadeIn", "fadeOut",
  "pulse", "strobe",
  "stop"

].forEach(function(method) {
  // Create Led.Array wrappers for each method listed.
  // This will allow us control over all Led instances
  // simultaneously.
  Led.Array.prototype[method] = function() {
    var args = [].slice.call(arguments);

    this.each(function(led) {
      Led.prototype[method].apply(led, args);
    });
    return this;
  };
});

Led.Array.prototype.blink = Led.Array.prototype.strobe;

/**
 * Led.RGB
 *
 *
 * @param  {[type]} opts [description]
 * @return {[type]}      [description]
 */
Led.RGB = function(opts) {
  if (!(this instanceof Led.RGB)) {
    return new Led.RGB(opts);
  }

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  var color, colors, k;

  colors = Led.RGB.colors.slice();
  k = -1;

  // This will normalize an array of pins in [ r, g, b ]
  // order to an object that's shaped like:
  // {
  //   red: r,
  //   green: g,
  //   blue: b
  // }
  if (Array.isArray(opts.pins)) {
    opts.pins = colors.reduce(function(pins, pin, i, list) {
      return (pins[list[i]] = opts.pins[i], pins);
    }, {});
  }

  // Initialize each Led instance
  while (colors.length) {
    color = colors.shift();
    this[color] = new Led({
      pin: opts.pins[color],
      board: opts.board
    });
  }

  var isAnode = opts.isAnode || false;

  // Hack: If isAnode invert the analog signals
  if (isAnode) {
    var _analogWrite = this.io.analogWrite;
    this.io.analogWrite = function(pin, value) {
      value = 255 - Board.constrain(value, 0, 255);
      _analogWrite.call(this, pin, value);
    }.bind(this.io);
  }

  priv.set(this, {
    red: 0,
    green: 0,
    blue: 0
  });
};

Led.RGB.colors = ["red", "green", "blue"];

/**
 * color
 *
 * @param  {String} color Hexadecimal color string
 * @param  {Array} color Array of color values
 *
 * @return {Led.RGB}
 */
Led.RGB.prototype.color = function(value) {
  var state, update;

  state = priv.get(this);

  update = {
    red: 0,
    green: 0,
    blue: 0
  };

  if (!value) {
    // Return a "copy" of the state values,
    // not a reference to the state object itself.
    return Led.RGB.colors.reduce(function(current, color) {
      return (current[color] = state[color], current);
    }, {});
  }

  // Allows hex colors with leading #:
  // eg. #ff00ff
  if (value[0] === "#") {
    value = value.slice(1);
  }

  if (typeof value === "string") {
    update.red = parseInt(value.slice(0, 2), 16);
    update.green = parseInt(value.slice(2, 4), 16);
    update.blue = parseInt(value.slice(4, 6), 16);
  } else {
    update.red = value[0];
    update.green = value[1];
    update.blue = value[2];
  }

  Led.RGB.colors.forEach(function(color) {
    state[color] = update[color];
    this[color].brightness(update[color]);
  }, this);

  return this;
};

Led.RGB.prototype.on = function() {
  var state = priv.get(this);

  Led.RGB.colors.forEach(function(color) {
    this[color].on();
    this[color].brightness(
      state[color] !== 0 ? state[color] : 255
    );
  }, this);
};

Led.RGB.prototype.off = function() {
  Led.RGB.colors.forEach(function(color) {
    this[color].off();
  }, this);
};



[
  "toggle", "brightness",
  "fade", "fadeIn", "fadeOut",
  "pulse", "strobe", "stop"

].forEach(function(method) {
  // Create Led.RGB wrappers for each method listed.
  // This will allow us control over all Led instances
  // simultaneously.
  Led.RGB.prototype[method] = function() {
    var args = [].slice.call(arguments);

    Led.RGB.colors.forEach(function(color) {
      this[color][method].apply(this[color], args);
    }, this);

    return this;
  };
});

Led.RGB.prototype.blink = Led.RGB.prototype.strobe;

module.exports = Led;
