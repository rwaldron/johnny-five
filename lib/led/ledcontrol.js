/*
  About the original version of ledcontrol.js:

  This was originally a port by Rebecca Murphey of the LedControl library
  and also includes a port of the AdaFruit LEDBackpack library
  (MIT License, Copyright (c) 2012 Adafruit Industries)

  The license of the original LedControl library is as follows:

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
const Board = require("../board");
const ledCharacters = require("./led-chars");

// Led instance private data
const priv = new Map();


/**
 * Create an LED control.
 * @mixes Board.Component
 * @param {Object}  options              An options hash.
 * @param {String}  [options.controller] The controller to use. Either default ("MAX 7219") or "HT16K33".
 * @param {Boolean} [options.colon]      Whether the device has a built in colon.
 * @param {Number}  [options.devices]    The number of connected LED devices.
 * @param {Array}   [options.addresses]  I2C addresses.
 * @param {*}       options.pins         The digital pin numbers that connect to
 *                                    data, clock, and cs connections on the controller device.
 *                                    Only for use with the default controller.
 *                                    Accepts either an object ({data, clock, cs})
 *                                    or an array ([data, clock, cs]).
 * @param {*}       [options.dims]       Dimensions of the LED screen.
 *                                    Only for use with the HT16K33 controller.
 * @param {Boolean} [options.isBicolor]  Whether the LED screen is bicolor.
 *                                    Only for use with the HT16K33 controller.
 */
class LedControl {
  constructor(options) {

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(
      this, Controllers, options
    );

    // digit indexes may be ordered left to right (1) or reversed (-1)
    this.digitOrder = 1;

    // Does the device have a built-in colon?
    /* istanbul ignore else */
    if (!this.isMatrix) {
      this.colon = options.colon || false;
    }

    // extra functions for HT16K33 devices only
    // if (controller.writeDisplay) {
    //   this.writeDisplay = controller.writeDisplay;
    // }
    // if (controller.blink) {
    //   this.blink = controller.blink;
    // }
    /*
      devices variable indicates number of connected LED devices
      Here's an example of multiple devices:
      http://tronixstuff.com/2013/10/11/tutorial-arduino-max7219-led-display-driver-ic/
     */
    const devices = options.devices || (options.addresses ? options.addresses.length : 1);

    this.memory = Array(64).fill(0);

    options.dims = options.dims || LedControl.MATRIX_DIMENSIONS["8x8"];
    if (typeof options.dims === "string") {
      options.dims = LedControl.MATRIX_DIMENSIONS[options.dims];
    }
    if (Array.isArray(options.dims)) {
      options.dims = {
        rows: options.dims[0],
        columns: options.dims[1],
      };
    }
    const state = {
      devices,
      digits: options.digits || 8,
      isMatrix: !!options.isMatrix,
      isBicolor: !!options.isBicolor,
      rows: options.dims.rows,
      columns: options.dims.columns
    };

    if (!(state.columns === 8 || state.columns === 16) || !(state.rows === 8 || state.rows === 16) || (state.columns + state.rows === 32)) {
      throw new Error("Invalid matrix dimensions specified: must be 8x8, 16x8 or 8x16");
    }

    Object.defineProperties(this, {
      devices: {
        get() {
          return state.devices;
        }
      },
      digits: {
        get() {
          return state.digits;
        }
      },
      isMatrix: {
        get() {
          return state.isMatrix;
        }
      },
      isBicolor: {
        get() {
          return state.isBicolor;
        }
      },
      rows: {
        get() {
          return state.rows;
        }
      },
      columns: {
        get() {
          return state.columns;
        }
      }
    });

    priv.set(this, state);
    this.initialize(options);
  }

  /**
   * Iterate over the index of each connected device and invoke a callback function
   * for each.
   * @param {Function} callbackfn The function to callback for each device index.
   */
  each(callbackfn) {
    for (let i = 0; i < this.devices; i++) {
      callbackfn.call(this, i);
    }
  }

  /**
   * Turn the LED device(s) on.
   * @param  {Number} addr The index of the device to turn on.
   *                       If undefined, all devices are turned on.
   * @return {LEDControl}  Returns this to allow for chaining.
   */
  on(addr) {
    if (typeof addr === "undefined") {
      this.each(function(device) {
        this.on(device);
      });
    } else {
      this.send(addr, this.OP.SHUTDOWN || LedControl.OP.SHUTDOWN, 1);
    }
    return this;
  }

  /**
   * Turn the LED device(s) off.
   * @param  {Number} addr The index of the device to turn off.
   *                       If undefined, all devices are turned off.
   * @return {LEDControl}  Returns this to allow for chaining.
   */
  off(addr) {
    if (typeof addr === "undefined") {
      this.each(function(device) {
        this.off(device);
      });
    } else {
      this.send(addr, this.OP.SHUTDOWN || LedControl.OP.SHUTDOWN, 0);
    }
    return this;
  }

  /**
   * digit Display a digit and optional decimal point.
   * @param  {Number} addr      Device address
   * @param  {Number} position  0-7
   * @param  {String} val       0-9[.]
   * @return {LedControl}
   */
  digit(addr, position, chr) {
    let args;
    let offset;
    let index;
    let character;
    let value;
    let hasDecimal = false;

    if (arguments.length < 3) {
      args = Array.from(arguments);
      this.each(function(device) {
        this.digit.apply(this, (args.unshift(device), args));
      });
      return this;
    }

    if (this.isMatrix) {
      // Not sure this is the best path, will check when segment
      // devices are available.
      this.draw.apply(this, arguments);
      return this;
    }

    offset = addr * this.digits;

    character = String(chr);
    position = Number(position);

    // If controller's indexes are ordered right to left, flip
    // the index around.
    index = position;
    if (this.digitOrder === -1) {
      index = this.digits - index - 1;
    }

    if (character.length === 2 && character[1] === ".") {
      hasDecimal = true;
      character = character[0];
    }

    value = LedControl.DIGIT_CHARS[character];

    if (!value) {
      value = Math.abs(Number(character));
    }

    if (hasDecimal) {
      value = value | LedControl.DIGIT_CHARS["."];
    }

    this.memory[offset + index] = value;
    this.sendDigit(addr, index, value);
    return this;
  }

  /**
   * print Print series of characters to the display.
   * @param  {String} message One or more characters to be displayed.
   * @param  {Object} options    (Optional) Options specifying:
   *                          - device: {Number} Device address
   * @return {LedControl}
   */
  print(message, options) {
    const rdigchars = /([0-9A-Za-z][.]|[0-9A-Za-z:]|[\s])/g;
    let characters;

    options = options || {
      device: 0
    };

    if (this.isMatrix) {
      // figure out what to do with Matrix displays
      throw new Error("Led.Matrix does not yet support the print method");
    }

    if (typeof message !== "string") {
      message = String(message);
    }

    characters = message.match(rdigchars);

    // When a device has a built-in colon, ie. "00:00",
    // then attempt to make it less awkward to print words across
    // the display by splicing in a " " placeholder, but only
    // when necessary.
    if (this.colon) {
      if (characters.length > 2 &&
        (characters[2] !== ":" && characters[2] !== " ")) {
        characters.splice(2, 0, " ");
      }
    }

    /* istanbul ignore next */
    (characters || []).forEach(function(character, position) {
      this.digit(options.device, position, character);
    }, this);
    return this;
  }

  /*
   * brightness
   * @param {Number} addr Address of Led device
   * @param {Number} val Brightness value
   */
  brightness(addr, val) {
    if (arguments.length === 1) {
      val = addr;
      this.each(function(device) {
        this.brightness(device, val);
      });
    } else {
      this.send(addr, this.OP.BRIGHTNESS || LedControl.OP.BRIGHTNESS, Board.map(val, 0, 100, 0, 15));
    }
    return this;
  }

  /**
   * column Update an entire column with an 8 or 16 bit value
   * @param  {Number} addr Device address
   * @param  {Number} col  0 indexed col number 0-7
   * @param  {Number} val  8-bit 0-0xFF (for 8x8 or 16x8 matrix) or 16-bit 0-0xFFFF (for 8x16) value
   * @return {LedControl}
   */
  column(addr, col, value) {
    let state;
    if (!this.isMatrix) {
      throw new Error("The `column` method is only supported for Matrix devices");
    }
    if (arguments.length === 2) {
      value = col;
      col = addr;
      this.each(function(device) {
        this.column(device, col, value);
      });
    } else {
      for (let row = 0; row < this.rows; row++) {
        state = value >> ((this.rows - 1) - row);
        state = state & 0x01;
        this.led(addr, row, col, state);
      }
    }

    return this;
  }

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
  draw(addr, chr) {
    // in matrix mode, this takes two arguments:
    // addr and the character to display
    let character;

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
          character = ledCharacters.MATRIX_CHARS[chr];
        }

        /* istanbul ignore else */
        if (character !== undefined) {
          if (character.length !== this.rows && character.length !== this.columns) {
            throw new Error(`Invalid character: ${character}`);
          }
          // pad character to match number of rows suppported by device
          const charLength = character.length;

          for (let i = 0; i < (this.rows - charLength); i++) {
            /* istanbul ignore next */
            character.push(0);
          }

          character.forEach(function(rowData, idx) {
            this.row(addr, idx, rowData);
          }, this);
        }
      } else {

        // in seven-segment mode, this takes four arguments, which
        // are just passed through to digit
        this.digit.apply(this, arguments);
      }
    }

    return this;
  }

  device(addr) {
    const bound = {};

    /* keys from prototype */
    Object.keys(LedControl.prototype).forEach(key => {
      bound[key] = this[key].bind(this, addr);
    });

    /* functions from interface */
    Object.getOwnPropertyNames(this).forEach(key => {
      if (this[key] && typeof this[key] === "function") {
        bound[key] = this[key].bind(this, addr);
      }
    });
    return bound;
  }
}

let addresses = new Set([0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77]);

const Controllers = {
  HT16K33: {
    OP: {
      value: {
        SHUTDOWN: 0x20,
        BRIGHTNESS: 0xE0,
        BLINK: 0x80
      }
    },
    initialize: {
      writable: true,
      value(options) {
        const state = priv.get(this);
        const available = Array.from(addresses);

        if (available.length === 0) {
          throw new Error("There are no available HT16K33 controller addresses");
        }

        this.addresses = options.addresses || (options.address ? [options.address] : null);

        // use default range of addresses if addresses aren't specified
        if (this.addresses === null) {
          this.addresses = available.slice(0, state.devices);
        }

        this.addresses.forEach(address => {
          if (!addresses.has(address)) {
            throw new Error(`Invalid HT16K33 controller address: ${address}`);
          }
          addresses.delete(address);
        });

        this.rotation = options.rotation || 1;
        // set a default rotation that works with AdaFruit 16x8 matrix if using 16 columns
        /* istanbul ignore next */
        if (this.columns === 16 && !options.rotation) {
          this.rotation = 0;
        }
        this.buffer = Array(this.rows).fill([]);

        if (!this.isMatrix) {
          this.colon = true;
        }

        options.addresses = this.addresses;

        // Set up I2C data connection
        this.io.i2cConfig(options);
        // TODO allow setup to be configured through options
        this.each(function(device) {
          this.on(device);
          // Turn off blinking during initialization, in case it was left on.
          this.blink(device, false);
          this.brightness(device, 100);
          this.clear(device);
        });
      },
    },
    /**
     * Blink the screen.
     *
     * @param  {*} addr      Either the index of the device to blink,
     *                       or the blink value to apply to all devices.
     * @param  {String} val  The blink value. Either 'slow' (once every 2 seconds),
     *                       'normal' (once every second), 'fast' (once every 500ms),
     *                       or false to turn off blinking.
     * @return {LedControl}  Returns this to allow for chaining.
     */
    blink: {
      writable: true,
      value(addr, val) {
        if (arguments.length === 1) {
          val = addr;
          this.each(function(device) {
            this.blink(device, val);
          });
        } else {
          let _val = null;
          // Translate human-readable value to value expected by HT16K33, see datasheet.
          switch (val) {
            case false:
              _val = 0;
              break;
            case "slow":
              _val = 6;
              break;
            case "normal":
              _val = 4;
              break;
            case "fast":
              _val = 2;
              break;
          }
          /* istanbul ignore if */
          if (_val == null) {
            return;
          }
          // Add 1 to the opcode to turn blinking functionality on, see datasheet.
          this.send(addr, this.OP.BLINK | 1, _val);
        }
        return this;
      },
    },
    /*
     * clear
     * @param {Number} addr Address of Led device
     */
    clear: {
      writable: true,
      value(addr) {
        let offset;
        if (typeof addr === "undefined") {
          this.each(function(device) {
            this.clear(device);
          });
        } else {
          offset = addr * this.columns;

          for (let i = 0; i < this.rows; i++) {
            this.memory[offset + i] = 0;
            this.buffer[addr][i] = 0;
          }
          this.writeDisplay(addr);
        }
        return this;
      },
    },
    /**
     * led or setLed Set the memory of a single Led.
     *
     * @param {Number} addr Address of Led
     * @param {Number} row Row number of Led (0-7)
     * @param {Number} column Column number of Led (0-7)
     * @param {Boolean} state [ true: on, false: off ] [ 1, 0 ] or an LedControl color code
     *
     */
    led: {
      writable: true,
      value(addr, row, col, state) {

        if (arguments.length === 3) {
          state = col;
          col = row;
          row = addr;
          this.each(function(device) {
            this.led(device, row, col, state);
          });
          return this;
        } else {
          let x = col;
          let y = row;
          let tmp;
          let rows = this.rows;
          let columns = this.columns;
          if ((y < 0) || (y >= rows)) {
            return this;
          }
          if ((x < 0) || (x >= columns)) {
            return this;
          }
          switch (this.rotation) {
            case 1:
              columns = this.rows;
              rows = this.columns;
              tmp = x;
              x = y;
              y = tmp;
              x = columns - x - 1;
              break;
            case 2:
              x = columns - x - 1;
              y = rows - y - 1;
              break;
            case 3:
              columns = this.rows;
              rows = this.columns;
              tmp = x;
              x = y;
              y = tmp;
              y = rows - y - 1;
              break;
          }
          if (!this.isBicolor) {
            // x needs to be wrapped around for single color 8x8 AdaFruit matrix
            /* istanbul ignore else */
            if (columns === 8 && rows === 8) {
              x += columns - 1;
              x %= columns;
            }
            if (state) {
              this.buffer[addr][y] |= 1 << x;
            } else {
              this.buffer[addr][y] &= ~(1 << x);
            }
          } else {
            // 8x8 bi-color matrixes only
            if (state === LedControl.COLORS.GREEN) {
              // Turn on green LED.
              this.buffer[addr][y] |= 1 << x;
              // Turn off red LED.
              this.buffer[addr][y] &= ~(1 << (x + 8));
            } else if (state === LedControl.COLORS.YELLOW) {
              // Turn on green and red LED.
              this.buffer[addr][y] |= (1 << (x + 8)) | (1 << x);
            } else if (state === LedControl.COLORS.RED) {
              // Turn on red LED.
              this.buffer[addr][y] |= 1 << (x + 8);
              // Turn off green LED.
              this.buffer[addr][y] &= ~(1 << x);
            } else {
              // Turn off green and red LED.
              this.buffer[addr][y] &= ~(1 << x) & ~(1 << (x + 8));
            }
          }
          this.writeDisplay(addr);
        }
        return this;
      }
    },
    writeDisplay: {
      writable: true,
      value(addr) {
        const bytes = [0x00];
        // always writes 8 rows (for 8x16, the values have already been rotated)
        for (let i = 0; i < 8; i++) {
          bytes.push(this.buffer[addr][i] & 0xFF);
          bytes.push(this.buffer[addr][i] >> 8);
        }
        this.io.i2cWrite(this.addresses[addr], bytes);
      },
    },
    /**
     * row Update an entire row with an 8 bit value
     * @param  {Number} addr Device address
     * @param  {Number} row  0 indexed row number 0-7
     * @param  {Number} val  8-bit value 0-255
     * @return {LedControl}
     */
    row: {
      writable: true,
      value(addr, row, val /* 0 - 0xFFFF or string */) {
        if (!this.isMatrix) {
          throw new Error("The `row` method is only supported for Matrix devices");
        }
        if (typeof val === "number") {
          val = (`0000000000000000${parseInt(val, 10).toString(2)}`).substr(0 - (this.columns), this.columns);
        }
        if (arguments.length === 2) {
          val = row;
          row = addr;
          this.each(function(device) {
            this.row(device, row, val);
          });
        } else {

          // call the led function because the handling of rotation
          // and wrapping for monochrome matrixes is done there
          for (let i = 0; i < this.columns; i++) {
            this.led(addr, row, i, parseInt(val[i], 10));
          }
        }

        return this;
      }
    },

    scanLimit: {
      writable: true,
      value() {
        throw new Error("The `scanLimit` method is not implemented for HT16K33 devices");
      }
    },

    /*
     * Send data to the LED controller.
     * @param {Number} addr   Index of the device to address.
     * @param {Number} opcode Operation code.
     * @param {Number} data   Data.
     */
    send: {
      writable: true,
      value(addr, opcode, data) {
        if (arguments.length !== 3) {
          throw new Error("The `send` method expects three arguments: device, opcode, data");
        }
        this.io.i2cWrite(this.addresses[addr], [opcode | data]);
        return this;
      }
    },

    /**
     * sendDigit
     * @param  {Number} addr     Device address.
     * @param  {Number} index    0-7
     * @param  {Number} code     8-bit value 0-255
     * @return {LedControl}
     */
    sendDigit: {
      writable: true,
      value(addr, index, code) {
        // Given:
        //
        //   0 === 0b00000000
        // 255 === 0b11111111
        //
        // ...0 & 255 can be skipped.
        //
        if (code > 0 && code < 255) {
          // Convert from hex to binary, padded to 8 bits.
          code = (`00000000${code.toString(2)}`).slice(-8).split("");
          // Reverse bits for each display segment except the decimal,
          // to match the HT16K33 controller's segment ordering.
          code = code.shift() + code.reverse().join("");
          code = parseInt(code, 2);
        }

        // Convert to decimal and write to the display.
        this.buffer[addr][index] = code;
        this.writeDisplay(addr);
        return this;
      },
    }
  },

  DEFAULT: {
    OP: {
      value: {},
    },
    initialize: {
      writable: true,
      value({pins}) {

        this.pins = {
          data: pins.data,
          clock: pins.clock,
          cs: pins.cs || pins.latch
        };
        ["data", "clock", "cs"].forEach(function(pin) {
          this.io.pinMode(this.pins[pin], this.io.MODES.OUTPUT);
        }, this);
        // NOTE: Currently unused, these will form
        // the basis for the `setup` constructor option
        // var setup = Object.assign({}, LedControl.DEFAULTS, options.setup || {});
        // var keys = Object.keys(setup);

        // digit indexes ordered right to left.
        this.digitOrder = -1;
        this.digitOrder = -1;

        for (let device = 0; device < this.devices; device++) {
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
          this.on(device);
        }
        return this;
      }
    },
    clear: {
      writable: true,
      value(addr) {
        let offset;

        if (typeof addr === "undefined") {
          this.each(function(device) {
            this.clear(device);
          });
        } else {
          offset = addr * 8;

          for (let i = 0; i < 8; i++) {
            this.memory[offset + i] = 0;
            this.send(addr, i + 1, 0);
          }
        }
        return this;
      }
    },

    /**
     * sendDigit
     * @param  {Number} addr     Device address.
     * @param  {Number} index    0-7
     * @param  {Number} code     8-bit value 0-255
     * @return {LedControl}
     */
    sendDigit: {
      writable: true,
      value(addr, index, code) {
        this.send(addr, index + 1, code);
        return this;
      }
    },

    /**
     * led or setLed Set the memory of a single Led.
     *
     * @param {Number} addr Address of Led
     * @param {Number} row Row number of Led (0-7)
     * @param {Number} column Column number of Led (0-7)
     * @param {Boolean} state [ true: on, false: off ] [ 1, 0 ]
     *
     */
    led: {
      writable: true,
      value(addr, row, col, state) {
        let offset;
        let val;

        if (arguments.length === 3) {
          state = col;
          col = row;
          row = addr;
          this.each(function(device) {
            this.led(device, row, col, state);
          });
        } else {
          offset = addr * this.columns;
          val = 0x80 >> col;

          if (state) {
            this.memory[offset + row] = this.memory[offset + row] | val;
          } else {
            val = ~val;
            this.memory[offset + row] = this.memory[offset + row] & val;
          }
          this.send(addr, row + 1, this.memory[offset + row]);
        }

        return this;
      }
    },

    /**
     * row Update an entire row with an 8 bit value
     * @param  {Number} addr Device address
     * @param  {Number} row  0 indexed row number 0-7
     * @param  {Number} val  8-bit value 0-255
     * @return {LedControl}
     */
    row: {
      writable: true,
      value(addr, row, val /* 0 - 255 or string */) {
        if (!this.isMatrix) {
          throw new Error("The `row` method is only supported for Matrix devices");
        }
        let offset;
        if (typeof val === "string") {
          val = parseInt(val, 2);
        }
        if (arguments.length === 2) {
          val = row;
          row = addr;
          this.each(function(device) {
            this.row(device, row, val);
          });
        } else {
          offset = addr * this.columns;
          this.memory[offset + row] = val;
          this.send(addr, row + 1, this.memory[offset + row]);
        }

        return this;
      }
    },
    /*
     * scanLimit (function from interface)
     * @param {Number} addr Address of Led device
     * @param {Number} limit
     */
    scanLimit: {
      writable: true,
      value(addr, limit) {
        if (arguments.length === 1) {
          limit = addr;
          this.each(function(device) {
            this.scanLimit(device, limit);
          });
        } else {
          this.send(addr, LedControl.OP.SCANLIMIT, limit);
        }
        return this;
      }
    },
    send: {
      writable: true,
      value(addr, opcode, data) {
        if (arguments.length !== 3) {
          throw new Error("`send` expects three arguments: device, opcode, data");
        }
        const offset = addr * 2;
        const maxBytes = this.devices * 2;
        const spiData = [];

        if (addr < this.devices) {
          for (let i = 0; i < maxBytes; i++) {
            spiData[i] = 0;
          }

          spiData[offset + 1] = opcode;
          spiData[offset] = data;

          this.io.digitalWrite(this.pins.cs, this.io.LOW);

          for (let j = maxBytes; j > 0; j--) {
            this.board.shiftOut(this.pins.data, this.pins.clock, spiData[j - 1]);
          }

          this.io.digitalWrite(this.pins.cs, this.io.HIGH);
        }

        return this;
      }
    }
  }
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

LedControl.COLORS = {
  RED: 1,
  YELLOW: 2,
  GREEN: 3
};

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

// Double Digit Numbers
//
// Each digit:
//
// - is drawn as far to the left as possible.
// - uses 3 bits
//
const digits = [
  [0xe0, 0xa0, 0xa0, 0xa0, 0xa0, 0xa0, 0xe0, 0x00],
  [0x40, 0xc0, 0x40, 0x40, 0x40, 0x40, 0xe0, 0x00],
  [0xe0, 0x20, 0x20, 0xe0, 0x80, 0x80, 0xe0, 0x00],
  [0xe0, 0x20, 0x20, 0x60, 0x20, 0x20, 0xe0, 0x00],
  [0x20, 0x60, 0xa0, 0xe0, 0x20, 0x20, 0x20, 0x00],
  [0xe0, 0x80, 0x80, 0xe0, 0x20, 0x20, 0xe0, 0x00],
  [0xe0, 0x80, 0x80, 0xe0, 0xa0, 0xa0, 0xe0, 0x00],
  [0xe0, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x00],
  [0xe0, 0xa0, 0xa0, 0x40, 0xa0, 0xa0, 0xe0, 0x00],
  [0xe0, 0xa0, 0xa0, 0xe0, 0x20, 0x20, 0xe0, 0x00],
];

let charName = "";

for (let i = 0; i < 10; i++) {
  for (let k = 0; k < 10; k++) {
    charName = `${i}${k}`;
    ledCharacters.MATRIX_CHARS[charName] = [];

    for (let j = 0; j < 8; j++) {
      // Left digit takes 3 bits, plus 1 to between digits = 4 bits to the right.
      ledCharacters.MATRIX_CHARS[charName][j] = digits[i][j] | (digits[k][j] >>> 4);
    }
  }
}

LedControl.MATRIX_DIMENSIONS = {
  "16x8": {
    rows: 16,
    columns: 8
  },
  "8x16": {
    rows: 8,
    columns: 16
  },
  "8x8": {
    rows: 8,
    columns: 8
  }
};

LedControl.MATRIX_CHARS = ledCharacters.MATRIX_CHARS;
LedControl.DIGIT_CHARS = ledCharacters.DIGIT_CHARS;

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  LedControl.Controllers = Controllers;
  LedControl.purge = () => {
    addresses = new Set([0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77]);
    priv.clear();
  };
}
module.exports = LedControl;
