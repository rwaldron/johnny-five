var five = require("../lib/johnny-five.js");

five.Board().on("ready", function() {

  var ledPin = process.argv[2] || 0;
  var led = new five.Led({
    address: 0x40,
    pin: ledPin,
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

});
