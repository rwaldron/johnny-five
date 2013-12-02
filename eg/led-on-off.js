var five = require("../lib/johnny-five.js"),
  board, led;

board = new five.Board();

board.on("ready", function() {

  // Create a standard `led` hardware instance
  led = new five.Led({
    pin: 13
  });

  // "on" turns the led _on_
  led.on();

  // "off" turns the led _off_
  led.off();

  // Turn the led back on after 3 seconds (shown in ms)
  this.wait(3000, function() {

    led.on();

  });
});
