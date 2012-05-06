var five = require("../lib/johnny-five.js"),
    board, red, green, blue, leds;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  red = five.Led(9);
  green = five.Led(10);
  blue = five.Led(11);

  leds = five.Leds();


  // leds.pulse( 5000 );
  leds.pulse( 5000 );
});
