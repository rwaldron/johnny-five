const Board = require("./board");
const Collection = require("./mixins/collection");
const EVS = require("./evshield");
const Fn = require("./fn");
const Withinable = require("./mixins/withinable");
const Pins = Board.Pins;

const toFixed = Fn.toFixed;

const priv = new Map();

function analogHandler(options, callback) {
  this.io.pinMode(this.pin, this.io.MODES.ANALOG);
  this.io.analogRead(this.pin, data => {
    callback.call(this, data);
  });
}

const Controllers = {
  GP2Y0A21YK: {
    // https://www.sparkfun.com/products/242
    initialize: {
      value: analogHandler
    },
    toCm: {
      value(value) {
        return toFixed(12343.85 * (value ** -1.15), 2);
      }
    }
  },
  GP2D120XJ00F: {
    // https://www.sparkfun.com/products/8959
    initialize: {
      value: analogHandler
    },
    toCm: {
      value(value) {
        return toFixed((2914 / (value + 5)) - 1, 2);
      }
    }
  },
  GP2Y0A02YK0F: {
    // https://www.sparkfun.com/products/8958
    // 15cm - 150cm
    initialize: {
      value: analogHandler
    },
    toCm: {
      value(value) {
        return toFixed(10650.08 * (value ** -0.935) - 10, 2);
      }
    }
  },
  GP2Y0A41SK0F: {
    // https://www.sparkfun.com/products/12728
    // 4cm - 30cm
    initialize: {
      value: analogHandler
    },
    toCm: {
      value(value) {
        return toFixed(2076 / (value - 11), 2);
      }
    }
  },
  GP2Y0A710K0F: {
    // https://www.adafruit.com/products/1568
    // 100cm - 500cm
    initialize: {
      value: analogHandler
    },
    toCm: {
      value(value) {
        return toFixed(3.8631e8 * (value ** -2.463343), 0);
      }
    }
  },
  SRF10: {
    ADDRESSES: {
      value: [0x70]
    },
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        const address = Drivers.addressResolver(this, options);
        const msUntilNextRead = 65;

        // Set up I2C data connection
        this.io.i2cConfig(options);

        // Startup parameter
        this.io.i2cWrite(address, [0x01, 0x10]);
        this.io.i2cWrite(address, [0x02, 0xFF]);

        const read = () => {
          // 0x51 result in cm (centimeters)
          this.io.i2cWrite(address, [0x00, 0x51]);
          setTimeout(() => {
            this.io.i2cWrite(address, [0x02]);
            this.io.i2cReadOnce(address, 2, data => callback((data[0] << 8) | data[1]));
            read();
          }, msUntilNextRead);
        };

        read();
      }
    },
    toCm: {
      value(value) {
        return value;
      }
    }
  },
  // LV-MaxSonar-EZ
  // LV-MaxSonar-EZ0
  // LV-MaxSonar-EZ1
  MB1000: {
    initialize: {
      value: analogHandler
    },
    toCm: {
      value(value) {
        // From http://www.maxbotix.com/articles/032.htm
        // ADC -> inches -> cm
        //
        //
        // From intro in page 1
        // 'The LV-MaxSonar-EZ detects objects
        // from 0-inches to 254-inches (6.45-meters) and provides sonar range information from 6-
        // inches out to 254-inches with 1-inch resolution.'
        // 1inch = 2.54cm
        return toFixed((value / 2) * 2.54, 2);
      }
    }
  },
  // HRLV-MaxSonar-EZ0
  MB1003: {
    initialize: {
      value: analogHandler
    },
    toCm: {
      value(value) {
        // http://www.maxbotix.com/articles/032.htm
        //
        //
        // From intro in page 1
        // 'This sensor line features 1-mm resolution, .....'
        return toFixed(value / 2, 1);
      }
    }
  },
  // XL-MaxSonar-EZ3
  MB1230: {
    initialize: {
      value: analogHandler
    },
    toCm: {
      value(value) {
        // From http://www.maxbotix.com/articles/016.htm
        // Using a Standard Range XL-MaxSonar with an ADC (Analog Digital Converter)
        // When using a standard XL-MaxSonar with an ADC, verify that the sensor
        // and micro-controller are referencing the same power supply and ground.
        // This also assumes that the ADC being used is perfectly accurate.
        // When reading the sensor's output with the scaling in centimeters with a
        // 10-bit ADC, the range can be read directly off the ADC.
        // If the ADC output reads 700 the range in centimeters is 700 centimeters.
        //
        // ADC -> cm
        //
        //
        // From intro on page 1
        // 'The MB1200 and MB1300 sensor series detects objects from 0-cm1
        //  to 765-cm (25.1 feet) or 1068cm (35 feet) (select models) and
        // provide sonar range information from 20-cm2
        //  out to765-cm or 1068-cm (select models) with 1-cm resolution...'
        return value >> 0;
      }
    }
  },
  HCSR04: {
    initialize: {
      value(options, callback) {
        let pinValue = options.pinValue;
        const msToNextRead = 65;

        if (Pins.isFirmata(this)) {
          if (typeof pinValue === "string" &&
              (pinValue.length > 1 && pinValue[0] === "A")) {
            pinValue = this.io.analogPins[+pinValue.slice(1)];
          }

          pinValue = +pinValue;

          if (this.io.analogPins.includes(pinValue)) {
            options.pin = pinValue;
          }

          this.pin = options.pin;
        }

        // Private settings object
        const settings = {
          pin: options.pin,
          value: this.io.HIGH,
          pulseOut: 5,
        };

        const read = () => {
          this.io.pingRead(settings, microseconds => {
            callback(microseconds);
            setTimeout(read, msToNextRead);
          });
        };

        read();
      }
    },
    toCm: {
      value(value) {
        // https://www.sparkfun.com/products/13959
        //
        //
        // From `Product features` paragraph at page 1
        // 'Ultrasonic ranging module HC - SR04 provides 2cm - 400cm non-contact
        // measurement function, the ranging accuracy can reach to 3mm'
        return toFixed(value / 29.1 / 2, 1);
      }
    }
  },
  HCSR04I2CBACKPACK: {
    ADDRESSES: {
      value: [
        0x27
      ]
    },
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        const address = Drivers.addressResolver(this, options);
        const msToNextRead = 90;

        // set up IO connection:
        this.io.i2cConfig(options);

        if (typeof options.pin === "undefined") {
          this.pin = 8;
        }

        const read = () => {
          // Read the 2 data bytes from the "register" for the pin.
          // When firmware is complete, update to:
          // this.io.i2cReadOnce(address, this.pin, 2, function(data) {
          this.io.i2cReadOnce(address, 2, data => {
            callback((data[0] << 8) + data[1]);
            setTimeout(read, msToNextRead);
          });
        };

        read();
      }
    },
    toCm: {
      value(value) {
        return toFixed(value / 29.1 / 2, 1);
      }
    }
  },
  LIDARLITE: {
    ADDRESSES: {
      value: [
        0x62
      ]
    },
    REGISTER: {
      value: {
        ENABLE: 0x00,
        READ: 0x8F,
      }
    },
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        const address = Drivers.addressResolver(this, options);

        this.io.i2cConfig(options);

        const read = () => {
          this.io.i2cWrite(address, this.REGISTER.ENABLE, 0x04);
          setTimeout(() => {
            this.io.i2cReadOnce(address, this.REGISTER.READ, 2, bytes => {
              // Step 5 of Quick Start Guide
              callback((bytes[0] << 8) + bytes[1]);
              read();
            });
          }, 20);
        };

        read();
      }
    },
    toCm: {
      value(value) {

        //
        // From `Technology` paragraph at page 11
        // 'Our patented, high"accuracy"
        // measurement"technique"enables"distance"measurement"accuracy down"to 1cm..'
        return value >> 0;
      }
    }
  },
  EVS_EV3_IR: {
    initialize: {
      value(options, callback) {
        const state = priv.get(this);

        state.shield = EVS.shieldPort(options.pin);

        state.ev3 = new EVS(Object.assign(options, {
          io: this.io
        }));
        state.ev3.setup(state.shield, EVS.Type_EV3);
        state.ev3.read(state.shield, EVS.Proximity, EVS.Proximity_Bytes, data => callback(data[0] | (data[1] << 8)));
      }
    },
    toCm: {
      value(value) {
        return value;
      }
    }
  },
  EVS_EV3_US: {
    initialize: {
      value(options, callback) {
        const state = priv.get(this);

        state.shield = EVS.shieldPort(options.pin);

        state.ev3 = new EVS(Object.assign(options, {
          io: this.io
        }));
        state.ev3.setup(state.shield, EVS.Type_EV3);
        state.ev3.read(state.shield, EVS.Proximity, EVS.Proximity_Bytes, data => callback(data[0] | (data[1] << 8)));
      }
    },
    toCm: {
      value(value) {
        return value / 10;
      }
    }
  },
};

// Sensor aliases
// IR
Controllers["2Y0A21"] = Controllers.GP2Y0A21YK;
Controllers["2D120X"] = Controllers.GP2D120XJ00F;
Controllers["2Y0A02"] = Controllers.GP2Y0A02YK0F;
Controllers["0A41"] = Controllers.GP2Y0A41SK0F;
Controllers["0A21"] = Controllers.GP2Y0A21YK;
Controllers["0A02"] = Controllers.GP2Y0A02YK0F;
Controllers["41SK0F"] = Controllers.GP2Y0A41SK0F;
Controllers["21YK"] = Controllers.GP2Y0A21YK;
Controllers["2YK0F"] = Controllers.GP2Y0A02YK0F;

// Sonar
Controllers.MB1010 = Controllers.MB1000;

Controllers["LV-MaxSonar-EZ"] = Controllers.MB1000;
Controllers["LV-MaxSonar-EZ0"] = Controllers.MB1000;
Controllers["LV-MaxSonar-EZ1"] = Controllers.MB1010;
Controllers["HRLV-MaxSonar-EZ0"] = Controllers.MB1003;
Controllers["XL-MaxSonar-EZ3"] = Controllers.MB1230;

// Ping
[
  "HC-SR04",
  "SR04",
  "SRF05",
  "SRF06",
  "PARALLAXPING",
  "SEEEDPING",
  "GROVEPING",
  "PING_PULSE_IN",
  "ULTRASONIC_PING",
].forEach(alias => {
  Controllers[alias] = Controllers.HCSR04;
});

// Ping/HCSR04 I2C Backpack
[
  "HCSR04-I2C-BACKPACK",
  "HC-SR04-I2C-BACKPACK",
  "SR04-I2C-BACKPACK",
  "SR04I2CBACKPACK",
  "PINGI2CBACKPACK",
  "PING-I2C-BACKPACK",
  "HCSR04_I2C_BACKPACK",
  "HC_SR04_I2C_BACKPACK",
  "SR04_I2C_BACKPACK",
  "SR04I2CBACKPACK",
  "PINGI2CBACKPACK",
  "PING_I2C_BACKPACK",
].forEach(alias => {
  Controllers[alias] = Controllers.HCSR04I2CBACKPACK;
});


// LIDAR Lite
Controllers["LIDAR-Lite"] = Controllers.LIDARLITE;
Controllers.DEFAULT = Controllers["GP2Y0A21YK"];

/**
 * Proximity
 * @constructor
 *
 * five.Proximity("A0");
 *
 * five.Proximity({
 *  controller: "GP2Y0A41SK0F",
 *  pin: "A0",
 *  freq: 100
 * });
 *
 *
 * @param {Object} options [description]
 *
 */

class Proximity extends Withinable {
  constructor(options) {
    super();

    const pinValue = typeof options === "object" ? options.pin : options;

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(this, Controllers, options);

    const state = {};
    const freq = options.freq || 25;
    let raw = 0;
    let last = 0;

    if (!this.toCm) {
      this.toCm = options.toCm || (x => x);
    }

    priv.set(this, state);

    Object.defineProperties(this, {
      /**
       * [read-only] Calculated centimeter value
       * @property centimeters
       * @type Number
       */
      centimeters: {
        get() {
          return this.toCm(raw);
        }
      },
      cm: {
        get() {
          return this.centimeters;
        }
      },
      /**
       * [read-only] Calculated inch value
       * @property inches
       * @type Number
       */
      inches: {
        get() {
          return toFixed(this.centimeters * 0.39, 2);
        }
      },
      in: {
        get() {
          return this.inches;
        }
      },
    });

    if (typeof this.initialize === "function") {
      options.pinValue = pinValue;
      this.initialize(options, data => raw = data);
    }

    setInterval(() => {
      if (raw === undefined) {
        return;
      }

      const data = {
        cm: this.cm,
        centimeters: this.centimeters,
        in: this.in,
        inches: this.inches
      };

      this.emit("data", data);

      if (raw !== last) {
        last = raw;
        this.emit("change", data);
      }
    }, freq);
  }

}
/**
 * new Proximity.Collection();
 */

Proximity.Collection = class extends Collection.Emitter {
  constructor(numsOrObjects) {
    super(numsOrObjects);
  }

  get type() {
    return Proximity;
  }
};

Collection.installMethodForwarding(
  Proximity.Collection.prototype, Proximity.prototype
);

Proximity.Controllers = Object.keys(Controllers);

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Proximity.Controllers = Controllers;
  Proximity.purge = () => {
    priv.clear();
  };
}

module.exports = Proximity;
