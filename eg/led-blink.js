var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  // Create a standard `led` component instance
  var led = new five.Led(13);

  // "blink" the led in 500ms on-off phase periods
  led.blink(500);
});
