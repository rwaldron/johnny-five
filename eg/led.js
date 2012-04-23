var five = require("../lib/johnny-five.js"),
    board, led;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  // Create a standard `led` hardware instance
  led = new five.Led({
    pin: 13
  });

  // Inject the `pir` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    led: led
  });

  // "strobe" the led in 100ms on-off phases
  led.strobe( 100 );
});
