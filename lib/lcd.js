var Board = require("../lib/board.js"),
  Pin = require("../lib/pin.js"),
  Emitter = require("events").EventEmitter,
  util = require("util"),
  __ = require("../lib/fn.js"),
  lcdCharacters = require("../lib/lcd-chars.js"),
  converter = require("color-convert")();

var priv = new Map();

/**
 * This atrocitity is unfortunately necessary.
 * If any other approach can be found, patches
 * will gratefully be accepted.
 */
function sleep(ms) {
  var start = Date.now();
  while (Date.now() < start + ms) {}
}



// const-caps throughout serve to indicate the
// "const-ness" of the binding to the reader
// and nothing more.

var OPS = {
  DEFAULT: {
    CLEARDISPLAY: 0x01,
    RETURNHOME: 0x02,
    ENTRYMODESET: 0x04,
    DISPLAYCONTROL: 0x08,
    CURSORSHIFT: 0x10,

    // Command And Control
    FUNCTIONSET: 0x20,
    DATA: 0x40,
    COMMAND: 0x80,

    // flags for display entry mode
    ENTRYRIGHT: 0x00,
    ENTRYLEFT: 0x02,
    ENTRYSHIFTINCREMENT: 0x01,
    ENTRYSHIFTDECREMENT: 0x00,

    // flags for display on/off control
    DISPLAYON: 0x04,
    DISPLAYOFF: 0x00,
    CURSORON: 0x02,
    CURSOROFF: 0x00,
    BLINKON: 0x01,
    BLINKOFF: 0x00,

    // flags for display/cursor shift
    DISPLAYMOVE: 0x08,
    CURSORMOVE: 0x00,
    MOVERIGHT: 0x04,
    MOVELEFT: 0x00,

    // flags for function set
    BITMODE: {
      4: 0x00,
      8: 0x10,
    },

    LINE: {
      1: 0x00,
      2: 0x08
    },

    DOTS: {
      "5x10": 0x04,
      "5x8": 0x00
    },

    // flags for backlight control
    BACKLIGHT: {
      ON: 0x08,
      OFF: 0x00
    },

    MEMORYLIMIT: 0x08,

    // Control
    // Enable
    EN: 0x04,
    // Read/Write
    RW: 0x02,
    // Register Select
    RS: 0x01,
  }
};

var Controllers = {
  JHD1313M1: {

    OP: {
      value: OPS.DEFAULT,
    },
    CHARS: {
      value: lcdCharacters.DEFAULT,
    },
    initialize: {
      value: function(opts) {

        this.io.sendI2CConfig();

        this.lines = opts.lines || 2;
        this.rows = opts.rows || 2;
        this.cols = opts.cols || 16;
        this.dots = opts.dots || "5x8";

        // LCD: 0x3E
        // RGB: 0x62
        this.address = {
          lcd: opts.address || 0x3E,
          rgb: 0x62
        };

        var display = this.OP.DISPLAYCONTROL | this.OP.DISPLAYON | this.OP.CURSOROFF | this.OP.BLINKOFF;

        var state = {
          display: display,
          characters: {},
          index: this.OP.MEMORYLIMIT - 1
        };

        priv.set(this, state);

        // Operations within the following labelled block are init-only,
        // but _do_ block the process negligible number of milliseconds.
        blocking: {
          // Copied from Grove Studio lib.
          // SEE PAGE 45/46 FOR INITIALIZATION SPECIFICATION!
          // according to datasheet, we need at least 40ms after
          // power rises above 2.7V before sending commands.
          // Arduino can turn on way befer 4.5V so we'll wait 50

          var lines = this.OP.FUNCTIONSET | this.OP.LINE[2];

          sleep(50);
          this.command(lines);
          sleep(5);
          this.command(lines);
          this.command(lines);
          this.command(lines);
          sleep(5);

          this.command(
            this.OP.ENTRYMODESET |
            this.OP.ENTRYLEFT |
            this.OP.ENTRYSHIFTDECREMENT
          );

          this.display();
          this.clear();
          this.home();
        }

        // Backlight initialization
        this.io.sendI2CWriteRequest(this.address.rgb, [ 0, 0 ]);
        this.io.sendI2CWriteRequest(this.address.rgb, [ 1, 0 ]);
        this.io.sendI2CWriteRequest(this.address.rgb, [ 0x08, 0xAA ]);

        this.bgColor(opts.color || "white");
      },
    },
    clear: {
      value: function() {
        return this.command(this.OP.CLEARDISPLAY);
      }
    },
    setCursor: {
      value: function(col, row) {
        return this.command(row === 0 ? col | 0x80 : col | 0xc0);
      }
    },
    bgColor: {
      value: function(r, g, b) {
        var rgb = [r, g, b];
        if (arguments.length === 1 && typeof r === "string") {
          rgb = converter.keyword(r).rgb();
        }

        [0x04, 0x03, 0x02].forEach(function(cmd, i) {
          this.io.sendI2CWriteRequest(this.address.rgb, [ cmd, rgb[i] ]);
        }, this);

        return this;
      }
    },
    hilo: {
      value: function(callback) {
        callback.call(this);
      }
    },
    command: {
      value: function(op, command) {
        if (arguments.length === 1) {
          command = op;
          op = this.OP.COMMAND;
        }

        this.io.sendI2CWriteRequest(this.address.lcd, [ op, command ]);
        return this;
      }
    },
    sendByte: {
      value: function(byte) {
        this.io.sendI2CWriteRequest(this.address.lcd, [ 0x40, byte ]);
        return this;
      }
    },
  },
  PARALLEL: {
    OP: {
      value: OPS.DEFAULT,
    },
    CHARS: {
      value: lcdCharacters.DEFAULT,
    },
    initialize: {
      value: function(opts) {

        this.bitMode = opts.bitMode || 4;
        this.lines = opts.lines || 2;
        this.rows = opts.rows || 2;
        this.cols = opts.cols || 16;
        this.dots = opts.dots || "5x8";

        if (Array.isArray(opts.pins)) {
          this.pins = {
            rs: opts.pins[0],
            en: opts.pins[1],
            // TODO: Move to device map profile
            data: [
              opts.pins[5],
              opts.pins[4],
              opts.pins[3],
              opts.pins[2]
            ]
          };
        } else {
          this.pins = opts.pins;
        }

        var display = this.OP.DISPLAYCONTROL | this.OP.DISPLAYON;
        var state = {
          display: display,
          characters: {},
          index: this.OP.MEMORYLIMIT - 1
        };

        priv.set(this, state);

        opts.pins.forEach(function(pin) {
          this.io.pinMode(pin, 1);
        }, this);

        this.io.digitalWrite(this.pins.rs, this.io.LOW);
        this.io.digitalWrite(this.pins.en, this.io.LOW);

        if (opts.backlight) {
          this.backlight = new Pin({
            pin: opts.backlight,
            board: this.board
          });
          this.backlight.high();
        }

        // Operations within the following labelled block are init-only,
        // but _do_ block the process negligible number of milliseconds.
        blocking: {
          // Send 0011 thrice to make sure LCD
          // is initialized properly
          this.command(0x03);
          sleep(4);
          this.command(0x03);
          sleep(4);
          this.command(0x03);

          // Switch to 4-bit mode
            if (this.bitMode === 4) {
            this.command(0x02);
          }

          // Set number of lines and dots
          // TODO: Move to device map profile
          this.command(
            this.OP.FUNCTIONSET |
            this.OP.LINE[this.lines] |
            this.OP.DOTS[this.dots]
          );

          // Clear display and turn it on
          this.command(display);
          this.clear();
          this.home();
        }

        process.nextTick(function() {
          this.emit("ready");
        }.bind(this));
      }
    }
  }
};


// Alias controllers
Controllers.QAPASS = Controllers.HD44780 = Controllers.JHD1313M1;


/**
 * LCD
 * @param {[type]} opts [description]
 */

function LCD(opts) {

  if (!(this instanceof LCD)) {
    return new LCD(opts);
  }

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  var controller;

  if (opts.controller) {
    controller = typeof opts.controller === "string" ?
      Controllers[opts.controller.toUpperCase()] :
      opts.controller;
  }

  if (!controller) {
    controller = Controllers.PARALLEL;
  }

  Object.defineProperties(this, controller);

  if (this.initialize) {
    this.initialize(opts);
  }
}

util.inherits(LCD, Emitter);


LCD.prototype.hilo = function(callback) {
  // RS High for write mode
  this.io.digitalWrite(this.pins.rs, this.io.HIGH);

  callback.call(this);

  // RS Low for command mode
  this.io.digitalWrite(this.pins.rs, this.io.LOW);
};

LCD.prototype.pulse = function() {
  ["LOW", "HIGH", "LOW"].forEach(function(val, i) {
    this.io.digitalWrite(this.pins.en, this.io[val]);
  }, this);

  return this;
};


LCD.prototype.sendByte = function(value) {
  var pin, mask;

  pin = 0;
  mask = {
    4: 8,
    8: 128
  }[this.bitMode];

  for (; mask > 0; mask = mask >> 1) {
    this.io.digitalWrite(
      this.pins.data[pin],
      this.io[value & mask ? "HIGH" : "LOW"]
    );
    pin++;
  }

  this.pulse();

  return this;
};


LCD.prototype.command = function(type, byte) {

  if (typeof byte === "undefined") {
    byte = type;
    type = 0x80;
  }

  if (this.bitMode === 4) {
    this.sendByte(byte >> 4);
  }

  this.sendByte(byte);

  return this;
};

var RE_SPECIALS = /:(\w+):/g;

LCD.prototype.print = function(message, opts) {
  var state, dontProcessSpecials, hasCharacters, processed;

  message = message + "";
  opts = opts || {};

  state = priv.get(this);
  dontProcessSpecials = opts.dontProcessSpecials || false;
  hasCharacters = !dontProcessSpecials && RE_SPECIALS.test(message);

  if (message.length === 1) {
    this.hilo(function() {
      this.command(0x40, message.charCodeAt(0));
    });
  } else {

    if (hasCharacters) {
      processed = message.replace(RE_SPECIALS, function(match, name) {
        var address = state.characters[name];

        return typeof address === "number" ? String.fromCharCode(address) : match;
      });

      this.print(processed, {
        dontProcessSpecials: true
      });
    } else {
      this.hilo(function() {
        var k = 0;
        var chars = Array.from(message);
        var char;

        while ((char = chars[k++])) {
          this.command(0x40, char.charCodeAt(0));
        }
      });
    }
  }

  return this;
};

LCD.prototype.write = function(charCode) {
  this.hilo.call(this, function() {
    this.command(0x40, charCode);
  });

  return this;
};

LCD.prototype.clear = function() {
  this.command(this.OP.CLEARDISPLAY);

  return this;
};

LCD.prototype.home = function() {
  this.command(this.OP.RETURNHOME);
  sleep(2); // Command can be slow

  return this;
};

LCD.prototype.setCursor = function(col, row) {
  var rowOffsets = [0x00, 0x40, 0x14, 0x54];
  this.command(this.OP.COMMAND | (col + rowOffsets[row]));

  return this;
};

LCD.prototype.display = function() {
  var state = priv.get(this);

  if (this.backlight) {
    this.backlight.high();
  }

  state.display |= this.OP.DISPLAYON;
  this.command(state.display);

  return this;
};

LCD.prototype.noDisplay = function() {
  var state = priv.get(this);

  if (this.backlight) {
    this.backlight.low();
  }

  state.display &= ~this.OP.DISPLAYON;
  this.command(state.display);

  return this;
};

LCD.prototype.cursor = function(row, col) {
  // When provided with col & row, cursor will behave like setCursor,
  // except that it has row and col in the order that most people
  // intuitively expect it to be in.
  if (typeof col !== "undefined" && typeof row !== "undefined") {
    return this.setCursor(col, row);
  }
  var state = priv.get(this);

  state.display |= this.OP.CURSORON;
  this.command(state.display);

  return this;
};

LCD.prototype.noCursor = function() {
  var state = priv.get(this);

  state.display &= ~this.OP.CURSORON;
  this.command(state.display);

  return this;
};

LCD.prototype.blink = function() {
  var state = priv.get(this);

  state.display |= this.OP.BLINKON;
  this.command(state.display);

  return this;
};

LCD.prototype.noBlink = function() {
  var state = priv.get(this);

  state.display &= ~this.OP.BLINKON;
  this.command(state.display);

  return this;
};

LCD.prototype.autoscroll = function() {
  var state = priv.get(this);

  state.display |= this.OP.ENTRYSHIFTINCREMENT;
  this.command(this.OP.ENTRYMODESET | state.display);

  return this;
};

LCD.prototype.noAutoscroll = function() {
  var state = priv.get(this);

  state.display &= ~this.OP.ENTRYSHIFTINCREMENT;
  this.command(this.OP.ENTRYMODESET | state.display);

  return this;
};

LCD.prototype.createChar = function(name, charMap) {
  // Ensure location is never above 7
  var state, address;
  state = priv.get(this);

  if (typeof name === "number") {
    address = name & 0x07;
  } else {
    address = state.index;
    state.index--;
    if (state.index === -1) {
      state.index = this.OP.MEMORYLIMIT - 1;
    }
  }

  this.command(this.OP.DATA | (address << 3));

  this.hilo.call(this, function() {
    var i;
    for (i = 0; i < 8; i++) {
      this.command(0x40, charMap[i]);
    }
  });

  // Fill in address
  state.characters[name] = address;

  return address;
};


LCD.prototype.useChar = function(name) {
  var state;

  // Derive the current private state cache
  state = priv.get(this);

  if (!state.characters[name]) {
    // Create the character in LCD memory and
    // Add character to current LCD character map
    state.characters[name] = this.createChar(name, this.CHARS[name]);
  }

  return this;
};


/**
 *

TODO:


burst()

scrollDisplayLeft()
scrollDisplayRight()

leftToRight()
rightToLeft()


*/

module.exports = LCD;
