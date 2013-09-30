/*
 * johnny-five
 * https://github.com/rwldrn/johnny-five
 *
 * Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
 * Licensed under the MIT license.
 */
var es6 = require("es6-collections");


[
  "Accelerometer",
  "Board",
  "Button",
  "Compass",
  "Distance",
  "Fn",
  "Gripper",
  "Gyroscope",
  "IR",
  "LCD",
  "Led",
  "LedControl",
  "Joystick",
  "Motor",
  "Nodebot",
  "Ping",
  "Pir",
  "Pin",
  // "PWMServo",
  "Repl",
  "Sensor",
  "Servo",
  "ShiftRegister",
  "Sonar",
  "Stepper",
  "Switch",
  "Wii"
].forEach(function( constructor ) {
  module.exports[ constructor ] = require(
    "../lib/" + constructor.toLowerCase()
  );
});


// Customized constructors
//
module.exports.Magnetometer = function() {
  return new module.exports.Compass({
    device: "HMC5883L",
    freq: 100,
    gauss: 1.3
  });
};

module.exports.IR.Distance = function( opts ) {
  return new module.exports.Distance(opts);
};

module.exports.IR.Proximity = function( model ) {
  return new module.exports.IR({
    device: model || "GP2Y0D805Z0F",
    freq: 50
  });
};

module.exports.IR.Reflect = function( model ) {
  return new module.exports.IR({
    device: model || "QRE1113GR",
    freq: 50
  });
};

module.exports.IR.Motion = function( opt ) {
  return new module.exports.Pir(
    typeof opt === "number" ? opt : (
      opt.pin === undefined ? 7 : opt.pin
    )
  );
};


// Short-handing, Aliases
module.exports.Boards = module.exports.Board.Array;
module.exports.Servos = module.exports.Servo.Array;
module.exports.Leds = module.exports.Led.Array;


// Back Compat
module.exports.Nunchuk = module.exports.Wii.Nunchuk;
