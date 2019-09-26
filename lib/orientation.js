const Board = require("./board");
const Emitter = require("events");
const priv = new Map();

const Controllers = {

  BNO055: {
    initialize: {
      value(options, dataHandler) {
        const IMU = require("./sip");
        const driver = IMU.Drivers.get(this.board, "BNO055", options);

        driver.on("data", data => {
          dataHandler(data);
        });
      }
    },
    toScaledEuler: {
      value({euler}) {

        return {
          heading: euler.heading / 16,
          roll: euler.roll / 16,
          pitch: euler.pitch / 16,
        };
      }
    },
    toScaledQuarternion: {
      value({quarternion}) {
        return {
          w: quarternion.w * (1 / (1 << 14)),
          x: quarternion.x * (1 / (1 << 14)),
          y: quarternion.y * (1 / (1 << 14)),
          z: quarternion.z * (1 / (1 << 14)),
        };
      }
    },
    calibration: {
      get() {
        return priv.get(this).calibration;
      }
    },
    isCalibrated: {
      get() {
        //only returns true if the calibration of the NDOF/Fusion algo is calibrated
        return ((this.calibration >> 6) & 0x03) === 0x03; //are we fully calibrated
      }
    }
  },
};


/**
 * Orientation
 * @constructor
 *
 * five.Orientation();
 *
 * five.Orientation({
 *  controller: "BNO055",
 *  freq: 50,
 * });
 *
 *
 * Device Shorthands:
 *
 * "BNO055": new five.Orientation()
 *
 *
 * @param {Object} options [description]
 *
 */
class Orientation extends Emitter {
  constructor(options) {
    super();

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(this, Controllers, options);

    const freq = options.freq || 25;
    const state = {
      euler: {
        heading: 0,
        roll: 0,
        pitch: 0,
      },
      quarternion: {
        w: 0,
        x: 0,
        y: 0,
        z: 0,
      },
      calibration: 0,
    };
    let raw = null;

    priv.set(this, state);

    /* istanbul ignore else */
    if (!this.toScaledQuarternion) {
      this.toScaledQuarternion = options.toScaledQuarternion || (x => x);
    }

    /* istanbul ignore else */
    if (!this.toScaledEuler) {
      this.toScaledEuler = options.toScaledEuler || (x => x);
    }


    /* istanbul ignore else */
    if (typeof this.initialize === "function") {
      this.initialize(options, data => raw = data);
    }

    setInterval(() => {
      if (raw === null) {
        return;
      }
      let didOrientationChange = false;
      let didCalibrationChange = false;

      ["heading", "roll", "pitch"].forEach(el => {
        /* istanbul ignore else */
        if (state.euler[el] !== raw.orientation.euler[el]) {
          didOrientationChange = true;
        }
        state.euler[el] = raw.orientation.euler[el];
      });

      ["w", "x", "y", "z"].forEach(el => {
        /* istanbul ignore else */
        if (state.quarternion[el] !== raw.orientation.quarternion[el]) {
          didOrientationChange = true;
        }
        state.quarternion[el] = raw.orientation.quarternion[el];
      });

      //if we have a raw calibration state...
      // not sure if this is the best place... some devices may not have a calibration state...
      if (raw.calibration) {
        /* istanbul ignore else */
        if (state.calibration !== raw.calibration) {
          didCalibrationChange = true;
        }
        state.calibration = raw.calibration;
      }

      const data = {
        euler: this.euler,
        quarternion: this.quarternion,
        calibration: this.calibration
      };

      this.emit("data", data);

      if (didOrientationChange) {
        this.emit("change", data);
      }

      //not sure how we can get this event into other drivers
      if (didCalibrationChange) {
        this.emit("calibration", this.calibration);
      }
    }, freq);
  }

  get euler() {
    return this.toScaledEuler(priv.get(this));
  }

  get quarternion() {
    return this.toScaledQuarternion(priv.get(this));
  }
}

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Orientation.Controllers = Controllers;
  Orientation.purge = () => {
    priv.clear();
  };
}


module.exports = Orientation;
