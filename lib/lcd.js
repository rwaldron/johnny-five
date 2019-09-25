var Board = require("./board");
var Pin = require("./pin");
var lcdCharacters = require("./lcd-chars");
var RGB = require("./led/rgb");

const priv = new Map();

/**
 * This atrocity is unfortunately necessary.
 * If any other approach can be found, patches
 * will gratefully be accepted.
 */
function sleepus(usDelay) {
  const startTime = process.hrtime();
  let deltaTime;
  let usWaited = 0;

  while (usDelay > usWaited) {
    deltaTime = process.hrtime(startTime);
    usWaited = (deltaTime[0] * 1E9 + deltaTime[1]) / 1000;
  }
}

/**
 * This atrocity is unfortunately necessary.
 * If any other approach can be found, patches
 * will gratefully be accepted.
 */
function sleep(ms) {
  sleepus(ms * 1000);
}


// TODO:  Migrate this to the new codified Expander class.
//
// - add portMode to PCF8574 controller
// - add portWrite to PCF8574 controller
//
//
// TODO:  Investigate adding the above methods to
//        all expander controllers.
//
class Expander {
  constructor(address, io) {
    this.address = address;
    this.mask = 0xFF;
    this.memory = 0x00;
    this.io = io;
  }

  pinMode(pin, dir) {
    if (dir === 0x01) {
      this.mask &= ~(1 << pin);
    } else {
      this.mask |= 1 << pin;
    }
  }

  portMode(dir) {
    this.mask = dir === 0x00 ? 0xFF : 0x00;
  }

  portWrite(value) {
    this.memory = value & ~(this.mask);
    this.io.i2cWrite(this.address, this.memory);
  }
}




// const-caps throughout serve to indicate the
// "const-ness" of the binding to the reader
// and nothing more.

const REGISTER = {
  DEFAULT: {
    SHIFT_LEFT: 0x04,

    CLEAR: 0x01,
    HOME: 0x02,
    ENTRY: 0x04,
    DISPLAY: 0x08,
    DIMENSIONS: 0x20,
    CURSORSHIFT: 0x10,

    SETCGRAMADDR: 0x40,
    SETDDRAMADDR: 0x80,

    // Command And Control

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
    BACKLIGHT_ON: 0x08,
    BACKLIGHT_OFF: 0x00,

    MEMORYLIMIT: 0x08,

    // Control
    // Enable
    EN: 0x04,
    // Read/Write
    RW: 0x02,
    // Register Select
    RS: 0x01,

    // DATA
    D4: 0x04,
    D5: 0x05,
    D6: 0x06,
    D7: 0x07,
  }
};

const Controllers = {
  JHD1313M1: {
    REGISTER: {
      value: REGISTER.DEFAULT,
    },
    CHARS: {
      value: lcdCharacters.DEFAULT,
    },
    initialize: {
      value(options) {

        // LCD: 0x3E
        // RGB: 0x62
        this.address = {
          lcd: options.address || 0x3E,
          rgb: 0x62
        };

        options.address = this.address;

        this.io.i2cConfig(options);

        this.lines = options.lines || 2;
        this.rows = options.rows || 2;
        this.cols = options.cols || 16;
        this.dots = options.dots || "5x8";


        const display = this.REGISTER.DISPLAY | this.REGISTER.DISPLAYON | this.REGISTER.CURSOROFF | this.REGISTER.BLINKOFF;

        const state = {
          display,
          characters: {},
          index: this.REGISTER.MEMORYLIMIT - 1,
          backlight: {
            polarity: 1,
            pin: null,
            value: null
          }
        };

        priv.set(this, state);

        // Operations within the following labelled block are init-only,
        // but _do_ block the process negligible number of milliseconds.
        blocking: {
          const lines = this.REGISTER.DIMENSIONS | this.REGISTER.LINE[2];
          // Copied from Grove Studio lib.
          // SEE PAGE 45/46 FOR INITIALIZATION SPECIFICATION!
          // according to datasheet, we need at least 40ms after
          // power rises above 2.7V before sending commands.
          // Arduino can turn on way before 4.5V so we'll wait 50



          sleep(50);
          this.command(lines);
          sleep(5);
          this.command(lines);
          this.command(lines);
          this.command(lines);
          sleep(5);

          this.command(
            this.REGISTER.ENTRY |
            this.REGISTER.ENTRYLEFT |
            this.REGISTER.ENTRYSHIFTDECREMENT
          );

          this.on();
          this.clear();
          this.home();
        }

        // Backlight initialization



        this.bgOn();

        if (options.color) {
          this.bgColor(options.color);
        } else {
          this.bgColor("black");
        }
      },
    },
    clear: {
      value() {
        return this.command(this.REGISTER.CLEAR);
      }
    },
    setCursor: {
      value(col, row) {
        return this.command(row === 0 ? col | 0x80 : col | 0xc0);
      }
    },
    autoscroll: {
      value() {
        const state = priv.get(this);

        state.display = this.REGISTER.ENTRYLEFT | this.REGISTER.ENTRYSHIFTINCREMENT;
        this.command(this.REGISTER.ENTRY | state.display);

        return this;
      }
    },
    bgColor: {
      value(red, green, blue) {
        const rgb = RGB.ToRGB(red, green, blue);
        const address = this.address.rgb;

        this.io.i2cWrite(address, [0x00, 0]);
        this.io.i2cWrite(address, [0x01, 0]);

        // TRY THIS IN ONE CALL!
        this.io.i2cWrite(address, [0x04, rgb.red]);
        this.io.i2cWrite(address, [0x03, rgb.green]);
        this.io.i2cWrite(address, [0x02, rgb.blue]);

        return this;
      }
    },
    bgOn: {
      value() {
        this.io.i2cWrite(this.address.rgb, [this.REGISTER.BACKLIGHT_ON, 0xAA]);
        return this;
      }
    },
    bgOff: {
      value() {
        this.io.i2cWrite(this.address.rgb, [this.REGISTER.BACKLIGHT_ON, 0x00]);
        return this;
      }
    },
    command: {
      value(mode, value) {
        if (arguments.length === 1) {
          value = mode;
          mode = this.REGISTER.COMMAND;
        }

        if (mode === this.REGISTER.DATA) {
          return this.send(value);
        }

        return this.writeBits(this.REGISTER.COMMAND, value);
      }
    },
    send: {
      value(value) {
        return this.writeBits(this.REGISTER.DATA, value);
      }
    },
    writeBits: {
      value(mode, value) {
        this.io.i2cWrite(this.address.lcd, [mode, value]);
        return this;
      }
    },
    hilo: {
      value(callback) {
        callback.call(this);
      }
    },
  },


  PCF8574: {

    REGISTER: {
      value: Object.assign({}, REGISTER.DEFAULT, {
        COMMAND: 0x00,
        DATA: 0x01,
        BACKLIGHT_ON: 0xFF,
        BACKLIGHT_OFF: 0X00
      }),
    },
    CHARS: {
      value: lcdCharacters.DEFAULT,
    },
    initialize: {
      value(options) {

        this.bitMode = options.bitMode || 4;
        this.lines = options.lines || 2;
        this.rows = options.rows || 2;
        this.cols = options.cols || 16;
        this.dots = options.dots || "5x8";

        if (!options.address) {
          options.address = ["PCF8574A", "PCF8574AT"].includes(options.controller) ?
            0x3F : 0x27;

          /*
            | A2 | A1 | A0 | PCF8574(T) | PCF8574A(T) |
            |----|----|----|---------|----------|
            | L  | L  | L  | 0x20    | 0x38     |
            | L  | L  | H  | 0x21    | 0x39     |
            | L  | H  | L  | 0x22    | 0x3A     |
            | L  | H  | H  | 0x23    | 0x3B     |
            | H  | L  | L  | 0x24    | 0x3C     |
            | H  | L  | H  | 0x25    | 0x3D     |
            | H  | H  | L  | 0x26    | 0x3E     |
            | H  | H  | H  | 0x27    | 0x3F     |

            TODO: move to API docs
           */
        }

        this.io.i2cConfig(options);

        this.address = {
          lcd: options.address
        };

        // Ported from https://bitbucket.org/fmalpartida/new-liquidcrystal
        this.expander = new Expander(this.address.lcd, this.io);
        this.expander.portMode(this.io.MODES.OUTPUT);
        this.expander.portWrite(0);

        const backlight = options.backlight || {
          polarity: 0,
          pin: 3
        };

        backlight.pin = typeof backlight.pin === "undefined" ? 3 : backlight.pin;
        backlight.polarity = typeof backlight.polarity === "undefined" ? 0 : backlight.polarity;

        const dimensions = this.REGISTER.BITMODE[this.bitMode] |
          this.REGISTER.LINE[this.lines] |
          this.REGISTER.DOTS[this.dots];

        const display = this.REGISTER.DISPLAY |
          this.REGISTER.DISPLAYON |
          this.REGISTER.CURSOROFF |
          this.REGISTER.BLINKOFF;

        const entry = this.REGISTER.ENTRYLEFT |
          this.REGISTER.ENTRYSHIFTDECREMENT;


        const state = {
          display,
          characters: {},
          index: this.REGISTER.MEMORYLIMIT - 1,
          backlight: {
            polarity: backlight.polarity,
            pinMask: 1 << backlight.pin,
            statusMask: 0x00
          },
          data: [
            1 << this.REGISTER.D4,
            1 << this.REGISTER.D5,
            1 << this.REGISTER.D6,
            1 << this.REGISTER.D7
          ]
        };

        priv.set(this, state);

        let toggle = 0x03 << this.REGISTER.SHIFT_LEFT;

        // Operations within the following labelled block are init-only,
        // but _do_ block the process for negligible number of milliseconds.
        blocking: {
          //
          // Toggle write/pulse to reset the LCD component.
          //
          this.expander.portWrite(toggle);
          this.pulse(toggle);
          sleep(4);

          this.expander.portWrite(toggle);
          this.pulse(toggle);
          sleep(4);

          this.expander.portWrite(toggle);
          this.pulse(toggle);

          toggle = 0x02 << this.REGISTER.SHIFT_LEFT;

          this.expander.portWrite(toggle);
          this.pulse(toggle);

          // Initialize the reset component
          this.command(this.REGISTER.DIMENSIONS | dimensions);

          // Set display details
          this.command(state.display);

          // Now that the initial display is set,
          // overwrite with the "entry" bits
          state.display = entry;

          this.command(this.REGISTER.ENTRY | state.display);

          this.on();
          this.clear();
          this.backlight();
        }
      },
    },
    clear: {
      value() {
        this.command(this.REGISTER.CLEAR);
        sleep(2);
        return this;

      }
    },
    backlight: {
      value(value) {
        const state = priv.get(this);
        let mask;

        value = typeof value === "undefined" ? 255 : value;

        if (state.backlight.pinMask !== 0x00) {
          if ((state.backlight.polarity === 0 && value > 0) ||
            (state.backlight.polarity === 1 && value === 0)) {

            mask = 0xFF;
          } else {
            mask = 0x00;
          }

          state.backlight.statusMask = state.backlight.pinMask & mask;

          this.expander.portWrite(state.backlight.statusMask);
        }

        return this;
      }
    },

    createChar: {
      value(name, charMap) {
        const state = priv.get(this);
        let address;

        if (typeof name === "number") {
          address = name & 0x07;
        } else {
          address = state.index;
          state.index--;
          if (state.index === -1) {
            state.index = this.REGISTER.MEMORYLIMIT - 1;
          }
        }

        this.command(this.REGISTER.SETCGRAMADDR | (address << 3));

        blocking: {
          sleep(1);

          for (let i = 0; i < 8; i++) {
            this.command(this.REGISTER.DATA, charMap[i]);
            sleep(1);
          }
        }

        state.characters[name] = address;

        return address;
      }
    },
    noBacklight: {
      value() {
        this.backlight(0);
      }
    },
    on: {
      value() {
        const state = priv.get(this);

        state.display |= this.REGISTER.DISPLAYON;
        this.command(this.REGISTER.DISPLAY | state.display);

        return this;
      }
    },
    off: {
      value() {
        const state = priv.get(this);

        state.display &= ~this.REGISTER.DISPLAYON;
        this.command(this.REGISTER.DISPLAY | state.display);

        return this;
      }
    },
    hilo: {
      value(callback) {
        callback.call(this);
      }
    },
    command: {
      value(mode, value) {

        if (arguments.length === 1) {
          value = mode;
          mode = this.REGISTER.COMMAND;
        }

        this.send(mode, value);

        return this;
      }
    },
    send: {
      writable: true,
      value(mode, value) {

        this.writeBits(mode, value >> 4);
        this.writeBits(mode, value & 0x0F);

        return this;
      }
    },
    writeBits: {
      writable: true,
      value(mode, value) {
        const state = priv.get(this);
        let pinMapValue = 0;

        for (let i = 0; i < 4; i++) {
          if ((value & 0x01) === 1) {
            pinMapValue |= state.data[i];
          }
          value = (value >> 1);
        }

        if (mode === this.REGISTER.DATA) {
          mode = this.REGISTER.RS;
        }

        pinMapValue |= mode | state.backlight.statusMask;

        this.pulse(pinMapValue);
        return this;
      }
    },
    pulse: {
      writable: true,
      value(data) {
        this.expander.portWrite(data | this.REGISTER.EN); // En HIGH
        this.expander.portWrite(data & ~this.REGISTER.EN); // En LOW
      }
    }
  },


  PARALLEL: {
    REGISTER: {
      value: REGISTER.DEFAULT,
    },
    CHARS: {
      value: lcdCharacters.DEFAULT,
    },
    initialize: {
      value(options) {

        this.bitMode = options.bitMode || 4;
        this.lines = options.lines || 2;
        this.rows = options.rows || 2;
        this.cols = options.cols || 16;
        this.dots = options.dots || "5x8";

        if (Array.isArray(options.pins)) {
          this.pins = {
            rs: options.pins[0],
            en: options.pins[1],
            // TODO: Move to device map profile
            data: [
              options.pins[5],
              options.pins[4],
              options.pins[3],
              options.pins[2]
            ]
          };
        } else {
          this.pins = options.pins;
        }

        const display = this.REGISTER.DISPLAY | this.REGISTER.DISPLAYON;
        const state = {
          display,
          characters: {},
          index: this.REGISTER.MEMORYLIMIT - 1,
          backlight: {
            polarity: 1,
            pin: null,
            value: null
          }
        };

        priv.set(this, state);

        options.pins.forEach(function(pin) {
          this.io.pinMode(pin, 1);
        }, this);

        this.io.digitalWrite(this.pins.rs, this.io.LOW);
        this.io.digitalWrite(this.pins.en, this.io.LOW);

        if (options.backlight) {
          if (typeof options.backlight === "number") {
            const temp = options.backlight;
            options.backlight = {
              pin: temp
            };
          }

          if (options.backlight.pin) {
            state.backlight.pin = new Pin({
              pin: options.backlight.pin,
              board: this.board
            });

            state.backlight.pin.high();
          }
        }

        // Operations within the following labelled block are init-only,
        // but _do_ block the process negligible number of milliseconds.
        blocking: {
          // Send 0b00000011 thrice to make sure LCD
          // is initialized properly
          this.command(0x03);
          sleep(4);
          this.command(0x03);
          sleep(4);
          this.command(0x03);

          // Switch to 4-bit mode
          if (this.bitMode === 4) {
            // this.REGISTER.DIMENSIONS |
            this.command(0x02);
          }

          // Set number of lines and dots
          // TODO: Move to device map profile
          this.command(
            this.REGISTER.LINE[this.lines] |
            this.REGISTER.DOTS[this.dots]
          );

          // Clear display and turn it on
          this.command(display);
          this.clear();
          this.home();
        }
      }
    }
  }
};

// Alias controllers
Controllers.LCM1602 = Controllers.LCD1602 = Controllers.LCM1602IIC = Controllers.LCD2004 = Controllers.PCF8574A = Controllers.PCF8574AT = Controllers.PCF8574T = Controllers.PCF8574;

Controllers.MJKDZ = Object.assign({}, Controllers.PCF8574, {
  REGISTER: {
    value: Object.assign({}, REGISTER.DEFAULT, {
      SHIFT_LEFT: 0x00,

      COMMAND: 0x00,
      DATA: 0x06,

      // Control
      // Enable
      EN: 0x10,
      // Read/Write
      RW: 0x05,
      // Register Select
      RS: 0x06,

      D4: 0x00,
      D5: 0x01,
      D6: 0x02,
      D7: 0x03
    })
  },
  writeBits: {
    writable: true,
    value(mode, value) {
      const state = priv.get(this);
      let pinMapValue = 0;

      for (let i = 0; i < 4; i++) {
        if ((value & 0x01) === 1) {
          pinMapValue |= state.data[i];
        }
        value = (value >> 1);
      }

      if (mode === this.REGISTER.DATA) {
        mode = (1 << this.REGISTER.RS);
      }

      pinMapValue |= mode | state.backlight.statusMask;

      this.pulse(pinMapValue);
      return this;
    }
  },
});


Controllers.DEFAULT = Controllers.PARALLEL;

/**
 * LCD
 * @param {[type]} options [description]
 */

class LCD {
  constructor(options) {

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(this, Controllers, options);

    this.ctype = options.controller;

    if (this.initialize) {
      this.initialize(options);
    }

    Object.defineProperties(this, {
      characters: {
        get() {
          return Object.assign({}, priv.get(this).characters);
        },
      },
    });
  }

  command(mode, value) {
    if (typeof value === "undefined") {
      value = mode;
      mode = 0x80;
    }

    if (this.bitMode === 4) {
      this.send(value >> 4);
    }

    this.send(value);

    return this;
  }

  send(value) {
    let pin = 0;
    let mask = {
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

    // At VCC = 3.3V, the minimum enable pulse width is specified as 450
    // nanoseconds on page 49 of the HD44780 datasheet.
    // We therefore wait for 1 microsecond here to ensure that fast IO plugins
    // like Pi-IO generate an enable pulse that's wide enough.
    this.io.digitalWrite(this.pins.en, this.io.LOW);
    this.io.digitalWrite(this.pins.en, this.io.HIGH);
    sleepus(1);
    this.io.digitalWrite(this.pins.en, this.io.LOW);

    // The execution time for the vast majority of instructions is at least
    // 37 microseconds. See datasheet pages 24 and 25.
    // It's important to wait 37 microseconds here to prevent fast IO plugins
    // like Pi-IO from executing the next instruction before the current
    // instruction has completed.
    sleepus(37);

    return this;
  }

  hilo(callback) {
    // RS High for write mode
    this.io.digitalWrite(this.pins.rs, this.io.HIGH);

    callback.call(this);

    // RS Low for command mode
    this.io.digitalWrite(this.pins.rs, this.io.LOW);
  }

  print(message, options) {
    let state;
    let dontProcessSpecials;
    let hasCharacters;
    let processed;

    message = `${message}`;
    options = options || {};

    state = priv.get(this);
    dontProcessSpecials = options.dontProcessSpecials || false;
    hasCharacters = !dontProcessSpecials && RE_SPECIALS.test(message);

    if (message.length === 1) {
      this.hilo(function() {
        this.command(this.REGISTER.DATA, message.charCodeAt(0));
      });
    } else {

      if (hasCharacters) {
        processed = message.replace(RE_SPECIALS, (match, name) => {
          const address = state.characters[name];

          return typeof address === "number" ? String.fromCharCode(address) : match;
        });

        this.print(processed, {
          dontProcessSpecials: true
        });
      } else {
        this.hilo(function() {
          Array.from(message).forEach(function(character) {
            this.command(this.REGISTER.DATA, character.charCodeAt(0));
          }, this);
        });
      }
    }

    return this;
  }

  write(charCode) {
    this.hilo.call(this, function() {
      this.command(this.REGISTER.DATA, charCode);
    });

    return this;
  }

  clear() {
    this.command(this.REGISTER.CLEAR);
    sleep(2);
    return this;
  }

  home() {
    this.command(this.REGISTER.HOME);
    sleep(2);
    return this;
  }

  setCursor(col, row) {
    const rowOffsets = [0x00, 0x40, 0x14, 0x54];
    this.command(this.REGISTER.SETDDRAMADDR | (col + rowOffsets[row]));
    return this;
  }

  backlight(highOrLow) {
    const state = priv.get(this);

    highOrLow = typeof highOrLow === "undefined" ? true : false;

    if (state.backlight.pin instanceof Pin) {
      if (highOrLow) {
        state.backlight.pin.high();
      } else {
        state.backlight.pin.low();
      }
    }

    if (highOrLow) {
      state.display |= this.REGISTER.DISPLAYON;
    } else {
      state.display &= ~this.REGISTER.DISPLAYON;
    }

    this.command(state.display);

    return this;
  }

  noBacklight() {
    const state = priv.get(this);

    if (state.backlight.pin instanceof Pin) {
      state.backlight.pin.high();
    }

    // if (highOrLow) {
    //   state.display |= this.REGISTER.DISPLAYON;
    // } else {
    //   state.display &= ~this.REGISTER.DISPLAYON;
    // }

    // this.command(state.display);

    return this.backlight(false);
  }

  on() {
    const state = priv.get(this);

    state.display |= this.REGISTER.DISPLAYON;
    this.command(state.display);

    return this;
  }

  off() {
    const state = priv.get(this);

    state.display &= ~this.REGISTER.DISPLAYON;
    this.command(state.display);

    return this;
  }

  cursor(row, col) {
    // When provided with col & row, cursor will behave like setCursor,
    // except that it has row and col in the order that most people
    // intuitively expect it to be in.
    if (typeof col !== "undefined" && typeof row !== "undefined") {
      return this.setCursor(col, row);
    }
    const state = priv.get(this);

    state.display |= this.REGISTER.CURSORON;
    this.command(state.display);

    return this;
  }

  noCursor() {
    const state = priv.get(this);

    state.display &= ~this.REGISTER.CURSORON;
    this.command(state.display);

    return this;
  }

  blink() {
    const state = priv.get(this);

    state.display |= this.REGISTER.BLINKON;
    this.command(state.display);

    return this;
  }

  noBlink() {
    const state = priv.get(this);

    state.display &= ~this.REGISTER.BLINKON;
    this.command(state.display);

    return this;
  }

  autoscroll() {
    const state = priv.get(this);

    state.display |= this.REGISTER.ENTRYSHIFTINCREMENT;
    this.command(this.REGISTER.ENTRY | state.display);

    return this;
  }

  noAutoscroll() {
    const state = priv.get(this);

    state.display &= ~this.REGISTER.ENTRYSHIFTINCREMENT;
    this.command(this.REGISTER.ENTRY | state.display);

    return this;
  }

  createChar(name, charMap) {
    // Ensure location is never above 7
    const state = priv.get(this);
    let address;

    if (typeof name === "number") {
      address = name & 0x07;
    } else {
      address = state.index;
      state.index--;
      if (state.index === -1) {
        state.index = this.REGISTER.MEMORYLIMIT - 1;
      }
    }

    this.command(this.REGISTER.SETCGRAMADDR | (address << 3));

    this.hilo(function() {
      for (let i = 0; i < 8; i++) {
        this.command(this.REGISTER.DATA, charMap[i]);
      }
    });

    // Fill in address
    state.characters[name] = address;

    return address;
  }

  useChar(name) {
    const state = priv.get(this);

    if (typeof state.characters[name] === "undefined") {
      // Create the character in LCD memory and
      const newCharIndex = this.createChar(name, this.CHARS[name]);

      // If character's index already used, remove this character in current LCD character map
      // because it's not in LCD memory anymore.
      for (const oldName in state.characters) {
        if (name !== oldName && state.characters[oldName] === newCharIndex) {
          delete state.characters[oldName];
          break;
        }
      }

      // Add character to current LCD character map
      state.characters[name] = newCharIndex;
    }

    return this;
  }
}



const RE_SPECIALS = /:(\w+):/g;


/**
 *

TODO:


burst()

scrollDisplayLeft()
scrollDisplayRight()

leftToRight()
rightToLeft()


*/

LCD.POSITIVE = 0;
LCD.NEGATIVE = 1;

LCD.Characters = lcdCharacters;

module.exports = LCD;
