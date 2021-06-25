const Board = require("./board");
const Emitter = require("./mixins/emitter");
const Fn = require("./fn");

const sum = Fn.sum;
const toFixed = Fn.toFixed;

const priv = new Map();
const axes = ["x", "y", "z"];

const Controllers = {
  ANALOG: {
    initialize: {
      value(options, callback) {
        const pins = options.pins || [];
        let sensitivity;
        let resolution;
        const state = priv.get(this);
        const dataPoints = {};

        if (options.sensitivity === undefined) {
          throw new Error("Expected a Sensitivity");
        }

        // 4.88mV / (0.167mV/dps * 2)
        // 0.67 = 4X
        // 0.167 = 1X
        sensitivity = options.sensitivity;
        resolution = options.resolution || 4.88;
        state.K = resolution / sensitivity;

        pins.forEach(function(pin, index) {
          this.io.pinMode(pin, this.io.MODES.ANALOG);
          this.io.analogRead(pin, data => {
            const axis = axes[index];
            dataPoints[axis] = data;
            callback(dataPoints);
          });
        }, this);
      }
    },
    toNormal: {
      value(raw) {
        return raw >> 2;
      }
    },
    toDegreesPerSecond: {
      value(raw, rawCenter) {
        const normal = this.toNormal(raw);
        const center = this.toNormal(rawCenter);
        const state = priv.get(this);

        return ((normal - center) * state.K) | 0;
      }
    }
  },
  // http://www.invensense.com/mems/gyro/mpu6050.html
  // Default to the +- 250 which has a 131 LSB/dps
  MPU6050: {
    initialize: {
      value(options, callback) {
        const IMU = require("./sip");
        const state = priv.get(this);
        const driver = IMU.Drivers.get(this.board, "MPU6050", options);

        state.sensitivity = options.sensitivity || 131;

        driver.on("data", ({gyro}) => {
          callback(gyro);
        });
      }
    },
    toNormal: {
      value(raw) {
        return (raw >> 11) + 127;
      }
    },
    toDegreesPerSecond: {
      // Page 12, Paragraph 6.1
      // Sensitivity scale factor
      // FS_SEL=0    131 LSB/dps -> 0,007633588 dps/LSB
      // FS_SEL=1    65.5 LSB/dps -> 0,015267176 dps/LSB
      // FS_SEL=2    32.8 LSB/dps -> 0,00304878 dps/LSB
      // FS_SEL=3    16.4 LSB/dps -> 0,06097561 dps/LSB
      // Using 4 digits resolution
      value(raw, rawCenter) {
        const state = priv.get(this);

        return toFixed((raw - rawCenter) / state.sensitivity, 4);
      }
    }
  },
  BNO055: {
    initialize: {
      value(options, callback) {
        const IMU = require("./sip");
        const state = priv.get(this);
        const driver = IMU.Drivers.get(this.board, "BNO055", options);

        // AF p.14, OUTPUT SIGNAL GYROSCOPE, set this to 16 as according to AF.51 the default for the unit register
        // is degrees. and there may be a bug in the Ada fruit code as it has the setting to radians disabled
        // but the sensitivity / scale set to 900 which is used for radian reps
        state.sensitivity = 16;

        driver.on("data", ({gyro}) => {
          callback(gyro);
        });
      }
    },
    toNormal: {
      value(raw) {
        return raw;
      }
    },
    toDegreesPerSecond: {
      // Page 33, Table 3-22
      // Gyroscope unit settings 1dps = 16 LSB -> resolution 0,0625 dps with +=2000 dps range
      value(raw) {
        const state = priv.get(this);
        return toFixed(raw / state.sensitivity, 4);
      }
    }
  },
};

Controllers.DEFAULT = Controllers.ANALOG;

class Gyro extends Emitter {
  constructor(options) {
    super();

    let isCalibrated = false;
    const sampleSize = 100;

    const state = {
      x: {
        angle: 0,
        value: 0,
        previous: 0,
        calibration: [],
        stash: [0, 0, 0, 0, 0],
        center: 0,
        hasValue: false
      },
      y: {
        angle: 0,
        value: 0,
        previous: 0,
        calibration: [],
        stash: [0, 0, 0, 0, 0],
        center: 0,
        hasValue: false
      },
      z: {
        angle: 0,
        value: 0,
        previous: 0,
        calibration: [],
        stash: [0, 0, 0, 0, 0],
        center: 0,
        hasValue: false
      }
    };

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(this, Controllers, options);

    if (!this.toNormal) {
      this.toNormal = options.toNormal || (raw => raw);
    }

    if (!this.toDegreesPerSecond) {
      this.toDegreesPerSecond = options.toDegreesPerSecond || (raw => raw);
    }

    priv.set(this, state);

    if (typeof this.initialize === "function") {
      this.initialize(options, data => {
        let isChange = false;

        Object.keys(data).forEach(axis => {
          const value = data[axis];
          const sensor = state[axis];

          sensor.previous = sensor.value;
          sensor.stash.shift();
          sensor.stash.push(value);
          sensor.hasValue = true;
          sensor.value = (sum(sensor.stash) / 5) | 0;

          if (!isCalibrated &&
            (state.x.calibration.length === sampleSize &&
              state.y.calibration.length === sampleSize &&
              (this.z === undefined || state.z.calibration.length === sampleSize))) {

            isCalibrated = true;
            state.x.center = (sum(state.x.calibration) / sampleSize) | 0;
            state.y.center = (sum(state.y.calibration) / sampleSize) | 0;
            state.z.center = (sum(state.z.calibration) / sampleSize) | 0;

            state.x.calibration.length = 0;
            state.y.calibration.length = 0;
            state.z.calibration.length = 0;
          } else {
            if (sensor.calibration.length < sampleSize) {
              sensor.calibration.push(value);
            }
          }

          if (sensor.previous !== sensor.value) {
            isChange = true;
          }
        });

        if (isCalibrated) {
          state.x.angle += this.rate.x / 100;
          state.y.angle += this.rate.y / 100;
          state.z.angle += this.rate.z / 100;

          this.emit("data", {
            x: this.x,
            y: this.y,
            z: this.z
          });

          if (isChange) {
            this.emit("change", {
              x: this.x,
              y: this.y,
              z: this.z
            });
          }
        }
      });
    }

    Object.defineProperties(this, {
      isCalibrated: {
        get() {
          return isCalibrated;
        },
        set(value) {
          if (typeof value === "boolean") {
            isCalibrated = value;
          }
        }
      },
      pitch: {
        get() {
          return {
            rate: toFixed(this.rate.y, 2),
            angle: toFixed(state.y.angle, 2)
          };
        }
      },
      roll: {
        get() {
          return {
            rate: toFixed(this.rate.x, 2),
            angle: toFixed(state.x.angle, 2)
          };
        }
      },
      yaw: {
        get() {
          return {
            rate: this.z !== undefined ? toFixed(this.rate.z, 2) : 0,
            angle: this.z !== undefined ? toFixed(state.z.angle, 2) : 0
          };
        }
      },
      x: {
        get() {
          return toFixed(this.toNormal(state.x.value), 4);
        }
      },
      y: {
        get() {
          return toFixed(this.toNormal(state.y.value), 4);
        }
      },
      z: {
        get() {
          return state.z.hasValue ? toFixed(this.toNormal(state.z.value), 4) : undefined;
        }
      },
      rate: {
        get() {
          const x = this.toDegreesPerSecond(state.x.value, state.x.center);
          const y = this.toDegreesPerSecond(state.y.value, state.y.center);
          const z = state.z.hasValue ?
            this.toDegreesPerSecond(state.z.value, state.z.center) : 0;

          return {
            x,
            y,
            z
          };
        }
      }
    });
  }

  recalibrate() {
    this.isCalibrated = false;
  }
}

Object.defineProperties(Gyro, {
  TK_4X: {
    value: 0.67
  },
  TK_1X: {
    value: 0.167
  }
});


/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Gyro.Controllers = Controllers;
  Gyro.purge = () => {
    priv.clear();
  };
}
module.exports = Gyro;
