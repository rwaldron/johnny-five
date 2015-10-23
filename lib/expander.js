var IS_TEST_MODE = !!process.env.IS_TEST_MODE;
var Board = require("../lib/board");
var Emitter = require("events").EventEmitter;
var util = require("util");
var nanosleep = require("../lib/sleep").nano;
var __ = require("../lib/fn");
var priv = new Map();
var active = new Map();

function Base() {
  Emitter.call(this);

  this.HIGH = 1;
  this.LOW = 0;
  this.isReady = false;

  this.MODES = {};
  this.pins = [];
  this.analogPins = [];
}

util.inherits(Base, Emitter);

var Controllers = {
  // http://www.adafruit.com/datasheets/mcp23017.pdf
  MCP23017: {
    REGISTER: {
      value: {
        ADDRESS: 0x20,
        // IO A
        IODIRA: 0x00,
        GPPUA: 0x0C,
        GPIOA: 0x12,
        OLATA: 0x14,
        // IO B
        IODIRB: 0x01,
        GPPUB: 0x0D,
        GPIOB: 0x13,
        OLATB: 0x15,
      }
    },
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.iodir = [ 0xff, 0xff ];
        state.olat = [ 0xff, 0xff ];
        state.gpio = [ 0xff, 0xff ];
        state.gppu = [ 0x00, 0x00 ];

        this.address = opts.address || this.REGISTER.ADDRESS;

        this.io.i2cConfig(opts);
        this.io.i2cWrite(this.address, [ this.REGISTER.IODIRA, state.iodir[this.REGISTER.IODIRA] ]);
        this.io.i2cWrite(this.address, [ this.REGISTER.IODIRB, state.iodir[this.REGISTER.IODIRB] ]);

        Object.assign(this.MODES, this.io.MODES);

        for (var i = 0; i < 16; i++) {
          this.pins.push({
            supportedModes: [
              this.MODES.INPUT,
              this.MODES.OUTPUT
            ],
            mode: 0,
            value: 0,
            report: 0,
            analogChannel: 127
          });

          this.pinMode(i, this.MODES.OUTPUT);
          this.digitalWrite(i, this.LOW);
        }

        this.name = "MCP23017";
        this.isReady = true;

        this.emit("connect");
        this.emit("ready");
      }
    },
    normalize: {
      value: function(pin) {
        return pin;
      }
    },
    // 1.6.1 I/O DIRECTION REGISTER
    pinMode: {
      value: function(pin, mode) {
        var state = priv.get(this);
        var pinIndex = pin;
        var port = 0;
        var iodir = null;

        if (pin < 8) {
          port = this.REGISTER.IODIRA;
        } else {
          port = this.REGISTER.IODIRB;
          pin -= 8;
        }

        iodir = state.iodir[port];

        if (mode === this.io.MODES.INPUT) {
          iodir |= 1 << pin;
        } else {
          iodir &= ~(1 << pin);
        }

        this.pins[pinIndex].mode = mode;
        this.io.i2cWrite(this.address, [ port, iodir ]);

        state.iodir[port] = iodir;
      }
    },
    // 1.6.10 PORT REGISTER
    digitalWrite: {
      value: function(pin, value) {
        var state = priv.get(this);
        var pinIndex = pin;
        var port = 0;
        var gpio = 0;
        // var olataddr = 0;
        var gpioaddr = 0;

        if (pin < 8) {
          port = this.REGISTER.IODIRA;
          // olataddr = this.REGISTER.OLATA;
          gpioaddr = this.REGISTER.GPIOA;
        } else {
          port = this.REGISTER.IODIRB;
          // olataddr = this.REGISTER.OLATB;
          gpioaddr = this.REGISTER.GPIOB;
          pin -= 8;
        }

        gpio = state.olat[port];

        if (value === this.io.HIGH) {
          gpio |= 1 << pin;
        } else {
          gpio &= ~(1 << pin);
        }

        this.pins[pinIndex].report = 0;
        this.pins[pinIndex].value = value;
        this.io.i2cWrite(this.address, [ gpioaddr, gpio ]);

        state.olat[port] = gpio;
        state.gpio[port] = gpio;
      }
    },
    // 1.6.7 PULL-UP RESISTOR
    // CONFIGURATION REGISTER
    pullUp: {
      value: function(pin, value) {
        var state = priv.get(this);
        var port = 0;
        var gppu = 0;
        var gppuaddr = 0;

        if (pin < 8) {
          port = this.REGISTER.IODIRA;
          gppuaddr = this.REGISTER.GPPUA;
        } else {
          port = this.REGISTER.IODIRB;
          gppuaddr = this.REGISTER.GPPUB;
          pin -= 8;
        }

        gppu = state.gppu[port];

        if (value === this.io.HIGH) {
          gppu |= 1 << pin;
        } else {
          gppu &= ~(1 << pin);
        }

        this.io.i2cWrite(this.address, [ gppuaddr, gppu ]);

        state.gppu[port] = gppu;
      }
    },
    digitalRead: {
      value: function(pin, callback) {
        var pinIndex = pin;
        var gpioaddr = 0;

        if (pin < 8) {
          gpioaddr = this.REGISTER.GPIOA;
        } else {
          gpioaddr = this.REGISTER.GPIOB;
          pin -= 8;
        }

        this.pins[pinIndex].report = 1;

        this.on("digital-read-" + pin, callback);

        this.io.i2cRead(this.address, gpioaddr, 1, function(data) {
          var byte = data[0];
          var value = byte >> pin & 0x01;

          this.pins[pinIndex].value = value;

          this.emit("digital-read-" + pin, value);
        }.bind(this));
      }
    },
  },
  MCP23008: {
    REGISTER: {
      value: {
        ADDRESS: 0x20,
        IODIR: 0x00,
        GPPU: 0x06,
        GPIO: 0x09,
        OLAT: 0x0A,
      }
    },
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.iodir = [ 0xff ];
        state.olat = [ 0xff ];
        state.gpio = [ 0xff ];
        state.gppu = [ 0x00 ];

        this.address = opts.address || this.REGISTER.ADDRESS;

        this.io.i2cConfig(opts);
        this.io.i2cWrite(this.address, [ this.REGISTER.IODIR, state.iodir[this.REGISTER.IODIR] ]);

        Object.assign(this.MODES, this.io.MODES);

        for (var i = 0; i < 8; i++) {
          this.pins.push({
            supportedModes: [
              this.MODES.INPUT,
              this.MODES.OUTPUT
            ],
            mode: 0,
            value: 0,
            report: 0,
            analogChannel: 127
          });

          this.pinMode(i, this.MODES.OUTPUT);
          this.digitalWrite(i, this.LOW);
        }

        this.name = "MCP23008";
        this.isReady = true;

        this.emit("connect");
        this.emit("ready");
      }
    },
    normalize: {
      value: function(pin) {
        return pin;
      }
    },
    // 1.6.1 I/O DIRECTION REGISTER
    pinMode: {
      value: function(pin, mode) {
        var state = priv.get(this);
        var pinIndex = pin;
        var port = this.REGISTER.IODIR;
        var iodir = state.iodir[port];

        if (mode === this.io.MODES.INPUT) {
          iodir |= 1 << pin;
        } else {
          iodir &= ~(1 << pin);
        }

        this.pins[pinIndex].mode = mode;
        this.io.i2cWrite(this.address, [ port, iodir ]);

        state.iodir[port] = iodir;
      }
    },
    // 1.6.10 PORT REGISTER
    digitalWrite: {
      value: function(pin, value) {
        var state = priv.get(this);
        var pinIndex = pin;
        var port = this.REGISTER.IODIR;
        var gpioaddr = this.REGISTER.GPIO;
        var gpio = state.olat[port];

        if (value === this.io.HIGH) {
          gpio |= 1 << pin;
        } else {
          gpio &= ~(1 << pin);
        }

        this.pins[pinIndex].report = 0;
        this.pins[pinIndex].value = value;
        this.io.i2cWrite(this.address, [ gpioaddr, gpio ]);

        state.olat[port] = gpio;
        state.gpio[port] = gpio;
      }
    },
    // 1.6.7 PULL-UP RESISTOR
    // CONFIGURATION REGISTER
    pullUp: {
      value: function(pin, value) {
        var state = priv.get(this);
        var port = this.REGISTER.IODIR;
        var gppuaddr = this.REGISTER.GPPU;
        var gppu = state.gppu[port];

        if (value === this.io.HIGH) {
          gppu |= 1 << pin;
        } else {
          gppu &= ~(1 << pin);
        }

        this.io.i2cWrite(this.address, [ gppuaddr, gppu ]);

        state.gppu[port] = gppu;
      }
    },
    digitalRead: {
      value: function(pin, callback) {
        var pinIndex = pin;
        var gpioaddr = this.REGISTER.GPIO;

        this.pins[pinIndex].report = 1;

        this.on("digital-read-" + pin, callback);

        this.io.i2cRead(this.address, gpioaddr, 1, function(data) {
          var byte = data[0];
          var value = byte >> pin & 0x01;

          this.pins[pinIndex].value = value;

          this.emit("digital-read-" + pin, value);
        }.bind(this));
      }
    },
  },
  PCF8574: {
    REGISTER: {
      value: {
        ADDRESS: 0x20,
      }
    },
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.port = 0x00;
        state.ddr = 0x00;
        state.pins = 0x00;

        this.address = opts.address || this.REGISTER.ADDRESS;

        this.io.i2cConfig(opts);

        Object.assign(this.MODES, this.io.MODES);

        for (var i = 0; i < 8; i++) {
          this.pins.push({
            supportedModes: [
              this.MODES.INPUT,
              this.MODES.OUTPUT
            ],
            mode: 1,
            value: 0,
            report: 0,
            analogChannel: 127
          });

          this.pinMode(i, this.MODES.OUTPUT);
          this.digitalWrite(i, this.LOW);
        }

        this.name = "PCF8574";
        this.isReady = true;

        this.emit("connect");
        this.emit("ready");
      }
    },
    normalize: {
      value: function(pin) {
        return pin;
      }
    },
    pinMode: {
      value: function(pin, mode) {
        var state = priv.get(this);
        var pinIndex = pin;
        var port = state.port;
        var ddr = state.ddr;
        var pins = state.pins;

        if (mode === this.MODES.INPUT) {
          ddr &= ~(1 << pin);
          port &= ~(1 << pin);
        } else {
          ddr |= (1 << pin);
          port &= ~(1 << pin);
        }

        this.pins[pinIndex].mode = mode;

        state.port = port;
        state.ddr = ddr;

        this.io.i2cWrite(this.address, (pins & ~ddr) | port);
      }
    },
    digitalWrite: {
      value: function(pin, value) {
        var state = priv.get(this);
        var pinIndex = pin;
        var port = state.port;
        var ddr = state.ddr;
        var pins = state.pins;

        if (value) {
          port |= 1 << pin;
        } else {
          port &= ~(1 << pin);
        }

        this.pins[pinIndex].report = 0;
        this.pins[pinIndex].value = value;

        state.port = port;

        this.io.i2cWrite(this.address, (pins & ~ddr) | port);
      }
    },
    digitalRead: {
      value: function(pin, callback) {
        var state = priv.get(this);
        var pinIndex = pin;

        this.pins[pinIndex].report = 1;

        this.on("digital-read-" + pin, callback);

        this.io.i2cRead(this.address, 1, function(data) {
          var byte = data[0];
          var value = byte >> pin & 0x01;

          state.pins = byte;

          this.pins[pinIndex].value = value;

          this.emit("digital-read-" + pin, value);
        }.bind(this));
      }
    },
  },
  PCF8575: {
    REGISTER: {
      value: {
        ADDRESS: 0x20,
      }
    },
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.port = [0x00, 0x01];
        state.gpio = [0x00, 0x00];

        this.address = opts.address || this.REGISTER.ADDRESS;

        this.io.i2cConfig(opts);

        Object.assign(this.MODES, this.io.MODES);

        for (var i = 0; i < 16; i++) {
          this.pins.push({
            supportedModes: [
              this.MODES.INPUT,
              this.MODES.OUTPUT
            ],
            mode: 1,
            value: 0,
            report: 0,
            analogChannel: 127
          });

          this.pinMode(i, this.MODES.OUTPUT);
          this.digitalWrite(i, this.LOW);
        }

        // Set all pins low on initialization
        this.io.i2cWrite(this.address, state.gpio);

        this.name = "PCF8575";
        this.isReady = true;

        this.emit("connect");
        this.emit("ready");
      }
    },
    normalize: {
      value: function(pin) {
        return pin;
      }
    },
    pinMode: {
      value: function(pin, mode) {
        var pinIndex = pin;
        this.pins[pinIndex].mode = mode;
      }
    },
    digitalWrite: {
      value: function(pin, value) {
        var state = priv.get(this);
        var pinIndex = pin;
        var port;

        if (pin < 8) {
          port = 0;
        } else {
          port = 1;
          pin -= 8;
        }

        if (value === this.io.HIGH) {
          state.gpio[port] |= 1 << pin;
        } else {
          state.gpio[port] &= ~(1 << pin);
        }

        this.pins[pinIndex].report = 0;
        this.pins[pinIndex].value = value;

        this.io.i2cWrite(this.address, state.gpio);
      }
    },
    digitalRead: {
      value: function(pin, callback) {
        var pinIndex = pin;
        var port;

        if (pin < 8) {
          port = 0;
        } else {
          port = 1;
          pin -= 8;
        }

        this.pins[pinIndex].report = 1;

        this.on("digital-read-" + pin, callback);

        this.io.i2cRead(this.address, 2, function(data) {
          var byte = data[port];
          var value = byte >> pin & 0x01;

          this.pins[pinIndex].value = value;

          this.emit("digital-read-" + pin, value);
        }.bind(this));
      }
    },
  },
  PCA9685: {
    REGISTER: {
      value: {
        ADDRESS: 0x40,
        MODE1: 0x00,
        PRESCALE: 0xFE,
        BASE: 0x06
      }
    },
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        // 7.3.5 PWM frequency PRE_SCALE
        //
        state.frequency = Board.constrain(opts.frequency || 1526, 24, 1526) * 0.9;

        this.address = opts.address || this.REGISTER.ADDRESS;
        this.pwmRange = opts.pwmRange || [0, 4095];

        Object.defineProperties(this, {
          prescale: {
            get: function() {
              // PCA9685 has an on-board 25MHz clock source

              // 7.3.5 PWM frequency PRE_SCALE
              return Math.round(25000000 / (4096 * state.frequency)) - 1;
            }
          },
          frequency: {
            get: function() {
              return state.frequency;
            }
          }
        });

        this.io.i2cConfig(opts);

        // Reset
        this.io.i2cWriteReg(this.address, this.REGISTER.MODE1, 0x00);
        // Sleep
        this.io.i2cWriteReg(this.address, this.REGISTER.MODE1, 0x10);
        // Set prescalar
        this.io.i2cWriteReg(this.address, this.REGISTER.PRESCALE, this.prescale);
        // Wake up
        this.io.i2cWriteReg(this.address, this.REGISTER.MODE1, 0x00);
        // Wait 5 nanoseconds for restart
        nanosleep(5);
        // Auto-increment
        this.io.i2cWriteReg(this.address, this.REGISTER.MODE1, 0xa1);

        Object.assign(this.MODES, this.io.MODES);

        for (var i = 0; i < 16; i++) {
          this.pins.push({
            supportedModes: [
              this.MODES.OUTPUT,
              this.MODES.PWM,
              this.MODES.SERVO,
            ],
            mode: 0,
            value: 0,
            report: 0,
            analogChannel: 127
          });

          this.pinMode(i, this.MODES.OUTPUT);
          this.digitalWrite(i, this.LOW);
        }

        this.name = "PCA9685";
        this.isReady = true;

        this.emit("connect");
        this.emit("ready");
      }
    },
    normalize: {
      value: function(pin) {
        return this.io.name === "Tessel 2" ? (pin - 1) : pin;
      }
    },
    pinMode: {
      value: function(pin, mode) {
        if (this.pins[pin] === undefined) {
          throw new RangeError("Invalid PCA9685 pin: " + pin);
        }
        this.pins[pin].mode = mode;
      }
    },
    digitalWrite: {
      value: function(pin, value) {

        // The Tessel Servo module is mislabeled 1 - 16 instead of 0 - 15
        if (this.io.name === "Tessel 2") {
          pin--;
        }

        this.pwmWrite(pin, value ? 255 : 0);
      }
    },
    analogWrite: {
      value: function(pin, value) {

        // The Tessel Servo module is mislabeled 1 - 16 instead of 0 - 15
        if (this.io.name === "Tessel 2") {
          pin--;
        }

        this.pwmWrite(pin, value);
      }
    },
    servoWrite: {
      value: function(pin, value) {

        // The Tessel Servo module is mislabeled 1 - 16 instead of 0 - 15
        if (this.io.name === "Tessel 2") {
          pin--;
        }

        value = Board.constrain(value, 0, 180);

        var off = __.map(value, 0, 180, this.pwmRange[0] / 4, this.pwmRange[1] / 4);

        this.io.i2cWrite(this.address, [
          this.REGISTER.BASE + 4 * pin,
          0, 0,
          off, off >> 8
        ]);
      }
    },
    pwmWrite: {
      value: function(pin, value) {

        // The Tessel Servo module is mislabeled 1 - 16 instead of 0 - 15
        if (this.io.name === "Tessel 2") {
          pin--;
        }

        if (this.pins[pin] === undefined) {
          throw new RangeError("Invalid PCA9685 pin: " + pin);
        }

        value = Board.constrain(value, 0, 255);

        var on = 0;
        var off = this.pwmRange[1] * value / 255;

        if (value === 0) {
          // Special value for signal fully off.
          on = 0;
          off = 4096;
        }

        if (value === 255) {
          // Special value for signal fully on.
          on = 4096;
          off = 0;
        }

        this.io.i2cWrite(this.address, [
          this.REGISTER.BASE + 4 * pin,
          on, on >> 8,
          off, off >> 8
        ]);

        this.pins[pin].value = value;
      }
    }
  },
  // http://www.nxp.com/documents/data_sheet/PCF8591.pdf
  PCF8591: {
    REGISTER: {
      value: {
        ADDRESS: 0x48,
      }
    },
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.control = 0x45;
        state.reading = false;

        this.address = opts.address || this.REGISTER.ADDRESS;

        this.io.i2cConfig(opts);

        Object.assign(this.MODES, this.io.MODES);

        for (var i = 0; i < 4; i++) {
          this.pins.push({
            supportedModes: [
              this.MODES.ANALOG
            ],
            mode: 1,
            value: 0,
            report: 0,
            analogChannel: i
          });
        }

        this.analogPins.push(0, 1, 2, 3);

        this.io.i2cWrite(this.address, state.control);

        this.name = "PCF8591";
        this.isReady = true;

        this.emit("connect");
        this.emit("ready");
      }
    },
    normalize: {
      value: function(pin) {
        if (typeof pin === "string" && pin[0] === "A") {
          return +pin.slice(1);
        }
        return pin;
      }
    },
    pinMode: {
      value: function(pin, mode) {
        this.pins[pin].mode = mode;
      }
    },
    analogRead: {
      value: function(pin, callback) {
        var state = priv.get(this);
        var pinIndex = pin;

        this.pins[pinIndex].report = 1;

        this.on("analog-read-" + pin, callback);

        // Since this operation will read all 4 pins,
        // it only needs to be initiated once.
        if (!state.reading) {
          state.reading = true;

          this.io.i2cRead(this.address, 4, function(data) {
            var value;
            for (var i = 0; i < 4; i++) {
              value = data[i] << 2;
              this.pins[i].value = value;

              if (this.pins[i].report) {
                this.emit("analog-read-" + pin, value);
              }
            }
          }.bind(this));
        }
      }
    },
  },
};

Controllers.PCF8574A = Object.assign({}, Controllers.PCF8574, {
  REGISTER: {
    value: {
      ADDRESS: 0x38,
    }
  },
});

var methods = Object.keys(Board.prototype);

Object.keys(Controllers).forEach(function(name) {
  methods.forEach(function(key) {
    if (Controllers[name][key] === undefined) {
      Controllers[name][key] = {
        writable: true,
        configurable: true,
        value: function() {
          throw new Error("Expander:" + name + " does not support " + key);
        }
      };
    }
  });
});

function Expander(opts) {
  if (!(this instanceof Expander)) {
    return new Expander(opts);
  }

  Base.call(this);

  var expander = null;
  var addressError = "Expander cannot reuse an active address";
  var controller = null;
  var state = {};
  var controllerValue;

  if (typeof opts === "string") {
    controllerValue = opts;
  }

  Board.Component.call(
    this, opts = Board.Options(opts), { normalizePin: false, requestPin: false }
  );

  expander = active.get(this.address);

  if (expander) {
    if (this.bus && (expander.bus !== undefined && expander.bus === this.bus)) {
      addressError += " on this bus";
    }
    throw new Error(addressError);
  }

  if (typeof opts.controller === "undefined" && controllerValue) {
    opts.controller = controllerValue;
  }

  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    throw new Error("Expander expects a valid controller");
  }

  Board.Controller.call(this, controller, opts);

  priv.set(this, state);

  if (typeof this.initialize === "function") {
    this.initialize(opts);
  }

  active.set(this.address, this);
}

util.inherits(Expander, Base);


Expander.get = function(required) {

  if (!required.address || !required.controller) {
    throw new Error("Expander.get(...) requires an address and controller");
  }

  if (required.address !== undefined) {
    required.address = Number(required.address);
  }

  if (Number.isNaN(required.address)) {
    throw new Error("Expander.get(...) expects address to be a number");
  }

  if (typeof required.controller !== "string") {
    throw new Error("Expander.get(...) expects controller name to be a string");
  }

  // If no address was sent them assume the request wants
  // to re-use an active Expander, by controller name.
  // if (!required.address) {
  //   return Expander.byController(required.controller);
  // }

  var expander = active.get(required.address);

  if (expander && (expander.name === required.controller.toUpperCase())) {
    return expander;
  }

  return new Expander(required);
};

Expander.byAddress = function(address) {
  return active.get(address);
};

Expander.byController = function(name) {
  var controller;

  active.forEach(function(value) {
    if (value.name === name.toUpperCase()) {
      controller = value;
    }
  });
  return controller;
};

if (IS_TEST_MODE) {
  Expander.purge = function() {
    priv.clear();
    active.clear();
  };
}

module.exports = Expander;
