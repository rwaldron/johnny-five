/*
 * johnny-five
 * https://github.com/rwldrn/johnny-five
 *
 * Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
 * Licensed under the MIT license.
 */

[
  "Accelerometer",
  "Board",
  "Button",
  "Compass",
  "Fn",
  "IR",
  "Led",
  "Joystick",
  "Motor",
  "Ping",
  "Pir",
  "Repl",
  "Sensor",
  "Servo",
  "Sonar"

  // TODO:
  // Switch
  // GPS

].forEach(function( constructor ) {
  var filepath = "../lib/" + constructor.toLowerCase();

  if ( constructor ) {
    module.exports[ constructor ] = require( filepath );
  }
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

module.exports.IR.Osepp = function() {
  return new module.exports.IR({
    device: "GP2Y0D805Z0F",
    freq: 50
  });
};

// module.exports.IR.Analog = function( pin ) {
//   return new module.exports.Pir({
//     freq: 50,
//     pin: pin || 7
//   });
// };


// Short-handing, Aliases
module.exports.Servos = module.exports.Servo.Array;
module.exports.Leds = module.exports.Led.Array;
