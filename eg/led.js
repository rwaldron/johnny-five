var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var led = new five.Led(13);

  // This will grant access to the led instance
  // from within the REPL that's created when
  // running this program.
  this.repl.inject({
    led: led
  });

  led.blink();
});

// @markdown
// This script will make `led` available in the REPL, by default on pin 13.
// Now you can try, e.g.:
//
// ```js
// >> led.stop() // to stop blinking
// // then
// >> led.off()  // to shut it off (stop doesn't mean "off")
// // then
// >> led.on()   // to turn on, but not blink
// ```
//
// @markdown
