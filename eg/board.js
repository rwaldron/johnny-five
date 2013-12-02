var five = require("../lib/johnny-five.js");

// The board's pins will not be accessible until
// the board has reported that it is ready
five.Board().on("ready", function() {
  var val = 0;

  // Set pin 13 to OUTPUT mode
  this.pinMode(13, 1);

  // Create a loop to "flash/blink/strobe" an led
  this.loop(100, function() {
    this.digitalWrite(13, (val = val ? 0 : 1));
  });
});


// Schematic
// http://arduino.cc/en/uploads/Tutorial/ExampleCircuit_bb.png
