var Board = require("./board");
var Collection = require("./mixins/collection");
var EVS = require("./evshield");
var Fn = require("./fn");
var within = require("./mixins/within");
var Emitter = require("events").EventEmitter;
var util = require("util");
var Pins = Board.Pins;

var toFixed = Fn.toFixed;

var priv = new Map();

function analogHandler(opts, dataHandler) {
  this.io.pinMode(this.pin, this.io.MODES.ANALOG);
  this.io.analogRead(this.pin, function(data) {
    dataHandler.call(this, data);
  }.bind(this));
}

var Controllers = {
  GP2Y0A21YK: {
    // https://www.sparkfun.com/products/242
    initialize: {
      value: analogHandler
    },
    toCm: {
      value: function(raw) {
        return toFixed(12343.85 * Math.pow(raw, -1.15), 2);
      }
    }
  },
  GP2D120XJ00F: {
    // https://www.sparkfun.com/products/8959
    initialize: {
      value: analogHandler
    },
    toCm: {
      value: function(raw) {
        return toFixed((2914 / (raw + 5)) - 1, 2);
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
      value: function(raw) {
        return toFixed(10650.08 * Math.pow(raw, -0.935) - 10, 2);
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
      value: function(raw) {
        return toFixed(2076 / (raw - 11), 2);
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
      value: function(raw) {
        return toFixed(3.8631e8 * Math.pow(raw, -2.463343), 0);
      }
    }
  },
  SRF10: {
    initialize: {
      value: function(opts, dataHandler) {

        var address = opts.address || 0x70;
        var msUntilNextRead = 65;

        opts.address = address;

        // Set up I2C data connection
        this.io.i2cConfig(opts);

        // Startup parameter
        this.io.i2cWrite(address, [0x01, 16]);
        this.io.i2cWrite(address, [0x02, 255]);

        function read() {
          this.io.i2cWrite(address, [0x02]);
          this.io.i2cReadOnce(address, 2, function(data) {
            dataHandler((data[0] << 8) | data[1]);
          }.bind(this));

          prime.call(this);
        }

        function prime() {
          // 0x51 result in cm (centimeters)
          this.io.i2cWrite(address, [0x00, 0x51]);

          setTimeout(read.bind(this), msUntilNextRead);
        }

        prime.call(this);
      }
    },
    toCm: {
      value: function(raw) {
        return raw;
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
      value: function(raw) {
        // From http://www.maxbotix.com/articles/032.htm
        // ADC -> inches -> cm
        //
        //
        // From intro in page 1
        // 'The LV-MaxSonar-EZ detects objects
        // from 0-inches to 254-inches (6.45-meters) and provides sonar range information from 6-
        // inches out to 254-inches with 1-inch resolution.'
        // 1inch = 2.54cm
        return toFixed((raw / 2) * 2.54, 2);
      }
    }
  },
  // HRLV-MaxSonar-EZ0
  MB1003: {
    initialize: {
      value: analogHandler
    },
    toCm: {
      value: function(raw) {
        // http://www.maxbotix.com/articles/032.htm
        //
        //
        // From intro in page 1
        // 'This sensor line features 1-mm resolution, .....'
        return toFixed(raw / 2, 1);
      }
    }
  },
  // XL-MaxSonar-EZ3
  MB1230: {
    initialize: {
      value: analogHandler
    },
    toCm: {
      value: function(raw) {
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
        return raw >> 0;
      }
    }
  },
  HCSR04: {
    initialize: {
      value: function(opts, dataHandler) {
        var pinValue = opts.pinValue;
        var msToNextRead = 65;

        if (Pins.isFirmata(this)) {
          if (typeof pinValue === "string" && pinValue[0] === "A") {
            pinValue = this.io.analogPins[+pinValue.slice(1)];
          }

          pinValue = +pinValue;

          if (this.io.analogPins.includes(pinValue)) {
            opts.pin = pinValue;
          }

          this.pin = opts.pin;
        }

        // Private settings object
        var settings = {
          pin: opts.pin,
          value: this.io.HIGH,
          pulseOut: 5,
        };

        var read = function() {
          this.io.pingRead(settings, function(microseconds) {
            dataHandler(microseconds);
            setTimeout(read, msToNextRead);
          });
        }.bind(this);

        read();
      }
    },
    toCm: {
      value: function(raw) {
        // https://www.sparkfun.com/products/13959
        //
        //
        // From `Product features` paragraph at page 1
        // 'Ultrasonic ranging module HC - SR04 provides 2cm - 400cm non-contact
        // measurement function, the ranging accuracy can reach to 3mm'
        return toFixed(raw / 29.1 / 2, 1);
      }
    }
  },
  HCSR04I2CBACKPACK: {
    initialize: {
      value: function(opts, datahandler) {
        var address = opts.address || 0x27;
        var msToNextRead = 90;

        opts.address = address;

        // set up IO connection:
        this.io.i2cConfig(opts);

        if (typeof opts.pin === "undefined") {
          this.pin = 8;
        }

        var read = function() {
          // Read the 2 data bytes from the "register" for the pin.
          // When firmware is complete, update to:
          // this.io.i2cReadOnce(address, this.pin, 2, function(data) {
          this.io.i2cReadOnce(address, 2, function(data) {
            datahandler((data[0] << 8) + data[1]);
            setTimeout(read, msToNextRead);
          });
        }.bind(this);

        read();
      }
    },
    toCm: {
      value: function(raw) {
        return toFixed(raw / 29.1 / 2, 1);
      }
    }
  },
  LIDARLITE: {
    REGISTER: {
      value: {
        ENABLE: 0x00,
        READ: 0x8F,
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        var address = 0x62;

        opts.address = address;

        this.io.i2cConfig(opts);

        var read = function() {
          this.io.i2cWrite(address, this.REGISTER.ENABLE, 0x04);
          setTimeout(function() {
            this.io.i2cReadOnce(address, this.REGISTER.READ, 2, function(bytes) {
              // Step 5 of Quick Start Guide
              dataHandler((bytes[0] << 8) + bytes[1]);
              read();
            });
          }.bind(this), 20);
        }.bind(this);

        read();
      }
    },
    toCm: {
      value: function(raw) {

        //
        // From `Technology` paragraph at page 11
        // 'Our patented, high"accuracy"
        // measurement"technique"enables"distance"measurement"accuracy down"to 1cm..'
        return raw >> 0;
      }
    }
  },
  EVS_EV3_IR: {
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);

        state.shield = EVS.shieldPort(opts.pin);

        state.ev3 = new EVS(Object.assign(opts, {
          io: this.io
        }));
        state.ev3.setup(state.shield, EVS.Type_EV3);
        state.ev3.read(state.shield, EVS.Proximity, EVS.Proximity_Bytes, function(data) {
          var value = data[0] | (data[1] << 8);

          dataHandler(value);
        });
      }
    },
    toCm: {
      value: function(raw) {
        return raw;
      }
    }
  },
  EVS_EV3_US: {
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);

        state.shield = EVS.shieldPort(opts.pin);

        state.ev3 = new EVS(Object.assign(opts, {
          io: this.io
        }));
        state.ev3.setup(state.shield, EVS.Type_EV3);
        state.ev3.read(state.shield, EVS.Proximity, EVS.Proximity_Bytes, function(data) {
          var value = data[0] | (data[1] << 8);
          dataHandler(value);
        });
      }
    },
    toCm: {
      value: function(raw) {
        return raw / 10;
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
].forEach(function(alias) {
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
].forEach(function(alias) {
  Controllers[alias] = Controllers.HCSR04I2CBACKPACK;
});


// LIDAR Lite
Controllers["LIDAR-Lite"] = Controllers.LIDARLITE;


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
 * @param {Object} opts [description]
 *
 */

function Proximity(opts) {

  if (!(this instanceof Proximity)) {
    return new Proximity(opts);
  }

  var controller = null;
  var state = {};
  var raw = 0;
  var freq = opts.freq || 25;
  var last = 0;
  var pinValue = typeof opts === "object" ? opts.pin : opts;

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  if (typeof opts.controller === "string") {
    controller = Controllers[opts.controller];
  } else {
    controller = opts.controller || Controllers["GP2Y0A21YK"];
  }

  Board.Controller.call(this, controller, opts);

  if (!this.toCm) {
    this.toCm = opts.toCm || function(x) {
      return x;
    };
  }

  priv.set(this, state);

  Object.defineProperties(this, {
    /**
     * [read-only] Calculated centimeter value
     * @property centimeters
     * @type Number
     */
    centimeters: {
      get: function() {
        return this.toCm(raw);
      }
    },
    cm: {
      get: function() {
        return this.centimeters;
      }
    },
    /**
     * [read-only] Calculated inch value
     * @property inches
     * @type Number
     */
    inches: {
      get: function() {
        return toFixed(this.centimeters * 0.39, 2);
      }
    },
    in: {
      get: function() {
        return this.inches;
      }
    },
  });

  if (typeof this.initialize === "function") {
    opts.pinValue = pinValue;
    this.initialize(opts, function(data) {
      raw = data;
    });
  }

  setInterval(function() {
    if (raw === undefined) {
      return;
    }

    var data = {
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
  }.bind(this), freq);
}

Proximity.Controllers = [
  "2Y0A21", "GP2Y0A21YK",
  "2D120X", "GP2D120XJ00F",
  "2Y0A02", "GP2Y0A02YK0F",
  "OA41SK", "GP2Y0A41SK0F",
  "0A21", "GP2Y0A21YK",
  "0A02", "GP2Y0A02YK0F",
];

util.inherits(Proximity, Emitter);

Object.assign(Proximity.prototype, within);


/**
 * new Proximity.Collection();
 */

Proximity.Collection = function(numsOrObjects) {
  if (!(this instanceof Proximity.Collection)) {
    return new Proximity.Collection(numsOrObjects);
  }

  Object.defineProperty(this, "type", {
    value: Proximity
  });

  Collection.Emitter.call(this, numsOrObjects);
};

util.inherits(Proximity.Collection, Collection.Emitter);

Collection.installMethodForwarding(
  Proximity.Collection.prototype, Proximity.prototype
);

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Proximity.Controllers = Controllers;
  Proximity.purge = function() {
    priv.clear();
  };
}

module.exports = Proximity;
