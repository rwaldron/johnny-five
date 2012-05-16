var five = require("../lib/johnny-five.js"),
    board, fsr, led;

board = new five.Board();

board.on("ready", function() {

  // Create a new `fsr` hardware instance.
  fsr = new five.Sensor({
    pin: "A0",
    freq: 25
  });

  led = new five.Led(9);

  board.repl.inject({
    led: led
  });


  fsr.scale([ 0, 255 ]).on("read", function() {
    // set the led's brightness based on force
    // applied to force sensitive resistor
    //
    //

    led.brightness( this.value );
  });
});
