var five = require("../lib/johnny-five.js"),
    board, led;

board = new five.Board();

board.on("ready", function() {

  // Create a standard `led` hardware instance
  led = new five.Led(9);

  // pinMode is set to OUTPUT by default

  // Inject the `led` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    led: led
  });

  // "fade" to the value, 0-255, in the given time.
  // Defaults to 1000ms
  // pinMode will be changed to PWM automatically
  //
  // led.fade( 255, 3000 );


  led.fadeIn();


  // Toggle the led after 10 seconds (shown in ms)
  this.wait( 5000, function() {

    led.fadeOut();

  });
});
