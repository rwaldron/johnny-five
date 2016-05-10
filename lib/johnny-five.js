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
  Compass: require("./compass"),
  Distance: require("./distance"),
  ESC: require("./esc"),
  Expander: require("./expander"),
  Fn: require("./fn"),
  GPS: require("./gps"),
  Gripper: require("./gripper"),
  Gyro: require("./gyro"),
  Hygrometer: require("./hygrometer"),
  IMU: require("./imu"),
  IR: require("./ir"),
  Keypad: require("./keypad"),
  LCD: require("./lcd"),
  Led: require("./led"),
  LedControl: require("./led/ledcontrol"),
  Light: require("./light"),
  Joystick: require("./joystick"),
  Motion: require("./motion"),
  Motor: require("./motor"),
  Nodebot: require("./nodebot"),
  Piezo: require("./piezo"),
  Ping: require("./ping"),
  Pir: require("./pir"),
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
 * @deprecated Will be deleted in version 1.0.0. Use Proximity instead.
 */
module.exports.IR.Distance = function(opts) {
  console.log("IR.Distance is deprecated. Use Proximity instead");
  return new module.exports.Distance(opts);
};

/**
 * @deprecated Will be deleted in version 1.0.0. Use Motion instead.
 */
module.exports.IR.Motion = function(opt) {
  console.log("IR.Motion is deprecated. Use Motion instead");
  return new module.exports.Pir(
    typeof opt === "number" ? opt : (
      opt.pin === undefined ? 7 : opt.pin
    )
  );
};

/**
 * @deprecated Will be deleted in version 1.0.0. Use Proximity instead.
 */
module.exports.IR.Proximity = function(opts) {
  console.log("IR.Proximity is deprecated. Use Proximity instead");
  // Fix a naming mistake.
  if (module.exports.Distance.Controllers.includes(opts.controller)) {
    return new module.exports.Distance(opts);
  }

  return new module.exports.IR({
    device: opts || "GP2Y0D805Z0F",
    freq: 50
  });
};

module.exports.IR.Proximity.Controllers = module.exports.Distance.Controllers;

module.exports.IR.Reflect = function(model) {
  return new module.exports.IR({
    device: model || "QRE1113GR",
    freq: 50
  });
};

// TODO: Eliminate .Array for 1.0.0
module.exports.IR.Reflect.Array = require("./reflectancearray");
module.exports.IR.Reflect.Collection = require("./reflectancearray");

module.exports.Magnetometer = function() {
  return new module.exports.Compass({
    controller: "HMC5883L",
    freq: 100,
    gauss: 1.3
  });
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
