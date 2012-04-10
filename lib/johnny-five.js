/*
 * johnny-five
 * https://github.com/rwldrn/johnny-five
 *
 * Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
 * Licensed under the MIT license.
 */

module.exports = {
  Board:  require("../lib/board.js"),
  Repl:   require("../lib/repl.js"),
  Led:    require("../lib/led.js"),
  Button: require("../lib/button.js")

  // TODO: Port these frum duino/development to Johnny Five
  // Piezo:  require("./lib/piezo"),
  // Button: require("./lib/button"),
  // Servo:  require("./lib/servo"),
  // Sensor: require("./lib/sensor"),
  // Ping:   require("./lib/ping"),
  // PIR:    require("./lib/pir"),
  // GPS:    require("./lib/gps")
};
