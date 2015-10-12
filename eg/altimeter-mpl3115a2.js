var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var barometer = new five.Altimeter({
    controller: "MPL3115A2",
    // change altitudeOffset with whatever is reported
    // on http://www.whatismyelevation.com/.
    // `12` is the elevation (meters) for where I live in Brooklyn
    altitudeOffset: 12,
  });

  barometer.on("data", function() {
    console.log("Altitude");
    console.log("  feet   : ", this.feet);
    console.log("  meters : ", this.meters);
    console.log("--------------------------------------");
  });
});

// @markdown
// - [MPL3115A2 - I2C Barometric Pressure/Altimiter/Temperature Sensor](https://www.adafruit.com/products/1893)
// @markdown
