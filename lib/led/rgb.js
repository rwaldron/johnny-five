var Led = require("./led"),
  priv = new Map();

/**
 * LedRGB
 *
 *
 * @param  {[type]} opts [description]
 * @return {[type]}      [description]
 * @alias Led.RGB
 */
var RGB = function(opts) {
  if (!(this instanceof RGB)) {
    return new RGB(opts);
  }

  var state;

  if (Array.isArray(opts)) {
    // RGB([Byte, Byte, Byte]) shorthand
    // Convert to opts.pins object definition
    opts = {
      pins: {
        red: opts[0],
        green: opts[1],
        blue: opts[2]
      }
    };
  } else {
    // If opts.pins is an array, convert to object
    if (Array.isArray(opts.pins)) {
      opts.pins = {
        red: opts.pins[0],
        green: opts.pins[1],
        blue: opts.pins[2]
      };
    }
  }

  // Initialize each Led instance
  RGB.colors.forEach(function(color) {
    this[color] = new Led({
      pin: opts.pins[color],
      board: opts.board,
      address: opts.address,
      controller: opts.controller,
      isAnode: opts.isAnode
    });
  }.bind(this));

  this.interval = null;

  state = {
    red: 255,
    green: 255,
    blue: 255,
    isAnode: opts.isAnode || false,
    isRunning: false
  };

  priv.set(this, state);

  Object.defineProperties(this, {
    isOn: {
      get: function() {
        return RGB.colors.some(function(color) {
          return this[color].isOn;
        }, this);
      }
    },
    isRunning: {
      get: function() {
        return state.isRunning;
      }
    },
    isAnode: {
      get: function () {
        return state.isAnode;
      }
    },
    values: {
      get: function() {
        return RGB.colors.reduce(function(current, color) {
          return (current[color] = this[color].value, current);
        }.bind(this), {});
      }
    }
  });
};

RGB.colors = ["red", "green", "blue"];

/**
* color
*
* @param  {String} color Hexadecimal color string
* @param  {Array} color Array of color values
* @param  {Object} color object {red, green, blue}
*
* @return {RGB}
*/
RGB.prototype.color = function(red, green, blue) {
  var state = priv.get(this);
  var input, update;

  update = {
    red: null,
    green: null,
    blue: null
  };

  if (arguments.length === 0) {
    // Return a "copy" of the state values,
    // not a reference to the state object itself.
    return Led.RGB.colors.reduce(function(current, color) {
      return (current[color] = state[color], current);
    }, {});
  }

  if (arguments.length === 1) {
    input = red;

    if (input === null || input === undefined) {
      throw new Error("Led.RGB.color: invalid color (" + input + ")");
    }

    if (typeof input === "object") {

      if (Array.isArray(input)) {
        // color([Byte, Byte, Byte])
        update.red = input[0];
        update.green = input[1];
        update.blue = input[2];
      } else {
        // colors({
        //   red: Byte,
        //   green: Byte,
        //   blue: Byte
        // });
        update.red = input.red;
        update.green = input.green;
        update.blue = input.blue;
      }
    } else if (typeof input === "string") {
      // color("#ffffff")
      if (input.length === 7 && input[0] === "#") {
        input = input.slice(1);
      }

      if (!input.match(/^[0-9A-Fa-f]{6}$/)) {
        throw new Error("Led.RGB.color: invalid color (#" + input + ")");
      }

      // color("ffffff")
      update.red = parseInt(input.slice(0, 2), 16);
      update.green = parseInt(input.slice(2, 4), 16);
      update.blue = parseInt(input.slice(4, 6), 16);
    }
  } else {
    // color(Byte, Byte, Byte)
    update.red = red;
    update.green = green;
    update.blue = blue;
  }

  Led.RGB.colors.forEach(function(color) {
    var value = update[color];

    // == purposely checking null and undefined
    if (value == null) {
      throw new Error("Led.RGB.color: invalid color ([" + [update.red, update.green, update.blue].join(",") + "])");
    }

    // constrain to [0,255]
    value = Math.min(255, Math.max(0, value));

    state[color] = value;
    this[color].brightness(value);
  }, this);

  return this;
};

RGB.prototype.on = function() {
  var state = priv.get(this);

  // If it's not already on, we turn
  // them on to previous color value
  if (!this.isOn) {
    RGB.colors.forEach(function(color) {
      this[color].brightness(state[color]);
    }, this);
  }

  return this;
};

RGB.prototype.off = function() {
  RGB.colors.forEach(function(color) {
    this[color].off();
  }, this);

  return this;
};

/**
 * strobe
 * @param  {Number} rate Time in ms to strobe/blink
 * @return {Led}
 */
RGB.prototype.strobe = function(rate) {
  var state = priv.get(this);

  // Avoid traffic jams
  if (this.interval) {
    clearInterval(this.interval);
  }

  state.isRunning = true;

  this.interval = setInterval(function() {
    this.toggle();
  }.bind(this), rate || 100);

  return this;
};

RGB.prototype.blink = RGB.prototype.strobe;

RGB.prototype.toggle = function() {
  return this[this.isOn ? "off" : "on"]();
};

RGB.prototype.stop = function() {
  var state = priv.get(this);

  clearInterval(this.interval);

  state.isRunning = false;

  return this;
};

module.exports = RGB;
