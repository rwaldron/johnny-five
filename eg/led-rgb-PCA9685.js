var five = require("../lib/johnny-five.js");


five.Board().on("ready", function() {

  // Initialize the RGB LED
  var led = new five.Led.RGB({
    pins: [0, 1, 2],
    address: 0x40,
    controller: "PCA9685"
  });

  // RGB LED alternate constructor
  // This will normalize an array of pins in [r, g, b]
  // order to an object (like above) that's shaped like:
  // {
  //   red: r,
  //   green: g,
  //   blue: b
  // }
  //var led = new five.Led.RGB([3,5,6]);

  // Add led to REPL (optional)
  this.repl.inject({
    led: led
  });

});
