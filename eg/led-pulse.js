var five = require("../lib/johnny-five.js"),
  board, led;

board = new five.Board();

board.on("ready", function() {

  // Create a standard `led` hardware instance
  led = new five.Led({
    // Use PWM pin 9 for fading example
    pin: 9
  });

  // pinMode is set to OUTPUT by default

  // Inject the `led` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    led: led
  });

  // "pulse" the led in a looping interval
  // Interval defaults to 1000ms
  // pinMode is will be changed to PWM automatically
  led.pulse();


  // Turn off the led pulse loop after 10 seconds (shown in ms)
  this.wait(10000, function() {

    led.stop().off();

  });
});
