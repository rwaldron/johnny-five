/*
  About the original version of ledcontrol.js:

  This is a port by Rebecca Murphey of the LedControl library.
  The license of the original library is as follows:

  LedControl.cpp - A library for controling Leds with a MAX7219/MAX7221
  Copyright (c) 2007 Eberhard Fahle

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation
  files (the "Software"), to deal in the Software without
  restriction, including without limitation the rights to use,
  copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following
  conditions:

  This permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.

 */

var Board = require("../lib/board.js");

// Led instance private data
var priv = new Map();

function LedControl(opts) {

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  this.pins = {
    data: opts.pins.data,
    clock: opts.pins.clock,
    cs: opts.pins.cs || opts.pins.latch
  };

  /*
    Here's an example of multiple devices:
    http://tronixstuff.com/2013/10/11/tutorial-arduino-max7219-led-display-driver-ic/
   */
  var devices = opts.devices || 1;

  // NOTE: Currently unused, these will form
  // the basis for the `setup` constructor option
  var setup = Object.assign({}, LedControl.DEFAULTS, opts.setup || {});
  var keys = Object.keys(setup);

  // TODO: Store this in priv Map.
  this.status = [];

  for (var i = 0; i < 64; i++) {
    this.status[i] = 0x00;
  }

  ["data", "clock", "cs"].forEach(function(pin) {
    this.io.pinMode(this.pins[pin], this.io.MODES.OUTPUT);
  }, this);

  var state = {
    devices: devices,
    digits: opts.digits || 8,
    isMatrix: !!opts.isMatrix
  };

  Object.defineProperties(this, {
    devices: {
      get: function() {
        return state.devices;
      }
    },
    digits: {
      get: function() {
        return state.digits;
      }
    },
    isMatrix: {
      get: function() {
        return state.isMatrix;
      }
    }
  });

  priv.set(this, state);


  for (var device = 0; device < devices; device++) {

    /*
      TODO: Add support for custom initialization

      An example of initialization, added to the constructor options:

        setup: {
          // OPCODE: VALUE
          DECODING: 0,
          BRIGHTNESS: 3,
          SCANLIMIT: 7,
          SHUTDOWN: 1,
          DISPLAYTEST: 1
        },


      In context:

        var lc = new five.LedControl({
          pins: {
            data: 2,
            clock: 3,
            cs: 4
          },
          setup: {
            DECODING: 0,
            BRIGHTNESS: 3,
            SCANLIMIT: 7,
            SHUTDOWN: 1,
            DISPLAYTEST: 1
          },
          isMatrix: true
        });


      The custom initializers are invoked as:

        keys.forEach(function(key) {
          this.send(device, LedControl.OP[key], setup[key]);
        }, this);


      I might be missing something obvious, but this isn't working.
      Using the same options shown below, the above should behave exactly the
      same way that the code below does, but that's not the case. The result is
      all leds in the matrix are lit and none can be cleared.
     */

    if (this.isMatrix) {
      this.send(device, LedControl.OP.DECODING, 0);
    }

    this.send(device, LedControl.OP.BRIGHTNESS, 3);
    this.send(device, LedControl.OP.SCANLIMIT, 7);
    this.send(device, LedControl.OP.SHUTDOWN, 1);
    this.send(device, LedControl.OP.DISPLAYTEST, 0);

    this.clear(device);
    this.off(device);
  }
}


LedControl.prototype.each = function(callbackfn) {
  for (var i = 0; i < this.devices; i++) {
    callbackfn.call(this, i);
  }
};


LedControl.prototype.on = function(addr) {
  if (typeof addr === "undefined") {
    this.each(function(device) {
      this.on(device);
    });
  } else {
    this.send(addr, LedControl.OP.SHUTDOWN, 1);
  }
  return this;
};

LedControl.prototype.off = function(addr) {
  if (typeof addr === "undefined") {
    this.each(function(device) {
      this.off(device);
    });
  } else {
    this.send(addr, LedControl.OP.SHUTDOWN, 0);
  }
  return this;
};

// LedControl.prototype.shutdown = function(addr, status) {
//   status = +status;
//   status ^= 1;
//   // shuts off if status == true
//   //
//   if (arguments.length === 1) {
//     this.each(function(device) {
//       this.send(device, LedControl.OP.SHUTDOWN, status);
//     });
//   } else {
//     if (addr < this.devices) {
//       this.send(addr, LedControl.OP.SHUTDOWN, status);
//     }
//   }
//   return this;
// };

LedControl.prototype.scanLimit = function(addr, limit) {
  if (arguments.length === 1) {
    limit = addr;
    this.each(function(device) {
      this.scanLimit(device, limit);
    });
  } else {
    this.send(addr, LedControl.OP.SCANLIMIT, limit);
  }
  return this;
};

LedControl.prototype.brightness = function(addr, val) {
  if (arguments.length === 1) {
    val = addr;
    this.each(function(device) {
      this.brightness(device, val);
    });
  } else {
    this.send(
      addr, LedControl.OP.INTENSITY, Board.map(val, 0, 100, 0, 15) | 0
    );
  }
  return this;
};

LedControl.prototype.clear = function(addr) {
  var offset;

  if (typeof addr === "undefined") {
    this.each(function(device) {
      this.clear(device);
    });
  } else {
    offset = addr * 8;

    for (var i = 0; i < 8; i++) {
      this.status[offset + i] = 0;
      this.send(addr, i + 1, 0);
    }
  }
  return this;
};


/**
 * led or setLed Set the status of a single Led.
 *
 * @param {Number} addr Address of Led
 * @param {Number} row Row number of Led (0-7)
 * @param {Number} column Column number of Led (0-7)
 * @param {Boolean} state [ true: on, false: off ] [ 1, 0 ]
 *
 */
LedControl.prototype.led = function(addr, row, col, state) {
  var offset, val;

  if (arguments.length === 3) {
    state = col;
    col = row;
    row = addr;
    this.each(function(device) {
      this.led(device, row, col, state);
    });
  } else {
    offset = addr * 8;
    val = 0x80 >> col;

    if (state) {
      this.status[offset + row] = this.status[offset + row] | val;
    } else {
      val = ~val;
      this.status[offset + row] = this.status[offset + row] & val;
    }
    this.send(addr, row + 1, this.status[offset + row]);
  }

  return this;
};

LedControl.prototype.setLed = function(addr, chr, val, dp) {
  console.log("The `setLed` method is deprecated, use `led` instead");
  return this.led(addr, chr, val, dp);
};

/**
 * row Update an entire row with an 8 bit value
 * @param  {Number} addr Device address
 * @param  {Number} row  0 indexed row number 0-7
 * @param  {Number} val  8-bit value 0-255
 * @return {LedControl}
 */
LedControl.prototype.row = function(addr, row, val /* 0 - 255 */ ) {
  var offset;

  if (arguments.length === 2) {
    val = row;
    row = addr;
    this.each(function(device) {
      this.row(device, row, val);
    });
  } else {
    offset = addr * 8;
    this.status[offset + row] = val;
    this.send(addr, row + 1, this.status[offset + row]);
  }

  return this;
};

/**
 * column Update an entire column with an 8 bit value
 * @param  {Number} addr Device address
 * @param  {Number} col  0 indexed col number 0-7
 * @param  {Number} val  8-bit value 0-255
 * @return {LedControl}
 */
LedControl.prototype.column = function(addr, col, value /* 0 - 255 */ ) {
  var state;

  if (arguments.length === 2) {
    value = col;
    col = addr;
    this.each(function(device) {
      this.column(device, col, value);
    });
  } else {
    for (var row = 0; row < 8; row++) {
      state = value >> (7 - row);
      state = state & 0x01;
      this.led(addr, row, col, state);
    }
  }

  return this;
};

/**
 * digit Display a digit
 * @param  {Number} addr      Device address
 * @param  {Number} position  0-7
 * @param  {Number} val       0-9
 * @param  {Boolean} dp       Show Decimal Point?
 *                            This is a truly awful design t
 *                            be p
 *
 *
 * @return {LedControl}
 */
LedControl.prototype.digit = function(addr, position, chr) {
  var args, offset, index, character, hasDecimal, value;


  if (arguments.length < 3) {
    args = Array.from(arguments);
    this.each(function(device) {
      this.digit.apply(this, (args.unshift(device), args));
    });
  } else {
    if (this.isMatrix) {
      // Not sure this is the best path, will check when segment
      // devices are available.
      //
      this.draw.apply(this, arguments);
    } else {

      offset = addr * 8;

      character = String(chr);
      position = Number(position);

      // Flip this around, because no one will
      // ever intuitively think that positions
      // start on the right and end on the left.
      index = 7 - position;

      if (character.length === 2 && character[0] === ".") {
        hasDecimal = true;
        character = character[0];
      }

      value = LedControl.DIGIT_CHARS[character];

      if (!value) {
        value = Math.abs(Number(character));
      }

      if (hasDecimal) {
        value = value | 0x80;
      }

      this.status[offset + index] = value;
      this.send(addr, index + 1, value);
    }
  }

  return this;
};


/**
 * draw Draw a character
 * @param  {Number} addr  Device address
 * @param  {Number} chr   Character to draw
 *
 * Used as pass-through to .digit
 *
 * @param  {Number} val   8-bit value 0-255
 * @param  {Number} dp    ugly
 * @return {LedControl}
 */
LedControl.prototype.draw = function(addr, chr) {
  // in matrix mode, this takes two arguments:
  // addr and the character to display
  var character;

  if (arguments.length === 1) {
    chr = addr;
    this.each(function(device) {
      this.draw(device, chr);
    });
  } else {

    if (this.isMatrix) {
      if (Array.isArray(chr)) {
        character = chr;
      } else {
        character = LedControl.MATRIX_CHARS[chr];
      }

      if (character !== undefined) {
        if (character.length !== 8) {
          throw new Error("character is invalid: " + character);
        }

        character.forEach(function(rowByte, idx) {
          if (typeof rowByte === "string") {
            rowByte = parseInt(rowByte, 2);
          }

          this.row(addr, idx, rowByte);
          // process.nextTick(function() {
          //   this.row(addr, idx, rowByte);
          // }.bind(this));
        }, this);
      }
    } else {

      // in seven-segment mode, this takes four arguments, which
      // are just passed through to digit
      this.digit.apply(this, arguments);
    }
  }

  return this;
};

LedControl.prototype.shift = function(addr, direction, distance) {

  if (arguments.length === 2) {
    distance = direction;
    direction = addr;
    this.each(function(device) {
      this.shift(addr, direction, distance);
    });
  } else {

  }

  return this;
};


LedControl.prototype.char = function(addr, chr, val, dp) {
  console.log("The `char` method is deprecated, use `draw` instead");

  return this.draw(addr, chr, val, dp);
};

LedControl.prototype.print = function() {

  if (this.isMatrix) {

    // figure out what to do with Matrix displays

  } else {





  }
  /*
    print will:

    - display a message comprised of zero or more characters
      at an explicit or default rate per character.

   */
};

LedControl.prototype.send = function(addr, opcode, data) {
  var offset = addr * 2;
  var maxBytes = this.devices * 2;
  var spiData = [];

  if (arguments.length !== 3) {
    throw new Error("`send` expects three arguments: device, opcode, data");
  }

  if (addr < this.devices) {
    for (var i = 0; i < maxBytes; i++) {
      spiData[i] = 0;
    }

    spiData[offset + 1] = opcode;
    spiData[offset] = data;

    this.board.digitalWrite(this.pins.cs, this.io.LOW);

    for (var j = maxBytes; j > 0; j--) {
      this.board.shiftOut(this.pins.data, this.pins.clock, spiData[j - 1]);
    }

    this.board.digitalWrite(this.pins.cs, this.io.HIGH);
  }

  return this;
};

/**
 * device Draw a character
 * @param  {Number} addr  Device address
 * @param  {Number} chr   Character to draw
 * @param  {Number} val   8-bit value 0-255
 * @return {LedControl}
 */
LedControl.prototype.device = function(addr) {
  var bound = {};

  Object.keys(LedControl.prototype).forEach(function(key) {
    bound[key] = this[key].bind(this, addr);
  }, this);

  return bound;
};





// NOTE: Currently unused, these will form
// the basis for the `setup` constructor option
LedControl.DEFAULTS = {
  DECODING: 0x00,
  BRIGHTNESS: 0x03,
  SCANLIMIT: 0x07,
  SHUTDOWN: 0x01,
  DISPLAYTEST: 0x00
};

Object.freeze(LedControl.DEFAULTS);

LedControl.OP = {};

LedControl.OP.NOOP = 0x00;

LedControl.OP.DIGIT0 = 0x01;
LedControl.OP.DIGIT1 = 0x02;
LedControl.OP.DIGIT2 = 0x03;
LedControl.OP.DIGIT3 = 0x04;
LedControl.OP.DIGIT4 = 0x05;
LedControl.OP.DIGIT5 = 0x06;
LedControl.OP.DIGIT6 = 0x07;
LedControl.OP.DIGIT7 = 0x08;

LedControl.OP.DECODEMODE = 0x09;
LedControl.OP.INTENSITY = 0x0a;
LedControl.OP.SCANLIMIT = 0x0b;
LedControl.OP.SHUTDOWN = 0x0c;
LedControl.OP.DISPLAYTEST = 0x0f;

// Aliases
LedControl.OP.BRIGHTNESS = LedControl.OP.INTENSITY;
LedControl.OP.DECODING = LedControl.OP.DECODEMODE;
LedControl.OP.DISPLAY = LedControl.OP.DISPLAYTEST;
LedControl.OP.POWERDOWN = LedControl.OP.SHUTDOWN;

Object.freeze(LedControl.OP);

LedControl.DIRECTIONS = {
  UP: 1,
  RIGHT: 2,
  DOWN: 3,
  LEFT: 4,
  1: "UP",
  2: "RIGHT",
  3: "DOWN",
  4: "LEFT",
};

Object.freeze(LedControl.DIRECTIONS);

LedControl.DIGIT_CHARS = {
  "0": 0x7E,
  "1": 0x30,
  "2": 0x6D,
  "3": 0x79,
  "4": 0x33,
  "5": 0x5B,
  "6": 0x5F,
  "7": 0x70,
  "8": 0x7F,
  "9": 0x7B,
  " ": 0x00,
  "!": 0xB0,
  "A": 0x77,
  "a": 0x7D,
  "B": 0x7F,
  "b": 0x1F,
  "C": 0x4E,
  "c": 0x0D,
  "D": 0x7E,
  "d": 0x3D,
  "E": 0x4F,
  "e": 0x6f,
  "F": 0x47,
  "f": 0x47,
  "G": 0x5E,
  "g": 0x7B,
  "H": 0x37,
  "h": 0x17,
  "I": 0x30,
  "i": 0x10,
  "J": 0x3C,
  "j": 0x38,
  "K": 0x37,
  "k": 0x17,
  "L": 0x0E,
  "l": 0x06,
  "M": 0x55,
  "m": 0x55,
  "N": 0x15,
  "n": 0x15,
  "O": 0x7E,
  "o": 0x1D,
  "P": 0x67,
  "p": 0x67,
  "Q": 0x73,
  "q": 0x73,
  "R": 0x77,
  "r": 0x05,
  "S": 0x5B,
  "s": 0x5B,
  "T": 0x46,
  "t": 0x0F,
  "U": 0x3E,
  "u": 0x1C,
  "V": 0x27,
  "v": 0x23,
  "W": 0x3F,
  "w": 0x2B,
  "X": 0x25,
  "x": 0x25,
  "Y": 0x3B,
  "y": 0x33,
  "Z": 0x6D,
  "z": 0x6D,
};

// https://dl.dropboxusercontent.com/u/3531958/digits.html

LedControl.MATRIX_CHARS = {
  " ": [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  "!": [0x04, 0x04, 0x04, 0x04, 0x00, 0x00, 0x04, 0x00],
  '"': [0x0A, 0x0A, 0x0A, 0x00, 0x00, 0x00, 0x00, 0x00],
  "#": [0x0A, 0x0A, 0x1F, 0x0A, 0x1F, 0x0A, 0x0A, 0x00],
  "$": [0x04, 0x0F, 0x14, 0x0E, 0x05, 0x1E, 0x04, 0x00],
  "%": [0x18, 0x19, 0x02, 0x04, 0x08, 0x13, 0x03, 0x00],
  "&": [0x0C, 0x12, 0x14, 0x08, 0x15, 0x12, 0x0D, 0x00],
  "'": [0x0C, 0x04, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00],
  "(": [0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02, 0x00],
  ")": [0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08, 0x00],
  "*": [0x00, 0x04, 0x15, 0x0E, 0x15, 0x04, 0x00, 0x00],
  "+": [0x00, 0x04, 0x04, 0x1F, 0x04, 0x04, 0x00, 0x00],
  ",": [0x00, 0x00, 0x00, 0x00, 0x0C, 0x04, 0x08, 0x00],
  "-": [0x00, 0x00, 0x00, 0x1F, 0x00, 0x00, 0x00, 0x00],
  ".": [0x00, 0x00, 0x00, 0x00, 0x00, 0x0C, 0x0C, 0x00],
  "/": [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x00, 0x00],
  "0": [0x0E, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0E, 0x00],
  "1": [0x04, 0x0C, 0x04, 0x04, 0x04, 0x04, 0x0E, 0x00],
  "2": [0x0E, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1F, 0x00],
  "3": [0x1F, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0E, 0x00],
  "4": [0x02, 0x06, 0x0A, 0x12, 0x1F, 0x02, 0x02, 0x00],
  "5": [0x1F, 0x10, 0x1E, 0x01, 0x01, 0x11, 0x0E, 0x00],
  "6": [0x06, 0x08, 0x10, 0x1E, 0x11, 0x11, 0x0E, 0x00],
  "7": [0x1F, 0x01, 0x02, 0x04, 0x04, 0x04, 0x04, 0x00],
  "8": [0x1E, 0x11, 0x11, 0x0E, 0x11, 0x11, 0x0E, 0x00],
  "9": [0x0E, 0x11, 0x11, 0x0F, 0x01, 0x02, 0x0C, 0x00],
  ":": [0x00, 0x0C, 0x0C, 0x00, 0x0C, 0x0C, 0x00, 0x00],
  ";": [0x00, 0x0C, 0x0C, 0x00, 0x0C, 0x04, 0x08, 0x00],
  "<": [0x02, 0x04, 0x08, 0x10, 0x08, 0x04, 0x02, 0x00],
  "=": [0x00, 0x00, 0x1F, 0x00, 0x1F, 0x00, 0x00, 0x00],
  ">": [0x08, 0x04, 0x02, 0x01, 0x02, 0x04, 0x08, 0x00],
  "?": [0x0E, 0x11, 0x01, 0x02, 0x04, 0x00, 0x04, 0x00],
  "@": [0x0E, 0x11, 0x01, 0x0D, 0x15, 0x15, 0x0E, 0x00],

  "A": [0x08, 0x14, 0x22, 0x3E, 0x22, 0x22, 0x22, 0x22],
  "B": [0x3C, 0x22, 0x22, 0x3E, 0x22, 0x22, 0x3C, 0x00],
  "C": [0x3C, 0x40, 0x40, 0x40, 0x40, 0x40, 0x3C, 0x00],
  "D": [0x7C, 0x42, 0x42, 0x42, 0x42, 0x42, 0x7C, 0x00],
  "E": [0x7C, 0x40, 0x40, 0x7C, 0x40, 0x40, 0x40, 0x7C],
  "F": [0x7C, 0x40, 0x40, 0x7C, 0x40, 0x40, 0x40, 0x40],
  "G": [0x3C, 0x40, 0x40, 0x40, 0x40, 0x44, 0x44, 0x3C],
  "H": [0x44, 0x44, 0x44, 0x7C, 0x44, 0x44, 0x44, 0x44],
  "I": [0x7C, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x7C],
  "J": [0x3C, 0x08, 0x08, 0x08, 0x08, 0x08, 0x48, 0x30],
  "K": [0x00, 0x24, 0x28, 0x30, 0x20, 0x30, 0x28, 0x24],
  "L": [0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x7C],
  "M": [0x81, 0xC3, 0xA5, 0x99, 0x81, 0x81, 0x81, 0x81],
  "N": [0x00, 0x42, 0x62, 0x52, 0x4A, 0x46, 0x42, 0x00],
  "O": [0x3C, 0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x3C],
  "P": [0x3C, 0x22, 0x22, 0x22, 0x3C, 0x20, 0x20, 0x20],
  "Q": [0x1C, 0x22, 0x22, 0x22, 0x22, 0x26, 0x22, 0x1D],
  "R": [0x3C, 0x22, 0x22, 0x22, 0x3C, 0x24, 0x22, 0x21],
  "S": [0x00, 0x1E, 0x20, 0x20, 0x3E, 0x02, 0x02, 0x3C],
  "T": [0x00, 0x3E, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08],
  "U": [0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x22, 0x1C],
  "V": [0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x24, 0x18],
  "W": [0x00, 0x49, 0x49, 0x49, 0x49, 0x2A, 0x1C, 0x00],
  "X": [0x00, 0x41, 0x22, 0x14, 0x08, 0x14, 0x22, 0x41],
  "Y": [0x41, 0x22, 0x14, 0x08, 0x08, 0x08, 0x08, 0x08],
  "Z": [0x00, 0x7F, 0x02, 0x04, 0x08, 0x10, 0x20, 0x7F],
  // "A": [0x0E, 0x11, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x00],
  // "B": [0x1E, 0x09, 0x09, 0x0E, 0x09, 0x09, 0x1E, 0x00],
  // "C": [0x0E, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0E, 0x00],
  // "D": [0x1E, 0x09, 0x09, 0x09, 0x09, 0x09, 0x1E, 0x00],
  // "E": [0x1F, 0x10, 0x10, 0x1F, 0x10, 0x10, 0x1F, 0x00],
  // "F": [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x10, 0x00],
  // "G": [0x0E, 0x11, 0x10, 0x13, 0x11, 0x11, 0x0F, 0x00],
  // "H": [0x11, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11, 0x00],
  // "I": [0x0E, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0E, 0x00],
  // "J": [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0C, 0x00],
  // "K": [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11, 0x00],
  // "L": [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1F, 0x00],
  // "M": [0x11, 0x1B, 0x15, 0x15, 0x11, 0x11, 0x11, 0x00],
  // "N": [0x11, 0x19, 0x19, 0x15, 0x13, 0x13, 0x11, 0x00],
  // "O": [0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E, 0x00],
  // "P": [0x1E, 0x11, 0x11, 0x1E, 0x10, 0x10, 0x10, 0x00],
  // "Q": [0x0E, 0x11, 0x11, 0x11, 0x15, 0x12, 0x1D, 0x00],
  // "R": [0x1E, 0x11, 0x11, 0x1E, 0x14, 0x12, 0x11, 0x00],
  // "S": [0x0E, 0x11, 0x10, 0x0E, 0x01, 0x11, 0x0E, 0x00],
  // "T": [0x1F, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04, 0x00],
  // "U": [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E, 0x00],
  // "V": [0x11, 0x11, 0x11, 0x11, 0x11, 0x0A, 0x04, 0x00],
  // "W": [0x11, 0x11, 0x11, 0x15, 0x15, 0x1B, 0x11, 0x00],
  // "X": [0x11, 0x11, 0x0A, 0x04, 0x0A, 0x11, 0x11, 0x00],
  // "Y": [0x11, 0x11, 0x11, 0x0A, 0x04, 0x04, 0x04, 0x00],
  // "Z": [0x1F, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1F, 0x00],
  "[": [0x0E, 0x08, 0x08, 0x08, 0x08, 0x08, 0x0E, 0x00],
  "\\": [0x00, 0x10, 0x08, 0x04, 0x02, 0x01, 0x00, 0x00],
  "]": [0x0E, 0x02, 0x02, 0x02, 0x02, 0x02, 0x0E, 0x00],
  "^": [0x04, 0x0A, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00],
  "_": [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1F, 0x00],
  "`": [0x10, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00],
  "a": [0x00, 0x00, 0x0E, 0x01, 0x0F, 0x11, 0x0F, 0x00],
  "b": [0x10, 0x10, 0x16, 0x19, 0x11, 0x11, 0x1E, 0x00],
  "c": [0x00, 0x00, 0x0E, 0x11, 0x10, 0x11, 0x0E, 0x00],
  "d": [0x01, 0x01, 0x0D, 0x13, 0x11, 0x11, 0x0F, 0x00],
  "e": [0x00, 0x00, 0x0E, 0x11, 0x1F, 0x10, 0x0E, 0x00],
  "f": [0x02, 0x05, 0x04, 0x0E, 0x04, 0x04, 0x04, 0x00],
  "g": [0x00, 0x0D, 0x13, 0x13, 0x0D, 0x01, 0x0E, 0x00],
  "h": [0x10, 0x10, 0x16, 0x19, 0x11, 0x11, 0x11, 0x00],
  "i": [0x04, 0x00, 0x0C, 0x04, 0x04, 0x04, 0x0E, 0x00],
  "j": [0x02, 0x00, 0x06, 0x02, 0x02, 0x12, 0x0C, 0x00],
  "k": [0x08, 0x08, 0x09, 0x0A, 0x0C, 0x0A, 0x09, 0x00],
  "l": [0x0C, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0E, 0x00],
  "m": [0x00, 0x00, 0x1A, 0x15, 0x15, 0x15, 0x15, 0x00],
  "n": [0x00, 0x00, 0x16, 0x19, 0x11, 0x11, 0x11, 0x00],
  "o": [0x00, 0x00, 0x0E, 0x11, 0x11, 0x11, 0x0E, 0x00],
  "p": [0x00, 0x16, 0x19, 0x19, 0x16, 0x10, 0x10, 0x00],
  "q": [0x00, 0x0D, 0x13, 0x13, 0x0D, 0x01, 0x01, 0x00],
  "r": [0x00, 0x00, 0x16, 0x19, 0x10, 0x10, 0x10, 0x00],
  "s": [0x00, 0x00, 0x0F, 0x10, 0x1E, 0x01, 0x1F, 0x00],
  "t": [0x08, 0x08, 0x1C, 0x08, 0x08, 0x09, 0x06, 0x00],
  "u": [0x00, 0x00, 0x12, 0x12, 0x12, 0x12, 0x0D, 0x00],
  "v": [0x00, 0x00, 0x11, 0x11, 0x11, 0x0A, 0x04, 0x00],
  "w": [0x00, 0x00, 0x11, 0x11, 0x15, 0x15, 0x0A, 0x00],
  "x": [0x00, 0x00, 0x11, 0x0A, 0x04, 0x0A, 0x11, 0x00],
  "y": [0x00, 0x00, 0x11, 0x11, 0x13, 0x0D, 0x01, 0x0E],
  "z": [0x00, 0x00, 0x1F, 0x02, 0x04, 0x08, 0x1F, 0x00],
  "{": [0x02, 0x04, 0x04, 0x08, 0x04, 0x04, 0x02, 0x00],
  "|": [0x04, 0x04, 0x04, 0x00, 0x04, 0x04, 0x04, 0x00],
  "}": [0x08, 0x04, 0x04, 0x02, 0x04, 0x04, 0x08, 0x00],
  "~": [0x08, 0x15, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00],
};

module.exports = LedControl;
