const Board = require("./board");
const Fn = require("./fn");
const Emitter = require("events");
const toFixed = Fn.toFixed;
const priv = new Map();

const Controllers = {

  SHT31D: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        const driver = Drivers.get(this.board, "SHT31D", options);
        driver.on("data", ({humidity}) => {
          callback(humidity);
        });
      }
    },
    toRelativeHumidity: {
      writable: true,
      value(raw) {
        // Page 2, Table 1
        // Based on the "Relative Humidity Conversion" formula
        // 1.1 Humidity Sensor Performance
        // Typical resoultion 0.01%RH
        //
        // Page 14
        // 4.13 Conversion of Signal Output
        // RH = 100 * (Srh / ((2 ** 26) - 1))
        // Srh = Sensor raw humidity
        return toFixed((100 * raw / 65535), 2);
      }
    }
  },


  HTU21D: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        const driver = Drivers.get(this.board, "HTU21D", options);
        driver.on("data", ({humidity}) => {
          callback(humidity);
        });
      }
    },
    toRelativeHumidity: {
      writable: true,
      value(raw) {
        // Page 15
        // CONVERSION OF SIGNAL OUTPUTS
        // RH = -6 + 125 * (Srh / (2 ** 26))
        // Srh = Sensor raw humidity
        //
        // Page 3, Table `SENSOR PERFORMANCE`
        //
        // Typical resolution 0.04 %RH
        return toFixed((125 * raw / 65536) - 6, 2);
      }
    }
  },

  HIH6130: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        const driver = Drivers.get(this.board, "HIH6130", options);
        driver.on("data", ({humidity}) => {
          callback(humidity);
        });
      }
    },
    toRelativeHumidity: {
      // Page 7, Table 2
      // Typical resoultion 0.04%RH
      writable: true,
      value(raw) {
        // Page 3
        // Equation 1: Humidity Conversion Function
        return toFixed(raw * 100 / (Fn.POW_2_14 - 1), 2);
      }
    }
  },

  DHT_I2C_NANO_BACKPACK: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        const driver = Drivers.get(this.board, "DHT_I2C_NANO_BACKPACK", options);
        driver.on("data", ({humidity}) => {
          callback(humidity);
        });
      }
    },
    toRelativeHumidity: {
      // DHT11

      // Page 4, Table
      // Typical resolution 1%RH
      //
      // DHT21

      // Page 2, Paragraph 5
      // Resolution 0.1%RH
      //
      // DHT22

      // Page 2, Paragraph 3
      // Resolution 0.1%RH
      writable: true,
      value(raw) {
        return toFixed(raw / 100, 1);
      }
    }
  },

  TH02: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        const driver = Drivers.get(this.board, "TH02", options);
        driver.on("data", ({humidity}) => {
          callback(humidity);
        });
      }
    },
    toRelativeHumidity: {
      // Table 4
      // Resolution 12bit (16 codes per %RH) -> ~ 2 fractional digits
      writable: true,
      value(raw) {
        if (raw > 100) {
          raw = 0;
        }
        return toFixed(raw || 0, 2);
      }
    }
  },

  SI7020: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        const driver = Drivers.get(this.board, "SI7020", options);
        driver.on("data", ({humidity}) => {
          callback(humidity);
        });
      }
    },
    toRelativeHumidity: {
      writable: true,
      value(raw) {
        // Page 7, Table 4
        // The device can have 12-bit resolution ~ 2 fractional digits (100 / 2^12)
        //
        // Humidity formula
        // P. 22
        return toFixed((125 * raw / 65536) - 6, 2);
      }
    }
  },

  BME280: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        const driver = Drivers.get(this.board, "BME280", options);
        driver.on("data", ({humidity}) => {
          callback(humidity);
        });
      }
    },
    toRelativeHumidity: {
      writable: true,
      value(raw) {
        // Page 23
        // 47445 / 1024 = 46.333 %RH
        return toFixed(raw / 1024, 3);
      }
    }
  }
};

Controllers.DHT11_I2C_NANO_BACKPACK = Controllers.DHT_I2C_NANO_BACKPACK;
Controllers.DHT21_I2C_NANO_BACKPACK = Controllers.DHT_I2C_NANO_BACKPACK;
Controllers.DHT22_I2C_NANO_BACKPACK = Controllers.DHT_I2C_NANO_BACKPACK;
Controllers.SI7021 = Controllers.SI7020;


class Hygrometer extends Emitter {
  constructor(options) {
    super();

    const freq = options.freq || 25;
    let last = null;
    let raw = null;

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(this, Controllers, options);

    priv.set(this, {});


    if (!this.toRelativeHumidity) {
      this.toRelativeHumidity = options.toRelativeHumidity || (x => x);
    }

    const propDescriptors = {
      relativeHumidity: {
        get() {
          return this.toRelativeHumidity(raw);
        }
      }
    };
    // Convenience aliases
    propDescriptors.RH = propDescriptors.relativeHumidity;

    Object.defineProperties(this, propDescriptors);

    if (typeof this.initialize === "function") {
      this.initialize(options, data => {
        raw = data;
      });
    }

    setInterval(() => {
      if (raw == null) {
        return;
      }

      if (Number.isNaN(this.relativeHumidity)) {
        return;
      }

      const data = {};
      data.RH = data.relativeHumidity = this.relativeHumidity;

      this.emit("data", data);

      if (this.relativeHumidity !== last) {
        last = this.relativeHumidity;
        this.emit("change", data);
      }
    }, freq);
  }
}

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Hygrometer.Controllers = Controllers;
  Hygrometer.purge = () => {
    priv.clear();
  };
}

module.exports = Hygrometer;
