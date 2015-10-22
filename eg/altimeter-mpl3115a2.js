var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var altitude = new five.Altimeter({
    controller: "MPL3115A2",
    // Change `elevation` with whatever is reported
    // on http://www.whatismyelevation.com/.
    // `12` is the elevation (meters) for where I live in Brooklyn
    elevation: 12,
  });

  altitude.on("data", function() {
    console.log("Altitude");
    console.log("  feet   : ", this.feet);
    console.log("  meters : ", this.meters);
    console.log("--------------------------------------");
  });
});

// @markdown
// - [MPL3115A2 - I2C Barometric Pressure/Altimiter/Temperature Sensor](https://www.adafruit.com/products/1893)
// - [SparkFun Altitude/Pressure Sensor Breakout - MPL3115A2](https://www.sparkfun.com/products/11084)
// - [SparkFun Weather Shield](https://www.sparkfun.com/products/12081)
// - [SparkFun Photon Weather Shield](https://www.sparkfun.com/products/13630)
// @markdown
