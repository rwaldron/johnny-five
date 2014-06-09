var five = require("../lib/johnny-five.js");

five.Board().on("ready", function() {
  var array = new five.Led.Array([3, 5, 6]);

  this.repl.inject({
    array: array
  });

  array.pulse();
});

// @markdown
//
// Control multiple LEDs at once by creating an Led.Array.
// All must be on PWM pins if you want to use methods such
// as pulse() or fade()
//
// @markdown
