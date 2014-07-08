/*
 * johnny-five
 * https://github.com/rwldrn/johnny-five
 *
 * Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
 * Licensed under the MIT license.
 */
var es6 = require("es6-shim");
var es7 = require("../lib/es7-shim");

[
  "Accelerometer",
  "Board",
  "Button",
  "Compass",
  "Distance",
  "ESC",
  "Fn",
  "Gripper",
  "Gyro",
  "IR",
  "LCD",
  "Led",
  "LedControl",
  "Joystick",
  "Motor",
  "Nodebot",
  "Piezo",
  "Ping",
  "Pir",
  "Pin",
  // "PWMServo",
  "Relay",
  "Repl",
  "Sensor",
  "Servo",
  "ShiftRegister",
  "Sonar",
  "Stepper",
  "Switch",
  "Wii"
].forEach(function(constructor) {
  module.exports[constructor] = require(
    "../lib/" + constructor.toLowerCase()
  );
});


// Customized constructors
//
//

module.exports.Analog = function(opts) {
  return new module.exports.Sensor(opts);
};

module.exports.Digital = function(opts) {
  var pin;

  if (typeof opts === "number") {
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

module.exports.IR.Distance = function(opts) {
  return new module.exports.Distance(opts);
};

module.exports.IR.Motion = function(opt) {
  return new module.exports.Pir(
    typeof opt === "number" ? opt : (
      opt.pin === undefined ? 7 : opt.pin
    )
  );
};

module.exports.IR.Proximity = function(model) {
  return new module.exports.IR({
    device: model || "GP2Y0D805Z0F",
    freq: 50
  });
};

module.exports.IR.Reflect = function(model) {
  return new module.exports.IR({
    device: model || "QRE1113GR",
    freq: 50
  });
};

module.exports.Magnetometer = function() {
  return new module.exports.Compass({
    device: "HMC5883L",
    freq: 100,
    gauss: 1.3
  });
};

module.exports.Led.Matrix = function(opts) {
  opts.isMatrix = true;
  return new module.exports.LedControl(opts);
};

Object.keys(module.exports.LedControl).forEach(function(key) {
  module.exports.Led.Matrix[key] = module.exports.LedControl[key];
});

// Short-handing, Aliases
module.exports.Boards = module.exports.Board.Array;
module.exports.ESCs = module.exports.ESC.Array;
module.exports.Leds = module.exports.Led.Array;
module.exports.Servos = module.exports.Servo.Array;


// Back Compat
module.exports.Nunchuk = module.exports.Wii.Nunchuk;
