const Board = require("./board");
const Emitter = require("events");
const Fn = require("./fn");
const Led = require("./led");
const Sensor = require("./sensor");

const CALIBRATED_MIN_VALUE = 0;
const CALIBRATED_MAX_VALUE = 1000;
const LINE_ON_THRESHOLD = 200;
const LINE_NOISE_THRESHOLD = 50;

const priv = new Map();


const Controllers = {
  DEFAULT: {
    initialize: {
      value(options) {

        if (typeof options.emitter === "undefined") {
          throw new Error("Emitter pin is required");
        }

        if (!options.pins || options.pins.length === 0) {
          throw new Error("Pins must be defined");
        }

        const state = priv.get(this);

        state.emitter = new Led({
          board: this.board,
          pin: options.emitter
        });

        state.sensorStates = options.pins.map((pin) => {
          const sensor = new Sensor({
            board: this.board,
            freq: state.freq,
            pin
          });

          const sensorState = {
            sensor,
            rawValue: 0,
            dataReceived: false,
          };

          sensor.on("data", value => {
            onData(this, sensorState, value);
          });

          return sensorState;
        });
      }
    }
  }
};

function onData(instance, sensorState, value) {
  const state = priv.get(instance);

  // Update this sensor state
  sensorState.dataReceived = true;
  sensorState.rawValue = value;

  // Check if all sensors have been read
  const allRead = state.sensorStates.every(({dataReceived}) => dataReceived);

  if (allRead) {
    instance.emit("data", instance.raw);

    if (state.autoCalibrate) {
      setCalibration(state.calibration, instance.raw);
    }

    if (instance.isCalibrated) {
      instance.emit("calibratedData", instance.values);
      instance.emit("line", instance.line);
    }

    state.sensorStates.forEach(sensorState => {
      sensorState.dataReceived = false;
    });
  }
}

function setCalibration(calibration, values) {
  values.forEach((value, i) => {
    if (calibration.min[i] === undefined || value < calibration.min[i]) {
      calibration.min[i] = value;
    }

    if (calibration.max[i] === undefined || value > calibration.max[i]) {
      calibration.max[i] = value;
    }
  });
}

function calibrationIsValid(calibration, sensors) {
  return calibration &&
    (calibration.max && calibration.max.length === sensors.length) &&
    (calibration.min && calibration.min.length === sensors.length);
}


function calibratedValues(instance) {
  return instance.raw.map((value, i) => {
    return Fn.constrain(
      Fn.scale(
        value,
        instance.calibration.min[i],
        instance.calibration.max[i],
        CALIBRATED_MIN_VALUE,
        CALIBRATED_MAX_VALUE
      ),
      CALIBRATED_MIN_VALUE,
      CALIBRATED_MAX_VALUE
    );
  });
}

function maxLineValue(instance) {
  return (instance.sensors.length - 1) * CALIBRATED_MAX_VALUE;
}

// Returns a value between 0 and (n-1)*1000
// Given 5 sensors, the value will be between 0 and 4000
function getLine(instance, whiteLine) {
  const state = priv.get(instance);
  let onLine = false;
  let avg = 0;
  let sum = 0;

  whiteLine = !!whiteLine;

  instance.values.forEach((value, i) => {
    value = whiteLine ? (CALIBRATED_MAX_VALUE - value) : value;

    if (value > LINE_ON_THRESHOLD) {
      onLine = true;
    }

    if (value > LINE_NOISE_THRESHOLD) {
      avg += value * i * CALIBRATED_MAX_VALUE;
      sum += value;
    }
  });

  if (!onLine) {
    const maxPoint = maxLineValue(instance) + 1;
    const centerPoint = maxPoint / 2;

    return state.lastLine < centerPoint ? 0 : maxPoint;
  }

  return state.lastLine = Math.floor(avg / sum);
}

class ReflectanceArray extends Emitter {
  constructor(options) {
    super();

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(this, Controllers, options);

    // Read event throttling
    const {
      autoCalibrate = false,
      freq = 25,
    } = options;

    // Make private data entry
    const state = {
      autoCalibrate,
      freq,
      lastLine: 0,
      isOn: false,
      calibration: {
        min: [],
        max: []
      },
    };

    priv.set(this, state);

    if (typeof this.initialize === "function") {
      this.initialize(options);
    }

    Object.defineProperties(this, {
      isOn: {
        get() {
          return state.emitter.isOn;
        }
      },
      isCalibrated: {
        get() {
          return calibrationIsValid(this.calibration, this.sensors);
        }
      },
      isOnLine: {
        get() {
          const line = this.line;
          return line > CALIBRATED_MIN_VALUE && line < maxLineValue(this);
        }
      },
      sensors: {
        get() {
          return state.sensorStates.map(({sensor}) => sensor);
        }
      },
      calibration: {
        get() {
          return state.calibration;
        }
      },
      raw: {
        get() {
          return state.sensorStates.map(({rawValue}) => rawValue);
        }
      },
      values: {
        get() {
          return this.isCalibrated ? calibratedValues(this) : this.raw;
        }
      },
      line: {
        get() {
          return this.isCalibrated ? getLine(this) : 0;
        }
      }
    });
  }

  // Public methods
  enable() {
    priv.get(this).emitter.on();
    return this;
  }

  disable() {
    priv.get(this).emitter.off();
    return this;
  }

  // Calibrate will store the min/max values for this sensor array
  // It should be called many times in order to get a lot of readings
  // on light and dark areas.  See calibrateUntil for a convenience
  // for looping until a condition is met.
  calibrate() {
    this.once("data", values => {
      setCalibration(priv.get(this).calibration, values);
      this.emit("calibrated");
    });
    return this;
  }

  // This will continue to calibrate until the predicate is true.
  // Allows the user to calibrate n-times, or wait for user input,
  // or base it on calibration heuristics.  However the user wants.
  calibrateUntil(predicate) {
    const loop = () => {
      this.calibrate();
      this.once("calibrated", () => {
        if (!predicate()) {
          loop();
        }
      });
    };

    loop();

    return this;
  }

  // Let the user tell us what the calibration data is
  // This allows the user to save calibration data and
  // reload it without needing to calibrate every time.
  loadCalibration(calibration) {
    if (!calibrationIsValid(calibration, this.sensors)) {
      throw new Error("Calibration data not properly set: {min: [], max: []}");
    }

    priv.get(this).calibration = calibration;

    return this;
  }
}

module.exports = ReflectanceArray;
