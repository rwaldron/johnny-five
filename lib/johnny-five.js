if (!Array.from || !Object.assign || !Map) {
  require("es6-shim");
}

if (!Array.prototype.includes) {
  require("./array-includes-shim");
}

module.exports = {
  // extract-start:apinames
  Accelerometer: require("./accelerometer"),
  Animation: require("./animation"),
  Altimeter: require("./altimeter"),
  Barometer: require("./barometer"),
  Board: require("./board"),
  Button: require("./button"),
  Color: require("./color"),
  Collection: require("./mixins/collection"),
  Compass: require("./compass"),
  ESC: require("./esc"),
  Expander: require("./expander"),
  Fn: require("./fn"),
  GPS: require("./gps"),
  Gripper: require("./gripper"),
  Gyro: require("./gyro"),
  Hygrometer: require("./hygrometer"),
  IMU: require("./imu"),
  Keypad: require("./keypad"),
  LCD: require("./lcd"),
  Led: require("./led"),
  LedControl: require("./led/ledcontrol"),
  Light: require("./light"),
  Joystick: require("./joystick"),
  Motion: require("./motion"),
  Motor: require("./motor"),
  Piezo: require("./piezo"),
  Ping: require("./ping"),
  Pin: require("./pin"),
  Proximity: require("./proximity"),
  Relay: require("./relay"),
  Repl: require("./repl"),
  Sensor: require("./sensor"),
  Servo: require("./servo"),
  ShiftRegister: require("./shiftregister"),
  Sonar: require("./sonar"),
  Stepper: require("./stepper"),
  Switch: require("./switch"),
  Thermometer: require("./thermometer"),
  Wii: require("./wii")
  // extract-end:apinames
};

// Customized constructors
//
//
module.exports.Board.Virtual = function(opts) {
  var temp;

  if (opts instanceof module.exports.Expander) {
    temp = {
      io: opts
    };
  } else {
    temp = opts;
  }

  return new module.exports.Board(
    Object.assign({}, {
      repl: false,
      debug: false,
      sigint: false
    }, temp)
  );
};

module.exports.Multi = module.exports.IMU;

module.exports.Analog = function(opts) {
  return new module.exports.Sensor(opts);
};

module.exports.Digital = function(opts) {
  var pin;

  if (typeof opts === "number" || typeof opts === "string") {
    pin = opts;
    opts = {
      type: "digital",
      pin: pin
    };
  } else {
    opts.type = opts.type || "digital";
  }

  return new module.exports.Sensor(opts);
};

module.exports.Sensor.Analog = module.exports.Analog;
module.exports.Sensor.Digital = module.exports.Digital;

/**
 * @deprecated Will be deleted in version 1.0.0. Use Thermometer instead.
 */
module.exports.Temperature = module.exports.Thermometer;


/**
 * @deprecated Will be deleted in version 1.0.0. Use Motion or Proximity instead.
 */
module.exports.IR = function() {
  throw new Error("IR has been removed. Use Motion or Proximity instead.");
};

/**
 * @deprecated Will be deleted in version 1.0.0. Use Proximity instead.
 */
module.exports.IR.Distance = function() {
  throw new Error("IR.Distance has been removed. Use Proximity instead.");
};

/**
 * @deprecated Will be deleted in version 1.0.0. Use Proximity instead.
 */
module.exports.IR.Proximity = function() {
  throw new Error("IR.Proximity has been removed. Use Proximity instead.");
};

/**
 * @deprecated Will be deleted in version 1.0.0. Use Motion instead.
 */
module.exports.IR.Motion = function() {
  throw new Error("IR.Motion has been removed. Use Motion instead.");
};

// TODO: Eliminate .Array for 1.0.0
module.exports.IR.Reflect = {};
module.exports.IR.Reflect.Array = require("./reflectancearray");
module.exports.IR.Reflect.Collection = module.exports.IR.Reflect.Array;

module.exports.Luxmeter = function(options) {
  return new module.exports.Light(options);
};

module.exports.Magnetometer = function(options) {
  return new module.exports.Compass(options);
};

// Short-handing, Aliases
module.exports.Boards = module.exports.Board.Collection;
module.exports.Buttons = module.exports.Button.Collection;
module.exports.ESCs = module.exports.ESC.Collection;
module.exports.Leds = module.exports.Led.Collection;
module.exports.Led.RGBs = module.exports.Led.RGB.Collection;
module.exports.Motors = module.exports.Motor.Collection;
module.exports.Pins = module.exports.Pin.Collection;
module.exports.Relays = module.exports.Relay.Collection;
module.exports.Sensors = module.exports.Sensor.Collection;
module.exports.Servos = module.exports.Servo.Collection;
module.exports.Switches = module.exports.Switch.Collection;

// Direct Alias
module.exports.Touchpad = module.exports.Keypad;

// Back Compat
module.exports.Nunchuk = module.exports.Wii.Nunchuk;
