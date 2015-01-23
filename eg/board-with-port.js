var five = require("../lib/johnny-five.js");

// Johnny-Five will try its hardest to detect the port for you,
// however you may also explicitly specify the port by passing
// it as an optional property to the Board constructor:
var board = new five.Board({
  port: "/dev/cu.usbmodem1411"
});

// The board's pins will not be accessible until
// the board has reported that it is ready
board.on("ready", function() {
  this.pinMode(13, this.MODES.OUTPUT);

  this.loop(500, function() {
    // Whatever the last value was, write the opposite
    this.digitalWrite(13, this.pins[13].value ? 0 : 1);
  });
});
