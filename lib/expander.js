var Board = require("./board");
var Emitter = require("events").EventEmitter;
var util = require("util");
var nanosleep = require("./sleep").nano;
var Fn = require("./fn");
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
    ADDRESSES: {
      value: [0x20]
    },
    REGISTER: {
      value: {
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

        state.iodir = [0xff, 0xff];
        state.olat = [0xff, 0xff];
        state.gpio = [0xff, 0xff];
        state.gppu = [0x00, 0x00];

        this.address = opts.address || this.ADDRESSES[0];
        opts.address = this.address;

        this.io.i2cConfig(opts);
        this.io.i2cWrite(this.address, [this.REGISTER.IODIRA, state.iodir[this.REGISTER.IODIRA]]);
        this.io.i2cWrite(this.address, [this.REGISTER.IODIRB, state.iodir[this.REGISTER.IODIRB]]);

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
        this.io.i2cWrite(this.address, [port, iodir]);

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
        this.io.i2cWrite(this.address, [gpioaddr, gpio]);

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

        this.io.i2cWrite(this.address, [gppuaddr, gppu]);

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
    ADDRESSES: {
      value: [0x20]
    },
    REGISTER: {
      value: {
        IODIR: 0x00,
        GPPU: 0x06,
        GPIO: 0x09,
        OLAT: 0x0A,
      }
    },
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.iodir = [0xff];
        state.olat = [0xff];
        state.gpio = [0xff];
        state.gppu = [0x00];

        this.address = opts.address || this.ADDRESSES[0];

        opts.address = this.address;

        this.io.i2cConfig(opts);
        this.io.i2cWrite(this.address, [this.REGISTER.IODIR, state.iodir[this.REGISTER.IODIR]]);

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
        this.io.i2cWrite(this.address, [port, iodir]);

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
        this.io.i2cWrite(this.address, [gpioaddr, gpio]);

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

        this.io.i2cWrite(this.address, [gppuaddr, gppu]);

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
    ADDRESSES: {
      value: [0x20]
    },
    REGISTER: {},
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.port = 0x00;
        state.ddr = 0x00;
        state.pins = 0x00;

        this.address = opts.address || this.ADDRESSES[0];

        opts.address = this.address;
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
    ADDRESSES: {
      value: [0x20]
    },
    REGISTER: {},
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.port = [0x00, 0x01];
        state.gpio = [0x00, 0x00];

        this.address = opts.address || this.ADDRESSES[0];

        opts.address = this.address;
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
    ADDRESSES: {
      value: [0x40]
    },
    REGISTER: {
      value: {
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

        this.address = opts.address || this.ADDRESSES[0];
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

        opts.address = this.address;

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
        this.pwmWrite(pin, value ? 255 : 0);
      }
    },
    analogWrite: {
      value: function(pin, value) {
        this.pwmWrite(pin, value);
      }
    },
    servoWrite: {
      value: function(pin, value) {

        value = Board.constrain(value, 0, 180);

        var off = Fn.map(value, 0, 180, this.pwmRange[0] / 4, this.pwmRange[1] / 4);

        this.io.i2cWrite(this.address, [
          this.REGISTER.BASE + 4 * pin,
          0, 0,
          off, off >> 8
        ]);
      }
    },
    pwmWrite: {
      value: function(pin, value) {

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
    ADDRESSES: {
      value: [0x48]
    },
    REGISTER: {},
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.control = 0x45;
        state.reading = false;

        this.address = opts.address || this.ADDRESSES[0];

        opts.address = this.address;
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
                this.emit("analog-read-" + i, value);
              }
            }
          }.bind(this));
        }
      }
    },
  },
  MUXSHIELD2: {
    initialize: {
      value: function() {
        var state = priv.get(this);

        // _S[\d]   (Digital: 2, 4, 6, 7)
        state.select = [2, 4, 6, 7];
        // _IOS[\d] (Digital: 10, 11, 12)
        state.ios = [null, 10, 11, 12];
        // _IO[\d]  (Analog In: "A0", "A1", "A2")
        state.io = [null, 14, 15, 16];
        state.aio = [null, 0, 1, 2];

        state.outMode = 8;
        state.pinMap = {};
        state.rowReading = [false, false, false];
        state.rowMode = [null, null, null];
        // Each rowValue is a single uint16
        state.rowValues = [0, 0, 0];

        Object.assign(this.MODES, {
          INPUT: 0,
          OUTPUT: 1,
          ANALOG: 2,
        });

        this.io.pinMode(state.select[0], this.MODES.OUTPUT);
        this.io.pinMode(state.select[1], this.MODES.OUTPUT);
        this.io.pinMode(state.select[2], this.MODES.OUTPUT);
        this.io.pinMode(state.select[3], this.MODES.OUTPUT);

        this.io.pinMode(state.outMode, this.MODES.OUTPUT);
        this.io.digitalWrite(state.outMode, this.LOW);

        this.io.pinMode(state.ios[1], this.MODES.OUTPUT);
        this.io.pinMode(state.ios[2], this.MODES.OUTPUT);
        this.io.pinMode(state.ios[3], this.MODES.OUTPUT);

        var row = 1;
        var mask = 16;
        var index = 0;

        for (var i = 0; i < 48; i++) {
          var band = i & mask;

          if (band === mask) {
            row++;
            mask *= 2;
            index = 0;
          }

          state.pinMap["IO" + row + "-" + index] = i;

          this.pins.push({
            row: row,
            index: index,
            supportedModes: [
              this.MODES.INPUT,
              this.MODES.OUTPUT,
              this.MODES.ANALOG,
            ],
            mode: 1,
            value: 0,
            report: 0,
            analogChannel: i
          });

          this.analogPins.push(i);

          // TODO: Not sure about this?
          // this.io.pinMode(i, this.MODES.OUTPUT);
          // this.io.digitalWrite(i, this.LOW);

          index++;
        }

        this.name = "MUXSHIELD2";
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
        var pinIndex = state.pinMap[pin];

        if (pinIndex === undefined) {
          throw new Error("MUXSHIELD2: Invalid Pin number or name: " + pin);
        }

        var row = this.pins[pinIndex].row;
        var rowModeIndex = row - 1;
        var rowMode = state.rowMode[rowModeIndex];

        if (rowMode === mode) {
          return this;
        }

        if (rowMode !== null && rowMode !== mode) {
          throw new Error("MUXSHIELD2: Cannot set mixed modes per IO row.");
        }

        state.rowMode[rowModeIndex] = mode;

        // MUXSHIELD2 Disallows mixing modes per row.
        // Once a mode is set for a given pin in a given row,
        // set all the pins in that row to the same mode.
        for (var i = 0; i < 16; i++) {
          this.pins[rowModeIndex + i].mode = mode;
        }

        var IO = state.io[row];
        var IOS = state.ios[row];

        if (mode === this.MODES.INPUT) {
          // Read an analog input as digital
          this.io.pinMode(IO, this.MODES.INPUT);
          // this.io.digitalWrite(IOS, this.LOW);
        }

        if (mode === this.MODES.OUTPUT) {
          this.io.pinMode(IO, this.MODES.OUTPUT);
          this.io.digitalWrite(IOS, this.HIGH);
        }
      }
    },
    digitalWrite: {
      value: function(pin, value) {
        var state = priv.get(this);
        var pinIndex = state.pinMap[pin];

        if (pinIndex === undefined) {
          throw new Error("MUXSHIELD2: Invalid Pin number or name: " + pin);
        }

        var row = this.pins[pinIndex].row;
        var rowValueIndex = row - 1;
        var rowValue = state.rowValues[rowValueIndex];

        var ioPin = row - 1;
        var offset = ioPin * 16;
        var channel = pinIndex - offset;

        if (value) {
          rowValue |= 1 << channel;
        } else {
          rowValue &= ~(1 << channel);
        }

        this.io.digitalWrite(state.select[3], this.LOW);
        this.io.digitalWrite(state.outMode, this.HIGH);

        var S = state.select[row - 1];
        var IO = state.io[row];

        for (var i = 15; i >= 0; i--) {
          this.io.digitalWrite(S, this.LOW);
          this.io.digitalWrite(IO, (rowValue >> i) & 1);
          this.io.digitalWrite(S, this.HIGH);
        }

        this.io.digitalWrite(state.select[3], this.HIGH);
        this.io.digitalWrite(state.outMode, this.LOW);

        this.pins[pinIndex].value = value;

        state.rowValues[rowValueIndex] = rowValue;
      }
    },
    digitalRead: {
      value: function(pin, callback) {
        this.ioRead("digital", pin, callback);
      }
    },
    analogRead: {
      value: function(pin, callback) {
        this.ioRead("analog", pin, callback);
      }
    },
    ioRead: {
      value: function(type, pin, callback) {
        var state = priv.get(this);
        var pinIndex = state.pinMap[pin];

        if (pinIndex === undefined) {
          throw new Error("MUXSHIELD2: Invalid Pin number or name: " + pin);
        }

        this.on(type + "-read-" + pinIndex, callback);

        var isAnalog = type === "analog" ? true : false;
        var row = this.pins[pinIndex].row;
        var rowReadingIndex = row - 1;
        var offset = rowReadingIndex * 16;
        var channel = pinIndex - offset;

        this.pins[pinIndex].report = 1;
        this.pins[pinIndex].channel = channel;
        this.pins[pinIndex].ioPin = isAnalog ? rowReadingIndex : rowReadingIndex + 14;

        var nextPinIndex = function() {
          var startAt = nextPinIndex.lastPinIndex + 1;

          for (var i = startAt; i < this.pins.length; i++) {
            if (this.pins[i].report === 1) {
              nextPinIndex.lastPinIndex = i;
              return nextPinIndex.lastPinIndex;
            }
          }

          nextPinIndex.lastPinIndex = -1;

          return nextPinIndex();
        }.bind(this);

        nextPinIndex.lastPinIndex = -1;

        var handler = function(value) {
          var pinIndex = nextPinIndex.lastPinIndex;
          var pin = this.pins[pinIndex];

          this.emit(type + "-read-" + pinIndex, value);

          this.io.removeListener(type + "-read-" + pin.ioPin, handler);

          setTimeout(read, 10);
        }.bind(this);

        var read = function() {
          var pinIndex = nextPinIndex();
          var pin = this.pins[pinIndex];

          this.select(pin.channel);

          if (isAnalog) {
            this.io.pinMode(pin.ioPin, this.io.MODES.ANALOG);
            this.io.analogRead(pin.ioPin, handler);
          } else {
            this.io.digitalRead(pin.ioPin, handler);
          }
        }.bind(this);

        if (!state.rowReading[rowReadingIndex]) {
          state.rowReading[rowReadingIndex] = true;
          read();
        }
      }
    },


    select: {
      value: function(channel) {
        var state = priv.get(this);
        this.io.digitalWrite(state.outMode, this.LOW);
        this.io.digitalWrite(state.select[0], (channel & 1));
        this.io.digitalWrite(state.select[1], (channel & 3) >> 1);
        this.io.digitalWrite(state.select[2], (channel & 7) >> 2);
        this.io.digitalWrite(state.select[3], (channel & 15) >> 3);
      }
    }
  },

  GROVEPI: {
    ADDRESSES: {
      value: [0x04]
    },
    REGISTER: {},
    COMMANDS: {
      value: {
        DIGITAL_READ: 0x01,
        DIGITAL_WRITE: 0x02,
        ANALOG_READ: 0x03,
        ANALOG_WRITE: 0x04,
        PIN_MODE: 0x05,
        PING_READ: 0x07,
      }
    },
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.isReading = false;
        state.pinMap = {
          D2: 2,
          D3: 3,
          D4: 4,
          D5: 5,
          D6: 6,
          D7: 7,
          D8: 8,
          A0: 14,
          A1: 15,
          A2: 16,
        };

        // Override the relevant default "isType" methods
        this.isPwm = function(name) {
          var number = typeof name === "number" ? name : parseInt(name[1]);
          return number === 3 || number === 5 || number === 6;
        };

        this.address = opts.address || this.ADDRESSES[0];
        opts.address = this.address;

        this.io.i2cConfig(opts);

        Object.assign(this.MODES, this.io.MODES);

        var analogChannel;

        for (var i = 0; i < 17; i++) {
          analogChannel = 127;

          if (i <= 1 || (i >= 9 && i < 14)) {
            // There are no connections for:
            // O, 1, 9, 10, 11, 12, 13
            this.pins.push({
              supportedModes: [],
              mode: 0,
              value: 0,
              report: 0,
              analogChannel: analogChannel
            });
          } else {

            this.pins.push({
              supportedModes: [
                this.MODES.INPUT,
                this.MODES.OUTPUT,
              ],
              mode: 0,
              value: 0,
              report: 0,
              analogChannel: analogChannel
            });

            // Digital pins with PWM Support
            // D3, D5, D6
            if (this.isPwm(i)) {
              this.pins[i].supportedModes.push(
                this.MODES.PWM
              );
            }

            if (i >= 14 && i <= 17) {
              // A0 = 0 = 14
              // A1 = 1 = 15
              // A2 = 2 = 16
              //
              // 14 is the analog offset
              this.pins[i].analogChannel = i - 14;

              // Add ANALOG "read" mode
              this.pins[i].supportedModes.push(
                this.MODES.ANALOG
              );

              this.analogPins.push(i);

              // Default all analog IO pins to
              // ANALOG "read"
              this.pinMode("A" + this.pins[i].analogChannel, this.MODES.ANALOG);
            } else {
              // Default all digital IO pins to
              // OUTPUT and LOW
              this.pinMode("D" + i, this.MODES.OUTPUT);
              this.digitalWrite("D" + i, this.LOW);
            }
          }
        }

        this.name = "GROVEPI";
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
        var pinIndex = state.pinMap[pin];

        if (mode === this.io.MODES.INPUT ||
          mode === this.io.MODES.ANALOG) {
          this.pins[pinIndex].mode = 0;
        } else {
          this.pins[pinIndex].mode = 1;
        }

        this.io.i2cWrite(
          this.address, [
            this.COMMANDS.PIN_MODE,
            pinIndex,
            this.pins[pinIndex].mode,
            0
          ]
        );
      }
    },

    digitalWrite: {
      value: function(pin, value) {
        var state = priv.get(this);
        var pinIndex = state.pinMap[pin];

        // Any truthy value is converted to HIGH (1)
        value = value ? 1 : 0;

        this.io.i2cWrite(
          this.address, [
            this.COMMANDS.DIGITAL_WRITE,
            pinIndex,
            value,
            0
          ]
        );

        this.pins[pinIndex].value = value;
      }
    },

    ioRead: {
      value: function(pin, type, callback) {
        var state = priv.get(this);
        var pinIndex = state.pinMap[pin];
        var isAnalog = type === "analog";
        var length = isAnalog ? 3 : 1;
        var command = isAnalog ? this.COMMANDS.ANALOG_READ : this.COMMANDS.DIGITAL_READ;

        this.on(type + "-read-" + pinIndex, callback);

        this.pins[pinIndex].report = 1;
        this.pins[pinIndex].command = command;
        this.pins[pinIndex].type = type;
        this.pins[pinIndex].length = length;

        var nextPinIndex = function() {
          var startAt = nextPinIndex.lastPinIndex + 1;

          for (var i = startAt; i < this.pins.length; i++) {
            if (this.pins[i].report === 1) {
              nextPinIndex.lastPinIndex = i;
              return nextPinIndex.lastPinIndex;
            }
          }

          nextPinIndex.lastPinIndex = -1;

          return nextPinIndex();
        }.bind(this);

        nextPinIndex.lastPinIndex = -1;

        var handler = function(pinIndex, value) {
          var pin = this.pins[pinIndex];
          var canEmit = true;

          if (pin.type === "digital" && this.pins[pinIndex].value === value) {
            canEmit = false;
          }

          this.pins[pinIndex].value = value;

          if (canEmit) {
            this.emit(pin.type + "-read-" + pinIndex, value);
          }

          setTimeout(read, 1);
        }.bind(this);

        var read = function() {
          var pinIndex = nextPinIndex();
          var pin = this.pins[pinIndex];
          var isAnalog = pin.type === "analog";

          this.io.i2cWrite(this.address, [pin.command, pinIndex, 0, 0]);
          this.io.i2cReadOnce(this.address, pin.length, function(data) {
            var value;

            if (isAnalog) {
              value = (data[1] << 8) + data[2];
            } else {
              value = data[0];
            }
            handler(pinIndex, value);
          }.bind(this));
        }.bind(this);

        if (!state.isReading) {
          state.isReading = true;
          read();
        }
      }
    },

    digitalRead: {
      value: function(pin, callback) {
        this.ioRead(pin, "digital", callback);
      },
    },
    analogRead: {
      value: function(pin, callback) {
        this.ioRead(pin, "analog", callback);
      },
    },
    pingRead: {
      value: function(settings, callback) {
        var state = priv.get(this);
        var pinIndex = state.pinMap[settings.pin];

        this.io.i2cWrite(
          this.address, [
            this.COMMANDS.PING_READ,
            pinIndex,
            0, 0
          ]
        );

        setTimeout(function() {
          this.once("ping-read-" + settings.pin, callback);

          this.io.i2cReadOnce(this.address, 3, function(data) {
            // The GrovePi firmware sends this value in CM
            // so the value must be converted back to duration.
            var value = Math.round(((data[1] << 8) + data[2]) * 29 * 2);

            this.pins[pinIndex].value = value;
            this.emit("ping-read-" + settings.pin, value);
          }.bind(this));
        }.bind(this), 200);
      },
    },
    analogWrite: {
      value: function(pin, value) {
        this.pwmWrite(pin, value);
      }
    },
    pwmWrite: {
      writable: true,
      value: function(pin, value) {
        var state = priv.get(this);
        var pinIndex = state.pinMap[pin];

        value = Board.constrain(value, 0, 255);

        this.io.i2cWrite(
          this.address, [
            this.COMMANDS.ANALOG_WRITE,
            pinIndex,
            value,
            0
          ]
        );

        this.pins[pinIndex].value = value;
      }
    }
  },
  "74HC595": {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        if (!opts.pins.data) {
          throw new Error("Expected pins.data");
        }

        if (!opts.pins.clock) {
          throw new Error("Expected pins.clock");
        }

        if (!opts.pins.latch) {
          throw new Error("Expected pins.latch");
        }

        state.data = opts.pins.data;
        state.clock = opts.pins.clock;
        state.latch = opts.pins.latch;
        state.value = 0x00;

        Object.assign(this.MODES, this.io.MODES);

        // Reset pins property to empty array.
        this.pins = [];

        for (var i = 0; i < 8; i++) {
          this.pins.push({
            supportedModes: [
              this.MODES.OUTPUT
            ],
            mode: 1,
            value: 0,
            report: 0,
            analogChannel: 127
          });
        }

        this.portWrite(0, state.value);

        this.name = "74HC595";
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
        this.pins[pin].mode = mode;
      }
    },
    digitalWrite: {
      value: function(pin, value) {
        var state = priv.get(this);

        if (value) {
          state.value |= 1 << pin;
        } else {
          state.value &= ~(1 << pin);
        }

        this.pins[pin].value = value;

        this.portWrite(0, state.value);
      }
    },
    portWrite: {
      writable: true,
      configurable: true,
      value: function(port, value) {
        var state = priv.get(this);

        state.value = value;

        this.board.digitalWrite(state.latch, this.io.LOW);
        this.board.shiftOut(state.data, state.clock, true, state.value);
        this.board.digitalWrite(state.latch, this.io.HIGH);

        for (var i = 0; i < 8; i++) {
          this.pins[i].value = (state.value >> i) & 1;
        }
      }
    },
  },
  CD74HC4067: {
    /*
    | Address 1 (D9) |  Address 0 (D8) | Address |
    | -------------- |  -------------- | ------- |
    | 0              |  0              | 0x0A    |
    | 0              |  1              | 0x0B    |
    | 1              |  0              | 0x0C    |
    | 1              |  1              | 0x0D    |
    */
    ADDRESSES: {
      value: [0x0A, 0x0B, 0x0C, 0x0D]
    },
    REGISTER: {},
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.reading = false;

        this.address = opts.address || this.ADDRESSES[0];

        opts.address = this.address;
        this.io.i2cConfig(opts);

        Object.assign(this.MODES, this.io.MODES);

        for (var i = 0; i < 16; i++) {
          this.pins.push({
            supportedModes: [
              this.MODES.ANALOG
            ],
            mode: 1,
            value: 0,
            report: 0,
            analogChannel: i
          });
          this.analogPins.push(i);
        }

        this.name = "CD74HC4067";
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

        this.io.i2cWrite(this.address, pinIndex, 1);

        // Since this operation will read all 4 pins,
        // it only needs to be initiated once.
        if (!state.reading) {
          state.reading = true;

          this.io.i2cRead(this.address, 32, function(data) {
            var value;
            for (var i = 0; i < 16; i++) {
              var index = i * 2;

              value = (data[index] << 8) + data[index + 1];

              this.pins[i].value = value;

              if (this.pins[i].report) {
                this.emit("analog-read-" + i, value);
              }
            }
          }.bind(this));
        }
      }
    },
  },

  // https://cdn-shop.adafruit.com/datasheets/LIS3DH.pdf
  LIS3DH: {
    ADDRESSES: {
      value: [0x18]
    },
    REGISTER: {
      value: {
        // Page 26
        // Table 17. Register address map
        //
        // NAME:  BYTE
        OUT_ADC1_L: 0x08,
        OUT_X_L: 0x28,
        CTRL_REG1: 0x20,
        CTRL_REG2: 0x21,
        CTRL_REG3: 0x22,
        CTRL_REG4: 0x23,
        CTRL_REG5: 0x24,

        TEMP_CFG_REG: 0x1F,
      },
    },
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.reading = false;

        this.address = opts.address || this.ADDRESSES[0];

        opts.address = this.address;

        this.io.i2cConfig(opts);


        // Page 29
        // 8.8 CTRL_REG1
        // Table 24. CTRL_REG1 register
        //
        // ODR3 ODR2 ODR1 ODR0 LPen Zen Yen Xen
        //
        //
        // Enable Axis
        // 0b00000111
        //        ZYX
        //
        var ctrl1 = 0x07; // 0b00000111
        //
        // Date Rate
        // Table 26. Data rate configuration
        //
        // ODR3 ODR2 ODR1 ODR0 Power mode selection
        // 0 0 0 1 = 1 Hz
        // 0 0 1 0 = 10 Hz
        // 0 0 1 1 = 25 Hz
        // 0 1 0 0 = 50 Hz
        // 0 1 0 1 = 100 Hz
        // 0 1 1 0 = 200 Hz
        // 0 1 1 1 = 400 Hz
        //
        // 0b0111 << 4 = 0b01110000
        //
        ctrl1  = (ctrl1 & ~(0xF0)) | (0x07 << 4);

        // ctrl1 = 0b01110111
        // 0b01110000 = 0x70 = 112
        this.io.i2cWrite(this.address, this.REGISTER.CTRL_REG1, ctrl1);

        // Page 31
        // 8.11 CTRL_REG4
        //
        // Table 32. CTRL_REG4 register
        //
        // BDU BLE FS1 FS0 HR ST1 ST0 SIM
        //
        // BDU  Block data update. Default value: 0
        //      0: Continuous update
        //      1: Updated when MSB and LSB read
        //
        // HR   High resolution output mode: Default value: 0
        //      0: Disable
        //      1: Enable
        //
        // Setting BDU and HR:
        // 0b1---1---
        //
        // 0b10001000 = 0x88 = 136
        //
        this.io.i2cWrite(this.address, this.REGISTER.CTRL_REG4, 0x88);
        //
        // Page 31
        // 8.10 CTRL_REG3
        //
        // I1_DRDY1 -> ON
        //
        // 0b00010000 = 0x10 = 16
        this.io.i2cWrite(this.address, this.REGISTER.CTRL_REG3, 0x10);

        Object.assign(this.MODES, this.io.MODES);

        for (var i = 0; i < 4; i++) {
          if (i === 0) {
            this.pins.push({
              supportedModes: [],
              mode: 0,
              value: 0,
              report: 0,
              analogChannel: 0x7F
            });
          } else {
            this.pins.push({
              supportedModes: [ this.MODES.ANALOG ],
              mode: 1,
              value: 0,
              report: 0,
              analogChannel: i
            });
            this.analogPins.push(i);
          }
        }

        this.name = "LIS3DH";
        this.isReady = true;

        this.emit("connect");
        this.emit("ready");
      },
    },
    normalize: {
      value: function(pin) {
        if (typeof pin === "string" && pin[0] === "A") {
          return +pin.slice(1);
        }
        return pin;
      },
    },
    pinMode: {
      value: function(pin, mode) {
        this.pins[pin].mode = mode;
      },
    },
    analogRead: {
      value: function(pin, callback) {
        var state = priv.get(this);
        var pinIndex = pin;

        this.pins[pinIndex].report = 1;

        this.on("analog-read-" + pin, callback);

        // Since this operation will read all 3 ADC pins,
        // it only needs to be initiated once.
        if (!state.reading) {
          state.reading = true;

          // Page 29
          // 8.7 TEMP_CFG_REG (1Fh)
          // Table 23. TEMP_CFG_REG description
          //
          // ADC_PD TEMP_EN 0 0 0 0 0 0
          //
          // 0b10000000 = 128 = 0x80
          //
          this.io.i2cWrite(this.address, this.REGISTER.TEMP_CFG_REG, 0x80);

          // Page 23, 24, 25
          // bit 1: MS bit. When 0, the address remains unchanged in multiple read/write commands.
          // When 1, the address is auto incremented in multiple read/write commands.
          this.io.i2cRead(this.address, this.REGISTER.OUT_ADC1_L | 0x80, 6, function(data) {
            // V range is 900

            // First, scale the value to range that these ADCs support, which is
            //
            // 1.8V - 0.9V
            //
            // Then, scale that value to the full 10-bit 0-3.3V range
            //
            this.pins[1].value = Fn.scale(Fn.int16(data[1], data[0]), -32512, 32512, 1023, 0);
            this.pins[2].value = Fn.scale(Fn.int16(data[3], data[2]), -32512, 32512, 1023, 0);
            this.pins[3].value = Fn.scale(Fn.int16(data[5], data[4]), -32512, 32512, 1023, 0);

            for (var i = 1; i < 4; i++) {
              if (this.pins[i].report) {
                this.emit("analog-read-" + i, this.pins[i].value);
              }
            }
          }.bind(this));
        }
      },
    },
    i2cConfig: {
      value: function() {
        return this.io.i2cConfig.apply(this.io, arguments);
      },
    },
    i2cWrite: {
      value: function() {
        return this.io.i2cWrite.apply(this.io, arguments);
      },
    },
    i2cWriteReg: {
      value: function() {
        return this.io.i2cWriteReg.apply(this.io, arguments);
      },
    },
    i2cRead: {
      value: function() {
        return this.io.i2cRead.apply(this.io, arguments);
      },
    },
    i2cReadOnce: {
      value: function() {
        return this.io.i2cReadOnce.apply(this.io, arguments);
      },
    },
  },
};

Controllers["CD74HCT4067"] = Controllers.CD74HC4067;
Controllers["74HC4067"] = Controllers.CD74HC4067;

Controllers.PCF8574A = Object.assign({}, Controllers.PCF8574, {
  ADDRESSES: {
    value: [0x38]
  }
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

var nonAddressable = [
  "74HC595"
];

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
    this, opts = Board.Options(opts), {
      normalizePin: false,
      requestPin: false
    }
  );

  if (nonAddressable.includes(opts.controller) &&
      typeof this.address === "undefined") {
    this.address = Fn.uid();
  }

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
  var controller = null;

  active.forEach(function(value) {
    if (value.name === name.toUpperCase()) {
      controller = value;
    }
  });
  return controller;
};

Expander.hasController = function(key) {
  return Controllers[key] !== undefined;
};

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Expander.Controllers = Controllers;
  Expander.purge = function() {
    priv.clear();
    active.clear();
  };
}

module.exports = Expander;
