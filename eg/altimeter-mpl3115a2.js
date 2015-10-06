var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var barometer = new five.Altimeter({
    controller: "MPL3115A2"
  });

  barometer.on("data", function() {
    console.log("Altitude");
    console.log("  feet   : ", this.feet);
    console.log("  meters : ", this.meters);
    console.log("--------------------------------------");
  });
});

// @markdown
// - [MPLe115A2 - I2C Barometric Pressure/Altimiter/Temperature Sensor](https://www.adafruit.com/products/1893)
// @markdown
