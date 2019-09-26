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
  Gyro: require("./gyro"),
  Hygrometer: require("./hygrometer"),
  SIP: require("./sip"),
  Keypad: require("./keypad"),
  LCD: require("./lcd"),
  Led: require("./led"),
  LedControl: require("./led/ledcontrol"),
  Light: require("./light"),
  Joystick: require("./joystick"),
  Motion: require("./motion"),
  Motor: require("./motor"),
  Orientation: require("./orientation"),
  Piezo: require("./piezo"),
  Pin: require("./pin"),
  Proximity: require("./proximity"),
  ReflectanceArray: require("./reflectancearray"),
  Relay: require("./relay"),
  Repl: require("./repl"),
  Sensor: require("./sensor"),
  Servo: require("./servo"),
  ShiftRegister: require("./shiftregister"),
  Stepper: require("./stepper"),
  Switch: require("./switch"),
  Thermometer: require("./thermometer"),
  // extract-end:apinames
};

// Customized constructors
//
//
module.exports.Board.Virtual = function(options) {
  let temp;

  if (options instanceof module.exports.Expander) {
    temp = {
      io: options
    };
  } else {
    temp = options;
  }

  return new module.exports.Board(
    Object.assign({}, {
      repl: false,
      debug: false,
      sigint: false
    }, temp)
  );
};

module.exports.Sensor.Analog = module.exports.Sensor;
module.exports.Sensor.Digital = function(options) {
  let pin;
  let type = "digital";

  if (typeof options === "number" ||
      typeof options === "string") {
    pin = options;
    options = {
      type,
      pin
    };
  } else {
    options.type = type;
  }

  return new module.exports.Sensor(options);
};

// Short-handing & Aliases
module.exports.IMU = module.exports.SIP;
module.exports.Multi = module.exports.SIP;
module.exports.Luxmeter = module.exports.Light;
module.exports.Magnetometer = module.exports.Compass;
module.exports.Ping = module.exports.Proximity;
module.exports.Sonar = module.exports.Proximity;
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
module.exports.Touchpad = module.exports.Keypad;
