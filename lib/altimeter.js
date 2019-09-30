const Board = require("./board");
const Emitter = require("events");
const { toFixed } = require("./fn");
const priv = new Map();

const Controllers = {
  MPL3115A2: {
    requirements: {
      value: {
        options: {
          elevation: {
            throws: false,
            message: "Missing `elevation` option. Without a specified base `elevation`, the altitude measurement will be inaccurate. Use the meters value shown on whatismyelevation.com",
            typeof: "number",
          }
        }
      }
    },
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "MPL3115A2", options)
          .on("data", ({altitude}) => callback(altitude));
      }
    },
    toMeters: {
      writable: true,
      value(value) {

        // Table 2, Note 3
        // "Smallest bit change in register represents minimum value change in
        // Pascals or meters. Typical resolution to signify change in altitudeis 0.3 m"
        return toFixed(value, 1);
      }
    }
  },
  MS5611: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "MS5611", options)
          .on("data", ({altitude}) => callback(altitude));
      }
    },
    toMeters: {
      writable: true,
      value(value) {
        // Datasheet available at http://www.te.com/commerce/DocumentDelivery/DDEController?Action=srchrtrv&DocNm=MS5611-01BA03&DocType=Data+Sheet&DocLang=English
        //
        // From page 1
        // "This barometric pressure sensor is optimized for
        // altimeters and variometers with an altitude resolution of 10 cm."
        return toFixed(value, 2);
      }
    }
  },

  BMP180: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "BMP180", options)
          .on("data", ({altitude}) => callback(altitude));
      }
    },
    toMeters: {
      writable: true,
      value(value) {
        // Page 6, Table 1
        // Resolution of output data 0.01hPa
        //
        // From paragraph 3.6, page 16 1hPa=8.43m
        // resolution ~= 0.08m
        return toFixed(value, 2);
      }
    }
  },

  BMP280: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "BMP280", options)
          .on("data", ({altitude}) => callback(altitude));
      }
    },
    toMeters: {
      writable: true,
      value(value) {
        // Page 8, Table 2
        // Resolution of output data in ultra high resolution mode 0.0016hPa
        // 1hPa=8.43m
        // resolution ~= 0.013m
        return toFixed(value, 3);
      }
    }
  },
  BME280: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "BME280", options)
          .on("data", ({altitude}) => callback(altitude));
      }
    },
    toMeters: {
      writable: true,
      value(value) {
        // Page 10, Table 3
        // Resolution of pressure output data 0.18Pa
        // 1hPa=8.43m
        // 100Pa=8.43m
        // resolution ~= 0.015m
        return toFixed(value, 3);
      }
    }
  },

};

Controllers["BMP085"] = Controllers["BMP-085"] = Controllers.BMP180;


class Altimeter extends Emitter {
  constructor(options) {
    super();

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(this, Controllers, options);

    const state = {};
    const freq = options.freq || 25;
    let last = null;
    let value = null;

    if (!this.toMeters) {
      this.toMeters = options.toMeters || (x => x);
    }

    priv.set(this, state);

    const descriptors = {
      meters: {
        get() {
          return this.toMeters(value);
        }
      },
      feet: {
        get() {
          return toFixed(this.meters * 3.28084, 2);
        }
      }
    };
    // Convenience aliases
    descriptors.m = descriptors.meters;
    descriptors.ft = descriptors.feet;

    Object.defineProperties(this, descriptors);


    /* istanbul ignore else */
    if (typeof this.initialize === "function") {
      this.initialize(options, data => value = data);
    }

    setInterval(() => {
      if (value == null) {
        return;
      }

      const data = {};
      data.m = data.meters = this.meters;
      data.ft = data.feet = this.feet;

      this.emit("data", data);

      /* istanbul ignore else */
      if (this.meters !== last) {
        last = this.meters;
        this.emit("change", data);
      }
    }, freq);
  }
}

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Altimeter.Controllers = Controllers;
  Altimeter.purge = function() {
    priv.clear();
  };
}


module.exports = Altimeter;
