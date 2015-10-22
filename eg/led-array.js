var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var array = new five.Leds([3, 5, 6]);

  array.pulse();
});

// @markdown
//
// Control multiple LEDs at once by creating an LED collection (`Leds`).
// All must be on PWM pins if you want to use methods such
// as `pulse()` or `fade()`
//
// @markdown
