var five = require("../lib/johnny-five.js"),
    board, red, green, blue, leds;

board = new five.Board();

board.on("ready", function() {

  red = new five.Led(9);
  green = new five.Led(10);
  blue = new five.Led(11);

  leds = new five.Leds();


  // leds.pulse( 5000 );
  leds.pulse( 5000 );
});
