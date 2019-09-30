const Board = require("./board");
const Collection = require("./mixins/collection");
const Emitter = require("events");
const priv = new Map();


function analogInitializer({pin}, dataHandler) {
  const state = priv.get(this);

  this.io.pinMode(pin, this.io.MODES.ANALOG);

  setTimeout(() => {
    state.isCalibrated = true;
    this.emit("calibrated");
  }, 10);

  this.io.analogRead(pin, dataHandler);
}

const initialize = {
  value: analogInitializer
};

const Controllers = {
  PIR: {
    initialize: {
      value(options, dataHandler) {
        const state = priv.get(this);
        const calibrationDelay = typeof options.calibrationDelay !== "undefined" ?
          options.calibrationDelay : 2000;

        this.io.pinMode(options.pin, this.io.MODES.INPUT);

        setTimeout(() => {
          state.isCalibrated = true;
          this.emit("calibrated");
        }, calibrationDelay);

        this.io.digitalRead(options.pin, dataHandler);
      }
    },
    toBoolean: {
      value(raw) {
        return !!raw;
      }
    }
  },
  GP2Y0D805Z0F: {
    ADDRESSES: {
      value: [0x26]
    },
    initialize: {
      value(options, dataHandler) {
        const { Drivers } = require("./sip");
        const address = Drivers.addressResolver(this, options);
        const state = priv.get(this);

        // This is meaningless for GP2Y0D805Z0F.
        // The event is implemented for consistency
        // with the digital passive infrared sensor
        setTimeout(() => {
          state.isCalibrated = true;
          this.emit("calibrated");
        }, 10);


        // Set up I2C data connection
        this.io.i2cConfig(options);

        this.io.i2cWriteReg(address, 0x03, 0xFE);
        this.io.i2cWrite(address, [0x00]);
        this.io.i2cRead(address, 1, data => {
          dataHandler(data[0] & 0x02);
        });
      }
    },
    toBoolean: {
      value(raw) {
        return raw === 0;
      }
    }
  },
  GP2Y0D810Z0F: {
    initialize,
    toBoolean: {
      value(raw) {
        return raw >> 9 === 0;
      }
    }
  },
  GP2Y0A60SZLF: {
    initialize,
    toBoolean: {
      value(raw) {
        return raw >> 9 === 1;
      }
    }
  }
};

Controllers.GP2Y0D815Z0F = Controllers.GP2Y0D810Z0F;

Controllers["HC-SR501"] = Controllers.PIR;
Controllers["HCSR501"] = Controllers.PIR;
Controllers["0D805"] = Controllers.GP2Y0D805Z0F;
Controllers["805"] = Controllers.GP2Y0D805Z0F;
Controllers["0D810"] = Controllers.GP2Y0D810Z0F;
Controllers["810"] = Controllers.GP2Y0D810Z0F;
Controllers["0D815"] = Controllers.GP2Y0D815Z0F;
Controllers["815"] = Controllers.GP2Y0D815Z0F;
Controllers["0A60SZLF"] = Controllers.GP2Y0A60SZLF;
Controllers["60SZLF"] = Controllers.GP2Y0A60SZLF;
Controllers.DEFAULT = Controllers.PIR;
/**
 * Motion
 * @constructor
 *
 * five.Motion(7);
 *
 * five.Motion({
 *  controller: "PIR",
 *  pin: 7,
 *  freq: 100,
 *  calibrationDelay: 1000
 * });
 *
 *
 * @param {Object} options [description]
 *
 */

class Motion extends Emitter {
  constructor(options) {

    super();

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(this, Controllers, options);

    let last = false;
    const freq = options.freq || 25;
    const state = {
      value: false,
      isCalibrated: false
    };

    priv.set(this, state);

    Object.defineProperties(this, {
      /**
       * [read-only] Current sensor state
       * @property detectedMotion
       * @type Boolean
       */
      detectedMotion: {
        get() {
          return this.toBoolean(state.value);
        }
      },
      /**
       * [read-only] Sensor calibration status
       * @property isCalibrated
       * @type Boolean
       */
      isCalibrated: {
        get() {
          return state.isCalibrated;
        }
      },
    });

    if (typeof this.initialize === "function") {
      this.initialize(options, data => state.value = data);
    }

    setInterval(() => {
      let isChange = false;
      const eventData = {
        timestamp: Date.now(),
        detectedMotion: this.detectedMotion,
        isCalibrated: state.isCalibrated
      };

      if (state.isCalibrated && this.detectedMotion && !last) {
        this.emit("motionstart", eventData);
      }

      if (state.isCalibrated && !this.detectedMotion && last) {
        this.emit("motionend", eventData);
      }

      if (last !== this.detectedMotion) {
        isChange = true;
      }

      this.emit("data", eventData);

      if (isChange) {
        this.emit("change", eventData);
      }

      last = this.detectedMotion;
    }, freq);
  }
}

/**
 * Motion.Collection()
 * new Motion.Collection()
 *
 * Constructs an Array-like instance
 */
Motion.Collection = class extends Collection.Emitter {
  constructor(numsOrObjects) {
    super(numsOrObjects);
  }

  get type() {
    return Motion;
  }
};

Collection.installMethodForwarding(
  Motion.Collection.prototype, Motion.prototype
);


/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Motion.Controllers = Controllers;
  Motion.purge = () => {
    priv.clear();
  };
}

module.exports = Motion;
