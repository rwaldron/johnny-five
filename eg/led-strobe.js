var five = require("../lib/johnny-five.js"),
    board, led;

board = five.Board();

board.on("ready", function() {

  // Create a standard `led` hardware instance
  led = five.Led({
    pin: 13
  });

  // "strobe" the led in 100ms on-off phases
  led.strobe( 100 );
});
