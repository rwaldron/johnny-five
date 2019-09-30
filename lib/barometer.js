const Board = require("./board");
const Emitter = require("events");
const { toFixed } = require("./fn");

const Controllers = {
  MPL115A2: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "MPL115A2", options)
          .on("data", ({pressure}) => callback(pressure));
      }
    },
    // kPa (Kilopascals)
    toPressure: {
      value(value) {
        // Pressure output in kPa explained at P. 6, Eqn. 2
        // Typical resolution 0.15kPa from paragraph 2.2 page 3
        return toFixed(((65 / 1023) * value) + 50, 2);
      }
    }
  },
  MPL3115A2: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "MPL3115A2", options)
          .on("data", ({pressure}) => callback(pressure));
      }
    },
    // kPa (Kilopascals)
    toPressure: {
      value(value) {
        // formulas extracted from code example:
        // https://github.com/adafruit/Adafruit_MPL3115A2_Library
        const inches = (value / 4) / 3377;
        const output = inches * 3.39;

        // Page 8, Table 5
        // Typical resolution 1.5Pa = 0.0015kPa
        return toFixed(output, 4);
      }
    }
  },
  BMP180: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "BMP180", options)
          .on("data", ({pressure}) => callback(pressure));
      }
    },
    // kPa (Kilopascals)
    toPressure: {
      value(value) {
        // Page 6, Table 1
        // Typical resolution 0.01hPa = 0.001kPa
        return toFixed(value / 1000, 3);
      }
    }
  },
  BMP280: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "BMP280", options)
          .on("data", ({pressure}) => callback(pressure));
      }
    },
    // kPa (Kilopascals)
    toPressure: {
      value(value) {
        // Page 8, Table 2
        // Resolution in ultra high resolution mode 0.0016hPa = 0.00016kPa
        return toFixed(value / 1000, 5);
      }
    }
  },
  BME280: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "BME280", options)
          .on("data", ({pressure}) => callback(pressure));
      }
    },
    // kPa (Kilopascals)
    toPressure: {
      value(value) {
        // Page 10, Table 3
        // Typical resolution 0.18Pa = 0.00018kPa
        return toFixed(value / 1000, 5);
      }
    }
  },
  MS5611: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "MS5611", options)
          .on("data", ({pressure}) => callback(pressure));
      }
    },
    toPressure: {
      value(value) {
        // Page 2, Table ?
        // Resolution      Over sampling ratio
        // 0.065mbar       256
        // 0.042mbar       512
        // 0.027mbar       1024
        // 0.018mbar       2048
        // 0.012mbar       4096
        //
        // 0.012mbar = 1,2Pa = 0.0012kPa
        return toFixed(value / 1000, 4);
      }
    }
  },
};

Controllers.BMP085 = Controllers.BMP180;

/**
 * Barometer
 * @constructor
 *
 * five.Barometer(options);
 *
 * five.Barometer({
 *   controller: "CONTROLLER"
 *   address: 0x00
 * });
 *
 *
 * @param {Object} options [description]
 *
 */

class Barometer extends Emitter {
  constructor(options) {
    super();

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(this, Controllers, options);

    const freq = options.freq || 25;
    let last = null;
    let raw = null;

    if (!this.toPressure) {
      this.toPressure = options.toPressure || (x => x);
    }

    if (typeof this.initialize === "function") {
      this.initialize(options, data => {
        raw = data;
      });
    }

    Object.defineProperties(this, {
      pressure: {
        get() {
          return this.toPressure(raw);
        }
      }
    });

    setInterval(() => {
      if (raw === null) {
        return;
      }

      const data = {
        pressure: this.pressure
      };

      this.emit("data", data);

      if (this.pressure !== last) {
        last = this.pressure;
        this.emit("change", data);
      }
    }, freq);
  }
}

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Barometer.Controllers = Controllers;
  Barometer.purge = function() {};
}

module.exports = Barometer;
