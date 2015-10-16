var Board = require("../lib/board");
var EVS = require("../lib/evshield");
var within = require("./mixins/within");
var __ = require("./fn");
var Emitter = require("events").EventEmitter;
var util = require("util");
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
        return +(12343.85 * Math.pow(raw, -1.15)).toFixed(2);
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
        return +((2914 / (raw + 5)) - 1).toFixed(2);
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
        return +(10650.08 * Math.pow(raw, -0.935) - 10).toFixed(2);
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
        return +(2076 / (raw - 11)).toFixed(2);
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
        // http://www.basicx.com/Products/robotbook/ir%20curve%20fit.pdf
        return 3.8631e8 * Math.pow(raw, -2.463343);
      }
    }
  },
  SRF10: {
    initialize: {
      value: function(opts, dataHandler) {

        var address = 0x70;
        var msUntilNextRead = 65;

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
        return (raw / 2) * 2.54;
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
        return raw / 2;
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
        return raw;
      }
    }
  },
  HCSR04: {
    initialize: {
      value: function(opts, dataHandler) {
        // Private settings object
        var settings = {
          pin: opts.pin,
          value: this.io.HIGH,
          pulseOut: 5
        };

        var read = function() {
          this.io.pingRead(settings, function(microseconds) {
            dataHandler(microseconds);
            setTimeout(function() {
              read();
            }, 65);
          });
        }.bind(this);

        read();
      }
    },
    toCm: {
      value: function(raw) {
        return +(raw / 29.1 / 2).toFixed(3);
      }
    }
  },
  LIDARLITE: {
    initialize: {
      value: function(opts, dataHandler) {
        var ADDRESS = 0x62;
        var ENABLE = 0x00;
        var MEASUREMODE = 0x04;
        var READREGISTER = 0x8f;
        var BYTES_TO_READ = 0x02;

        this.io.i2cConfig(opts);

        var read = function() {
          this.io.i2cWrite(ADDRESS, ENABLE, MEASUREMODE);
          setTimeout(function() {
            this.io.i2cReadOnce(ADDRESS, READREGISTER, BYTES_TO_READ, function(bytes) {
              // http://www.robotshop.com/media/files/pdf/operating-manual-llm20c132i500s011.pdf
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
        return raw;
      }
    }
  },
  EVS_EV3_IR: {
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);

        state.shield = EVS.shieldPort(opts.pin);

        state.ev3 = new EVS(Object.assign(opts, { io: this.io }));
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

        state.ev3 = new EVS(Object.assign(opts, { io: this.io }));
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
Controllers["HC-SR04"] = Controllers.HCSR04;
Controllers["SR04"] = Controllers.HCSR04;
Controllers["SRF05"] = Controllers.HCSR04;
Controllers["SRF06"] = Controllers.HCSR04;
Controllers["PARALLAXPING"] = Controllers.HCSR04;
Controllers["SEEEDPING"] = Controllers.HCSR04;
Controllers["GROVEPING"] = Controllers.HCSR04;
Controllers["PING_PULSE_IN"] = Controllers.HCSR04;

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

  Board.Device.call(
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
        return +(this.centimeters * 0.39).toFixed(2);
      }
    },
    in: {
      get: function() {
        return this.inches;
      }
    },
  });

  if (typeof this.initialize === "function") {
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

__.mixin(Proximity.prototype, within);

module.exports = Proximity;
