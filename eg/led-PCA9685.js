var five = require("../lib/johnny-five.js");

five.Board().on("ready", function() {
  var led = new five.Led({
    pin: process.argv[2] || 0,
    address: 0x40,
    controller: "PCA9685"
  });

  // address: The address of the shield.
  //    Defaults to 0x40
  // pin: The pin the LED is connected to
  //    Defaults to 0
  // controller: The type of controller being used.
  //   Defaults to "standard".

  // Add LED to REPL (optional)
  this.repl.inject({
    led: led
  });

  led.pulse();
});
