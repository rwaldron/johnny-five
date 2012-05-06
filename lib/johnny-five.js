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
  "Fn",
  "Led",
  "Joystick",
  "Motor",
  "Piezo",
  "Pir",
  "Repl",
  "Sensor",
  "Servo",
  "Sonar"

  // TODO:
  // Switch
  // Ping
  // GPS

  // Dummy.
].forEach(function( constructor ) {
  var filepath = "../lib/" + constructor.toLowerCase();

  if ( constructor ) {
    module.exports[ constructor ] = require( filepath );
  }
});

// Short-handing, Aliases
module.exports.Servos = module.exports.Servo.Array;
module.exports.Leds = module.exports.Led.Array;
