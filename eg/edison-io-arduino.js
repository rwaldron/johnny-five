var five = require("../lib/johnny-five.js");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {
  var led = new five.Led(13);
  led.blink();
});

// @markdown
//
// In order to use the Edison-IO library, you will need to flash the Intel IoTDevKit Image
// on your Edison. Once the environment is created, install Johnny-Five and Edison-IO.
//
// ```sh
// npm install johnny-five edison-io
// ```
//
//
// @markdown
