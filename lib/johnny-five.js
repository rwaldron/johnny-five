/*
 * johnny-five
 * https://github.com/rwldrn/johnny-five
 *
 * Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
 * Licensed under the MIT license.
 */

module.exports = {
  Board:    require("../lib/board.js"),
  Button:   require("../lib/button.js"),
  Led:      require("../lib/led.js"),
  Joystick: require("../lib/joystick.js"),
  Motor:    require("../lib/motor.js"),
  Ping:     require("../lib/ping.js"),
  Pir:      require("../lib/pir.js"),
  Repl:     require("../lib/repl.js"),
  Sensor:   require("../lib/sensor.js"),
  Servo:    require("../lib/servo.js")


  // TODO: Port these frum duino/development to Johnny Five
  // Piezo:  require("./lib/piezo"),
  // Ping:   require("./lib/ping"),
  // GPS:    require("./lib/gps")
};
