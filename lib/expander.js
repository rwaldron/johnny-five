const Board = require("./board");
const Emitter = require("events");
const sleep = require("./sleep");
const Fn = require("./fn");
const priv = new Map();
const active = new Map();

class Base extends Emitter {
  constructor() {
    super();
    this.HIGH = 1;
    this.LOW = 0;
    this.isReady = false;

    this.MODES = {};
    this.pins = [];
    this.analogPins = [];
  }
}

const Controllers = {
  DEFAULT: {
    initialize: {
      value() {
        throw new Error("Expander expects a valid controller");
      }
    }
  },
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
      value(options) {
        const state = priv.get(this);

        state.iodir = [0xff, 0xff];
        state.olat = [0xff, 0xff];
        state.gpio = [0xff, 0xff];
        state.gppu = [0x00, 0x00];

        this.address = options.address || this.ADDRESSES[0];
        options.address = this.address;

        this.io.i2cConfig(options);
        this.io.i2cWrite(this.address, [this.REGISTER.IODIRA, state.iodir[this.REGISTER.IODIRA]]);
        this.io.i2cWrite(this.address, [this.REGISTER.IODIRB, state.iodir[this.REGISTER.IODIRB]]);

        Object.assign(this.MODES, this.io.MODES);

        for (let i = 0; i < 16; i++) {
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
      value(pin) {
        return pin;
      }
    },
    // 1.6.1 I/O DIRECTION REGISTER
    pinMode: {
      value(pin, mode) {
        const state = priv.get(this);
        const pinIndex = pin;
        let port = 0;
        let iodir = null;

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
      value(pin, value) {
        const state = priv.get(this);
        const pinIndex = pin;
        let port = 0;
        let gpio = 0;
        // var olataddr = 0;
        let gpioaddr = 0;

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
      value(pin, value) {
        const state = priv.get(this);
        let port = 0;
        let gppu = 0;
        let gppuaddr = 0;

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
      value(pin, callback) {
        const pinIndex = pin;
        let gpioaddr = 0;

        if (pin < 8) {
          gpioaddr = this.REGISTER.GPIOA;
        } else {
          gpioaddr = this.REGISTER.GPIOB;
          pin -= 8;
        }

        this.pins[pinIndex].report = 1;

        this.on(`digital-read-${pinIndex}`, callback);

        this.io.i2cRead(this.address, gpioaddr, 1, data => {
          const byte = data[0];
          const value = byte >> pin & 0x01;

          this.pins[pinIndex].value = value;

          this.emit(`digital-read-${pinIndex}`, value);
        });
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
      value(options) {
        const state = priv.get(this);

        state.iodir = [0xff];
        state.olat = [0xff];
        state.gpio = [0xff];
        state.gppu = [0x00];

        this.address = options.address || this.ADDRESSES[0];

        options.address = this.address;

        this.io.i2cConfig(options);
        this.io.i2cWrite(this.address, [this.REGISTER.IODIR, state.iodir[this.REGISTER.IODIR]]);

        Object.assign(this.MODES, this.io.MODES);

        for (let i = 0; i < 8; i++) {
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
      value(pin) {
        return pin;
      }
    },
    // 1.6.1 I/O DIRECTION REGISTER
    pinMode: {
      value(pin, mode) {
        const state = priv.get(this);
        const pinIndex = pin;
        const port = this.REGISTER.IODIR;
        let iodir = state.iodir[port];

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
      value(pin, value) {
        const state = priv.get(this);
        const pinIndex = pin;
        const port = this.REGISTER.IODIR;
        const gpioaddr = this.REGISTER.GPIO;
        let gpio = state.olat[port];

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
      value(pin, value) {
        const state = priv.get(this);
        const port = this.REGISTER.IODIR;
        const gppuaddr = this.REGISTER.GPPU;
        let gppu = state.gppu[port];

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
      value(pin, callback) {
        const pinIndex = pin;
        const gpioaddr = this.REGISTER.GPIO;

        this.pins[pinIndex].report = 1;

        this.on(`digital-read-${pin}`, callback);

        this.io.i2cRead(this.address, gpioaddr, 1, data => {
          const byte = data[0];
          const value = byte >> pin & 0x01;

          this.pins[pinIndex].value = value;

          this.emit(`digital-read-${pin}`, value);
        });
      }
    },
  },
  PCF8574: {
    ADDRESSES: {
      value: [0x20]
    },
    REGISTER: {},
    initialize: {
      value(options) {
        const state = priv.get(this);

        state.port = 0x00;
        state.ddr = 0x00;
        state.pins = 0x00;

        this.address = options.address || this.ADDRESSES[0];

        options.address = this.address;
        this.io.i2cConfig(options);

        Object.assign(this.MODES, this.io.MODES);

        for (let i = 0; i < 8; i++) {
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
      value(pin) {
        return pin;
      }
    },
    pinMode: {
      value(pin, mode) {
        const state = priv.get(this);
        const pinIndex = pin;
        let port = state.port;
        let ddr = state.ddr;
        const pins = state.pins;

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
      value(pin, value) {
        const state = priv.get(this);
        const pinIndex = pin;
        let port = state.port;
        const ddr = state.ddr;
        const pins = state.pins;

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
      value(pin, callback) {
        const state = priv.get(this);
        const pinIndex = pin;

        this.pins[pinIndex].report = 1;

        this.on(`digital-read-${pin}`, callback);

        this.io.i2cRead(this.address, 1, data => {
          const byte = data[0];
          const value = byte >> pin & 0x01;

          state.pins = byte;

          this.pins[pinIndex].value = value;

          this.emit(`digital-read-${pin}`, value);
        });
      }
    },
  },
  PCF8575: {
    ADDRESSES: {
      value: [0x20]
    },
    REGISTER: {},
    initialize: {
      value(options) {
        const state = priv.get(this);

        state.port = [0x00, 0x01];
        state.gpio = [0x00, 0x00];

        this.address = options.address || this.ADDRESSES[0];

        options.address = this.address;
        this.io.i2cConfig(options);

        Object.assign(this.MODES, this.io.MODES);

        for (let i = 0; i < 16; i++) {
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
      value(pin) {
        return pin;
      }
    },
    pinMode: {
      value(pin, mode) {
        const pinIndex = pin;
        this.pins[pinIndex].mode = mode;
      }
    },
    digitalWrite: {
      value(pin, value) {
        const state = priv.get(this);
        const pinIndex = pin;
        let port;

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
      value(pin, callback) {
        const pinIndex = pin;
        let port;

        if (pin < 8) {
          port = 0;
        } else {
          port = 1;
          pin -= 8;
        }

        this.pins[pinIndex].report = 1;

        this.on(`digital-read-${pin}`, callback);

        this.io.i2cRead(this.address, 2, data => {
          const byte = data[port];
          const value = byte >> pin & 0x01;

          this.pins[pinIndex].value = value;

          this.emit(`digital-read-${pin}`, value);
        });
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
      value(options) {
        const state = priv.get(this);

        // 7.3.5 PWM frequency PRE_SCALE
        //
        // These number correspond to:
        // min PWM frequency: 24 Hz
        // max PWM frequency: 1526 Hz
        state.frequency = Fn.constrain(options.frequency || 1526, 24, 1526);

        this.address = options.address || this.ADDRESSES[0];
        this.pwmRange = options.pwmRange || [0, 4095];

        Object.defineProperties(this, {
          prescale: {
            get() {
              // PCA9685 has an on-board 25MHz clock source

              // 7.3.5 PWM frequency PRE_SCALE
              return Math.round(25000000 / (4096 * state.frequency)) - 1;
            }
          },
          frequency: {
            get() {
              return state.frequency;
            }
          }
        });


        options.address = this.address;

        this.io.i2cConfig(options);

        // Reset
        this.io.i2cWriteReg(this.address, this.REGISTER.MODE1, 0x00);
        // Sleep
        this.io.i2cWriteReg(this.address, this.REGISTER.MODE1, 0x10);
        // Set prescalar
        this.io.i2cWriteReg(this.address, this.REGISTER.PRESCALE, this.prescale);
        // Wake up
        this.io.i2cWriteReg(this.address, this.REGISTER.MODE1, 0x00);
        // Wait 5 microseconds for restart
        sleep.micro(5);
        // Auto-increment
        this.io.i2cWriteReg(this.address, this.REGISTER.MODE1, 0xa0);

        Object.assign(this.MODES, this.io.MODES);

        for (let i = 0; i < 16; i++) {
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
      value(pin) {
        return this.io.name.includes("Tessel 2") ? pin - 1 : pin;
      }
    },
    pinMode: {
      value(pin, mode) {
        if (this.pins[pin] === undefined) {
          throw new RangeError(`Invalid PCA9685 pin: ${pin}`);
        }
        this.pins[pin].mode = mode;
      }
    },
    digitalWrite: {
      value(pin, value) {
        this.pwmWrite(pin, value ? 255 : 0);
      }
    },
    analogWrite: {
      value(pin, value) {
        this.pwmWrite(pin, value);
      }
    },
    servoWrite: {
      value(pin, value) {

        let off;

        if (value < 544) {
          value = Fn.constrain(value, 0, 180);
          off = Fn.map(value, 0, 180, this.pwmRange[0] / 4, this.pwmRange[1] / 4);
        } else {
          off = value / 4;
        }

        off |= 0;

        this.io.i2cWrite(this.address, [
          this.REGISTER.BASE + 4 * pin,
          0, 0,
          off, off >> 8
        ]);
      }
    },
    pwmWrite: {
      value(pin, value) {

        if (this.pins[pin] === undefined) {
          throw new RangeError(`Invalid PCA9685 pin: ${pin}`);
        }

        value = Fn.constrain(value, 0, 255);

        let on = 0;
        let off = this.pwmRange[1] * value / 255;

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
  PCF8591: {
    ADDRESSES: {
      value: [0x48]
    },
    REGISTER: {},
    initialize: {
      value(options) {
        const state = priv.get(this);

        state.control = 0x45;
        state.reading = false;

        this.address = options.address || this.ADDRESSES[0];

        options.address = this.address;
        this.io.i2cConfig(options);

        Object.assign(this.MODES, this.io.MODES);

        for (let i = 0; i < 4; i++) {
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
      value(pin) {
        if (typeof pin === "string" && pin[0] === "A") {
          return +pin.slice(1);
        }
        return pin;
      }
    },
    pinMode: {
      value(pin, mode) {
        this.pins[pin].mode = mode;
      }
    },
    analogRead: {
      value(pin, callback) {
        const state = priv.get(this);
        const pinIndex = pin;

        this.pins[pinIndex].report = 1;

        this.on(`analog-read-${pin}`, callback);

        // Since this operation will read all 4 pins,
        // it only needs to be initiated once.
        if (!state.reading) {
          state.reading = true;

          this.io.i2cRead(this.address, 4, data => {
            let value;
            for (let i = 0; i < 4; i++) {
              value = data[i] << 2;
              this.pins[i].value = value;

              if (this.pins[i].report) {
                this.emit(`analog-read-${i}`, value);
              }
            }
          });
        }
      }
    },
  },
  MUXSHIELD2: {
    initialize: {
      value() {
        const state = priv.get(this);

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

        let row = 1;
        let mask = 16;
        let index = 0;

        for (let i = 0; i < 48; i++) {
          const band = i & mask;

          if (band === mask) {
            row++;
            mask *= 2;
            index = 0;
          }

          state.pinMap[`IO${row}-${index}`] = i;

          this.pins.push({
            row,
            index,
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
      value(pin) {
        return pin;
      }
    },
    pinMode: {
      value(pin, mode) {
        const state = priv.get(this);
        const pinIndex = state.pinMap[pin];

        if (pinIndex === undefined) {
          throw new Error(`MUXSHIELD2: Invalid Pin number or name: ${pin}`);
        }

        const row = this.pins[pinIndex].row;
        const rowModeIndex = row - 1;
        const rowMode = state.rowMode[rowModeIndex];

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
        for (let i = 0; i < 16; i++) {
          this.pins[rowModeIndex + i].mode = mode;
        }

        const IO = state.io[row];
        const IOS = state.ios[row];

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
      value(pin, value) {
        const state = priv.get(this);
        const pinIndex = state.pinMap[pin];

        if (pinIndex === undefined) {
          throw new Error(`MUXSHIELD2: Invalid Pin number or name: ${pin}`);
        }

        const row = this.pins[pinIndex].row;
        const rowValueIndex = row - 1;
        let rowValue = state.rowValues[rowValueIndex];

        const ioPin = row - 1;
        const offset = ioPin * 16;
        const channel = pinIndex - offset;

        if (value) {
          rowValue |= 1 << channel;
        } else {
          rowValue &= ~(1 << channel);
        }

        this.io.digitalWrite(state.select[3], this.LOW);
        this.io.digitalWrite(state.outMode, this.HIGH);

        const S = state.select[row - 1];
        const IO = state.io[row];

        for (let i = 15; i >= 0; i--) {
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
      value(pin, callback) {
        this.ioRead("digital", pin, callback);
      }
    },
    analogRead: {
      value(pin, callback) {
        this.ioRead("analog", pin, callback);
      }
    },
    ioRead: {
      value(type, pin, callback) {
        const state = priv.get(this);
        const pinIndex = state.pinMap[pin];

        if (pinIndex === undefined) {
          throw new Error(`MUXSHIELD2: Invalid Pin number or name: ${pin}`);
        }

        this.on(`${type}-read-${pinIndex}`, callback);

        const isAnalog = type === "analog" ? true : false;
        const row = this.pins[pinIndex].row;
        const rowReadingIndex = row - 1;
        const offset = rowReadingIndex * 16;
        const channel = pinIndex - offset;

        this.pins[pinIndex].report = 1;
        this.pins[pinIndex].channel = channel;
        this.pins[pinIndex].ioPin = isAnalog ? rowReadingIndex : rowReadingIndex + 14;

        const nextPinIndex = () => {
          const startAt = nextPinIndex.lastPinIndex + 1;

          for (let i = startAt; i < this.pins.length; i++) {
            if (this.pins[i].report === 1) {
              nextPinIndex.lastPinIndex = i;
              return nextPinIndex.lastPinIndex;
            }
          }

          nextPinIndex.lastPinIndex = -1;

          return nextPinIndex();
        };

        nextPinIndex.lastPinIndex = -1;

        const handler = value => {
          const pinIndex = nextPinIndex.lastPinIndex;
          const pin = this.pins[pinIndex];

          this.emit(`${type}-read-${pinIndex}`, value);

          this.io.removeListener(`${type}-read-${pin.ioPin}`, handler);

          setTimeout(read, 10);
        };

        var read = () => {
          const pinIndex = nextPinIndex();
          const pin = this.pins[pinIndex];

          this.select(pin.channel);

          if (isAnalog) {
            this.io.pinMode(pin.ioPin, this.io.MODES.ANALOG);
            this.io.analogRead(pin.ioPin, handler);
          } else {
            this.io.digitalRead(pin.ioPin, handler);
          }
        };

        if (!state.rowReading[rowReadingIndex]) {
          state.rowReading[rowReadingIndex] = true;
          read();
        }
      }
    },


    select: {
      value(channel) {
        const state = priv.get(this);
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
      value(options) {
        const state = priv.get(this);

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
        this.isPwm = name => {
          const number = typeof name === "number" ? name : parseInt(name[1]);
          return number === 3 || number === 5 || number === 6;
        };

        this.address = options.address || this.ADDRESSES[0];
        options.address = this.address;

        this.io.i2cConfig(options);

        Object.assign(this.MODES, this.io.MODES);

        let analogChannel;

        for (let i = 0; i < 17; i++) {
          analogChannel = 127;

          if (i <= 1 || (i >= 9 && i < 14)) {
            // There are no connections for:
            // O, 1, 9, 10, 11, 12, 13
            this.pins.push({
              supportedModes: [],
              mode: 0,
              value: 0,
              report: 0,
              analogChannel
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
              analogChannel
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
              this.pinMode(`A${this.pins[i].analogChannel}`, this.MODES.ANALOG);
            } else {
              // Default all digital IO pins to
              // OUTPUT and LOW
              this.pinMode(`D${i}`, this.MODES.OUTPUT);
              this.digitalWrite(`D${i}`, this.LOW);
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
      value(pin) {
        return pin;
      }
    },

    pinMode: {
      value(pin, mode) {
        const state = priv.get(this);
        const pinIndex = state.pinMap[pin];

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
      value(pin, value) {
        const state = priv.get(this);
        const pinIndex = state.pinMap[pin];

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
      value(pin, type, callback) {
        const state = priv.get(this);
        const pinIndex = state.pinMap[pin];
        const isAnalog = type === "analog";
        const length = isAnalog ? 3 : 1;
        const command = isAnalog ? this.COMMANDS.ANALOG_READ : this.COMMANDS.DIGITAL_READ;

        this.on(`${type}-read-${pinIndex}`, callback);

        this.pins[pinIndex].report = 1;
        this.pins[pinIndex].command = command;
        this.pins[pinIndex].type = type;
        this.pins[pinIndex].length = length;

        const nextPinIndex = () => {
          const startAt = nextPinIndex.lastPinIndex + 1;

          for (let i = startAt; i < this.pins.length; i++) {
            if (this.pins[i].report === 1) {
              nextPinIndex.lastPinIndex = i;
              return nextPinIndex.lastPinIndex;
            }
          }

          nextPinIndex.lastPinIndex = -1;

          return nextPinIndex();
        };

        nextPinIndex.lastPinIndex = -1;

        const handler = (pinIndex, value) => {
          const pin = this.pins[pinIndex];
          let canEmit = true;

          if (pin.type === "digital" && this.pins[pinIndex].value === value) {
            canEmit = false;
          }

          this.pins[pinIndex].value = value;

          if (canEmit) {
            this.emit(`${pin.type}-read-${pinIndex}`, value);
          }

          setTimeout(read, 1);
        };

        var read = () => {
          const pinIndex = nextPinIndex();
          const pin = this.pins[pinIndex];
          const isAnalog = pin.type === "analog";

          this.io.i2cWrite(this.address, [pin.command, pinIndex, 0, 0]);
          this.io.i2cReadOnce(this.address, pin.length, data => {
            let value;

            if (isAnalog) {
              value = (data[1] << 8) + data[2];
            } else {
              value = data[0];
            }
            handler(pinIndex, value);
          });
        };

        if (!state.isReading) {
          state.isReading = true;
          read();
        }
      }
    },

    digitalRead: {
      value(pin, callback) {
        this.ioRead(pin, "digital", callback);
      },
    },
    analogRead: {
      value(pin, callback) {
        this.ioRead(pin, "analog", callback);
      },
    },
    pingRead: {
      value({pin}, callback) {
        const state = priv.get(this);
        const pinIndex = state.pinMap[pin];

        this.io.i2cWrite(
          this.address, [
            this.COMMANDS.PING_READ,
            pinIndex,
            0, 0
          ]
        );

        setTimeout(() => {
          this.once(`ping-read-${pin}`, callback);

          this.io.i2cReadOnce(this.address, 3, data => {
            // The GrovePi firmware sends this value in CM
            // so the value must be converted back to duration.
            const value = Math.round(((data[1] << 8) + data[2]) * 29 * 2);

            this.pins[pinIndex].value = value;
            this.emit(`ping-read-${pin}`, value);
          });
        }, 200);
      },
    },
    analogWrite: {
      value(pin, value) {
        this.pwmWrite(pin, value);
      }
    },
    pwmWrite: {
      writable: true,
      value(pin, value) {
        const state = priv.get(this);
        const pinIndex = state.pinMap[pin];

        value = Fn.constrain(value, 0, 255);

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
      value({pins}) {
        const state = priv.get(this);

        if (!pins.data) {
          throw new Error("Expected pins.data");
        }

        if (!pins.clock) {
          throw new Error("Expected pins.clock");
        }

        if (!pins.latch) {
          throw new Error("Expected pins.latch");
        }

        state.data = pins.data;
        state.clock = pins.clock;
        state.latch = pins.latch;
        state.value = 0x00;

        Object.assign(this.MODES, this.io.MODES);

        // Reset pins property to empty array.
        this.pins = [];

        for (let i = 0; i < 8; i++) {
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
      value(pin) {
        return pin;
      }
    },
    pinMode: {
      value(pin, mode) {
        this.pins[pin].mode = mode;
      }
    },
    digitalWrite: {
      value(pin, value) {
        const state = priv.get(this);

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
      value(port, value) {
        const state = priv.get(this);

        state.value = value;

        this.board.digitalWrite(state.latch, this.io.LOW);
        this.board.shiftOut(state.data, state.clock, true, state.value);
        this.board.digitalWrite(state.latch, this.io.HIGH);

        for (let i = 0; i < 8; i++) {
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
      value(options) {
        const state = priv.get(this);

        state.reading = false;

        this.address = options.address || this.ADDRESSES[0];

        options.address = this.address;
        this.io.i2cConfig(options);

        Object.assign(this.MODES, this.io.MODES);

        for (let i = 0; i < 16; i++) {
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
      value(pin) {
        if (typeof pin === "string" && pin[0] === "A") {
          return +pin.slice(1);
        }
        return pin;
      }
    },
    pinMode: {
      value(pin, mode) {
        this.pins[pin].mode = mode;
      }
    },
    analogRead: {
      value(pin, callback) {
        const state = priv.get(this);
        const pinIndex = pin;

        this.pins[pinIndex].report = 1;

        this.on(`analog-read-${pin}`, callback);

        this.io.i2cWrite(this.address, pinIndex, 1);

        // Since this operation will read all 4 pins,
        // it only needs to be initiated once.
        if (!state.reading) {
          state.reading = true;

          this.io.i2cRead(this.address, 32, data => {
            let value;
            for (let i = 0; i < 16; i++) {
              const index = i * 2;

              value = (data[index] << 8) + data[index + 1];

              this.pins[i].value = value;

              if (this.pins[i].report) {
                this.emit(`analog-read-${i}`, value);
              }
            }
          });
        }
      }
    },
  },

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
      value(options) {
        const state = priv.get(this);

        state.reading = false;

        this.address = options.address || this.ADDRESSES[0];

        options.address = this.address;

        this.io.i2cConfig(options);


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
        let ctrl1 = 0x07; // 0b00000111
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

        for (let i = 0; i < 4; i++) {
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
      value(pin) {
        if (typeof pin === "string" && pin[0] === "A") {
          return +pin.slice(1);
        }
        return pin;
      },
    },
    pinMode: {
      value(pin, mode) {
        this.pins[pin].mode = mode;
      },
    },
    analogRead: {
      value(pin, callback) {
        const state = priv.get(this);
        const pinIndex = pin;

        this.pins[pinIndex].report = 1;

        this.on(`analog-read-${pin}`, callback);

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
          this.io.i2cRead(this.address, this.REGISTER.OUT_ADC1_L | 0x80, 6, data => {
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

            for (let i = 1; i < 4; i++) {
              if (this.pins[i].report) {
                this.emit(`analog-read-${i}`, this.pins[i].value);
              }
            }
          });
        }
      },
    },
    i2cConfig: {
      value(...args) {
        return this.io.i2cConfig.apply(this.io, args);
      },
    },
    i2cWrite: {
      value(...args) {
        return this.io.i2cWrite.apply(this.io, args);
      },
    },
    i2cWriteReg: {
      value(...args) {
        return this.io.i2cWriteReg.apply(this.io, args);
      },
    },
    i2cRead: {
      value(...args) {
        return this.io.i2cRead.apply(this.io, args);
      },
    },
    i2cReadOnce: {
      value(...args) {
        return this.io.i2cReadOnce.apply(this.io, args);
      },
    },
  },

  ADS1115: {
    ADDRESSES: {
      value: [0x48, 0x49, 0x4A, 0x4B]
    },
    REGISTER: {
      value: {
        CONFIG: 0x01,
        READ: 0x00,
        PIN: [0xC1, 0xD1, 0xE1, 0xF1],
        PIN_DATA: 0x83,
      }
    },
    initialize: {
      value(options) {
        const state = priv.get(this);

        state.reading = false;

        this.address = options.address || this.ADDRESSES[0];

        options.address = this.address;
        this.io.i2cConfig(options);

        Object.assign(this.MODES, this.io.MODES);

        for (let i = 0; i < 4; i++) {
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

        this.name = "ADS1115";
        this.isReady = true;

        this.emit("connect");
        this.emit("ready");
      }
    },
    normalize: {
      value(pin) {
        if (typeof pin === "string" && pin[0] === "A") {
          return +pin.slice(1);
        }
        return pin;
      }
    },
    pinMode: {
      value(pin, mode) {
        this.pins[pin].mode = mode;
      }
    },
    analogRead: {
      value(pin, callback) {
        const state = priv.get(this);
        this.pins[pin].report = 1;

        let ready = false;

        this.on(`analog-read-${pin}`, callback);

        // Since this operation will read all 4 pins,
        // it only needs to be initiated once.
        if (!state.reading) {
          state.reading = true;

          // CONVERSION DELAY
          const delay = () => {
            setTimeout(() => {
              ready = true;
            }, 8);
          };

          this.io.i2cWrite(this.address, this.REGISTER.CONFIG, [this.REGISTER.PIN[pin], this.REGISTER.PIN_DATA]);
          delay();

          this.io.i2cRead(this.address, this.REGISTER.READ, 2, data => {
            if (ready) {
              ready = false;

              const newPin = pin === this.pins.length - 1 ? 0 : pin + 1;

              this.io.i2cWrite(this.address, this.REGISTER.CONFIG, [this.REGISTER.PIN[newPin], this.REGISTER.PIN_DATA]);

              const value = (data[0] << 8) + data[1];
              this.pins[pin].value = value;

              if (this.pins[pin].report) {
                this.emit(`analog-read-${pin}`, value);
              }

              pin = newPin;

              delay();
            }
          });
        }
      }
    },
  }
};

Controllers["CD74HCT4067"] = Controllers.CD74HC4067;
Controllers["74HC4067"] = Controllers.CD74HC4067;

Controllers.PCF8574A = Object.assign({}, Controllers.PCF8574, {
  ADDRESSES: {
    value: [0x38]
  }
});

const methods = Object.keys(Board.prototype);

Object.keys(Controllers).forEach(name => {
  methods.forEach(key => {
    if (Controllers[name][key] === undefined) {
      Controllers[name][key] = {
        writable: true,
        configurable: true,
        value() {
          throw new Error(`Expander:${name} does not support ${key}`);
        }
      };
    }
  });
});

const nonAddressable = [
  "74HC595"
];

class Expander extends Base {
  constructor(options) {
    super();

    let addressError = "Expander cannot reuse an active address";
    let expander = null;
    let controllerValue;

    if (typeof options === "string") {
      controllerValue = options;
    }

    Board.Component.call(
      this, options = Board.Options(options), {
        normalizePin: false,
        requestPin: false
      }
    );

    if (nonAddressable.includes(options.controller) &&
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

    if (typeof options.controller === "undefined" && controllerValue) {
      options.controller = controllerValue;
    }

    Board.Controller.call(this, Controllers, options);

    priv.set(this, {});

    if (typeof this.initialize === "function") {
      this.initialize(options);
    }

    active.set(this.address, this);
  }
}



Expander.get = required => {

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

  const expander = active.get(required.address);

  if (expander && (expander.name === required.controller.toUpperCase())) {
    return expander;
  }

  return new Expander(required);
};

Expander.byAddress = address => active.get(address);

Expander.byController = name => {
  let controller = null;

  active.forEach(value => {
    if (value.name === name.toUpperCase()) {
      controller = value;
    }
  });
  return controller;
};

Expander.hasController = key => Controllers[key] !== undefined;

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Expander.Controllers = Controllers;
  Expander.purge = () => {
    priv.clear();
    active.clear();
  };
}

module.exports = Expander;
