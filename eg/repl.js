var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  console.log("Ready event. Repl instance auto-initialized!");

  var led = new five.Led(13);

  this.repl.inject({
    // Allow limited on/off control access to the
    // Led instance from the REPL.
    on: function() {
      led.on();
    },
    off: function() {
      led.off();
    }
  });
});


// @markdown
// This script will make `on()` and `off()` functions
// available in the REPL:
//
// ```js
// >> on()  // will turn on the LED
// // or
// >> off() // will turn off the LED
// ```
//
// @markdown
