var five = require("../lib/johnny-five.js");
var pcDuino = require("pcduino-io");
var board = new five.Board({
  io: new pcDuino()
});

board.on("ready", function() {
  var led = new five.Led(13);
  led.blink();
});

// @markdown
//
// In order to use the pcduino-io library, you will need to install node.js (0.10.x or better)
// and npm on your pcduino. Once the environment is created, install Johnny-Five and pcDuino-IO.
//
// [Setup environment](https://github.com/rwaldron/pcduino-io#install-a-compatible-version-of-nodenpm)
//
// ```sh
// npm install johnny-five pcduino-io
// ```
//
//
// @markdown
