var five = require("../lib/johnny-five.js"),
  board = new five.Board();

board.on("ready", function() {
  var led = new five.Led({
    pin: 3,
    isAnode: true
  });

  led.blink();
});
