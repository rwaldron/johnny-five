var five = require("../lib/johnny-five.js"),
    board, led;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  led = new five.Led({
    pin: 13
  });

  board.repl.inject({
    led: led
  });

  led.strobe( 100 );
});
