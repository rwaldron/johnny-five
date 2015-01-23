var five = require("../lib/johnny-five.js");
var board = new five.Board();

// The board's pins will not be accessible until
// the board has reported that it is ready
board.on("ready", function() {
  // Set pin 13 to OUTPUT mode
  this.pinMode(13, this.MODES.OUTPUT);

  // Create a loop to "flash/blink/strobe" an led
  this.loop(500, function() {
    // Whatever the last value was, write the opposite
    this.digitalWrite(13, this.pins[13].value ? 0 : 1);
  });
});
