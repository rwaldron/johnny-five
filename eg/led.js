var five = require("../lib/johnny-five.js");

five.Board().on("ready", function() {

  // Defaults to built-in LED on pin 13
  var led = new five.Led(process.argv[2] || 13);

  this.repl.inject({
    led: led
  });

  led.blink();

});

// @markdown
// You can use REPL to experiment with `Led` methods.
// For example, led.on() and led.off().
// To make use of `Led` methods like `fade`, `pulse`, `animate`, etc
// you'll need to wire an LED to a PWM pin.
// If you use a different pin, make sure to run the script with the correct pin number:
//
// `node eg/led.js [pinNumber]`
// @markdown
