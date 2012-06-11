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
module.exports.Magnetometer = function(gauss) {
  return new module.exports.Compass({
    device: "HMC5883L",
    freq: 1000,
    gauss: gauss || 1.3
  });
};


// Short-handing, Aliases
module.exports.Servos = module.exports.Servo.Array;
module.exports.Leds = module.exports.Led.Array;
